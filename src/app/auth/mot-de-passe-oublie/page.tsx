"use client";

import { Alert, Button, FormField, Input } from "@/components/ui/Form";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useState } from "react";

export default function MotDePasseOubliePage() {
  const { resetPasswordRequest } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const found = resetPasswordRequest(email);
    if (!found) {
      setError("Aucun compte trouvé avec cette adresse email.");
      return;
    }
    setSent(true);
  };

  return (
    <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-extrabold text-foreground">Réinitialiser le mot de passe</h1>
      <p className="mt-2 text-sm text-muted">
        Insérez votre adresse mail pour recevoir un lien de réinitialisation.
      </p>

      {sent ? (
        <div className="mt-6">
          <Alert type="success">
            Un email de réinitialisation a été envoyé à <strong>{email}</strong>.
            Vérifiez votre boîte de réception.
          </Alert>
          <Link href="/auth/connexion" className="mt-4 inline-block text-sm font-semibold text-aksanti-red hover:underline">
            Retour à la connexion
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <Alert type="error">{error}</Alert>}
          <FormField label="Adresse mail" required>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </FormField>
          <Button type="submit" className="w-full">Envoyer le lien</Button>
        </form>
      )}
    </div>
  );
}
