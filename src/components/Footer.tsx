"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthNavButtons } from "@/components/AuthNavButtons";
import { useAuth } from "@/context/AuthContext";
import { AppButton } from "@/components/ui/AppButton";
import {
  FOOTER_PLATFORM_LINKS,
  PUBLIC_NAV_LINKS,
} from "@/lib/marketing";
import { APP_NAV_LINKS } from "@/lib/navigation";

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm text-white/65 transition hover:text-white"
    >
      {children}
    </Link>
  );
}

function FooterColumn({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="text-sm font-bold uppercase tracking-wide text-white">{title}</h3>
      <ul className="mt-4 space-y-3">{children}</ul>
    </div>
  );
}

export function Footer() {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSent, setNewsletterSent] = useState(false);

  function handleNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSent(true);
  }

  return (
    <footer className="border-t border-white/10 bg-foreground text-white">
      {/* Bandeau CTA — équivalent « Demander une démo » adapté à Aksantiship */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_auto] lg:items-center lg:gap-12">
            <div>
              <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl">
                Prêt à trouver votre bourse ?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                Créez votre espace candidat et découvrez les opportunités de financement
                adaptées à votre profil, votre niveau et vos projets à l&apos;étranger.
              </p>
            </div>
            <div className="lg:justify-end">
              {isAuthenticated ? (
                <AppButton href="/tableau-de-bord" variant="primary">
                  Ouvrir l&apos;application
                </AppButton>
              ) : (
                <AuthNavButtons variant="dark" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Colonnes principales — espacement proportionnel gauche → droite */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between md:gap-6">
          <FooterColumn title="Explorer" className="shrink-0">
            {PUBLIC_NAV_LINKS.map((link) => (
              <li key={link.href}>
                <FooterLink href={link.href}>{link.label}</FooterLink>
              </li>
            ))}
            {isAuthenticated &&
              APP_NAV_LINKS.slice(0, 3).map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
          </FooterColumn>

          <FooterColumn title="Plateforme" className="shrink-0">
            {FOOTER_PLATFORM_LINKS.map((link) => (
              <li key={link.href}>
                <FooterLink href={link.href}>{link.label}</FooterLink>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Newsletter" className="w-full shrink-0 md:max-w-xs lg:max-w-sm">
            <li className="list-none">
              <p className="text-sm leading-relaxed text-white/60">
                Recevez les alertes bourses et les actualités Aksantiship directement dans
                votre boîte mail.
              </p>
              <form className="mt-4 space-y-3" onSubmit={handleNewsletter}>
                <label htmlFor="footer-newsletter" className="sr-only">
                  Votre adresse email
                </label>
                <input
                  id="footer-newsletter"
                  type="email"
                  value={newsletterEmail}
                  onChange={(event) => setNewsletterEmail(event.target.value)}
                  placeholder="Votre adresse email"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-aksanti-red/60 focus:ring-2 focus:ring-aksanti-red/20"
                  disabled={newsletterSent}
                />
                <button
                  type="submit"
                  disabled={newsletterSent}
                  className="w-full rounded-xl bg-aksanti-red px-4 py-2.5 text-sm font-bold text-white transition hover:bg-aksanti-red-dark disabled:cursor-default disabled:opacity-70"
                >
                  {newsletterSent ? "Merci pour votre inscription" : "Recevoir les alertes"}
                </button>
              </form>
            </li>
          </FooterColumn>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-center text-sm text-white/45 sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <p>© {new Date().getFullYear()} Aksantiship. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
