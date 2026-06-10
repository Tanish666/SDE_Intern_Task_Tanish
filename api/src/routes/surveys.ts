import { type Context, Hono } from "hono"
import { requireAuth } from "../auth"
import { mapQuestion, mapSurvey, newId, now, type QuestionRow, type SurveyRow } from "../db"
import type { AppEnv } from "../env"
import type { ResponseRow, SurveyWithQuestions } from "../types"
import { isValidColor, normalizeQuestions } from "../validate"

const app = new Hono<AppEnv>()

app.use("*", requireAuth)

// Ensures the survey exists and belongs to the caller. Returns the row or null.
async function ownedSurvey(c: Context<AppEnv>, id: string): Promise<SurveyRow | null> {
  const row = await c.env.DB.prepare("SELECT * FROM surveys WHERE id = ? AND user_id = ?")
    .bind(id, c.get("userId"))
    .first<SurveyRow>()
  return row ?? null
}

// List the caller's surveys with response counts.
app.get("/", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT s.*, (SELECT COUNT(*) FROM responses r WHERE r.survey_id = s.id) AS response_count
     FROM surveys s WHERE s.user_id = ? ORDER BY s.updated_at DESC`,
  )
    .bind(c.get("userId"))
    .all<SurveyRow & { response_count: number }>()
  return c.json({ surveys: results.map((r) => mapSurvey(r, r.response_count)) })
})

// Create a blank survey.
app.post("/", async (c) => {
  const body = (await c.req.json().catch(() => null)) as { title?: unknown } | null
  const title =
    typeof body?.title === "string" && body.title.trim() ? body.title.trim() : "Untitled survey"
  const id = newId()
  const ts = now()
  await c.env.DB.prepare(
    `INSERT INTO surveys (id, user_id, title, description, primary_color, logo_url, status, created_at, updated_at)
     VALUES (?, ?, ?, NULL, '#4f46e5', NULL, 'draft', ?, ?)`,
  )
    .bind(id, c.get("userId"), title, ts, ts)
    .run()
  const row = await ownedSurvey(c, id)
  return c.json({ survey: row ? mapSurvey(row) : null }, 201)
})

// Full survey with ordered questions.
app.get("/:id", async (c) => {
  const row = await ownedSurvey(c, c.req.param("id"))
  if (!row) return c.json({ error: "Survey not found" }, 404)
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM questions WHERE survey_id = ? ORDER BY position ASC",
  )
    .bind(row.id)
    .all<QuestionRow>()
  const survey: SurveyWithQuestions = {
    ...mapSurvey(row),
    questions: results.map(mapQuestion),
  }
  return c.json({ survey })
})

// Update survey metadata + branding + publish status.
app.patch("/:id", async (c) => {
  const row = await ownedSurvey(c, c.req.param("id"))
  if (!row) return c.json({ error: "Survey not found" }, 404)
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>

  const updates: string[] = []
  const values: (string | number | null)[] = []

  if (typeof body.title === "string") {
    const title = body.title.trim()
    if (!title) return c.json({ error: "Title cannot be empty" }, 400)
    updates.push("title = ?")
    values.push(title)
  }
  if ("description" in body) {
    const d = typeof body.description === "string" ? body.description.trim() : ""
    updates.push("description = ?")
    values.push(d || null)
  }
  if ("primaryColor" in body) {
    if (!isValidColor(body.primaryColor)) {
      return c.json({ error: "primaryColor must be a hex color like #4f46e5" }, 400)
    }
    updates.push("primary_color = ?")
    values.push(body.primaryColor)
  }
  if ("logoUrl" in body) {
    const url = typeof body.logoUrl === "string" ? body.logoUrl.trim() : ""
    updates.push("logo_url = ?")
    values.push(url || null)
  }
  if ("status" in body) {
    const status = body.status === "published" ? "published" : "draft"
    updates.push("status = ?")
    values.push(status)
  }

  if (updates.length === 0) return c.json({ error: "Nothing to update" }, 400)
  updates.push("updated_at = ?")
  values.push(now())

  await c.env.DB.prepare(`UPDATE surveys SET ${updates.join(", ")} WHERE id = ?`)
    .bind(...values, row.id)
    .run()

  const updated = await ownedSurvey(c, row.id)
  return c.json({ survey: updated ? mapSurvey(updated) : null })
})

app.delete("/:id", async (c) => {
  const row = await ownedSurvey(c, c.req.param("id"))
  if (!row) return c.json({ error: "Survey not found" }, 404)
  // Explicit cascade so we don't depend on PRAGMA foreign_keys state.
  await c.env.DB.batch([
    c.env.DB.prepare(
      "DELETE FROM answers WHERE response_id IN (SELECT id FROM responses WHERE survey_id = ?)",
    ).bind(row.id),
    c.env.DB.prepare("DELETE FROM responses WHERE survey_id = ?").bind(row.id),
    c.env.DB.prepare("DELETE FROM questions WHERE survey_id = ?").bind(row.id),
    c.env.DB.prepare("DELETE FROM surveys WHERE id = ?").bind(row.id),
  ])
  return c.json({ ok: true })
})

// Replace the question set. The client sends the full ordered list; we diff by
// id so existing questions (and their answers) survive add / remove / reorder.
app.put("/:id/questions", async (c) => {
  const row = await ownedSurvey(c, c.req.param("id"))
  if (!row) return c.json({ error: "Survey not found" }, 404)

  const body = (await c.req.json().catch(() => null)) as { questions?: unknown } | null
  const incoming = body?.questions
  const normalized = normalizeQuestions(incoming)
  if ("error" in normalized) return c.json({ error: normalized.error }, 400)

  // Pair each normalized question with the optional id the client sent.
  const rawList = Array.isArray(incoming) ? incoming : []
  const existing = await c.env.DB.prepare("SELECT id FROM questions WHERE survey_id = ?")
    .bind(row.id)
    .all<{ id: string }>()
  const existingIds = new Set(existing.results.map((r) => r.id))
  const keptIds = new Set<string>()

  const statements = []
  for (let i = 0; i < normalized.length; i++) {
    const q = normalized[i]
    if (!q) continue
    const rawId = (rawList[i] as { id?: unknown } | undefined)?.id
    const id = typeof rawId === "string" && existingIds.has(rawId) ? rawId : null

    if (id) {
      keptIds.add(id)
      statements.push(
        c.env.DB.prepare(
          `UPDATE questions SET type = ?, label = ?, description = ?, required = ?, position = ?, options = ?, config = ?
           WHERE id = ? AND survey_id = ?`,
        ).bind(
          q.type,
          q.label,
          q.description,
          q.required ? 1 : 0,
          i,
          JSON.stringify(q.options),
          JSON.stringify(q.config),
          id,
          row.id,
        ),
      )
    } else {
      statements.push(
        c.env.DB.prepare(
          `INSERT INTO questions (id, survey_id, type, label, description, required, position, options, config)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ).bind(
          newId(),
          row.id,
          q.type,
          q.label,
          q.description,
          q.required ? 1 : 0,
          i,
          JSON.stringify(q.options),
          JSON.stringify(q.config),
        ),
      )
    }
  }

  // Delete questions the client dropped (their answers cascade in this batch).
  const toDelete = [...existingIds].filter((qid) => !keptIds.has(qid))
  for (const qid of toDelete) {
    statements.push(c.env.DB.prepare("DELETE FROM answers WHERE question_id = ?").bind(qid))
    statements.push(c.env.DB.prepare("DELETE FROM questions WHERE id = ?").bind(qid))
  }

  statements.push(
    c.env.DB.prepare("UPDATE surveys SET updated_at = ? WHERE id = ?").bind(now(), row.id),
  )

  if (statements.length > 0) await c.env.DB.batch(statements)

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM questions WHERE survey_id = ? ORDER BY position ASC",
  )
    .bind(row.id)
    .all<QuestionRow>()
  return c.json({ questions: results.map(mapQuestion) })
})

// Responses for the owner's dashboard.
app.get("/:id/responses", async (c) => {
  const row = await ownedSurvey(c, c.req.param("id"))
  if (!row) return c.json({ error: "Survey not found" }, 404)

  const responses = await c.env.DB.prepare(
    "SELECT id, created_at FROM responses WHERE survey_id = ? ORDER BY created_at DESC",
  )
    .bind(row.id)
    .all<{ id: string; created_at: number }>()

  const answers = await c.env.DB.prepare(
    `SELECT a.response_id, a.question_id, a.value
     FROM answers a JOIN responses r ON r.id = a.response_id
     WHERE r.survey_id = ?`,
  )
    .bind(row.id)
    .all<{ response_id: string; question_id: string; value: string }>()

  const byResponse = new Map<string, ResponseRow>()
  for (const r of responses.results) {
    byResponse.set(r.id, { id: r.id, createdAt: r.created_at, answers: {} })
  }
  for (const a of answers.results) {
    const target = byResponse.get(a.response_id)
    if (!target) continue
    try {
      target.answers[a.question_id] = JSON.parse(a.value)
    } catch {
      target.answers[a.question_id] = a.value
    }
  }

  return c.json({
    responses: responses.results.map((r) => byResponse.get(r.id)),
    count: responses.results.length,
  })
})

export default app
