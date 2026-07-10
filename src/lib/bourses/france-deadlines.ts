import type { ScholarshipStatus, StudyCycle } from "../types";

/** Niveaux CampusBourses (levelListId). */
export const FRANCE_LEVEL_CYCLES: Record<string, StudyCycle[]> = {
  "1": ["undergraduate"],
  "2": ["undergraduate"],
  "3": ["master"],
  "4": ["doctorate"],
};

export const FRANCE_LEVEL_LABELS: Record<string, string> = {
  "1": "Stage / formation courte",
  "2": "Licence / Bachelor",
  "3": "Master",
  "4": "Doctorat / recherche",
};

/** Intensité sync Campus France : pic oct.–janv. (Eiffel, etc.). */
export type FranceSyncIntensity = "frequent" | "weekly" | "monthly";

export function getFranceSyncIntensity(date = new Date()): FranceSyncIntensity {
  const month = date.getMonth() + 1;
  if (month >= 10 || month <= 1) return "frequent";
  if (month >= 2 && month <= 5) return "weekly";
  return "monthly";
}

export function inferFranceDeadlineFromEndAt(endAt?: string): string {
  if (endAt && /^\d{4}-\d{2}-\d{2}$/.test(endAt)) return endAt;
  const year = new Date().getFullYear();
  return `${year}-08-31`;
}

export function mapFranceLevels(levelListId?: string): {
  cycles: StudyCycle[];
  niveaux: string[];
} {
  const ids = (levelListId ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const cycles = new Set<StudyCycle>();
  const niveaux: string[] = [];

  for (const id of ids) {
    for (const cycle of FRANCE_LEVEL_CYCLES[id] ?? ["undergraduate", "master", "doctorate"]) {
      cycles.add(cycle);
    }
    if (FRANCE_LEVEL_LABELS[id]) niveaux.push(FRANCE_LEVEL_LABELS[id]);
  }

  if (cycles.size === 0) {
    return {
      cycles: ["undergraduate", "master", "doctorate"],
      niveaux: ["Licence / Bachelor", "Master", "Doctorat"],
    };
  }

  return { cycles: [...cycles], niveaux };
}

export function buildCampusBoursesProgramUrl(bourseId: number): string {
  const slug = `bc${String(bourseId).padStart(5, "0")}`;
  return `https://campusbourses.campusfrance.org/#/program/${slug}?lang=fr`;
}
