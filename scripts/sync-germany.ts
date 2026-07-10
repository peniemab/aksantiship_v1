/**
 * Sync catalogue DAAD (Allemagne) — ~163 programmes.
 * Usage : npm run sync:germany
 */
import { fetchDaadGermanyScholarships, resolveDaadCatalogEntries } from "../src/lib/bourses/sync/daad-germany";
import { writeGermanyScholarshipsFile } from "../src/lib/bourses/sync/germany-storage";
import { resolveStatusFromDeadline } from "../src/lib/bourses/china-deadlines";

async function main() {
  console.log("Sync Allemagne (catalogue DAAD)...\n");

  const { source } = await resolveDaadCatalogEntries();
  console.log(`Source catalogue : ${source === "live" ? "site DAAD (live)" : "snapshot local (daad-catalog-titles.json)"}\n`);

  const scholarships = await fetchDaadGermanyScholarships();
  writeGermanyScholarshipsFile(scholarships);

  const open = scholarships.filter((s) => resolveStatusFromDeadline(s.dateCloture) !== "fermee");
  const allemagne = scholarships.filter((s) => s.paysHote === "Allemagne").length;

  console.log(`Terminé : ${scholarships.length} programmes (${allemagne} Allemagne)`);
  console.log(`Ouverts aujourd'hui : ${open.length}`);
  console.log(`Fichier : data/germany-daad-scholarships.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
