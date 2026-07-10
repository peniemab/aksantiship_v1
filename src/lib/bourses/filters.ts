import type { Scholarship, StudyCycle } from "@/lib/types";
import type { ScholarshipMatch } from "@/lib/matching";
import { matchesNationalityFilter } from "@/lib/bourses/france-country-map";

export interface BourseSearchFilters {
  query?: string;
  pays?: string;
  cycle?: StudyCycle | "all";
  nationalite?: string;
  langue?: string;
  communaute?: string;
  langueEnseignement?: string;
  typeCandidature?: string;
}

export type BourseSortOption = "score_desc" | "date_asc" | "date_desc" | "name_asc";

export const BOURSE_SORT_LABELS: Record<BourseSortOption, string> = {
  score_desc: "Compatibilité (meilleure d'abord)",
  date_asc: "Date de clôture (proche d'abord)",
  date_desc: "Date de clôture (lointaine d'abord)",
  name_asc: "Nom (A → Z)",
};

export const BOURSE_LANGUAGE_OPTIONS = [
  { value: "", label: "Toutes les langues" },
  { value: "Anglais", label: "Anglais" },
  { value: "Allemand", label: "Allemand" },
] as const;

export const BOURSE_INSTRUCTION_LANGUAGE_OPTIONS = [
  { value: "", label: "Toutes les langues" },
  { value: "Français", label: "Français" },
  { value: "Néerlandais", label: "Néerlandais" },
  { value: "Anglais", label: "Anglais" },
] as const;

export const BOURSE_COMMUNITY_OPTIONS = [
  { value: "", label: "Toutes les communautés" },
  { value: "Fédération Wallonie-Bruxelles", label: "Wallonie-Bruxelles (francophone)" },
  { value: "Flandre", label: "Flandre (néerlandophone)" },
] as const;

export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function matchesLanguageFilter(
  langues: string[] | undefined,
  filter: string,
): boolean {
  if (!filter.trim()) return true;
  if (!langues?.length) return true;

  const q = filter.trim().toLowerCase();
  return langues.some(
    (l) =>
      l.toLowerCase().includes(q) ||
      q.includes(l.toLowerCase()) ||
      (q === "anglais" && l.toLowerCase().includes("english")) ||
      (q === "allemand" && l.toLowerCase().includes("german")),
  );
}

export function matchesInstructionLanguageFilter(
  langue: string | undefined,
  filter: string,
): boolean {
  if (!filter.trim()) return true;
  if (!langue?.trim()) return false;

  const q = filter.trim().toLowerCase();
  const l = langue.toLowerCase();
  return l.includes(q) || q.includes(l);
}

export function matchesCommunauteFilter(
  communaute: string | undefined,
  filter: string,
): boolean {
  if (!filter.trim()) return true;
  if (!communaute?.trim()) return false;

  const q = filter.trim().toLowerCase();
  const c = communaute.toLowerCase();
  return c.includes(q) || q.includes(c);
}

export const BOURSE_CANADA_APPLICATION_OPTIONS = [
  { value: "", label: "Tous les modes de candidature" },
  { value: "directe", label: "Candidature directe" },
  { value: "via_etablissement", label: "Via l'université" },
  { value: "automatique_admission", label: "Automatique à l'admission" },
] as const;

export function matchesTypeCandidatureFilter(
  scholarship: Pick<Scholarship, "typeCandidature" | "attributionAutomatiqueAdmission">,
  filter: string,
): boolean {
  if (!filter.trim()) return true;

  if (filter === "automatique_admission") {
    return (
      scholarship.attributionAutomatiqueAdmission === true ||
      scholarship.typeCandidature === "automatique_admission"
    );
  }

  return scholarship.typeCandidature === filter;
}

export function filterScholarshipsBySearch<
  T extends Pick<
    Scholarship,
    | "nom"
    | "paysHote"
    | "niveauDisponible"
    | "avantages"
    | "cyclesFinances"
    | "nationalitesEligibles"
    | "languesRequises"
    | "langueEnseignement"
    | "communaute"
    | "typeCandidature"
    | "attributionAutomatiqueAdmission"
  >,
>(scholarships: T[], filters: BourseSearchFilters): T[] {
  const q = filters.query ? normalizeSearchQuery(filters.query) : "";
  const pays = filters.pays?.trim();
  const cycle = filters.cycle;
  const nationalite = filters.nationalite?.trim();
  const langue = filters.langue?.trim();
  const communaute = filters.communaute?.trim();
  const langueEnseignement = filters.langueEnseignement?.trim();
  const typeCandidature = filters.typeCandidature?.trim();

  return scholarships.filter((s) => {
    if (pays && pays !== "all" && s.paysHote !== pays) return false;
    if (cycle && cycle !== "all" && !s.cyclesFinances.includes(cycle)) return false;
    if (nationalite && !matchesNationalityFilter(s.nationalitesEligibles, nationalite)) {
      return false;
    }
    if (langue && !matchesLanguageFilter(s.languesRequises, langue)) {
      return false;
    }
    if (communaute && !matchesCommunauteFilter(s.communaute, communaute)) {
      return false;
    }
    if (
      langueEnseignement &&
      !matchesInstructionLanguageFilter(s.langueEnseignement, langueEnseignement)
    ) {
      return false;
    }
    if (typeCandidature && !matchesTypeCandidatureFilter(s, typeCandidature)) {
      return false;
    }
    if (!q) return true;

    const haystack = [
      s.nom,
      s.paysHote,
      ...s.niveauDisponible,
      ...s.avantages,
      ...(s.nationalitesEligibles ?? []),
      ...(s.languesRequises ?? []),
      s.langueEnseignement ?? "",
      s.communaute ?? "",
      s.typeCandidature ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}

export function hasActiveBourseFilters(filters: BourseSearchFilters): boolean {
  return Boolean(
    filters.query?.trim() ||
      (filters.pays && filters.pays !== "all") ||
      (filters.cycle && filters.cycle !== "all") ||
      filters.nationalite?.trim() ||
      filters.langue?.trim() ||
      filters.communaute?.trim() ||
      filters.langueEnseignement?.trim() ||
      filters.typeCandidature?.trim(),
  );
}

export function sortScholarshipMatches(
  matches: ScholarshipMatch[],
  sortBy: BourseSortOption,
): ScholarshipMatch[] {
  const copy = [...matches];

  switch (sortBy) {
    case "score_desc":
      return copy.sort((a, b) => b.score - a.score);
    case "date_asc":
      return copy.sort((a, b) =>
        a.scholarship.dateCloture.localeCompare(b.scholarship.dateCloture),
      );
    case "date_desc":
      return copy.sort((a, b) =>
        b.scholarship.dateCloture.localeCompare(a.scholarship.dateCloture),
      );
    case "name_asc":
      return copy.sort((a, b) =>
        a.scholarship.nom.localeCompare(b.scholarship.nom, "fr"),
      );
    default:
      return copy;
  }
}

export function sortScholarships<T extends Pick<Scholarship, "nom" | "dateCloture">>(
  scholarships: T[],
  sortBy: Exclude<BourseSortOption, "score_desc"> | "name_asc" | "date_asc" | "date_desc",
): T[] {
  const copy = [...scholarships];

  switch (sortBy) {
    case "date_asc":
      return copy.sort((a, b) => a.dateCloture.localeCompare(b.dateCloture));
    case "date_desc":
      return copy.sort((a, b) => b.dateCloture.localeCompare(a.dateCloture));
    case "name_asc":
      return copy.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
    default:
      return copy;
  }
}
