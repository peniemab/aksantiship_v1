"use client";

import { Alert, Button } from "@/components/ui/Form";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifierEmailPage() {
  const { user, isLoading, refreshEmailVerification, resendVerificationEmail } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(
    null,
  );
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!isLoading && user?.emailVerified) {
      const timer = window.setTimeout(() => {
        router.replace("/tableau-de-bord");
      }, 1500);
      return () => window.clearTimeout(timer);
    }
  }, [user?.emailVerified, isLoading, router]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 shadow-sm text-center">
        <p className="text-sm text-muted">Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 shadow-sm text-center">
        <Alert type="warning">
          Veuillez d&apos;abord créer un compte ou vous connecter.
        </Alert>
        <Link
          href="/auth/inscription"
          className="mt-4 inline-block text-sm font-semibold text-aksanti-red"
        >
          Créer un compte
        </Link>
      </div>
    );
  }

  const handleResend = async () => {
    setMessage(null);
    setResending(true);
    const err = await resendVerificationEmail();
    setResending(false);
    if (err) {
      setMessage({ type: "error", text: err });
      return;
    }
    setMessage({
      type: "success",
      text: "Un nouvel e-mail de confirmation a été envoyé. Vérifiez aussi vos spams.",
    });
  };

  const handleRefresh = async () => {
    setMessage(null);
    setChecking(true);
    const verified = await refreshEmailVerification();
    setChecking(false);
    if (verified) {
      setMessage({
        type: "success",
        text: "E-mail confirmé. Redirection vers votre espace…",
      });
      router.replace("/tableau-de-bord");
      return;
    }
    setMessage({
      type: "info",
      text: "E-mail pas encore confirmé. Ouvrez le lien reçu dans votre boîte mail, puis réessayez.",
    });
  };

  if (user.emailVerified) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 shadow-sm text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl">
          ✓
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-foreground">Compte confirmé</h1>
        <p className="mt-3 text-sm text-muted">
          Votre adresse <strong>{user.email}</strong> est vérifiée. Redirection…
        </p>
        <Link
          href="/tableau-de-bord"
          className="mt-6 inline-block text-sm font-semibold text-aksanti-red hover:underline"
        >
          Aller au tableau de bord
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
        Un e-mail de confirmation a été envoyé à <strong>{user.email}</strong>.
        Ouvrez le lien dans cet e-mail pour activer votre compte (pensez à vérifier les spams).
      </p>

      {message && (
        <div className="mt-4 text-left">
          <Alert type={message.type}>{message.text}</Alert>
        </div>
      )}

      <div className="mt-6 space-y-3">
        <Button
          type="button"
          onClick={() => void handleRefresh()}
          className="w-full"
          disabled={checking || resending}
        >
          {checking ? "Vérification…" : "J'ai confirmé mon e-mail"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void handleResend()}
          className="w-full"
          disabled={resending || checking}
        >
          {resending ? "Envoi…" : "Renvoyer l'e-mail de confirmation"}
        </Button>
      </div>

      <p className="mt-6 text-xs text-muted">
        Après avoir cliqué sur le lien dans l&apos;e-mail, vous serez reconnecté automatiquement.
        Sinon, utilisez le bouton ci-dessus.
      </p>

      <Link href="/" className="mt-4 inline-block text-sm text-muted hover:text-aksanti-red">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
