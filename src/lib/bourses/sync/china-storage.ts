import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import type { Scholarship } from "../../types";

const CHINA_FILE = path.join(process.cwd(), "data", "china-cucas-scholarships.json");
const CHINA_STATE_FILE = path.join(process.cwd(), "data", "china-cucas-sync-state.json");

export function getChinaScholarshipsFilePath(): string {
  return CHINA_FILE;
}

export function readChinaScholarshipsFromDisk(): Scholarship[] {
  try {
    if (!existsSync(CHINA_FILE)) return [];
    const raw = readFileSync(CHINA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as { scholarships?: Scholarship[] };
    return Array.isArray(parsed.scholarships) ? parsed.scholarships : [];
  } catch {
    return [];
  }
}

export function writeChinaScholarshipsFile(scholarships: Scholarship[]) {
  mkdirSync(path.dirname(CHINA_FILE), { recursive: true });
  writeFileSync(
    CHINA_FILE,
    JSON.stringify(
      {
        syncedAt: new Date().toISOString(),
        count: scholarships.length,
        source: "cucas",
        scholarships,
      },
      null,
      2,
    ),
    "utf-8",
  );
}

export interface ChinaSyncState {
  lastPage: number;
  count: number;
  syncedAt: string;
}

export function readChinaSyncState(): ChinaSyncState | null {
  try {
    if (!existsSync(CHINA_STATE_FILE)) return null;
    return JSON.parse(readFileSync(CHINA_STATE_FILE, "utf-8")) as ChinaSyncState;
  } catch {
    return null;
  }
}

export function writeChinaSyncState(state: ChinaSyncState) {
  mkdirSync(path.dirname(CHINA_STATE_FILE), { recursive: true });
  writeFileSync(CHINA_STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
}

export function clearChinaSyncState() {
  if (existsSync(CHINA_STATE_FILE)) {
    writeFileSync(CHINA_STATE_FILE, "{}", "utf-8");
  }
}

export type ChinaWriteResult = "written" | "skipped_downgrade";

/**
 * N'écrase pas un catalogue complet avec un sync partiel (ex. sync:all sans --full).
 * Force avec CHINA_SYNC_FORCE=1 si besoin.
 */
export function writeChinaScholarshipsFileSafe(
  scholarships: Scholarship[],
  options: { partial: boolean },
): ChinaWriteResult {
  const force = process.env.CHINA_SYNC_FORCE === "1";
  const existing = readChinaScholarshipsFromDisk();

  if (
    !force &&
    options.partial &&
    existing.length > 0 &&
    scholarships.length < existing.length
  ) {
    return "skipped_downgrade";
  }

  writeChinaScholarshipsFile(scholarships);
  return "written";
}
