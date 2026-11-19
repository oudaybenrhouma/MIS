CREATE TABLE IF NOT EXISTS mis_rfq_submissions (
  reference text PRIMARY KEY,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'reviewing', 'quoted', 'closed')),
  payload jsonb NOT NULL
);

CREATE INDEX IF NOT EXISTS mis_rfq_submissions_submitted_at_idx
  ON mis_rfq_submissions (submitted_at DESC);
