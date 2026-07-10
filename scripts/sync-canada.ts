/**
 * Sync bourses Canada — fédéral + portails universités (toutes provinces) + UdeM + UBC + U of T.
 * Usage : npm run sync:canada
 */
import { fetchCanadaScholarshipsDetailed } from "../src/lib/bourses/sync/canada-sync";
import { writeCanadaScholarshipsFile } from "../src/lib/bourses/sync/canada-storage";
import { resolveStatusFromDeadline } from "../src/lib/bourses/china-deadlines";

async function main() {
  console.log("Sync Canada (couverture nationale)...\n");

  const result = await fetchCanadaScholarshipsDetailed();
  writeCanadaScholarshipsFile(result.scholarships);

  const open = result.scholarships.filter(
    (s) => resolveStatusFromDeadline(s.dateCloture) !== "fermee",
  );

  console.log(`Fédéral ÉduCanada     : ${result.federal}`);
  console.log(`Portails universités  : ${result.portails}`);
  console.log(`UdeM (scrapé)         : ${result.udem}`);
  console.log(`UBC (scrapé)          : ${result.ubc}`);
  console.log(`U of T (scrapé)       : ${result.utoronto}`);
  console.log(`McGill (scrapé)     : ${result.mcgill}`);
  console.log(`Alberta (scrapé)    : ${result.ualberta}`);
  console.log(`Waterloo (scrapé)   : ${result.uwaterloo}`);
  console.log(`Laval (scrapé)      : ${result.ulaval}`);
  console.log(`Total fusionné        : ${result.merged}`);
  console.log(`Ouverts aujourd'hui   : ${open.length}`);
  if (result.errors.length) console.warn("Avertissements :", result.errors.join("; "));
  console.log(`Fichier : data/canada-educanada-scholarships.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
