import { getCountryFlagUrl } from "@/lib/bourses/country-flags";

const sizeClasses = {
  sm: "h-5 w-7 rounded-sm",
  md: "h-8 w-11 rounded-md",
  lg: "h-12 w-16 rounded-lg",
};

interface CountryFlagProps {
  country: string;
  size?: keyof typeof sizeClasses;
  className?: string;
}

export function CountryFlag({ country, size = "md", className = "" }: CountryFlagProps) {
  const flagUrl = getCountryFlagUrl(country, size === "lg" ? 120 : size === "md" ? 80 : 40);

  if (!flagUrl) {
    return (
      <span
        className={`inline-flex items-center justify-center bg-surface text-lg ${sizeClasses[size]} ${className}`}
        aria-hidden
        title={country}
      >
        🌍
      </span>
    );
  }

  return (
    <img
      src={flagUrl}
      alt=""
      width={size === "lg" ? 64 : size === "md" ? 44 : 28}
      height={size === "lg" ? 48 : size === "md" ? 32 : 20}
      className={`object-cover shadow-sm ring-1 ring-border/60 ${sizeClasses[size]} ${className}`}
      loading="lazy"
    />
  );
}
