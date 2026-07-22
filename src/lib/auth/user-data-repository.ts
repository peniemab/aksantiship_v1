import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AccompanimentRequest,
  CandidateProfile,
  Subscription,
  UserAccount,
} from "@/lib/types";

/** Données métier liées au compte (hors auth.users). */
export interface UserData {
  profile: CandidateProfile | null;
  subscription: Subscription | null;
  accompaniments: AccompanimentRequest[];
  pendingProfile: CandidateProfile | null;
}

interface ProfileRow {
  candidate_profile: CandidateProfile | null;
  pending_candidate_profile: CandidateProfile | null;
  subscription: Subscription | null;
}

interface AccompanimentRow {
  id: string;
  user_id: string;
  nom_prenom: string;
  email: string;
  whatsapp: string;
  bourse_id: string;
  bourse_nom: string;
  paid: boolean;
  created_at: string;
}

function mapAccompanimentRow(row: AccompanimentRow): AccompanimentRequest {
  return {
    id: row.id,
    nomPrenom: row.nom_prenom,
    email: row.email,
    whatsapp: row.whatsapp,
    bourseId: row.bourse_id,
    bourseNom: row.bourse_nom,
    paid: row.paid,
    createdAt: row.created_at,
  };
}

/** Crée la ligne `profiles` si absente (filet de sécurité hors trigger SQL). */
export async function ensureProfile(
  supabase: SupabaseClient,
  user: UserAccount,
): Promise<void> {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      nom: user.nom,
      post_nom: user.postNom,
      prenom: user.prenom,
      telephone: user.telephone,
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error(error.message);
  }
}

/** Charge profil + abo + accompagnements (RLS = user connecté uniquement). */
export async function fetchUserData(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserData> {
  const [profileResult, accompanimentsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("candidate_profile, pending_candidate_profile, subscription")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("accompaniment_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  if (profileResult.error) {
    throw new Error(profileResult.error.message);
  }
  if (accompanimentsResult.error) {
    throw new Error(accompanimentsResult.error.message);
  }

  const row = profileResult.data as ProfileRow | null;

  return {
    profile: row?.candidate_profile ?? null,
    pendingProfile: row?.pending_candidate_profile ?? null,
    subscription: row?.subscription ?? null,
    accompaniments: (accompanimentsResult.data ?? []).map((r) =>
      mapAccompanimentRow(r as AccompanimentRow),
    ),
  };
}

/** Brouillon profil avant paiement. */
export async function savePendingProfile(
  supabase: SupabaseClient,
  userId: string,
  profile: CandidateProfile,
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ pending_candidate_profile: profile })
    .eq("id", userId);

  if (error) throw new Error(error.message);
}

/** Après paiement : pending → profil officiel. */
export async function saveCandidateProfile(
  supabase: SupabaseClient,
  userId: string,
  profile: CandidateProfile,
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({
      candidate_profile: profile,
      pending_candidate_profile: null,
    })
    .eq("id", userId);

  if (error) throw new Error(error.message);
}

export async function saveSubscription(
  supabase: SupabaseClient,
  userId: string,
  subscription: Subscription,
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ subscription })
    .eq("id", userId);

  if (error) throw new Error(error.message);
}

export async function insertAccompaniment(
  supabase: SupabaseClient,
  userId: string,
  request: Omit<AccompanimentRequest, "id" | "paid" | "createdAt">,
): Promise<AccompanimentRequest> {
  const { data, error } = await supabase
    .from("accompaniment_requests")
    .insert({
      user_id: userId,
      nom_prenom: request.nomPrenom,
      email: request.email,
      whatsapp: request.whatsapp,
      bourse_id: request.bourseId,
      bourse_nom: request.bourseNom,
      paid: false,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Insertion accompagnement impossible.");
  }

  return mapAccompanimentRow(data as AccompanimentRow);
}

export async function markAccompanimentPaid(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("accompaniment_requests")
    .update({ paid: true })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}
