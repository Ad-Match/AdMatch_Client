import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-brand-border bg-[#FAF6F9] py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span className="text-lg font-bold text-brand-primary">AdMatch</span>
          <Link href="#" className="hover:text-brand-primary">
            공지사항
          </Link>
          <Link href="/" className="hover:text-brand-primary">
            서비스 소개
          </Link>
        </div>
        <p className="text-xs text-brand-muted">© AdMatch, Inc.</p>
      </div>
    </footer>
  );
}
