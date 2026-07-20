# Migrations Supabase — Aksantiship

Les fichiers SQL sont versionnés par date (`YYYYMMDDHHMMSS_nom.sql`) et appliqués dans l'ordre.

## Projet Supabase vide (première fois)

**Option A — SQL Editor (dashboard)**

1. Ouvrir Supabase → **SQL Editor**
2. Copier-coller le contenu de `20260617000000_baseline_profiles.sql`
3. **Run**

**Option B — Supabase CLI**

```bash
supabase link --project-ref nwweldoucnbmgbbrnbiu
supabase db push
```

## Nouvelle migration

1. Créer un fichier : `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
2. Ne jamais modifier une migration déjà appliquée en prod — ajouter un nouveau fichier
3. Appliquer via SQL Editor ou `supabase db push`

## Fichiers actuels

| Migration | Contenu |
|-----------|---------|
| `20260617000000_baseline_profiles.sql` | Tables `profiles`, `accompaniment_requests`, RLS, triggers auth |
