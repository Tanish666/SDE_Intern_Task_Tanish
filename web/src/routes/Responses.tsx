import { useQuery } from "@tanstack/react-query"
import { Link, useParams } from "@tanstack/react-router"
import { NavBar } from "../components/NavBar"
import { Badge, Button, Card, Spinner } from "../components/ui"
import { api } from "../lib/api"
import type { Question, ResponseRow } from "../lib/types"
import { useRequireAuth } from "../lib/useAuth"

export function ResponsesPage() {
  const { user, isLoading: authLoading } = useRequireAuth()
  const { surveyId } = useParams({ strict: false })
  const id = surveyId ?? ""

  const surveyQuery = useQuery({
    queryKey: ["survey", id],
    queryFn: () => api.getSurvey(id),
    enabled: !!user && !!id,
  })
  const responsesQuery = useQuery({
    queryKey: ["responses", id],
    queryFn: () => api.getResponses(id),
    enabled: !!user && !!id,
  })

  if (authLoading || !user) return <Spinner />
  if (surveyQuery.isLoading || responsesQuery.isLoading)
    return <Spinner label="Loading responses…" />

  const survey = surveyQuery.data?.survey
  const responses = responsesQuery.data?.responses ?? []
  if (!survey) {
    return (
      <div className="min-h-full">
        <NavBar />
        <p className="px-4 py-16 text-center text-slate-400">Survey not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-full">
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              to="/surveys/$surveyId"
              params={{ surveyId: id }}
              className="text-sm text-slate-400 hover:text-slate-200"
            >
              ← Back to editor
            </Link>
            <h1 className="mt-1 text-2xl font-bold text-slate-100">{survey.title}</h1>
            <p className="text-sm text-slate-400">
              {responses.length} response{responses.length === 1 ? "" : "s"}
            </p>
          </div>
          <Button
            variant="secondary"
            disabled={responses.length === 0}
            onClick={() => downloadCsv(survey.title, survey.questions, responses)}
          >
            ⬇ Export CSV
          </Button>
        </div>

        {responses.length === 0 ? (
          <Card className="grid place-items-center gap-2 py-16 text-center">
            <p className="text-4xl">📭</p>
            <p className="font-medium text-slate-200">No responses yet</p>
            <p className="text-sm text-slate-400">
              {survey.status === "published"
                ? "Share your link to start collecting answers."
                : "Publish the survey first, then share its link."}
            </p>
          </Card>
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                Summary
              </h2>
              <div className="grid gap-3">
                {survey.questions.map((q) => (
                  <QuestionSummary key={q.id} question={q} responses={responses} />
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                Individual responses
              </h2>
              <div className="space-y-3">
                {responses.map((r, i) => (
                  <Card key={r.id} className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-200">
                        Response #{responses.length - i}
                      </span>
                      <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span>
                    </div>
                    <dl className="grid gap-2 sm:grid-cols-2">
                      {survey.questions.map((q) => (
                        <div key={q.id} className="rounded-lg bg-slate-800/50 px-3 py-2">
                          <dt className="text-xs text-slate-400">{q.label}</dt>
                          <dd className="text-sm text-slate-200">
                            {renderAnswer(q, r.answers[q.id])}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

function QuestionSummary({
  question,
  responses,
}: {
  question: Question
  responses: ResponseRow[]
}) {
  const values = responses.map((r) => r.answers[question.id]).filter((v) => v !== undefined)
  const answered = values.length

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-medium text-slate-200">{question.label}</p>
        <Badge>
          {answered}/{responses.length} answered
        </Badge>
      </div>

      {question.type === "rating" && <RatingSummary question={question} values={values} />}

      {question.type === "multiple_choice" && (
        <div className="space-y-1.5">
          {question.options.map((opt) => {
            const count = values.filter((v) => v === opt).length
            const pct = answered ? Math.round((count / answered) * 100) : 0
            return (
              <div key={opt} className="text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>{opt}</span>
                  <span className="text-slate-400">
                    {count} · {pct}%
                  </span>
                </div>
                <div className="mt-0.5 h-2 rounded-full bg-slate-800">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: "#1D9B5E" }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {(question.type === "short_text" || question.type === "long_text") && (
        <ul className="max-h-40 space-y-1 overflow-y-auto text-sm text-slate-300">
          {answered === 0 && <li className="text-slate-400">No answers yet.</li>}
          {values.slice(0, 50).map((v, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: free-text answers have no stable id
            <li key={i} className="rounded bg-slate-800/50 px-2 py-1">
              “{String(v)}”
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function RatingSummary({ question, values }: { question: Question; values: (string | number)[] }) {
  const nums = values.map(Number).filter((n) => !Number.isNaN(n))
  const avg = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0
  const max = question.config.maxRating ?? 5
  return (
    <div className="flex items-center gap-4">
      <div className="text-2xl font-bold text-slate-100">
        {avg.toFixed(1)}
        <span className="text-sm font-normal text-slate-400"> / {max}</span>
      </div>
      <div className="flex-1 text-sm text-slate-400">
        Average across {nums.length} rating{nums.length === 1 ? "" : "s"}
      </div>
    </div>
  )
}

function renderAnswer(question: Question, value: string | number | undefined) {
  if (value === undefined || value === "") return <span className="text-slate-600">—</span>
  if (question.type === "rating") return `${value} / ${question.config.maxRating ?? 5} ★`
  return String(value)
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString()
}

function downloadCsv(title: string, questions: Question[], responses: ResponseRow[]) {
  const csvEscape = (v: string) => `"${v.replace(/"/g, '""')}"`
  const header = ["Submitted at", ...questions.map((q) => q.label)].map(csvEscape).join(",")
  const rows = responses.map((r) => {
    const cells = [
      formatDate(r.createdAt),
      ...questions.map((q) => {
        const v = r.answers[q.id]
        return v === undefined ? "" : String(v)
      }),
    ]
    return cells.map(csvEscape).join(",")
  })
  const csv = [header, ...rows].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-responses.csv`
  a.click()
  URL.revokeObjectURL(url)
}
