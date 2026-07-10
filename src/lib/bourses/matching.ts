import type { EducationLevel } from "@/lib/education-levels";
import {
  getEducationLevelLabel,
  getEligibleStudyCycles,
  STUDY_CYCLE_LABELS,
} from "@/lib/education-levels";
import type { Scholarship, StudyCycle } from "@/lib/types";
import type { BourseMatchInfo } from "./types";

export function matchScholarshipToEducationLevel(
  niveauEtudes: EducationLevel,
  scholarship: Scholarship,
): BourseMatchInfo {
  const candidateCycles = getEligibleStudyCycles(niveauEtudes);
  const matchingCycles = scholarship.cyclesFinances.filter((c) =>
    candidateCycles.includes(c),
  );

  if (matchingCycles.length === 0) {
    const required = scholarship.cyclesFinances
      .map((c) => STUDY_CYCLE_LABELS[c])
      .join(", ");
    return {
      matches: false,
      matchingCycles: [],
      score: 0,
      reason: `Cycle incompatible. Requis : ${required}. Votre niveau : ${getEducationLevelLabel(niveauEtudes)}.`,
    };
  }

  let score = 50 + matchingCycles.length * 20;
  if (scholarship.status === "encours") score += 5;

  return {
    matches: true,
    matchingCycles,
    score: Math.min(score, 100),
    reason: `Éligible pour : ${matchingCycles.map((c) => STUDY_CYCLE_LABELS[c]).join(", ")}`,
  };
}

export function attachMatchInfo(
  scholarship: Scholarship,
  niveauEtudes: EducationLevel,
): { scholarship: Scholarship; match: BourseMatchInfo } {
  return {
    scholarship,
    match: matchScholarshipToEducationLevel(niveauEtudes, scholarship),
  };
}
