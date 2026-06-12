"use client";

import Link from "next/link";
import { AuthGate } from "@/components/auth/AuthGate";
import { AccountProfileForm } from "@/components/profile/AccountProfileForm";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { useAuth } from "@/context/AuthProvider";

function ProfileEditContent() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/mypage"
        className="text-sm text-brand-muted hover:text-[#070707]"
      >
        ← 마이페이지
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-[#070707]">프로필 편집</h1>
      <p className="mt-1 text-sm text-brand-muted">
        계정 정보와 {user?.role === "model" ? "모델 프로필을" : "표시 이름을"}{" "}
        수정할 수 있습니다.
      </p>

      <section className="mt-8 overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm">
        <div className="border-b border-brand-border px-5 py-4">
          <h2 className="text-base font-bold text-[#070707]">계정 정보</h2>
          <p className="mt-0.5 text-xs text-brand-muted">
            이름 · 비밀번호 (이메일 가입 계정)
          </p>
        </div>
        <div className="p-5 sm:p-6">
          <AccountProfileForm />
        </div>
      </section>

      {user?.role === "model" && (
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#070707]">모델 프로필</h2>
            <p className="mt-0.5 text-xs text-brand-muted">
              사진, 태그, 신체 정보 등 매칭에 노출되는 정보
            </p>
          </div>
          <ProfileForm backHref="/mypage" />
        </section>
      )}
    </div>
  );
}

export default function ProfileEditPage() {
  return (
    <AuthGate>
      <ProfileEditContent />
    </AuthGate>
  );
}
