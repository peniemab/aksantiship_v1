import type { User } from "@supabase/supabase-js";
import type { UserAccount } from "@/lib/types";

export function mapSupabaseUser(authUser: User): UserAccount {
  const meta = authUser.user_metadata ?? {};

  return {
    id: authUser.id,
    email: authUser.email ?? "",
    nom: String(meta.nom ?? ""),
    postNom: String(meta.post_nom ?? meta.postNom ?? ""),
    prenom: String(meta.prenom ?? ""),
    telephone: String(meta.telephone ?? ""),
    password: "",
    emailVerified: Boolean(authUser.email_confirmed_at),
    createdAt: authUser.created_at ?? new Date().toISOString(),
  };
}
