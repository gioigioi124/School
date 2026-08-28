-- Migration: Create schedules table for class timetables
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  day_of_week INT NOT NULL, -- 2 = Thứ Hai, 3 = Thứ Ba, 4 = Thứ Tư, 5 = Thứ Năm, 6 = Thứ Sáu, 7 = Thứ Bảy, 8 = Chủ Nhật
  start_time VARCHAR(10) NOT NULL, -- Định dạng HH:mm, ví dụ '08:00'
  end_time VARCHAR(10) NOT NULL, -- Định dạng HH:mm, ví dụ '08:45'
  subject VARCHAR(100) NOT NULL, -- Tên môn học hoặc hoạt động
  room VARCHAR(50), -- Phòng học hoặc khu vực hoạt động
  color VARCHAR(20) DEFAULT '#4F46E5', -- Mã màu nhận diện môn học
  description TEXT, -- Ghi chú nội dung hoặc học cụ
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup by class and day of week
CREATE INDEX IF NOT EXISTS idx_schedules_class_day ON public.schedules(class_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_schedules_teacher ON public.schedules(teacher_id);

-- Enable RLS
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow authenticated read schedules" ON public.schedules
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow teachers and admins to modify schedules" ON public.schedules
  FOR ALL TO authenticated USING (true);
