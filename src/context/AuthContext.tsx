"use client";

/**
 * Auth Aksantiship : session Supabase + données métier (profil, abo) en BDD.
 * Les MDP ne sont jamais stockés ici — hash géré par Supabase Auth.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { authCallbackUrl } from "@/lib/auth/auth-redirect-url";
import { translateSupabaseAuthError } from "@/lib/auth/auth-errors";
import { mapSupabaseUser } from "@/lib/auth/map-supabase-user";
import {
  ensureProfile,
  fetchUserData,
  insertAccompaniment,
  markAccompanimentPaid,
  saveCandidateProfile,
  savePendingProfile as dbSavePendingProfile,
  saveSubscription,
  type UserData,
} from "@/lib/auth/user-data-repository";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type {
  AccompanimentRequest,
  CandidateProfile,
  Subscription,
  UserAccount,
} from "@/lib/types";

interface SessionData extends UserData {
  user: UserAccount;
}

interface AuthContextValue {
  user: UserAccount | null;
  profile: CandidateProfile | null;
  subscription: Subscription | null;
  accompaniments: AccompanimentRequest[];
  pendingProfile: CandidateProfile | null;
  isLoading: boolean;
  register: (
    data: Omit<UserAccount, "id" | "emailVerified" | "createdAt">,
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  /** Rafraîchit la session et renvoie true si l'e-mail est confirmé côté Supabase. */
  refreshEmailVerification: () => Promise<boolean>;
  /** Renvoie l'e-mail de confirmation Supabase. null = ok, string = erreur. */
  resendVerificationEmail: () => Promise<string | null>;
  resetPasswordRequest: (email: string) => boolean;
  savePendingProfile: (profile: CandidateProfile) => Promise<void>;
  confirmProfileAfterPayment: () => Promise<void>;
  activateSubscription: () => Promise<void>;
  addAccompaniment: (
    request: Omit<AccompanimentRequest, "id" | "paid" | "createdAt">,
  ) => Promise<string>;
  confirmAccompanimentPayment: (id: string) => Promise<void>;
  hasActiveSubscription: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const EMPTY_USER_DATA: UserData = {
  profile: null,
  subscription: null,
  accompaniments: [],
  pendingProfile: null,
};

/** Ancien stockage local — nettoyage à la déconnexion. */
function clearLegacyStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("aksantiship_session");
  localStorage.removeItem("aksantiship_users");
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key?.startsWith("aksantiship_user_")) {
      localStorage.removeItem(key);
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const syncFromSupabaseUser = useCallback(async (authUser: SupabaseUser | null) => {
    if (!authUser) {
      setSession(null);
      return;
    }

    const { clearPendingEmail } = await import("@/lib/auth/pending-email");
    clearPendingEmail();

    const supabase = createClient();
    const user = mapSupabaseUser(authUser);

    try {
      // Identité auth + profil/abonnement depuis PostgreSQL
      await ensureProfile(supabase, user);
      const data = await fetchUserData(supabase, user.id);
      setSession({ user, ...data });
    } catch (err) {
      console.error("Chargement des données utilisateur:", err);
      setSession({ user, ...EMPTY_USER_DATA });
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    let cancelled = false;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;

      if (data.session?.user) {
        await syncFromSupabaseUser(data.session.user);
      } else {
        // Pas de session (souvent après signup en attente de confirmation) :
        // on ne force pas un wipe si un pending user est déjà en mémoire.
        const { loadPendingEmail } = await import("@/lib/auth/pending-email");
        const pending = loadPendingEmail();
        if (pending) {
          setSession((prev) =>
            prev ?? {
              user: {
                id: "",
                email: pending,
                nom: "",
                postNom: "",
                prenom: "",
                telephone: "",
                password: "",
                emailVerified: false,
                createdAt: new Date().toISOString(),
              },
              ...EMPTY_USER_DATA,
            },
          );
        } else {
          setSession(null);
        }
      }
      if (!cancelled) setIsLoading(false);
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, authSession) => {
      if (cancelled) return;

      // Évite d'effacer l'écran "confirmez votre e-mail" juste après signup.
      if (!authSession?.user && (event === "INITIAL_SESSION" || event === "SIGNED_IN")) {
        return;
      }

      if (!authSession?.user && event === "SIGNED_OUT") {
        setSession(null);
        setIsLoading(false);
        return;
      }

      void syncFromSupabaseUser(authSession?.user ?? null).finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [syncFromSupabaseUser]);

  const register = useCallback(
    async (
      data: Omit<UserAccount, "id" | "emailVerified" | "createdAt">,
    ): Promise<{ error: string | null; needsConfirmation: boolean }> => {
      if (!isSupabaseConfigured()) {
        return {
          error:
            "Configuration Supabase manquante. Vérifiez .env.local (local) ou les variables Vercel (prod), puis relancez le serveur.",
          needsConfirmation: false,
        };
      }

      try {
        const supabase = createClient();
        const { data: signUpData, error } = await supabase.auth.signUp({
          email: data.email.trim(),
          password: data.password,
          options: {
            data: {
              nom: data.nom,
              post_nom: data.postNom,
              prenom: data.prenom,
              telephone: data.telephone,
            },
            emailRedirectTo: authCallbackUrl("/tableau-de-bord"),
          },
        });

        if (error) {
          console.error("[auth/signUp]", {
            code: error.code,
            message: error.message,
            status: error.status,
            error,
          });
          return { error: translateSupabaseAuthError(error), needsConfirmation: false };
        }

        // Compte déjà existant (Supabase renvoie parfois un user sans identities)
        if (signUpData.user && (signUpData.user.identities?.length ?? 0) === 0) {
          return {
            error: "Cette adresse email est déjà utilisée. Essayez de vous connecter.",
            needsConfirmation: false,
          };
        }

        if (!signUpData.user) {
          console.error("[auth/signUp] pas d'erreur mais user null", signUpData);
          return {
            error:
              "Supabase n'a pas créé l'utilisateur (réponse vide). Vérifiez Authentication → Users et Logs Auth.",
            needsConfirmation: false,
          };
        }

        // Session immédiate = Confirm email OFF (connecté direct).
        if (signUpData.session) {
          try {
            await syncFromSupabaseUser(signUpData.user);
          } catch (syncErr) {
            console.error("[auth/signUp] sync profil:", syncErr);
          }
          return { error: null, needsConfirmation: false };
        }

        // Pas de session = Confirm email ON (attente du lien e-mail).
        const { savePendingEmail } = await import("@/lib/auth/pending-email");
        savePendingEmail(data.email);
        setSession({
          user: mapSupabaseUser(signUpData.user),
          ...EMPTY_USER_DATA,
        });
        return { error: null, needsConfirmation: true };
      } catch (err) {
        console.error("[auth/signUp] exception:", err);
        return { error: translateSupabaseAuthError(err), needsConfirmation: false };
      }
    },
    [syncFromSupabaseUser],
  );

  const login = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      if (!isSupabaseConfigured()) {
        return "Configuration Supabase manquante. Vérifiez .env.local (local) ou les variables Vercel (prod), puis relancez le serveur.";
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return translateSupabaseAuthError(error);
      }

      await new Promise((resolve) => setTimeout(resolve, 150));

      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await syncFromSupabaseUser(data.user);
      }

      return null;
    },
    [syncFromSupabaseUser],
  );

  const logout = useCallback(async () => {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    setSession(null);
    clearLegacyStorage();
  }, []);

  const refreshEmailVerification = useCallback(async (): Promise<boolean> => {
    if (!isSupabaseConfigured()) return false;

    const supabase = createClient();
    await supabase.auth.refreshSession();
    const { data } = await supabase.auth.getUser();

    if (!data.user) return false;

    await syncFromSupabaseUser(data.user);
    return Boolean(data.user.email_confirmed_at);
  }, [syncFromSupabaseUser]);

  const resendVerificationEmail = useCallback(async (): Promise<string | null> => {
    const { loadPendingEmail } = await import("@/lib/auth/pending-email");
    const email = session?.user.email || loadPendingEmail();
    if (!email) {
      return "Aucun compte en attente de confirmation.";
    }
    if (!isSupabaseConfigured()) {
      return "Configuration Supabase manquante. Vérifiez .env.local (local) ou les variables Vercel (prod), puis relancez le serveur.";
    }

    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: authCallbackUrl("/tableau-de-bord"),
      },
    });

    if (error) {
      return translateSupabaseAuthError(error);
    }
    return null;
  }, [session]);

  const resetPasswordRequest = useCallback((_email: string): boolean => {
    return true;
  }, []);

  const savePendingProfile = useCallback(
    async (profile: CandidateProfile) => {
      if (!session) return;
      const supabase = createClient();
      await dbSavePendingProfile(supabase, session.user.id, profile);
      setSession({ ...session, pendingProfile: profile });
    },
    [session],
  );

  const activateSubscription = useCallback(async () => {
    if (!session) return;
    const now = new Date();
    const expires = new Date(now);
    expires.setFullYear(expires.getFullYear() + 1);
    const subscription: Subscription = {
      active: true,
      startedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    };
    const supabase = createClient();
    await saveSubscription(supabase, session.user.id, subscription);
    setSession({ ...session, subscription });
  }, [session]);

  const confirmProfileAfterPayment = useCallback(async () => {
    if (!session?.pendingProfile) return;
    const now = new Date().toISOString();
    const profile: CandidateProfile = {
      ...session.pendingProfile,
      createdAt: session.profile?.createdAt ?? now,
      updatedAt: now,
    };
    const supabase = createClient();
    await saveCandidateProfile(supabase, session.user.id, profile);
    setSession({
      ...session,
      profile,
      pendingProfile: null,
    });
  }, [session]);

  const addAccompaniment = useCallback(
    async (
      request: Omit<AccompanimentRequest, "id" | "paid" | "createdAt">,
    ): Promise<string> => {
      if (!session) return "";
      const supabase = createClient();
      const entry = await insertAccompaniment(supabase, session.user.id, request);
      setSession({
        ...session,
        accompaniments: [entry, ...session.accompaniments],
      });
      return entry.id;
    },
    [session],
  );

  const confirmAccompanimentPayment = useCallback(
    async (id: string) => {
      if (!session) return;
      const supabase = createClient();
      await markAccompanimentPaid(supabase, session.user.id, id);
      setSession({
        ...session,
        accompaniments: session.accompaniments.map((a) =>
          a.id === id ? { ...a, paid: true } : a,
        ),
      });
    },
    [session],
  );

  const hasActiveSubscription = useMemo(() => {
    if (!session?.subscription?.active) return false;
    return new Date(session.subscription.expiresAt) > new Date();
  }, [session?.subscription]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      profile: session?.profile ?? null,
      subscription: session?.subscription ?? null,
      accompaniments: session?.accompaniments ?? [],
      pendingProfile: session?.pendingProfile ?? null,
      isLoading,
      register,
      login,
      logout,
      refreshEmailVerification,
      resendVerificationEmail,
      resetPasswordRequest,
      savePendingProfile,
      confirmProfileAfterPayment,
      activateSubscription,
      addAccompaniment,
      confirmAccompanimentPayment,
      hasActiveSubscription,
    }),
    [
      session,
      isLoading,
      register,
      login,
      logout,
      refreshEmailVerification,
      resendVerificationEmail,
      resetPasswordRequest,
      savePendingProfile,
      confirmProfileAfterPayment,
      activateSubscription,
      addAccompaniment,
      confirmAccompanimentPayment,
      hasActiveSubscription,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
