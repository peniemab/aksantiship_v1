/**
 * Sync bourses Japon — MEXT curaté + JPSS (~140) + Study in Japan JASSO (~664).
 * Usage : npm run sync:japan
 */
import { fetchJapanScholarshipsDetailed } from "../src/lib/bourses/sync/japan-sync";
import { writeJapanScholarshipsFile } from "../src/lib/bourses/sync/japan-storage";
import { resolveStatusFromDeadline } from "../src/lib/bourses/china-deadlines";

async function main() {
  console.log("Sync Japon (Study in Japan + JPSS)...\n");

  const result = await fetchJapanScholarshipsDetailed();
  writeJapanScholarshipsFile(result.scholarships);

  const open = result.scholarships.filter(
    (s) => resolveStatusFromDeadline(s.dateCloture) !== "fermee",
  );

  console.log(`Curaté MEXT/portails : ${result.curated}`);
  console.log(`JPSS                 : ${result.jpss}`);
  console.log(`JASSO search         : ${result.jasso}`);
  console.log(`Total fusionné       : ${result.merged}`);
  console.log(`Ouverts aujourd'hui  : ${open.length}`);
  if (result.errors.length) {
    console.warn("Avertissements :", result.errors.join("; "));
  }
  console.log(`Fichier : data/japan-studyinjapan-jpss-scholarships.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
