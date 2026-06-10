import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import { useState, useMemo } from "react"
import { Button, Card, Spinner } from "../components/ui"
import { api } from "../lib/api"
import type { Survey } from "../lib/types"
import { useRequireAuth, useLogout } from "../lib/useAuth"

// Custom inline SVG icons for premium visual aesthetics and zero dependencies
function IconDashboard({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
    </svg>
  )
}

function IconResponses({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  )
}

function IconAnalytics({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
    </svg>
  )
}

function IconTemplates({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  )
}

function IconSettings({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function IconLogout({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
}

function IconSearch({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

function IconPlus({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}

function IconEdit({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}

function IconTrash({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

function IconMenu({ className = "h-6 w-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function IconX({ className = "h-6 w-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

// Simulated dynamic activity notifications
interface Activity {
  id: string
  user: string
  action: string
  target: string
  time: string
  avatar: string
  color: string
}

const SAMPLE_ACTIVITIES: Activity[] = [
  { id: "1", user: "Zakir Horizontal", action: "submitted response on", target: "Feedback Form", time: "2m ago", avatar: "ZH", color: "bg-indigo-500" },
  { id: "2", user: "Bagas Mahple", action: "published survey", target: "Product NPS Study", time: "1h ago", avatar: "BM", color: "bg-emerald-500" },
  { id: "3", user: "Leonardo Samsul", action: "created template", target: "Employee Survey", time: "4h ago", avatar: "LS", color: "bg-purple-500" },
  { id: "4", user: "Jhon Tosan", action: "joined survey workspace", target: "Main Team", time: "1d ago", avatar: "JT", color: "bg-amber-500" }
]

// Mock template dataset
interface SurveyTemplate {
  id: string
  title: string
  description: string
  primaryColor: string
  icon: string
  category: string
}

const TEMPLATES: SurveyTemplate[] = [
  { id: "t1", title: "Customer Satisfaction Survey", description: "Collect customer delight ratings and feedback on your services.", primaryColor: "#1d9b5e", icon: "⭐", category: "Feedback" },
  { id: "t2", title: "Product NPS Study", description: "Evaluate user loyalty and understand recommendation rates.", primaryColor: "#6366f1", icon: "📈", category: "NPS" },
  { id: "t3", title: "Employee Engagement Form", description: "Check in on your team's motivation, workplace satisfaction, and suggestions.", primaryColor: "#a855f7", icon: "🤝", category: "HR" },
  { id: "t4", title: "Event Registration Questionnaire", description: "Log RSVP lists, dietary restrictions, and interest preferences.", primaryColor: "#ec4899", icon: "🎉", category: "Events" },
  { id: "t5", title: "Website Usability Audit", description: "Understand direct bugs, layout feedback, and desktop experience issues.", primaryColor: "#06b6d4", icon: "💻", category: "UX" },
  { id: "t6", title: "Market Research Questionnaire", description: "Gather insights on buyer demographics, purchase habits, and preferences.", primaryColor: "#f59e0b", icon: "🔍", category: "Marketing" }
]

export function DashboardPage() {
  const { user, isLoading: authLoading } = useRequireAuth()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const logout = useLogout()

  const [activeTab, setActiveTab] = useState<string>("dashboard")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false)
  const [settingsSaved, setSettingsSaved] = useState<boolean>(false)

  // Settings state — persisted to localStorage so edits survive reloads
  const [profileName, setProfileName] = useState(
    () => localStorage.getItem("formly:profileName") || "Jason Ranti",
  )
  const [workspaceName, setWorkspaceName] = useState(
    () => localStorage.getItem("formly:workspaceName") || "Formly Workspace",
  )
  const [emailNotifications, setEmailNotifications] = useState(
    () => localStorage.getItem("formly:emailNotifications") !== "false",
  )

  const surveysQuery = useQuery({
    queryKey: ["surveys"],
    queryFn: api.listSurveys,
    enabled: !!user,
  })

  const createSurvey = useMutation({
    mutationFn: (title?: string) => api.createSurvey(title),
    onSuccess: (data) =>
      navigate({ to: "/surveys/$surveyId", params: { surveyId: data.survey.id } }),
  })

  const deleteSurvey = useMutation({
    mutationFn: (id: string) => api.deleteSurvey(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["surveys"] }),
  })

  // Filter surveys matching search bar query
  const surveys = surveysQuery.data?.surveys ?? []
  const filteredSurveys = useMemo(() => {
    return surveys.filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [surveys, searchQuery])

  // Aggregate Metrics
  const totalResponses = useMemo(() => {
    return surveys.reduce((acc, s) => acc + (s.responseCount ?? 0), 0)
  }, [surveys])

  const publishedCount = useMemo(() => {
    return surveys.filter((s) => s.status === "published").length
  }, [surveys])

  // Average responses completion rate (using mock or actual metrics)
  const avgCompletionRate = useMemo(() => {
    if (surveys.length === 0) return 0
    return Math.min(Math.round((publishedCount / surveys.length) * 100), 100)
  }, [surveys, publishedCount])

  if (authLoading || !user) return <Spinner />

  const userInitial = user.email.charAt(0).toUpperCase()

  const handleSignOut = () => {
    if (confirm("Are you sure you want to sign out?")) {
      logout.mutate(undefined, { onSuccess: () => navigate({ to: "/login" }) })
    }
  }

  // Sidebar Layout Navigation Link Renderer
  const renderSidebarLinks = () => {
    const links = [
      { id: "dashboard", label: "Dashboard", icon: <IconDashboard /> },
      { id: "analytics", label: "Analytics", icon: <IconAnalytics /> },
      { id: "templates", label: "Templates", icon: <IconTemplates /> }
    ]

    return (
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-3 mb-2">Overview</p>
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => {
              setActiveTab(link.id)
              setMobileSidebarOpen(false)
            }}
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === link.id
                ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            {link.icon}
            {link.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* ==================== LEFT SIDEBAR (DESKTOP) ==================== */}
      <aside className="w-64 border-r border-slate-900 bg-slate-900/10 backdrop-blur-md flex-col justify-between hidden md:flex shrink-0">
        <div>
          {/* Logo Header */}
          <div className="p-6 border-b border-slate-900/60 flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-sm font-bold text-white shadow-lg shadow-brand-500/20">
              F
            </span>
            <div>
              <h1 className="font-extrabold text-md tracking-tight text-white flex items-center gap-1.5">
                Formly
                <span className="text-[9px] bg-brand-500/20 text-brand-400 px-1.5 py-0.5 rounded-full font-semibold">
                  PRO
                </span>
              </h1>
              <p className="text-[10px] text-slate-500">Survey Analytics Suite</p>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-6">
            {/* Overview Links */}
            {renderSidebarLinks()}

            {/* Collaborators / Team Block */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-3">
                <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Teammates</p>
                <button 
                  onClick={() => alert("Add collaborator feature is under development!")}
                  className="text-slate-500 hover:text-brand-400 p-0.5"
                  title="Invite Teammate"
                >
                  <IconPlus className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex flex-col gap-1.5 px-1">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-900/40 group transition">
                  <div className="relative">
                    <span className="h-7 w-7 rounded-full bg-indigo-950 text-indigo-300 font-bold text-[10px] flex items-center justify-center border border-indigo-800">BM</span>
                    <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 border border-slate-950" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-300 truncate group-hover:text-slate-100">Bagas Mahple</p>
                    <p className="text-[10px] text-slate-500 truncate">Admin</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-900/40 group transition">
                  <div className="relative">
                    <span className="h-7 w-7 rounded-full bg-amber-950 text-amber-300 font-bold text-[10px] flex items-center justify-center border border-amber-800">SD</span>
                    <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-amber-500 border border-slate-950" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-300 truncate group-hover:text-slate-100">Sir Dandy</p>
                    <p className="text-[10px] text-slate-500 truncate">Mentor</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-900/40 group transition">
                  <div className="relative">
                    <span className="h-7 w-7 rounded-full bg-purple-950 text-purple-300 font-bold text-[10px] flex items-center justify-center border border-purple-800">JT</span>
                    <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-slate-500 border border-slate-950" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-300 truncate group-hover:text-slate-100">Jhon Tosan</p>
                    <p className="text-[10px] text-slate-500 truncate">Collaborator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings / Sign-out Bottom block */}
        <div className="p-4 border-t border-slate-900/60 flex flex-col gap-1">
          <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-3 mb-1">Preferences</p>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === "settings"
                ? "bg-slate-800 text-slate-100"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <IconSettings />
            Settings
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-950/20 hover:text-red-300 rounded-lg transition-all"
          >
            <IconLogout />
            Sign out
          </button>
        </div>
      </aside>

      {/* ==================== MOBILE HEADER & SIDEBAR ==================== */}
      <header className="flex md:hidden items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-900 w-full shrink-0">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-500 text-xs font-bold text-white">
            F
          </span>
          <span className="font-bold text-md text-white tracking-tight">Formly</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-900"
          >
            {mobileSidebarOpen ? <IconX /> : <IconMenu />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-950/90 backdrop-blur-sm">
          <div className="w-72 bg-slate-950 border-r border-slate-900 p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-900">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-500 text-sm font-bold text-white">
                    F
                  </span>
                  <span className="font-extrabold text-md text-white tracking-tight">Formly</span>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-900"
                >
                  <IconX />
                </button>
              </div>

              <div className="py-6 flex flex-col gap-6">
                {renderSidebarLinks()}

                {/* Team Section */}
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-3">Teammates</p>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/40">
                      <span className="h-6 w-6 rounded-full bg-indigo-950 text-indigo-300 font-bold text-[9px] flex items-center justify-center border border-indigo-850">BM</span>
                      <span className="text-xs text-slate-300">Bagas Mahple (Admin)</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/40">
                      <span className="h-6 w-6 rounded-full bg-amber-950 text-amber-300 font-bold text-[9px] flex items-center justify-center border border-amber-850">SD</span>
                      <span className="text-xs text-slate-300">Sir Dandy (Mentor)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-900 pt-6 flex flex-col gap-1">
              <button
                onClick={() => {
                  setActiveTab("settings")
                  setMobileSidebarOpen(false)
                }}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-slate-200 rounded-lg"
              >
                <IconSettings />
                Settings
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-950/20 hover:text-red-300 rounded-lg"
              >
                <IconLogout />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MAIN CONTENT AREA ==================== */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950/40">
        {/* Desktop Navbar Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-slate-900/50 bg-slate-950/20 backdrop-blur-sm">
          {/* Search bar */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/40 border border-slate-800/80 rounded-lg w-80 text-sm focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/10 transition-all">
            <IconSearch className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search surveys by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 w-full text-xs font-normal"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-slate-500 hover:text-slate-300 text-xs font-bold px-1"
              >
                ×
              </button>
            )}
          </div>

          {/* Right Header items */}
          <div className="flex items-center gap-6 text-sm">
            {/* User Profile display */}
            <div className="flex items-center gap-3 border-l border-slate-900 pl-6">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow shadow-indigo-950">
                {userInitial}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-semibold text-slate-200">{profileName}</p>
                <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{user.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* ==================== VIEW SWITCHING SYSTEM ==================== */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-[1450px] mx-auto w-full">
              {/* Left Column: Welcome, Stats & Surveys Grid (Col-Span 2) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Gradient Welcome Banner */}
                <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-750 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-950/20 group">
                  {/* Subtle Vector Background Graphics */}
                  <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none transition group-hover:scale-110 duration-700">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <polygon points="50,0 100,0 100,100" fill="white" />
                      <circle cx="80" cy="50" r="30" fill="white" />
                    </svg>
                  </div>

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <p className="text-xs font-extrabold tracking-widest text-indigo-200 uppercase mb-1">ONLINE FEEDBACK</p>
                      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-2">
                        Welcome back, {profileName.split(" ")[0]} 👋
                      </h2>
                      <p className="text-xs md:text-sm text-indigo-100 max-w-md leading-relaxed">
                        Gather feedback and analyze responses with Formly's interactive suite. Paint it in your brand color and start collecting data.
                      </p>
                    </div>
                    <Button
                      onClick={() => createSurvey.mutate(undefined)}
                      disabled={createSurvey.isPending}
                      className="bg-white text-indigo-950 hover:bg-slate-100 px-6 py-2.5 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-950/30 transition transform hover:-translate-y-0.5 shrink-0"
                    >
                      <IconPlus className="h-4 w-4 stroke-[3]" />
                      New Survey
                    </Button>
                  </div>
                </div>

                {/* Primary Stats row */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4 bg-slate-900/30 border-slate-900 flex flex-col gap-1 justify-center relative overflow-hidden group hover:border-slate-800 transition">
                    <div className="absolute right-3 top-3 opacity-10 text-slate-400 group-hover:opacity-20 transition">
                      <IconDashboard className="h-8 w-8" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Surveys</p>
                    <p className="text-2xl font-extrabold text-white tracking-tight">{surveys.length}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span className="text-emerald-400">✓</span> {publishedCount} published
                    </p>
                  </Card>

                  <Card className="p-4 bg-slate-900/30 border-slate-900 flex flex-col gap-1 justify-center relative overflow-hidden group hover:border-slate-800 transition">
                    <div className="absolute right-3 top-3 opacity-10 text-slate-400 group-hover:opacity-20 transition">
                      <IconResponses className="h-8 w-8" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Responses</p>
                    <p className="text-2xl font-extrabold text-white tracking-tight">{totalResponses}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span className="text-indigo-400">⚡</span> Live activity
                    </p>
                  </Card>

                  <Card className="p-4 bg-slate-900/30 border-slate-900 flex flex-col gap-1 justify-center relative overflow-hidden group hover:border-slate-800 transition">
                    <div className="absolute right-3 top-3 opacity-10 text-slate-400 group-hover:opacity-20 transition">
                      <IconAnalytics className="h-8 w-8" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Ratio</p>
                    <p className="text-2xl font-extrabold text-white tracking-tight">{avgCompletionRate}%</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span className="text-violet-400">●</span> Launch rate target
                    </p>
                  </Card>
                </div>

                {/* Surveys Grid Area */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <div>
                      <h3 className="font-bold text-md text-slate-100 flex items-center gap-2">
                        Your surveys
                        {searchQuery && (
                          <span className="text-xs font-normal text-slate-500">
                            (Filtered {filteredSurveys.length} of {surveys.length})
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-500">Create, customize, and share questionnaires.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveTab("templates")}
                        className="text-xs text-brand-400 hover:text-brand-300 font-semibold px-2 py-1 bg-brand-500/10 rounded-lg hover:bg-brand-500/20 transition"
                      >
                        Browse Templates
                      </button>
                    </div>
                  </div>

                  {/* Mobile Search input overlay (redundant for mobile users) */}
                  <div className="flex md:hidden items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-slate-800 rounded-lg w-full text-sm">
                    <IconSearch className="h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search surveys..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent border-none outline-none text-slate-200 w-full text-xs"
                    />
                  </div>

                  {/* Surveys Listing loading or display */}
                  {surveysQuery.isLoading ? (
                    <Spinner label="Fetching your surveys..." />
                  ) : filteredSurveys.length === 0 ? (
                    <Card className="grid place-items-center gap-4 py-16 px-6 text-center border-slate-900 bg-slate-900/10">
                      <p className="text-4xl">📋</p>
                      <h4 className="font-semibold text-slate-200">
                        {searchQuery ? "No matching surveys" : "No surveys created yet"}
                      </h4>
                      <p className="max-w-md text-xs text-slate-400 leading-relaxed">
                        {searchQuery
                          ? "Try checking your spelling or searching for another term in the header bar."
                          : "Launch your first interactive survey. Build questions, colorize matching your branding, and share instantly."}
                      </p>
                      <Button
                        onClick={() => createSurvey.mutate(undefined)}
                        className="bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg text-xs"
                      >
                        Create your first survey
                      </Button>
                    </Card>
                  ) : (
                    <div className="grid gap-3">
                      {filteredSurveys.map((s) => (
                        <SurveyCardRow
                          key={s.id}
                          survey={s}
                          onDelete={() => deleteSurvey.mutate(s.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Statistics & Activities Panel (Col-Span 1) */}
              <div className="space-y-6">
                {/* Radial Target & Activity Graph Card */}
                <Card className="p-5 bg-slate-900/30 border-slate-900 space-y-6">
                  {/* Circle Chart Header */}
                  <div>
                    <h3 className="font-bold text-sm text-slate-200">Overall Target Statistics</h3>
                    <p className="text-[10px] text-slate-500">Track responses and progress towards targets</p>
                  </div>

                  {/* Circular target element */}
                  <div className="flex flex-col items-center justify-center py-4 bg-slate-900/10 rounded-xl border border-slate-900/40">
                    <div className="relative flex items-center justify-center">
                      {/* SVG circular progress ring */}
                      <svg className="w-28 h-28 transform -rotate-90">
                        <circle
                          cx="56"
                          cy="56"
                          r="44"
                          className="text-slate-850 stroke-current"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="56"
                          cy="56"
                          r="44"
                          className="text-indigo-500 stroke-current transition-all duration-500 ease-out"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={276}
                          strokeDashoffset={276 - (276 * Math.min(avgCompletionRate, 100)) / 100}
                        />
                      </svg>
                      {/* Inner avatar initials */}
                      <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className="text-xl font-black text-white">{avgCompletionRate}%</span>
                        <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Target</span>
                      </div>
                    </div>
                    <div className="mt-3 text-center px-4">
                      <p className="text-xs font-semibold text-slate-300">Target Level reached</p>
                      <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                        Your completion rate is calculated based on active versus draft surveys.
                      </p>
                    </div>
                  </div>

                  {/* SVG Bar Chart for Feedback frequency */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-300">Daily responses volume</p>
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">Weekly</span>
                    </div>

                    {/* Chart layout wrapper */}
                    <div className="h-32 flex items-end justify-between px-2 pt-4 bg-slate-900/20 rounded-lg border border-slate-900/60 relative">
                      {/* Grid background lines */}
                      <div className="absolute inset-x-0 top-1/4 border-t border-slate-900/60 pointer-events-none" />
                      <div className="absolute inset-x-0 top-2/4 border-t border-slate-900/60 pointer-events-none" />
                      <div className="absolute inset-x-0 top-3/4 border-t border-slate-900/60 pointer-events-none" />

                      {/* Bar 1 */}
                      <div className="flex flex-col items-center w-8 group z-10 cursor-pointer">
                        <div className="w-4.5 bg-indigo-500 rounded-t-sm h-12 transition-all group-hover:bg-brand-400 relative">
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-slate-200 text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap shadow-md border border-slate-800">12 r</span>
                        </div>
                        <span className="text-[9px] text-slate-500 mt-1.5 font-medium">Mon</span>
                      </div>
                      {/* Bar 2 */}
                      <div className="flex flex-col items-center w-8 group z-10 cursor-pointer">
                        <div className="w-4.5 bg-indigo-500 rounded-t-sm h-20 transition-all group-hover:bg-brand-400 relative">
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-slate-200 text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap shadow-md border border-slate-800">28 r</span>
                        </div>
                        <span className="text-[9px] text-slate-500 mt-1.5 font-medium">Tue</span>
                      </div>
                      {/* Bar 3 */}
                      <div className="flex flex-col items-center w-8 group z-10 cursor-pointer">
                        <div className="w-4.5 bg-indigo-500 rounded-t-sm h-14 transition-all group-hover:bg-brand-400 relative">
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-slate-200 text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap shadow-md border border-slate-800">16 r</span>
                        </div>
                        <span className="text-[9px] text-slate-500 mt-1.5 font-medium">Wed</span>
                      </div>
                      {/* Bar 4 */}
                      <div className="flex flex-col items-center w-8 group z-10 cursor-pointer">
                        <div className="w-4.5 bg-brand-500 rounded-t-sm h-28 transition-all group-hover:bg-brand-400 relative">
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-slate-200 text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap shadow-md border border-slate-800">42 r</span>
                        </div>
                        <span className="text-[9px] text-brand-400 mt-1.5 font-bold">Thu</span>
                      </div>
                      {/* Bar 5 */}
                      <div className="flex flex-col items-center w-8 group z-10 cursor-pointer">
                        <div className="w-4.5 bg-indigo-500 rounded-t-sm h-16 transition-all group-hover:bg-brand-400 relative">
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-slate-200 text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap shadow-md border border-slate-800">22 r</span>
                        </div>
                        <span className="text-[9px] text-slate-500 mt-1.5 font-medium">Fri</span>
                      </div>
                      {/* Bar 6 */}
                      <div className="flex flex-col items-center w-8 group z-10 cursor-pointer">
                        <div className="w-4.5 bg-indigo-500 rounded-t-sm h-8 transition-all group-hover:bg-brand-400 relative">
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-slate-200 text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap shadow-md border border-slate-800">8 r</span>
                        </div>
                        <span className="text-[9px] text-slate-500 mt-1.5 font-medium">Sat</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Simulated Recent Activity Feed */}
                <Card className="p-5 bg-slate-900/30 border-slate-900 space-y-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-200">Recent responses activity</h3>
                    <p className="text-[10px] text-slate-500">Live feed of survey logs across your workspace</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    {SAMPLE_ACTIVITIES.map((act) => (
                      <div key={act.id} className="flex gap-3 text-xs">
                        <span className={`h-7 w-7 rounded-full shrink-0 font-extrabold text-[9px] text-white flex items-center justify-center ${act.color}`}>
                          {act.avatar}
                        </span>
                        <div className="min-w-0 flex-1 leading-snug">
                          <p className="text-slate-300">
                            <span className="font-semibold text-slate-200">{act.user}</span> {act.action}{" "}
                            <span className="text-indigo-400 font-semibold">{act.target}</span>
                          </p>
                          <span className="text-[9px] text-slate-500">{act.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ==================== ANALYTICS VIEW TABS ==================== */}
          {activeTab === "analytics" && (
            <div className="space-y-8 max-w-[1200px] mx-auto w-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Analytics Dashboard</h2>
                  <p className="text-xs text-slate-500">Advanced analysis and responses funnel diagnostics.</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/50 p-1 border border-slate-800 rounded-lg">
                  <button className="text-xs px-3 py-1 font-semibold bg-brand-500 text-white rounded-md">Last 30 Days</button>
                  <button className="text-xs px-3 py-1 text-slate-400 hover:text-slate-200 rounded-md">All Time</button>
                </div>
              </div>

              {/* Conversion Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-slate-900/30 border-slate-900">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Views</p>
                  <p className="text-2xl font-black text-white mt-1">2,450</p>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                    <span>↑ 12.4%</span> vs last month
                  </p>
                </Card>
                <Card className="p-4 bg-slate-900/30 border-slate-900">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completion Rate</p>
                  <p className="text-2xl font-black text-white mt-1">74.2%</p>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                    <span>↑ 4.1%</span> vs last month
                  </p>
                </Card>
                <Card className="p-4 bg-slate-900/30 border-slate-900">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avg. Completion Time</p>
                  <p className="text-2xl font-black text-white mt-1">2m 15s</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                    <span>Stable</span> performance
                  </p>
                </Card>
                <Card className="p-4 bg-slate-900/30 border-slate-900">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bounce Rate</p>
                  <p className="text-2xl font-black text-white mt-1">12.8%</p>
                  <p className="text-[10px] text-rose-400 flex items-center gap-1 mt-1">
                    <span>↓ 2.3%</span> improvement
                  </p>
                </Card>
              </div>

              {/* Funnel & Channels SVG graphics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-5 bg-slate-900/30 border-slate-900 space-y-6">
                  <div>
                    <h3 className="font-bold text-sm text-slate-200">Funnel Conversion Diagnostic</h3>
                    <p className="text-[10px] text-slate-500">Track drop-off percentage from initial view to submit</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">1. Survey Opened (Views)</span>
                        <span className="font-semibold text-slate-100">2,450 (100%)</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-3">
                        <div className="bg-indigo-500 h-3 rounded-full w-full" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">2. Answered First Question (Starts)</span>
                        <span className="font-semibold text-slate-100">2,082 (85%)</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-3">
                        <div className="bg-violet-500 h-3 rounded-full w-[85%]" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">3. Form Submitted (Completions)</span>
                        <span className="font-semibold text-slate-100">1,817 (74%)</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-3">
                        <div className="bg-brand-500 h-3 rounded-full w-[74%]" />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Device and Channel metrics */}
                <Card className="p-5 bg-slate-900/30 border-slate-900 space-y-6">
                  <div>
                    <h3 className="font-bold text-sm text-slate-200">Respondent Acquisition Channels</h3>
                    <p className="text-[10px] text-slate-500">Where survey submissions originate</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="w-24 text-xs text-slate-400">Direct Link</span>
                      <div className="flex-1 bg-slate-900 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-brand-500 h-full w-[45%]" />
                      </div>
                      <span className="text-xs font-semibold text-slate-300 w-10 text-right">45%</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="w-24 text-xs text-slate-400">Email Campaign</span>
                      <div className="flex-1 bg-slate-900 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full w-[30%]" />
                      </div>
                      <span className="text-xs font-semibold text-slate-300 w-10 text-right">30%</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="w-24 text-xs text-slate-400">Web Embeds</span>
                      <div className="flex-1 bg-slate-900 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-violet-500 h-full w-[15%]" />
                      </div>
                      <span className="text-xs font-semibold text-slate-300 w-10 text-right">15%</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="w-24 text-xs text-slate-400">QR Code</span>
                      <div className="flex-1 bg-slate-900 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-cyan-500 h-full w-[10%]" />
                      </div>
                      <span className="text-xs font-semibold text-slate-300 w-10 text-right">10%</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ==================== TEMPLATES TAB ==================== */}
          {activeTab === "templates" && (
            <div className="space-y-6 max-w-[1250px] mx-auto w-full">
              <div>
                <h2 className="text-xl font-bold text-white">Survey Templates Library</h2>
                <p className="text-xs text-slate-500">Select a pre-configured survey layout to build immediately.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TEMPLATES.map((template) => (
                  <Card key={template.id} className="p-5 bg-slate-900/30 border-slate-900 hover:border-slate-800/80 transition flex flex-col justify-between gap-4 group">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl p-2 rounded-xl bg-slate-900 border border-slate-850 group-hover:scale-105 transition-all">
                          {template.icon}
                        </span>
                        <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase bg-slate-900 px-2.5 py-0.5 rounded-full">
                          {template.category}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-100 group-hover:text-brand-400 transition">
                          {template.title}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed mt-1">{template.description}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: template.primaryColor }} />
                        <span className="text-[10px] text-slate-500 font-medium">Default Color</span>
                      </span>
                      <Button
                        onClick={() => createSurvey.mutate(template.title)}
                        disabled={createSurvey.isPending}
                        className="bg-slate-900 text-slate-200 border border-slate-800 hover:bg-brand-500 hover:text-white hover:border-transparent text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 font-semibold transition-all"
                      >
                        Use Template
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ==================== SETTINGS TAB ==================== */}
          {activeTab === "settings" && (
            <div className="max-w-[800px] mx-auto w-full space-y-8">
              <div>
                <h2 className="text-xl font-bold text-white">General Settings</h2>
                <p className="text-xs text-slate-500">Configure your profile details and theme preferences.</p>
              </div>

              {settingsSaved && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center justify-between">
                  <span>✓ Settings changes saved successfully!</span>
                  <button onClick={() => setSettingsSaved(false)} className="font-bold px-1">✕</button>
                </div>
              )}

              <Card className="p-6 bg-slate-900/30 border-slate-900 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-400">Account Owner Email</label>
                    <input
                      type="text"
                      value={user.email}
                      disabled
                      className="w-full rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs text-slate-500 outline-none cursor-not-allowed"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-400">Display Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-brand-500 transition"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-400">Workspace Label</label>
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-brand-500 transition"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-900/20 border border-slate-900 rounded-xl mt-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-200">Email Notifications</p>
                      <p className="text-[10px] text-slate-500">Alerts when new survey responses land</p>
                    </div>
                    <button
                      onClick={() => setEmailNotifications(!emailNotifications)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                        emailNotifications ? "bg-brand-500" : "bg-slate-800"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          emailNotifications ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-900 pt-6 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Account status: Active</span>
                  <Button
                    onClick={() => {
                      localStorage.setItem("formly:profileName", profileName)
                      localStorage.setItem("formly:workspaceName", workspaceName)
                      localStorage.setItem("formly:emailNotifications", String(emailNotifications))
                      setSettingsSaved(true)
                      setTimeout(() => setSettingsSaved(false), 5000)
                    }}
                    className="bg-brand-500 text-white font-semibold text-xs py-2 px-5 rounded-lg"
                  >
                    Save preferences
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// Custom Horizontal Survey Card Row rendering metadata and links
function SurveyCardRow({ survey, onDelete }: { survey: Survey; onDelete: () => void }) {
  const formattedDate = useMemo(() => {
    return new Date(survey.createdAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }, [survey.createdAt])

  return (
    <Card className="flex items-center gap-4 p-4 bg-slate-900/30 border-slate-900 hover:border-slate-800/80 transition relative group">
      {/* Decorative vertical color indicator strip */}
      <span
        className="h-10 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: survey.primaryColor }}
        aria-hidden
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/surveys/$surveyId"
            params={{ surveyId: survey.id }}
            className="truncate font-semibold text-slate-200 hover:text-brand-400 transition text-sm"
          >
            {survey.title}
          </Link>
          <span
            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              survey.status === "published"
                ? "bg-brand-500/10 text-brand-400"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            {survey.status}
          </span>
        </div>
        <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
          <span>{survey.responseCount ?? 0} response{(survey.responseCount ?? 0) === 1 ? "" : "s"}</span>
          <span className="text-slate-700">•</span>
          <span>Created {formattedDate}</span>
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link to="/surveys/$surveyId/responses" params={{ surveyId: survey.id }}>
          <Button
            variant="ghost"
            className="text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium transition"
          >
            <IconResponses className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Responses</span>
          </Button>
        </Link>
        <Link to="/surveys/$surveyId" params={{ surveyId: survey.id }}>
          <Button
            variant="ghost"
            className="text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium transition"
          >
            <IconEdit className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
        </Link>
        <button
          onClick={() => {
            if (confirm(`Delete "${survey.title}"? This removes its responses too.`)) onDelete()
          }}
          className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-slate-900/60 transition"
          title="Delete Survey"
        >
          <IconTrash className="h-4 w-4" />
        </button>
      </div>
    </Card>
  )
}

