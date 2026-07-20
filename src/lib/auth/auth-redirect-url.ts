import { appBaseUrl } from "@/lib/env";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

/**
 * URL publique de l'app.
 * - Navigateur : origine courante (localhost, aksantiship.vercel.app, previews…)
 * - Serveur (e-mails, callbacks) : APP_BASE_URL / NEXT_PUBLIC_APP_BASE_URL
 */
export function publicAppBaseUrl(): string {
  if (typeof window !== "undefined") {
    return stripTrailingSlash(window.location.origin);
  }
  return stripTrailingSlash(appBaseUrl());
}

/** Lien de retour après e-mail Supabase (reset MDP, confirmation, etc.). */
export function authCallbackUrl(nextPath: string): string {
  const next = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  const params = new URLSearchParams({ next });
  return `${publicAppBaseUrl()}/auth/callback?${params.toString()}`;
}

/** Page de saisie du nouveau mot de passe (phase reset — à créer). */
export const AUTH_RESET_PASSWORD_CALLBACK = "/auth/reinitialiser-mot-de-passe";
