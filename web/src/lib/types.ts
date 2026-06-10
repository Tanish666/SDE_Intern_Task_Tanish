// Wire types — kept in sync by hand with api/src/types.ts. Small and stable;
// we don't couple the Worker build into the browser bundle.

export type QuestionType = "short_text" | "long_text" | "multiple_choice" | "rating"

export interface QuestionTypeMeta {
  type: QuestionType
  label: string
  icon: string
  hint: string
}

export const QUESTION_TYPE_META: QuestionTypeMeta[] = [
  { type: "short_text", label: "Short text", icon: "✏️", hint: "A single line answer" },
  { type: "long_text", label: "Long text", icon: "📝", hint: "A paragraph answer" },
  { type: "multiple_choice", label: "Multiple choice", icon: "◉", hint: "Pick one option" },
  { type: "rating", label: "Rating", icon: "★", hint: "A 1–N star scale" },
]

export interface Question {
  id: string
  type: QuestionType
  label: string
  description: string | null
  required: boolean
  position: number
  options: string[]
  config: { maxRating?: number }
}

export type SurveyStatus = "draft" | "published"

export interface Survey {
  id: string
  title: string
  description: string | null
  primaryColor: string
  logoUrl: string | null
  status: SurveyStatus
  createdAt: number
  updatedAt: number
  responseCount?: number
}

export interface SurveyWithQuestions extends Survey {
  questions: Question[]
}

export interface PublicSurvey {
  id: string
  title: string
  description: string | null
  primaryColor: string
  logoUrl: string | null
  questions: Question[]
}

export interface User {
  id: string
  email: string
}

export type AnswerValue = string | number

export interface ResponseRow {
  id: string
  createdAt: number
  answers: Record<string, AnswerValue>
}

// Draft shape used inside the builder before a question is persisted.
export interface QuestionDraft {
  id: string // stable client id (real id if persisted, else "new-...")
  persistedId: string | null
  type: QuestionType
  label: string
  description: string
  required: boolean
  options: string[]
  config: { maxRating?: number }
}
