/** Traduit les erreurs Supabase Auth en messages FR utiles. */
export function translateAuthError(message: string, code?: string): string {
  const lower = message.toLowerCase();
  const codeLower = (code ?? "").toLowerCase();

  if (
    codeLower === "user_already_exists" ||
    lower.includes("already registered") ||
    lower.includes("already been registered") ||
    lower.includes("user already exists")
  ) {
    return "Cette adresse email est déjà utilisée.";
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

  // Resend / SMTP — cause fréquente en prod avec onboarding@resend.dev
  if (
    lower.includes("error sending") ||
    lower.includes("sending confirmation") ||
    lower.includes("confirmation email") ||
    lower.includes("smtp") ||
    lower.includes("resend") ||
    lower.includes("email provider")
  ) {
    return "Impossible d'envoyer l'e-mail de confirmation. Vérifiez la configuration SMTP Resend dans Supabase (expéditeur et destinataire autorisés).";
  }

  if (
    lower.includes("database error") ||
    lower.includes("saving new user") ||
    lower.includes("database error saving")
  ) {
    return "Erreur base de données à l'inscription (profil). Vérifiez le trigger profiles dans Supabase.";
  }

  if (
    lower.includes("redirect") &&
    (lower.includes("not allowed") || lower.includes("whitelist") || lower.includes("url"))
  ) {
    return "URL de redirection non autorisée. Ajoutez votre domaine dans Supabase → Authentication → URL Configuration.";
  }

  if (lower.includes("signup is disabled") || lower.includes("signups not allowed")) {
    return "Les inscriptions sont désactivées dans Supabase.";
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
    return "Mot de passe trop faible. Utilisez au moins 6 caractères (idéalement plus longs).";
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

  // Dernier recours : message clair + extrait court (pour diagnostic)
  const short = message.trim().slice(0, 120);
  return short
    ? `Inscription impossible : ${short}`
    : "Une erreur est survenue. Réessayez.";
}
