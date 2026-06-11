import { Link, useNavigate } from "@tanstack/react-router"
import { type FormEvent, useEffect, useState } from "react"
import { ApiError } from "../lib/api"
import { useLogin, useMe } from "../lib/useAuth"

export function LoginPage() {
  const [email, setEmail] = useState("")
  const [greeting, setGreeting] = useState("Welcome back!")
  const login = useLogin()
  const navigate = useNavigate()
  const { data } = useMe()

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good Morning!")
    else if (hour < 17) setGreeting("Good Afternoon!")
    else setGreeting("Good Evening!")
  }, [])

  // Already signed in → skip the form.
  useEffect(() => {
    if (data?.user) navigate({ to: "/dashboard" })
  }, [data, navigate])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    login.mutate(email, { onSuccess: () => navigate({ to: "/dashboard" }) })
  }

  return (
    <div className="min-h-full w-full grid md:grid-cols-2 font-sans bg-white">
      {/* Left Column: Form and Branding */}
      <div className="flex flex-col justify-between p-8 sm:p-12 md:p-16 lg:p-24 bg-white text-slate-900">
        {/* Header Branding */}
        <div className="flex items-center justify-center">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 text-sm font-black text-white shadow-sm group-hover:bg-brand-600 transition-colors">
              F
            </span>
            <span className="text-2xl font-bold tracking-tight text-slate-900">Formly</span>
          </Link>
        </div>

        {/* Form Content */}
        <div className="w-full max-w-sm mx-auto my-auto py-10 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2.5">
              {greeting}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Please enter your email address to access your account.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1">
              <input
                type="email"
                required
                autoFocus
                placeholder="Please enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border-0 bg-slate-50 hover:bg-slate-100/70 focus:bg-white px-5 py-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all ring-1 ring-slate-200/50 focus:ring-2 focus:ring-slate-950/20 focus:shadow-sm"
              />
            </div>

            {login.error ? (
              <div className="text-xs text-red-500 font-semibold px-1">
                {login.error instanceof ApiError
                  ? login.error.message
                  : "An error occurred. Please try again."}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full rounded-full bg-black py-4 text-sm font-bold tracking-wider text-white hover:bg-slate-900 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer flex justify-center items-center"
            >
              {login.isPending ? "Signing in…" : "Login"}
            </button>

            <div className="text-center mt-4">
              <p className="text-xs text-slate-400 font-medium">
                No password needed — we'll create your account on first sign-in.
              </p>
            </div>
          </form>
        </div>

        {/* Support and Footer */}
        <div className="text-center pt-6 border-t border-slate-100/80">
          <div className="text-xs text-slate-500 font-medium">
            Write to our support team
            <a
              href="mailto:support@formly.com"
              className="block text-brand-600 hover:text-brand-700 font-bold mt-1 transition-colors"
            >
              support@formly.com
            </a>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-5">
            All rights reserved Formly © {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Right Column: Scenery and Premium Glassmorphism Card */}
      <div className="relative hidden md:block overflow-hidden bg-slate-100">
        <img
          src="login_scenery.png"
          alt="Scenic view of misty pine forest mountains"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10000ms] hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15 pointer-events-none" />

        {/* Centered Glassmorphic Box */}
        <div className="absolute inset-0 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-[340px] rounded-[28px] border border-white/20 bg-white/10 p-8 backdrop-blur-md shadow-2xl flex flex-col gap-6 text-white select-none">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold leading-tight tracking-tight text-white drop-shadow-sm">
                Formly the new gold standard for survey creation
              </h2>
              <p className="text-xs text-white/90 leading-relaxed font-medium">
                The resulting interactive builder includes updated templates, advanced logic, and
                detailed analytics for every form.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
