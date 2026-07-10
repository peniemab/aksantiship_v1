import type { Scholarship } from "../../types";
import { resolveStatusFromDeadline } from "../china-deadlines";
import { buildJapanCuratedScholarships } from "../../data/japan-scholarships";
import {
  JASSO_SCHOLARSHIPS_URL,
  MEXT_SCHOLARSHIPS_URL,
  STUDY_IN_JAPAN_SCHOLARSHIPS_URL,
} from "../japan-deadlines";
import {
  parseJassoTuitionSearchHtml,
  parseJpssScholarshipsHtml,
} from "./japan-parse-html";
import {
  jassoTuitionEntryToScholarship,
  jpssEntryToScholarship,
  mergeJapanScholarships,
} from "./japan-map";

const HEADERS = {
  Accept: "text/html,application/xhtml+xml",
  "User-Agent": "Mozilla/5.0 (compatible; Aksantiship/1.0)",
};

const JASSO_TUITION_SEARCH_URL =
  "https://www.studyinjapan.go.jp/en/search-for-scholarships/tuition-reduction_search.php?lang=en&offset=0&go=go&limit=700&narabikae=2";

const JPSS_BASE = "https://www.jpss.jp/en/scholarship/";
const JPSS_MAX_PAGES = 14;

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`${url} (${res.status})`);
  return res.text();
}

export async function fetchJpssScholarships(syncedAt: string): Promise<Scholarship[]> {
  const all: Scholarship[] = [];

  for (let page = 1; page <= JPSS_MAX_PAGES; page += 1) {
    const url = page === 1 ? JPSS_BASE : `${JPSS_BASE}?p=${page}`;
    const html = await fetchText(url);
    const entries = parseJpssScholarshipsHtml(html);
    if (entries.length === 0) break;
    all.push(...entries.map((e) => jpssEntryToScholarship(e, syncedAt)));
  }

  return all;
}

export async function fetchJassoTuitionScholarships(syncedAt: string): Promise<Scholarship[]> {
  const html = await fetchText(JASSO_TUITION_SEARCH_URL);
  const entries = parseJassoTuitionSearchHtml(html);
  return entries.map((e) => jassoTuitionEntryToScholarship(e, syncedAt));
}

export async function probeStudyInJapanPages(): Promise<{ ok: boolean; errors: string[] }> {
  const errors: string[] = [];
  const urls = [STUDY_IN_JAPAN_SCHOLARSHIPS_URL, MEXT_SCHOLARSHIPS_URL, JASSO_SCHOLARSHIPS_URL];

  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(20_000) });
      if (!res.ok) errors.push(`${url} (${res.status})`);
    } catch (e) {
      errors.push(`${url} (${e instanceof Error ? e.message : "erreur réseau"})`);
    }
  }

  return { ok: errors.length === 0, errors };
}

export interface JapanFetchResult {
  scholarships: Scholarship[];
  curated: number;
  jpss: number;
  jasso: number;
  merged: number;
  errors: string[];
}

export async function fetchJapanScholarships(): Promise<Scholarship[]> {
  const result = await fetchJapanScholarshipsDetailed();
  return result.scholarships;
}

export async function fetchJapanScholarshipsDetailed(): Promise<JapanFetchResult> {
  const syncedAt = new Date().toISOString();
  const errors: string[] = [];

  const curated = buildJapanCuratedScholarships(syncedAt);
  let jpss: Scholarship[] = [];
  let jasso: Scholarship[] = [];

  try {
    jpss = await fetchJpssScholarships(syncedAt);
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Erreur JPSS");
  }

  try {
    jasso = await fetchJassoTuitionScholarships(syncedAt);
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Erreur JASSO search");
  }

  const probe = await probeStudyInJapanPages();
  if (!probe.ok) {
    errors.push(...probe.errors);
  }

  const merged = mergeJapanScholarships([curated, jpss, jasso]).map((s) => ({
    ...s,
    status: resolveStatusFromDeadline(s.dateCloture),
  }));

  return {
    scholarships: merged,
    curated: curated.length,
    jpss: jpss.length,
    jasso: jasso.length,
    merged: merged.length,
    errors,
  };
}
