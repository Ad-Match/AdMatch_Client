export default function OfflinePage() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-[#FAF6F9] px-6 text-center">
      <p className="text-4xl font-bold font-display tracking-tighter">AM</p>
      <h1 className="text-xl font-bold text-zinc-900">오프라인 상태입니다</h1>
      <p className="text-sm text-zinc-500 max-w-xs">
        인터넷 연결을 확인한 뒤 다시 시도해 주세요.
      </p>
    </main>
  );
}
