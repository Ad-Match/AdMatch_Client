"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { useAuth } from "@/context/AuthProvider";

export default function MyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <p className="px-4 py-16 text-center text-brand-muted">로딩 중...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">마이페이지</h1>
      <p className="mt-1 text-sm text-brand-muted">
        {user.name} · {user.role === "advertiser" ? "광고주" : "모델"} · {user.email}
      </p>

      {user.role === "model" ? (
        <div className="mt-8">
          <ProfileForm />
        </div>
      ) : (
        <div className="mt-8 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-brand-muted">
            광고주 계정입니다. 모델 검색 및 공고 관리를 이용해 주세요.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/models"
              className="rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-white"
            >
              모델 DB 검색
            </Link>
            <Link
              href="/campaigns/new"
              className="rounded-full border border-brand-primary px-5 py-2 text-sm font-semibold text-brand-primary"
            >
              공고 올리기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
