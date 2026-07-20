"use client";

import { Alert, Button } from "@/components/ui/Form";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VerifierEmailPage() {
  const { user, verifyEmail } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 shadow-sm text-center">
        <Alert type="warning">Veuillez d&apos;abord créer un compte ou vous connecter.</Alert>
        <Link href="/auth/inscription" className="mt-4 inline-block text-sm font-semibold text-aksanti-red">
          Créer un compte
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-8 shadow-sm text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-aksanti-red/10 text-2xl">
        ✉️
      </div>
      <h1 className="mt-4 text-2xl font-extrabold text-foreground">Confirmez votre compte</h1>
      <p className="mt-3 text-sm text-muted">
        Un email de confirmation a été envoyé à <strong>{user.email}</strong>.
        Veuillez cliquer sur le lien dans l&apos;email pour activer votre compte.
      </p>

      {user.emailVerified ? (
        <Alert type="success">Votre compte est déjà vérifié !</Alert>
      ) : (
        <div className="mt-6 space-y-3">
          <p className="text-xs text-muted">
            En mode démo, cliquez ci-dessous pour simuler la vérification.
          </p>
          <Button
            onClick={() => {
              void verifyEmail().then(() => router.push("/profil"));
            }}
            className="w-full"
          >
            Simuler la vérification email
          </Button>
        </div>
      )}

      <Link href="/" className="mt-4 inline-block text-sm text-muted hover:text-aksanti-red">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
