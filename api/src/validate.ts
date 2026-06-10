import { QUESTION_TYPES, type Question, type QuestionType } from "./types"

export interface QuestionInput {
  type: QuestionType
  label: string
  description?: string | null
  required?: boolean
  options?: string[]
  config?: { maxRating?: number }
}

export interface NormalizedQuestion {
  type: QuestionType
  label: string
  description: string | null
  required: boolean
  options: string[]
  config: { maxRating?: number }
}

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

export function isValidColor(value: unknown): value is string {
  return typeof value === "string" && HEX_COLOR.test(value)
}

// Validate + normalize a single question coming from the builder.
export function normalizeQuestion(input: unknown): NormalizedQuestion | { error: string } {
  if (typeof input !== "object" || input === null) return { error: "Question must be an object" }
  const q = input as Record<string, unknown>

  if (!QUESTION_TYPES.includes(q.type as QuestionType)) {
    return { error: `Invalid question type: ${String(q.type)}` }
  }
  const type = q.type as QuestionType

  const label = typeof q.label === "string" ? q.label.trim() : ""
  if (!label) return { error: "Every question needs a label" }
  if (label.length > 500) return { error: "Question label is too long" }

  const description =
    typeof q.description === "string" && q.description.trim() ? q.description.trim() : null
  const required = q.required === true

  let options: string[] = []
  if (type === "multiple_choice") {
    const raw = Array.isArray(q.options) ? q.options : []
    options = raw
      .filter((o): o is string => typeof o === "string")
      .map((o) => o.trim())
      .filter(Boolean)
    if (options.length < 1) return { error: "Multiple choice needs at least one option" }
    if (options.length > 50) return { error: "Too many options" }
  }

  let config: { maxRating?: number } = {}
  if (type === "rating") {
    const rawMax = (q.config as { maxRating?: unknown } | undefined)?.maxRating
    const maxRating = typeof rawMax === "number" ? Math.round(rawMax) : 5
    if (maxRating < 2 || maxRating > 10) return { error: "Rating scale must be between 2 and 10" }
    config = { maxRating }
  }

  return { type, label, description, required, options, config }
}

export function normalizeQuestions(input: unknown): NormalizedQuestion[] | { error: string } {
  if (!Array.isArray(input)) return { error: "questions must be an array" }
  const out: NormalizedQuestion[] = []
  for (const item of input) {
    const result = normalizeQuestion(item)
    if ("error" in result) return result
    out.push(result)
  }
  return out
}

export type AnswerValue = string | string[] | number

// Validate a submitted answer against its question. Returns normalized value or error.
export function validateAnswer(
  question: Question,
  raw: AnswerValue | undefined,
): { value: AnswerValue | null } | { error: string } {
  const isEmpty =
    raw === undefined ||
    raw === null ||
    (typeof raw === "string" && raw.trim() === "") ||
    (Array.isArray(raw) && raw.length === 0)

  if (isEmpty) {
    if (question.required) return { error: `"${question.label}" is required` }
    return { value: null }
  }

  switch (question.type) {
    case "short_text":
    case "long_text": {
      if (typeof raw !== "string") return { error: `"${question.label}" must be text` }
      const max = question.type === "short_text" ? 1000 : 10000
      if (raw.length > max) return { error: `"${question.label}" is too long` }
      return { value: raw }
    }
    case "multiple_choice": {
      if (typeof raw !== "string") return { error: `"${question.label}" expects one choice` }
      if (!question.options.includes(raw)) {
        return { error: `"${raw}" is not a valid option for "${question.label}"` }
      }
      return { value: raw }
    }
    case "rating": {
      const n = typeof raw === "number" ? raw : Number(raw)
      const max = question.config.maxRating ?? 5
      if (!Number.isInteger(n) || n < 1 || n > max) {
        return { error: `"${question.label}" must be a rating from 1 to ${max}` }
      }
      return { value: n }
    }
    default:
      return { error: "Unknown question type" }
  }
}
