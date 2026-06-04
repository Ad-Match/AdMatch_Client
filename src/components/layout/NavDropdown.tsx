"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type MenuItem = {
  href: string;
  label: string;
};

type NavDropdownProps = {
  label: string;
  href: string;
  items: MenuItem[];
};

export function NavDropdown({ label, href, items }: NavDropdownProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive =
    pathname === href || items.some((item) => pathname.startsWith(item.href));

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={href}
        className={`text-sm font-semibold transition ${
          isActive ? "text-brand-primary" : "text-gray-900 hover:text-brand-primary"
        }`}
      >
        {label}
      </Link>

      {open && (
        <div className="absolute left-1/2 top-full z-50 min-w-44 -translate-x-1/2 pt-3">
          <div className="overflow-hidden rounded-2xl border border-brand-border bg-white py-3 shadow-lg">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block whitespace-nowrap px-6 py-2.5 text-sm font-semibold transition hover:bg-brand-primary-light ${
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "text-brand-primary"
                    : "text-gray-900"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
