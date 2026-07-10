/**
 * Sync CUCAS Chine uniquement (11 470+ bourses répertoriées).
 *
 * Usage :
 *   npm run sync:china              # ~400 pages (~3500 bourses)
 *   npm run sync:china:full         # catalogue complet (~1147 pages, reprise auto)
 *   npm run sync:china -- --pages=200
 */
import { fetchCucasChinaScholarships } from "../src/lib/bourses/sync/cucas-china";
import {
  clearChinaSyncState,
  readChinaScholarshipsFromDisk,
  readChinaSyncState,
  writeChinaScholarshipsFile,
  writeChinaSyncState,
} from "../src/lib/bourses/sync/china-storage";

function resolveMaxPages(): number {
  const args = process.argv.slice(2);

  if (args.includes("--full") || args.includes("-f")) {
    return 0;
  }

  const pagesArg = args.find((a) => a.startsWith("--pages="));
  if (pagesArg) {
    const n = parseInt(pagesArg.split("=")[1] ?? "", 10);
    if (!Number.isNaN(n) && n >= 0) return n;
  }

  const raw = process.env.CHINA_SYNC_MAX_PAGES;
  if (raw !== undefined && raw !== "") {
    const n = parseInt(raw, 10);
    if (!Number.isNaN(n) && n >= 0) return n;
  }

  return 400;
}

async function main() {
  const maxPages = resolveMaxPages();
  const isFull = maxPages === 0;
  const label = isFull ? "illimité (~11 470 bourses)" : `${maxPages} pages`;

  const existing = isFull ? readChinaScholarshipsFromDisk() : [];
  const resume = isFull && (process.argv.includes("--resume") || process.env.CHINA_SYNC_RESUME === "1");
  const startPage = 1;

  console.log(`Sync CUCAS Chine (max ${label})...\n`);
  if (isFull && resume && existing.length > 0) {
    console.log(
      `  Reprise (fusion) : ${existing.length} bourses en base, re-fetch depuis page 1\n`,
    );
  }

  const scholarships = await fetchCucasChinaScholarships({
    maxPages,
    startPage,
    initialScholarships: isFull && resume ? existing : undefined,
    delayMs: isFull ? 600 : 250,
    checkpointEvery: isFull ? 50 : 0,
    onCheckpoint: isFull
      ? (partial, page) => {
          writeChinaScholarshipsFile(partial);
          writeChinaSyncState({
            lastPage: page,
            count: partial.length,
            syncedAt: new Date().toISOString(),
          });
          console.log(`  ↳ checkpoint page ${page} → ${partial.length} bourses sauvegardées`);
        }
      : undefined,
    onProgress: (page, added, total) => {
      if (page % 20 === 0 || page === 1) {
        console.log(`  page ${page} (+${added}) → ${total} bourses`);
      }
    },
  });

  writeChinaScholarshipsFile(scholarships);
  if (isFull) clearChinaSyncState();

  const chine = scholarships.filter((s) => s.paysHote === "Chine").length;
  console.log(`\nTerminé : ${scholarships.length} bourses enregistrées (${chine} Chine)`);
  console.log(`Fichier : data/china-cucas-scholarships.json`);
}

main().catch((e) => {
  console.error(e);
  console.error(
    "\nSync interrompu. Relancez npm run sync:china:full — la reprise reprendra au dernier checkpoint.",
  );
  process.exit(1);
});
