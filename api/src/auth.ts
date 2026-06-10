import type { Context, MiddlewareHandler } from "hono"
import { getCookie } from "hono/cookie"
import type { AppEnv } from "./env"

const COOKIE_NAME = "session"
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days

const encoder = new TextEncoder()

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let str = ""
  for (const b of arr) str += String.fromCharCode(b)
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function base64UrlDecode(input: string): Uint8Array {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4))
  const str = atob(input.replace(/-/g, "+").replace(/_/g, "/") + pad)
  const bytes = new Uint8Array(str.length)
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i)
  return bytes
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data))
  return base64UrlEncode(sig)
}

interface SessionPayload {
  uid: string
  exp: number
}

// Stateless signed token: base64url(payload).hmac — no session table needed.
export async function createSessionToken(secret: string, userId: string): Promise<string> {
  const payload: SessionPayload = {
    uid: userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  }
  const body = base64UrlEncode(encoder.encode(JSON.stringify(payload)))
  const sig = await hmac(secret, body)
  return `${body}.${sig}`
}

export async function verifySessionToken(secret: string, token: string): Promise<string | null> {
  const [body, sig] = token.split(".")
  if (!body || !sig) return null
  const expected = await hmac(secret, body)
  // Constant-time-ish compare (lengths are fixed for a given secret/hash).
  if (sig.length !== expected.length) return null
  let diff = 0
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i)
  if (diff !== 0) return null
  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(body))) as SessionPayload
    if (typeof payload.uid !== "string" || typeof payload.exp !== "number") return null
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload.uid
  } catch {
    return null
  }
}

export function sessionCookie(c: Context<AppEnv>, token: string): string {
  const secure = new URL(c.req.url).protocol === "https:"
  const attrs = [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ]
  if (secure) attrs.push("Secure")
  return attrs.join("; ")
}

export function clearCookie(c: Context<AppEnv>): string {
  const secure = new URL(c.req.url).protocol === "https:"
  const attrs = [`${COOKIE_NAME}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"]
  if (secure) attrs.push("Secure")
  return attrs.join("; ")
}

// Resolves the current user id from the session cookie, or null.
export async function currentUserId(c: Context<AppEnv>): Promise<string | null> {
  const token = getCookie(c, COOKIE_NAME)
  if (!token) return null
  return verifySessionToken(c.env.SESSION_SECRET, token)
}

// Gate for owner-only routes.
export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const uid = await currentUserId(c)
  if (!uid) return c.json({ error: "Not authenticated" }, 401)
  c.set("userId", uid)
  await next()
}
