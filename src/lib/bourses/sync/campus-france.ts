import type { Scholarship } from "../../types";
import { resolveStatusFromDeadline } from "../china-deadlines";
import {
  buildCampusBoursesProgramUrl,
  inferFranceDeadlineFromEndAt,
  mapFranceLevels,
} from "../france-deadlines";
import {
  resolveCampusFranceCountries,
  resolveCampusFranceCountryIds,
} from "../france-country-map";

const API_BASE = "https://bourses-api.campusfrance.org";
const HEADERS = {
  Accept: "application/json, text/plain, */*",
  Origin: "https://campusbourses.campusfrance.org",
  Referer: "https://campusbourses.campusfrance.org/",
  "User-Agent": "Mozilla/5.0 (compatible; Aksantiship/1.0)",
};

export interface CampusFranceGrant {
  bourseId: number;
  title: string;
  synthese?: string;
  levelListId?: string;
  countryListId?: string;
  endAt?: string;
  updatedAt?: string;
  hasPriority?: number;
}

interface CampusFranceListResponse {
  op?: number;
  programs?: CampusFranceGrant[];
}

export async function fetchCampusFranceGrants(lang = "fr"): Promise<CampusFranceGrant[]> {
  const url = `${API_BASE}/sgetgrants/lang=${lang}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    throw new Error(`Campus France API (${res.status})`);
  }

  const json = (await res.json()) as CampusFranceListResponse;
  if (json.op !== 1 || !Array.isArray(json.programs)) {
    throw new Error("Réponse Campus France invalide");
  }

  return json.programs;
}

export function campusFranceGrantToScholarship(
  grant: CampusFranceGrant,
  syncedAt: string,
): Scholarship {
  const { cycles, niveaux } = mapFranceLevels(grant.levelListId);
  const nationalitesEligibles = resolveCampusFranceCountries(grant.countryListId);
  const nationalitesEligiblesIds = resolveCampusFranceCountryIds(grant.countryListId);
  const dateCloture = inferFranceDeadlineFromEndAt(grant.endAt);

  const avantages = ["Programme référencé sur CampusBourses (Campus France)"];
  if (grant.synthese) avantages.push(grant.synthese.replace(/\s+/g, " ").trim());

  const conditions: string[] = [];
  if (nationalitesEligibles.length) {
    conditions.push(`Nationalités éligibles : ${nationalitesEligibles.join(", ")}`);
  }
  if (grant.updatedAt) conditions.push(`Dernière mise à jour : ${grant.updatedAt}`);

  return {
    id: `campusfrance-${grant.bourseId}`,
    nom: grant.title.trim(),
    paysHote: "France",
    cyclesFinances: cycles,
    niveauDisponible: niveaux.length ? niveaux : ["Licence / Bachelor", "Master", "Doctorat"],
    dateCloture,
    avantages,
    conditionsEligibilite: conditions.length
      ? conditions
      : ["Critères détaillés sur la fiche CampusBourses."],
    lienOfficiel: buildCampusBoursesProgramUrl(grant.bourseId),
    status: resolveStatusFromDeadline(dateCloture),
    source: "campusfrance",
    syncedAt,
    nationalitesEligibles,
    nationalitesEligiblesIds,
  };
}

export async function fetchCampusFranceScholarships(): Promise<Scholarship[]> {
  const syncedAt = new Date().toISOString();
  const grants = await fetchCampusFranceGrants("fr");
  return grants.map((g) => campusFranceGrantToScholarship(g, syncedAt));
}
