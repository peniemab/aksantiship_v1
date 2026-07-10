import { Footer } from "@/components/Footer";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";

export const metadata = {
  title: "Conditions d'utilisation — Aksantiship",
};

export default function ConditionsPage() {
  return (
    <>
      <MarketingHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-foreground">Conditions d&apos;utilisation</h1>
          <p className="mt-6 leading-relaxed text-muted">
            Les conditions d&apos;utilisation d&apos;Aksantiship seront publiées prochainement.
            Pour toute question, contactez-nous à{" "}
            <a href="mailto:contact@aksantiship.com" className="font-semibold text-aksanti-red">
              contact@aksantiship.com
            </a>
            .
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
