import type { Question, QuestionType, Survey } from "./types"

export function newId(): string {
  return crypto.randomUUID()
}

export function now(): number {
  return Date.now()
}

export interface SurveyRow {
  id: string
  user_id: string
  title: string
  description: string | null
  primary_color: string
  logo_url: string | null
  status: string
  created_at: number
  updated_at: number
}

export interface QuestionRow {
  id: string
  survey_id: string
  type: string
  label: string
  description: string | null
  required: number
  position: number
  options: string
  config: string
}

export function mapSurvey(row: SurveyRow, responseCount?: number): Survey {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    primaryColor: row.primary_color,
    logoUrl: row.logo_url,
    status: row.status === "published" ? "published" : "draft",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...(responseCount !== undefined ? { responseCount } : {}),
  }
}

export function mapQuestion(row: QuestionRow): Question {
  let options: string[] = []
  let config: { maxRating?: number } = {}
  try {
    options = JSON.parse(row.options)
  } catch {
    options = []
  }
  try {
    config = JSON.parse(row.config)
  } catch {
    config = {}
  }
  return {
    id: row.id,
    type: row.type as QuestionType,
    label: row.label,
    description: row.description,
    required: row.required === 1,
    position: row.position,
    options: Array.isArray(options) ? options : [],
    config: config ?? {},
  }
}
