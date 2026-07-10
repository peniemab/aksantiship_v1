"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { ProfileAnalysisCard } from "@/components/ProfileAnalysisCard";
import { Alert } from "@/components/ui/Form";
import { useBourses } from "@/hooks/useBourses";
import { analyzeProfile } from "@/lib/matching";
import { useAuth } from "@/context/AuthContext";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import Link from "next/link";
import { useMemo } from "react";

function AnalyseContent() {
  const { profile } = useAuth();
  const { bourses, loading, error } = useBourses();

  const analysis = useMemo(
    () => (profile && bourses.length > 0 ? analyzeProfile(profile, bourses) : null),
    [profile, bourses],
  );

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-extrabold text-foreground">Analyse du profil</h1>
        <div className="mt-6 space-y-4">
          <Alert type="info">
            <strong>Étape 1 :</strong> Créez un compte.{" "}
            <Link href="/auth/inscription" className="font-semibold underline">Créer un compte</Link>
          </Alert>
          <Alert type="warning">
            <strong>Étape 2 :</strong> Complétez votre profil académique.{" "}
            <Link href="/profil" className="font-semibold underline">Créer mon profil</Link>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-extrabold text-foreground">Analyse du profil</h1>
      <p className="mt-2 text-muted">
        Analyse basée sur {loading ? "…" : `${bourses.length} bourses`} chargées via{" "}
        <code className="rounded bg-surface px-1 text-xs">GET /api/bourses</code>
      </p>

      {error && (
        <div className="mt-4">
          <Alert type="error">{error}</Alert>
        </div>
      )}

      {loading ? (
        <div className="mt-8 h-48 animate-pulse rounded-2xl bg-white" />
      ) : analysis ? (
        <div className="mt-8">
          <ProfileAnalysisCard analysis={analysis} />
        </div>
      ) : null}
    </div>
  );
}

export default function AnalyseProfilPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-surface py-10">
        <div className="mx-auto px-4 sm:px-6">
          <RequireAuth requireVerified>
            <AnalyseContent />
          </RequireAuth>
        </div>
      </main>
      <Footer />
    </>
  );
}
