"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch, setToken } from "@/lib/api";
import { getHomePathForRole, needsOnboarding } from "@/lib/roles";
import type { AuthResponse, User, UserRole } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: {
    email: string;
    password: string;
    name: string;
  }) => Promise<User>;
  oauthLogin: (provider: "google" | "kakao", accessToken: string) => Promise<User>;
  oauthLoginKakao: (code: string, redirectUri: string) => Promise<User>;
  completeOnboarding: (role: UserRole) => Promise<User>;
  updateProfile: (input: {
    name: string;
    currentPassword?: string;
    newPassword?: string;
  }) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  redirectAfterAuth: (user: User) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const redirectAfterAuth = useCallback(
    (nextUser: User) => {
      if (needsOnboarding(nextUser)) {
        router.push("/onboarding");
        return;
      }
      if (nextUser.role === "model") {
        router.push("/campaigns");
        return;
      }
      router.push(getHomePathForRole(nextUser.role!));
    },
    [router],
  );

  const loadMe = useCallback(async () => {
    try {
      const me = await apiFetch<User | null>("/auth/me");
      setUser(me);
    } catch {
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMe();
  }, [loadMe]);

  useEffect(() => {
    if (loading || !user) return;
    if ((!user.role || user.needsOnboarding) && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [user, loading, pathname, router]);

  const applyAuth = useCallback((data: AuthResponse) => {
    setToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      return applyAuth(data);
    },
    [applyAuth],
  );

  const register = useCallback(
    async (input: { email: string; password: string; name: string }) => {
      const data = await apiFetch<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return applyAuth(data);
    },
    [applyAuth],
  );

  const oauthLogin = useCallback(
    async (provider: "google" | "kakao", accessToken: string) => {
      const data = await apiFetch<AuthResponse>("/auth/oauth", {
        method: "POST",
        body: JSON.stringify({ provider, accessToken }),
      });
      return applyAuth(data);
    },
    [applyAuth],
  );

  const oauthLoginKakao = useCallback(
    async (code: string, redirectUri: string) => {
      const data = await apiFetch<AuthResponse>("/auth/oauth", {
        method: "POST",
        body: JSON.stringify({
          provider: "kakao",
          code,
          redirectUri,
        }),
      });
      return applyAuth(data);
    },
    [applyAuth],
  );

  const completeOnboarding = useCallback(
    async (role: UserRole) => {
      const data = await apiFetch<AuthResponse>("/auth/onboarding", {
        method: "POST",
        body: JSON.stringify({ role }),
      });
      return applyAuth(data);
    },
    [applyAuth],
  );

  const updateProfile = useCallback(
    async (input: {
      name: string;
      currentPassword?: string;
      newPassword?: string;
    }) => {
      const data = await apiFetch<AuthResponse>("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify(input),
      });
      return applyAuth(data);
    },
    [applyAuth],
  );

  const refreshUser = useCallback(async () => {
    await loadMe();
  }, [loadMe]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    router.push("/");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      oauthLogin,
      oauthLoginKakao,
      completeOnboarding,
      updateProfile,
      logout,
      refreshUser,
      redirectAfterAuth,
    }),
    [
      user,
      loading,
      login,
      register,
      oauthLogin,
      oauthLoginKakao,
      completeOnboarding,
      updateProfile,
      logout,
      refreshUser,
      redirectAfterAuth,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
