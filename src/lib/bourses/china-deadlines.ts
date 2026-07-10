import type { ScholarshipStatus, StudyCycle } from "../types";

/** Calendrier typique des candidatures en Chine (rentrée de septembre). */
export function inferChinaApplicationDeadline(startDateLabel?: string): string {
  const now = new Date();
  const year = now.getFullYear();

  if (!startDateLabel?.trim()) {
    // Pic CSC : clôtures provinciales / universitaires fin juin pour rentrée septembre.
    const juneDeadline = new Date(`${year}-06-30T23:59:59`);
    if (now <= juneDeadline) return `${year}-06-30`;
    return `${year + 1}-06-30`;
  }

  const match = startDateLabel.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*\d{0,2},?\s*(\d{4})/i);
  if (!match) return `${year}-06-30`;

  const month = match[1].toLowerCase().slice(0, 3);
  const startYear = parseInt(match[2], 10);

  const springMonths = ["jan", "feb", "mar"];
  if (springMonths.includes(month)) {
    return `${startYear - 1}-11-30`;
  }

  // Rentrée automne (septembre) : candidatures jusqu'à fin juin de la même année académique.
  return `${startYear}-06-30`;
}

export function mapCucasDegreeToCycles(degree?: string): StudyCycle[] {
  const d = (degree ?? "").toLowerCase();
  if (d.includes("doctoral") || d.includes("phd") || d.includes("doctor")) return ["doctorate"];
  if (d.includes("master")) return ["master"];
  if (d.includes("bachelor") || d.includes("licence") || d.includes("undergraduate")) {
    return ["undergraduate"];
  }
  if (d.includes("associate") || d.includes("non-degree") || d.includes("language")) {
    return ["undergraduate"];
  }
  return ["undergraduate", "master", "doctorate"];
}

export function mapCucasDegreeToNiveau(degree?: string): string[] {
  const cycles = mapCucasDegreeToCycles(degree);
  const labels: string[] = [];
  if (cycles.includes("undergraduate")) labels.push("Licence / Bachelor");
  if (cycles.includes("master")) labels.push("Master");
  if (cycles.includes("doctorate")) labels.push("Doctorat");
  return labels.length ? labels : ["Licence / Bachelor", "Master", "Doctorat"];
}

/** Intensité de synchronisation CUCAS selon le calendrier chinois. */
export type ChinaSyncIntensity = "daily" | "weekly" | "monthly";

export function getChinaSyncIntensity(date = new Date()): ChinaSyncIntensity {
  const month = date.getMonth() + 1; // 1-12
  if (month >= 12 || month <= 3) return "daily";
  if (month >= 4 && month <= 6) return "weekly";
  return "monthly";
}

export function resolveStatusFromDeadline(
  dateCloture: string,
  now = new Date(),
): ScholarshipStatus {
  const deadline = new Date(`${dateCloture}T23:59:59`);
  if (Number.isNaN(deadline.getTime())) return "encours";
  if (deadline < now) return "fermee";
  const daysUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (daysUntil > 120) return "a_venir";
  return "encours";
}

export function isScholarshipOpen(s: { dateCloture: string; status?: ScholarshipStatus }, now = new Date()): boolean {
  return resolveStatusFromDeadline(s.dateCloture, now) !== "fermee";
}
