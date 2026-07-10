import type { ActivityStatus, DiplomaLevel } from "./types";

/**
 * Cycles d'études selon la norme internationale (Undergraduate / Graduate / Doctorate)
 * utilisée par les programmes de bourses (Campus France, Chevening, MEXT, etc.)
 */
export type StudyCycle = "undergraduate" | "master" | "doctorate";

/**
 * Niveau d'études actuel du candidat — aligné sur les critères d'éligibilité
 * des bourses internationales (Bachelor / Master / PhD).
 */
export type EducationLevel =
  | "finaliste"
  | "secondary_diplome"
  | "undergraduate"
  | "bachelor"
  | "master_student"
  | "master"
  | "doctorate_student"
  | "doctorate";

export type CandidatCategory = "finaliste" | "etudiant_encours" | "diplome";

export const EDUCATION_LEVEL_RANK: Record<EducationLevel, number> = {
  finaliste: 1,
  secondary_diplome: 2,
  undergraduate: 3,
  bachelor: 4,
  master_student: 5,
  master: 6,
  doctorate_student: 7,
  doctorate: 8,
};

export const EDUCATION_LEVEL_OPTIONS: {
  value: EducationLevel;
  label: string;
  description: string;
  isced: string;
}[] = [
  {
    value: "finaliste",
    label: "Finaliste (Bachelier)",
    description: "Dernière année du secondaire, en cours d'obtention du bac",
    isced: "ISCED 3, Upper secondary",
  },
  {
    value: "secondary_diplome",
    label: "Bachelier / Diplômé du secondaire",
    description: "Bac obtenu, pas encore inscrit à l'université",
    isced: "ISCED 3, Secondary completed",
  },
  {
    value: "undergraduate",
    label: "Étudiant Licence / Bachelor (en cours)",
    description: "Premier cycle universitaire en cours",
    isced: "ISCED 6, Undergraduate",
  },
  {
    value: "bachelor",
    label: "Licence / Bachelor (diplômé)",
    description: "Premier cycle universitaire terminé",
    isced: "ISCED 6, Bachelor's degree",
  },
  {
    value: "master_student",
    label: "Étudiant Master (en cours)",
    description: "Deuxième cycle universitaire en cours",
    isced: "ISCED 7, Master's in progress",
  },
  {
    value: "master",
    label: "Master (diplômé)",
    description: "Deuxième cycle universitaire terminé",
    isced: "ISCED 7, Master's degree",
  },
  {
    value: "doctorate_student",
    label: "Doctorat / PhD (en cours)",
    description: "Troisième cycle universitaire en cours",
    isced: "ISCED 8, Doctoral in progress",
  },
  {
    value: "doctorate",
    label: "Doctorat / PhD (diplômé)",
    description: "Troisième cycle universitaire terminé",
    isced: "ISCED 8, Doctoral degree",
  },
];

export const STUDY_CYCLE_LABELS: Record<StudyCycle, string> = {
  undergraduate: "Licence / Bachelor (Undergraduate)",
  master: "Master (Graduate)",
  doctorate: "Doctorat / PhD",
};

export function getEducationLevelLabel(level: EducationLevel): string {
  return EDUCATION_LEVEL_OPTIONS.find((o) => o.value === level)?.label ?? level;
}

export function getCandidatCategory(level: EducationLevel): CandidatCategory {
  if (level === "finaliste" || level === "secondary_diplome") return "finaliste";
  if (level === "undergraduate" || level === "master_student" || level === "doctorate_student") {
    return "etudiant_encours";
  }
  return "diplome";
}

export function getCandidatCategoryLabel(cat: CandidatCategory): string {
  const labels: Record<CandidatCategory, string> = {
    finaliste: "Finaliste (Bachelier)",
    etudiant_encours: "Étudiant (en cours)",
    diplome: "Diplômé",
  };
  return labels[cat];
}

/** Cycles de bourse auxquels le candidat peut postuler selon son niveau */
export function getEligibleStudyCycles(level: EducationLevel): StudyCycle[] {
  const rank = EDUCATION_LEVEL_RANK[level];
  const cycles: StudyCycle[] = [];

  // Undergraduate : finaliste → étudiant licence en cours
  if (rank >= 1 && rank <= 3) cycles.push("undergraduate");
  // Master : licence obtenue ou master en cours
  if (rank >= 4 && rank <= 5) cycles.push("master");
  // Doctorat : master obtenu minimum
  if (rank >= 6) cycles.push("doctorate");

  return cycles;
}

/** Suggestion automatique à partir du dernier diplôme et de l'activité */
export function suggestEducationLevel(
  dernierDiplome: DiplomaLevel,
  activite: ActivityStatus,
): EducationLevel {
  if (dernierDiplome === "certificat_primaire") return "finaliste";

  if (dernierDiplome === "bac") {
    if (activite === "etudiant") return "undergraduate";
    if (activite === "eleve") return "finaliste";
    return "secondary_diplome";
  }

  if (dernierDiplome === "licence") {
    if (activite === "etudiant") return "master_student";
    return "bachelor";
  }

  if (dernierDiplome === "master") {
    if (activite === "etudiant") return "doctorate_student";
    return "master";
  }

  return "secondary_diplome";
}
