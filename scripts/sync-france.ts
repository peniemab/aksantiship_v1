/**
 * Sync CampusBourses (Campus France) — ~380 programmes.
 * Usage : npm run sync:france
 */
import { fetchCampusFranceScholarships } from "../src/lib/bourses/sync/campus-france";
import { writeFranceScholarshipsFile } from "../src/lib/bourses/sync/france-storage";
import { resolveStatusFromDeadline } from "../src/lib/bourses/china-deadlines";

async function main() {
  console.log("Sync Campus France (CampusBourses)...\n");

  const scholarships = await fetchCampusFranceScholarships();
  writeFranceScholarshipsFile(scholarships);

  const open = scholarships.filter((s) => resolveStatusFromDeadline(s.dateCloture) !== "fermee");
  const france = scholarships.filter((s) => s.paysHote === "France").length;

  console.log(`Terminé : ${scholarships.length} programmes (${france} France)`);
  console.log(`Ouverts aujourd'hui : ${open.length}`);
  console.log(`Fichier : data/france-campusfrance-scholarships.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
