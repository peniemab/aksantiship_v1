import type { Scholarship } from "../../types";
import { CANADA_FEDERAL_SCHOLARSHIPS } from "../../data/canada-federal-scholarships";
import { buildCanadaUniversityPortalScholarships } from "../../data/canada-university-portals";
import {
  UDEM_BOURSES_URL,
  UBC_INTERNATIONAL_AWARDS_URL,
  UOFT_INTERNATIONAL_AWARDS_URL,
  MCGILL_ENTRANCE_URL,
  MCGILL_SPECIAL_FUNDING_URL,
  MCGILL_EXTERNAL_AWARDS_URL,
  ALBERTA_INTL_ENTRANCE_URL,
  ALBERTA_INTL_STUDENTS_URL,
  WATERLOO_INTL_SCHOLARSHIPS_URL,
  ULaval_INTL_FINANCE_URL,
  ULaval_BBAF_ADMISSION_URL,
} from "../canada-deadlines";
import {
  mergeCanadaScholarships,
  scrapedAwardToScholarship,
  udemEntryToScholarship,
} from "./canada-map";
import {
  parseUbcInternationalAwardsHtml,
  parseUdemBoursesHtml,
  parseUofTorontoInternationalAwardsHtml,
  parseMcGillPagesHtml,
  parseAlbertaInternationalScholarshipsHtml,
  parseWaterlooInternationalScholarshipsHtml,
  parseUlavalInternationalFinanceHtml,
  parseUlavalBbafRepertoireHtml,
} from "./canada-parse-html";

const HEADERS = {
  Accept: "text/html,application/xhtml+xml",
  "User-Agent": "Mozilla/5.0 (compatible; Aksantiship/1.0)",
};

const FETCH_DELAY_MS = 800;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: HEADERS,
    signal: AbortSignal.timeout(45_000),
  });
  if (!res.ok) throw new Error(`${url} (${res.status})`);
  return res.text();
}

export interface CanadaFetchResult {
  scholarships: Scholarship[];
  federal: number;
  portails: number;
  udem: number;
  ubc: number;
  utoronto: number;
  mcgill: number;
  ualberta: number;
  uwaterloo: number;
  ulaval: number;
  merged: number;
  errors: string[];
}

export async function fetchCanadaScholarships(): Promise<Scholarship[]> {
  const result = await fetchCanadaScholarshipsDetailed();
  return result.scholarships;
}

export async function fetchCanadaScholarshipsDetailed(): Promise<CanadaFetchResult> {
  const syncedAt = new Date().toISOString();
  const errors: string[] = [];

  const federal = CANADA_FEDERAL_SCHOLARSHIPS.map((s) => ({ ...s, syncedAt }));
  const portails = buildCanadaUniversityPortalScholarships(syncedAt);

  let udem: Scholarship[] = [];
  let ubc: Scholarship[] = [];
  let utoronto: Scholarship[] = [];
  let mcgill: Scholarship[] = [];
  let ualberta: Scholarship[] = [];
  let uwaterloo: Scholarship[] = [];
  let ulaval: Scholarship[] = [];

  try {
    const html = await fetchText(UDEM_BOURSES_URL);
    udem = parseUdemBoursesHtml(html).map((entry, index) =>
      udemEntryToScholarship(entry, index + 1, syncedAt),
    );
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Erreur sync UdeM");
  }

  await sleep(FETCH_DELAY_MS);

  try {
    const html = await fetchText(UBC_INTERNATIONAL_AWARDS_URL);
    ubc = parseUbcInternationalAwardsHtml(html).map((award, index) =>
      scrapedAwardToScholarship(award, index + 1, syncedAt),
    );
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Erreur sync UBC");
  }

  await sleep(FETCH_DELAY_MS);

  try {
    const html = await fetchText(UOFT_INTERNATIONAL_AWARDS_URL);
    utoronto = parseUofTorontoInternationalAwardsHtml(html).map((award, index) =>
      scrapedAwardToScholarship(award, index + 1, syncedAt),
    );
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Erreur sync U of T");
  }

  await sleep(FETCH_DELAY_MS);

  try {
    const pages = await Promise.all([
      fetchText(MCGILL_ENTRANCE_URL).then((html) => ({ html, url: MCGILL_ENTRANCE_URL })),
      fetchText(MCGILL_SPECIAL_FUNDING_URL).then((html) => ({
        html,
        url: MCGILL_SPECIAL_FUNDING_URL,
      })),
      fetchText(MCGILL_EXTERNAL_AWARDS_URL).then((html) => ({
        html,
        url: MCGILL_EXTERNAL_AWARDS_URL,
      })),
    ]);
    mcgill = parseMcGillPagesHtml(pages).map((award, index) =>
      scrapedAwardToScholarship(award, index + 1, syncedAt),
    );
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Erreur sync McGill");
  }

  await sleep(FETCH_DELAY_MS);

  try {
    const pages = await Promise.all([
      fetchText(ALBERTA_INTL_ENTRANCE_URL).then((html) => ({
        html,
        url: ALBERTA_INTL_ENTRANCE_URL,
      })),
      fetchText(ALBERTA_INTL_STUDENTS_URL).then((html) => ({
        html,
        url: ALBERTA_INTL_STUDENTS_URL,
      })),
    ]);
    const awards = pages.flatMap((p) => parseAlbertaInternationalScholarshipsHtml(p.html, p.url));
    ualberta = [...new Map(awards.map((a) => [a.title.toLowerCase(), a])).values()].map(
      (award, index) => scrapedAwardToScholarship(award, index + 1, syncedAt),
    );
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Erreur sync Alberta");
  }

  await sleep(FETCH_DELAY_MS);

  try {
    const html = await fetchText(WATERLOO_INTL_SCHOLARSHIPS_URL);
    uwaterloo = parseWaterlooInternationalScholarshipsHtml(html, WATERLOO_INTL_SCHOLARSHIPS_URL).map(
      (award, index) => scrapedAwardToScholarship(award, index + 1, syncedAt),
    );
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Erreur sync Waterloo");
  }

  await sleep(FETCH_DELAY_MS);

  try {
    const financeHtml = await fetchText(ULaval_INTL_FINANCE_URL);
    const bbafHtml = await fetchText(ULaval_BBAF_ADMISSION_URL);
    const awards = [
      ...parseUlavalInternationalFinanceHtml(financeHtml),
      ...parseUlavalBbafRepertoireHtml(bbafHtml),
    ];
    ulaval = dedupeScrapedAwards(awards).map((award, index) =>
      scrapedAwardToScholarship(award, index + 1, syncedAt),
    );
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Erreur sync Laval");
  }

  const merged = mergeCanadaScholarships([
    federal,
    portails,
    udem,
    ubc,
    utoronto,
    mcgill,
    ualberta,
    uwaterloo,
    ulaval,
  ]);

  return {
    scholarships: merged,
    federal: federal.length,
    portails: portails.length,
    udem: udem.length,
    ubc: ubc.length,
    utoronto: utoronto.length,
    mcgill: mcgill.length,
    ualberta: ualberta.length,
    uwaterloo: uwaterloo.length,
    ulaval: ulaval.length,
    merged: merged.length,
    errors,
  };
}

/** @deprecated Utiliser fetchCanadaScholarshipsDetailed */
export function getCanadaCuratedScholarships(_syncedAt: string): Scholarship[] {
  return [];
}

function dedupeScrapedAwards<T extends { title: string }>(awards: T[]): T[] {
  const byKey = new Map<string, T>();
  for (const award of awards) {
    const key = award.title.toLowerCase().replace(/[^a-z0-9àâäéèêëïîôùûüç]+/g, "");
    if (!byKey.has(key)) byKey.set(key, award);
  }
  return [...byKey.values()];
}
