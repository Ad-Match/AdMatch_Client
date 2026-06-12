"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/auth/AuthGate";
import { TagChipInput } from "@/components/ui/TagChipInput";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthProvider";
import { ApiError, apiFetch } from "@/lib/api";
import { parseApiErrorMessage } from "@/lib/api-errors";
import { processCampaignCoverImage } from "@/lib/image-process";
import type { Campaign } from "@/lib/types";

type Props = { campaignId: string };

export default function CampaignEditClient({ campaignId }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [form, setForm] = useState({
    category: "",
    title: "",
    pay: "",
    due: "",
    location: "",
    description: "",
    requirements: "",
    deliverables: "",
    status: "진행중" as Campaign["status"],
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const campaign = await apiFetch<Campaign>(`/campaigns/${campaignId}`);
      if (!user || campaign.advertiserId !== user.id) {
        router.replace(`/campaigns/${campaignId}`);
        return;
      }
      setForm({
        category: campaign.category,
        title: campaign.title,
        pay: campaign.pay,
        due: campaign.due,
        location: campaign.location ?? "",
        description: campaign.description ?? "",
        requirements: campaign.requirements ?? "",
        deliverables: campaign.deliverables ?? "",
        status: campaign.status,
      });
      setTags(campaign.requiredTags);
      setImageUrl(campaign.imageUrl ?? "");
      setImagePreview(campaign.imageUrl ?? "");
    } catch {
      router.replace("/campaigns");
    } finally {
      setLoading(false);
    }
  }, [campaignId, router, user]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (tags.length < 1) {
      setError("필요 태그를 1개 이상 입력해 주세요.");
      return;
    }

    setError("");
    try {
      await apiFetch<Campaign>(`/campaigns/${campaignId}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...form,
          requiredTags: tags,
          imageUrl: imageUrl || undefined,
        }),
      });
      showToast("공고가 수정되었습니다.", "success");
      router.push(`/campaigns/${campaignId}`);
    } catch (err) {
      const msg =
        err instanceof ApiError && err.status === 403
          ? "본인이 등록한 공고만 수정할 수 있습니다."
          : parseApiErrorMessage(err);
      setError(msg);
      showToast(msg, "error");
    }
  }

  if (loading) {
    return <p className="px-4 py-16 text-center text-brand-muted">불러오는 중...</p>;
  }

  return (
    <AuthGate roles={["advertiser"]}>
      <div className="mx-auto max-w-xl px-4 py-8">
        <Link
          href={`/campaigns/${campaignId}`}
          className="text-sm text-[#070707] hover:underline"
        >
          ← 공고 상세
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">공고 수정</h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <p className="mb-2 text-sm font-semibold">대표 이미지</p>
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
              <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-brand-border bg-brand-primary-light/50 text-sm text-brand-muted">
                이미지 업로드
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
                      .catch(() => setError("이미지 처리에 실패했습니다."));
                  }}
                />
              </label>
            )}
          </div>

          <select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as Campaign["status"] })
            }
            className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
          >
            <option value="진행중">진행중</option>
            <option value="마감">마감</option>
          </select>
          <input
            required
            placeholder="카테고리"
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
            placeholder="페이"
            value={form.pay}
            onChange={(e) => setForm({ ...form, pay: e.target.value })}
            className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="마감"
            value={form.due}
            onChange={(e) => setForm({ ...form, due: e.target.value })}
            className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
          />
          <input
            placeholder="촬영·근무 지역"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
          />
          <div>
            <p className="mb-2 text-sm font-semibold">필요 태그</p>
            <TagChipInput value={tags} onChange={setTags} min={1} />
          </div>
          <textarea
            placeholder="공고 소개"
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
            저장하기
          </button>
        </form>
      </div>
    </AuthGate>
  );
}
