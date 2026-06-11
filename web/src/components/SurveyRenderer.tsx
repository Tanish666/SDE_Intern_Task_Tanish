import type { AnswerValue, Question } from "../lib/types"

interface RendererProps {
  title: string
  description: string | null
  primaryColor: string
  logoUrl: string | null
  questions: Question[]
  answers: Record<string, AnswerValue>
  onChange: (questionId: string, value: AnswerValue | undefined) => void
  disabled?: boolean
}

// The single source of truth for how a survey looks to a respondent. Shared by
// the builder's live preview and the public response page so they never drift.
export function SurveyRenderer({
  title,
  description,
  primaryColor,
  logoUrl,
  questions,
  answers,
  onChange,
  disabled,
}: RendererProps) {
  return (
    <div
      className="mx-auto w-full max-w-xl"
      style={{ "--survey-primary": primaryColor } as React.CSSProperties}
    >
      <div className="mb-6 border-b-4 pb-4" style={{ borderColor: primaryColor }}>
        {logoUrl && (
          <img
            src={logoUrl}
            alt="Survey logo"
            className="mb-4 h-12 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none"
            }}
          />
        )}
        <h1 className="text-2xl font-bold text-slate-100">{title || "Untitled survey"}</h1>
        {description && <p className="mt-1 whitespace-pre-wrap text-slate-300">{description}</p>}
      </div>

      <div className="space-y-6">
        {questions.length === 0 && <p className="text-sm text-slate-400">No questions yet.</p>}
        {questions.map((q, i) => (
          <QuestionField
            key={q.id}
            index={i}
            question={q}
            value={answers[q.id]}
            onChange={(v) => onChange(q.id, v)}
            primaryColor={primaryColor}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  )
}

function QuestionField({
  index,
  question,
  value,
  onChange,
  primaryColor,
  disabled,
}: {
  index: number
  question: Question
  value: AnswerValue | undefined
  onChange: (value: AnswerValue | undefined) => void
  primaryColor: string
  disabled?: boolean
}) {
  return (
    <div>
      {/* A question prompt can drive several controls (e.g. a rating row), so
          it's a prompt element rather than a single-input <label>. */}
      <p className="mb-2 block font-medium text-slate-200">
        <span className="mr-1 text-slate-500">{index + 1}.</span>
        {question.label || <span className="italic text-slate-500">Untitled question</span>}
        {question.required && <span className="ml-1 text-red-400">*</span>}
      </p>
      {question.description && (
        <p className="mb-2 text-sm text-slate-400">{question.description}</p>
      )}

      {question.type === "short_text" && (
        <input
          type="text"
          disabled={disabled}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-[var(--survey-primary)] focus:ring-2 focus:ring-[var(--survey-primary)]/20"
          placeholder="Your answer"
        />
      )}

      {question.type === "long_text" && (
        <textarea
          disabled={disabled}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-[var(--survey-primary)] focus:ring-2 focus:ring-[var(--survey-primary)]/20"
          placeholder="Your answer"
        />
      )}

      {question.type === "multiple_choice" && (
        <div className="space-y-2">
          {question.options.map((opt) => {
            const selected = value === opt
            return (
              <button
                key={opt}
                type="button"
                disabled={disabled}
                onClick={() => onChange(selected ? undefined : opt)}
                className="flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm text-slate-200 transition"
                style={{
                  borderColor: selected ? primaryColor : "#334155",
                  backgroundColor: selected ? `${primaryColor}26` : "transparent",
                }}
              >
                <span
                  className="grid h-4 w-4 place-items-center rounded-full border-2"
                  style={{ borderColor: selected ? primaryColor : "#475569" }}
                >
                  {selected && (
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                  )}
                </span>
                {opt}
              </button>
            )
          })}
        </div>
      )}

      {question.type === "rating" && (
        <div className="flex gap-2">
          {Array.from({ length: question.config.maxRating ?? 5 }, (_, i) => i + 1).map((n) => {
            const active = typeof value === "number" && value >= n
            return (
              <button
                key={n}
                type="button"
                disabled={disabled}
                onClick={() => onChange(value === n ? undefined : n)}
                className="text-3xl leading-none transition"
                style={{ color: active ? primaryColor : "#475569" }}
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
              >
                ★
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
