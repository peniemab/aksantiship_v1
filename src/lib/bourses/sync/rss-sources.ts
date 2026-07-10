import type { Scholarship } from "../../types";
import { normalizeExternalScholarship } from "./normalize";

export interface SyncSourceResult {
  source: string;
  fetched: number;
  added: number;
  items: Scholarship[];
  errors: string[];
}

/** Extrait le contenu d'une balise XML simple (RSS). */
function extractTag(block: string, tag: string): string | undefined {
  const cdata = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i");
  const cdataMatch = block.match(cdata);
  if (cdataMatch?.[1]) return cdataMatch[1].trim();

  const plain = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const plainMatch = block.match(plain);
  return plainMatch?.[1]?.replace(/<[^>]+>/g, " ").trim();
}

function parseRssItems(xml: string): { title: string; link: string; description?: string; pubDate?: string }[] {
  const items: { title: string; link: string; description?: string; pubDate?: string }[] = [];
  const itemRegex = /<item[\s\S]*?<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[0];
    const title = extractTag(block, "title");
    const link = extractTag(block, "link");
    if (!title || !link) continue;

    items.push({
      title,
      link,
      description: extractTag(block, "description"),
      pubDate: extractTag(block, "pubDate"),
    });
  }

  return items;
}

export async function fetchRssScholarships(
  feedUrl: string,
  sourceId: string,
  limit = 40,
): Promise<SyncSourceResult> {
  const result: SyncSourceResult = {
    source: sourceId,
    fetched: 0,
    added: 0,
    items: [],
    errors: [],
  };

  try {
    const res = await fetch(feedUrl, {
      headers: { "User-Agent": "AksantishipBot/1.0 (+https://aksantiship.local)" },
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok) {
      result.errors.push(`HTTP ${res.status} pour ${feedUrl}`);
      return result;
    }

    const xml = await res.text();
    const rawItems = parseRssItems(xml).slice(0, limit);
    result.fetched = rawItems.length;

    const seenLinks = new Set<string>();

    for (const raw of rawItems) {
      if (seenLinks.has(raw.link)) continue;
      seenLinks.add(raw.link);

      const scholarship = normalizeExternalScholarship({
        title: raw.title,
        link: raw.link,
        description: raw.description,
        pubDate: raw.pubDate,
        source: sourceId,
      });

      if (scholarship) {
        result.items.push(scholarship);
        result.added += 1;
      }
    }
  } catch (e) {
    result.errors.push(e instanceof Error ? e.message : "Erreur RSS inconnue");
  }

  return result;
}

export const RSS_FEEDS = [
  {
    id: "opportunitiesforafricans",
    url: "https://www.opportunitiesforafricans.com/feed/",
    limit: 100,
  },
  {
    id: "scholars4dev",
    url: "https://www.scholars4dev.com/feed/",
    limit: 100,
  },
  {
    id: "opportunitydesk",
    url: "https://opportunitydesk.org/feed/",
    limit: 100,
  },
] as const;

export async function fetchAllRssSources(): Promise<SyncSourceResult[]> {
  const results = await Promise.all(
    RSS_FEEDS.map((feed) => fetchRssScholarships(feed.url, feed.id, feed.limit)),
  );
  return results;
}
