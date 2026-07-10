"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  NAV_BADGE_LABELS,
  PRIMARY_APP_NAV,
  getNavLinkBadge,
  isNavActive,
  resolveNavHref,
  type NavLinkBadge,
} from "@/lib/navigation";
import { AuthNavButtons } from "@/components/AuthNavButtons";

function NavBadge({ type }: { type: NavLinkBadge }) {
  const styles: Record<NavLinkBadge, string> = {
    profile: "bg-ship-orange text-white",
    email: "bg-amber-500 text-white",
    subscription: "bg-aksanti-red/10 text-aksanti-red",
  };

  return (
    <span
      className={`ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none ${styles[type]}`}
      title={NAV_BADGE_LABELS[type]}
      aria-label={NAV_BADGE_LABELS[type]}
    >
      !
    </span>
  );
}

function navLinkClass(pathname: string, href: string, stack = false): string {
  const active = isNavActive(pathname, href);
  return [
    stack ? "flex w-full items-center" : "inline-flex items-center",
    "rounded-lg px-3 py-2 text-sm font-medium transition",
    active
      ? "bg-aksanti-red/8 text-aksanti-red"
      : "text-foreground/75 hover:bg-surface hover:text-foreground",
  ].join(" ");
}

function UserAccountMenu({
  onNavigate,
  stack = false,
}: {
  onNavigate?: () => void;
  stack?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user, profile, logout, hasActiveSubscription } = useAuth();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  if (!user) return null;

  const close = () => {
    setOpen(false);
    onNavigate?.();
  };

  if (stack) {
    return (
      <div className="space-y-1 border-t border-border pt-4">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wide text-muted">
          Mon compte
        </p>
        <Link
          href="/profil"
          className={navLinkClass(pathname, "/profil", true)}
          onClick={close}
        >
          Mon profil
          {!profile && <span className="ml-auto text-xs text-ship-orange">À compléter</span>}
        </Link>
        <Link
          href="/abonnement"
          className={navLinkClass(pathname, "/abonnement", true)}
          onClick={close}
        >
          Abonnement
        </Link>
        <Link
          href="/accompagnement"
          className={navLinkClass(pathname, "/accompagnement", true)}
          onClick={close}
        >
          Accompagnement
        </Link>
        <button
          type="button"
          onClick={() => {
            logout();
            close();
          }}
          className="flex w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground/70 hover:bg-surface"
        >
          Déconnexion
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-border py-1.5 pl-1.5 pr-3 text-sm transition hover:border-aksanti-red/30"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-aksanti-red to-ship-orange text-xs font-bold text-white">
          {user.prenom.charAt(0).toUpperCase()}
        </span>
        <span className="hidden max-w-[100px] truncate text-foreground sm:inline">
          {user.prenom}
        </span>
        {hasActiveSubscription ? (
          <span className="hidden rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700 md:inline">
            Actif
          </span>
        ) : null}
        <svg
          className={`size-4 text-muted transition ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-white py-1 shadow-lg"
          role="menu"
        >
          <p className="border-b border-border px-4 py-2.5 text-xs text-muted">
            Espace candidat · <strong className="text-foreground">{user.prenom}</strong>
          </p>
          <Link
            href="/profil"
            className="block px-4 py-2.5 text-sm text-foreground/80 hover:bg-surface hover:text-aksanti-red"
            role="menuitem"
            onClick={close}
          >
            Mon profil
            {!profile && (
              <span className="ml-1 text-xs text-ship-orange">· à compléter</span>
            )}
          </Link>
          <Link
            href="/abonnement"
            className="block px-4 py-2.5 text-sm text-foreground/80 hover:bg-surface hover:text-aksanti-red"
            role="menuitem"
            onClick={close}
          >
            Abonnement
          </Link>
          <Link
            href="/accompagnement"
            className="block px-4 py-2.5 text-sm text-foreground/80 hover:bg-surface hover:text-aksanti-red"
            role="menuitem"
            onClick={close}
          >
            Accompagnement
          </Link>
          {!user.emailVerified && (
            <Link
              href="/auth/verifier-email"
              className="block px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50"
              role="menuitem"
              onClick={close}
            >
              Vérifier mon email
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              logout();
              close();
            }}
            className="block w-full border-t border-border px-4 py-2.5 text-left text-sm text-foreground/70 hover:bg-surface hover:text-aksanti-red"
            role="menuitem"
          >
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, isLoading, hasActiveSubscription } = useAuth();

  const navCtx = { user, profile, hasActiveSubscription };
  const logoHref = user ? "/tableau-de-bord" : "/";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const renderAppLink = (
    href: string,
    label: string,
    options?: { stack?: boolean; onNavigate?: () => void },
  ) => {
    const badge = getNavLinkBadge(href, navCtx);
    const targetHref = resolveNavHref(href, Boolean(user));

    return (
      <Link
        key={href}
        href={targetHref}
        className={navLinkClass(pathname, href, options?.stack)}
        onClick={options?.onNavigate}
      >
        {label}
        {badge && <NavBadge type={badge} />}
      </Link>
    );
  };

  const accountAlerts = [
    !user?.emailVerified && {
      label: "Vérifiez votre adresse email",
      href: "/auth/verifier-email",
      tone: "border-amber-200 bg-amber-50 text-amber-900",
    },
    user && !profile && {
      label: "Complétez votre profil candidat",
      href: "/profil",
      tone: "border-ship-orange/20 bg-ship-orange/10 text-ship-orange-dark",
    },
  ].filter(Boolean) as { label: string; href: string; tone: string }[];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-[3.75rem] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href={logoHref} className="flex min-w-0 shrink items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Aksantiship"
            width={180}
            height={48}
            className="h-8 w-auto max-w-[9.5rem] sm:h-10 sm:max-w-none"
            priority
          />
          {user && (
            <span className="hidden rounded-full bg-surface px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted lg:inline">
              Application
            </span>
          )}
        </Link>

        {user && (
          <nav className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
            {PRIMARY_APP_NAV.map((link) => renderAppLink(link.href, link.label))}
          </nav>
        )}

        <div className="flex min-w-0 shrink-0 items-center">
          {isLoading ? (
            <div className="h-9 w-28 animate-pulse rounded-full bg-surface sm:w-36" aria-hidden />
          ) : user ? (
            <>
              <Link
                href="/profil"
                className={[
                  "hidden rounded-lg px-3 py-2 text-sm font-medium transition lg:inline-flex lg:items-center",
                  isNavActive(pathname, "/profil")
                    ? "text-aksanti-red"
                    : "text-foreground/75 hover:text-aksanti-red",
                ].join(" ")}
              >
                Profil
                {getNavLinkBadge("/profil", navCtx) && (
                  <NavBadge type={getNavLinkBadge("/profil", navCtx)!} />
                )}
              </Link>
              <div className="hidden lg:block">
                <UserAccountMenu />
              </div>
              <button
                type="button"
                className="rounded-lg p-2 lg:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={mobileOpen}
              >
                <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </>
          ) : (
            <AuthNavButtons layout="navbar" />
          )}
        </div>
      </div>

      {user && mobileOpen && (
        <div className="border-t border-border bg-white px-4 py-4 lg:hidden">
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-aksanti-red to-ship-orange text-sm font-bold text-white">
              {user.prenom.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {user.prenom} {user.nom}
              </p>
              <p className="text-xs text-muted">Espace candidat</p>
            </div>
          </div>

          {accountAlerts.length > 0 && (
            <div className="mb-4 space-y-2">
              {accountAlerts.map((alert) => (
                <Link
                  key={alert.href}
                  href={alert.href}
                  className={`block rounded-lg border px-3 py-2 text-xs font-medium ${alert.tone}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {alert.label}
                </Link>
              ))}
            </div>
          )}

          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wide text-muted">
            Application
          </p>
          {PRIMARY_APP_NAV.map((link) =>
            renderAppLink(link.href, link.label, {
              stack: true,
              onNavigate: () => setMobileOpen(false),
            }),
          )}

          <UserAccountMenu stack onNavigate={() => setMobileOpen(false)} />
        </div>
      )}
    </header>
  );
}
