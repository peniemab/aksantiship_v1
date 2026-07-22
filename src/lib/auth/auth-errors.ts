type AuthErrorLike = {
  message?: unknown;
  code?: unknown;
  status?: unknown;
  name?: unknown;
};

function asText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    const json = JSON.stringify(value);
    if (!json || json === "{}" || json === "[]" || json === "null") return "";
    return json;
  } catch {
    return "";
  }
}

/** Extrait un message exploitable depuis une AuthError Supabase (parfois vide / {}). */
export function extractAuthErrorParts(error: unknown): { message: string; code?: string; status?: number } {
  if (!error) return { message: "" };

  if (typeof error === "string") {
    return { message: error.trim() === "{}" ? "" : error.trim() };
  }

  const err = error as AuthErrorLike;
  let message = asText(err.message);
  if (message === "{}") message = "";

  const code = asText(err.code) || undefined;
  const statusRaw = err.status;
  const status = typeof statusRaw === "number" ? statusRaw : undefined;

  if (!message && code) message = code;
  if (!message && status) message = `HTTP ${status}`;

  return { message, code, status };
}

/** Traduit les erreurs Supabase Auth en messages FR utiles. */
export function translateAuthError(message: string, code?: string, status?: number): string {
  const raw = (message ?? "").trim();
  if (raw === "{}") {
    return translateEmptyAuthError(code, status);
  }

  const lower = raw.toLowerCase();
  const codeLower = (code ?? "").toLowerCase();

  if (
    codeLower === "user_already_exists" ||
    lower.includes("already registered") ||
    lower.includes("already been registered") ||
    lower.includes("user already exists")
  ) {
    return "Cette adresse email est déjà utilisée. Essayez de vous connecter ou de réinitialiser le mot de passe.";
  }

  if (
    codeLower === "invalid_credentials" ||
    lower.includes("invalid login credentials")
  ) {
    return "Email ou mot de passe incorrect.";
  }

  if (
    codeLower === "email_not_confirmed" ||
    lower.includes("email not confirmed")
  ) {
    return "Veuillez confirmer votre adresse email avant de vous connecter.";
  }

  // Resend free : onboarding@resend.dev n'envoie qu'à l'e-mail du compte Resend
  if (
    lower.includes("not authorized") ||
    lower.includes("you can only send") ||
    lower.includes("only send testing") ||
    lower.includes("validation emails") ||
    lower.includes("error sending") ||
    lower.includes("sending confirmation") ||
    lower.includes("confirmation email") ||
    lower.includes("smtp") ||
    (lower.includes("email address") && lower.includes("authorized")) ||
    lower.includes("resend") ||
    lower.includes("email provider") ||
    (codeLower.includes("email") && lower.includes("send"))
  ) {
    return "Échec d'envoi de l'e-mail (Resend/SMTP). Avec onboarding@resend.dev, seul l'e-mail du compte Resend peut recevoir des mails — ou vérifiez un domaine dans Resend.";
  }

  if (lower.includes("captcha") || codeLower.includes("captcha")) {
    return "Protection anti-bot Supabase active. Désactivez Captcha dans Authentication → Attack Protection pour tester.";
  }

  if (
    lower.includes("database error") ||
    lower.includes("saving new user") ||
    lower.includes("database error saving") ||
    codeLower.includes("database")
  ) {
    return "Erreur base de données à l'inscription. Lancez la migration fix_handle_new_user dans le SQL Editor Supabase.";
  }

  if (
    lower.includes("redirect") &&
    (lower.includes("not allowed") || lower.includes("whitelist") || lower.includes("url"))
  ) {
    return "URL de redirection non autorisée. Ajoutez https://aksantiship.vercel.app/** dans Supabase → URL Configuration.";
  }

  if (lower.includes("signup is disabled") || lower.includes("signups not allowed")) {
    return "Les inscriptions sont désactivées dans Supabase (Authentication → Providers → Email).";
  }

  if (
    lower.includes("password") &&
    (lower.includes("weak") ||
      lower.includes("strength") ||
      lower.includes("at least") ||
      lower.includes("characters") ||
      lower.includes("pwned") ||
      lower.includes("leaked"))
  ) {
    return "Mot de passe trop faible. Utilisez au moins 6 caractères.";
  }

  if (lower.includes("for security purposes") || lower.includes("only request this after")) {
    return "Patientez quelques secondes avant de renvoyer un e-mail.";
  }

  if (
    lower.includes("valid email") ||
    lower.includes("invalid email") ||
    lower.includes("unable to validate email")
  ) {
    return "Adresse email invalide.";
  }

  if (
    codeLower === "over_email_send_rate_limit" ||
    lower.includes("rate limit") ||
    lower.includes("too many requests") ||
    lower.includes("email rate limit")
  ) {
    return "Trop de tentatives. Réessayez dans quelques minutes.";
  }

  if (lower.includes("network") || lower.includes("fetch") || lower.includes("failed to fetch")) {
    return "Problème réseau. Vérifiez votre connexion et réessayez.";
  }

  // HTTP 500 (souvent trigger profiles ou SMTP)
  if (status === 500 || status === 520 || raw === "HTTP 500" || /\b500\b/.test(raw)) {
    return "Erreur serveur Supabase (HTTP 500). Cause fréquente : trigger profiles ou SMTP Resend. 1) Lancez le SQL fix_handle_new_user. 2) Ou désactivez Confirm email pour tester. 3) Voir Authentication → Logs.";
  }

  if (raw) {
    const prefix = [code, status ? `HTTP ${status}` : ""].filter(Boolean).join(" · ");
    return prefix
      ? `Inscription refusée (${prefix}) : ${raw}`
      : `Inscription refusée : ${raw}`;
  }

  return translateEmptyAuthError(code, status);
}

function translateEmptyAuthError(code?: string, status?: number): string {
  if (status === 429 || code === "over_email_send_rate_limit") {
    return "Trop d'e-mails envoyés. Réessayez dans quelques minutes (ou vérifiez Resend).";
  }
  if (status === 422 || status === 400) {
    return "Données d'inscription refusées (e-mail/mot de passe). Vérifiez le formulaire, ou Confirm email / SMTP dans Supabase.";
  }
  if (status === 500 || status === 520) {
    return "Erreur serveur Supabase (HTTP 500). Cause fréquente : trigger profiles ou SMTP Resend. 1) Lancez le SQL fix_handle_new_user. 2) Ou désactivez Confirm email pour tester. 3) Voir Authentication → Logs.";
  }
  if (code) {
    return `Inscription refusée (code ${code}). Vérifiez Resend SMTP + Confirm email + Logs Auth dans Supabase.`;
  }
  return "Inscription refusée par Supabase (détail vide). Causes fréquentes : e-mail Resend non livré (onboarding@resend.dev), Confirm email, ou Captcha. Ouvrez Authentication → Logs.";
}

/** Helper : AuthError → message FR. */
export function translateSupabaseAuthError(error: unknown): string {
  const { message, code, status } = extractAuthErrorParts(error);
  return translateAuthError(message, code, status);
}
