import type { Scholarship } from "@/lib/types";
import {
  CANADA_APPLICATION_BADGE_CLASS,
  CANADA_APPLICATION_LABELS,
  resolveCanadaApplicationType,
} from "@/lib/bourses/canada-application";

export function ScholarshipApplicationBadge({
  scholarship,
}: {
  scholarship: Pick<Scholarship, "paysHote" | "typeCandidature" | "attributionAutomatiqueAdmission">;
}) {
  if (scholarship.paysHote !== "Canada") return null;

  const type = resolveCanadaApplicationType(scholarship);
  if (!type) return null;

  return (
    <span
      className={`inline-flex max-w-full rounded-full px-2.5 py-0.5 text-center text-[10px] font-semibold leading-tight ${CANADA_APPLICATION_BADGE_CLASS[type]}`}
    >
      {CANADA_APPLICATION_LABELS[type]}
    </span>
  );
}
