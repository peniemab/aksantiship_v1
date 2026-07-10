import type { Scholarship } from "../types";

/** Types de candidature canadiens (directe, via établissement, automatique). */
export type CanadaApplicationType = "directe" | "via_etablissement" | "automatique_admission";

export const CANADA_APPLICATION_LABELS: Record<CanadaApplicationType, string> = {
  directe: "Candidature directe",
  via_etablissement: "Candidature via l'université",
  automatique_admission: "Attribution automatique à l'admission",
};

export const CANADA_APPLICATION_BADGE_CLASS: Record<CanadaApplicationType, string> = {
  directe: "bg-blue-100 text-blue-800",
  via_etablissement: "bg-purple-100 text-purple-800",
  automatique_admission: "bg-teal-100 text-teal-800",
};

export function resolveCanadaApplicationType(
  scholarship: Pick<Scholarship, "typeCandidature" | "attributionAutomatiqueAdmission">,
): CanadaApplicationType | null {
  if (scholarship.attributionAutomatiqueAdmission) return "automatique_admission";
  if (scholarship.typeCandidature === "via_etablissement") return "via_etablissement";
  if (scholarship.typeCandidature === "directe") return "directe";
  if (scholarship.typeCandidature === "automatique_admission") return "automatique_admission";
  return null;
}

export function getScholarshipOfficialLinkLabel(
  scholarship: Pick<Scholarship, "typeCandidature" | "attributionAutomatiqueAdmission" | "paysHote">,
): string {
  if (scholarship.paysHote !== "Canada") {
    return "Lien officiel pour candidater →";
  }
  const type = resolveCanadaApplicationType(scholarship);
  if (type === "automatique_admission") {
    return "Voir les critères d'admission →";
  }
  if (type === "via_etablissement") {
    return "Consulter le processus via l'établissement →";
  }
  return "Lien officiel pour candidater →";
}

export function showsDirectApplicationLink(
  scholarship: Pick<Scholarship, "typeCandidature" | "attributionAutomatiqueAdmission" | "paysHote">,
): boolean {
  if (scholarship.paysHote !== "Canada") return true;
  return resolveCanadaApplicationType(scholarship) === "directe" || !resolveCanadaApplicationType(scholarship);
}
