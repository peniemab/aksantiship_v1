import { mkdirSync, writeFileSync } from "fs";

const URLS: [string, string][] = [
  ["flanders-scholarships", "https://www.studyinflanders.be/scholarships"],
  ["kuleuven-index", "https://www.kuleuven.be/scholarships"],
  ["kuleuven-year", "https://www.kuleuven.be/scholarships/year/2026-2027"],
  ["ugent-scholarships", "https://www.ugent.be/en/study/enrolment/scholarships"],
  ["ugent-financing", "https://www.ugent.be/en/study/financing"],
  ["uantwerp-scholarships", "https://www.uantwerpen.be/en/study/scholarships/"],
  ["ugent-master-mind", "https://www.ugent.be/en/study/scholarships/master-mind-scholarships"],
  ["ugent-scholarships2", "https://www.ugent.be/en/study/scholarships"],
  ["kuleuven-scholarships", "https://www.kuleuven.be/english/scholarships?set_language=en"],
  ["ostbelgien", "https://ostbelgienbildung.be/desktopdefault.aspx/tabid-2336/"],
  ["wallonie-cg-fr", "https://www.wallonie.be/fr/demarches/beneficier-dune-allocations-detudes-dans-lenseignement-secondaire-une-haute-ecole-ou-luniversite"],
  ["wallonie-duo", "https://www.wallonie.be/fr/demarches/duo-laide-la-formation-pour-les-metiers-en-penurie-demander"],
];

async function main() {
  mkdirSync("data/samples/belgium", { recursive: true });
  for (const [id, url] of URLS) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Aksantiship/1.0)" },
        signal: AbortSignal.timeout(35_000),
      });
      const html = await res.text();
      writeFileSync(`data/samples/belgium/${id}.html`, html, "utf-8");
      const h2 = (html.match(/<h2/gi) ?? []).length;
      const h3 = (html.match(/<h3/gi) ?? []).length;
      const kw = (html.match(/scholarship|bourse|stipend|grant|award/gi) ?? []).length;
      console.log(id, res.status, html.length, "h2", h2, "h3", h3, "kw", kw);
    } catch (e) {
      console.log(id, "ERR", e instanceof Error ? e.message : e);
    }
  }
}

main();
