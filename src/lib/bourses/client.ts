import type {
  BourseDetailResponse,
  BoursesListResponse,
  BoursesQueryParams,
} from "@/lib/bourses/types";

function toSearchParams(params: BoursesQueryParams): string {
  const sp = new URLSearchParams();
  if (params.status) sp.set("status", params.status);
  if (params.featured) sp.set("featured", "true");
  if (params.niveauEtudes) sp.set("niveauEtudes", params.niveauEtudes);
  if (params.matchOnly) sp.set("matchOnly", "true");
  if (params.includeMatch) sp.set("includeMatch", "true");
  if (params.q) sp.set("q", params.q);
  if (params.pays) sp.set("pays", params.pays);
  if (params.cycle) sp.set("cycle", params.cycle);
  if (params.nationalite) sp.set("nationalite", params.nationalite);
  if (params.langue) sp.set("langue", params.langue);
  if (params.communaute) sp.set("communaute", params.communaute);
  if (params.langueEnseignement) sp.set("langueEnseignement", params.langueEnseignement);
  if (params.typeCandidature) sp.set("typeCandidature", params.typeCandidature);
  return sp.toString();
}

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? `Erreur API (${res.status})`,
    );
  }
  return res.json() as Promise<T>;
}

/** Client navigateur — consomme l'API interne /api/bourses */
export async function fetchBourses(
  params: BoursesQueryParams = {},
): Promise<BoursesListResponse> {
  const qs = toSearchParams(params);
  const url = qs ? `/api/bourses?${qs}` : "/api/bourses";
  const res = await fetch(url, { cache: "no-store" });
  return parseJson<BoursesListResponse>(res);
}

export async function fetchBourseById(
  id: string,
  niveauEtudes?: BoursesQueryParams["niveauEtudes"],
): Promise<BourseDetailResponse> {
  const sp = new URLSearchParams();
  if (niveauEtudes) sp.set("niveauEtudes", niveauEtudes);
  const qs = sp.toString();
  const url = qs ? `/api/bourses/${id}?${qs}` : `/api/bourses/${id}`;
  const res = await fetch(url, { cache: "no-store" });
  return parseJson<BourseDetailResponse>(res);
}
