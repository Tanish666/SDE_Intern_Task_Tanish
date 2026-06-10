export interface Bindings {
  DB: D1Database
  SESSION_SECRET: string
}

export interface Variables {
  userId: string
}

export type AppEnv = { Bindings: Bindings; Variables: Variables }
