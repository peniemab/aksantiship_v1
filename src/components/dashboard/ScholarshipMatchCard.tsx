import type { Scholarship } from "@/lib/types";
import type { ScholarshipMatch } from "@/lib/matching";
import { STUDY_CYCLE_LABELS } from "@/lib/education-levels";
import { formatDate } from "@/lib/utils";
import { getScholarshipOfficialLinkLabel } from "@/lib/bourses/canada-application";

export function ScholarshipMatchCard({
  scholarship,
  match,
}: {
  scholarship: Scholarship;
  match?: ScholarshipMatch;
}) {
  const score = match?.score ?? 0;
  const cycle = scholarship.cyclesFinances.map((c) => STUDY_CYCLE_LABELS[c]).join(" · ");
  const allowance = scholarship.allocationMensuelle
    ? `${scholarship.allocationMensuelle.toLocaleString("fr-FR")} €/mois`
    : scholarship.valeurFinanciere ?? "Voir détails";

  return (
    <a
      href={scholarship.lienOfficiel}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-w-[17rem] max-w-[20rem] shrink-0 flex-col rounded-2xl border border-border bg-white p-5 shadow-[var(--card-shadow)] transition hover:border-aksanti-red/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
          {score}% compatible
        </span>
        <span className="rounded-lg bg-surface px-2 py-1 text-[10px] font-bold uppercase text-muted">
          {scholarship.paysHote.slice(0, 3)}
        </span>
      </div>

      <h3 className="mt-4 line-clamp-2 text-base font-bold leading-snug text-foreground">
        {scholarship.nom}
      </h3>
      <p className="mt-1 text-sm text-muted">{scholarship.paysHote}</p>
      <p className="mt-2 text-xs text-muted">{cycle}</p>

      <div className="mt-4 flex flex-col gap-1 text-sm">
        <p className="font-semibold text-foreground">{allowance}</p>
        <p className="text-xs text-muted">Clôture : {formatDate(scholarship.dateCloture)}</p>
      </div>

      <p className="mt-auto pt-5 text-center text-xs font-bold text-aksanti-red">
        {getScholarshipOfficialLinkLabel(scholarship)} ↗
      </p>
    </a>
  );
}
