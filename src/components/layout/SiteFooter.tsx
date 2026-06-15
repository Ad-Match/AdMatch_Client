"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();

  function handleServiceIntro(e: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <footer className="mt-auto border-t border-brand-border bg-[#FAF6F9] py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span className="text-lg font-bold text-brand-primary">AdMatch</span>
          <Link
            href="/"
            onClick={handleServiceIntro}
            className="hover:text-brand-primary"
          >
            서비스 소개
          </Link>
        </div>
        <p className="text-xs text-brand-muted">© AdMatch, Inc.</p>
      </div>
    </footer>
  );
}
