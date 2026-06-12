"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { getKakaoRedirectUri } from "@/lib/kakao-auth";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, string>,
          ) => void;
        };
      };
    };
    Kakao?: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Auth: {
        authorize: (options: {
          redirectUri: string;
          scope?: string;
          state?: string;
        }) => void;
      };
    };
  }
}

type Props = {
  onGoogleToken: (token: string) => void;
  disabled?: boolean;
  kakaoReturnPath?: string;
};

export function SocialLoginButtons({
  onGoogleToken,
  disabled,
  kakaoReturnPath = "/",
}: Props) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const googleCallbackRef = useRef(onGoogleToken);
  const [kakaoReady, setKakaoReady] = useState(false);
  googleCallbackRef.current = onGoogleToken;

  const renderGoogleButton = useCallback(() => {
    if (!googleClientId || !googleBtnRef.current) return false;
    if (!window.google?.accounts?.id) return false;

    const el = googleBtnRef.current;
    el.innerHTML = "";

    const width = Math.floor(el.getBoundingClientRect().width);
    if (width < 50) return false;

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: (res) => googleCallbackRef.current(res.credential),
    });
    window.google.accounts.id.renderButton(el, {
      theme: "outline",
      size: "large",
      width: String(Math.min(width, 400)),
      text: "continue_with",
      shape: "pill",
    });
    return true;
  }, [googleClientId]);

  const tryInitGoogle = useCallback(() => {
    if (renderGoogleButton()) return;

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (renderGoogleButton() || attempts >= 30) {
        window.clearInterval(timer);
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, [renderGoogleButton]);

  useEffect(() => {
    const cleanup = tryInitGoogle();
    return cleanup;
  }, [tryInitGoogle]);

  useEffect(() => {
    const el = googleBtnRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      if (el.childElementCount === 0) {
        renderGoogleButton();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [renderGoogleButton]);

  const initKakao = useCallback(() => {
    if (!kakaoKey || !window.Kakao) return false;
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(kakaoKey);
    }
    setKakaoReady(true);
    return true;
  }, [kakaoKey]);

  useEffect(() => {
    if (window.Kakao?.isInitialized?.()) {
      setKakaoReady(true);
    }
  }, []);

  function handleKakaoLogin() {
    if (disabled) return;
    if (!kakaoKey) return;

    if (!window.Kakao) {
      alert("카카오 로그인을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    initKakao();
    window.Kakao.Auth.authorize({
      redirectUri: getKakaoRedirectUri(),
      scope: "account_email",
      state: kakaoReturnPath,
    });
  }

  return (
    <div className="space-y-3">
      {googleClientId && (
        <>
          <Script
            src="https://accounts.google.com/gsi/client"
            strategy="afterInteractive"
            onLoad={tryInitGoogle}
          />
          {/* 구글 iframe 클릭 영역이 아래 카카오 버튼을 가리지 않도록 높이·overflow 고정 */}
          <div className="group relative isolate z-0 h-10 max-h-10 overflow-hidden rounded-full ring-1 ring-transparent transition hover:ring-gray-300">
            <div
              ref={googleBtnRef}
              className={`h-10 max-h-10 w-full overflow-hidden transition group-hover:brightness-[0.98] [&>div]:!h-10 [&>div]:!max-h-10 [&>div]:!w-full [&>div]:!justify-center [&_iframe]:!block [&_iframe]:!h-10 [&_iframe]:!max-h-10 [&_iframe]:!min-h-0 [&_iframe]:!w-full ${disabled ? "pointer-events-none opacity-50" : ""}`}
            />
          </div>
        </>
      )}
      {kakaoKey && (
        <>
          <Script
            src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
            strategy="afterInteractive"
            onLoad={() => {
              initKakao();
            }}
          />
          <button
            type="button"
            disabled={disabled || !kakaoReady}
            onClick={handleKakaoLogin}
            className="relative z-10 flex h-10 w-full cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-full bg-[#FEE500] text-sm font-semibold text-[#191919] shadow-sm ring-1 ring-[#191919]/10 transition hover:bg-[#FADA0A] hover:shadow-md hover:ring-[#191919]/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#FEE500] disabled:hover:shadow-sm disabled:active:scale-100"
          >
            {kakaoReady ? "카카오로 계속하기" : "카카오 로딩 중..."}
          </button>
        </>
      )}
      {!googleClientId && !kakaoKey && (
        <p className="rounded-lg bg-brand-primary-light px-3 py-2 text-center text-xs text-brand-muted">
          소셜 로그인: .env.local에 NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          NEXT_PUBLIC_KAKAO_JS_KEY를 설정하세요.
        </p>
      )}
    </div>
  );
}
