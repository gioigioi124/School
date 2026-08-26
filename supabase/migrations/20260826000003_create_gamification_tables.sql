-- Migration: Create gamification tables (user_xp, badges, user_badges, xp_history)

-- 1. Master badges table
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50) NOT NULL DEFAULT '🌟',
  category VARCHAR(50) DEFAULT 'achievement',
  xp_bonus INT NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. User XP and Level summary table
CREATE TABLE IF NOT EXISTS public.user_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_xp INT NOT NULL DEFAULT 0,
  current_level INT NOT NULL DEFAULT 1,
  total_stars INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. User Unlocked Badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_student_badge UNIQUE (student_id, badge_id)
);

-- 4. XP Transaction History table
CREATE TABLE IF NOT EXISTS public.xp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  xp_amount INT NOT NULL,
  source_type VARCHAR(50), -- 'lesson', 'assignment', 'streak', 'award', 'quiz'
  source_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Populate default badges
INSERT INTO public.badges (code, name, description, icon, category, xp_bonus)
VALUES 
  ('first_lesson', 'Bước Chân Đầu Tiên', 'Hoàn thành bài học đầu tiên của con', '🌱', 'learning', 20),
  ('streak_3', 'Ngọn Lửa Nhỏ', 'Duy trì chuỗi chuyên cần 3 ngày liên tiếp', '🔥', 'streak', 30),
  ('streak_7', 'Chiến Binh Chăm Chỉ', 'Duy trì chuỗi chuyên cần 7 ngày liên tiếp', '⚡', 'streak', 50),
  ('quiz_master', 'Bé Thông Thái', 'Đạt điểm tối đa trong một bài kiểm tra câu đố', '🎯', 'quiz', 40),
  ('level_5', 'Siêu Sao Nhí', 'Đạt Cấp độ 5 trong hành trình học tập', '👑', 'level', 100),
  ('helper', 'Bé Ngoan Của Cô', 'Được cô giáo khen thưởng vì lễ phép và chăm ngoan', '🌸', 'social', 50)
ON CONFLICT (code) DO NOTHING;

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read badges" ON public.badges
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read user_xp" ON public.user_xp
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated update user_xp" ON public.user_xp
  FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated read user_badges" ON public.user_badges
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated update user_badges" ON public.user_badges
  FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated read xp_history" ON public.xp_history
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert xp_history" ON public.xp_history
  FOR INSERT TO authenticated WITH CHECK (true);
