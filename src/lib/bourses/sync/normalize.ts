import type { Scholarship, ScholarshipStatus } from "../../types";

export function slugifyId(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function inferStatusFromText(text: string): ScholarshipStatus {
  const lower = text.toLowerCase();
  if (lower.includes("closed") || lower.includes("ferm") || lower.includes("deadline passed")) {
    return "fermee";
  }
  if (lower.includes("coming soon") || lower.includes("à venir") || lower.includes("open soon")) {
    return "a_venir";
  }
  return "encours";
}

export function inferCountryFromTitle(title: string): string {
  const lower = title.toLowerCase();

  // Ateliers / formations qui mentionnent la Chine sans y étudier
  if (
    /\b(workshop|training|webinar|journalist|journalists|coverage)\b/i.test(title) &&
    /\b(china|chinese|afrique-china|africa-china)\b/i.test(title) &&
    !/\b(study in china|scholarship in china|étudier en chine|university in china)\b/i.test(lower)
  ) {
    if (/\b(ghana|accra)\b/i.test(title)) return "International";
    return "International";
  }

  const patterns: [RegExp, string][] = [
    [/\b(usa|u\.s\.|united states|america)\b/i, "États-Unis"],
    [/\b(uk|united kingdom|britain|chevening)\b/i, "Royaume-Uni"],
    [/\b(france|french|campus france|eiffel)\b/i, "France"],
    [/\b(germany|german|daad)\b/i, "Allemagne"],
    [/\b(japan|japanese|mext)\b/i, "Japon"],
    [/\b(turkey|turkish|turkiye)\b/i, "Turquie"],
    [/\b(canada|canadian)\b/i, "Canada"],
    [/\b(australia|australian)\b/i, "Australie"],
    [/\b(china|chinese|csc)\b/i, "Chine"],
    [/\b(korea|korean|gks)\b/i, "Corée du Sud"],
    [/\b(belgium|belgian)\b/i, "Belgique"],
    [/\b(netherlands|dutch|holland)\b/i, "Pays-Bas"],
    [/\b(sweden|swedish)\b/i, "Suède"],
    [/\b(norway|norwegian)\b/i, "Norvège"],
    [/\b(switzerland|swiss)\b/i, "Suisse"],
    [/\b(italy|italian)\b/i, "Italie"],
    [/\b(spain|spanish)\b/i, "Espagne"],
    [/\b(portugal|portuguese)\b/i, "Portugal"],
    [/\b(morocco|maroc)\b/i, "Maroc"],
    [/\b(tunisia|tunisie)\b/i, "Tunisie"],
    [/\b(africa|african)\b/i, "International"],
    [/\b(international|global)\b/i, "International"],
  ];

  for (const [regex, country] of patterns) {
    if (regex.test(title)) return country;
  }

  return "International";
}

export function defaultCyclesForTitle(title: string): Scholarship["cyclesFinances"] {
  const lower = title.toLowerCase();
  if (lower.includes("phd") || lower.includes("doctorate") || lower.includes("doctoral")) {
    return ["doctorate"];
  }
  if (lower.includes("master") || lower.includes("graduate") || lower.includes("msc")) {
    return ["master"];
  }
  if (lower.includes("undergraduate") || lower.includes("bachelor") || lower.includes("licence")) {
    return ["undergraduate"];
  }
  return ["undergraduate", "master", "doctorate"];
}

export function cyclesToNiveaux(cycles: Scholarship["cyclesFinances"]): string[] {
  const labels: string[] = [];
  if (cycles.includes("undergraduate")) labels.push("Licence / Bachelor");
  if (cycles.includes("master")) labels.push("Master");
  if (cycles.includes("doctorate")) labels.push("Doctorat");
  return labels;
}

export function normalizeExternalScholarship(input: {
  title: string;
  link: string;
  description?: string;
  source: string;
  pubDate?: string;
}): Scholarship | null {
  const title = input.title.trim();
  const link = input.link.trim();

  if (!title || !link.startsWith("http")) return null;

  const id = slugifyId(`${input.source}-${link}`);
  if (!id) return null;

  const text = `${title} ${input.description ?? ""}`;
  const cycles = defaultCyclesForTitle(title);
  const status = inferStatusFromText(text);

  return {
    id,
    nom: title.replace(/\s+/g, " ").slice(0, 200),
    paysHote: inferCountryFromTitle(title),
    cyclesFinances: cycles,
    niveauDisponible: cyclesToNiveaux(cycles),
    dateCloture: estimateDeadline(input.pubDate),
    avantages: [
      input.description
        ? input.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 240)
        : "Programme référencé via flux externe. Consultez le lien officiel.",
    ],
    conditionsEligibilite: [
      "Critères détaillés sur le site officiel de l'organisme.",
      "Vérifiez les dates et l'éligibilité avant de postuler.",
    ],
    lienOfficiel: link,
    status,
    source: input.source,
    syncedAt: new Date().toISOString(),
  };
}

function estimateDeadline(pubDate?: string): string {
  const base = pubDate ? new Date(pubDate) : new Date();
  if (Number.isNaN(base.getTime())) {
    const fallback = new Date();
    fallback.setMonth(fallback.getMonth() + 3);
    return fallback.toISOString().slice(0, 10);
  }
  base.setMonth(base.getMonth() + 4);
  return base.toISOString().slice(0, 10);
}
