import type { Scholarship } from "../../types";
import { resolveStatusFromDeadline } from "../china-deadlines";
import {
  inferCanadaApplicationType,
  inferCanadaDeadline,
  inferCanadaLevels,
  parseUdemIsoDate,
  slugifyCanadaTitle,
} from "../canada-deadlines";
import type { CanadaScrapedAward, UdemBourseEntry } from "./canada-parse-html";
import { buildUdemBourseUrl } from "./canada-parse-html";

export function udemEntryToScholarship(
  entry: UdemBourseEntry,
  index: number,
  syncedAt: string,
): Scholarship {
  const endAt = parseUdemIsoDate(entry.dateLimiteIso);
  const { cycles, niveaux } = inferCanadaLevels(entry.title);
  const { typeCandidature, attributionAutomatiqueAdmission } = inferCanadaApplicationType(
    entry.title,
    "Université de Montréal",
    "umontreal",
  );
  const dateCloture = inferCanadaDeadline(entry.title, "UdeM", endAt);

  const avantages = ["Bourse répertoriée — Université de Montréal"];
  if (entry.montant) avantages.push(`Montant : ${entry.montant}`);
  if (entry.description) avantages.push(entry.description);

  const conditions = [
    "Candidature directe (consulter la fiche UdeM)",
    "Province : Québec",
  ];
  if (entry.expired) conditions.push("Statut catalogue : session précédente (date à confirmer)");

  const slug = slugifyCanadaTitle(entry.title);

  return {
    id: `canada-udem-${index}-${slug}`,
    nom: entry.title,
    paysHote: "Canada",
    cyclesFinances: cycles,
    niveauDisponible: niveaux,
    dateCloture,
    avantages,
    conditionsEligibilite: conditions,
    lienOfficiel: buildUdemBourseUrl(entry.path),
    status: resolveStatusFromDeadline(dateCloture),
    source: "umontreal",
    syncedAt,
    organisme: "Université de Montréal",
    typeCandidature,
    attributionAutomatiqueAdmission,
    valeurFinanciere: entry.montant,
    province: "Québec",
    langueEnseignement: "Français",
    nationalitesEligibles: ["Selon bourse"],
  };
}

export function scrapedAwardToScholarship(
  award: CanadaScrapedAward,
  index: number,
  syncedAt: string,
): Scholarship {
  const { cycles, niveaux } = inferCanadaLevels(award.title);
  const { typeCandidature, attributionAutomatiqueAdmission } = inferCanadaApplicationType(
    award.title,
    award.organisme,
    award.source,
  );
  const dateCloture = award.dateLimite ?? inferCanadaDeadline(award.title, award.organisme);
  const slug = slugifyCanadaTitle(award.title);

  const avantages = [`Programme référencé — ${award.organisme}`];
  if (award.montant) avantages.push(`Montant : ${award.montant}`);
  if (award.summary) avantages.push(award.summary.slice(0, 200));

  return {
    id: `canada-${award.source}-${index}-${slug}`,
    nom: award.title,
    paysHote: "Canada",
    cyclesFinances: cycles,
    niveauDisponible: niveaux,
    dateCloture,
    avantages,
    conditionsEligibilite: [
      `Organisme : ${award.organisme}`,
      `Province : ${award.province}`,
      "Consulter le lien officiel pour critères et dates exactes",
    ],
    lienOfficiel: award.url,
    status: resolveStatusFromDeadline(dateCloture),
    source: award.source,
    syncedAt,
    organisme: award.organisme,
    typeCandidature,
    attributionAutomatiqueAdmission,
    valeurFinanciere: award.montant,
    province: award.province,
    langueEnseignement:
      award.source === "umontreal" || award.source === "ulaval" ? "Français" : "Anglais",
    nationalitesEligibles: ["Étudiants internationaux"],
  };
}

export function normalizeCanadaTitleKey(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 80);
}

export function mergeCanadaScholarships(lists: Scholarship[][]): Scholarship[] {
  const byId = new Map<string, Scholarship>();
  const byTitle = new Map<string, string>();

  for (const list of lists) {
    for (const item of list) {
      const titleKey = normalizeCanadaTitleKey(item.nom);
      const existingId = byTitle.get(titleKey);

      if (existingId && byId.has(existingId)) {
        const existing = byId.get(existingId)!;
        const preferNew =
          item.source === "umontreal" ||
          (item.lienOfficiel.includes("/detail") && !existing.lienOfficiel.includes("/detail"));
        if (!preferNew) continue;
      }

      byId.set(item.id, item);
      byTitle.set(titleKey, item.id);
    }
  }

  return [...byId.values()];
}
