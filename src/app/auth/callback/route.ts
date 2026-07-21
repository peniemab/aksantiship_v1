import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseAnonKey, supabaseUrl } from "@/lib/env";
import { safeRedirect } from "@/lib/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = safeRedirect(url.searchParams.get("next") ?? "/tableau-de-bord");

  const redirectWithError = (errorCode: string) => {
    const redirectUrl = new URL("/auth/verifier-email", url.origin);
    redirectUrl.searchParams.set("error", errorCode);
    return NextResponse.redirect(redirectUrl);
  };

  if (!code && !(tokenHash && type)) {
    return redirectWithError("auth_callback_missing_code");
  }

  const response = NextResponse.redirect(new URL(next, url.origin));

  const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("auth callback exchangeCodeForSession:", error.message);
      return redirectWithError("auth_callback_exchange_failed");
    }
    return response;
  }

  const { error } = await supabase.auth.verifyOtp({
    type: type!,
    token_hash: tokenHash!,
  });

  if (error) {
    console.error("auth callback verifyOtp:", error.message);
    return redirectWithError("auth_callback_exchange_failed");
  }

  return response;
}
