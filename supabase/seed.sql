-- ============================================================
-- DRIPRANK — Supabase seed (run once in the SQL editor)
-- ============================================================

-- ── designs ──────────────────────────────────────────────────
create table if not exists designs (
  id              text primary key,
  name            text        not null,
  designer        text        not null,
  color           text        not null,
  hype            text        not null,
  rank            int         not null,
  prev_rank       int         not null,
  orders          int         not null default 0,
  weekly_orders   int         not null default 0,
  all_time_orders int         not null default 0,
  visibility      text        not null default 'public',
  drop            boolean     not null default false,
  created_at      timestamptz not null default now()
);

-- ── drops ────────────────────────────────────────────────────
create table if not exists drops (
  id          text primary key,
  design_id   text        not null references designs(id),
  name        text        not null,
  designer    text        not null,
  color       text        not null,
  price       text        not null default 'COD — Market Rate',
  stock       int         not null default 0,
  ends_at     timestamptz not null,
  tag         text        not null,
  hype        text        not null,
  created_at  timestamptz not null default now()
);

-- ── orders ───────────────────────────────────────────────────
create table if not exists orders (
  id          uuid primary key default gen_random_uuid(),
  design_id   text        not null references designs(id),
  size        text        not null,
  city        text        not null,
  status      text        not null default 'pending',
  created_at  timestamptz not null default now()
);

-- ── Enable Row Level Security ─────────────────────────────────
alter table designs enable row level security;
alter table drops    enable row level security;
alter table orders   enable row level security;

-- Everyone can read designs and drops
create policy "public read designs" on designs for select using (true);
create policy "public read drops"   on drops   for select using (true);

-- Anyone can insert an order (anon users = customers)
create policy "public insert orders" on orders for insert with check (true);

-- ── Seed: designs ─────────────────────────────────────────────
insert into designs (id, name, designer, color, hype, rank, prev_rank, orders, weekly_orders, all_time_orders) values
  ('DR001', 'STATIC NOISE',  '@glitchkid',   '#B6FF00', '🔥', 1,  2,  847, 312, 2104),
  ('DR002', 'VOID RUNNER',   '@darkmode_z',  '#00D1FF', '⚡', 2,  1,  712, 289, 1876),
  ('DR003', 'CHROME GHOST',  '@spectral99',  '#FF006E', '💀', 3,  5,  634, 241, 1523),
  ('DR004', 'ACID BLOOM',    '@rave.flux',   '#B6FF00', '🌿', 4,  3,  589, 198, 1290),
  ('DR005', 'NULL CITY',     '@n0city',      '#00D1FF', '🌆', 5,  4,  421, 167,  987),
  ('DR006', 'PLASMA WAVE',   '@wave99',      '#FF006E', '🌊', 6,  8,  388, 155,  812),
  ('DR007', 'DARK MATTER',   '@mattter',     '#B6FF00', '🔮', 7,  6,  312, 124,  734),
  ('DR008', 'NEON TOKYO',    '@tokyoghost',  '#00D1FF', '🗼', 8,  7,  287, 108,  654),
  ('DR009', 'GLITCH ARC',    '@arc.exe',     '#FF006E', '⚡', 9,  11, 241,  97,  589),
  ('DR010', 'ELECTRIC ZEN',  '@zenmode',     '#B6FF00', '☯️',10,  9,  198,  78,  432)
on conflict (id) do update set
  orders          = excluded.orders,
  weekly_orders   = excluded.weekly_orders,
  all_time_orders = excluded.all_time_orders,
  rank            = excluded.rank,
  prev_rank       = excluded.prev_rank;

-- ── Seed: drops ──────────────────────────────────────────────
insert into drops (id, design_id, name, designer, color, stock, ends_at, tag, hype) values
  (
    'DROP-001', 'DR001',
    'STATIC NOISE GENESIS', '@glitchkid', '#B6FF00',
    47,
    now() + interval '2 days',
    'LIMITED', '🔥'
  ),
  (
    'DROP-002', 'DR003',
    'CHROME GHOST REISSUE', '@spectral99', '#FF006E',
    23,
    now() + interval '12 hours',
    'ENDING SOON', '💀'
  ),
  (
    'DROP-003', 'DR006',
    'PLASMA WAVE FIRST RUN', '@wave99', '#00D1FF',
    88,
    now() + interval '5 days',
    'NEW DROP', '🌊'
  )
on conflict (id) do update set
  stock   = excluded.stock,
  ends_at = excluded.ends_at;

-- ── Seed: sample orders (historical) ─────────────────────────
insert into orders (design_id, size, city, status, created_at) values
  ('DR001', 'M',   'Harare',    'confirmed', now() - interval '1 day'),
  ('DR001', 'L',   'Harare',    'confirmed', now() - interval '6 hours'),
  ('DR001', 'XL',  'Bulawayo',  'confirmed', now() - interval '2 hours'),
  ('DR002', 'S',   'Harare',    'confirmed', now() - interval '3 days'),
  ('DR002', 'M',   'Mutare',    'confirmed', now() - interval '1 day'),
  ('DR003', 'L',   'Gweru',     'confirmed', now() - interval '4 hours'),
  ('DR003', 'XXL', 'Harare',    'pending',   now() - interval '30 minutes'),
  ('DR004', 'M',   'Harare',    'confirmed', now() - interval '2 days'),
  ('DR005', 'S',   'Chitungwiza','confirmed',now() - interval '5 days'),
  ('DR006', 'XL',  'Harare',    'pending',   now() - interval '1 hour');
