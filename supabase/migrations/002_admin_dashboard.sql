-- ─────────────────────────────────────────────
--  DRIPRANK — Admin Dashboard Schema
-- ─────────────────────────────────────────────

-- ── profiles ──────────────────────────────────
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  username    text unique not null,
  avatar_url  text,
  bio         text,
  role        text not null default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── likes ──────────────────────────────────────
create table if not exists public.likes (
  id          uuid primary key default gen_random_uuid(),
  design_id   text not null references public.designs(id) on delete cascade,
  user_id     uuid not null references auth.users on delete cascade,
  created_at  timestamptz not null default now(),
  unique(design_id, user_id)
);

-- ── platform_settings ─────────────────────────
create table if not exists public.platform_settings (
  key         text primary key,
  value       text not null,
  updated_at  timestamptz not null default now()
);

insert into public.platform_settings (key, value) values
  ('whatsapp_number', '263771465624'),
  ('base_price',      '25'),
  ('premium_price',   '35'),
  ('currency',        'USD'),
  ('platform_name',   'DRIPRANK')
on conflict (key) do nothing;

-- ── designs: add columns ───────────────────────
alter table public.designs
  add column if not exists price    decimal(10,2) default 25.00,
  add column if not exists views    integer       not null default 0,
  add column if not exists featured boolean       not null default false;

-- ── orders: add columns ────────────────────────
alter table public.orders
  add column if not exists user_id     uuid references auth.users,
  add column if not exists quantity    integer      not null default 1,
  add column if not exists total_price decimal(10,2);

-- ── RLS ───────────────────────────────────────
alter table public.profiles          enable row level security;
alter table public.likes             enable row level security;
alter table public.platform_settings enable row level security;

-- profiles
create policy "Profiles viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- likes
create policy "Likes visible to everyone"
  on public.likes for select using (true);

create policy "Authenticated users can like"
  on public.likes for insert
  with check (auth.uid() = user_id);

create policy "Users can remove own likes"
  on public.likes for delete
  using (auth.uid() = user_id);

-- platform_settings: read-only for public, admin can write
create policy "Settings readable by everyone"
  on public.platform_settings for select using (true);

create policy "Admins can modify settings"
  on public.platform_settings for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- orders: admins can read all
create policy "Admins can read all orders"
  on public.orders for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- designs: admins bypass visibility filter
create policy "Admins can manage all designs"
  on public.designs for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can insert designs"
  on public.designs for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ── Indexes ───────────────────────────────────
create index if not exists profiles_role_idx        on public.profiles(role);
create index if not exists likes_design_idx         on public.likes(design_id);
create index if not exists likes_user_idx           on public.likes(user_id);
create index if not exists designs_featured_idx     on public.designs(featured);
create index if not exists orders_created_at_idx    on public.orders(created_at desc);
create index if not exists orders_user_id_idx       on public.orders(user_id);
