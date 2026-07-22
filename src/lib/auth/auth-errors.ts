/** Traduit les erreurs Supabase Auth en messages FR utiles. */
export function translateAuthError(message: string, code?: string): string {
  const raw = message.trim();
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
    lower.includes("email provider")
  ) {
    return "Échec d'envoi de l'e-mail (Resend/SMTP). Avec onboarding@resend.dev, seul l'e-mail du compte Resend peut recevoir des mails — ou vérifiez un domaine dans Resend.";
  }

  if (
    lower.includes("captcha") ||
    codeLower.includes("captcha")
  ) {
    return "Protection anti-bot Supabase active. Désactivez Captcha dans Authentication → Attack Protection pour tester, ou branchez un captcha.";
  }

  if (
    lower.includes("database error") ||
    lower.includes("saving new user") ||
    lower.includes("database error saving")
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

  if (lower.includes("valid email") || lower.includes("invalid email") || lower.includes("unable to validate email")) {
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

  // Toujours montrer le détail Supabase (sinon on ne peut pas diagnostiquer)
  if (raw) {
    const detail = code ? `[${code}] ${raw}` : raw;
    return `Inscription refusée par Supabase : ${detail}`;
  }

  return "Inscription refusée. Ouvrez la console navigateur (F12) et regardez l'erreur [auth/signUp].";
}
