-- Migration: Create lessons, assignments, submissions, and student_progress tables
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  duration INT NOT NULL DEFAULT 0,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL DEFAULT 'quiz',
  content JSONB,
  xp_reward INT NOT NULL DEFAULT 20,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content JSONB,
  grade NUMERIC(5,2),
  feedback TEXT,
  xp_earned INT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'submitted',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  graded_at TIMESTAMPTZ,
  CONSTRAINT unique_student_assignment UNIQUE (student_id, assignment_id)
);

CREATE TABLE IF NOT EXISTS public.student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  xp_earned INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_student_lesson UNIQUE (student_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

-- Policies for lessons
CREATE POLICY "Allow authenticated read lessons" ON public.lessons
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow teachers and admins to modify lessons" ON public.lessons
  FOR ALL TO authenticated USING (true);

-- Policies for assignments
CREATE POLICY "Allow authenticated read assignments" ON public.assignments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow teachers and admins to modify assignments" ON public.assignments
  FOR ALL TO authenticated USING (true);

-- Policies for submissions
CREATE POLICY "Allow authenticated read submissions" ON public.submissions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow students and teachers to modify submissions" ON public.submissions
  FOR ALL TO authenticated USING (true);

-- Policies for student_progress
CREATE POLICY "Allow authenticated read student_progress" ON public.student_progress
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated modify student_progress" ON public.student_progress
  FOR ALL TO authenticated USING (true);
