-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)

-- Hero (bilingual: en, es)
CREATE TABLE IF NOT EXISTS public.hero (
  language TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  role TEXT NOT NULL
);

ALTER TABLE public.hero ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.hero FOR SELECT USING (true);
CREATE POLICY "Allow admin write" ON public.hero FOR ALL USING (true);

-- About (bilingual: en, es)
CREATE TABLE IF NOT EXISTS public.about (
  language TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  specialization TEXT NOT NULL
);

ALTER TABLE public.about ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.about FOR SELECT USING (true);
CREATE POLICY "Allow admin write" ON public.about FOR ALL USING (true);

-- Skills (bilingual: en, es, categories as JSONB)
CREATE TABLE IF NOT EXISTS public.skills (
  language TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  categories JSONB NOT NULL DEFAULT '[]'
);

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Allow admin write" ON public.skills FOR ALL USING (true);

-- Business / Why Work With Me (bilingual: en, es, cards as JSONB)
CREATE TABLE IF NOT EXISTS public.business (
  language TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  cards JSONB NOT NULL DEFAULT '[]'
);

ALTER TABLE public.business ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.business FOR SELECT USING (true);
CREATE POLICY "Allow admin write" ON public.business FOR ALL USING (true);

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id BIGINT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]',
  metrics TEXT DEFAULT '',
  link TEXT DEFAULT '#',
  github TEXT DEFAULT '#',
  image TEXT DEFAULT '',
  features JSONB NOT NULL DEFAULT '[]'
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow admin write" ON public.projects FOR ALL USING (true);

-- Experience
CREATE TABLE IF NOT EXISTS public.experience (
  id BIGINT PRIMARY KEY,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  period TEXT NOT NULL,
  achievements JSONB NOT NULL DEFAULT '[]'
);

ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.experience FOR SELECT USING (true);
CREATE POLICY "Allow admin write" ON public.experience FOR ALL USING (true);

-- Blog Posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id BIGINT PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT DEFAULT '',
  content TEXT DEFAULT '',
  date TEXT DEFAULT '',
  read_time TEXT DEFAULT '',
  tags JSONB NOT NULL DEFAULT '[]',
  link TEXT DEFAULT '#'
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Allow admin write" ON public.blog_posts FOR ALL USING (true);

-- Contacts
CREATE TABLE IF NOT EXISTS public.contacts (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.contacts FOR SELECT USING (true);
CREATE POLICY "Allow admin write" ON public.contacts FOR ALL USING (true);

-- Status
CREATE TABLE IF NOT EXISTS public.status (
  id INTEGER PRIMARY KEY DEFAULT 1,
  is_available BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.status FOR SELECT USING (true);
CREATE POLICY "Allow admin write" ON public.status FOR ALL USING (true);

-- Insert initial status row
INSERT INTO public.status (id, is_available) VALUES (1, true)
ON CONFLICT (id) DO NOTHING;
