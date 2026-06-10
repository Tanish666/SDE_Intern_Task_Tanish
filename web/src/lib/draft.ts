import type { QuestionPayload } from "./api"
import type { Question, QuestionDraft, QuestionType } from "./types"

export function questionToDraft(q: Question): QuestionDraft {
  return {
    id: q.id,
    persistedId: q.id,
    type: q.type,
    label: q.label,
    description: q.description ?? "",
    required: q.required,
    options: q.options,
    config: q.config,
  }
}

export function newDraft(type: QuestionType): QuestionDraft {
  return {
    id: `new-${crypto.randomUUID()}`,
    persistedId: null,
    type,
    label: "",
    description: "",
    required: false,
    options: type === "multiple_choice" ? ["Option 1"] : [],
    config: type === "rating" ? { maxRating: 5 } : {},
  }
}

export function draftToPayload(d: QuestionDraft): QuestionPayload {
  return {
    ...(d.persistedId ? { id: d.persistedId } : {}),
    type: d.type,
    label: d.label.trim(),
    description: d.description.trim() || null,
    required: d.required,
    options: d.type === "multiple_choice" ? d.options : [],
    config: d.type === "rating" ? { maxRating: d.config.maxRating ?? 5 } : {},
  }
}
