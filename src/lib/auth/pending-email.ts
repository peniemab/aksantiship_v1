/** E-mail en attente de confirmation (pas encore de session Supabase). */
export const PENDING_EMAIL_KEY = "aksantiship_pending_email";

export function savePendingEmail(email: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_EMAIL_KEY, email.trim().toLowerCase());
}

export function loadPendingEmail(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(PENDING_EMAIL_KEY);
}

export function clearPendingEmail() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_EMAIL_KEY);
}
