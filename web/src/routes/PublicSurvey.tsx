import { useMutation, useQuery } from "@tanstack/react-query"
import { useParams } from "@tanstack/react-router"
import { useState } from "react"
import { SurveyRenderer } from "../components/SurveyRenderer"
import { Card, ErrorText, Spinner } from "../components/ui"
import { BackgroundRippleEffect } from "../components/ui/background-ripple-effect"
import { ApiError, api } from "../lib/api"
import type { AnswerValue } from "../lib/types"

export function PublicSurveyPage() {
  const { surveyId } = useParams({ strict: false })
  const id = surveyId ?? ""
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})
  const [submitted, setSubmitted] = useState(false)

  const surveyQuery = useQuery({
    queryKey: ["public-survey", id],
    queryFn: () => api.getPublicSurvey(id),
    enabled: !!id,
    retry: false,
  })

  const submit = useMutation({
    mutationFn: () => api.submitResponse(id, answers),
    onSuccess: () => setSubmitted(true),
  })

  if (surveyQuery.isLoading) return <Spinner />

  if (surveyQuery.isError || !surveyQuery.data?.survey) {
    return (
      <Centered>
        <p className="text-5xl">🔍</p>
        <h1 className="text-xl font-semibold text-slate-100">Survey not available</h1>
        <p className="text-sm text-slate-400">
          This survey doesn't exist or hasn't been published yet.
        </p>
      </Centered>
    )
  }

  const survey = surveyQuery.data.survey

  if (submitted) {
    return (
      <Centered>
        <div
          className="grid h-16 w-16 place-items-center rounded-full text-3xl text-white"
          style={{ backgroundColor: survey.primaryColor }}
        >
          ✓
        </div>
        <h1 className="text-xl font-semibold text-slate-100">Thanks for your response!</h1>
        <p className="text-sm text-slate-400">Your answers have been recorded.</p>
      </Centered>
    )
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-slate-950 py-10">
      <BackgroundRippleEffect />
      <div className="relative z-10 mx-auto max-w-xl px-4">
        <Card className="p-6 sm:p-8">
          <SurveyRenderer
            title={survey.title}
            description={survey.description}
            primaryColor={survey.primaryColor}
            logoUrl={survey.logoUrl}
            questions={survey.questions}
            answers={answers}
            onChange={(qid, v) =>
              setAnswers((cur) => {
                const next = { ...cur }
                if (v === undefined) delete next[qid]
                else next[qid] = v
                return next
              })
            }
          />
          <div className="mt-8 border-t border-slate-800 pt-5">
            <button
              type="button"
              onClick={() => submit.mutate()}
              disabled={submit.isPending}
              className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
              style={{ backgroundColor: survey.primaryColor }}
            >
              {submit.isPending ? "Submitting…" : "Submit response"}
            </button>
            {submit.error && (
              <div className="mt-2 text-center">
                <ErrorText>
                  {submit.error instanceof ApiError ? submit.error.message : "Submission failed"}
                </ErrorText>
              </div>
            )}
          </div>
        </Card>
        <p className="mt-4 text-center text-xs text-slate-400">Powered by Formly</p>
      </div>
    </div>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-full place-items-center px-4">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">{children}</div>
    </div>
  )
}
