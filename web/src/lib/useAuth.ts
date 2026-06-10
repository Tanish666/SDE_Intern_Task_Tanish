import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { api } from "./api"

export function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: api.me, staleTime: 60_000 })
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (email: string) => api.login(email),
    onSuccess: (data) => qc.setQueryData(["me"], { user: data.user }),
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.logout(),
    onSuccess: () => {
      qc.setQueryData(["me"], { user: null })
      qc.clear()
    },
  })
}

// Redirects to /login once we know the visitor is signed out.
export function useRequireAuth() {
  const { data, isLoading } = useMe()
  const navigate = useNavigate()
  useEffect(() => {
    if (!isLoading && !data?.user) navigate({ to: "/login" })
  }, [isLoading, data, navigate])
  return { user: data?.user ?? null, isLoading }
}
