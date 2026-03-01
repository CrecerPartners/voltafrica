
-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Training courses table
CREATE TABLE public.training_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General',
  level TEXT NOT NULL DEFAULT 'Beginner',
  cover_color TEXT NOT NULL DEFAULT '#3B82F6',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read courses" ON public.training_courses FOR SELECT USING (true);

-- Training lessons table
CREATE TABLE public.training_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.training_courses(id) ON DELETE CASCADE,
  module_number INT NOT NULL DEFAULT 1,
  module_title TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.training_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read lessons" ON public.training_lessons FOR SELECT USING (true);

-- Training progress table
CREATE TABLE public.training_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.training_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own progress" ON public.training_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.training_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.training_progress FOR UPDATE USING (auth.uid() = user_id);

-- Seed sample courses
INSERT INTO public.training_courses (id, title, description, category, level, cover_color, sort_order) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sales Mastery 101', 'Learn the fundamentals of selling products and closing deals effectively.', 'Sales Skills', 'Beginner', '#EC4899', 1),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Social Media Marketing', 'Master social media strategies to boost your product visibility and sales.', 'Marketing', 'Intermediate', '#8B5CF6', 2),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Personal Branding', 'Build a powerful personal brand that attracts customers and opportunities.', 'Branding', 'Beginner', '#F59E0B', 3);

-- Seed lessons for Sales Mastery 101
INSERT INTO public.training_lessons (course_id, module_number, module_title, title, youtube_url, sort_order) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, 'Introduction', 'Welcome to Sales Mastery', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, 'Introduction', 'Understanding the Sales Process', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2, 'Building Rapport', 'First Impressions Matter', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 3),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2, 'Building Rapport', 'Active Listening Techniques', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 4),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 3, 'Closing Deals', 'Overcoming Objections', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 5),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 3, 'Closing Deals', 'The Art of the Close', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 6);

-- Seed lessons for Social Media Marketing
INSERT INTO public.training_lessons (course_id, module_number, module_title, title, youtube_url, sort_order) VALUES
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 1, 'Getting Started', 'Choosing Your Platforms', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 1, 'Getting Started', 'Creating a Content Calendar', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 2, 'Content Creation', 'Writing Engaging Captions', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 3),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 2, 'Content Creation', 'Visual Storytelling', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 4);

-- Seed lessons for Personal Branding
INSERT INTO public.training_lessons (course_id, module_number, module_title, title, youtube_url, sort_order) VALUES
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 1, 'Brand Foundations', 'What is Personal Branding?', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 1, 'Brand Foundations', 'Finding Your Unique Value', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 2, 'Online Presence', 'Optimizing Your Profiles', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 3);
