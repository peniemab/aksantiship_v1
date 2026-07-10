import {
  getStaticScholarships,
  listStaticCountries,
  getScholarshipMergeMeta,
} from "./load-scholarships";
import { filterScholarshipsBySearch } from "./filters";
import { slugToCountry } from "./countries";
import type { BourseRepositoryQuery } from "./types";
import type { Scholarship } from "@/lib/types";
import { FEATURED_SCHOLARSHIP_IDS } from "@/lib/data/scholarships";

/** Repository client-safe (catalogue statique uniquement). */
export function listBoursesStatic(query: BourseRepositoryQuery = {}): Scholarship[] {
  let results = [...getStaticScholarships()];

  if (query.featured) {
    results = FEATURED_SCHOLARSHIP_IDS.map((id) =>
      getStaticScholarships().find((s) => s.id === id),
    ).filter((s): s is Scholarship => s !== undefined);
  }

  if (query.status) {
    results = results.filter((s) => s.status === query.status);
  }

  results = filterScholarshipsBySearch(results, {
    query: query.q,
    pays: query.pays,
    cycle: query.cycle,
  });

  return results.sort((a, b) => a.dateCloture.localeCompare(b.dateCloture));
}

export { listStaticCountries, listStaticCountries as listScholarshipCountries };

export function countBoursesByCountry(country: string): number {
  return getStaticScholarships().filter((s) => s.paysHote === country).length;
}

export function listBoursesByCountrySlug(slug: string): Scholarship[] {
  const country = slugToCountry(slug);
  if (!country) return [];
  return listBoursesStatic({ pays: country });
}

export function getScholarshipStatsStatic() {
  return getScholarshipMergeMeta(getStaticScholarships());
}
