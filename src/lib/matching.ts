import type { EducationLevel } from "./education-levels";
import {
  EDUCATION_LEVEL_RANK,
  getCandidatCategory,
  getCandidatCategoryLabel,
  getEducationLevelLabel,
  getEligibleStudyCycles,
  STUDY_CYCLE_LABELS,
  suggestEducationLevel,
} from "./education-levels";
import type { CandidateProfile, Scholarship, StudyCycle } from "./types";

export interface ScholarshipMatch {
  scholarship: Scholarship;
  matches: boolean;
  matchingCycles: StudyCycle[];
  score: number;
  reason: string;
}

export interface ProfileAnalysis {
  niveauEtudes: EducationLevel;
  niveauLabel: string;
  categorie: ReturnType<typeof getCandidatCategory>;
  categorieLabel: string;
  cyclesEligibles: StudyCycle[];
  cyclesEligiblesLabels: string[];
  totalOpportunities: number;
  matchingOpportunities: number;
  byStatus: {
    encours: number;
    a_venir: number;
    fermee: number;
  };
  strengths: string[];
  recommendations: string[];
}

export function resolveEducationLevel(profile: CandidateProfile): EducationLevel {
  if (profile.niveauEtudes) return profile.niveauEtudes;
  return suggestEducationLevel(profile.dernierDiplome, profile.activiteEnCours);
}

export function matchScholarshipToProfile(
  profile: CandidateProfile,
  scholarship: Scholarship,
): ScholarshipMatch {
  const niveau = resolveEducationLevel(profile);
  const candidateCycles = getEligibleStudyCycles(niveau);
  const matchingCycles = scholarship.cyclesFinances.filter((c) =>
    candidateCycles.includes(c),
  );

  if (matchingCycles.length === 0) {
    const required = scholarship.cyclesFinances
      .map((c) => STUDY_CYCLE_LABELS[c])
      .join(", ");
    return {
      scholarship,
      matches: false,
      matchingCycles: [],
      score: 0,
      reason: `Cette bourse finance un cycle (${required}) incompatible avec votre niveau actuel (${getEducationLevelLabel(niveau)}).`,
    };
  }

  let score = 50 + matchingCycles.length * 20;

  if (profile.moyenneDernierDiplome && profile.moyenneDernierDiplome >= 70) score += 10;
  if (profile.passeport) score += 5;
  if (profile.certificatLangue !== "Aucun") score += 10;
  if (scholarship.status === "encours") score += 5;

  return {
    scholarship,
    matches: true,
    matchingCycles,
    score: Math.min(score, 100),
    reason: `Éligible pour : ${matchingCycles.map((c) => STUDY_CYCLE_LABELS[c]).join(", ")}`,
  };
}

export function filterScholarshipsForProfile(
  profile: CandidateProfile,
  scholarships: Scholarship[],
  options?: { status?: Scholarship["status"]; onlyMatches?: boolean },
): ScholarshipMatch[] {
  let results = scholarships.map((s) => matchScholarshipToProfile(profile, s));

  if (options?.status) {
    results = results.filter((r) => r.scholarship.status === options.status);
  }

  if (options?.onlyMatches) {
    results = results.filter((r) => r.matches);
  }

  return results.sort((a, b) => b.score - a.score);
}

export function analyzeProfile(
  profile: CandidateProfile,
  scholarships: Scholarship[],
): ProfileAnalysis {
  const niveau = resolveEducationLevel(profile);
  const categorie = getCandidatCategory(niveau);
  const cyclesEligibles = getEligibleStudyCycles(niveau);
  const matches = filterScholarshipsForProfile(profile, scholarships, { onlyMatches: true });

  const strengths: string[] = [];
  const recommendations: string[] = [];

  strengths.push(`Catégorie : ${getCandidatCategoryLabel(categorie)}`);
  strengths.push(`Niveau international : ${getEducationLevelLabel(niveau)}`);
  strengths.push(
    `Cycles accessibles : ${cyclesEligibles.map((c) => STUDY_CYCLE_LABELS[c]).join(", ")}`,
  );

  if (profile.moyenneDernierDiplome && profile.moyenneDernierDiplome >= 70) {
    strengths.push(`Excellente moyenne académique (${profile.moyenneDernierDiplome}%)`);
  }
  if (profile.passeport) strengths.push("Passeport disponible");
  if (profile.certificatLangue !== "Aucun") {
    strengths.push(`Certificat de langue : ${profile.certificatLangue}`);
  }

  if (!profile.passeport) {
    recommendations.push("Obtenez un passeport pour élargir vos opportunités internationales.");
  }
  if (profile.certificatLangue === "Aucun") {
    recommendations.push("Préparez un certificat de langue (IELTS, TOEFL) pour renforcer votre dossier.");
  }
  if (EDUCATION_LEVEL_RANK[niveau] < 4) {
    recommendations.push(
      "Les bourses Master et Doctorat nécessitent au minimum une Licence/Bachelor. Concentrez-vous sur les bourses Undergraduate.",
    );
  }

  const byStatus = {
    encours: matches.filter((m) => m.scholarship.status === "encours").length,
    a_venir: matches.filter((m) => m.scholarship.status === "a_venir").length,
    fermee: matches.filter((m) => m.scholarship.status === "fermee").length,
  };

  return {
    niveauEtudes: niveau,
    niveauLabel: getEducationLevelLabel(niveau),
    categorie,
    categorieLabel: getCandidatCategoryLabel(categorie),
    cyclesEligibles,
    cyclesEligiblesLabels: cyclesEligibles.map((c) => STUDY_CYCLE_LABELS[c]),
    totalOpportunities: scholarships.length,
    matchingOpportunities: matches.length,
    byStatus,
    strengths,
    recommendations,
  };
}
