import { Suspense } from "react";
import LoginPageClient from "./LoginPageClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-center text-brand-muted">로딩 중...</p>}>
      <LoginPageClient />
    </Suspense>
  );
}
