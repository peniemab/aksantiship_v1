import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import type { Scholarship } from "../../types";

const BELGIUM_FILE = path.join(process.cwd(), "data", "belgium-scholarships.json");

export function writeBelgiumScholarshipsFile(scholarships: Scholarship[]) {
  mkdirSync(path.dirname(BELGIUM_FILE), { recursive: true });
  writeFileSync(
    BELGIUM_FILE,
    JSON.stringify(
      {
        syncedAt: new Date().toISOString(),
        count: scholarships.length,
        source: "belgium-multi",
        scholarships,
      },
      null,
      2,
    ),
    "utf-8",
  );
}

export function getBelgiumScholarshipsFilePath(): string {
  return BELGIUM_FILE;
}
