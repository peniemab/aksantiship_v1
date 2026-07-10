export interface JpssScholarshipEntry {
  id: string;
  title: string;
  path: string;
  organization?: string;
  academicYear?: string;
  applicationMethod?: string;
  residence?: string;
  academicLevel?: string;
  nationality?: string;
  stipend?: string;
  recipients?: string;
}

export interface JassoTuitionEntry {
  mid: string;
  title: string;
  provider: string;
  lastUpdate?: string;
  types: string[];
  academicLevels: string[];
}

function decodeHtml(text: string): string {
  return text
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function stripScholarshipPrefix(title: string): string {
  return title.replace(/^Scholarship name:\s*/i, "").trim();
}

export function parseJpssScholarshipsHtml(html: string): JpssScholarshipEntry[] {
  const items: JpssScholarshipEntry[] = [];
  const blocks = html.split('<div class="resultObjFree">').slice(1);

  for (const block of blocks) {
    const pathMatch = block.match(/<a href="(\/en\/scholarship\/(\d+)\/)">/);
    const titleMatch = block.match(/Scholarship name:\s*([^<]+)/);
    if (!pathMatch || !titleMatch) continue;

    const field = (label: string) => {
      const re = new RegExp(
        `<span class="bText">${label}</span>&nbsp;([^<]+(?:<[^/][^>]*>[^<]*)?)`,
        "i",
      );
      const m = block.match(re);
      return m ? decodeHtml(m[1].replace(/<[^>]+>/g, "")) : undefined;
    };

    items.push({
      id: pathMatch[2],
      path: pathMatch[1],
      title: stripScholarshipPrefix(decodeHtml(titleMatch[1])),
      organization: field("Organization"),
      academicYear: field("Applicable scholarship year"),
      applicationMethod: field("Application method"),
      residence: field("Place of residence at the time of application"),
      academicLevel: field("Academic level"),
      nationality: field("Nationality"),
      stipend: field("Stipend \\(Yen\\)") ?? field("Stipend (Yen)"),
      recipients: field("Number of recipients"),
    });
  }

  return items;
}

export function parseJassoTuitionSearchHtml(html: string): JassoTuitionEntry[] {
  const items: JassoTuitionEntry[] = [];
  const regex =
    /<a href='detail\.php\?lang=[^&]+&mid=([^']+)'[^>]*class="school-result-item">([\s\S]*?)<\/a>/gi;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const block = match[2];
    const mid = match[1];
    const title = block.match(/<p class="scholarship-name">\s*([\s\S]*?)<\/p>/)?.[1];
    const provider = block.match(/<p class="school-name">\s*([\s\S]*?)<\/p>/)?.[1];
    const lastUpdate = block.match(/Last update\s*:([^<]+)/)?.[1]?.trim();
    const types = [...block.matchAll(/scholarship-type-item[^"]*">([^<]+)/g)].map((m) =>
      decodeHtml(m[1]),
    );
    const academicLevels = [...block.matchAll(/target-course-item">([^<]+)/g)].map((m) =>
      decodeHtml(m[1]),
    );

    if (!title) continue;

    items.push({
      mid,
      title: decodeHtml(title.replace(/\s+/g, " ")),
      provider: provider ? decodeHtml(provider.replace(/\s+/g, " ")) : "",
      lastUpdate,
      types,
      academicLevels,
    });
  }

  const byMid = new Map<string, JassoTuitionEntry>();
  for (const item of items) {
    byMid.set(item.mid, item);
  }
  return [...byMid.values()];
}

export function buildJpssScholarshipUrl(path: string): string {
  return `https://www.jpss.jp${path}`;
}

export function buildJassoTuitionDetailUrl(mid: string): string {
  return `https://www.studyinjapan.go.jp/en/search-for-scholarships/detail.php?lang=en&mid=${encodeURIComponent(mid)}`;
}
