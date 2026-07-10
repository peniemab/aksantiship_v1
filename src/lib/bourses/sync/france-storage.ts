import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import type { Scholarship } from "../../types";

const FRANCE_FILE = path.join(process.cwd(), "data", "france-campusfrance-scholarships.json");

export function writeFranceScholarshipsFile(scholarships: Scholarship[]) {
  mkdirSync(path.dirname(FRANCE_FILE), { recursive: true });
  writeFileSync(
    FRANCE_FILE,
    JSON.stringify(
      {
        syncedAt: new Date().toISOString(),
        count: scholarships.length,
        source: "campusfrance",
        scholarships,
      },
      null,
      2,
    ),
    "utf-8",
  );
}

export function getFranceScholarshipsFilePath(): string {
  return FRANCE_FILE;
}
