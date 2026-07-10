import type { StudyCycle } from "../types";

export type JapanSyncIntensity = "daily" | "weekly" | "monthly";

export const STUDY_IN_JAPAN_SCHOLARSHIPS_URL =
  "https://www.studyinjapan.go.jp/fr/planning/scholarships/";

export const MEXT_SCHOLARSHIPS_URL =
  "https://www.studyinjapan.go.jp/fr/planning/scholarships/mext-scholarships/";

export const JASSO_SCHOLARSHIPS_URL =
  "https://www.studyinjapan.go.jp/fr/planning/scholarships/jasso-scholarships/";

export const OTHER_SCHOLARSHIPS_URL =
  "https://www.studyinjapan.go.jp/fr/planning/scholarships/other-scholarships/";

export const JASSO_PAMPHLET_URL =
  "https://www.studyinjapan.go.jp/en/assets/pdf/scholarship_pamphlet_en.pdf";

export const JPSS_SCHOLARSHIPS_URL = "https://www.jpss.jp/en/scholarship/";

/** Pic avril–mai (ambassades MEXT) ; juin–sept. (universités) ; sept.–janv. (fondations). */
export function getJapanSyncIntensity(date = new Date()): JapanSyncIntensity {
  const month = date.getMonth() + 1;
  if (month >= 4 && month <= 5) return "daily";
  if (month >= 6 && month <= 9) return "daily";
  if (month >= 10 || month <= 1) return "weekly";
  return "monthly";
}

function nextSeasonDate(month: number, day: number, from = new Date()): string {
  const year = from.getFullYear();
  const candidate = new Date(year, month - 1, day);
  const y = candidate < from ? year + 1 : year;
  return `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function inferJapanDeadline(
  title: string,
  organisme?: string,
  explicit?: string,
): string {
  if (explicit && /^\d{4}-\d{2}-\d{2}/.test(explicit)) {
    return explicit.slice(0, 10);
  }

  const t = title.toLowerCase();
  const o = (organisme ?? "").toLowerCase();

  if (t.includes("hokkaido")) return nextSeasonDate(9, 1);
  if (t.includes("honjo")) return nextSeasonDate(10, 31);
  if (t.includes("yoneyama") || t.includes("rotary")) return nextSeasonDate(10, 31);
  if (t.includes("nitori")) return nextSeasonDate(11, 30);
  if (t.includes("mufj") || t.includes("mitsubishi")) return nextSeasonDate(3, 31);

  if (
    t.includes("mext") &&
    (t.includes("université") ||
      t.includes("university") ||
      o.includes("université") ||
      o.includes("university"))
  ) {
    return nextSeasonDate(9, 1);
  }

  if (t.includes("mext") || o.includes("mext") || o.includes("ambassade")) {
    return nextSeasonDate(5, 31);
  }

  if (t.includes("jasso") || o.includes("jasso")) return nextSeasonDate(3, 31);

  if (t.includes("pamphlet") || t.includes("jpss") || t.includes("portail")) {
    return nextSeasonDate(12, 31);
  }

  return nextSeasonDate(8, 31);
}

export function inferJapanLevels(title: string): {
  cycles: StudyCycle[];
  niveaux: string[];
} {
  const t = title.toLowerCase();
  const cycles = new Set<StudyCycle>();
  const niveaux: string[] = [];

  if (
    t.includes("research") ||
    t.includes("recherche") ||
    t.includes("doctor") ||
    t.includes("ylp") ||
    t.includes("young leaders")
  ) {
    cycles.add("doctorate");
    cycles.add("master");
    niveaux.push("Master", "Doctorat / recherche");
  }
  if (t.includes("undergraduate") || t.includes("licence") || t.includes("premier cycle")) {
    cycles.add("undergraduate");
    niveaux.push("Licence / Bachelor");
  }
  if (t.includes("master") && !t.includes("premier")) {
    cycles.add("master");
    if (!niveaux.includes("Master")) niveaux.push("Master");
  }
  if (t.includes("kosen") || t.includes("technique") || t.includes("specialized")) {
    cycles.add("undergraduate");
    niveaux.push("Formation technique / spécialisée");
  }
  if (t.includes("teacher") || t.includes("enseignant")) {
    cycles.add("master");
    niveaux.push("Formation d'enseignants");
  }
  if (t.includes("japanese studies") || t.includes("langue japonaise")) {
    cycles.add("undergraduate");
    niveaux.push("Langue et culture japonaises");
  }

  if (cycles.size === 0) {
    return {
      cycles: ["undergraduate", "master", "doctorate"],
      niveaux: ["Licence / Bachelor", "Master", "Doctorat"],
    };
  }

  return { cycles: [...cycles], niveaux };
}

export function slugifyJapanTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}
