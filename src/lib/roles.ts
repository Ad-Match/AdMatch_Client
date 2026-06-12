import type { UserRole } from "@/lib/types";

export function getHomePathForRole(role: UserRole) {
  return role === "model" ? "/campaigns" : "/models";
}

export function needsOnboarding(user: { role: UserRole | null; needsOnboarding?: boolean }) {
  return user.needsOnboarding ?? !user.role;
}
