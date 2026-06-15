"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { shouldShowSiteFooter } from "@/lib/site-footer";

export function ConditionalSiteFooter() {
  const pathname = usePathname();

  if (!shouldShowSiteFooter(pathname)) {
    return null;
  }

  return <SiteFooter />;
}
