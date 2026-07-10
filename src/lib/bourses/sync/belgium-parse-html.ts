export interface StudyInBelgiumRawEntry {
  title: string;
  path: string;
  audience: string;
}

export interface StudyInBelgiumMergedEntry {
  title: string;
  path: string;
  audiences: string[];
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeAudience(audience: string): string {
  const a = decodeHtmlEntities(audience);
  if (/internationaux/i.test(a)) return "Toutes nationalités";
  return a;
}

export function parseStudyInBelgiumHtml(html: string): StudyInBelgiumRawEntry[] {
  const items: StudyInBelgiumRawEntry[] = [];
  const regex =
    /<a href="(\/fr\/bourses\/[^"]+)" class="scholarship">[\s\S]*?<p class="country">\s*([\s\S]*?)\s*<\/p>\s*<h3>([\s\S]*?)<\/h3>/gi;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const path = match[1].trim();
    const audience = normalizeAudience(match[2]);
    const title = decodeHtmlEntities(match[3].replace(/<[^>]+>/g, ""));
    if (!title) continue;
    items.push({ title, path, audience });
  }

  return items;
}

export function mergeStudyInBelgiumEntries(
  raw: StudyInBelgiumRawEntry[],
): StudyInBelgiumMergedEntry[] {
  const byPath = new Map<string, StudyInBelgiumMergedEntry>();

  for (const item of raw) {
    const existing = byPath.get(item.path);
    if (!existing) {
      byPath.set(item.path, {
        title: item.title,
        path: item.path,
        audiences: [item.audience],
      });
      continue;
    }

    if (!existing.audiences.includes(item.audience)) {
      existing.audiences.push(item.audience);
    }
  }

  return [...byPath.values()];
}

export function buildStudyInBelgiumUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `https://www.studyinbelgium.be${path}`;
}

export interface BelgiumScrapedEntry {
  title: string;
  url: string;
  summary?: string;
}

function stripHtml(text: string): string {
  return decodeHtmlEntities(text.replace(/<[^>]+>/g, " "));
}

/** Study in Flanders — blocs h2 + lien « Find out more » (souvent dans le bloc suivant). */
export function parseStudyInFlandersScholarshipsHtml(html: string): BelgiumScrapedEntry[] {
  const items: BelgiumScrapedEntry[] = [];
  const seen = new Set<string>();

  const h2Matches = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];

  for (const match of h2Matches) {
    const title = stripHtml(match[1]);
    if (!title || /funding opportunities from flemish/i.test(title)) continue;

    const startAfter = (match.index ?? 0) + match[0].length;
    const window = html.slice(startAfter, startAfter + 1500);
    const btnMatch = window.match(/<a class="btn" href="([^"]+)"[^>]*>Find out more<\/a>/i);
    if (!btnMatch) continue;

    const url = btnMatch[1].trim();
    const summary = stripHtml(window.replace(/<a class="btn"[\s\S]*$/i, "")).slice(0, 280);
    const key = url.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    items.push({ title, url, summary: summary || undefined });
  }

  return items;
}

/** UAntwerp — programmes listés en li/strong + lien « Read more ». */
export function parseUantwerpScholarshipsHtml(html: string): BelgiumScrapedEntry[] {
  const items: BelgiumScrapedEntry[] = [];
  const seen = new Set<string>();

  const liRegex =
    /<li><strong>([^<]+)<\/strong>([\s\S]*?)<a href="([^"]+)"[^>]*><strong>Read more<\/strong><\/a>/gi;

  let match: RegExpExecArray | null;
  while ((match = liRegex.exec(html)) !== null) {
    const title = stripHtml(match[1]);
    const url = match[3].trim();
    const summary = stripHtml(match[2]).slice(0, 280);
    const key = url.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({ title: `${title} (UAntwerp)`, url, summary: summary || undefined });
  }

  const hpiMatch = html.match(
    /High Potential Incentive[\s\S]*?<a href="([^"]+)"[^>]*><strong>Read more<\/strong>/i,
  );
  if (hpiMatch) {
    items.push({
      title: "High Potential Incentive (UAntwerp)",
      url: hpiMatch[1].trim(),
      summary:
        "Réduction des frais de scolarité pour étudiants non-EEE admis en master, sans candidature séparée.",
    });
  }

  return items;
}

export interface WallonieDemarcheParsed {
  title: string;
  deadlineText?: string;
  avantagesText?: string;
}

/** Wallonie.be — démarche allocations CG (communauté germanophone). */
export function parseWallonieGermanophoneHtml(html: string): WallonieDemarcheParsed | null {
  const titleMatch = html.match(/<h1[^>]*>\s*<span>([\s\S]*?)<\/span>/i);
  if (!titleMatch) return null;

  const title = stripHtml(titleMatch[1]);
  const deadlineMatch = html.match(/<div>Délais<\/div>\s*<div>([\s\S]*?)<\/div>/i);
  const avantagesMatch = html.match(/<div>Avantages<\/div>\s*<div>([\s\S]*?)<\/div>/i);

  return {
    title,
    deadlineText: deadlineMatch ? stripHtml(deadlineMatch[1]) : undefined,
    avantagesText: avantagesMatch ? stripHtml(avantagesMatch[1]).slice(0, 400) : undefined,
  };
}

export function inferProviderFromTitle(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("ares")) return "ARES";
  if (t.includes("fnrs") || t.includes("fria") || t.includes("fresh")) return "FNRS";
  if (t.includes("wbi")) return "WBI";
  if (t.includes("auf")) return "AUF";
  if (t.includes("master mind")) return "Gouvernement flamand";
  if (t.includes("erasmus")) return "Erasmus+";
  if (t.includes("embo")) return "EMBO";
  if (t.includes("erc")) return "ERC";
  if (t.includes("vlir")) return "VLIR-UOS";
  if (t.includes("uantwerp") || t.includes("u antwerp")) return "Université d'Anvers";
  if (t.includes("ugent") || t.includes("ghent")) return "Université de Gand";
  if (t.includes("kuleuven") || t.includes("leuven")) return "KU Leuven";
  if (t.includes("flanders") || t.includes("flamand")) return "Gouvernement flamand";
  if (t.includes("duo") || t.includes("allocation")) return "Communauté germanophone";
  return "Study in Belgium";
}
