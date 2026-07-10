import type { Scholarship } from "../../types";
import {
  inferChinaApplicationDeadline,
  mapCucasDegreeToCycles,
  mapCucasDegreeToNiveau,
  resolveStatusFromDeadline,
} from "../china-deadlines";

export interface CucasRawItem {
  title: string;
  university: string;
  href: string;
  degree?: string;
  startDate?: string;
  language?: string;
}

const CUCAS_BASE = "https://m.cucas.cn";
const PAGE_SIZE = 10;

export function parseCucasListHtml(html: string): CucasRawItem[] {
  const items: CucasRawItem[] = [];
  const blocks = html.split("<section>").slice(1);

  for (const block of blocks) {
    const title = block.match(/class="title[^"]*">([^<]+)/)?.[1]?.trim();
    const university = block.match(/class="text-gray s_name">([^<]+)/)?.[1]?.trim();
    const href = block.match(/href="([^"]+)"/)?.[1];
    const degree = block.match(/Degree:<\/span>\s*([^<]*)/)?.[1]?.trim();
    const startDate = block.match(/Starting Date:<\/span>\s*([^<]*)/)?.[1]?.trim();
    const language = block.match(/Teaching Language:<\/span>\s*([^<]*)/)?.[1]?.trim();

    if (title && href) {
      items.push({
        title,
        university: university ?? "",
        href,
        degree,
        startDate,
        language,
      });
    }
  }

  return items;
}

export function cucasItemToScholarship(item: CucasRawItem, syncedAt: string): Scholarship {
  const sidMatch = item.href.match(/sid=(\d+)/);
  const cidMatch = item.href.match(/c_id=(\d+)/);
  const sid = sidMatch?.[1] ?? "0";
  const cid = cidMatch?.[1] ?? "0";
  const id = `cucas-${sid}-${cid}`;

  const dateCloture = inferChinaApplicationDeadline(item.startDate);
  const cyclesFinances = mapCucasDegreeToCycles(item.degree);
  const niveauDisponible = mapCucasDegreeToNiveau(item.degree);

  const avantages = ["Bourse universitaire en Chine"];
  if (item.language?.toLowerCase().includes("english")) {
    avantages.push("Enseignement en anglais");
  }

  const conditions: string[] = [];
  if (item.university) conditions.push(`Université : ${item.university}`);
  if (item.startDate) conditions.push(`Rentrée : ${item.startDate}`);
  if (item.language) conditions.push(`Langue : ${item.language}`);

  const nom = item.university
    ? `${item.title} — ${item.university}`
    : item.title;

  return {
    id,
    nom,
    paysHote: "Chine",
    cyclesFinances,
    niveauDisponible,
    dateCloture,
    avantages,
    conditionsEligibilite: conditions,
    lienOfficiel: item.href.startsWith("http") ? item.href : `${CUCAS_BASE}${item.href}`,
    status: resolveStatusFromDeadline(dateCloture),
    source: "cucas",
    syncedAt,
  };
}

export interface FetchCucasOptions {
  maxPages?: number;
  startPage?: number;
  delayMs?: number;
  initialScholarships?: Scholarship[];
  onProgress?: (page: number, added: number, total: number) => void;
  onCheckpoint?: (scholarships: Scholarship[], page: number) => void;
  checkpointEvery?: number;
}

async function fetchCucasPage(page: number, retries = 4): Promise<{ nextPage: number; html: string } | null> {
  const url = `${CUCAS_BASE}/scholarship/index?cat=0&degree=0&school=0&program=&lang=0&semester=0&page=${page}`;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Aksantiship/1.0; +https://aksantiship.com)",
          "X-Requested-With": "XMLHttpRequest",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) {
        if (attempt < retries) {
          await sleep(1500 * attempt);
          continue;
        }
        return null;
      }

      const json = (await res.json()) as {
        state?: number;
        data?: { page?: number; html?: string };
      };

      if (json.state !== 1 || !json.data?.html) return null;

      return {
        nextPage: json.data.page ?? page + 1,
        html: json.data.html,
      };
    } catch {
      if (attempt < retries) {
        await sleep(2000 * attempt);
        continue;
      }
      throw new Error(`CUCAS page ${page} inaccessible après ${retries} tentatives`);
    }
  }

  return null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Récupère les bourses CUCAS (jusqu'à ~11 000 entrées, pagination 10/page). */
export async function fetchCucasChinaScholarships(
  options: FetchCucasOptions = {},
): Promise<Scholarship[]> {
  const maxPages = options.maxPages ?? 0;
  const delayMs = options.delayMs ?? 350;
  const syncedAt = new Date().toISOString();
  const byId = new Map<string, Scholarship>();

  for (const s of options.initialScholarships ?? []) {
    byId.set(s.id, s);
  }

  let page = options.startPage ?? 1;
  let pagesFetched = 0;

  while (true) {
    if (maxPages > 0 && pagesFetched >= maxPages) break;

    const result = await fetchCucasPage(page);
    if (!result) break;

    const raw = parseCucasListHtml(result.html);
    if (raw.length === 0) break;

    for (const item of raw) {
      const scholarship = cucasItemToScholarship(item, syncedAt);
      byId.set(scholarship.id, scholarship);
    }

    pagesFetched += 1;
    options.onProgress?.(page, raw.length, byId.size);

    const checkpointEvery = options.checkpointEvery ?? 0;
    if (checkpointEvery > 0 && pagesFetched % checkpointEvery === 0) {
      options.onCheckpoint?.(Array.from(byId.values()), page);
    }

    page = result.nextPage;
    if (page <= pagesFetched) page = pagesFetched + 1;

    await sleep(delayMs);
  }

  return Array.from(byId.values());
}

export function estimateCucasTotalPages(totalItems = 11470): number {
  return Math.ceil(totalItems / PAGE_SIZE);
}
