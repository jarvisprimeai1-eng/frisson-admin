-- ═══════════════════════════════════════════════════════════════════
-- STORAGE BUCKETS — for audio files and cover images
-- Run after schema.sql
-- ═══════════════════════════════════════════════════════════════════

-- Create buckets (public reads, authenticated writes)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('meditations', 'meditations', true, 52428800, ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mp4']),
  ('covers',      'covers',      true, 5242880,  ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('books',       'books',       true, 10485760, ARRAY['application/pdf', 'image/png', 'image/jpeg']);

-- Policies: public can read, only admins can write
CREATE POLICY "Public read meditations audio" ON storage.objects FOR SELECT
  USING (bucket_id = 'meditations');

CREATE POLICY "Admins upload meditations" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'meditations' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins update meditations" ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'meditations' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins delete meditations" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'meditations' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Same for covers
CREATE POLICY "Public read covers" ON storage.objects FOR SELECT
  USING (bucket_id = 'covers');

CREATE POLICY "Admins upload covers" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'covers' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins update covers" ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'covers' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins delete covers" ON storage.objects FOR DELETE
  USING (
    bucket_id = 'covers' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Same for books
CREATE POLICY "Public read books" ON storage.objects FOR SELECT
  USING (bucket_id = 'books');

CREATE POLICY "Admins upload books" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'books' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );
