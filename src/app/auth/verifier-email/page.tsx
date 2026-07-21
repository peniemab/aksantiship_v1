"use client";

import { Alert, Button } from "@/components/ui/Form";
import { useAuth } from "@/context/AuthContext";
import { loadPendingEmail } from "@/lib/auth/pending-email";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  auth_callback_missing_code:
    "Lien de confirmation incomplet. Rouvrez le lien depuis votre e-mail, ou renvoyez un nouvel e-mail.",
  auth_callback_exchange_failed:
    "Impossible de valider le lien (expiré ou déjà utilisé). Renvoyez un e-mail de confirmation, puis cliquez sur le nouveau lien.",
};

function VerifierEmailContent() {
  const { user, isLoading, refreshEmailVerification, resendVerificationEmail } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");

  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(
    null,
  );
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setPendingEmail(loadPendingEmail());
  }, []);

  useEffect(() => {
    if (callbackError) {
      setMessage({
        type: "error",
        text: ERROR_MESSAGES[callbackError] ?? "La confirmation a échoué. Réessayez.",
      });
    }
  }, [callbackError]);

  useEffect(() => {
    if (!isLoading && user?.emailVerified) {
      const timer = window.setTimeout(() => {
        router.replace("/tableau-de-bord");
      }, 1200);
      return () => window.clearTimeout(timer);
    }
  }, [user?.emailVerified, isLoading, router]);

  const displayEmail = user?.email || pendingEmail;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 shadow-sm text-center">
        <p className="text-sm text-muted">Chargement...</p>
      </div>
    );
  }

  if (!displayEmail) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 shadow-sm text-center">
        <Alert type="warning">
          Aucune inscription en cours sur cet appareil. Créez un compte, ou connectez-vous
          après avoir confirmé votre e-mail.
        </Alert>
        {message && (
          <div className="mt-4 text-left">
            <Alert type={message.type}>{message.text}</Alert>
          </div>
        )}
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/auth/inscription"
            className="inline-block text-sm font-semibold text-aksanti-red hover:underline"
          >
            Créer un compte
          </Link>
          <Link
            href="/auth/connexion"
            className="inline-block text-sm font-semibold text-aksanti-red hover:underline"
          >
            Se connecter
          </Link>
        </div>
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
      text: "E-mail pas encore confirmé. Cliquez sur le lien reçu, puis réessayez. Si le lien a déjà été ouvert, connectez-vous.",
    });
  };

  if (user?.emailVerified) {
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
        Un e-mail de confirmation a été envoyé à <strong>{displayEmail}</strong>.
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
          disabled={checking || resending || !user?.id}
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
        Après le clic sur le lien, vous serez connecté automatiquement et redirigé vers
        votre tableau de bord. Si ça échoue,{" "}
        <Link href="/auth/connexion" className="font-semibold text-aksanti-red hover:underline">
          connectez-vous
        </Link>
        .
      </p>

      <Link href="/" className="mt-4 inline-block text-sm text-muted hover:text-aksanti-red">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}

export default function VerifierEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm text-center">
          <p className="text-sm text-muted">Chargement...</p>
        </div>
      }
    >
      <VerifierEmailContent />
    </Suspense>
  );
}
