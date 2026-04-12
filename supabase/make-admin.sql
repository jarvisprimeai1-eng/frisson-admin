-- ═══════════════════════════════════════════════════════════════════
-- MAKE ANASTASIA AN ADMIN
-- Run this AFTER Anastasia signs up for the first time in the admin panel
-- ═══════════════════════════════════════════════════════════════════

UPDATE profiles
SET is_admin = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'anastasiyazvanok@gmail.com');

-- Verify it worked
SELECT u.email, p.name, p.is_admin, p.created_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'anastasiyazvanok@gmail.com';
