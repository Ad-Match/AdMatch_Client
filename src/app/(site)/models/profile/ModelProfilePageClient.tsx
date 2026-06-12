"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { AuthGate } from "@/components/auth/AuthGate";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { useToast } from "@/components/ui/Toast";

export default function ModelProfilePageClient() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  useEffect(() => {
    if (searchParams.get("welcome") === "1") {
      showToast("프로필을 등록하면 브랜드 공고에 지원할 수 있어요.", "info");
    }
  }, [searchParams, showToast]);

  return (
    <AuthGate roles={["model"]}>
      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
        <Link href="/campaigns" className="text-sm text-[#070707] hover:underline">
          ← 브랜드 공고
        </Link>
        <h1 className="mt-4 text-center text-2xl font-bold text-[#070707]">
          모델 프로필 등록
        </h1>
        <p className="mt-2 text-center text-sm text-brand-muted">
          기본 정보, 사진, 경력·취미까지 입력하면 상세 페이지에 PLFIL 스타일로 노출됩니다.
        </p>
        <div className="mt-8">
          <ProfileForm />
        </div>
      </div>
    </AuthGate>
  );
}
