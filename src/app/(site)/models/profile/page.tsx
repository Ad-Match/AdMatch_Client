"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";import { useEffect } from "react";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { useAuth } from "@/context/AuthProvider";

export default function ModelProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (!loading && user && user.role !== "model") {
      router.push("/models");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <p className="px-4 py-16 text-center text-brand-muted">로딩 중...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/models" className="text-sm text-[#070707] hover:underline">
        ← 모델 DB 검색
      </Link>
      <h1 className="mt-4 text-center text-2xl font-bold text-[#070707]">프로필 관리</h1>
      <p className="mt-2 text-center text-sm text-brand-muted">
        기본 정보 입력 후 대표 사진을 등록하면 검색에 노출됩니다.
      </p>
      <div className="mt-8">
        <ProfileForm />
      </div>
    </div>
  );
}
