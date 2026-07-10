import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import type { Scholarship } from "../../types";

const GERMANY_FILE = path.join(process.cwd(), "data", "germany-daad-scholarships.json");

export function writeGermanyScholarshipsFile(scholarships: Scholarship[]) {
  mkdirSync(path.dirname(GERMANY_FILE), { recursive: true });
  writeFileSync(
    GERMANY_FILE,
    JSON.stringify(
      {
        syncedAt: new Date().toISOString(),
        count: scholarships.length,
        source: "daad",
        scholarships,
      },
      null,
      2,
    ),
    "utf-8",
  );
}

export function getGermanyScholarshipsFilePath(): string {
  return GERMANY_FILE;
}
