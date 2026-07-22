/** Variables Supabase & app (`.env.local` à la racine). */

function trimEnv(value: string | undefined): string {
  return value?.trim() ?? "";
}

export function supabaseUrl(): string {
  return (
    trimEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) ||
    trimEnv(process.env.SUPABASE_URL)
  );
}

export function supabaseAnonKey(): string {
  return (
    trimEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    trimEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    trimEnv(process.env.SUPABASE_ANON_KEY)
  );
}

export function supabaseServiceRoleKey(): string {
  // Serveur uniquement — ne jamais exposer au client
  return trimEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function appBaseUrl(): string {
  return (
    trimEnv(process.env.APP_BASE_URL) ||
    trimEnv(process.env.NEXT_PUBLIC_APP_BASE_URL) ||
    "http://localhost:3000"
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl() && supabaseAnonKey());
}

export function isAdminApiConfigured(): boolean {
  return Boolean(supabaseUrl() && supabaseServiceRoleKey());
}

