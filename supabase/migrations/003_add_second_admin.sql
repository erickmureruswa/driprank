-- ─────────────────────────────────────────────
--  DRIPRANK — Promote second admin by email
--  Run this in Supabase SQL Editor
-- ─────────────────────────────────────────────

-- If the user has already signed up, promote them immediately
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'makosapauljunior@gmail.com'
  LIMIT 1
);

-- ── Verification ──────────────────────────────
-- Run this to confirm the update worked:
-- SELECT p.id, u.email, p.role
-- FROM public.profiles p
-- JOIN auth.users u ON u.id = p.id
-- WHERE u.email = 'makosapauljunior@gmail.com';

-- ── If the user hasn't signed up yet ─────────
-- After they sign up, re-run this migration.
-- Their profile is auto-created on sign-up via
-- the handle_new_user() trigger (migration 002).
-- ─────────────────────────────────────────────
