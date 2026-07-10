import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { CountryExplorerGrid } from "@/components/CountryExplorerGrid";
import {
  countBoursesByCountryServer,
  listScholarshipCountriesServer,
} from "@/lib/bourses/repository.server";
import { getCountrySummary } from "@/lib/bourses/countries";

export default function PaysIndexPage() {
  const countries = listScholarshipCountriesServer();
  const countryItems = countries.map((country) => ({
    country,
    count: countBoursesByCountryServer(country),
  }));

  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-hidden bg-surface py-10">
        <div className="mx-auto min-w-0 max-w-6xl px-4 sm:px-6">
          <h1 className="text-3xl font-extrabold text-foreground">Pays de destination</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Explorez les bourses par pays hôte. Complétez votre profil pour ne voir que celles
            compatibles avec votre niveau d&apos;études.
          </p>

          <CountryExplorerGrid items={countryItems.filter((i) => i.count > 0)} />

          <div className="mt-12 space-y-4">
            {countries.map((country) => {
              const count = countBoursesByCountryServer(country);
              if (count === 0) return null;
              return (
                <details key={country} className="rounded-2xl border border-border bg-white p-4">
                  <summary className="cursor-pointer font-semibold text-foreground">
                    {country} ({count} bourse{count > 1 ? "s" : ""})
                  </summary>
                  <p className="mt-2 text-sm text-muted">{getCountrySummary(country)}</p>
                </details>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
