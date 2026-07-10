import { writeFileSync } from "fs";

const PROBES = [
  ["studycanada", "https://studycanada.ca/english/scholarships_international_students.htm"],
  ["ubc-awards", "https://you.ubc.ca/financial-planning/scholarships-awards-international-students/"],
  ["utoronto-future", "https://future.utoronto.ca/scholarships-international-students/"],
  ["mcgill-aid", "https://www.mcgill.ca/awards/search"],
  ["york-sfs", "https://sfs.yorku.ca/awards/international-students"],
  ["ualberta-awards", "https://www.ualberta.ca/en/admissions/tuition-and-scholarships/undergraduate/international/index.html"],
  ["laval-bourses", "https://www.ulaval.ca/etudes/bourses-et-aide-financiere/bourses"],
  ["concordia-funding", "https://www.concordia.ca/admissions/funding.html"],
  ["educanada-search", "https://www.educanada.ca/scholarships-bourses/search-scholarships-rechercher-bourses.aspx?lang=fra"],
  ["vanier-en", "https://vanier.gc.ca/en/home-accueil.html"],
  ["banting", "https://banting.fellowships-bourses.gc.ca/en/app-accueil.html"],
];

async function main() {
  for (const [id, url] of PROBES) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(25_000),
      });
      const html = await res.text();
      writeFileSync(`data/samples/canada/${id}.html`, html, "utf-8");
      const rows = (html.match(/<tr/gi) ?? []).length;
      const h3 = (html.match(/<h3/gi) ?? []).length;
      const ext = (html.match(/https?:\/\/[^"'\s]+\.ca[^"'\s]*/gi) ?? []).length;
      console.log(id, res.status, html.length, "tr", rows, "h3", h3, "ca-links", ext);
    } catch (e) {
      console.log(id, "ERR", e instanceof Error ? e.message : e);
    }
  }
}

main();
