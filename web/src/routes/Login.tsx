import { useNavigate } from "@tanstack/react-router"
import { type FormEvent, useEffect, useState } from "react"
import { Button, Card, ErrorText, Label, TextInput } from "../components/ui"
import { ApiError } from "../lib/api"
import { useLogin, useMe } from "../lib/useAuth"

export function LoginPage() {
  const [email, setEmail] = useState("")
  const login = useLogin()
  const navigate = useNavigate()
  const { data } = useMe()

  // Already signed in → skip the form.
  useEffect(() => {
    if (data?.user) navigate({ to: "/dashboard" })
  }, [data, navigate])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    login.mutate(email, { onSuccess: () => navigate({ to: "/dashboard" }) })
  }

  return (
    <div className="grid min-h-full place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-brand-500 text-xl font-bold text-white">
            F
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Formly</h1>
          <p className="mt-1 text-sm text-slate-400">
            Build beautiful, on-brand surveys in minutes.
          </p>
        </div>
        <Card className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <TextInput
                type="email"
                required
                autoFocus
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? "Signing in…" : "Continue"}
            </Button>
            <ErrorText>{login.error instanceof ApiError ? login.error.message : null}</ErrorText>
            <p className="text-center text-xs text-slate-500">
              No password needed — we'll create your account on first sign-in.
            </p>
          </form>
        </Card>
      </div>
    </div>
  )
}
