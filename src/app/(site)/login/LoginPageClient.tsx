"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthProvider";
import { parseApiErrorMessage } from "@/lib/api-errors";

export default function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, oauthLogin, redirectAfterAuth } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("advertiser@admatch.com");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      showToast(`${user.name}님, 환영합니다!`, "success");
      const next = searchParams.get("next");
      if (next && user.role) {
        router.push(next);
      } else {
        redirectAfterAuth(user);
      }
    } catch (err) {
      setError(parseApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "kakao", token: string) {
    if (!token) {
      setError(`${provider === "google" ? "구글" : "카카오"} 로그인에 실패했습니다.`);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const user = await oauthLogin(provider, token);
      showToast("로그인되었습니다.", "success");
      redirectAfterAuth(user);
    } catch (err) {
      setError(parseApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const next = searchParams.get("next");
  const kakaoReturnPath = next
    ? `/login?next=${encodeURIComponent(next)}`
    : "/login";

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
      <p className="mt-2 text-sm text-brand-muted">
        광고주: advertiser@admatch.com · 모델: model@admatch.com · 비밀번호 demo1234
      </p>

      <div className="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <SocialLoginButtons
          disabled={loading}
          kakaoReturnPath={kakaoReturnPath}
          onGoogleToken={(t) => void handleOAuth("google", t)}
        />
        <div className="flex items-center gap-3 text-xs text-brand-muted">
          <span className="h-px flex-1 bg-brand-border" />
          또는 이메일로 로그인
          <span className="h-px flex-1 bg-brand-border" />
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand-primary py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>

      <p className="mt-4 text-center text-sm text-brand-muted">
        계정이 없으신가요?{" "}
        <Link href="/register" className="text-brand-primary hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  );
}
