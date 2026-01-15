-- Add type column to instructors table
ALTER TABLE instructors 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'both' CHECK (type IN ('driving', 'theory', 'both'));

-- Update existing instructors to 'both' (default)
UPDATE instructors SET type = 'both' WHERE type IS NULL;
