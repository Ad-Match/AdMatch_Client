"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { apiFetch } from "@/lib/api";
import type { Campaign } from "@/lib/types";

export default function CampaignCreatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    category: "SNS 광고",
    title: "",
    pay: "",
    due: "",
    requiredTags: "",
  });

  if (user && user.role !== "advertiser") {
    return (
      <p className="px-4 py-16 text-center text-red-600">
        광고주 계정으로만 공고를 등록할 수 있습니다.
      </p>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }

    setError("");
    try {
      const campaign = await apiFetch<Campaign>("/campaigns", {
        method: "POST",
        body: JSON.stringify({
          category: form.category,
          title: form.title,
          pay: form.pay,
          due: form.due,
          advertiserId: user.id,
          requiredTags: form.requiredTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      router.push(`/campaigns/${campaign.id}`);
    } catch {
      setError("공고 등록에 실패했습니다. 로그인 상태를 확인해 주세요.");
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <Link href="/campaigns" className="text-sm text-brand-primary hover:underline">
        ← 브랜드 공고
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">공고 올리기</h1>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <input
          required
          placeholder="카테고리 (예: SNS 광고)"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="공고 제목"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="페이 (예: 20만원 ~ 50만원)"
          value={form.pay}
          onChange={(e) => setForm({ ...form, pay: e.target.value })}
          className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="마감 (예: D-7 / 2026-06-10 마감)"
          value={form.due}
          onChange={(e) => setForm({ ...form, due: e.target.value })}
          className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="필요 태그 (쉼표 구분: SNS,뷰티,숏폼)"
          value={form.requiredTags}
          onChange={(e) => setForm({ ...form, requiredTags: e.target.value })}
          className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-full bg-brand-primary py-3 text-sm font-semibold text-white"
        >
          공고 등록
        </button>
      </form>
    </div>
  );
}
