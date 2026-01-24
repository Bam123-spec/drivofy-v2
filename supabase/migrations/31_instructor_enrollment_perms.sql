-- Allow instructors to update enrollments for their classes
-- This is needed for grading and certification status

CREATE POLICY "Instructors can update enrollments for their classes" ON public.enrollments
    FOR UPDATE
    USING (
        class_id IN (
            SELECT id FROM public.classes 
            WHERE instructor_id IN (SELECT id FROM public.instructors WHERE profile_id = auth.uid())
        )
    )
    WITH CHECK (
        class_id IN (
            SELECT id FROM public.classes 
            WHERE instructor_id IN (SELECT id FROM public.instructors WHERE profile_id = auth.uid())
        )
    );
