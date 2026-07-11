import type { Scholarship } from "@/lib/types";
import type { ScholarshipMatch } from "@/lib/matching";
import { STUDY_CYCLE_LABELS } from "@/lib/education-levels";
import { formatDate } from "@/lib/utils";
import { ScholarshipApplicationBadge } from "@/components/ScholarshipApplicationBadge";
import { getScholarshipOfficialLinkLabel } from "@/lib/bourses/canada-application";

const statusLabels = {
  encours: { label: "En cours", className: "bg-green-100 text-green-700" },
  fermee: { label: "Fermée", className: "bg-red-100 text-red-700" },
  a_venir: { label: "À venir", className: "bg-amber-100 text-amber-700" },
};

export function ScholarshipCard({
  scholarship,
  match,
}: {
  scholarship: Scholarship;
  match?: ScholarshipMatch;
}) {
  const status = statusLabels[scholarship.status];

  return (
    <a
      href={scholarship.lienOfficiel}
      target="_blank"
      rel="noopener noreferrer"
      className="block min-w-0 overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-sm transition hover:border-aksanti-red/30 hover:shadow-md"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-lg font-bold text-foreground">{scholarship.nom}</h3>
          <p className="mt-1 break-words text-sm text-muted">{scholarship.paysHote}</p>
        </div>
        <div className="flex shrink-0 flex-row flex-wrap items-center gap-1 sm:flex-col sm:items-end">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
            {status.label}
          </span>
          <ScholarshipApplicationBadge scholarship={scholarship} />
          {match?.matches && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
              Compatible {match.score}%
            </span>
          )}
        </div>
      </div>

      {match?.matches && match.matchingCycles.length > 0 && (
        <p className="mt-3 break-words rounded-lg bg-green-50 px-3 py-2 text-xs text-green-800">
          {match.reason}
        </p>
      )}

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          <dt className="shrink-0 font-medium text-foreground/70">Cycle :</dt>
          <dd className="min-w-0 break-words text-muted">
            {scholarship.cyclesFinances.map((c) => STUDY_CYCLE_LABELS[c]).join(", ")}
          </dd>
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          <dt className="shrink-0 font-medium text-foreground/70">Niveau :</dt>
          <dd className="min-w-0 break-words text-muted">{scholarship.niveauDisponible.join(", ")}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          <dt className="shrink-0 font-medium text-foreground/70">Date de clôture :</dt>
          <dd className="min-w-0 break-words text-muted">{formatDate(scholarship.dateCloture)}</dd>
        </div>
        {scholarship.valeurFinanciere && (
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            <dt className="shrink-0 font-medium text-foreground/70">Valeur :</dt>
            <dd className="min-w-0 break-words text-muted">{scholarship.valeurFinanciere}</dd>
          </div>
        )}
      </dl>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ship-orange">Avantages</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted">
          {scholarship.avantages.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-aksanti-red">
          Conditions d&apos;éligibilité
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted">
          {scholarship.conditionsEligibilite.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>

      <p className="mt-5 text-sm font-semibold text-aksanti-red">
        {getScholarshipOfficialLinkLabel(scholarship)} ↗
      </p>
    </a>
  );
}

export function ScholarshipCardCompact({ scholarship }: { scholarship: Scholarship }) {
  const status = statusLabels[scholarship.status];
  return (
    <a
      href={scholarship.lienOfficiel}
      target="_blank"
      rel="noopener noreferrer"
      className="group block min-w-0 rounded-2xl border border-border bg-white p-5 transition hover:border-aksanti-red/30 hover:shadow-lg"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="min-w-0 flex-1 break-words font-bold leading-snug text-foreground group-hover:text-aksanti-red">
          {scholarship.nom}
        </h3>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${status.className}`}
          >
            {status.label}
          </span>
          <ScholarshipApplicationBadge scholarship={scholarship} />
        </div>
      </div>
      <p className="mt-1 break-words text-sm text-muted">{scholarship.paysHote}</p>
      <p className="mt-2 break-words text-xs text-muted">
        {scholarship.niveauDisponible.join(" · ")}
      </p>
      {(scholarship.valeurFinanciere || scholarship.province) && (
        <p className="mt-1 break-words text-xs text-muted/80">
          {[scholarship.province, scholarship.valeurFinanciere].filter(Boolean).join(" · ")}
        </p>
      )}
      {(scholarship.languesRequises?.length ||
        scholarship.langueEnseignement ||
        scholarship.communaute ||
        scholarship.allocationMensuelle) && (
        <p className="mt-1 break-words text-xs text-muted/80">
          {scholarship.communaute ? `${scholarship.communaute}` : null}
          {scholarship.communaute && (scholarship.langueEnseignement || scholarship.languesRequises?.length)
            ? " · "
            : null}
          {scholarship.langueEnseignement
            ? scholarship.langueEnseignement
            : scholarship.languesRequises?.length
              ? scholarship.languesRequises.join(" · ")
              : null}
          {(scholarship.communaute || scholarship.langueEnseignement || scholarship.languesRequises?.length) &&
          scholarship.allocationMensuelle
            ? " · "
            : null}
          {scholarship.allocationMensuelle
            ? `${scholarship.allocationMensuelle} €/mois`
            : null}
        </p>
      )}
      <p className="mt-3 text-xs font-semibold text-aksanti-red">
        {getScholarshipOfficialLinkLabel(scholarship)} ↗
      </p>
    </a>
  );
}
