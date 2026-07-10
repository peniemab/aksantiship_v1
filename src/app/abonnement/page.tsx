"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PricingPlans } from "@/components/marketing/PricingPlans";
import { Alert } from "@/components/ui/Form";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";

function SubscriptionContent() {
  const { hasActiveSubscription, subscription } = useAuth();

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-extrabold text-foreground">Abonnement & tarifs</h1>
      <p className="mt-3 max-w-2xl text-muted leading-relaxed">
        Choisissez la formule adaptée à votre parcours. Premium débloque le matching intelligent,
        l&apos;analyse de documents et l&apos;assistant candidature.
      </p>

      {hasActiveSubscription && subscription ? (
        <div className="mt-6 max-w-xl">
          <Alert type="success">
            Votre abonnement est actif jusqu&apos;au{" "}
            <strong>{formatDate(subscription.expiresAt)}</strong>.
          </Alert>
        </div>
      ) : null}

      <div className="mt-10">
        <PricingPlans compact />
      </div>
    </div>
  );
}

export default function AbonnementPage() {
  return (
    <DashboardShell>
      <SubscriptionContent />
    </DashboardShell>
  );
}
