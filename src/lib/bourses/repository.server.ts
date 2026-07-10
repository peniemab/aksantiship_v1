import "server-only";

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";
import type { Scholarship } from "../types";
import {
  getStaticScholarships,
  mergeScholarships,
  getScholarshipMergeMeta,
} from "./load-scholarships";
import { filterScholarshipsBySearch } from "./filters";
import { resolveCountryFromSlug } from "./countries";
import type { BourseRepositoryQuery } from "./types";
import { FEATURED_SCHOLARSHIP_IDS } from "@/lib/data/scholarships";
import { filterOpenScholarships, withResolvedStatus } from "./scholarship-lifecycle";
import { getChinaScholarshipsFilePath } from "./sync/china-storage";
import { getFranceScholarshipsFilePath } from "./sync/france-storage";
import { getGermanyScholarshipsFilePath } from "./sync/germany-storage";
import { getBelgiumScholarshipsFilePath } from "./sync/belgium-storage";
import { getCanadaScholarshipsFilePath } from "./sync/canada-storage";
import { getJapanScholarshipsFilePath } from "./sync/japan-storage";

const SYNCED_FILE = path.join(process.cwd(), "data", "scholarships-synced.json");
const CHINA_FILE = getChinaScholarshipsFilePath();
const FRANCE_FILE = getFranceScholarshipsFilePath();
const GERMANY_FILE = getGermanyScholarshipsFilePath();
const BELGIUM_FILE = getBelgiumScholarshipsFilePath();
const CANADA_FILE = getCanadaScholarshipsFilePath();
const JAPAN_FILE = getJapanScholarshipsFilePath();

function readJsonScholarships(filePath: string): Scholarship[] {
  try {
    if (!existsSync(filePath)) return [];
    const raw = readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw) as { scholarships?: Scholarship[] };
    return Array.isArray(parsed.scholarships) ? parsed.scholarships : [];
  } catch {
    return [];
  }
}

function readSyncedFromDisk(): Scholarship[] {
  return readJsonScholarships(SYNCED_FILE);
}

export function readChinaFromDisk(): Scholarship[] {
  return readJsonScholarships(CHINA_FILE);
}

export function readFranceFromDisk(): Scholarship[] {
  return readJsonScholarships(FRANCE_FILE);
}

export function readGermanyFromDisk(): Scholarship[] {
  return readJsonScholarships(GERMANY_FILE);
}

export function readBelgiumFromDisk(): Scholarship[] {
  return readJsonScholarships(BELGIUM_FILE);
}

export function readCanadaFromDisk(): Scholarship[] {
  return readJsonScholarships(CANADA_FILE);
}

export function readJapanFromDisk(): Scholarship[] {
  return readJsonScholarships(JAPAN_FILE);
}

export function loadAllScholarshipsServer(): Scholarship[] {
  return mergeScholarships([
    getStaticScholarships(),
    readSyncedFromDisk(),
    readChinaFromDisk(),
    readFranceFromDisk(),
    readGermanyFromDisk(),
    readBelgiumFromDisk(),
    readCanadaFromDisk(),
    readJapanFromDisk(),
  ]).map((s) => withResolvedStatus(s));
}

export function listBoursesServer(query: BourseRepositoryQuery = {}): Scholarship[] {
  let results = [...loadAllScholarshipsServer()];

  if (query.featured) {
    const all = loadAllScholarshipsServer();
    results = FEATURED_SCHOLARSHIP_IDS.map((id) => all.find((s) => s.id === id)).filter(
      (s): s is Scholarship => s !== undefined,
    );
  }

  if (!query.status && !query.includeClosed) {
    results = filterOpenScholarships(results);
  }

  if (query.status) {
    results = results.filter((s) => s.status === query.status);
  }

  results = filterScholarshipsBySearch(results, {
    query: query.q,
    pays: query.pays,
    cycle: query.cycle,
    nationalite: query.nationalite,
    langue: query.langue,
    communaute: query.communaute,
    langueEnseignement: query.langueEnseignement,
    typeCandidature: query.typeCandidature,
  });

  return results.sort((a, b) => a.dateCloture.localeCompare(b.dateCloture));
}

export function listScholarshipCountriesServer(): string[] {
  const open = filterOpenScholarships(loadAllScholarshipsServer());
  return [...new Set(open.map((s) => s.paysHote))].sort((a, b) => a.localeCompare(b, "fr"));
}

export function getBourseByIdServer(id: string): Scholarship | undefined {
  return loadAllScholarshipsServer().find((s) => s.id === id);
}

export function countBoursesServer(): number {
  return filterOpenScholarships(loadAllScholarshipsServer()).length;
}

export function countAllBoursesServer(): number {
  return loadAllScholarshipsServer().length;
}

export function getScholarshipStatsServer() {
  return getScholarshipMergeMeta(loadAllScholarshipsServer());
}

export function countBoursesByCountryServer(country: string): number {
  return filterOpenScholarships(loadAllScholarshipsServer()).filter((s) => s.paysHote === country)
    .length;
}

export function listBoursesByCountrySlugServer(slug: string): Scholarship[] {
  const countries = listScholarshipCountriesServer();
  const country = resolveCountryFromSlug(slug, countries);
  if (!country) return [];
  return listBoursesServer({ pays: country });
}
