import type {
  AnswerValue,
  PublicSurvey,
  Question,
  ResponseRow,
  Survey,
  SurveyWithQuestions,
  User,
} from "./types"

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    ...init,
  })
  const text = await res.text()
  const data = text ? JSON.parse(text) : {}
  if (!res.ok) {
    throw new ApiError(data?.error ?? `Request failed (${res.status})`, res.status)
  }
  return data as T
}

// Question payload shape the builder sends to the server.
export interface QuestionPayload {
  id?: string
  type: Question["type"]
  label: string
  description: string | null
  required: boolean
  options: string[]
  config: { maxRating?: number }
}

export const api = {
  // --- auth ---
  me: () => request<{ user: User | null }>("/auth/me"),
  login: (email: string) =>
    request<{ user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  logout: () => request<{ ok: true }>("/auth/logout", { method: "POST" }),

  // --- owner surveys ---
  listSurveys: () => request<{ surveys: Survey[] }>("/surveys"),
  createSurvey: (title?: string) =>
    request<{ survey: Survey }>("/surveys", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),
  getSurvey: (id: string) => request<{ survey: SurveyWithQuestions }>(`/surveys/${id}`),
  updateSurvey: (id: string, patch: Partial<Omit<Survey, "id">>) =>
    request<{ survey: Survey }>(`/surveys/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  deleteSurvey: (id: string) => request<{ ok: true }>(`/surveys/${id}`, { method: "DELETE" }),
  saveQuestions: (id: string, questions: QuestionPayload[]) =>
    request<{ questions: Question[] }>(`/surveys/${id}/questions`, {
      method: "PUT",
      body: JSON.stringify({ questions }),
    }),
  getResponses: (id: string) =>
    request<{ responses: ResponseRow[]; count: number }>(`/surveys/${id}/responses`),

  // --- public ---
  getPublicSurvey: (id: string) => request<{ survey: PublicSurvey }>(`/public/surveys/${id}`),
  submitResponse: (id: string, answers: Record<string, AnswerValue>) =>
    request<{ ok: true }>(`/public/surveys/${id}/responses`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),
}
