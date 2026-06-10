import { Hono } from "hono"
import { mapQuestion, newId, now, type QuestionRow, type SurveyRow } from "../db"
import type { AppEnv } from "../env"
import type { PublicSurvey } from "../types"
import { type AnswerValue, validateAnswer } from "../validate"

const app = new Hono<AppEnv>()

// Public survey for respondents. Only published surveys are visible, and we
// never leak owner/status details beyond what's needed to render the form.
app.get("/surveys/:id", async (c) => {
  const id = c.req.param("id")
  const row = await c.env.DB.prepare("SELECT * FROM surveys WHERE id = ? AND status = 'published'")
    .bind(id)
    .first<SurveyRow>()
  if (!row) return c.json({ error: "This survey is not available" }, 404)

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM questions WHERE survey_id = ? ORDER BY position ASC",
  )
    .bind(id)
    .all<QuestionRow>()

  const survey: PublicSurvey = {
    id: row.id,
    title: row.title,
    description: row.description,
    primaryColor: row.primary_color,
    logoUrl: row.logo_url,
    questions: results.map(mapQuestion),
  }
  return c.json({ survey })
})

// Anonymous response submission.
app.post("/surveys/:id/responses", async (c) => {
  const id = c.req.param("id")
  const survey = await c.env.DB.prepare(
    "SELECT id FROM surveys WHERE id = ? AND status = 'published'",
  )
    .bind(id)
    .first<{ id: string }>()
  if (!survey) return c.json({ error: "This survey is not available" }, 404)

  const body = (await c.req.json().catch(() => null)) as { answers?: unknown } | null
  const submitted =
    body?.answers && typeof body.answers === "object"
      ? (body.answers as Record<string, AnswerValue>)
      : {}

  const { results: questions } = await c.env.DB.prepare(
    "SELECT * FROM questions WHERE survey_id = ? ORDER BY position ASC",
  )
    .bind(id)
    .all<QuestionRow>()

  // Validate every answer against its question (required + type + bounds).
  const validated: { questionId: string; value: AnswerValue }[] = []
  for (const qRow of questions) {
    const question = mapQuestion(qRow)
    const result = validateAnswer(question, submitted[question.id])
    if ("error" in result) return c.json({ error: result.error }, 400)
    if (result.value !== null) {
      validated.push({ questionId: question.id, value: result.value })
    }
  }

  const responseId = newId()
  const statements = [
    c.env.DB.prepare("INSERT INTO responses (id, survey_id, created_at) VALUES (?, ?, ?)").bind(
      responseId,
      id,
      now(),
    ),
    ...validated.map((a) =>
      c.env.DB.prepare(
        "INSERT INTO answers (id, response_id, question_id, value) VALUES (?, ?, ?, ?)",
      ).bind(newId(), responseId, a.questionId, JSON.stringify(a.value)),
    ),
  ]
  await c.env.DB.batch(statements)

  return c.json({ ok: true }, 201)
})

export default app
