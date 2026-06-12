"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";

type Props = {
  children: React.ReactNode;
  roles?: Array<"advertiser" | "model">;
};

export function AuthGate({ children, roles }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login?next=" + encodeURIComponent(window.location.pathname));
      return;
    }
    if (user.needsOnboarding || !user.role) {
      router.replace("/onboarding");
      return;
    }
    if (roles && user.role && !roles.includes(user.role)) {
      router.replace(user.role === "model" ? "/campaigns" : "/models");
    }
  }, [user, loading, router, roles]);

  if (loading || !user || !user.role) {
    return (
      <p className="px-4 py-16 text-center text-sm text-brand-muted">
        확인 중...
      </p>
    );
  }

  if (roles && !roles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
