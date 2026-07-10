/**
 * Sync bourses Belgique — FWB, Flandre, universités, Communauté germanophone.
 * Usage : npm run sync:belgium
 */
import { fetchBelgiumScholarshipsDetailed } from "../src/lib/bourses/sync/studyinbelgium";
import { writeBelgiumScholarshipsFile } from "../src/lib/bourses/sync/belgium-storage";
import { resolveStatusFromDeadline } from "../src/lib/bourses/china-deadlines";
import { COMMUNAUTE_CG, COMMUNAUTE_FLANDRE } from "../src/lib/bourses/belgium-deadlines";

async function main() {
  console.log("Sync Belgique (FWB + Flandre + universités + CG)...\n");

  const result = await fetchBelgiumScholarshipsDetailed();
  writeBelgiumScholarshipsFile(result.scholarships);

  const { scholarships } = result;
  const open = scholarships.filter((s) => resolveStatusFromDeadline(s.dateCloture) !== "fermee");
  const fwb = scholarships.filter((s) => s.source === "studyinbelgium").length;
  const flanders = scholarships.filter((s) => s.communaute === COMMUNAUTE_FLANDRE).length;
  const cg = scholarships.filter((s) => s.communaute === COMMUNAUTE_CG).length;

  if (result.errors.length) {
    console.log("Avertissements :");
    for (const err of result.errors) console.log(`  - ${err}`);
    console.log();
  }

  console.log(
    `Sources : FWB ${result.fwb} | Flandre (scrapé) ${result.flanders} | UAntwerp ${result.uantwerp} | UGent ${result.ugent} | KU Leuven ${result.kuleuven} | CG ${result.cgermanophone}`,
  );
  console.log(`Terminé : ${scholarships.length} programmes (${fwb} FWB, ${flanders} Flandre, ${cg} CG)`);
  console.log(`Ouverts aujourd'hui : ${open.length}`);
  console.log(`Fichier : data/belgium-scholarships.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
