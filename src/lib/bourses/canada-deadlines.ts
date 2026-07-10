import type { StudyCycle } from "../types";
import type { CanadaApplicationType } from "./canada-application";

export type CanadaSyncIntensity = "daily" | "weekly" | "monthly";

/** Pic janv.–mars (ÉduCanada) ; sept.–nov. (Pearson, McCall MacBain). */
export function getCanadaSyncIntensity(date = new Date()): CanadaSyncIntensity {
  const month = date.getMonth() + 1;
  if (month >= 1 && month <= 3) return "daily";
  if (month >= 9 && month <= 11) return "daily";
  if (month >= 4 && month <= 8) return "weekly";
  return "monthly";
}

export const EDUCANADA_URL =
  "https://www.educanada.ca/scholarships-bourses/can/institutions/study-in-canada-sep-etudes-au-canada-pct.aspx?lang=fra";

export const UDEM_BOURSES_URL =
  "https://bourses.umontreal.ca/repertoire-des-bourses/?tx_udembourses%5Bdo_search%5D=1&tx_udembourses%5Bmc%5D=&tx_udembourses%5Btp%5D%5B%5D=11";

export const UBC_INTERNATIONAL_AWARDS_URL =
  "https://you.ubc.ca/financial-planning/scholarships-awards-international-students/";

export const UOFT_INTERNATIONAL_AWARDS_URL =
  "https://future.utoronto.ca/scholarships-international-students";

export const MCGILL_ENTRANCE_URL =
  "https://www.mcgill.ca/studentaid/scholarships-aid/future-undergrads/entrance-scholarships";

export const MCGILL_SPECIAL_FUNDING_URL = "https://www.mcgill.ca/studentaid/special-funding";

export const MCGILL_EXTERNAL_AWARDS_URL =
  "https://www.mcgill.ca/studentaid/special-funding/externalawards";

export const ALBERTA_INTL_ENTRANCE_URL =
  "https://www.ualberta.ca/en/admissions/tuition-and-scholarships/international-entrance-scholarships/index.html";

export const ALBERTA_INTL_STUDENTS_URL =
  "https://www.ualberta.ca/en/admissions/how-to-apply/international-students-in-canada.html";

export const WATERLOO_INTL_SCHOLARSHIPS_URL =
  "https://uwaterloo.ca/future-students/financing/international-scholarships";

export const ULaval_INTL_FINANCE_URL =
  "https://www.ulaval.ca/espace-etudiant/bourses-et-aide-financiere/financement-pour-les-etudiantes-et-etudiants-de-linternational";

export const ULaval_BBAF_ADMISSION_URL =
  "https://repertoire.bbaf.ulaval.ca/bourses?keywordsSearch=false&keyWords=&onlyUlBursaries=false&admissionBursary=true&legalStatusCode=2&cycle=&faculty=&start-search=true&lessResults=false";

function nextSeasonDate(month: number, day: number, from = new Date()): string {
  const year = from.getFullYear();
  const candidate = new Date(year, month - 1, day);
  const y = candidate < from ? year + 1 : year;
  return `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function inferCanadaDeadline(
  title: string,
  provider?: string,
  endAt?: string,
): string {
  if (endAt && /^\d{4}-\d{2}-\d{2}/.test(endAt)) {
    return endAt.slice(0, 10);
  }

  const t = title.toLowerCase();
  const p = (provider ?? "").toLowerCase();

  if (t.includes("pearson")) return nextSeasonDate(1, 15);
  if (t.includes("entrance scholarship") || (t.includes("entrance") && p.includes("mcgill"))) {
    return nextSeasonDate(1, 21);
  }
  if (t.includes("faculty of science") && p.includes("waterloo")) return nextSeasonDate(2, 13);
  if (t.includes("black students") && p.includes("waterloo")) return nextSeasonDate(4, 15);
  if (
    t.includes("international distinction") ||
    (t.includes("president") && p.includes("alberta"))
  ) {
    return nextSeasonDate(1, 10);
  }
  if (t.includes("mccall macbain") || t.includes("macbain")) return nextSeasonDate(9, 30);
  if (t.includes("bec") || t.includes("study in canada") || t.includes("études au canada")) {
    return nextSeasonDate(3, 31);
  }
  if (t.includes("elap") || t.includes("leaders émergents")) return nextSeasonDate(3, 31);
  if (t.includes("vanier")) return nextSeasonDate(11, 1);
  if (p.includes("educanada") || p.includes("affaires mondiales")) return nextSeasonDate(3, 31);
  if (t.includes("president") || t.includes("excellence")) return nextSeasonDate(2, 1);
  if (t.includes("master")) return nextSeasonDate(3, 15);
  if (t.includes("doctor") || t.includes("postdoc")) return nextSeasonDate(10, 15);

  return nextSeasonDate(8, 31);
}

export function inferCanadaLevels(title: string): {
  cycles: StudyCycle[];
  niveaux: string[];
} {
  const t = title.toLowerCase();
  const cycles = new Set<StudyCycle>();
  const niveaux: string[] = [];

  if (t.includes("doctor") || t.includes("postdoc") || t.includes("vanier") || t.includes("banting")) {
    cycles.add("doctorate");
    niveaux.push("Doctorat / recherche");
  }
  if (t.includes("master") || t.includes("maîtrise") || t.includes("maitrise")) {
    cycles.add("master");
    niveaux.push("Master");
  }
  if (
    t.includes("undergraduate") ||
    t.includes("bachelor") ||
    t.includes("baccalauréat") ||
    t.includes("licence") ||
    t.includes("pearson")
  ) {
    cycles.add("undergraduate");
    niveaux.push("Licence / Bachelor");
  }

  if (cycles.size === 0) {
    return {
      cycles: ["undergraduate", "master", "doctorate"],
      niveaux: ["Licence / Bachelor", "Master", "Doctorat"],
    };
  }

  return { cycles: [...cycles], niveaux };
}

export function inferCanadaApplicationType(
  title: string,
  provider?: string,
  source?: string,
): { typeCandidature: CanadaApplicationType; attributionAutomatiqueAdmission: boolean } {
  const t = title.toLowerCase();
  const p = (provider ?? "").toLowerCase();

  if (
    t.includes("pearson") ||
    t.includes("president") ||
    t.includes("one-year entrance") ||
    t.includes("automatically considered") ||
    t.includes("automatic") ||
    t.includes("à l'admission") ||
    t.includes("admission automatique") ||
    (p.includes("université") && t.includes("excellence"))
  ) {
    return { typeCandidature: "automatique_admission", attributionAutomatiqueAdmission: true };
  }

  if (
    t.includes("bec") ||
    t.includes("study in canada") ||
    t.includes("études au canada") ||
    t.includes("elap") ||
    t.includes("leaders émergents") ||
    p.includes("educanada") ||
    p.includes("affaires mondiales")
  ) {
    return { typeCandidature: "via_etablissement", attributionAutomatiqueAdmission: false };
  }

  if (source === "umontreal") {
    return { typeCandidature: "directe", attributionAutomatiqueAdmission: false };
  }

  return { typeCandidature: "directe", attributionAutomatiqueAdmission: false };
}

export function slugifyCanadaTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

export function parseUdemIsoDate(raw?: string): string | undefined {
  if (!raw) return undefined;
  const m = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  return m?.[1];
}
