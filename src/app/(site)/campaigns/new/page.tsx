"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/auth/AuthGate";
import { ShootDateField } from "@/components/campaign/ShootDateField";
import { TagChipInput } from "@/components/ui/TagChipInput";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthProvider";
import { apiFetch } from "@/lib/api";
import { parseApiErrorMessage } from "@/lib/api-errors";
import { processCampaignCoverImage } from "@/lib/image-process";
import type { Campaign } from "@/lib/types";

export default function CampaignCreatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [form, setForm] = useState({
    category: "SNS 광고",
    title: "",
    pay: "",
    due: "",
    location: "",
    description: "",
    requirements: "",
    deliverables: "",
  });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (tags.length < 1) {
      setError("필요 태그를 1개 이상 입력해 주세요.");
      return;
    }

    setError("");
    try {
      const campaign = await apiFetch<Campaign>("/campaigns", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          advertiserId: user.id,
          requiredTags: tags,
          imageUrl: imageUrl || undefined,
        }),
      });
      showToast("공고가 등록되었습니다!", "success");
      router.push(`/campaigns/${campaign.id}`);
    } catch (err) {
      const msg = parseApiErrorMessage(err);
      setError(msg);
      showToast(msg, "error");
    }
  }

  return (
    <AuthGate roles={["advertiser"]}>
      <div className="mx-auto max-w-xl px-4 py-8">
        <Link href="/campaigns" className="text-sm text-[#070707] hover:underline">
          ← 브랜드 공고
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">공고 올리기</h1>
        <p className="mt-1 text-sm text-brand-muted">
          상세 내용을 채울수록 AI 추천·매칭 품질이 좋아집니다.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <p className="mb-2 text-sm font-semibold">대표 이미지 (선택)</p>
            {imagePreview ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-brand-border">
                <img
                  src={imagePreview}
                  alt="공고 미리보기"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl("");
                    setImagePreview("");
                  }}
                  className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white"
                >
                  삭제
                </button>
              </div>
            ) : (
              <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-brand-border bg-brand-primary-light/50 text-sm text-brand-muted hover:bg-brand-primary-light">
                <span>클릭하여 이미지 업로드</span>
                <span className="mt-1 text-xs">4:3 비율로 자동 크롭됩니다</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    void processCampaignCoverImage(file)
                      .then((dataUrl) => {
                        setImageUrl(dataUrl);
                        setImagePreview(dataUrl);
                      })
                      .catch(() => {
                        setError("이미지 처리에 실패했습니다.");
                      });
                  }}
                />
              </label>
            )}
          </div>
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
          <ShootDateField
            required
            value={form.due}
            onChange={(due) => setForm({ ...form, due })}
          />
          <input
            placeholder="촬영·근무 지역 (선택)"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
          />
          <div>
            <p className="mb-2 text-sm font-semibold">필요 태그</p>
            <TagChipInput value={tags} onChange={setTags} min={1} />
          </div>
          <textarea
            placeholder="공고 소개 (캠페인 배경, 브랜드 설명 등)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
          />
          <textarea
            placeholder="지원 자격 · 요건"
            value={form.requirements}
            onChange={(e) => setForm({ ...form, requirements: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
          />
          <textarea
            placeholder="제출물 · 진행 내용"
            value={form.deliverables}
            onChange={(e) => setForm({ ...form, deliverables: e.target.value })}
            rows={3}
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
    </AuthGate>
  );
}
