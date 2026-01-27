CREATE TABLE IF NOT EXISTS email_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    email_type text NOT NULL,
    send_at timestamptz NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    UNIQUE(student_id, email_type, send_at)
);

CREATE INDEX IF NOT EXISTS idx_email_queue_send_at_status
ON email_queue(send_at, status)
WHERE status = 'pending';
