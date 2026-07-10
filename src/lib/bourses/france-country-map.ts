/** Mapping ID nationalité CampusBourses → libellé (référentiel Campus France). */
export const CAMPUS_FRANCE_COUNTRY_NAMES: Record<string, string> = {
  "1": "Toutes nationalités",
  "2": "Union européenne",
  "3": "Afrique",
  "5": "Amérique latine",
  "6": "Asie",
  "7": "Europe hors UE",
  "8": "Moyen-Orient",
  "9": "Océanie",
  "11": "Algérie",
  "12": "Allemagne",
  "13": "Angola",
  "14": "Arabie saoudite",
  "16": "Belgique",
  "17": "Bénin",
  "18": "Brésil",
  "19": "Burkina Faso",
  "20": "Burundi",
  "21": "Gabon",
  "22": "Cameroun",
  "23": "Canada",
  "24": "Chili",
  "25": "Chine",
  "27": "Colombie",
  "28": "Comores",
  "29": "Congo",
  "30": "République démocratique du Congo",
  "31": "Côte d'Ivoire",
  "33": "Égypte",
  "34": "Émirats arabes unis",
  "35": "Espagne",
  "36": "États-Unis",
  "37": "Éthiopie",
  "38": "Finlande",
  "39": "France",
  "40": "Ghana",
  "41": "Grèce",
  "42": "Guinée",
  "43": "Haïti",
  "44": "Inde",
  "45": "Indonésie",
  "46": "Irak",
  "47": "Iran",
  "48": "Italie",
  "49": "Japon",
  "50": "Jordanie",
  "51": "Kenya",
  "52": "Liban",
  "53": "Madagascar",
  "54": "Mali",
  "55": "Maroc",
  "56": "Maurice",
  "57": "Mauritanie",
  "58": "Mexique",
  "59": "Monaco",
  "60": "Mozambique",
  "61": "Niger",
  "62": "Nigeria",
  "63": "Norvège",
  "64": "Ouganda",
  "65": "Pakistan",
  "66": "Pays-Bas",
  "67": "Pérou",
  "68": "Philippines",
  "69": "Pologne",
  "70": "Portugal",
  "71": "République centrafricaine",
  "72": "Roumanie",
  "73": "Royaume-Uni",
  "74": "Russie",
  "75": "Rwanda",
  "76": "Sénégal",
  "77": "Serbie",
  "78": "Singapour",
  "79": "Soudan",
  "80": "Sri Lanka",
  "81": "Suède",
  "82": "Suisse",
  "83": "Syrie",
  "84": "Tanzanie",
  "85": "Tchad",
  "86": "Thaïlande",
  "87": "Togo",
  "88": "Tunisie",
  "89": "Turquie",
  "90": "Ukraine",
  "91": "Uruguay",
  "92": "Venezuela",
  "93": "Viêt Nam",
  "94": "Zambie",
  "95": "Zimbabwe",
};

export function resolveCampusFranceCountries(countryListId?: string): string[] {
  const ids = (countryListId ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const names = ids.map((id) => CAMPUS_FRANCE_COUNTRY_NAMES[id] ?? `Nationalité #${id}`);

  return [...new Set(names)];
}

export function resolveCampusFranceCountryIds(countryListId?: string): string[] {
  return (countryListId ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const NATIONALITY_SEARCH_ALIASES: Record<string, string[]> = {
  rdc: ["République démocratique du Congo", "Congo", "Afrique", "Toutes nationalités"],
  congo: ["République démocratique du Congo", "Congo", "Gabon", "Afrique", "Toutes nationalités"],
  rdcongo: ["République démocratique du Congo", "Afrique", "Toutes nationalités"],
  "république démocratique du congo": [
    "République démocratique du Congo",
    "Afrique",
    "Toutes nationalités",
  ],
  kinshasa: ["République démocratique du Congo", "Afrique", "Toutes nationalités"],
};

export function matchesNationalityFilter(eligible: string[] | undefined, query: string): boolean {
  if (!query.trim()) return true;
  const list = eligible ?? [];
  if (list.length === 0) return true;

  const q = query.trim().toLowerCase();
  const aliases = NATIONALITY_SEARCH_ALIASES[q] ?? [query.trim()];
  const normalizedEligible = list.map((e) => e.toLowerCase());

  return aliases.some((alias) => {
    const a = alias.toLowerCase();
    return normalizedEligible.some(
      (e) => e === a || e.includes(a) || a.includes(e) || e === "toutes nationalités",
    );
  });
}
