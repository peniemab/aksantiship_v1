import {
  listBoursesServer,
  getBourseByIdServer,
  countBoursesServer,
  getScholarshipStatsServer,
  listScholarshipCountriesServer,
} from "@/lib/bourses/repository.server";
import { matchScholarshipToEducationLevel } from "@/lib/bourses/matching";
import type { EducationLevel } from "@/lib/education-levels";
import type {
  BourseRepositoryQuery,
  BourseWithMatch,
  BoursesListMeta,
} from "@/lib/bourses/types";
import type { ScholarshipStatus } from "@/lib/types";

export interface BuildBoursesListOptions extends BourseRepositoryQuery {
  niveauEtudes?: EducationLevel;
  matchOnly?: boolean;
  includeMatch?: boolean;
}

export function buildBoursesListResponse(options: BuildBoursesListOptions = {}) {
  const { niveauEtudes, matchOnly, includeMatch, ...repoQuery } = options;
  const all = listBoursesServer(repoQuery);
  const total = countBoursesServer();

  let data: BourseWithMatch[] = all.map((scholarship) => {
    if (niveauEtudes && (includeMatch || matchOnly)) {
      const match = matchScholarshipToEducationLevel(niveauEtudes, scholarship);
      return { ...scholarship, match };
    }
    return { ...scholarship };
  });

  let matched: number | undefined;
  let excluded: number | undefined;

  if (niveauEtudes && (includeMatch || matchOnly)) {
    matched = data.filter((b) => b.match?.matches).length;
    excluded = data.length - matched;
  }

  if (matchOnly && niveauEtudes) {
    data = data.filter((b) => b.match?.matches);
  }

  const meta: BoursesListMeta = {
    total,
    returned: data.length,
    ...(matched !== undefined && { matched }),
    ...(excluded !== undefined && { excluded }),
    sources: getScholarshipStatsServer(),
    countries: listScholarshipCountriesServer(),
  };

  return { data, meta };
}

export function buildBourseDetailResponse(
  id: string,
  niveauEtudes?: EducationLevel,
) {
  const scholarship = getBourseByIdServer(id);
  if (!scholarship) return null;

  const data: BourseWithMatch = niveauEtudes
    ? {
        ...scholarship,
        match: matchScholarshipToEducationLevel(niveauEtudes, scholarship),
      }
    : { ...scholarship };

  return { data };
}

export function parseStatusParam(value: string | null): ScholarshipStatus | undefined {
  if (value === "encours" || value === "fermee" || value === "a_venir") return value;
  return undefined;
}

export function parseEducationLevelParam(
  value: string | null,
): EducationLevel | undefined {
  const valid: EducationLevel[] = [
    "finaliste",
    "secondary_diplome",
    "undergraduate",
    "bachelor",
    "master_student",
    "master",
    "doctorate_student",
    "doctorate",
  ];
  return valid.includes(value as EducationLevel) ? (value as EducationLevel) : undefined;
}
