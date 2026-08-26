-- Migration: Create games and game_scores tables
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'general', -- 'matching', 'quiz', 'puzzle', 'math'
  thumbnail_url TEXT,
  xp_reward INT NOT NULL DEFAULT 15,
  config JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INT NOT NULL DEFAULT 0,
  max_score INT NOT NULL DEFAULT 100,
  xp_earned INT NOT NULL DEFAULT 0,
  played_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed initial educational games
INSERT INTO public.games (code, title, description, category, thumbnail_url, xp_reward, config)
VALUES
  (
    'matching_animals',
    'Nối Hình Con Vật',
    'Bé nối hình ảnh các con vật đáng yêu với tên gọi tương ứng',
    'matching',
    '🦁',
    20,
    '{"pairs": [{"id": "1", "item": "🦁 Sư Tử", "match": "Sư tử dũng mãnh"}, {"id": "2", "item": "🐘 Voi Con", "match": "Voi có vòi dài"}, {"id": "3", "item": "🐬 Cá Heo", "match": "Cá heo bơi lội"}, {"id": "4", "item": "🐰 Thỏ Trắng", "match": "Thỏ thích ăn cà rốt"}]}'
  ),
  (
    'quick_quiz',
    'Đố Vui Thông Thái',
    'Trả lời nhanh các câu đố màu sắc, đồ vật và tự nhiên xung quanh bé',
    'quiz',
    '🎯',
    25,
    '{"questions": [{"q": "Mặt trời mọc vào buổi nào?", "options": ["Buổi sáng", "Buổi tối", "Buổi đêm"], "a": 0}, {"q": "Cầu vồng có bao nhiêu màu sắc chính?", "options": ["3 màu", "5 màu", "7 màu"], "a": 2}, {"q": "Đèn giao thông màu nào báo hiệu dừng lại?", "options": ["Màu xanh", "Màu đỏ", "Màu vàng"], "a": 1}]}'
  ),
  (
    'word_puzzle',
    'Ghép Chữ Thành Từ',
    'Sắp xếp các chữ cái xáo trộn để tạo thành từ có nghĩa hoàn chỉnh',
    'puzzle',
    '🧩',
    20,
    '{"puzzles": [{"letters": ["B", "É", " ", "N", "G", "O", "A", "N"], "word": "BÉ NGOAN"}, {"letters": ["T", "R", "Ư", "Ờ", "N", "G", " ", "H", "Ọ", "C"], "word": "TRƯỜNG HỌC"}]}'
  )
ON CONFLICT (code) DO NOTHING;

-- Enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read games" ON public.games
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read game_scores" ON public.game_scores
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert game_scores" ON public.game_scores
  FOR INSERT TO authenticated WITH CHECK (true);
