import { Footer } from "@/components/Footer";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";

export const metadata = {
  title: "Politique de confidentialité — Aksantiship",
};

export default function PrivacyPage() {
  return (
    <>
      <MarketingHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-foreground">
            Politique de confidentialité
          </h1>
          <p className="mt-6 leading-relaxed text-muted">
            La politique de confidentialité d&apos;Aksantiship sera publiée prochainement.
            Pour toute question relative à vos données, contactez-nous à{" "}
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
