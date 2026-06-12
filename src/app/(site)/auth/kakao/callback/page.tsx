import { Suspense } from "react";
import KakaoCallbackPage from "./KakaoCallbackClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <p className="px-4 py-16 text-center text-brand-muted">
          카카오 로그인 처리 중...
        </p>
      }
    >
      <KakaoCallbackPage />
    </Suspense>
  );
}
