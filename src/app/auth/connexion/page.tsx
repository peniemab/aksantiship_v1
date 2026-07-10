"use client";

import { Alert, Button, FormField, Input, PasswordInput } from "@/components/ui/Form";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { safeRedirect } from "@/lib/navigation";

function ConnexionForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirect(searchParams.get("redirect"));
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const err = login(form.email, form.password);
    if (err) {
      setError(err);
      return;
    }
    router.push(redirectTo);
  };

  return (
    <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-extrabold text-foreground">Se connecter</h1>
      {redirectTo !== "/" && (
        <p className="mt-2 text-sm text-muted">
          Connectez-vous pour accéder à la page demandée.
        </p>
      )}

      {error && <div className="mt-4"><Alert type="error">{error}</Alert></div>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormField label="Adresse mail" required>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </FormField>
        <FormField label="Mot de passe" required>
          <PasswordInput
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            autoComplete="current-password"
          />
        </FormField>
        <Button type="submit" className="w-full">Se connecter</Button>
      </form>

      <p className="mt-4 text-center text-sm">
        <Link href="/auth/mot-de-passe-oublie" className="text-aksanti-red hover:underline">
          Mot de passe oublié ?
        </Link>
      </p>

      <p className="mt-6 text-center text-sm text-muted">
        Pas encore de compte ?{" "}
        <Link
          href={redirectTo !== "/" ? `/auth/inscription?redirect=${encodeURIComponent(redirectTo)}` : "/auth/inscription"}
          className="font-semibold text-aksanti-red hover:underline"
        >
          Créer un compte
        </Link>
      </p>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <p className="text-sm text-muted">Chargement...</p>
        </div>
      }
    >
      <ConnexionForm />
    </Suspense>
  );
}
