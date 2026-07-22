-- Fix HTTP 500 à l'inscription ("Database error saving new user")
-- À coller dans Supabase → SQL Editor → Run

-- 1) Table d'abord
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

-- 2) Trigger robuste : ne bloque plus l'auth si le profil échoue
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
  on conflict (id) do update set
    email = excluded.email,
    nom = coalesce(nullif(excluded.nom, ''), public.profiles.nom),
    post_nom = coalesce(nullif(excluded.post_nom, ''), public.profiles.post_nom),
    prenom = coalesce(nullif(excluded.prenom, ''), public.profiles.prenom),
    telephone = coalesce(nullif(excluded.telephone, ''), public.profiles.telephone),
    updated_at = now();
  return new;
exception
  when others then
    raise warning 'handle_new_user failed: %', sqlerrm;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3) Permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on table public.profiles to postgres, service_role;
grant select, insert, update on table public.profiles to authenticated;
