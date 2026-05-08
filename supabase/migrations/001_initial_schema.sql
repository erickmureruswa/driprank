-- ─────────────────────────────────────────────
--  DRIPRANK — Initial Schema
-- ─────────────────────────────────────────────

-- ── designs ──────────────────────────────────
create table if not exists public.designs (
  id              text primary key,           -- e.g. "DR001"
  name            text        not null,
  designer        text        not null,
  color           text        not null default '#B6FF00',
  hype            text        not null default '🔥',
  rank            integer     not null default 99,
  prev_rank       integer     not null default 99,
  orders          integer     not null default 0,
  weekly_orders   integer     not null default 0,
  all_time_orders integer     not null default 0,
  visibility      text        not null default 'public'
                              check (visibility in ('public', 'private')),
  drop            boolean     not null default false,
  image           text,                       -- Unsplash URL or uploaded URL
  shirt_color     text        not null default '#FFFFFF',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── drops ────────────────────────────────────
create table if not exists public.drops (
  id          text primary key,               -- e.g. "DROP-001"
  design_id   text        not null references public.designs(id),
  name        text        not null,
  designer    text        not null,
  color       text        not null,
  price       text        not null default 'COD — Market Rate',
  stock       integer     not null default 100,
  ends_at     timestamptz not null,
  tag         text        not null default 'LIMITED',
  hype        text        not null default '🔥',
  active      boolean     not null default true,
  created_at  timestamptz not null default now()
);

-- ── orders ───────────────────────────────────
create table if not exists public.orders (
  id          uuid primary key default gen_random_uuid(),
  design_id   text        not null references public.designs(id),
  drop_id     text        references public.drops(id),
  size        text        not null,
  city        text        not null,
  phone       text,
  status      text        not null default 'pending'
                          check (status in ('pending', 'confirmed', 'shipped', 'delivered')),
  created_at  timestamptz not null default now()
);

-- ── auto-update updated_at ───────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger designs_updated_at
  before update on public.designs
  for each row execute function public.handle_updated_at();

-- ── Row Level Security ───────────────────────
alter table public.designs enable row level security;
alter table public.drops   enable row level security;
alter table public.orders  enable row level security;

-- designs: anyone can read public designs
create policy "Public designs are viewable by everyone"
  on public.designs for select
  using (visibility = 'public');

-- drops: anyone can read active drops
create policy "Active drops are viewable by everyone"
  on public.drops for select
  using (active = true);

-- orders: anyone can insert (WhatsApp-confirmed COD flow)
create policy "Anyone can place an order"
  on public.orders for insert
  with check (true);

-- ── Indexes ──────────────────────────────────
create index if not exists designs_rank_idx          on public.designs(rank);
create index if not exists designs_visibility_idx    on public.designs(visibility);
create index if not exists designs_weekly_orders_idx on public.designs(weekly_orders desc);
create index if not exists drops_active_idx          on public.drops(active, ends_at);
create index if not exists orders_design_id_idx      on public.orders(design_id);
