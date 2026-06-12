"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { getHomePathForRole } from "@/lib/roles";
import type { UserRole } from "@/lib/types";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading, completeOnboarding } = useAuth();
  const [role, setRole] = useState<UserRole>("advertiser");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role) {
      router.replace(getHomePathForRole(user.role));
    }
  }, [loading, user, router]);

  if (loading || !user || user.role) {
    return (
      <p className="px-4 py-16 text-center text-sm text-brand-muted">확인 중...</p>
    );
  }

  async function handleStart() {
    setError("");
    setSubmitting(true);
    try {
      const next = await completeOnboarding(role);
      if (role === "model") {
        router.push("/models/profile?welcome=1");
      } else {
        router.push(getHomePathForRole(next.role!));
      }
    } catch {
      setError("역할 설정에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-16">
      <p className="text-center text-sm font-semibold text-brand-muted">AdMatch 온보딩</p>
      <h1 className="mt-2 text-center text-2xl font-bold text-[#070707]">
        어떤 목적으로 이용하시나요?
      </h1>
      <p className="mt-3 text-center text-sm text-brand-muted">
        브랜드 광고주와 모델·크리에이터를 연결하는 매칭 플랫폼입니다.
        <br />
        역할에 맞는 기능을 안내해 드릴게요.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setRole("advertiser")}
          className={`rounded-2xl border p-6 text-left transition ${
            role === "advertiser"
              ? "border-[#070707] bg-[#070707] text-white"
              : "border-brand-border bg-white text-[#070707] hover:border-[#070707]"
          }`}
        >
          <p className="text-lg font-bold">광고주</p>
          <p className={`mt-2 text-sm ${role === "advertiser" ? "text-neutral-300" : "text-brand-muted"}`}>
            모델을 찾고 공고를 올려 캠페인을 진행합니다.
          </p>
        </button>
        <button
          type="button"
          onClick={() => setRole("model")}
          className={`rounded-2xl border p-6 text-left transition ${
            role === "model"
              ? "border-[#070707] bg-[#070707] text-white"
              : "border-brand-border bg-white text-[#070707] hover:border-[#070707]"
          }`}
        >
          <p className="text-lg font-bold">모델 · 크리에이터</p>
          <p className={`mt-2 text-sm ${role === "model" ? "text-neutral-300" : "text-brand-muted"}`}>
            프로필을 등록하고 브랜드 공고에 지원합니다.
          </p>
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <button
        type="button"
        disabled={submitting}
        onClick={() => void handleStart()}
        className="mt-8 w-full rounded-full bg-[#070707] py-3.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {submitting ? "설정 중..." : "시작하기"}
      </button>
    </div>
  );
}
