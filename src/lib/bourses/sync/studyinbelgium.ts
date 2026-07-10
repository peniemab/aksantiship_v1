import type { Scholarship } from "../../types";
import {
  STUDY_IN_BELGIUM_URL,
  STUDY_IN_FLANDERS_SCHOLARSHIPS_URL,
  UANTWERP_SCHOLARSHIPS_URL,
  WALLONIE_CG_ALLOCATIONS_URL,
} from "../belgium-deadlines";
import {
  getGermanophoneDuOScholarship,
  getKuleuvenCuratedScholarships,
  getUgentCuratedScholarships,
} from "./belgium-curated";
import {
  flandersEntryToScholarship,
  germanophoneAllocationsToScholarship,
  mergeBelgiumScholarships,
  studyInBelgiumEntryToScholarship,
  uantwerpEntryToScholarship,
} from "./belgium-map";
import {
  mergeStudyInBelgiumEntries,
  parseStudyInBelgiumHtml,
  parseStudyInFlandersScholarshipsHtml,
  parseUantwerpScholarshipsHtml,
  parseWallonieGermanophoneHtml,
} from "./belgium-parse-html";

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

export async function fetchStudyInBelgiumHtml(): Promise<string> {
  return fetchText(STUDY_IN_BELGIUM_URL);
}

export interface BelgiumFetchResult {
  scholarships: Scholarship[];
  fwb: number;
  flanders: number;
  uantwerp: number;
  ugent: number;
  kuleuven: number;
  cgermanophone: number;
  errors: string[];
}

export async function fetchBelgiumScholarships(): Promise<Scholarship[]> {
  const result = await fetchBelgiumScholarshipsDetailed();
  return result.scholarships;
}

export async function fetchBelgiumScholarshipsDetailed(): Promise<BelgiumFetchResult> {
  const syncedAt = new Date().toISOString();
  const errors: string[] = [];

  let fwbList: Scholarship[] = [];
  try {
    const html = await fetchStudyInBelgiumHtml();
    const merged = mergeStudyInBelgiumEntries(parseStudyInBelgiumHtml(html));
    fwbList = merged.map((entry, index) =>
      studyInBelgiumEntryToScholarship(entry, index + 1, syncedAt),
    );
  } catch (e) {
    errors.push(`FWB: ${e instanceof Error ? e.message : String(e)}`);
  }

  await sleep(FETCH_DELAY_MS);

  let flandersList: Scholarship[] = [];
  try {
    const html = await fetchText(STUDY_IN_FLANDERS_SCHOLARSHIPS_URL);
    const entries = parseStudyInFlandersScholarshipsHtml(html);
    flandersList = entries.map((entry, index) =>
      flandersEntryToScholarship(entry, index + 1, syncedAt),
    );
  } catch (e) {
    errors.push(`Flandre: ${e instanceof Error ? e.message : String(e)}`);
  }

  await sleep(FETCH_DELAY_MS);

  let uantwerpList: Scholarship[] = [];
  try {
    const html = await fetchText(UANTWERP_SCHOLARSHIPS_URL);
    const entries = parseUantwerpScholarshipsHtml(html);
    uantwerpList = entries.map((entry, index) =>
      uantwerpEntryToScholarship(entry, index + 1, syncedAt),
    );
  } catch (e) {
    errors.push(`UAntwerp: ${e instanceof Error ? e.message : String(e)}`);
  }

  await sleep(FETCH_DELAY_MS);

  let cgList: Scholarship[] = [];
  try {
    const html = await fetchText(WALLONIE_CG_ALLOCATIONS_URL);
    const parsed = parseWallonieGermanophoneHtml(html);
    if (parsed) {
      cgList.push(germanophoneAllocationsToScholarship(parsed, syncedAt));
    }
    cgList.push(getGermanophoneDuOScholarship(syncedAt));
  } catch (e) {
    errors.push(`CG: ${e instanceof Error ? e.message : String(e)}`);
    cgList.push(getGermanophoneDuOScholarship(syncedAt));
  }

  const ugentList = getUgentCuratedScholarships(syncedAt);
  const kuleuvenList = getKuleuvenCuratedScholarships(syncedAt);

  const scholarships = mergeBelgiumScholarships([
    fwbList,
    flandersList,
    uantwerpList,
    ugentList,
    kuleuvenList,
    cgList,
  ]);

  return {
    scholarships,
    fwb: fwbList.length,
    flanders: flandersList.length,
    uantwerp: uantwerpList.length,
    ugent: ugentList.length,
    kuleuven: kuleuvenList.length,
    cgermanophone: cgList.length,
    errors,
  };
}

/** @deprecated Utiliser fetchBelgiumScholarshipsDetailed — conservé pour compatibilité tests. */
export function getFlandersCuratedScholarships(_syncedAt: string): Scholarship[] {
  return [];
}
