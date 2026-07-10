import Link from "next/link";
import { CountryFlag } from "@/components/CountryFlag";
import { getCountryHref } from "@/lib/bourses/countries";

interface CountryExplorerGridProps {
  items: { country: string; count: number }[];
}

export function CountryExplorerGrid({ items }: CountryExplorerGridProps) {
  const sorted = [...items].sort((a, b) => a.country.localeCompare(b.country, "fr"));

  return (
    <ul className="flex flex-wrap justify-center gap-2">
      {sorted.map(({ country, count }) => (
        <li key={country}>
          <Link
            href={getCountryHref(country)}
            className="group inline-flex items-center gap-2.5 rounded-full border border-border bg-white py-2 pl-2 pr-4 transition hover:border-aksanti-red/50 hover:bg-aksanti-red/[0.03]"
          >
            <CountryFlag country={country} size="sm" className="shrink-0" />
            <span className="flex min-w-0 items-baseline gap-2">
              <span className="text-sm font-medium text-foreground group-hover:text-aksanti-red">
                {country}
              </span>
              <span className="text-xs text-muted">{count}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
