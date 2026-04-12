-- ═══════════════════════════════════════════════════════════════════
-- FRISSON DATABASE SCHEMA
-- Run this once in your Supabase SQL Editor (one block at a time)
-- Dashboard → SQL Editor → New Query → paste → Run
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. SECTIONS (categories like "Ресурс", "Женское", etc) ───
CREATE TABLE sections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO sections (id, name, description, color, sort_order) VALUES
  ('resource',  'Ресурс',        'Восполнение энергии',          '#F08838', 1),
  ('feminine',  'Женское',       'Женская энергия и мягкость',   '#E64DA8', 2),
  ('receiving', 'Получать',      'Способность принимать',         '#FFAF32', 3),
  ('newlevel',  'Новый уровень', 'Рост и развитие',              '#9F7BD8', 4),
  ('self',      'Своё',          'Самоценность и подлинность',    '#D080B0', 5);

-- ─── 2. MEDITATIONS ───
CREATE TABLE meditations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  short_description TEXT,
  full_description TEXT,
  section_id TEXT REFERENCES sections(id),
  duration_seconds INT,             -- auto-calculated from audio
  audio_url TEXT,                   -- Supabase Storage path
  cover_emoji TEXT,                 -- fallback icon
  cover_image_url TEXT,             -- optional upload
  is_premium BOOLEAN DEFAULT true,  -- false = free for everyone
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ,         -- when it went live
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX meditations_section_idx ON meditations(section_id, active, sort_order);

-- ─── 3. BOOKS ───
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT,
  short_description TEXT,
  full_description TEXT,
  chapters JSONB,                   -- [{title, content}] array
  cover_image_url TEXT,
  is_premium BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 4. TESTS (психологические тесты) ───
CREATE TABLE tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,        -- e.g. 'energy', 'femininity'
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,         -- [{q, options: [{text, score}]}]
  result_ranges JSONB,              -- [{min, max, label, advice}]
  is_premium BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 5. SITUATIONS (life situations with recommended practices) ───
CREATE TABLE situations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  recommended_meditation_ids UUID[],
  recommended_book_ids UUID[],
  sort_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 6. USER PROFILES (beyond auth.users) ───
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  is_admin BOOLEAN DEFAULT false,   -- only Anastasia
  premium_until TIMESTAMPTZ,        -- null = free user
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name) VALUES (NEW.id, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── 7. USER DATA — diary, psycap, activity ───
CREATE TABLE diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tab TEXT NOT NULL,                -- 'body', 'emotion', 'thought', 'action'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX diary_user_idx ON diary_entries(user_id, created_at DESC);

CREATE TABLE psycap_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,         -- 'meditation', 'diary', 'orbit', 'test', 'checkin'
  display_name TEXT,
  axes TEXT[],                      -- ['safety', 'worth', 'receive', ...]
  points INT DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX psycap_user_idx ON psycap_events(user_id, created_at DESC);

CREATE TABLE meditation_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meditation_id UUID REFERENCES meditations(id) ON DELETE CASCADE NOT NULL,
  seconds_played INT DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX plays_user_idx ON meditation_plays(user_id, created_at DESC);
CREATE INDEX plays_meditation_idx ON meditation_plays(meditation_id);

-- ═══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY — who can read/write what
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditations ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE situations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE psycap_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_plays ENABLE ROW LEVEL SECURITY;

-- Public read access to content (everyone can browse)
CREATE POLICY "Content is public" ON sections FOR SELECT USING (active = true);
CREATE POLICY "Meditations are public" ON meditations FOR SELECT USING (active = true);
CREATE POLICY "Books are public" ON books FOR SELECT USING (active = true);
CREATE POLICY "Tests are public" ON tests FOR SELECT USING (active = true);
CREATE POLICY "Situations are public" ON situations FOR SELECT USING (active = true);

-- Only admins can write content
CREATE POLICY "Admins write sections" ON sections FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins write meditations" ON meditations FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins write books" ON books FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins write tests" ON tests FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins write situations" ON situations FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Users manage their own profile
CREATE POLICY "Users see own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins see all profiles" ON profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- Users manage their own diary/psycap/plays
CREATE POLICY "Users manage own diary" ON diary_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own psycap" ON psycap_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own plays" ON meditation_plays FOR ALL USING (auth.uid() = user_id);

-- Admins can see aggregated user data (for analytics)
CREATE POLICY "Admins read all diary" ON diary_entries FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins read all psycap" ON psycap_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins read all plays" ON meditation_plays FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
