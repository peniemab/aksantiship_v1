"use client";

import { AppButton } from "@/components/ui/AppButton";
import { HOW_IT_WORKS_STEPS } from "@/lib/marketing";

export function HowItWorksSection() {
  return (
    <section
      id="comment-ca-marche"
      className="scroll-mt-24 bg-gradient-to-b from-ship-orange/20 via-ship-orange/12 to-ship-orange/5 py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
            Votre bourse idéale, en 3 étapes simples
          </h2>
          <p className="mt-3 text-muted leading-relaxed">
            Plus besoin de parcourir des centaines d&apos;offres inadaptées. Aksantiship vous
            guide vers les opportunités qui correspondent vraiment à votre profil.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((item) => (
            <article
              key={item.step}
              className="rounded-2xl border border-ship-orange/20 bg-white p-6 shadow-[var(--card-shadow)]"
            >
              <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-aksanti-red text-sm font-bold text-white shadow-sm">
                {item.step}
              </div>
              <h3 className="mt-4 text-center font-bold text-foreground">{item.title}</h3>
              <p className="mt-2 text-center text-sm leading-relaxed text-muted">
                {item.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <AppButton href="/auth/inscription" variant="primary">
            Commencer gratuitement
          </AppButton>
        </div>
      </div>
    </section>
  );
}
