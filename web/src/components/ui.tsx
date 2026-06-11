import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react"

type Variant = "primary" | "secondary" | "ghost" | "danger"

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50",
  secondary: "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700",
  ghost: "bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200",
  danger: "bg-transparent text-red-400 border border-red-900/60 hover:bg-red-950/40",
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function TextInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 ${className}`}
      {...props}
    />
  )
}

export function TextArea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 ${className}`}
      {...props}
    />
  )
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <span className="mb-1 block text-xs font-semibold tracking-wide text-slate-400">
      {children}
    </span>
  )
}

export function Card({
  className = "",
  style,
  children,
}: {
  className?: string
  style?: React.CSSProperties
  children: ReactNode
}) {
  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-900 shadow-sm ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-400">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-brand-500" />
      {label}
    </div>
  )
}

export function ErrorText({ children }: { children: ReactNode }) {
  return children ? <p className="text-sm text-red-400">{children}</p> : null
}

export function Badge({
  children,
  tone = "slate",
}: {
  children: ReactNode
  tone?: "slate" | "green"
}) {
  const tones = {
    slate: "bg-slate-800 text-slate-300",
    green: "bg-brand-500/15 text-brand-300",
  }
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}
