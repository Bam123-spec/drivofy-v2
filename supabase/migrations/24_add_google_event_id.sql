-- Add google_event_id to driving_sessions
ALTER TABLE driving_sessions 
ADD COLUMN IF NOT EXISTS google_event_id text;

-- Add index for faster lookups if we ever sync back from Google (optional but good practice)
CREATE INDEX IF NOT EXISTS idx_driving_sessions_google_event_id ON driving_sessions(google_event_id);
