/** Parse le HTML du catalogue DAAD (liste de bourses). */
export interface DaadCatalogEntry {
  title: string;
  provider: string;
  status?: string;
  endAt?: string;
}

export function parseDaadCatalogHtml(html: string): DaadCatalogEntry[] {
  const items: DaadCatalogEntry[] = [];

  const articleRegex =
    /<article[^>]*class="[^"]*c-result-item[^"]*"[^>]*>([\s\S]*?)<\/article>/gi;
  let articleMatch: RegExpExecArray | null;

  while ((articleMatch = articleRegex.exec(html)) !== null) {
    const block = articleMatch[1];
    const titleMatch =
      block.match(/<h2[^>]*>\s*<a[^>]*>([\s\S]*?)<\/a>\s*<\/h2>/i) ??
      block.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    if (!titleMatch) continue;

    const title = stripTags(titleMatch[1]).trim();
    if (!title || title === "Important Information") continue;

    const providerMatch = block.match(/class="[^"]*c-result-item__organisation[^"]*"[^>]*>([\s\S]*?)<\//i);
    const provider = providerMatch ? stripTags(providerMatch[1]).trim() : "DAAD";

    const statusMatch = block.match(/class="[^"]*c-result-item__status[^"]*"[^>]*>([\s\S]*?)<\//i);
    const status = statusMatch ? stripTags(statusMatch[1]).trim() : undefined;

    const endMatch = block.match(/(\d{1,2}\.\d{1,2}\.\d{4}|\d{4}-\d{2}-\d{2})/);
    const endAt = endMatch ? normalizeDaadDate(endMatch[1]) : undefined;

    items.push({ title, provider: provider || "DAAD", status, endAt });
  }

  if (items.length > 0) return dedupeDaadEntries(items);

  return parseDaadHeadingFallback(html);
}

function parseDaadHeadingFallback(html: string): DaadCatalogEntry[] {
  const items: DaadCatalogEntry[] = [];
  const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  let m: RegExpExecArray | null;

  while ((m = h2Regex.exec(html)) !== null) {
    const raw = stripTags(m[1]).trim();
    if (!raw || raw.startsWith("Refine your selection")) continue;

    const parts = raw.split("•").map((s) => s.trim());
    const provider = parts.length > 1 ? parts[parts.length - 1] : "DAAD";
    const title = parts.length > 1 ? parts.slice(0, -1).join(" • ") : raw;
    items.push({ title, provider });
  }

  return dedupeDaadEntries(items);
}

function stripTags(input: string): string {
  return input.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeDaadDate(raw: string): string | undefined {
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const dm = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!dm) return undefined;
  return `${dm[3]}-${dm[2].padStart(2, "0")}-${dm[1].padStart(2, "0")}`;
}

function dedupeDaadEntries(items: DaadCatalogEntry[]): DaadCatalogEntry[] {
  const byKey = new Map<string, DaadCatalogEntry>();
  for (const item of items) {
    byKey.set(`${item.title}::${item.provider}`, item);
  }
  return [...byKey.values()];
}
