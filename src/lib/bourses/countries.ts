import { SCHOLARSHIPS } from "@/lib/data/scholarships";
import { getStaticScholarships } from "./load-scholarships";

export function countryToSlug(country: string): string {
  return country
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function resolveCountryFromSlug(
  slug: string,
  countryNames: string[],
): string | undefined {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return undefined;
  return countryNames.find((c) => countryToSlug(c) === normalized);
}

/** Résolution côté client (catalogue statique). Préférer resolveCountryFromSlug avec liste serveur. */
export function slugToCountry(slug: string): string | undefined {
  const countries = [...new Set(getStaticScholarships().map((s) => s.paysHote))];
  return resolveCountryFromSlug(slug, countries);
}

export const COUNTRY_SUMMARIES: Record<string, string> = {
  Turquie:
    "La Turquie accueille des milliers d'étudiants internationaux via des bourses gouvernementales couvrant frais de scolarité, logement et allocation mensuelle.",
  Japon:
    "697+ programmes : MEXT (ambassade + universités), JASSO (664 aides/exonérations Study in Japan), JPSS (140 fondations) et portails officiels. Pic avril–mai (ambassade), juin–sept. (universités), automne (fondations privées).",
  France:
    "380+ programmes sur CampusBourses (Campus France). Filtrez par nationalité : les bourses françaises dépendent souvent du pays d'origine. Pic d'ouverture octobre–janvier (Eiffel) ; quelques programmes restent ouverts en été.",
  Allemagne:
    "163+ programmes DAAD + Deutschlandstipendium et fondations (Ebert, Böll). Filtrez par langue (TestDaF / TOEFL). Dates limites variables selon votre pays d'origine — pic juillet–octobre et octobre–janvier.",
  Belgique:
    "40+ programmes Study in Belgium (FWB) + Master Mind (Flandre). Filtrez par communauté et langue d'enseignement. Pic sept.–janv. (ARES) puis fév.–avr. (universités flamandes).",
  Roumanie:
    "La Roumanie attire de plus en plus de candidats africains avec des bourses accessibles et un coût de vie modéré.",
  "Royaume-Uni":
    "Le Royaume-Uni concentre des bourses prestigieuses (Chevening, Commonwealth) pour les profils académiques solides.",
  International:
    "Ces bourses ne ciblent pas un seul pays : elles couvrent plusieurs destinations ou des institutions multinationales.",
  Canada:
    "150+ programmes : ÉduCanada (BEC, ELAP), bourses automatiques à l'admission (U of T, Ottawa) et fondations privées (UdeM). Filtrez par mode de candidature. Pic janv.–mars (gouvernement) et sept.–nov. (excellence).",
  "États-Unis": "Les États-Unis offrent Fulbright, bourses universitaires et programmes gouvernementaux pour étudiants du monde entier.",
  Australie: "L'Australie finance des étudiants via Australia Awards et des bourses universitaires prestigieuses.",
  Chine:
    "Plus de 11 000 bourses référencées via CUCAS et le programme CSC (289 universités). Pic d'ouverture décembre-mars ; clôtures provinciales et universitaires jusqu'à fin juin pour la rentrée de septembre.",
};

export function getCountrySummary(country: string): string {
  return (
    COUNTRY_SUMMARIES[country] ??
    `Découvrez les bourses disponibles pour étudier en ${country} ou avec ${country} comme pays hôte.`
  );
}

export function getCountryHref(country: string): string {
  return `/pays/${countryToSlug(country)}`;
}

/** @deprecated Utiliser getStaticScholarships pour la liste complète */
export function getLegacyScholarshipCountries(): string[] {
  return [...new Set(SCHOLARSHIPS.map((s) => s.paysHote))];
}
