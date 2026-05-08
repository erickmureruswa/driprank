-- ─────────────────────────────────────────────
--  DRIPRANK — Seed Data (mock → real)
-- ─────────────────────────────────────────────

insert into public.designs
  (id, name, designer, color, hype, rank, prev_rank, orders, weekly_orders, all_time_orders, visibility, drop, image)
values
  ('DR001','STATIC NOISE', '@glitchkid',  '#B6FF00','🔥', 1, 2, 847, 312, 2104, 'public', false,
   'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=480&h=580&fit=crop&crop=center&q=82'),
  ('DR002','VOID RUNNER',  '@darkmode_z', '#00D1FF','⚡', 2, 1, 712, 289, 1876, 'public', false,
   'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=480&h=580&fit=crop&crop=center&q=82'),
  ('DR003','CHROME GHOST', '@spectral99', '#FF006E','💀', 3, 5, 634, 241, 1523, 'public', false,
   'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=480&h=580&fit=crop&crop=center&q=82'),
  ('DR004','ACID BLOOM',   '@rave.flux',  '#B6FF00','🌿', 4, 3, 589, 198, 1290, 'public', false,
   'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=480&h=580&fit=crop&crop=center&q=82'),
  ('DR005','NULL CITY',    '@n0city',     '#00D1FF','🌆', 5, 4, 421, 167, 987,  'public', false,
   'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=480&h=580&fit=crop&crop=center&q=82'),
  ('DR006','PLASMA WAVE',  '@wave99',     '#FF006E','🌊', 6, 8, 388, 155, 812,  'public', false,
   'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=480&h=580&fit=crop&crop=center&q=82'),
  ('DR007','DARK MATTER',  '@mattter',    '#B6FF00','🔮', 7, 6, 312, 124, 734,  'public', false,
   'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=480&h=580&fit=crop&crop=center&q=82'),
  ('DR008','NEON TOKYO',   '@tokyoghost', '#00D1FF','🗼', 8, 7, 287, 108, 654,  'public', false,
   'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=480&h=580&fit=crop&crop=center&q=82'),
  ('DR009','GLITCH ARC',   '@arc.exe',    '#FF006E','⚡', 9, 11,241, 97,  589,  'public', false,
   'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=480&h=580&fit=crop&crop=center&q=82'),
  ('DR010','ELECTRIC ZEN', '@zenmode',    '#B6FF00','☯️',10, 9, 198, 78,  432,  'public', false,
   'https://images.unsplash.com/photo-1564859228273-274232fdb516?w=480&h=580&fit=crop&crop=center&q=82')
on conflict (id) do nothing;

insert into public.drops
  (id, design_id, name, designer, color, stock, ends_at, tag, hype)
values
  ('DROP-001','DR001','STATIC NOISE GENESIS', '@glitchkid',  '#B6FF00', 47,
   now() + interval '2 days', 'LIMITED',      '🔥'),
  ('DROP-002','DR003','CHROME GHOST REISSUE', '@spectral99', '#FF006E', 23,
   now() + interval '12 hours', 'ENDING SOON','💀'),
  ('DROP-003','DR006','PLASMA WAVE FIRST RUN','@wave99',     '#00D1FF', 88,
   now() + interval '5 days', 'NEW DROP',     '🌊')
on conflict (id) do nothing;
