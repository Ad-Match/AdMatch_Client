import type { UserRole } from "@/lib/types";

export function getHomePathForRole(role: UserRole) {
  return role === "model" ? "/campaigns" : "/models";
}
