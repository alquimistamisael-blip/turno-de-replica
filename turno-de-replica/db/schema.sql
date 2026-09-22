CREATE TABLE IF NOT EXISTS content_documents (
  section TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS content_documents_updated_at_idx
  ON content_documents (updated_at DESC);
