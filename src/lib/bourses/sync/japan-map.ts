import type { Scholarship, StudyCycle } from "../../types";
import type { JpssScholarshipEntry, JassoTuitionEntry } from "./japan-parse-html";
import {
  buildJassoTuitionDetailUrl,
  buildJpssScholarshipUrl,
} from "./japan-parse-html";
import { inferJapanDeadline, inferJapanLevels, slugifyJapanTitle } from "../japan-deadlines";

const MONTH_TO_NUM: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

function mapJpssLevels(text?: string): { cycles: StudyCycle[]; niveaux: string[] } {
  if (!text) return inferJapanLevels("");
  const t = text.toLowerCase();
  const cycles = new Set<StudyCycle>();
  const niveaux: string[] = [];

  if (t.includes("doctoral") || t.includes("research student")) {
    cycles.add("doctorate");
    niveaux.push("Doctorat / recherche");
  }
  if (t.includes("master")) {
    cycles.add("master");
    niveaux.push("Master");
  }
  if (
    t.includes("undergraduate") ||
    t.includes("college") ||
    t.includes("bachelor") ||
    t.includes("high school")
  ) {
    cycles.add("undergraduate");
    niveaux.push("Licence / Bachelor");
  }
  if (t.includes("japanese language")) {
    cycles.add("undergraduate");
    niveaux.push("École de langue japonaise");
  }

  if (cycles.size === 0) return inferJapanLevels(text);
  return { cycles: [...cycles], niveaux };
}

function inferDeadlineFromMonth(monthLabel?: string): string | undefined {
  if (!monthLabel) return undefined;
  const key = monthLabel.toLowerCase().trim();
  if (key.includes("any time")) return undefined;
  const month = MONTH_TO_NUM[key];
  if (!month) return undefined;

  const now = new Date();
  const year = now.getFullYear();
  const candidate = new Date(year, month - 1, 28);
  const y = candidate < now ? year + 1 : year;
  return `${y}-${String(month).padStart(2, "0")}-28`;
}

export function jpssEntryToScholarship(
  entry: JpssScholarshipEntry,
  syncedAt: string,
): Scholarship {
  const { cycles, niveaux } = mapJpssLevels(entry.academicLevel);
  const dateCloture = inferJapanDeadline(entry.title, entry.organization);

  const conditions = [
    entry.applicationMethod ? `Candidature : ${entry.applicationMethod}` : "",
    entry.residence ? `Résidence au moment de la candidature : ${entry.residence}` : "",
    entry.academicYear ? `Année scolaire : ${entry.academicYear}` : "",
    entry.recipients ? `Bénéficiaires : ${entry.recipients}` : "",
  ].filter(Boolean);

  if (entry.nationality) {
    conditions.push(`Nationalité : ${entry.nationality}`);
  }

  return {
    id: `japan-jpss-${entry.id}`,
    nom: entry.title,
    paysHote: "Japon",
    cyclesFinances: cycles,
    niveauDisponible: niveaux,
    dateCloture,
    avantages: [
      entry.stipend ? `Allocation : ${entry.stipend}` : "Bourse pour étudiants internationaux au Japon",
      "Source : JPSS (Japan Study Support)",
    ],
    conditionsEligibilite: conditions,
    lienOfficiel: buildJpssScholarshipUrl(entry.path),
    status: "encours",
    source: "jpss",
    syncedAt,
    organisme: entry.organization ?? "JPSS",
    valeurFinanciere: entry.stipend,
    nationalitesEligibles: entry.nationality ? [entry.nationality] : ["Toutes nationalités"],
  };
}

export function jassoTuitionEntryToScholarship(
  entry: JassoTuitionEntry,
  syncedAt: string,
): Scholarship {
  const levelText = entry.academicLevels.join(", ");
  const { cycles, niveaux } = mapJpssLevels(levelText);
  const provider = entry.provider.split("／")[0]?.trim() || entry.provider;
  const slug = slugifyJapanTitle(entry.title);
  const dateCloture = inferJapanDeadline(entry.title, provider);

  const isTuitionOnly = entry.types.every(
    (t) => !t.toLowerCase().includes("scholarship") || t.toLowerCase().includes("tuition"),
  );

  return {
    id: `japan-jasso-${entry.mid.replace(/[^a-zA-Z0-9-]+/g, "-")}-${slug}`.slice(0, 96),
    nom: entry.title,
    paysHote: "Japon",
    cyclesFinances: cycles,
    niveauDisponible: niveaux.length ? niveaux : ["Licence / Bachelor", "Master", "Doctorat"],
    dateCloture,
    avantages: [
      entry.types.length ? `Type : ${entry.types.join(", ")}` : "Aide financière au Japon",
      "Source : Study in Japan (recherche JASSO)",
    ],
    conditionsEligibilite: [
      provider ? `Organisme / école : ${entry.provider}` : "",
      levelText ? `Niveaux : ${levelText}` : "",
      entry.lastUpdate ? `Dernière mise à jour : ${entry.lastUpdate}` : "",
      isTuitionOnly
        ? "Réduction ou exonération de frais — vérifier éligibilité sur la fiche officielle"
        : "",
    ].filter(Boolean),
    lienOfficiel: buildJassoTuitionDetailUrl(entry.mid),
    status: "encours",
    source: "jasso-search",
    syncedAt,
    organisme: provider,
    nationalitesEligibles: ["Toutes nationalités"],
  };
}

export function normalizeJapanTitleKey(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 80);
}

export function mergeJapanScholarships(lists: Scholarship[][]): Scholarship[] {
  const byId = new Map<string, Scholarship>();
  const byTitle = new Map<string, string>();

  for (const list of lists) {
    for (const item of list) {
      const titleKey = normalizeJapanTitleKey(item.nom);
      const existingId = byTitle.get(titleKey);

      if (existingId && byId.has(existingId)) {
        const existing = byId.get(existingId)!;
        const preferNew =
          item.source === "studyinjapan" ||
          (item.lienOfficiel.includes("studyinjapan.go.jp") &&
            !existing.lienOfficiel.includes("studyinjapan.go.jp"));

        if (!preferNew) continue;
      }

      byId.set(item.id, item);
      byTitle.set(titleKey, item.id);
    }
  }

  return [...byId.values()];
}
