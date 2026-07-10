import type { StudyCycle } from "../types";

export type GermanySyncIntensity = "frequent" | "weekly" | "monthly";

/** Pic juillet–octobre (Deutschlandstipendium, fondations) et octobre–janvier (DAAD master). */
export function getGermanySyncIntensity(date = new Date()): GermanySyncIntensity {
  const month = date.getMonth() + 1;
  if (month >= 7 && month <= 10) return "frequent";
  if (month >= 11 || month <= 1) return "frequent";
  if (month >= 2 && month <= 6) return "weekly";
  return "monthly";
}

export function slugifyDaadTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

export function buildDaadSearchUrl(title: string): string {
  const q = encodeURIComponent(title);
  return `https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?q=${q}&status=1&page=1`;
}

export const DAAD_CATALOG_URL =
  "https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/";

function nextSeasonDate(month: number, day: number, from = new Date()): string {
  const year = from.getFullYear();
  const candidate = new Date(year, month - 1, day);
  const y = candidate < from ? year + 1 : year;
  return `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function inferGermanyDeadline(title: string, provider = "DAAD"): string {
  const t = title.toLowerCase();
  const p = provider.toLowerCase();

  if (p.includes("deutschlandstipendium")) return nextSeasonDate(7, 15);
  if (p.includes("ebert") || p.includes("böll") || p.includes("boell")) {
    return nextSeasonDate(8, 31);
  }

  if (t.includes("summer course") || t.includes("summer institute")) {
    return nextSeasonDate(3, 15);
  }
  if (t.includes("winter course")) return nextSeasonDate(8, 15);
  if (t.includes("research grant") || t.includes("research fellowship")) {
    return nextSeasonDate(10, 15);
  }
  if (t.includes("doctoral") || t.includes("phd") || t.includes("cotutelle")) {
    return nextSeasonDate(10, 1);
  }
  if (
    t.includes("master") ||
    t.includes("postgraduate") ||
    t.includes("study scholarship") ||
    t.includes("study scholarships")
  ) {
    return nextSeasonDate(10, 15);
  }
  if (t.includes("internship") || t.includes("short-term")) return nextSeasonDate(5, 31);

  return nextSeasonDate(8, 31);
}

export function inferGermanyLevels(title: string): {
  cycles: StudyCycle[];
  niveaux: string[];
} {
  const t = title.toLowerCase();
  const cycles = new Set<StudyCycle>();
  const niveaux: string[] = [];

  if (t.includes("doctoral") || t.includes("phd") || t.includes("cotutelle")) {
    cycles.add("doctorate");
    niveaux.push("Doctorat / recherche");
  }
  if (t.includes("master") || t.includes("postgraduate") || t.includes("graduate programme")) {
    cycles.add("master");
    niveaux.push("Master");
  }
  if (
    t.includes("undergraduate") ||
    t.includes("bachelor") ||
    t.includes("summer course") ||
    t.includes("winter course") ||
    t.includes("internship") ||
    t.includes("study visit")
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

export function inferGermanyLanguages(title: string): string[] {
  const t = title.toLowerCase();

  if (/\b(german language course|deutsch|german only)\b/.test(t)) {
    return ["Allemand"];
  }
  if (/\b(english only|in english)\b/.test(t)) {
    return ["Anglais"];
  }
  if (t.includes("summer course") || t.includes("winter course")) {
    return ["Allemand", "Anglais"];
  }

  return ["Anglais", "Allemand"];
}

export function inferGermanyMonthlyAllowance(title: string, provider = "DAAD"): number | undefined {
  const t = title.toLowerCase();
  const p = provider.toLowerCase();

  if (p.includes("deutschlandstipendium")) return 300;
  if (t.includes("doctoral") || t.includes("phd") || t.includes("cotutelle")) return 1300;
  if (t.includes("master") || t.includes("postgraduate") || t.includes("study scholarship")) {
    return 992;
  }
  if (t.includes("research grant")) return 1200;
  return undefined;
}
