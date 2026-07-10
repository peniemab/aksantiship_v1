import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";
import type { Scholarship } from "../../types";
import { mergeScholarships, getStaticScholarships } from "../load-scholarships";
import { fetchAllRssSources } from "./rss-sources";
import { fetchCucasChinaScholarships } from "./cucas-china";
import { getChinaSyncIntensity } from "../china-deadlines";
import { filterOpenScholarships, withResolvedStatus } from "../scholarship-lifecycle";
import { fetchCampusFranceScholarships } from "./campus-france";
import { getFranceSyncIntensity } from "../france-deadlines";
import {
  readChinaScholarshipsFromDisk,
  writeChinaScholarshipsFileSafe,
} from "./china-storage";
import { writeFranceScholarshipsFile, getFranceScholarshipsFilePath } from "./france-storage";
import { writeGermanyScholarshipsFile, getGermanyScholarshipsFilePath } from "./germany-storage";
import { fetchDaadGermanyScholarships } from "./daad-germany";
import { getGermanySyncIntensity } from "../germany-deadlines";
import { fetchBelgiumScholarships } from "./studyinbelgium";
import { writeBelgiumScholarshipsFile, getBelgiumScholarshipsFilePath } from "./belgium-storage";
import { getBelgiumSyncIntensity } from "../belgium-deadlines";
import { fetchCanadaScholarships } from "./canada-sync";
import { writeCanadaScholarshipsFile, getCanadaScholarshipsFilePath } from "./canada-storage";
import { getCanadaSyncIntensity } from "../canada-deadlines";
import { fetchJapanScholarships } from "./japan-sync";
import { writeJapanScholarshipsFile, getJapanScholarshipsFilePath } from "./japan-storage";
import { getJapanSyncIntensity } from "../japan-deadlines";

const SYNCED_FILE = path.join(process.cwd(), "data", "scholarships-synced.json");
const CHINA_FILE = path.join(process.cwd(), "data", "china-cucas-scholarships.json");

export interface SyncReport {
  ok: boolean;
  syncedAt: string;
  curatedTotal: number;
  rssFetched: number;
  rssAdded: number;
  syncedStored: number;
  chinaFetched: number;
  chinaStored: number;
  chinaSyncIntensity: string;
  franceFetched: number;
  franceStored: number;
  franceSyncIntensity: string;
  germanyFetched: number;
  germanyStored: number;
  germanySyncIntensity: string;
  belgiumFetched: number;
  belgiumStored: number;
  belgiumSyncIntensity: string;
  canadaFetched: number;
  canadaStored: number;
  canadaSyncIntensity: string;
  japanFetched: number;
  japanStored: number;
  japanSyncIntensity: string;
  grandTotal: number;
  grandTotalOpen: number;
  sources: { source: string; fetched: number; added: number; errors: string[] }[];
  errors: string[];
}

function readSyncedFile(): Scholarship[] {
  try {
    if (!existsSync(SYNCED_FILE)) return [];
    const raw = readFileSync(SYNCED_FILE, "utf-8");
    const parsed = JSON.parse(raw) as { scholarships?: Scholarship[] };
    return Array.isArray(parsed.scholarships) ? parsed.scholarships : [];
  } catch {
    return [];
  }
}

function writeSyncedFile(scholarships: Scholarship[]) {
  mkdirSync(path.dirname(SYNCED_FILE), { recursive: true });
  writeFileSync(
    SYNCED_FILE,
    JSON.stringify(
      {
        syncedAt: new Date().toISOString(),
        count: scholarships.length,
        scholarships,
      },
      null,
      2,
    ),
    "utf-8",
  );
}

function shouldSkipChinaSync(): boolean {
  if (process.env.SKIP_CHINA_SYNC === "1") return true;
  if (process.env.CHINA_SYNC_MAX_PAGES === "skip") return true;
  return false;
}

export function loadSyncedScholarships(): Scholarship[] {
  return readSyncedFile();
}

export function loadChinaScholarships(): Scholarship[] {
  try {
    if (!existsSync(CHINA_FILE)) return [];
    const raw = readFileSync(CHINA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as { scholarships?: Scholarship[] };
    return Array.isArray(parsed.scholarships) ? parsed.scholarships : [];
  } catch {
    return [];
  }
}

const FRANCE_FILE = getFranceScholarshipsFilePath();
const GERMANY_FILE = getGermanyScholarshipsFilePath();
const BELGIUM_FILE = getBelgiumScholarshipsFilePath();
const CANADA_FILE = getCanadaScholarshipsFilePath();
const JAPAN_FILE = getJapanScholarshipsFilePath();

export function loadFranceScholarships(): Scholarship[] {
  try {
    if (!existsSync(FRANCE_FILE)) return [];
    const raw = readFileSync(FRANCE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as { scholarships?: Scholarship[] };
    return Array.isArray(parsed.scholarships) ? parsed.scholarships : [];
  } catch {
    return [];
  }
}

export function loadGermanyScholarships(): Scholarship[] {
  try {
    if (!existsSync(GERMANY_FILE)) return [];
    const raw = readFileSync(GERMANY_FILE, "utf-8");
    const parsed = JSON.parse(raw) as { scholarships?: Scholarship[] };
    return Array.isArray(parsed.scholarships) ? parsed.scholarships : [];
  } catch {
    return [];
  }
}

export function loadBelgiumScholarships(): Scholarship[] {
  try {
    if (!existsSync(BELGIUM_FILE)) return [];
    const raw = readFileSync(BELGIUM_FILE, "utf-8");
    const parsed = JSON.parse(raw) as { scholarships?: Scholarship[] };
    return Array.isArray(parsed.scholarships) ? parsed.scholarships : [];
  } catch {
    return [];
  }
}

export function loadCanadaScholarships(): Scholarship[] {
  try {
    if (!existsSync(CANADA_FILE)) return [];
    const raw = readFileSync(CANADA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as { scholarships?: Scholarship[] };
    return Array.isArray(parsed.scholarships) ? parsed.scholarships : [];
  } catch {
    return [];
  }
}

export function loadJapanScholarships(): Scholarship[] {
  try {
    if (!existsSync(JAPAN_FILE)) return [];
    const raw = readFileSync(JAPAN_FILE, "utf-8");
    const parsed = JSON.parse(raw) as { scholarships?: Scholarship[] };
    return Array.isArray(parsed.scholarships) ? parsed.scholarships : [];
  } catch {
    return [];
  }
}

export function loadAllScholarships(): Scholarship[] {
  return mergeScholarships([
    getStaticScholarships(),
    loadSyncedScholarships(),
    loadChinaScholarships(),
    loadFranceScholarships(),
    loadGermanyScholarships(),
    loadBelgiumScholarships(),
    loadCanadaScholarships(),
    loadJapanScholarships(),
  ]);
}

function resolveChinaMaxPages(): number {
  const fromEnv = process.env.CHINA_SYNC_MAX_PAGES;
  if (fromEnv !== undefined && fromEnv !== "") {
    const n = parseInt(fromEnv, 10);
    if (!Number.isNaN(n)) return n;
  }
  const intensity = getChinaSyncIntensity();
  if (intensity === "daily") return 600;
  if (intensity === "weekly") return 200;
  return 80;
}

export async function runScholarshipSync(): Promise<SyncReport> {
  const errors: string[] = [];
  const curated = getStaticScholarships();
  const existingSynced = readSyncedFile();
  const curatedAndCatalogIds = new Set(curated.map((s) => s.id));
  const existingLinks = new Set([
    ...curated.map((s) => s.lienOfficiel),
    ...existingSynced.map((s) => s.lienOfficiel),
  ]);

  const rssResults = await fetchAllRssSources();
  const newFromRss: Scholarship[] = [];

  for (const result of rssResults) {
    for (const item of result.items) {
      if (curatedAndCatalogIds.has(item.id)) continue;
      if (existingLinks.has(item.lienOfficiel)) continue;
      existingLinks.add(item.lienOfficiel);
      newFromRss.push(item);
    }
  }

  const mergedSynced = mergeScholarships([existingSynced, newFromRss]);
  writeSyncedFile(mergedSynced);

  const chinaIntensity = getChinaSyncIntensity();
  const chinaMaxPages = resolveChinaMaxPages();
  const chinaPartial = chinaMaxPages > 0;
  let chinaFetched = 0;
  let chinaStored = readChinaScholarshipsFromDisk().length;

  if (shouldSkipChinaSync()) {
    console.log(`  CUCAS Chine : ignoré (catalogue existant conservé, ${chinaStored} bourses)`);
  } else {
    try {
      const chinaScholarships = await fetchCucasChinaScholarships({
        maxPages: chinaMaxPages,
        onProgress: (page, added, total) => {
          if (page % 25 === 0) {
            console.log(`  CUCAS page ${page} (+${added}) → ${total} bourses Chine`);
          }
        },
      });
      chinaFetched = chinaScholarships.length;
      const writeResult = writeChinaScholarshipsFileSafe(chinaScholarships, {
        partial: chinaPartial,
      });
      if (writeResult === "skipped_downgrade") {
        console.warn(
          `  CUCAS Chine : sync partiel (${chinaFetched}) ignoré — catalogue existant (${chinaStored}) conservé. Utilisez npm run sync:china:full pour un import complet.`,
        );
        errors.push(
          `Chine : sync partiel non appliqué (${chinaFetched} < ${chinaStored} existantes)`,
        );
      } else {
        chinaStored = chinaScholarships.length;
      }
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Erreur sync CUCAS Chine");
    }
  }

  const franceIntensity = getFranceSyncIntensity();
  let franceFetched = 0;
  let franceStored = 0;

  try {
    const franceScholarships = await fetchCampusFranceScholarships();
    franceFetched = franceScholarships.length;
    writeFranceScholarshipsFile(franceScholarships);
    franceStored = franceScholarships.length;
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Erreur sync Campus France");
  }

  const germanyIntensity = getGermanySyncIntensity();
  let germanyFetched = 0;
  let germanyStored = 0;

  try {
    const germanyScholarships = await fetchDaadGermanyScholarships();
    germanyFetched = germanyScholarships.length;
    writeGermanyScholarshipsFile(germanyScholarships);
    germanyStored = germanyScholarships.length;
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Erreur sync DAAD Allemagne");
  }

  const belgiumIntensity = getBelgiumSyncIntensity();
  let belgiumFetched = 0;
  let belgiumStored = 0;

  try {
    const belgiumScholarships = await fetchBelgiumScholarships();
    belgiumFetched = belgiumScholarships.length;
    writeBelgiumScholarshipsFile(belgiumScholarships);
    belgiumStored = belgiumScholarships.length;
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Erreur sync Belgique");
  }

  const canadaIntensity = getCanadaSyncIntensity();
  let canadaFetched = 0;
  let canadaStored = 0;

  try {
    const canadaScholarships = await fetchCanadaScholarships();
    canadaFetched = canadaScholarships.length;
    writeCanadaScholarshipsFile(canadaScholarships);
    canadaStored = canadaScholarships.length;
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Erreur sync Canada");
  }

  const japanIntensity = getJapanSyncIntensity();
  let japanFetched = 0;
  let japanStored = 0;

  try {
    const japanScholarships = await fetchJapanScholarships();
    japanFetched = japanScholarships.length;
    writeJapanScholarshipsFile(japanScholarships);
    japanStored = japanScholarships.length;
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Erreur sync Japon");
  }

  const all = loadAllScholarships();
  const open = filterOpenScholarships(all.map((s) => withResolvedStatus(s)));

  const rssFetched = rssResults.reduce((n, r) => n + r.fetched, 0);
  const rssAdded = newFromRss.length;

  return {
    ok:
      (rssResults.every((r) => r.errors.length === 0) || rssAdded > 0) &&
      (chinaStored > 0 || franceStored > 0 || germanyStored > 0 || belgiumStored > 0 || canadaStored > 0 || japanStored > 0),
    syncedAt: new Date().toISOString(),
    curatedTotal: curated.length,
    rssFetched,
    rssAdded,
    syncedStored: mergedSynced.length,
    chinaFetched,
    chinaStored,
    chinaSyncIntensity: chinaIntensity,
    franceFetched,
    franceStored,
    franceSyncIntensity: franceIntensity,
    germanyFetched,
    germanyStored,
    germanySyncIntensity: germanyIntensity,
    belgiumFetched,
    belgiumStored,
    belgiumSyncIntensity: belgiumIntensity,
    canadaFetched,
    canadaStored,
    canadaSyncIntensity: canadaIntensity,
    japanFetched,
    japanStored,
    japanSyncIntensity: japanIntensity,
    grandTotal: all.length,
    grandTotalOpen: open.length,
    sources: [
      ...rssResults.map((r) => ({
        source: r.source,
        fetched: r.fetched,
        added: r.added,
        errors: r.errors,
      })),
      {
        source: "cucas-china",
        fetched: chinaFetched,
        added: chinaStored,
        errors: errors.filter((e) => e.includes("CUCAS")),
      },
      {
        source: "campusfrance",
        fetched: franceFetched,
        added: franceStored,
        errors: errors.filter((e) => e.includes("Campus France")),
      },
      {
        source: "daad-germany",
        fetched: germanyFetched,
        added: germanyStored,
        errors: errors.filter((e) => e.includes("DAAD")),
      },
      {
        source: "studyinbelgium",
        fetched: belgiumFetched,
        added: belgiumStored,
        errors: errors.filter((e) => e.includes("Belgique")),
      },
      {
        source: "canada",
        fetched: canadaFetched,
        added: canadaStored,
        errors: errors.filter((e) => e.includes("Canada")),
      },
      {
        source: "studyinjapan-jpss",
        fetched: japanFetched,
        added: japanStored,
        errors: errors.filter((e) => e.includes("Japon")),
      },
    ],
    errors,
  };
}
