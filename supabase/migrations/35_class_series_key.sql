-- Migration: Add series_key to classes and idempotency index
-- Description: Supports "Seeding Cohorts" feature by tracking series templates and preventing duplicates.

-- 1. Add series_key column
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS series_key text;

-- 2. Add unique index for idempotency
-- Ensures we don't duplicate a cohort for the same series starting on the same date.
-- Only applies when series_key is present (partial index).
CREATE UNIQUE INDEX IF NOT EXISTS idx_classes_series_start 
ON classes(series_key, start_date) 
WHERE series_key IS NOT NULL;
