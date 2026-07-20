"use client";

import { Alert, Button, FormField, Input, PasswordInput } from "@/components/ui/Form";
import { useAuth } from "@/context/AuthContext";
import { useFormDraft } from "@/hooks/useFormDraft";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { safeRedirect } from "@/lib/navigation";

function parseNomComplet(full: string): { nom: string; postNom: string; prenom: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { nom: "", postNom: "", prenom: "" };
  if (parts.length === 1) return { nom: parts[0], postNom: "", prenom: parts[0] };
  if (parts.length === 2) return { nom: parts[1], postNom: "", prenom: parts[0] };
  return {
    prenom: parts[0],
    postNom: parts.slice(1, -1).join(" "),
    nom: parts[parts.length - 1]!,
  };
}

const INSCRIPTION_DRAFT_KEY = "aksantiship_draft_inscription";

function InscriptionForm() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirect(searchParams.get("redirect"));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm, clearDraft] = useFormDraft(
    INSCRIPTION_DRAFT_KEY,
    {
      nomComplet: "",
      telephone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    ["password", "confirmPassword"],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.nomComplet.trim()) {
      setError("Veuillez indiquer votre nom complet.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (form.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    const { nom, postNom, prenom } = parseNomComplet(form.nomComplet);

    setIsSubmitting(true);
    const err = await register({
      nom,
      postNom,
      prenom,
      telephone: form.telephone,
      email: form.email,
      password: form.password,
    });

    if (err) {
      setError(err);
      setIsSubmitting(false);
      return;
    }
    clearDraft();
    router.push("/auth/verifier-email");
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border bg-white shadow-[var(--card-shadow)]">
      <div className="grid md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] md:items-stretch xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
        {/* Panneau gauche — fond sur toute la hauteur de la colonne */}
        <aside className="flex min-h-full flex-col justify-center border-b border-border bg-gradient-to-br from-aksanti-red/10 via-ship-orange/12 to-ship-orange/8 p-6 sm:p-8 md:border-b-0 md:border-r md:self-stretch md:py-8 md:pl-8 md:pr-6">
          <p className="text-xs font-bold uppercase tracking-wide text-aksanti-red">
            Espace candidat
          </p>
          <h2 className="mt-2 text-lg font-extrabold leading-snug text-foreground sm:text-xl">
            Votre parcours bourse commence ici
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted md:max-w-none">
            Matching intelligent, opportunités compatibles et suivi de candidatures.
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-foreground/80 sm:text-sm md:flex-col md:gap-y-2">
            <li className="flex items-center gap-2">
              <span className="text-aksanti-red" aria-hidden>✓</span>
              Profil sécurisé
            </li>
            <li className="flex items-center gap-2">
              <span className="text-aksanti-red" aria-hidden>✓</span>
              Bourses filtrées
            </li>
            <li className="flex items-center gap-2">
              <span className="text-aksanti-red" aria-hidden>✓</span>
              Accompagnement dédié
            </li>
          </ul>
        </aside>

        {/* Formulaire — large, peu vertical */}
        <div className="p-6 sm:p-8 md:py-8 md:pr-8 md:pl-6">
          <h1 className="text-xl font-extrabold text-foreground sm:text-2xl">Créer un compte</h1>
          <p className="mt-1 text-sm text-muted">
            Quelques informations pour activer votre espace.
          </p>

          {error && (
            <div className="mt-4">
              <Alert type="error">{error}</Alert>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-5 grid gap-3 lg:grid-cols-2 lg:gap-x-4 lg:gap-y-3"
          >
            <FormField label="Nom complet">
              <Input
                value={form.nomComplet}
                onChange={(e) => setForm({ ...form, nomComplet: e.target.value })}
                required
                autoComplete="name"
                placeholder="Ex. Jean Mukendi Mbuyi"
              />
            </FormField>
            <FormField label="Numéro de téléphone">
              <Input
                type="tel"
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                required
                autoComplete="tel"
              />
            </FormField>
            <div className="lg:col-span-2">
              <FormField label="Adresse mail">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </FormField>
            </div>
            <FormField label="Mot de passe">
              <PasswordInput
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="new-password"
              />
            </FormField>
            <FormField label="Confirmation mot de passe">
              <PasswordInput
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                autoComplete="new-password"
              />
            </FormField>
            <div className="lg:col-span-2 lg:flex lg:flex-col lg:items-center">
              <Button type="submit" className="w-full lg:w-auto lg:min-w-[10rem]" disabled={isSubmitting}>
                {isSubmitting ? "Création en cours…" : "Créer mon compte"}
              </Button>
              <p className="mt-4 text-center text-sm text-muted">
                Déjà inscrit ?{" "}
                <Link
                  href={
                    redirectTo !== "/"
                      ? `/auth/connexion?redirect=${encodeURIComponent(redirectTo)}`
                      : "/auth/connexion"
                  }
                  className="font-semibold text-aksanti-red hover:underline"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function InscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <p className="text-sm text-muted">Chargement...</p>
        </div>
      }
    >
      <InscriptionForm />
    </Suspense>
  );
}
