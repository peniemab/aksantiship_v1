"use client";

import type { ProfileAnalysis } from "@/lib/matching";
import Link from "next/link";

export function ProfileAnalysisCard({ analysis }: { analysis: ProfileAnalysis }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-foreground">Résumé de votre profil</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-aksanti-red/5 p-4">
            <p className="text-xs font-medium text-muted">Catégorie</p>
            <p className="mt-1 font-bold text-aksanti-red">{analysis.categorieLabel}</p>
          </div>
          <div className="rounded-xl bg-ship-orange/5 p-4">
            <p className="text-xs font-medium text-muted">Niveau international</p>
            <p className="mt-1 text-sm font-bold text-ship-orange-dark">{analysis.niveauLabel}</p>
          </div>
          <div className="rounded-xl bg-green-50 p-4">
            <p className="text-xs font-medium text-muted">Bourses compatibles</p>
            <p className="mt-1 text-2xl font-bold text-green-700">
              {analysis.matchingOpportunities}
              <span className="text-sm font-normal text-muted"> / {analysis.totalOpportunities}</span>
            </p>
          </div>
          <div className="rounded-xl bg-blue-50 p-4">
            <p className="text-xs font-medium text-muted">En cours</p>
            <p className="mt-1 text-2xl font-bold text-blue-700">{analysis.byStatus.encours}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h3 className="font-bold text-foreground">Cycles de bourses accessibles</h3>
        <p className="mt-2 text-sm text-muted">
          Selon votre niveau, vous pouvez postuler aux bourses finançant :
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {analysis.cyclesEligiblesLabels.map((label) => (
            <span
              key={label}
              className="rounded-full bg-gradient-to-r from-aksanti-red/10 to-ship-orange/10 px-4 py-2 text-sm font-semibold text-foreground"
            >
              {label}
            </span>
          ))}
        </div>
        {analysis.cyclesEligibles.length === 1 && analysis.cyclesEligibles[0] === "undergraduate" && (
          <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Les bourses Master (Excellentia, Chevening, Eiffel…) et Doctorat ne s&apos;afficheront
            pas tant que vous n&apos;avez pas obtenu votre Licence / Bachelor.
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h3 className="font-bold text-foreground">Points forts</h3>
          <ul className="mt-3 space-y-2">
            {analysis.strengths.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm text-muted">
                <span className="text-green-500">✓</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h3 className="font-bold text-foreground">Recommandations</h3>
          <ul className="mt-3 space-y-2">
            {analysis.recommendations.length > 0 ? (
              analysis.recommendations.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-muted">
                  <span className="text-ship-orange">→</span> {r}
                </li>
              ))
            ) : (
              <li className="text-sm text-muted">Votre profil est bien positionné. Explorez vos opportunités !</li>
            )}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/opportunites"
          className="rounded-full bg-aksanti-red px-6 py-3 text-sm font-bold text-white transition hover:bg-aksanti-red-dark"
        >
          Voir mes opportunités filtrées
        </Link>
        <Link
          href="/profil"
          className="rounded-full border-2 border-border px-6 py-3 text-sm font-bold text-foreground transition hover:border-aksanti-red"
        >
          Modifier mon profil
        </Link>
      </div>
    </div>
  );
}
