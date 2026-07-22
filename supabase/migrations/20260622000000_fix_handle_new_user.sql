-- Fix trigger inscription : permissions + erreurs silencieuses
-- À lancer dans Supabase → SQL Editor si "Database error saving new user"

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
    -- Ne bloque pas l'auth si le profil échoue (ensureProfile côté app rattrape)
    raise warning 'handle_new_user failed: %', sqlerrm;
    return new;
end;
$$;

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on table public.profiles to postgres, service_role;
grant select, insert, update on table public.profiles to authenticated;
