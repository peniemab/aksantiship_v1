"use client";

import Link from "next/link";
import { useMemo } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { ScholarshipMatchCard } from "@/components/dashboard/ScholarshipMatchCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { useBourses } from "@/hooks/useBourses";
import { filterScholarshipsForProfile } from "@/lib/matching";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function DashboardContent() {
  const { profile } = useAuth();
  const { bourses, loading } = useBourses(
    profile ? { niveauEtudes: profile.niveauEtudes, includeMatch: true } : {},
  );

  const matches = useMemo(() => {
    if (!profile) return [];
    return filterScholarshipsForProfile(profile, bourses, { onlyMatches: true })
      .sort((a, b) => b.score - a.score);
  }, [profile, bourses]);

  const openMatches = matches.filter((m) => m.scholarship.status === "encours");
  const upcomingDeadlines = [...openMatches]
    .sort(
      (a, b) =>
        new Date(a.scholarship.dateCloture).getTime() -
        new Date(b.scholarship.dateCloture).getTime(),
    )
    .slice(0, 4);

  const profileCompletion = useMemo(() => {
    if (!profile) return 25;
    let score = 40;
    if (profile.documents.length > 0) score += 20;
    if (profile.passeport) score += 10;
    if (profile.certificatLangue !== "Aucun") score += 15;
    if (profile.moyenneBac || profile.moyenneDernierDiplome) score += 15;
    return Math.min(score, 100);
  }, [profile]);

  const checklist = [
    { label: "Profil complété", done: Boolean(profile) },
    { label: "Documents renseignés", done: (profile?.documents.length ?? 0) > 0 },
    { label: "Passeport indiqué", done: Boolean(profile?.passeport) },
    { label: "Certificat de langue", done: profile?.certificatLangue !== "Aucun" },
  ];

  return (
    <div className="mx-auto min-w-0 max-w-7xl">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Bourses compatibles" value={loading ? "…" : openMatches.length} tone="red" />
        <StatCard label="Candidatures en cours" value={0} />
        <StatCard label="Réponses reçues" value={0} />
        <StatCard label="Favoris enregistrés" value={0} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-white p-6 shadow-[var(--card-shadow)] lg:col-span-1">
          <h2 className="text-lg font-bold text-foreground">Progression globale</h2>
          <div className="mt-6 flex justify-center">
            <ProgressRing value={profileCompletion} label="Profil candidat" />
          </div>
          <ul className="mt-6 flex flex-col gap-2">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-sm">
                <span
                  className={[
                    "flex size-5 items-center justify-center rounded-full text-xs",
                    item.done ? "bg-emerald-100 text-emerald-700" : "bg-surface text-muted",
                  ].join(" ")}
                >
                  {item.done ? "✓" : "·"}
                </span>
                <span className={item.done ? "text-foreground" : "text-muted"}>{item.label}</span>
              </li>
            ))}
          </ul>
          {!profile && (
            <Link
              href="/profil"
              className="mt-4 inline-flex text-sm font-semibold text-aksanti-red hover:underline"
            >
              Compléter mon profil →
            </Link>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-white p-6 shadow-[var(--card-shadow)] lg:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-foreground">Prochaines échéances</h2>
            <Link href="/opportunites" className="text-sm font-semibold text-aksanti-red hover:underline">
              Tout voir
            </Link>
          </div>
          {upcomingDeadlines.length === 0 ? (
            <p className="mt-6 text-sm text-muted">
              {profile
                ? "Aucune échéance proche pour vos bourses compatibles."
                : "Complétez votre profil pour voir les échéances personnalisées."}
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {upcomingDeadlines.map(({ scholarship }) => {
                const days = daysUntil(scholarship.dateCloture);
                const urgent = days <= 7;
                return (
                  <li
                    key={scholarship.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{scholarship.nom}</p>
                      <p className="text-xs text-muted">{formatDate(scholarship.dateCloture)}</p>
                    </div>
                    <span
                      className={[
                        "shrink-0 rounded-full px-3 py-1 text-xs font-bold",
                        urgent ? "bg-red-100 text-red-700" : "bg-amber-50 text-amber-800",
                      ].join(" ")}
                    >
                      {days > 0 ? `${days} jours` : "Aujourd'hui"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6 min-w-0 overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-[var(--card-shadow)]">
        <div className="flex min-w-0 items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-foreground">Bourses recommandées</h2>
          <Link href="/opportunites" className="shrink-0 text-sm font-semibold text-aksanti-red hover:underline">
            Voir toutes
          </Link>
        </div>
        {loading ? (
          <p className="mt-6 text-sm text-muted">Chargement des recommandations…</p>
        ) : matches.length === 0 ? (
          <p className="mt-6 text-sm text-muted">
            Créez ou complétez votre profil pour débloquer les recommandations personnalisées.
          </p>
        ) : (
          <div className="mt-5 min-w-0 overflow-hidden">
            <div className="-mx-2 flex gap-4 overflow-x-auto overscroll-x-contain px-2 pb-2">
              {matches.slice(0, 6).map((match) => (
                <ScholarshipMatchCard
                  key={match.scholarship.id}
                  scholarship={match.scholarship}
                  match={match}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      <section id="candidatures" className="mt-6 rounded-2xl border border-dashed border-border bg-white/60 p-6">
        <h2 className="text-lg font-bold text-foreground">Suivi des candidatures</h2>
        <p className="mt-2 text-sm text-muted">
          Fonctionnalité en cours de développement — bientôt disponible dans votre espace Premium.
        </p>
      </section>
    </div>
  );
}

export default function TableauDeBordPage() {
  return (
    <DashboardShell>
      <DashboardContent />
    </DashboardShell>
  );
}
