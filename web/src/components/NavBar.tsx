import { Link, useNavigate } from "@tanstack/react-router"
import { useLogout, useMe } from "../lib/useAuth"
import { Button } from "./ui"

export function NavBar() {
  const { data } = useMe()
  const logout = useLogout()
  const navigate = useNavigate()

  return (
    <header className="border-b border-slate-800 bg-slate-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/dashboard" className="flex items-center gap-2 text-lg font-bold text-slate-100">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-500 text-sm text-white">
            F
          </span>
          Formly
        </Link>
        <div className="flex items-center gap-3 text-sm">
          {data?.user && <span className="hidden text-slate-400 sm:inline">{data.user.email}</span>}
          <Button
            variant="ghost"
            onClick={() =>
              logout.mutate(undefined, { onSuccess: () => navigate({ to: "/login" }) })
            }
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
}
