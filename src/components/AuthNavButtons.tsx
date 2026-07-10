import Link from "next/link";

function LoginIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
      />
    </svg>
  );
}

function SignUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
      />
    </svg>
  );
}

type AuthNavButtonsProps = {
  stack?: boolean;
  onNavigate?: () => void;
  /** Variante pour fond sombre (footer). */
  variant?: "light" | "dark";
  /** Navbar mobile : boutons compacts et alignés. */
  layout?: "default" | "navbar";
};

export function AuthNavButtons({
  stack = false,
  onNavigate,
  variant = "light",
  layout = "default",
}: AuthNavButtonsProps) {
  const isNavbarMobile = layout === "navbar";

  const loginClass = [
    "inline-flex items-center justify-center gap-1.5 font-semibold transition whitespace-nowrap",
    isNavbarMobile
      ? "h-9 shrink-0 rounded-full border-2 px-2.5 text-[11px] sm:h-10 sm:gap-2 sm:px-4 sm:text-sm"
      : stack
        ? "flex w-full gap-2 rounded-full border-2 px-4 py-2.5 text-sm"
        : "rounded-full border-2 px-4 py-2 text-sm sm:gap-2 sm:px-4 sm:py-2.5",
    variant === "dark"
      ? "border-white text-white hover:bg-white hover:text-foreground"
      : "border-aksanti-red text-aksanti-red hover:bg-aksanti-red hover:text-white",
  ].join(" ");

  const signupClass = [
    "inline-flex items-center justify-center gap-1.5 font-bold transition whitespace-nowrap shadow-sm",
    isNavbarMobile
      ? "h-9 shrink-0 rounded-full px-2.5 text-[11px] sm:h-10 sm:gap-2 sm:px-5 sm:text-sm"
      : stack
        ? "flex w-full gap-2 rounded-full px-4 py-2.5 text-sm"
        : "rounded-full px-4 py-2.5 text-sm sm:gap-2 sm:px-5",
    "bg-aksanti-red text-white hover:bg-aksanti-red-dark",
  ].join(" ");

  const iconClass = isNavbarMobile ? "size-3.5 shrink-0 sm:size-4" : "size-4 shrink-0";

  const containerClass = stack
    ? "space-y-2"
    : isNavbarMobile
      ? "flex shrink-0 items-center gap-1.5 sm:gap-2"
      : "flex flex-wrap items-center gap-2 sm:gap-3";

  return (
    <div className={containerClass}>
      <Link href="/auth/connexion" className={loginClass} onClick={onNavigate}>
        <LoginIcon className={iconClass} />
        {isNavbarMobile ? (
          <>
            <span className="sm:hidden">Connexion</span>
            <span className="hidden sm:inline">Se connecter</span>
          </>
        ) : (
          <span>Se connecter</span>
        )}
      </Link>
      <Link href="/auth/inscription" className={signupClass} onClick={onNavigate}>
        <SignUpIcon className={iconClass} />
        {isNavbarMobile ? (
          <>
            <span className="sm:hidden">Inscription</span>
            <span className="hidden sm:inline">S&apos;inscrire</span>
          </>
        ) : (
          <span>S&apos;inscrire</span>
        )}
      </Link>
    </div>
  );
}
