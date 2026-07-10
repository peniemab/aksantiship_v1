/** Codes ISO 3166-1 alpha-2 pour les drapeaux (flagcdn.com). */
export const COUNTRY_ISO_CODES: Record<string, string> = {
  Turquie: "TR",
  Japon: "JP",
  Roumanie: "RO",
  Belgique: "BE",
  France: "FR",
  "Royaume-Uni": "GB",
  Allemagne: "DE",
  "États-Unis": "US",
  Canada: "CA",
  Australie: "AU",
  Chine: "CN",
  "Corée du Sud": "KR",
  Taïwan: "TW",
  Hongrie: "HU",
  Pologne: "PL",
  Suisse: "CH",
  "Pays-Bas": "NL",
  Suède: "SE",
  Norvège: "NO",
  Finlande: "FI",
  Irlande: "IE",
  Inde: "IN",
  Russie: "RU",
  "République tchèque": "CZ",
  Autriche: "AT",
  Portugal: "PT",
  Espagne: "ES",
  Italie: "IT",
  Luxembourg: "LU",
  "Nouvelle-Zélande": "NZ",
  Singapour: "SG",
  Malaisie: "MY",
  Thaïlande: "TH",
  Vietnam: "VN",
  Égypte: "EG",
  Maroc: "MA",
  Tunisie: "TN",
  "Afrique du Sud": "ZA",
  "Émirats arabes unis": "AE",
  Qatar: "QA",
  Brunei: "BN",
  Mexique: "MX",
  Brésil: "BR",
};

export function getCountryIsoCode(country: string): string | null {
  return COUNTRY_ISO_CODES[country] ?? null;
}

export function getCountryFlagUrl(country: string, width = 80): string | null {
  const iso = getCountryIsoCode(country);
  if (!iso) return null;
  return `https://flagcdn.com/w${width}/${iso.toLowerCase()}.png`;
}
