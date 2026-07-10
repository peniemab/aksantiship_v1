/**
 * Synchronise les bourses depuis les flux RSS.
 * Usage : npm run sync:bourses
 */
import { runScholarshipSync } from "../src/lib/bourses/sync/run-sync";

async function main() {
  console.log("Synchronisation des bourses Aksantiship...\n");
  const report = await runScholarshipSync();

  for (const src of report.sources) {
    console.log(`  ${src.source}: ${src.fetched} lus, ${src.added} normalises`);
    for (const err of src.errors) console.log(`    ! ${err}`);
  }

  console.log("\nResultat");
  console.log(`  Catalogue statique : ${report.curatedTotal}`);
  console.log(`  RSS recuperes     : ${report.rssFetched}`);
  console.log(`  Nouveaux RSS      : ${report.rssAdded}`);
  console.log(`  CUCAS Chine       : ${report.chinaStored} (intensite: ${report.chinaSyncIntensity})`);
  console.log(`  Campus France     : ${report.franceStored} (intensite: ${report.franceSyncIntensity})`);
  console.log(`  DAAD Allemagne    : ${report.germanyStored} (intensite: ${report.germanySyncIntensity})`);
  console.log(`  Belgique          : ${report.belgiumStored} (intensite: ${report.belgiumSyncIntensity})`);
  console.log(`  Canada            : ${report.canadaStored} (intensite: ${report.canadaSyncIntensity})`);
  console.log(`  Japon             : ${report.japanStored} (intensite: ${report.japanSyncIntensity})`);
  console.log(`  TOTAL catalogue   : ${report.grandTotal}`);
  console.log(`  TOTAL ouvertes    : ${report.grandTotalOpen}`);

  if (report.errors.length) {
    console.log("\nErreurs:", report.errors.join("; "));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
