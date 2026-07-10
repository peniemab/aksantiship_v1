import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { resolveCountryFromSlug } from "@/lib/bourses/countries";
import { listScholarshipCountriesServer } from "@/lib/bourses/repository.server";
import { CountryPageClient } from "./CountryPageClient";

export default async function PaysCountryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const countries = listScholarshipCountriesServer();
  const country = resolveCountryFromSlug(slug, countries);

  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-hidden bg-surface py-10">
        <div className="mx-auto min-w-0 max-w-6xl px-4 sm:px-6">
          <CountryPageClient country={country ?? null} />
        </div>
      </main>
      <Footer />
    </>
  );
}
