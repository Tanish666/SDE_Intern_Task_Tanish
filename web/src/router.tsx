import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router"
import { BuilderPage } from "./routes/Builder"
import { DashboardPage } from "./routes/Dashboard"
import { LandingPage } from "./routes/Landing"
import { LoginPage } from "./routes/Login"
import { PublicSurveyPage } from "./routes/PublicSurvey"
import { ResponsesPage } from "./routes/Responses"

const rootRoute = createRootRoute({ component: () => <Outlet /> })

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
})

const builderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/surveys/$surveyId",
  component: BuilderPage,
})

const responsesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/surveys/$surveyId/responses",
  component: ResponsesPage,
})

const publicRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/s/$surveyId",
  component: PublicSurveyPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dashboardRoute,
  builderRoute,
  responsesRoute,
  publicRoute,
])

export const router = createRouter({ routeTree, defaultPreload: "intent" })
