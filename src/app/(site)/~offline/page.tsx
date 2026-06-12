import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-muted">
        오프라인
      </p>
      <h1 className="mt-3 text-2xl font-bold text-[#070707]">
        네트워크에 연결되어 있지 않습니다
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-brand-muted">
        인터넷 연결을 확인한 뒤 다시 시도해 주세요. 이전에 방문한 일부 화면은
        오프라인에서도 열릴 수 있습니다.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-[#070707] px-6 py-3 text-sm font-semibold text-white"
      >
        홈으로
      </Link>
    </div>
  );
}
