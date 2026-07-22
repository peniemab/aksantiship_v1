import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/env";

/** Client Supabase navigateur (clé publishable uniquement). */
export function createClient() {
  return createBrowserClient(supabaseUrl(), supabaseAnonKey());
}

export { isSupabaseConfigured };
