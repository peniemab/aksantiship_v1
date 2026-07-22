import type { User } from "@supabase/supabase-js";
import type { UserAccount } from "@/lib/types";

/** Mappe un user Supabase Auth vers le modèle UI (sans mot de passe). */
export function mapSupabaseUser(authUser: User): UserAccount {
  const meta = authUser.user_metadata ?? {};

  return {
    id: authUser.id,
    email: authUser.email ?? "",
    nom: String(meta.nom ?? ""),
    postNom: String(meta.post_nom ?? meta.postNom ?? ""),
    prenom: String(meta.prenom ?? ""),
    telephone: String(meta.telephone ?? ""),
    password: "", // jamais exposé côté client
    emailVerified: Boolean(authUser.email_confirmed_at),
    createdAt: authUser.created_at ?? new Date().toISOString(),
  };
}
