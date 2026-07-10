"use client";

import { ScholarshipCardCompact } from "@/components/ScholarshipCard";
import type { Scholarship } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";

const DEFAULT_PAGE_SIZE = 24;

interface ScholarshipResultsGridProps {
  scholarships: Scholarship[];
  pageSize?: number;
  emptyMessage?: string;
  onReset?: () => void;
  showReset?: boolean;
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  const end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  for (let i = start; i <= end; i += 1) pages.push(i);

  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
      aria-label="Pagination des bourses"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground/70 transition hover:border-aksanti-red/30 hover:text-aksanti-red disabled:cursor-not-allowed disabled:opacity-40"
      >
        Précédent
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          aria-current={p === page ? "page" : undefined}
          className={`min-w-9 rounded-lg px-3 py-2 text-sm font-semibold transition ${
            p === page
              ? "bg-aksanti-red text-white"
              : "border border-border text-foreground/70 hover:border-aksanti-red/30 hover:text-aksanti-red"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground/70 transition hover:border-aksanti-red/30 hover:text-aksanti-red disabled:cursor-not-allowed disabled:opacity-40"
      >
        Suivant
      </button>
    </nav>
  );
}

export function ScholarshipResultsGrid({
  scholarships,
  pageSize = DEFAULT_PAGE_SIZE,
  emptyMessage = "Aucune bourse ne correspond à votre recherche.",
  onReset,
  showReset = false,
}: ScholarshipResultsGridProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(scholarships.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [scholarships]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const slice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return scholarships.slice(start, start + pageSize);
  }, [scholarships, page, pageSize]);

  if (scholarships.length === 0) {
    return (
      <div className="mt-10 text-center">
        <p className="text-muted">{emptyMessage}</p>
        {showReset && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="mt-3 text-sm font-semibold text-aksanti-red hover:underline"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <p className="mt-6 text-center text-sm text-muted">
        Page {page} sur {totalPages} ({scholarships.length} bourse
        {scholarships.length > 1 ? "s" : ""})
      </p>
      <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {slice.map((s) => (
          <div key={s.id} className="min-w-0">
            <ScholarshipCardCompact scholarship={s} />
          </div>
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </>
  );
}

export function ScholarshipResultsSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="mt-10 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-32 animate-pulse rounded-2xl bg-surface" />
      ))}
    </div>
  );
}
