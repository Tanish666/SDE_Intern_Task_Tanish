import { Hono } from "hono"
import { clearCookie, createSessionToken, currentUserId, sessionCookie } from "../auth"
import { newId, now } from "../db"
import type { AppEnv } from "../env"

const app = new Hono<AppEnv>()

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Email-only sign-in: first sign-in creates the account. No password / magic
// link to keep the demo runnable with zero email infra — see README notes.
app.post("/login", async (c) => {
  const body = (await c.req.json().catch(() => null)) as { email?: unknown } | null
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
  if (!EMAIL.test(email)) return c.json({ error: "Enter a valid email address" }, 400)

  let user = await c.env.DB.prepare("SELECT id, email FROM users WHERE email = ?")
    .bind(email)
    .first<{ id: string; email: string }>()

  if (!user) {
    const id = newId()
    await c.env.DB.prepare("INSERT INTO users (id, email, created_at) VALUES (?, ?, ?)")
      .bind(id, email, now())
      .run()
    user = { id, email }
  }

  const token = await createSessionToken(c.env.SESSION_SECRET, user.id)
  c.header("Set-Cookie", sessionCookie(c, token))
  return c.json({ user })
})

app.post("/logout", (c) => {
  c.header("Set-Cookie", clearCookie(c))
  return c.json({ ok: true })
})

app.get("/me", async (c) => {
  const uid = await currentUserId(c)
  if (!uid) return c.json({ user: null })
  const user = await c.env.DB.prepare("SELECT id, email FROM users WHERE id = ?")
    .bind(uid)
    .first<{ id: string; email: string }>()
  return c.json({ user: user ?? null })
})

export default app
