-- Add btw_credits_granted flag to enrollments to ensure idempotency when granting achievement-based credits
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS btw_credits_granted BOOLEAN DEFAULT false;
