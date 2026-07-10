import type { Scholarship } from "../../types";
import { resolveStatusFromDeadline } from "../china-deadlines";
import {
  COMMUNAUTE_CG,
  COMMUNAUTE_FWB,
  COMMUNAUTE_FLANDRE,
  inferBelgiumDeadline,
  inferBelgiumInstructionLanguage,
  inferBelgiumLevels,
  inferBelgiumMonthlyAllowance,
  slugifyBelgiumTitle,
  WALLONIE_CG_ALLOCATIONS_URL,
} from "../belgium-deadlines";
import {
  buildStudyInBelgiumUrl,
  inferProviderFromTitle,
  type BelgiumScrapedEntry,
  type StudyInBelgiumMergedEntry,
  type WallonieDemarcheParsed,
} from "./belgium-parse-html";

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    return u.href.replace(/\/$/, "");
  } catch {
    return url.replace(/\/$/, "");
  }
}

export function studyInBelgiumEntryToScholarship(
  entry: StudyInBelgiumMergedEntry,
  index: number,
  syncedAt: string,
): Scholarship {
  const organisme = inferProviderFromTitle(entry.title);
  const communaute = COMMUNAUTE_FWB;
  const langueEnseignement = inferBelgiumInstructionLanguage(entry.title, communaute);
  const { cycles, niveaux } = inferBelgiumLevels(entry.title);
  const dateCloture = inferBelgiumDeadline(entry.title, organisme);
  const allocationMensuelle = inferBelgiumMonthlyAllowance(entry.title);

  const nationalitesEligibles = [...new Set(entry.audiences)].sort((a, b) =>
    a.localeCompare(b, "fr"),
  );

  const avantages = [`Programme référencé sur Study in Belgium (${communaute})`];
  if (allocationMensuelle) {
    avantages.push(`Allocation indicative : ~${allocationMensuelle} €/mois`);
  }

  const conditions = [
    `Communauté : ${communaute}`,
    `Langue d'enseignement : ${langueEnseignement}`,
  ];
  if (nationalitesEligibles.length && !nationalitesEligibles.includes("Toutes nationalités")) {
    conditions.push(`Public cible : ${nationalitesEligibles.join(", ")}`);
  }

  const slug = slugifyBelgiumTitle(entry.title);

  return {
    id: `belgium-fwb-${index}-${slug}`,
    nom: entry.title,
    paysHote: "Belgique",
    cyclesFinances: cycles,
    niveauDisponible: niveaux,
    dateCloture,
    avantages,
    conditionsEligibilite: conditions,
    lienOfficiel: buildStudyInBelgiumUrl(entry.path),
    status: resolveStatusFromDeadline(dateCloture),
    source: "studyinbelgium",
    syncedAt,
    organisme,
    communaute,
    langueEnseignement,
    allocationMensuelle,
    nationalitesEligibles,
  };
}

export function flandersEntryToScholarship(
  entry: BelgiumScrapedEntry,
  index: number,
  syncedAt: string,
): Scholarship {
  const communaute = COMMUNAUTE_FLANDRE;
  const organisme = inferProviderFromTitle(entry.title);
  const { cycles, niveaux } = inferBelgiumLevels(entry.title);
  const dateCloture = inferBelgiumDeadline(entry.title, organisme);
  const langueEnseignement = inferBelgiumInstructionLanguage(entry.title, communaute);
  const allocationMensuelle = inferBelgiumMonthlyAllowance(entry.title);
  const slug = slugifyBelgiumTitle(entry.title);

  const avantages = [`Programme référencé sur Study in Flanders`];
  if (entry.summary) avantages.push(entry.summary);
  if (allocationMensuelle) {
    avantages.push(`Allocation indicative : ~${allocationMensuelle} €/mois`);
  }

  return {
    id: `belgium-flanders-${index}-${slug}`,
    nom: entry.title,
    paysHote: "Belgique",
    cyclesFinances: cycles,
    niveauDisponible: niveaux,
    dateCloture,
    avantages,
    conditionsEligibilite: [
      `Communauté : ${communaute}`,
      `Langue d'enseignement : ${langueEnseignement}`,
    ],
    lienOfficiel: entry.url,
    status: resolveStatusFromDeadline(dateCloture),
    source: "studyinflanders",
    syncedAt,
    organisme,
    communaute,
    langueEnseignement,
    allocationMensuelle,
    nationalitesEligibles: ["Toutes nationalités"],
  };
}

export function uantwerpEntryToScholarship(
  entry: BelgiumScrapedEntry,
  index: number,
  syncedAt: string,
): Scholarship {
  const communaute = COMMUNAUTE_FLANDRE;
  const organisme = "Université d'Anvers";
  const { cycles, niveaux } = inferBelgiumLevels(entry.title);
  const dateCloture = inferBelgiumDeadline(entry.title, organisme);
  const langueEnseignement = inferBelgiumInstructionLanguage(entry.title, communaute);
  const allocationMensuelle = inferBelgiumMonthlyAllowance(entry.title);
  const slug = slugifyBelgiumTitle(entry.title);

  const avantages = [`Programme UAntwerp — ${organisme}`];
  if (entry.summary) avantages.push(entry.summary);
  if (allocationMensuelle) {
    avantages.push(`Allocation indicative : ~${allocationMensuelle} €/mois`);
  }

  return {
    id: `belgium-uantwerp-${index}-${slug}`,
    nom: entry.title,
    paysHote: "Belgique",
    cyclesFinances: cycles,
    niveauDisponible: niveaux,
    dateCloture,
    avantages,
    conditionsEligibilite: [
      `Communauté : ${communaute}`,
      `Langue d'enseignement : ${langueEnseignement}`,
      "Candidature ou sélection via UAntwerp selon le programme",
    ],
    lienOfficiel: entry.url,
    status: resolveStatusFromDeadline(dateCloture),
    source: "uantwerp",
    syncedAt,
    organisme,
    communaute,
    langueEnseignement,
    allocationMensuelle,
    nationalitesEligibles: ["Toutes nationalités"],
  };
}

export function germanophoneAllocationsToScholarship(
  parsed: WallonieDemarcheParsed,
  syncedAt: string,
): Scholarship {
  const communaute = COMMUNAUTE_CG;
  const organisme = "Communauté germanophone";
  const nom = "Allocations d'études (Communauté germanophone)";
  const dateCloture = inferBelgiumDeadline("allocations germanophone", organisme);
  const { cycles, niveaux } = inferBelgiumLevels(
    "secondaire haute école université doctorat",
  );
  const langueEnseignement = inferBelgiumInstructionLanguage(nom, communaute);

  const avantages = [
    "Aides financières liées aux revenus (362 € à 2 469 €/an selon situation)",
    "Secondaire, haute école et université en Communauté germanophone",
  ];
  if (parsed.avantagesText) avantages.push(parsed.avantagesText.slice(0, 200));

  const conditions = [
    `Communauté : ${communaute}`,
    `Langue d'enseignement : ${langueEnseignement}`,
    "Résidence ou scolarité en Communauté germanophone",
    "Demande annuelle — plafond de revenus",
  ];
  if (parsed.deadlineText) conditions.push(parsed.deadlineText);

  return {
    id: "belgium-cg-allocations-etudes",
    nom,
    paysHote: "Belgique",
    cyclesFinances: cycles,
    niveauDisponible: niveaux,
    dateCloture,
    avantages,
    conditionsEligibilite: conditions,
    lienOfficiel: WALLONIE_CG_ALLOCATIONS_URL,
    status: resolveStatusFromDeadline(dateCloture),
    source: "cgermanophone",
    syncedAt,
    organisme,
    communaute,
    langueEnseignement,
    nationalitesEligibles: ["Résidents Communauté germanophone"],
  };
}

export function mergeBelgiumScholarships(lists: Scholarship[][]): Scholarship[] {
  const byKey = new Map<string, Scholarship>();

  for (const list of lists) {
    for (const item of list) {
      const urlKey = normalizeUrl(item.lienOfficiel);
      const key = `${item.source ?? ""}|${urlKey}|${slugifyBelgiumTitle(item.nom)}`;
      if (!byKey.has(key)) {
        byKey.set(key, item);
      }
    }
  }

  return [...byKey.values()];
}
