import { readFileSync, existsSync } from "fs";
import path from "path";
import type { Scholarship } from "../../types";
import { resolveStatusFromDeadline } from "../china-deadlines";
import {
  buildDaadSearchUrl,
  inferGermanyDeadline,
  inferGermanyLanguages,
  inferGermanyLevels,
  inferGermanyMonthlyAllowance,
  slugifyDaadTitle,
} from "../germany-deadlines";
import { parseDaadCatalogHtml, type DaadCatalogEntry } from "./daad-parse-html";

const DAAD_LIST_URL =
  "https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?status=1&page=1&sort=title&direction=ASC";

const HEADERS = {
  Accept: "text/html,application/xhtml+xml",
  "User-Agent": "Mozilla/5.0 (compatible; Aksantiship/1.0; +https://aksantiship.com)",
};

export interface DaadCatalogTitle {
  title: string;
  provider: string;
}

function getCatalogTitlesPath(): string {
  return path.join(process.cwd(), "data", "daad-catalog-titles.json");
}

export function loadDaadCatalogTitles(): DaadCatalogTitle[] {
  const file = getCatalogTitlesPath();
  if (!existsSync(file)) return [];
  const parsed = JSON.parse(readFileSync(file, "utf-8")) as {
    items?: DaadCatalogTitle[];
  };
  return Array.isArray(parsed.items) ? parsed.items : [];
}

export async function fetchDaadCatalogHtml(timeoutMs = 20000): Promise<string | null> {
  try {
    const res = await fetch(DAAD_LIST_URL, {
      headers: HEADERS,
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    const html = await res.text();
    return html.length > 5000 ? html : null;
  } catch {
    return null;
  }
}

export async function resolveDaadCatalogEntries(): Promise<{
  entries: DaadCatalogEntry[];
  source: "live" | "snapshot";
}> {
  const html = await fetchDaadCatalogHtml();
  if (html) {
    const parsed = parseDaadCatalogHtml(html);
    if (parsed.length >= 50) {
      return { entries: parsed, source: "live" };
    }
  }

  const titles = loadDaadCatalogTitles();
  return {
    entries: titles.map((t) => ({ title: t.title, provider: t.provider })),
    source: "snapshot",
  };
}

export function daadEntryToScholarship(
  entry: DaadCatalogEntry,
  index: number,
  syncedAt: string,
): Scholarship {
  const { cycles, niveaux } = inferGermanyLevels(entry.title);
  const languesRequises = inferGermanyLanguages(entry.title);
  const allocationMensuelle = inferGermanyMonthlyAllowance(entry.title, entry.provider);
  const dateCloture = entry.endAt ?? inferGermanyDeadline(entry.title, entry.provider);

  const avantages = [`Programme référencé sur le catalogue DAAD (${entry.provider})`];
  if (allocationMensuelle) {
    avantages.push(`Allocation indicative : ${allocationMensuelle} €/mois`);
  }

  const conditions = [
    "Dates limites variables selon le pays d'origine — vérifiez la fiche DAAD",
    `Langues : ${languesRequises.join(", ")}`,
  ];
  if (entry.status) conditions.push(`Statut catalogue : ${entry.status}`);

  const slug = slugifyDaadTitle(entry.title);

  return {
    id: `daad-${index}-${slug}`,
    nom: entry.title,
    paysHote: "Allemagne",
    cyclesFinances: cycles,
    niveauDisponible: niveaux,
    dateCloture,
    avantages,
    conditionsEligibilite: conditions,
    lienOfficiel: buildDaadSearchUrl(entry.title),
    status: resolveStatusFromDeadline(dateCloture),
    source: "daad",
    syncedAt,
    organisme: entry.provider,
    languesRequises,
    allocationMensuelle,
    nationalitesEligibles: ["Toutes nationalités"],
  };
}

export async function fetchDaadGermanyScholarships(): Promise<Scholarship[]> {
  const syncedAt = new Date().toISOString();
  const { entries } = await resolveDaadCatalogEntries();
  return entries.map((entry, index) => daadEntryToScholarship(entry, index + 1, syncedAt));
}
