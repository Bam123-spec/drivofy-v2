-- Add buffer_minutes to instructors
ALTER TABLE instructors 
ADD COLUMN IF NOT EXISTS buffer_minutes INTEGER DEFAULT 0;
