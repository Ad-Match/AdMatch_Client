"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthProvider";
import { parseApiErrorMessage } from "@/lib/api-errors";

export default function RegisterPage() {
  const { register, oauthLogin, redirectAfterAuth } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    setLoading(true);
    try {
      const user = await register(form);
      showToast("가입이 완료되었습니다. 역할을 선택해 주세요.", "success");
      redirectAfterAuth(user);
    } catch (err) {
      setError(parseApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "kakao", token: string) {
    if (!token) return;
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

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
      <p className="mt-2 text-sm text-brand-muted">
        가입 후 온보딩에서 광고주·모델 역할을 선택합니다.
      </p>

      <div className="mt-8 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <SocialLoginButtons
          disabled={loading}
          kakaoReturnPath="/register"
          onGoogleToken={(t) => void handleOAuth("google", t)}
        />
        <div className="flex items-center gap-3 text-xs text-brand-muted">
          <span className="h-px flex-1 bg-brand-border" />
          또는 이메일로 가입
          <span className="h-px flex-1 bg-brand-border" />
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            required
            minLength={2}
            placeholder="이름"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
          />
          <input
            required
            type="email"
            placeholder="이메일"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
          />
          <input
            required
            type="password"
            minLength={8}
            placeholder="비밀번호 (8자 이상)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand-primary py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>
      </div>

      <p className="mt-4 text-center text-sm text-brand-muted">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-brand-primary hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
