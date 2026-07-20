-- Aksantiship baseline — profils candidats, abonnements, accompagnements
-- Migration initiale (auth.users → profiles + RLS)

-- ---------------------------------------------------------------------------
-- Profils (1 ligne par utilisateur auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  nom text not null default '',
  post_nom text not null default '',
  prenom text not null default '',
  telephone text not null default '',
  candidate_profile jsonb,
  pending_candidate_profile jsonb,
  subscription jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Demandes d'accompagnement
-- ---------------------------------------------------------------------------
create table if not exists public.accompaniment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nom_prenom text not null,
  email text not null,
  whatsapp text not null,
  bourse_id text not null,
  bourse_nom text not null,
  paid boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists accompaniment_requests_user_id_idx
  on public.accompaniment_requests (user_id);

alter table public.accompaniment_requests enable row level security;

drop policy if exists "accompaniment_select_own" on public.accompaniment_requests;
create policy "accompaniment_select_own"
  on public.accompaniment_requests for select
  using (auth.uid() = user_id);

drop policy if exists "accompaniment_insert_own" on public.accompaniment_requests;
create policy "accompaniment_insert_own"
  on public.accompaniment_requests for insert
  with check (auth.uid() = user_id);

drop policy if exists "accompaniment_update_own" on public.accompaniment_requests;
create policy "accompaniment_update_own"
  on public.accompaniment_requests for update
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Trigger : profil auto à l'inscription
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, nom, post_nom, prenom, telephone)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'nom', ''),
    coalesce(new.raw_user_meta_data->>'post_nom', ''),
    coalesce(new.raw_user_meta_data->>'prenom', ''),
    coalesce(new.raw_user_meta_data->>'telephone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- updated_at automatique sur profiles
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
