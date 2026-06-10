import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { QUESTION_TYPE_META, type QuestionDraft } from "../lib/types"
import { Button, TextInput } from "./ui"

interface Props {
  draft: QuestionDraft
  index: number
  onChange: (next: QuestionDraft) => void
  onRemove: () => void
}

export function QuestionEditor({ draft, index, onChange, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: draft.id,
  })
  const meta = QUESTION_TYPE_META.find((m) => m.type === draft.type)

  function patch(part: Partial<QuestionDraft>) {
    onChange({ ...draft, ...part })
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-xl border bg-slate-900 p-4 shadow-sm ${
        isDragging ? "border-brand-500 opacity-80 shadow-lg" : "border-slate-800"
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          className="cursor-grab touch-none rounded px-1 text-slate-500 hover:text-slate-300 active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
        <span className="text-xs font-semibold text-slate-400">Q{index + 1}</span>
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300">
          {meta?.icon} {meta?.label}
        </span>
        <div className="ml-auto flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-400">
            <input
              type="checkbox"
              checked={draft.required}
              onChange={(e) => patch({ required: e.target.checked })}
              className="accent-brand-500"
            />
            Required
          </label>
          <Button variant="danger" className="px-2 py-1" onClick={onRemove}>
            Remove
          </Button>
        </div>
      </div>

      <TextInput
        placeholder="Question label"
        value={draft.label}
        onChange={(e) => patch({ label: e.target.value })}
        className="mb-2 font-medium"
      />
      <TextInput
        placeholder="Help text (optional)"
        value={draft.description}
        onChange={(e) => patch({ description: e.target.value })}
        className="mb-2 text-sm"
      />

      {draft.type === "multiple_choice" && (
        <OptionsEditor options={draft.options} onChange={(options) => patch({ options })} />
      )}

      {draft.type === "rating" && (
        <label className="mt-1 flex items-center gap-2 text-sm text-slate-300">
          Scale: 1 to
          <select
            value={draft.config.maxRating ?? 5}
            onChange={(e) => patch({ config: { maxRating: Number(e.target.value) } })}
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-100"
          >
            {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  )
}

function OptionsEditor({
  options,
  onChange,
}: {
  options: string[]
  onChange: (options: string[]) => void
}) {
  return (
    <div className="mt-1 space-y-2">
      {options.map((opt, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: options are positional and freely editable
        <div key={i} className="flex items-center gap-2">
          <span className="text-slate-600">◯</span>
          <TextInput
            value={opt}
            placeholder={`Option ${i + 1}`}
            onChange={(e) => {
              const next = [...options]
              next[i] = e.target.value
              onChange(next)
            }}
          />
          <Button
            variant="ghost"
            className="px-2 py-1 text-slate-400"
            onClick={() => onChange(options.filter((_, idx) => idx !== i))}
            disabled={options.length <= 1}
            aria-label="Remove option"
          >
            ✕
          </Button>
        </div>
      ))}
      <Button variant="secondary" className="text-xs" onClick={() => onChange([...options, ""])}>
        + Add option
      </Button>
    </div>
  )
}
