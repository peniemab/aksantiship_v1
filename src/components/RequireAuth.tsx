"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Alert } from "./ui/Form";

/** Protège une page : connexion obligatoire, optionnellement e-mail vérifié. */
export function RequireAuth({
  children,
  requireVerified = false,
}: {
  children: ReactNode;
  requireVerified?: boolean;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      const redirect = encodeURIComponent(pathname);
      router.replace(`/auth/connexion?redirect=${redirect}`);
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted">Chargement...</p>
      </div>
    );
  }

  if (!user) return null;

  if (requireVerified && !user.emailVerified) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <Alert type="warning">
          Veuillez confirmer votre compte via votre adresse email avant de continuer.{" "}
          <Link href="/auth/verifier-email" className="font-semibold underline">
            Vérifier mon email
          </Link>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
