import type { Scholarship } from "../types";
import { resolveStatusFromDeadline } from "./china-deadlines";

/** Applique le statut réel selon la date de clôture (sans attendre un nouveau scrape). */
export function withResolvedStatus(s: Scholarship, now = new Date()): Scholarship {
  const status = resolveStatusFromDeadline(s.dateCloture, now);
  if (status === s.status) return s;
  return { ...s, status };
}

export function filterOpenScholarships<T extends Pick<Scholarship, "dateCloture" | "status">>(
  scholarships: T[],
  options: { includeClosed?: boolean } = {},
  now = new Date(),
): T[] {
  if (options.includeClosed) return scholarships;
  return scholarships.filter((s) => resolveStatusFromDeadline(s.dateCloture, now) !== "fermee");
}
