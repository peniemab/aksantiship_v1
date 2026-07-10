"use client";

import Link from "next/link";
import { useState } from "react";
import { PRICING_PLANS } from "@/lib/dashboard-navigation";
import { useRouter } from "next/navigation";

export function PricingPlans({ compact = false }: { compact?: boolean }) {
  const [annual, setAnnual] = useState(true);
  const router = useRouter();

  return (
    <div className={compact ? "" : "mx-auto max-w-4xl"}>
      <div className="flex items-center justify-center gap-3">
        <span className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted"}`}>
          Mensuel
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={annual}
          onClick={() => setAnnual((v) => !v)}
          className={[
            "relative h-7 w-12 rounded-full transition",
            annual ? "bg-aksanti-red" : "bg-border",
          ].join(" ")}
        >
          <span
            className={[
              "absolute top-0.5 size-6 rounded-full bg-white shadow transition",
              annual ? "left-5" : "left-0.5",
            ].join(" ")}
          />
        </button>
        <span className={`text-sm font-medium ${annual ? "text-foreground" : "text-muted"}`}>
          Annuel
        </span>
      </div>

      <div className={`mt-8 grid gap-6 ${compact ? "md:grid-cols-2" : "md:grid-cols-2"}`}>
        {Object.values(PRICING_PLANS).map((plan) => {
          const price = annual ? plan.annualUsd : plan.monthlyUsd;
          const period = annual ? "/an" : "/mois";
          const isPremium = "recommended" in plan && plan.recommended;

          return (
            <article
              key={plan.id}
              className={[
                "relative rounded-2xl border bg-white p-8 shadow-[var(--card-shadow)]",
                isPremium ? "border-aksanti-red ring-2 ring-aksanti-red/20" : "border-border",
              ].join(" ")}
            >
              {isPremium && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-aksanti-red px-4 py-1 text-xs font-bold text-white">
                  Recommandé
                </span>
              )}
              <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              <p className="mt-4">
                <span className="text-4xl font-extrabold text-foreground">${price}</span>
                <span className="text-muted">{period}</span>
              </p>
              <ul className="mt-6 flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted">
                    <span className="mt-0.5 text-aksanti-red">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/paiement?type=abonnement&plan=${plan.id}${annual ? "&billing=annual" : ""}`,
                  )
                }
                className={[
                  "mt-8 w-full rounded-full py-3 text-sm font-bold transition",
                  isPremium
                    ? "bg-aksanti-red text-white hover:bg-aksanti-red-dark"
                    : "border border-border text-foreground hover:border-aksanti-red/40",
                ].join(" ")}
              >
                Choisir {plan.name}
              </button>
            </article>
          );
        })}
      </div>

      {!compact && (
        <p className="mt-8 text-center text-sm text-muted">
          Déjà inscrit ?{" "}
          <Link href="/auth/connexion" className="font-semibold text-aksanti-red hover:underline">
            Connectez-vous
          </Link>
        </p>
      )}
    </div>
  );
}
