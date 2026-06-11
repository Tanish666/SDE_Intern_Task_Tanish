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

  // Match the color theme with the dashboard's Formly green brand color
  const survey = surveyQuery.data?.survey
  const themeColor = "#1d9b5e"

  // Dynamically set CSS variables based on theme color
  const themeStyle = {
    "--survey-primary": themeColor,
    "--cell-border-color": `color-mix(in srgb, ${themeColor} 8%, transparent)`,
    "--cell-fill-color": "transparent",
    "--cell-shadow-color": `color-mix(in srgb, ${themeColor} 3%, transparent)`,
  } as React.CSSProperties

  const renderContent = () => {
    if (surveyQuery.isLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <Spinner label="Loading survey..." />
        </div>
      )
    }

    if (surveyQuery.isError || !survey) {
      return (
        <Card className="p-8 text-center border border-slate-800 bg-slate-900 shadow-xl max-w-md mx-auto">
          <p className="text-5xl animate-pulse mb-3">🔍</p>
          <h1 className="text-xl font-bold text-slate-100">Survey not available</h1>
          <p className="text-sm text-slate-400 mt-2">
            This survey doesn't exist or hasn't been published yet.
          </p>
        </Card>
      )
    }

    if (submitted) {
      return (
        <Card
          className="p-8 text-center border shadow-xl max-w-md mx-auto transition-all duration-300"
          style={{
            borderColor: `color-mix(in srgb, ${themeColor} 15%, #1e293b)`,
            backgroundColor: `color-mix(in srgb, ${themeColor} 2%, #0f172a)`
          }}
        >
          <div
            className="mx-auto grid h-16 w-16 place-items-center rounded-full text-3xl text-white shadow-lg shadow-[var(--survey-primary)]/10"
            style={{ backgroundColor: themeColor }}
          >
            ✓
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-5">Thanks for your response!</h1>
          <p className="text-sm text-slate-400 mt-2">Your answers have been recorded.</p>
        </Card>
      )
    }

    return (
      <Card
        className="p-6 sm:p-8 border transition-all duration-300 shadow-xl"
        style={{
          borderColor: `color-mix(in srgb, ${themeColor} 15%, #1e293b)`,
          backgroundColor: `color-mix(in srgb, ${themeColor} 2%, #0f172a)`
        }}
      >
        <SurveyRenderer
          title={survey.title}
          description={survey.description}
          primaryColor={themeColor}
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
        <div className="mt-8 border-t border-slate-800/80 pt-5">
          <button
            type="button"
            onClick={() => submit.mutate()}
            disabled={submit.isPending}
            className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 active:brightness-95 disabled:opacity-60 shadow-lg shadow-[var(--survey-primary)]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--survey-primary)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 cursor-pointer"
            style={{ backgroundColor: themeColor }}
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
    )
  }

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-slate-950 py-12 flex flex-col justify-center items-center"
      style={themeStyle}
    >
      {/* Background radial gradient glow matching the survey's custom primary color */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-500"
        style={{
          background: `radial-gradient(circle at center, color-mix(in srgb, ${themeColor} 8%, transparent) 0%, transparent 70%)`
        }}
      />

      <BackgroundRippleEffect rows={22} cols={35} cellSize={56} />

      <div className="relative z-10 w-full max-w-xl px-4 flex-1 flex flex-col justify-center">
        {renderContent()}
        <p className="mt-6 text-center text-xs text-slate-500 font-medium tracking-wide">
          Powered by <span className="text-slate-400 font-semibold">Formly</span>
        </p>
      </div>
    </div>
  )
}
