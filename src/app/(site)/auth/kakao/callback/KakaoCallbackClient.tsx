"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthProvider";
import { parseApiErrorMessage } from "@/lib/api-errors";
import { getKakaoRedirectUri } from "@/lib/kakao-auth";

export default function KakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { oauthLoginKakao, redirectAfterAuth } = useAuth();
  const { showToast } = useToast();
  const [error, setError] = useState("");
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const oauthError = searchParams.get("error");
    if (oauthError) {
      setError("카카오 로그인이 취소되었거나 실패했습니다.");
      return;
    }

    const code = searchParams.get("code");
    if (!code) {
      setError("카카오 인증 코드를 받지 못했습니다.");
      return;
    }

    const returnPath = searchParams.get("state") ?? "/";

    void (async () => {
      try {
        const user = await oauthLoginKakao(code, getKakaoRedirectUri());
        showToast("로그인되었습니다.", "success");

        if (returnPath.startsWith("/login") || returnPath.startsWith("/register")) {
          const url = new URL(returnPath, window.location.origin);
          const next = url.searchParams.get("next");
          if (next && user.role) {
            router.replace(next);
            return;
          }
        }

        redirectAfterAuth(user);
      } catch (err) {
        setError(parseApiErrorMessage(err));
      }
    })();
  }, [
    oauthLoginKakao,
    redirectAfterAuth,
    router,
    searchParams,
    showToast,
  ]);

  if (error) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <Link
          href="/login"
          className="mt-4 text-sm text-brand-primary hover:underline"
        >
          로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 py-16">
      <p className="text-sm text-brand-muted">카카오 로그인 처리 중...</p>
    </div>
  );
}
