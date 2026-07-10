"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { Alert, Button } from "@/components/ui/Form";
import {
  ACCOMPANIMENT_PRICE_USD,
  SUBSCRIPTION_PRICE_USD,
} from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function PaymentContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") ?? "abonnement";
  const accompagnementId = searchParams.get("id");
  const router = useRouter();
  const {
    activateSubscription,
    confirmProfileAfterPayment,
    confirmAccompanimentPayment,
    pendingProfile,
    accompaniments,
    user,
  } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const accompagnement = accompaniments.find((a) => a.id === accompagnementId);

  const labels: Record<string, { title: string; price: number; desc: string }> = {
    profil: {
      title: "Paiement : enregistrement du profil",
      price: SUBSCRIPTION_PRICE_USD,
      desc: "Finalisez votre abonnement pour enregistrer votre profil.",
    },
    abonnement: {
      title: "Paiement : abonnement annuel",
      price: SUBSCRIPTION_PRICE_USD,
      desc: "Souscrivez à l'abonnement pour accéder à toutes les fonctionnalités.",
    },
    accompagnement: {
      title: `Paiement : accompagnement${accompagnement ? ` (${accompagnement.bourseNom})` : ""}`,
      price: ACCOMPANIMENT_PRICE_USD,
      desc: "Finalisez le paiement pour valider votre demande d'accompagnement.",
    },
  };

  const info = labels[type] ?? labels.abonnement;

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      activateSubscription();

      if (type === "profil" && pendingProfile) {
        confirmProfileAfterPayment();
        setDone(true);
        setProcessing(false);
        return;
      }

      if (type === "accompagnement" && accompagnementId) {
        confirmAccompanimentPayment(accompagnementId);
        setDone(true);
        setProcessing(false);
        return;
      }

      setDone(true);
      setProcessing(false);
    }, 1500);
  };

  if (done) {
    if (type === "accompagnement" && accompagnement) {
      return (
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-white p-8 shadow-sm">
          <Alert type="success">
            <p className="font-semibold">
              Cher {accompagnement.nomPrenom}, votre souscription à l&apos;accompagnement pour la
              Bourse <strong>{accompagnement.bourseNom}</strong> a été validée.
            </p>
            <p className="mt-3">
              Vous serez directement redirigé dans le forum d&apos;accompagnement, ou{" "}
              <a href="#" className="font-semibold underline">cliquez sur ce lien</a> pour le rejoindre.
            </p>
          </Alert>
          <Button className="mt-6 w-full" onClick={() => router.push("/opportunites")}>
            Voir mes opportunités
          </Button>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-white p-8 shadow-sm">
        <Alert type="success">
          Paiement effectué avec succès !
          {type === "profil" && " Votre profil a été enregistré."}
          {type === "abonnement" && " Votre abonnement est maintenant actif."}
        </Alert>
        <Button className="mt-6 w-full" onClick={() => router.push("/opportunites")}>
          Voir mes opportunités
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-extrabold text-foreground">{info.title}</h1>
      <p className="mt-2 text-sm text-muted">{info.desc}</p>

      {user && (
        <p className="mt-4 text-sm text-muted">
          Compte : <strong>{user.email}</strong>
        </p>
      )}

      <div className="mt-8 rounded-2xl border border-border bg-surface p-6 text-center">
        <p className="text-sm text-muted">Montant à payer</p>
        <p className="mt-2 text-4xl font-extrabold text-aksanti-red">${info.price}</p>
        <p className="mt-2 text-xs text-muted">
          Mode démo. Aucun paiement réel ne sera effectué.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <div className="rounded-xl border border-border p-4">
          <p className="text-sm font-medium">Méthode de paiement</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Mobile Money", "Carte bancaire", "Virement"].map((m) => (
              <span key={m} className="rounded-full border border-border px-3 py-1 text-xs font-medium">
                {m}
              </span>
            ))}
          </div>
        </div>

        <Button className="w-full" onClick={handlePay} disabled={processing}>
          {processing ? "Traitement en cours..." : `Payer $${info.price}`}
        </Button>
      </div>
    </div>
  );
}

export default function PaiementPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-surface py-10">
        <div className="mx-auto px-4 sm:px-6">
          <RequireAuth requireVerified>
            <Suspense fallback={<p className="text-center text-muted">Chargement...</p>}>
              <PaymentContent />
            </Suspense>
          </RequireAuth>
        </div>
      </main>
      <Footer />
    </>
  );
}
