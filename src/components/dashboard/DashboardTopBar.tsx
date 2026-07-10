"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function DashboardTopBar() {
  const { user, hasActiveSubscription } = useAuth();

  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-white px-4 py-4 sm:px-6 lg:px-8">
      <div>
        <p className="text-xl font-bold text-foreground">
          Bonjour {user?.prenom ?? "candidat"} 👋
        </p>
        <p className="text-sm text-muted">Voici votre tableau de bord Aksantiship</p>
      </div>

      <div className="flex items-center gap-3">
        {hasActiveSubscription ? (
          <span className="hidden rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700 sm:inline">
            Premium
          </span>
        ) : (
          <Link
            href="/abonnement"
            className="hidden rounded-full border border-aksanti-red/30 px-3 py-1 text-xs font-bold text-aksanti-red sm:inline"
          >
            Standard
          </Link>
        )}
        <button
          type="button"
          className="relative flex size-10 items-center justify-center rounded-full border border-border text-muted transition hover:border-aksanti-red/30 hover:text-aksanti-red"
          aria-label="Notifications"
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6V9c0-3.07-1.63-5.64-4.5-6.32V2h-3v.68C7.63 3.36 6 5.92 6 9v7l-2 2v1h16v-1l-2-2z" />
          </svg>
          <span className="absolute right-2 top-2 size-2 rounded-full bg-aksanti-red" />
        </button>
        <Link
          href="/profil"
          className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-aksanti-red to-ship-orange text-sm font-bold text-white"
        >
          {user?.prenom?.charAt(0).toUpperCase() ?? "?"}
        </Link>
      </div>
    </header>
  );
}
