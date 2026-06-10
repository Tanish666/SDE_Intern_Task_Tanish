// Wire types shared in spirit with the web client (the web app keeps a copy in
// web/src/lib/types.ts — we intentionally don't couple the Worker build into the
// browser build; these are small and stable).

export type QuestionType = "short_text" | "long_text" | "multiple_choice" | "rating"

export const QUESTION_TYPES: QuestionType[] = [
  "short_text",
  "long_text",
  "multiple_choice",
  "rating",
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

export interface User {
  id: string
  email: string
}

// Public-facing survey (no owner/status leak beyond what a respondent needs).
export interface PublicSurvey {
  id: string
  title: string
  description: string | null
  primaryColor: string
  logoUrl: string | null
  questions: Question[]
}

export interface AnswerInput {
  questionId: string
  value: string | string[] | number
}

export interface ResponseRow {
  id: string
  createdAt: number
  answers: Record<string, string | string[] | number>
}
