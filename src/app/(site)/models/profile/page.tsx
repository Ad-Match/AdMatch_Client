import { Suspense } from "react";
import ModelProfilePageClient from "./ModelProfilePageClient";

export default function ModelProfilePage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-center text-brand-muted">로딩 중...</p>}>
      <ModelProfilePageClient />
    </Suspense>
  );
}
