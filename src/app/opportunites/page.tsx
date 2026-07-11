"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { BourseSearchFilters } from "@/components/BourseSearchFilters";
import { ScholarshipCard } from "@/components/ScholarshipCard";
import { ProfileAnalysisCard } from "@/components/ProfileAnalysisCard";
import { Alert } from "@/components/ui/Form";
import { useBourses } from "@/hooks/useBourses";
import { filterScholarshipsBySearch, hasActiveBourseFilters, sortScholarshipMatches, type BourseSortOption } from "@/lib/bourses/filters";
import { listStaticCountries } from "@/lib/bourses/repository";
import { analyzeProfile, filterScholarshipsForProfile } from "@/lib/matching";
import type { ScholarshipStatus, StudyCycle } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import Link from "next/link";
import { useMemo, useState } from "react";

const tabs: { key: ScholarshipStatus; label: string }[] = [
  { key: "encours", label: "Bourses en cours" },
  { key: "a_venir", label: "Bourses à venir" },
  { key: "fermee", label: "Bourses fermées" },
];

const defaultCountries = listStaticCountries();

function OpportunitiesContent() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<ScholarshipStatus>("encours");
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [paysFilter, setPaysFilter] = useState("all");
  const [cycleFilter, setCycleFilter] = useState<StudyCycle | "all">("all");
  const [sortBy, setSortBy] = useState<BourseSortOption>("score_desc");

  const { bourses, meta, loading, error } = useBourses(
    profile
      ? {
          niveauEtudes: profile.niveauEtudes,
          nationalite: profile.nationalite,
          includeMatch: true,
        }
      : {},
  );

  const analysis = useMemo(
    () => (profile && bourses.length > 0 ? analyzeProfile(profile, bourses) : null),
    [profile, bourses],
  );

  const countries = useMemo(() => {
    if (meta?.countries?.length) return meta.countries;
    return defaultCountries;
  }, [meta?.countries]);

  const profileMatches = useMemo(() => {
    if (!profile) return [];
    return filterScholarshipsForProfile(profile, bourses, { onlyMatches: true });
  }, [profile, bourses]);

  const searchFilteredMatches = useMemo(() => {
    const scholarships = profileMatches.map((m) => m.scholarship);
    const filtered = filterScholarshipsBySearch(scholarships, {
      query: searchQuery,
      pays: paysFilter,
      cycle: cycleFilter,
    });
    const ids = new Set(filtered.map((s) => s.id));
    return profileMatches.filter((m) => ids.has(m.scholarship.id));
  }, [profileMatches, searchQuery, paysFilter, cycleFilter]);

  const tabCounts = useMemo(() => {
    const counts: Record<ScholarshipStatus, number> = {
      encours: 0,
      a_venir: 0,
      fermee: 0,
    };
    for (const m of searchFilteredMatches) {
      counts[m.scholarship.status] += 1;
    }
    return counts;
  }, [searchFilteredMatches]);

  const matchedForTab = useMemo(() => {
    const forTab = searchFilteredMatches.filter((m) => m.scholarship.status === activeTab);
    return sortScholarshipMatches(forTab, sortBy);
  }, [searchFilteredMatches, activeTab, sortBy]);

  const resetSearch = () => {
    setSearchQuery("");
    setPaysFilter("all");
    setCycleFilter("all");
    setSortBy("score_desc");
  };

  if (!profile) {
    return (
      <div className="min-w-0">
        <h1 className="break-words text-2xl font-extrabold text-foreground sm:text-3xl">Mes Opportunités</h1>
        <p className="mt-2 text-muted">
          Fonctionnalité 2 & 3 : filtrage et organisation des bourses selon votre profil.
        </p>
        <div className="mt-6 space-y-4">
          <Alert type="info">
            Vous avez un compte, mais pas encore de <strong>profil candidat</strong>.{" "}
            <Link href="/profil" className="font-semibold underline">Créer mon profil académique</Link>
          </Alert>
        </div>
      </div>
    );
  }

  const hasSearchFilters = hasActiveBourseFilters({
    query: searchQuery,
    pays: paysFilter,
    cycle: cycleFilter,
  });

  return (
    <div className="min-w-0">
      <h1 className="break-words text-2xl font-extrabold text-foreground sm:text-3xl">Mes Opportunités</h1>
      <p className="mt-2 text-muted">
        {loading
          ? "Chargement des bourses..."
          : hasSearchFilters
            ? `${searchFilteredMatches.length} bourse${searchFilteredMatches.length > 1 ? "s" : ""} trouvée${searchFilteredMatches.length > 1 ? "s" : ""} sur ${profileMatches.length} compatible${profileMatches.length > 1 ? "s" : ""} (${analysis?.niveauLabel ?? ""})`
            : `${profileMatches.length} bourse${profileMatches.length > 1 ? "s" : ""} compatible${profileMatches.length > 1 ? "s" : ""} pour votre niveau (${analysis?.niveauLabel ?? ""})`}
      </p>

      {error && (
        <div className="mt-4">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      {meta?.excluded !== undefined && meta.excluded > 0 && !hasSearchFilters && (
        <div className="mt-4">
          <Alert type="info">
            {meta.excluded} bourse{meta.excluded > 1 ? "s" : ""} masquée{meta.excluded > 1 ? "s" : ""},
            incompatible{meta.excluded > 1 ? "s" : ""} avec votre niveau d&apos;études.
          </Alert>
        </div>
      )}

      <BourseSearchFilters
        query={searchQuery}
        pays={paysFilter}
        cycle={cycleFilter}
        countries={countries}
        resultCount={searchFilteredMatches.length}
        showSort
        sortBy={sortBy}
        onQueryChange={setSearchQuery}
        onPaysChange={setPaysFilter}
        onCycleChange={setCycleFilter}
        onSortChange={setSortBy}
        onReset={resetSearch}
      />

      <button
        type="button"
        onClick={() => setShowAnalysis(!showAnalysis)}
        className="mt-6 text-sm font-semibold text-aksanti-red hover:underline"
      >
        {showAnalysis ? "Masquer" : "Afficher"} l&apos;analyse du profil
      </button>

      {showAnalysis && analysis && (
        <div className="mt-6">
          <ProfileAnalysisCard analysis={analysis} />
        </div>
      )}

      <div className="mt-8 -mx-1 flex gap-2 overflow-x-auto overscroll-x-contain px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition sm:shrink sm:px-5 ${
              activeTab === tab.key
                ? "bg-aksanti-red text-white"
                : "border border-border bg-white text-foreground/70 hover:border-aksanti-red/30"
            }`}
          >
            {tab.label} ({tabCounts[tab.key] ?? 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      ) : matchedForTab.length > 0 ? (
        <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-2">
          {matchedForTab.map((m) => (
            <div key={m.scholarship.id} className="min-w-0">
              <ScholarshipCard scholarship={m.scholarship} match={m} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 text-center">
          <p className="text-muted">
            {hasSearchFilters
              ? "Aucune bourse ne correspond à votre recherche dans cette catégorie."
              : "Aucune bourse compatible dans cette catégorie pour votre niveau d'études."}
          </p>
          {hasSearchFilters && (
            <button
              type="button"
              onClick={resetSearch}
              className="mt-3 text-sm font-semibold text-aksanti-red hover:underline"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function OpportunitesPage() {
  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-hidden bg-surface py-10">
        <div className="mx-auto min-w-0 max-w-6xl px-4 sm:px-6">
          <RequireAuth requireVerified>
            <OpportunitiesContent />
          </RequireAuth>
        </div>
      </main>
      <Footer />
    </>
  );
}
