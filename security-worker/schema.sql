-- MQA+ Orali security intake — staging D1 schema.
-- No raw credentials, beneficiary information, or detailed logs.
CREATE TABLE IF NOT EXISTS security_events (
  event_id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  observed_at TEXT NOT NULL,
  summary TEXT NOT NULL,
  received_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_security_events_received ON security_events(received_at DESC);
