export interface UdemBourseEntry {
  title: string;
  path: string;
  montant?: string;
  dateLimiteIso?: string;
  description?: string;
  expired: boolean;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;|&lsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseUdemBoursesHtml(html: string): UdemBourseEntry[] {
  const items: UdemBourseEntry[] = [];
  const regex =
    /<a class="([^"]*)" href="(\/repertoire-des-bourses\/detail-dune-bourse\/[^"]+)">([\s\S]*?)<\/a>/gi;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const block = match[3];
    const titleMatch = block.match(/<h3 class="titre"[^>]*>([\s\S]*?)<\/h3>/);
    if (!titleMatch) continue;

    const title = decodeHtmlEntities(titleMatch[1].replace(/<[^>]+>/g, ""));
    const montantMatch = block.match(/Montant[^<]*<b>([\s\S]*?)<\/b>/);
    const dateMatch = block.match(/data-sort-value="([^"]+)"/);
    const descMatch = block.match(
      /<div class="tx-udembourses-description-courte">\s*([\s\S]*?)\s*<\/div>/,
    );

    items.push({
      title,
      path: match[2],
      montant: montantMatch ? decodeHtmlEntities(montantMatch[1]) : undefined,
      dateLimiteIso: dateMatch?.[1],
      description: descMatch ? decodeHtmlEntities(descMatch[1]) : undefined,
      expired: match[1].includes("expiree"),
    });
  }

  const byPath = new Map<string, UdemBourseEntry>();
  for (const item of items) {
    byPath.set(item.path, item);
  }
  return [...byPath.values()];
}

export function buildUdemBourseUrl(path: string): string {
  return `https://bourses.umontreal.ca${path}`;
}

export interface CanadaScrapedAward {
  title: string;
  url: string;
  summary?: string;
  montant?: string;
  organisme: string;
  province: string;
  source: string;
  dateLimite?: string;
}

const UBC_BASE = "https://you.ubc.ca";

export function parseUbcInternationalAwardsHtml(html: string): CanadaScrapedAward[] {
  const items: CanadaScrapedAward[] = [];

  const h3Regex = /<h3 class="h4">([\s\S]*?)<\/h3>\s*<div class="description">([\s\S]*?)<\/div>/gi;
  let m: RegExpExecArray | null;
  while ((m = h3Regex.exec(html)) !== null) {
    const title = decodeHtmlEntities(m[1].replace(/<[^>]+>/g, ""));
    const summary = decodeHtmlEntities(m[2].replace(/<[^>]+>/g, " ").slice(0, 400));
    const montant = summary.match(/\$[\d,]+(?:\s*–\s*\$[\d,]+)?(?:\s*\/\s*year)?/i)?.[0];
    if (title.length < 4) continue;
    items.push({
      title,
      url: `${UBC_BASE}/financial-planning/scholarships-awards-international-students/`,
      summary,
      montant,
      organisme: "University of British Columbia",
      province: "Colombie-Britannique",
      source: "ubc",
    });
  }

  const linkRegex =
    /href="(https:\/\/you\.ubc\.ca\/financial-planning\/scholarships-awards-international-students\/[^"]+)">([^<]+)</gi;
  while ((m = linkRegex.exec(html)) !== null) {
    const title = decodeHtmlEntities(m[2].trim());
    if (title.length < 4 || title.includes("Scholarships and awards")) continue;
    items.push({
      title,
      url: m[1],
      organisme: "University of British Columbia",
      province: "Colombie-Britannique",
      source: "ubc",
    });
  }

  return dedupeCanadaAwards(items);
}

const UOFT_BASE = "https://future.utoronto.ca";

export function parseUofTorontoInternationalAwardsHtml(html: string): CanadaScrapedAward[] {
  const items: CanadaScrapedAward[] = [];

  const blocks = html.split("m-accordion-item js-accordion-item");
  for (const block of blocks.slice(1)) {
    const titleMatch = block.match(
      /<h3 class="a-heading__h4 a-heading__accordion[^>]*>([\s\S]*?)<\/h3>/i,
    );
    if (!titleMatch) continue;
    const title = decodeHtmlEntities(titleMatch[1].replace(/<[^>]+>/g, "").trim());
    if (title.length < 4) continue;
    const href = block.match(/href="(\/[^"]+)"/)?.[1];
    const summary = decodeHtmlEntities(
      block.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 400),
    );
    items.push({
      title,
      url: href ? `${UOFT_BASE}${href}` : `${UOFT_BASE}/scholarships-international-students`,
      summary,
      organisme: "University of Toronto",
      province: "Ontario",
      source: "utoronto",
    });
  }

  const cardRegex =
    /<h2 class="a-heading__h3[^"]*"[^>]*>\s*([\s\S]*?)<\/h2>[\s\S]{0,2500}?<a href="(\/[^"]+)"/gi;
  let m: RegExpExecArray | null;
  while ((m = cardRegex.exec(html)) !== null) {
    const title = decodeHtmlEntities(m[1].replace(/<[^>]+>/g, "").trim());
    if (!/scholarship|award|pearson|bourse|program/i.test(title)) continue;
    items.push({
      title,
      url: `${UOFT_BASE}${m[2]}`,
      organisme: "University of Toronto",
      province: "Ontario",
      source: "utoronto",
    });
  }

  return dedupeCanadaAwards(items);
}

function dedupeCanadaAwards(items: CanadaScrapedAward[]): CanadaScrapedAward[] {
  const byKey = new Map<string, CanadaScrapedAward>();
  for (const item of items) {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]+/g, "");
    if (!byKey.has(key)) byKey.set(key, item);
  }
  return [...byKey.values()];
}

const MCGILL_BASE = "https://www.mcgill.ca";
const MCGILL_ORG = "McGill University";

function mcgillAward(
  title: string,
  url: string,
  summary?: string,
  montant?: string,
): CanadaScrapedAward {
  return {
    title,
    url,
    summary,
    montant,
    organisme: MCGILL_ORG,
    province: "Québec",
    source: "mcgill",
  };
}

function isMcGillFundingTitle(title: string): boolean {
  return /scholarship|award|bursary|fellowship|bourse|canada award|leadership|exchange|refugee|perspective|schulich|hero|athlete|indigenous|inclusion/i.test(
    title,
  );
}

function isMcGillExcludedTitle(title: string): boolean {
  return /bank loans?|private loans?|emergency loans?|^external awards?$/i.test(title.trim());
}

export function parseMcGillEntranceScholarshipsHtml(html: string): CanadaScrapedAward[] {
  const items: CanadaScrapedAward[] = [];
  const skipHeading =
    /overview|eligibility|maximum one|deferring|benefits|complete list|important entrance/i;

  const h3Regex = /<h3>([\s\S]*?)<\/h3>/gi;
  let m: RegExpExecArray | null;
  while ((m = h3Regex.exec(html)) !== null) {
    const raw = decodeHtmlEntities(m[1].replace(/<[^>]+>/g, ""));
    if (raw.length < 8 || skipHeading.test(raw)) continue;
    if (!/scholarship|award|\$[\d,]/i.test(raw)) continue;
    const montant = raw.match(/\$[\d,]+(?:\s*–\s*\$[\d,]+)?(?:\s*per annum)?/i)?.[0];
    items.push(
      mcgillAward(
        raw.replace(/\s*\(value:.*$/i, "").trim(),
        `${MCGILL_BASE}/studentaid/scholarships-aid/future-undergrads/entrance-scholarships`,
        raw,
        montant,
      ),
    );
  }

  const strongRegex = /<strong>([^<]*(?:Scholarship|Award)[^<]*)<\/strong>,?\s*valued at ([^<]+)/gi;
  while ((m = strongRegex.exec(html)) !== null) {
    items.push(
      mcgillAward(
        decodeHtmlEntities(m[1]),
        `${MCGILL_BASE}/studentaid/scholarships-aid/future-undergrads/entrance-scholarships`,
        undefined,
        decodeHtmlEntities(m[2]),
      ),
    );
  }

  const facultyBlock = html.match(/Faculty-specific Entrance Scholarships[\s\S]*?<hr/i)?.[0] ?? "";
  const facultyRegex =
    /<a href="(https:\/\/www\.mcgill\.ca\/(?:music|law|medadmissions|dentistry)[^"]*)">([^<]+)<\/a>/gi;
  while ((m = facultyRegex.exec(facultyBlock)) !== null) {
    const faculty = decodeHtmlEntities(m[2]);
    items.push(
      mcgillAward(
        `${faculty} — Faculty entrance scholarships`,
        m[1],
        "Bourses d'entrée propres à la faculté — McGill",
      ),
    );
  }

  const calendarMatch = html.match(
    /href="(\/studentawards\/[^"]+\.pdf)"[^>]*>Undergraduate Scholarships and Awards calendar/i,
  );
  if (calendarMatch) {
    items.push(
      mcgillAward(
        "Undergraduate Scholarships and Awards Calendar (McGill)",
        `${MCGILL_BASE}${calendarMatch[1]}`,
        "Calendrier officiel PDF — liste complète des bourses de premier cycle",
      ),
    );
  }

  return dedupeCanadaAwards(items);
}

export function parseMcGillSpecialFundingLinksHtml(html: string): CanadaScrapedAward[] {
  const items: CanadaScrapedAward[] = [];
  const linkRegex = /<a href="(\/studentaid\/special-funding\/[^"]+)">([^<]+)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = linkRegex.exec(html)) !== null) {
    const title = decodeHtmlEntities(m[2]);
    if (isMcGillExcludedTitle(title)) continue;
    if (!isMcGillFundingTitle(title)) continue;
    items.push(mcgillAward(title, `${MCGILL_BASE}${m[1]}`));
  }
  return dedupeCanadaAwards(items);
}

export function parseMcGillPagesHtml(
  pages: { html: string; url: string }[],
): CanadaScrapedAward[] {
  const items: CanadaScrapedAward[] = [];
  for (const page of pages) {
    if (page.url.includes("entrance-scholarships")) {
      items.push(...parseMcGillEntranceScholarshipsHtml(page.html));
    } else if (page.url.includes("special-funding")) {
      items.push(...parseMcGillSpecialFundingLinksHtml(page.html));
    }
  }
  return dedupeCanadaAwards(items);
}

const ALBERTA_ORG = "University of Alberta";

function albertaAward(
  title: string,
  url: string,
  summary?: string,
  montant?: string,
): CanadaScrapedAward {
  return {
    title,
    url,
    summary,
    montant,
    organisme: ALBERTA_ORG,
    province: "Alberta",
    source: "ualberta",
  };
}

export function parseAlbertaInternationalScholarshipsHtml(
  html: string,
  pageUrl: string,
): CanadaScrapedAward[] {
  const items: CanadaScrapedAward[] = [];
  const skip = /our rankings|our programs|our campuses|live on campus|tuition guarantee|work integrated|questions\?/i;

  const h3Regex = /<h3(?![^>]*class="card-title")>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/gi;
  let m: RegExpExecArray | null;
  while ((m = h3Regex.exec(html)) !== null) {
    const title = decodeHtmlEntities(m[1].replace(/<[^>]+>/g, "").trim());
    const summary = decodeHtmlEntities(m[2].replace(/<[^>]+>/g, " ").trim());
    if (title.length < 6 || skip.test(title)) continue;
    if (!/scholarship|award|distinction|gold standard|regional/i.test(title)) continue;
    const montant =
      summary.match(/(?:CAN\s*)?\$[\d,]+(?:\s*(?:–|-)\s*(?:CAN\s*)?\$[\d,]+)?(?:\s*per year)?/i)?.[0] ??
      title.match(/(?:CAN\s*)?\$[\d,]+/i)?.[0];
    items.push(albertaAward(title, pageUrl, summary, montant?.replace(/\s+/g, " ")));
  }

  const liRegex = /<li>([\s\S]*?(?:Scholarship|scholarship|Distinction)[\s\S]*?)<\/li>/gi;
  while ((m = liRegex.exec(html)) !== null) {
    const raw = decodeHtmlEntities(m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    const parts = raw.split(/\s*(?:—|–|-)\s+/);
    if (parts.length < 2) continue;
    const title = parts[0].trim();
    const summary = parts.slice(1).join(" — ");
    if (title.length < 8) continue;
    const montant = raw.match(/\$[\d,]+(?:\s*(?:–|-)\s*\$[\d,]+)?/i)?.[0];
    items.push(albertaAward(title, pageUrl, summary, montant));
  }

  return dedupeCanadaAwards(items);
}

const WATERLOO_BASE = "https://uwaterloo.ca";
const WATERLOO_ORG = "University of Waterloo";

function waterlooAward(
  title: string,
  url: string,
  summary?: string,
  montant?: string,
  dateLimite?: string,
): CanadaScrapedAward {
  return {
    title,
    url,
    summary,
    montant,
    dateLimite,
    organisme: WATERLOO_ORG,
    province: "Ontario",
    source: "uwaterloo",
  };
}

function resolveWaterlooUrl(href: string, pageUrl: string): string {
  if (href.startsWith("http")) return href;
  if (href.startsWith("#")) return `${pageUrl}${href}`;
  if (href.startsWith("/")) return `${WATERLOO_BASE}${href}`;
  return `${WATERLOO_BASE}/${href}`;
}

export function parseWaterlooInternationalScholarshipsHtml(
  html: string,
  pageUrl: string,
): CanadaScrapedAward[] {
  const items: CanadaScrapedAward[] = [];

  if (/International Student Entrance Scholarship/i.test(html)) {
    items.push(
      waterlooAward(
        "International Student Entrance Scholarship ($10,000)",
        pageUrl,
        "Étudiants internationaux admis à temps plein en 1re année — aucune candidature requise",
        "$10,000",
      ),
    );
  }

  const tableBlock = html.match(/<table>[\s\S]*?<\/table>/gi) ?? [];
  for (const table of tableBlock) {
    if (!table.includes("Scholarship</th>") && !table.includes("Scholarship</td>")) continue;
    const rowRegex = /<tr>([\s\S]*?)<\/tr>/gi;
    let row: RegExpExecArray | null;
    while ((row = rowRegex.exec(table)) !== null) {
      const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) => c[1]);
      if (cells.length < 3) continue;
      const titleCell = cells[0];
      const titleMatch = titleCell.match(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
      const title = decodeHtmlEntities(
        (titleMatch?.[2] ?? titleCell).replace(/<[^>]+>/g, "").trim(),
      );
      if (title.length < 6 || /programs or eligibility|application required/i.test(title)) continue;
      const href = titleMatch?.[1];
      const url = href ? resolveWaterlooUrl(href, pageUrl) : pageUrl;
      const eligibility = decodeHtmlEntities(cells[1].replace(/<[^>]+>/g, " ").trim());
      const montant = decodeHtmlEntities(cells[2].replace(/<[^>]+>/g, " ").trim());
      const application = cells[3]
        ? decodeHtmlEntities(cells[3].replace(/<[^>]+>/g, " ").trim())
        : "";
      let dateLimite: string | undefined;
      const appDate = application.match(/(?:by\s+)?([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i);
      if (appDate) {
        const parsed = Date.parse(appDate[1]);
        if (!Number.isNaN(parsed)) dateLimite = new Date(parsed).toISOString().slice(0, 10);
      }
      items.push(
        waterlooAward(
          title,
          url,
          [eligibility, application].filter(Boolean).join(" — "),
          montant,
          dateLimite,
        ),
      );
    }
  }

  return dedupeCanadaAwards(items);
}

const ULaval_BASE = "https://www.ulaval.ca";
const ULaval_BBAF_BASE = "https://repertoire.bbaf.ulaval.ca";
const ULaval_ORG = "Université Laval";

function ulavalAward(
  title: string,
  url: string,
  summary?: string,
  montant?: string,
  dateLimite?: string,
): CanadaScrapedAward {
  return {
    title,
    url,
    summary,
    montant,
    dateLimite,
    organisme: ULaval_ORG,
    province: "Québec",
    source: "ulaval",
  };
}

function resolveUlavalUrl(href: string): string {
  if (href.startsWith("http")) return href;
  if (href.startsWith("/")) return `${ULaval_BASE}${href}`;
  return `${ULaval_BASE}/${href}`;
}

function parseFrenchDeadline(text: string): string | undefined {
  const months: Record<string, number> = {
    janvier: 1,
    fevrier: 2,
    février: 2,
    mars: 3,
    avril: 4,
    mai: 5,
    juin: 6,
    juillet: 7,
    aout: 8,
    août: 8,
    septembre: 9,
    octobre: 10,
    novembre: 11,
    decembre: 12,
    décembre: 12,
  };
  const m = text.match(/(\d{1,2})\s+([a-zéû]+)\s+(\d{4})/i);
  if (!m) return undefined;
  const monthKey = m[2].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const month = months[monthKey] ?? months[m[2].toLowerCase()];
  if (!month) return undefined;
  return `${m[3]}-${String(month).padStart(2, "0")}-${String(m[1]).padStart(2, "0")}`;
}

export function parseUlavalInternationalFinanceHtml(html: string): CanadaScrapedAward[] {
  const items: CanadaScrapedAward[] = [];
  const cardRegex =
    /<a href="([^"]+)"[^>]*class="card__link"[^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = cardRegex.exec(html)) !== null) {
    const block = m[2];
    const h4Match = block.match(/<h4>([\s\S]*?)<\/h4>/i);
    if (!h4Match) continue;
    const title = decodeHtmlEntities(h4Match[1].replace(/<[^>]+>/g, "").trim());
    const summary = decodeHtmlEntities(block.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    const montant =
      summary.match(/(?:Jusqu['']à\s*)?[\d\s$]+(?:\$|\$)[\d\s]+(?:\s*par année)?/i)?.[0] ??
      summary.match(/Plus de\s*[\d,\s$]+(?:M\$|\$)/i)?.[0];
    if (title.length < 6) continue;
    if (/projets de recherche/i.test(title)) continue;
    items.push(ulavalAward(title, resolveUlavalUrl(m[1]), summary.slice(0, 280), montant));

    if (/citoyennes et citoyens du monde|BCCM/i.test(title)) {
      items.push(
        ulavalAward(
          "Bourses citoyennes et citoyens du monde — volet excellence",
          resolveUlavalUrl(m[1]),
          "Maîtrise recherche ou doctorat — excellence scolaire",
          "20 000 $",
        ),
        ulavalAward(
          "Bourses citoyennes et citoyens du monde — volet engagement",
          resolveUlavalUrl(m[1]),
          "Maîtrise recherche ou doctorat — leadership et implication",
          "30 000 $",
        ),
      );
    }
  }

  items.push(
    ulavalAward(
      "Répertoire BBAF — bourses d'admission (international)",
      `${ULaval_BBAF_BASE}/bourses?admissionBursary=true&legalStatusCode=2&start-search=true`,
      "Répertoire officiel filtré — étudiantes et étudiants de l'international, bourses d'admission",
    ),
  );

  return dedupeCanadaAwards(items);
}

export function parseUlavalBbafRepertoireHtml(html: string): CanadaScrapedAward[] {
  const items: CanadaScrapedAward[] = [];
  for (const chunk of html.split('<div class="result"').slice(1)) {
    const linkMatch = chunk.match(
      /<h4 class="bursary-name">\s*<a href="(\/bourse\/[^"]+)"[^>]*>\s*([\s\S]*?)<\/a>/i,
    );
    if (!linkMatch) continue;
    const title = decodeHtmlEntities(linkMatch[2].replace(/\s+/g, " ").trim());
    const amounts = [...chunk.matchAll(/<li class="ammount">\s*([\s\S]*?)<\/li>/gi)]
      .map((a) => decodeHtmlEntities(a[1].trim()))
      .join("; ");
    const deadlineRaw = chunk.match(/Date limite[\s\S]*?<p>\s*([\s\S]*?)<\/p>/i)?.[1] ?? "";
    const objectives = chunk.match(/<div class="objectives">[\s\S]*?<p>([\s\S]*?)<\/p>/i)?.[1];
    const summary = decodeHtmlEntities((objectives ?? "").replace(/<[^>]+>/g, " ").trim());
    items.push(
      ulavalAward(
        title,
        `${ULaval_BBAF_BASE}${linkMatch[1]}`,
        summary.slice(0, 280),
        amounts || undefined,
        parseFrenchDeadline(decodeHtmlEntities(deadlineRaw.replace(/<[^>]+>/g, " "))),
      ),
    );
  }
  return dedupeCanadaAwards(items);
}
