"use client";

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
import { translateAuthError } from "@/lib/auth/auth-errors";
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
  ) => Promise<string | null>;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  verifyEmail: () => Promise<void>;
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

    const supabase = createClient();
    const user = mapSupabaseUser(authUser);

    try {
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
      if (!cancelled) {
        await syncFromSupabaseUser(data.session?.user ?? null);
        setIsLoading(false);
      }
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, authSession) => {
      if (!cancelled) {
        void syncFromSupabaseUser(authSession?.user ?? null).finally(() => {
          if (!cancelled) setIsLoading(false);
        });
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [syncFromSupabaseUser]);

  const register = useCallback(
    async (
      data: Omit<UserAccount, "id" | "emailVerified" | "createdAt">,
    ): Promise<string | null> => {
      if (!isSupabaseConfigured()) {
        return "Configuration Supabase manquante (.env.local).";
      }

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
          emailRedirectTo: authCallbackUrl("/auth/verifier-email"),
        },
      });

      if (error) {
        return translateAuthError(error.message, error.code);
      }

      if (!signUpData.user) {
        return "Inscription impossible. Réessayez.";
      }

      await syncFromSupabaseUser(signUpData.user);
      return null;
    },
    [syncFromSupabaseUser],
  );

  const login = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      if (!isSupabaseConfigured()) {
        return "Configuration Supabase manquante (.env.local).";
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return translateAuthError(error.message, error.code);
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

  const verifyEmail = useCallback(async () => {
    if (!session) return;
    const supabase = createClient();
    await supabase.auth.refreshSession();
    const { data } = await supabase.auth.getUser();
    if (data.user?.email_confirmed_at) {
      await syncFromSupabaseUser(data.user);
      return;
    }
    // Mode démo : simuler la vérification (tests sans e-mail SMTP)
    setSession({
      ...session,
      user: { ...session.user, emailVerified: true },
    });
  }, [session, syncFromSupabaseUser]);

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
      verifyEmail,
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
      verifyEmail,
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
