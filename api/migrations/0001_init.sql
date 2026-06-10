-- Survey builder schema. D1 (SQLite).

CREATE TABLE users (
  id         TEXT PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL
);

CREATE TABLE surveys (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id),
  title         TEXT NOT NULL,
  description   TEXT,
  primary_color TEXT NOT NULL DEFAULT '#4f46e5',
  logo_url      TEXT,
  status        TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'published'
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);

CREATE INDEX idx_surveys_user ON surveys(user_id);

CREATE TABLE questions (
  id          TEXT PRIMARY KEY,
  survey_id   TEXT NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  type        TEXT NOT NULL, -- 'short_text' | 'long_text' | 'multiple_choice' | 'rating'
  label       TEXT NOT NULL,
  description TEXT,
  required    INTEGER NOT NULL DEFAULT 0,
  position    INTEGER NOT NULL,
  options     TEXT NOT NULL DEFAULT '[]', -- JSON string[] for multiple_choice
  config      TEXT NOT NULL DEFAULT '{}'  -- JSON, e.g. { "maxRating": 5 }
);

CREATE INDEX idx_questions_survey ON questions(survey_id, position);

CREATE TABLE responses (
  id         TEXT PRIMARY KEY,
  survey_id  TEXT NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_responses_survey ON responses(survey_id);

CREATE TABLE answers (
  id          TEXT PRIMARY KEY,
  response_id TEXT NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  value       TEXT NOT NULL -- stored as text; for multi-value we JSON-encode
);

CREATE INDEX idx_answers_response ON answers(response_id);
