import { Hono } from "hono"
import type { AppEnv } from "./env"
import authRoutes from "./routes/auth"
import publicRoutes from "./routes/public"
import surveyRoutes from "./routes/surveys"

const app = new Hono<AppEnv>()

app.get("/api/health", (c) => c.json({ status: "ok" }))

app.route("/api/auth", authRoutes)
app.route("/api/surveys", surveyRoutes)
app.route("/api/public", publicRoutes)

app.notFound((c) => c.json({ error: "Not found" }, 404))

app.onError((err, c) => {
  console.error(err)
  return c.json({ error: "Internal server error" }, 500)
})

export default app
