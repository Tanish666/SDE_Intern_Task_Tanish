import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useParams } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { NavBar } from "../components/NavBar"
import { QuestionEditor } from "../components/QuestionEditor"
import { SurveyRenderer } from "../components/SurveyRenderer"
import {
  Badge,
  Button,
  Card,
  ErrorText,
  Label,
  Spinner,
  TextArea,
  TextInput,
} from "../components/ui"
import { ApiError, api } from "../lib/api"
import { draftToPayload, newDraft, questionToDraft } from "../lib/draft"
import {
  type AnswerValue,
  QUESTION_TYPE_META,
  type QuestionDraft,
  type QuestionType,
  type SurveyStatus,
} from "../lib/types"
import { useRequireAuth } from "../lib/useAuth"

export function BuilderPage() {
  const { user, isLoading: authLoading } = useRequireAuth()
  const { surveyId } = useParams({ strict: false })
  const id = surveyId ?? ""
  const qc = useQueryClient()

  const surveyQuery = useQuery({
    queryKey: ["survey", id],
    queryFn: () => api.getSurvey(id),
    enabled: !!user && !!id,
  })

  // Local editable copy of the survey.
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [primaryColor, setPrimaryColor] = useState("#1D9B5E")
  const [logoUrl, setLogoUrl] = useState("")
  const [status, setStatus] = useState<SurveyStatus>("draft")
  const [drafts, setDrafts] = useState<QuestionDraft[]>([])
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, AnswerValue>>({})

  // Hydrate local state once per survey id (don't clobber edits on refetch).
  const loadedFor = useRef<string | null>(null)
  useEffect(() => {
    const s = surveyQuery.data?.survey
    if (!s || loadedFor.current === s.id) return
    loadedFor.current = s.id
    setTitle(s.title)
    setDescription(s.description ?? "")
    setPrimaryColor(s.primaryColor)
    setLogoUrl(s.logoUrl ?? "")
    setStatus(s.status)
    setDrafts(s.questions.map(questionToDraft))
    setDirty(false)
  }, [surveyQuery.data])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function markDirty() {
    setDirty(true)
    setError(null)
  }

  function updateDraft(next: QuestionDraft) {
    setDrafts((cur) => cur.map((d) => (d.id === next.id ? next : d)))
    markDirty()
  }
  function removeDraft(draftId: string) {
    setDrafts((cur) => cur.filter((d) => d.id !== draftId))
    markDirty()
  }
  function addQuestion(type: QuestionType) {
    setDrafts((cur) => [...cur, newDraft(type)])
    markDirty()
  }
  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    setDrafts((cur) => {
      const from = cur.findIndex((d) => d.id === active.id)
      const to = cur.findIndex((d) => d.id === over.id)
      return arrayMove(cur, from, to)
    })
    markDirty()
  }

  const save = useMutation({
    mutationFn: async (nextStatus?: SurveyStatus) => {
      // Client-side guard so we fail fast with a friendly message.
      for (const d of drafts) {
        if (!d.label.trim()) throw new ApiError("Every question needs a label", 400)
        if (d.type === "multiple_choice" && d.options.filter((o) => o.trim()).length === 0) {
          throw new ApiError(`"${d.label}" needs at least one option`, 400)
        }
      }
      await api.updateSurvey(id, {
        title: title.trim() || "Untitled survey",
        description,
        primaryColor,
        logoUrl,
        ...(nextStatus ? { status: nextStatus } : {}),
      })
      const result = await api.saveQuestions(id, drafts.map(draftToPayload))
      return result.questions
    },
    onSuccess: (questions, nextStatus) => {
      setDrafts(questions.map(questionToDraft))
      if (nextStatus) setStatus(nextStatus)
      setDirty(false)
      qc.invalidateQueries({ queryKey: ["surveys"] })
      qc.invalidateQueries({ queryKey: ["survey", id] })
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : "Could not save"),
  })

  if (authLoading || !user) return <Spinner />
  if (surveyQuery.isLoading) return <Spinner label="Loading survey…" />
  if (surveyQuery.isError || !surveyQuery.data?.survey) {
    return (
      <div className="min-h-full">
        <NavBar />
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <p className="text-slate-300">We couldn't find that survey.</p>
          <Link to="/dashboard" className="mt-3 inline-block text-brand-400">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  const shareUrl = `${window.location.origin}/s/${id}`
  const previewQuestions = drafts.map((d, i) => ({
    id: d.id,
    type: d.type,
    label: d.label,
    description: d.description || null,
    required: d.required,
    position: i,
    options: d.options,
    config: d.config,
  }))

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function togglePublish() {
    save.mutate(status === "published" ? "draft" : "published")
  }

  return (
    <div className="min-h-full">
      <NavBar />

      {/* Sticky action bar */}
      <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
          <Link to="/dashboard" className="text-sm text-slate-400 hover:text-slate-200">
            ← Dashboard
          </Link>
          <Badge tone={status === "published" ? "green" : "slate"}>{status}</Badge>
          {dirty && <span className="text-xs text-amber-400">Unsaved changes</span>}
          <div className="ml-auto flex items-center gap-2">
            <Link to="/surveys/$surveyId/responses" params={{ surveyId: id }}>
              <Button variant="ghost">Responses</Button>
            </Link>
            <Button
              variant="secondary"
              onClick={() => save.mutate(undefined)}
              disabled={save.isPending || !dirty}
            >
              {save.isPending ? "Saving…" : "Save"}
            </Button>
            <Button onClick={togglePublish} disabled={save.isPending}>
              {status === "published" ? "Unpublish" : "Publish"}
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_minmax(360px,420px)]">
        {/* Editor column */}
        <div className="space-y-5">
          {error && (
            <Card className="border-red-900/60 bg-red-950/40 p-3">
              <ErrorText>{error}</ErrorText>
            </Card>
          )}

          <Card className="space-y-3 p-5">
            <div>
              <Label>Survey title</Label>
              <TextInput
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  markDirty()
                }}
                placeholder="e.g. Customer satisfaction Q2"
                className="text-lg font-semibold"
              />
            </div>
            <div>
              <Label>Description</Label>
              <TextArea
                value={description}
                rows={2}
                onChange={(e) => {
                  setDescription(e.target.value)
                  markDirty()
                }}
                placeholder="A short intro shown to respondents (optional)"
              />
            </div>
          </Card>

          <BrandPanel
            primaryColor={primaryColor}
            logoUrl={logoUrl}
            shareUrl={shareUrl}
            status={status}
            copied={copied}
            onColor={(c) => {
              setPrimaryColor(c)
              markDirty()
            }}
            onLogo={(u) => {
              setLogoUrl(u)
              markDirty()
            }}
            onCopy={copyLink}
          />

          <div>
            <h2 className="mb-2 text-sm font-semibold text-slate-300">
              Questions <span className="text-slate-500">({drafts.length})</span>
            </h2>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext
                items={drafts.map((d) => d.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {drafts.map((d, i) => (
                    <QuestionEditor
                      key={d.id}
                      draft={d}
                      index={i}
                      onChange={updateDraft}
                      onRemove={() => removeDraft(d.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {drafts.length === 0 && (
              <Card className="p-6 text-center text-sm text-slate-400">
                Add your first question below.
              </Card>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {QUESTION_TYPE_META.map((m) => (
                <Button key={m.type} variant="secondary" onClick={() => addQuestion(m.type)}>
                  <span aria-hidden>{m.icon}</span> {m.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Live preview */}
        <div className="lg:sticky lg:top-16 lg:h-fit">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Live preview
          </p>
          <Card className="max-h-[80vh] overflow-y-auto p-6">
            <SurveyRenderer
              title={title}
              description={description || null}
              primaryColor={primaryColor}
              logoUrl={logoUrl || null}
              questions={previewQuestions}
              answers={previewAnswers}
              onChange={(qid, v) =>
                setPreviewAnswers((cur) => {
                  const next = { ...cur }
                  if (v === undefined) delete next[qid]
                  else next[qid] = v
                  return next
                })
              }
            />
          </Card>
          {status === "published" && (
            <p className="mt-2 text-center text-xs text-slate-400">
              Live at{" "}
              <a href={shareUrl} target="_blank" rel="noreferrer" className="text-brand-400">
                {shareUrl}
              </a>
            </p>
          )}
        </div>
      </main>
    </div>
  )
}

function BrandPanel({
  primaryColor,
  logoUrl,
  shareUrl,
  status,
  copied,
  onColor,
  onLogo,
  onCopy,
}: {
  primaryColor: string
  logoUrl: string
  shareUrl: string
  status: SurveyStatus
  copied: boolean
  onColor: (c: string) => void
  onLogo: (u: string) => void
  onCopy: () => void
}) {
  return (
    <Card className="space-y-4 p-5">
      <h2 className="text-sm font-semibold text-slate-300">Branding</h2>
      <div className="flex flex-wrap items-end gap-5">
        <div>
          <Label>Primary color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => onColor(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded border border-slate-700 bg-slate-900"
              aria-label="Primary color"
            />
            <TextInput
              value={primaryColor}
              onChange={(e) => onColor(e.target.value)}
              className="w-28 font-mono text-sm uppercase"
            />
          </div>
        </div>
        <div className="min-w-[220px] flex-1">
          <Label>Logo URL</Label>
          <TextInput
            value={logoUrl}
            onChange={(e) => onLogo(e.target.value)}
            placeholder="https://…/logo.png"
          />
        </div>
      </div>
      <div>
        <Label>Public link</Label>
        <div className="flex items-center gap-2">
          <TextInput value={shareUrl} readOnly className="font-mono text-xs text-slate-400" />
          <Button variant="secondary" onClick={onCopy}>
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
        {status !== "published" && (
          <p className="mt-1 text-xs text-amber-400">
            Publish the survey to make this link work for respondents.
          </p>
        )}
      </div>
    </Card>
  )
}
