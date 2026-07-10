import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import type { Scholarship } from "../../types";

/** Même convention que `china-cucas-scholarships.json`, `france-campusfrance-scholarships.json`, etc. */
const JAPAN_FILE = path.join(
  process.cwd(),
  "data",
  "japan-studyinjapan-jpss-scholarships.json",
);

export function writeJapanScholarshipsFile(scholarships: Scholarship[]) {
  mkdirSync(path.dirname(JAPAN_FILE), { recursive: true });
  writeFileSync(
    JAPAN_FILE,
    JSON.stringify(
      {
        syncedAt: new Date().toISOString(),
        count: scholarships.length,
        source: "studyinjapan-jpss",
        scholarships,
      },
      null,
      2,
    ),
    "utf-8",
  );
}

export function getJapanScholarshipsFilePath(): string {
  return JAPAN_FILE;
}
