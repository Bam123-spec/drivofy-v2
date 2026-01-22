-- Add classification column to classes table
ALTER TABLE public.classes ADD COLUMN classification TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.classes.classification IS 'Classification for Driver Education classes: Morning, Evening, or Weekend';
