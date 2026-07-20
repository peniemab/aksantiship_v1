export function translateAuthError(message: string, code?: string): string {
  const lower = message.toLowerCase();

  if (
    code === "user_already_exists" ||
    lower.includes("already registered") ||
    lower.includes("already been registered")
  ) {
    return "Cette adresse email est déjà utilisée.";
  }

  if (
    code === "invalid_credentials" ||
    lower.includes("invalid login credentials")
  ) {
    return "Email ou mot de passe incorrect.";
  }

  if (lower.includes("email not confirmed")) {
    return "Veuillez confirmer votre adresse email avant de vous connecter.";
  }

  if (lower.includes("password") && lower.includes("at least")) {
    return "Le mot de passe doit contenir au moins 6 caractères.";
  }

  if (lower.includes("valid email") || lower.includes("invalid email")) {
    return "Adresse email invalide.";
  }

  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Trop de tentatives. Réessayez dans quelques minutes.";
  }

  return "Une erreur est survenue. Réessayez.";
}
