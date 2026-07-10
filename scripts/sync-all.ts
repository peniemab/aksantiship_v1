/**
 * Sync complet — tous les pays branchés (RSS + France + Allemagne + Belgique + Canada + Japon).
 *
 * Usage :
 *   npm run sync:all              # Chine NON touchée (catalogue conservé)
 *   npm run sync:all -- --full    # + Chine catalogue complet CUCAS (~11 470)
 */
import { runScholarshipSync } from "../src/lib/bourses/sync/run-sync";

function resolveChinaFull(): boolean {
  return process.argv.includes("--full") || process.argv.includes("-f");
}

async function main() {
  const chinaFull = resolveChinaFull();
  if (chinaFull) {
    process.env.CHINA_SYNC_MAX_PAGES = "0";
  } else {
    process.env.SKIP_CHINA_SYNC = "1";
  }

  console.log("Sync global Aksantiship");
  console.log(
    `Chine : ${chinaFull ? "catalogue complet CUCAS" : "ignorée (npm run sync:china:full pour mettre à jour)"}\n`,
  );

  const report = await runScholarshipSync();

  console.log("\n--- Résumé ---");
  console.log(`RSS ajoutées        : ${report.rssAdded}`);
  console.log(`Chine               : ${report.chinaStored}`);
  console.log(`France              : ${report.franceStored}`);
  console.log(`Allemagne           : ${report.germanyStored}`);
  console.log(`Belgique            : ${report.belgiumStored}`);
  console.log(`Canada              : ${report.canadaStored}`);
  console.log(`Japon               : ${report.japanStored}`);
  console.log(`Total plateforme    : ${report.grandTotal}`);
  console.log(`Ouverts             : ${report.grandTotalOpen}`);

  if (report.errors.length) {
    console.warn("\nErreurs :", report.errors.join("\n  "));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
