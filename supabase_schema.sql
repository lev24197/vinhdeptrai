-- =====================================================================
-- THE ANKI DICTIONARY - PIXEL RPG & GAMIFICATION SCHEMA FOR SUPABASE
-- Chạy đoạn mã này trong mục SQL Editor của Supabase Dashboard (1-click)
-- =====================================================================

-- 1. Tạo bảng profiles chứa thông tin nhân vật RPG và tiến trình học tập
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT DEFAULT 'Hiệp Sĩ Anki',
  avatar TEXT DEFAULT '🦁',
  rpg_class TEXT DEFAULT 'warrior', -- warrior (Chiến Binh), mage (Pháp Sư), ranger (Xạ Thủ), assassin (Sát Thủ)
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  hp INTEGER DEFAULT 100,
  max_hp INTEGER DEFAULT 100,
  mp INTEGER DEFAULT 50,
  max_mp INTEGER DEFAULT 50,
  gold INTEGER DEFAULT 100,
  gems INTEGER DEFAULT 10,
  streak INTEGER DEFAULT 1,
  last_active_date DATE DEFAULT CURRENT_DATE,
  equipped_weapon TEXT DEFAULT 'Tập Sự Kiếm',
  equipped_armor TEXT DEFAULT 'Áo Vải Tân Thủ',
  inventory JSONB DEFAULT '{"streak_freeze": 1, "double_xp": 0, "hint_scroll": 2, "health_potion": 3, "dust": 20, "enhance_stones": 5, "gacha_pity": 0}'::jsonb,
  unlocked_dungeons JSONB DEFAULT '[1]'::jsonb,
  badges JSONB DEFAULT '["first_login"]'::jsonb,
  stats JSONB DEFAULT '{"monsters_slain": 0, "bosses_slain": 0, "total_turns": 0, "quizzes_played": 0, "total_correct": 0, "max_combo": 0}'::jsonb,
  mistake_bank JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Kích hoạt Row Level Security (RLS) để bảo vệ dữ liệu người dùng
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Tạo chính sách RLS: Mỗi người chơi chỉ được ĐỌC hồ sơ của chính mình
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- 4. Tạo chính sách RLS: Mỗi người chơi chỉ được CẬP NHẬT hồ sơ của chính mình
CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- 5. Tạo chính sách RLS: Cho phép chèn hồ sơ khi đăng ký
CREATE POLICY "Users can insert own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 6. Trigger tự động tạo hồ sơ profile ngay khi người dùng đăng ký tài khoản Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    display_name, 
    avatar, 
    rpg_class
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Hiệp Sĩ Anki'),
    COALESCE(NEW.raw_user_meta_data->>'avatar', '🦁'),
    COALESCE(NEW.raw_user_meta_data->>'rpg_class', 'warrior')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gán trigger vào bảng auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
