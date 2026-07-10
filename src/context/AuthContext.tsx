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
import type {
  AccompanimentRequest,
  CandidateProfile,
  Subscription,
  UserAccount,
} from "@/lib/types";

const STORAGE_KEY = "aksantiship_session";

interface SessionData {
  user: UserAccount;
  profile: CandidateProfile | null;
  subscription: Subscription | null;
  accompaniments: AccompanimentRequest[];
  pendingProfile: CandidateProfile | null;
}

interface AuthContextValue {
  user: UserAccount | null;
  profile: CandidateProfile | null;
  subscription: Subscription | null;
  accompaniments: AccompanimentRequest[];
  pendingProfile: CandidateProfile | null;
  isLoading: boolean;
  register: (data: Omit<UserAccount, "id" | "emailVerified" | "createdAt">) => string | null;
  login: (email: string, password: string) => string | null;
  logout: () => void;
  verifyEmail: () => void;
  resetPasswordRequest: (email: string) => boolean;
  savePendingProfile: (profile: CandidateProfile) => void;
  confirmProfileAfterPayment: () => void;
  activateSubscription: () => void;
  addAccompaniment: (request: Omit<AccompanimentRequest, "id" | "paid" | "createdAt">) => string;
  confirmAccompanimentPayment: (id: string) => void;
  hasActiveSubscription: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadSession(): SessionData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

function saveSession(data: SessionData | null) {
  if (typeof window === "undefined") return;
  if (data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function loadAllUsers(): UserAccount[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("aksantiship_users");
  if (!raw) return [];
  try {
    return JSON.parse(raw) as UserAccount[];
  } catch {
    return [];
  }
}

function saveAllUsers(users: UserAccount[]) {
  localStorage.setItem("aksantiship_users", JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSession(loadSession());
    setIsLoading(false);
  }, []);

  const persist = useCallback((data: SessionData | null) => {
    setSession(data);
    saveSession(data);
  }, []);

  const register = useCallback(
    (data: Omit<UserAccount, "id" | "emailVerified" | "createdAt">): string | null => {
      const users = loadAllUsers();
      if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
        return "Cette adresse email est déjà utilisée.";
      }
      const user: UserAccount = {
        ...data,
        id: crypto.randomUUID(),
        emailVerified: false,
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      saveAllUsers(users);
      persist({
        user,
        profile: null,
        subscription: null,
        accompaniments: [],
        pendingProfile: null,
      });
      return null;
    },
    [persist],
  );

  const login = useCallback(
    (email: string, password: string): string | null => {
      const users = loadAllUsers();
      const user = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
      );
      if (!user) return "Email ou mot de passe incorrect.";
      const existing = loadSession();
      persist({
        user,
        profile: existing?.user.id === user.id ? existing.profile : null,
        subscription: existing?.user.id === user.id ? existing.subscription : null,
        accompaniments: existing?.user.id === user.id ? existing.accompaniments : [],
        pendingProfile: existing?.user.id === user.id ? existing.pendingProfile : null,
      });
      return null;
    },
    [persist],
  );

  const logout = useCallback(() => persist(null), [persist]);

  const verifyEmail = useCallback(() => {
    if (!session) return;
    const users = loadAllUsers();
    const idx = users.findIndex((u) => u.id === session.user.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], emailVerified: true };
      saveAllUsers(users);
    }
    persist({ ...session, user: { ...session.user, emailVerified: true } });
  }, [session, persist]);

  const resetPasswordRequest = useCallback((email: string): boolean => {
    const users = loadAllUsers();
    return users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  }, []);

  const savePendingProfile = useCallback(
    (profile: CandidateProfile) => {
      if (!session) return;
      persist({ ...session, pendingProfile: profile });
    },
    [session, persist],
  );

  const activateSubscription = useCallback(() => {
    if (!session) return;
    const now = new Date();
    const expires = new Date(now);
    expires.setFullYear(expires.getFullYear() + 1);
    const subscription: Subscription = {
      active: true,
      startedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    };
    persist({ ...session, subscription });
  }, [session, persist]);

  const confirmProfileAfterPayment = useCallback(() => {
    if (!session?.pendingProfile) return;
    const now = new Date().toISOString();
    const profile: CandidateProfile = {
      ...session.pendingProfile,
      createdAt: session.profile?.createdAt ?? now,
      updatedAt: now,
    };
    persist({
      ...session,
      profile,
      pendingProfile: null,
    });
  }, [session, persist]);

  const addAccompaniment = useCallback(
    (request: Omit<AccompanimentRequest, "id" | "paid" | "createdAt">): string => {
      if (!session) return "";
      const id = crypto.randomUUID();
      const entry: AccompanimentRequest = {
        ...request,
        id,
        paid: false,
        createdAt: new Date().toISOString(),
      };
      persist({
        ...session,
        accompaniments: [...session.accompaniments, entry],
      });
      return id;
    },
    [session, persist],
  );

  const confirmAccompanimentPayment = useCallback(
    (id: string) => {
      if (!session) return;
      persist({
        ...session,
        accompaniments: session.accompaniments.map((a) =>
          a.id === id ? { ...a, paid: true } : a,
        ),
      });
    },
    [session, persist],
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
