-- Create quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    max_score NUMERIC NOT NULL DEFAULT 10,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create quiz_scores table
CREATE TABLE IF NOT EXISTS public.quiz_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score NUMERIC NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_class_id ON public.quizzes(class_id);
CREATE INDEX IF NOT EXISTS idx_quiz_scores_quiz_id ON public.quiz_scores(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_scores_student_id ON public.quiz_scores(student_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_scores_unique ON public.quiz_scores(quiz_id, student_id);

-- Enable RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_scores ENABLE ROW LEVEL SECURITY;

-- Policies for quizzes
-- Inherit access from classes (instructors can manage their own class quizzes)
CREATE POLICY "Instructors can view/manage quizzes for their classes" ON public.quizzes
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.classes c
            WHERE c.id = quizzes.class_id
            AND c.instructor_id IN (
                SELECT id FROM public.instructors WHERE profile_id = auth.uid()
            )
        )
    );

-- Policies for quiz_scores
-- Instructors can view/manage scores for their quizzes
CREATE POLICY "Instructors can manage quiz scores" ON public.quiz_scores
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes q
            JOIN public.classes c ON q.class_id = c.id
            WHERE q.id = quiz_scores.quiz_id
            AND c.instructor_id IN (
                SELECT id FROM public.instructors WHERE profile_id = auth.uid()
            )
        )
    );
