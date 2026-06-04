"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { apiFetch } from "@/lib/api";
import type { Campaign, Matching, ModelProfile } from "@/lib/types";

type Props = { modelId: string };

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-4 border-b border-brand-border py-3 text-sm last:border-0">
      <dt className="font-semibold text-[#070707]">{label}</dt>
      <dd className="text-[#070707]">{value}</dd>
    </div>
  );
}

export function ModelDetailClient({ modelId }: Props) {
  const { user } = useAuth();
  const [model, setModel] = useState<ModelProfile | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignId, setCampaignId] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [modelData, campaignData] = await Promise.all([
          apiFetch<ModelProfile>(`/models/${modelId}`),
          apiFetch<{ items: Campaign[] }>("/campaigns?status=진행중&limit=50"),
        ]);
        setModel(modelData);
        setCampaigns(campaignData.items);
        if (campaignData.items[0]) setCampaignId(campaignData.items[0].id);
      } catch {
        setStatus("모델 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [modelId]);

  const proposeMatching = useCallback(async () => {
    if (!campaignId) return;
    setStatus("");
    try {
      await apiFetch<Matching>("/matchings", {
        method: "POST",
        body: JSON.stringify({ campaignId, modelId, message }),
      });
      setStatus("매칭 제안이 접수되었습니다.");
    } catch {
      setStatus("매칭 제안에 실패했습니다. 로그인 상태와 공고를 확인해 주세요.");
    }
  }, [campaignId, modelId, message]);

  if (loading) {
    return <p className="px-4 py-16 text-center text-brand-muted">불러오는 중...</p>;
  }

  if (!model) {
    return <p className="px-4 py-16 text-center text-red-600">모델을 찾을 수 없습니다.</p>;
  }

  const bodyText =
    model.height && model.weight
      ? `${model.height}cm / ${model.weight}kg`
      : model.body;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <nav className="mb-6 text-sm text-brand-muted">
        <Link href="/models" className="hover:text-[#070707] hover:underline">
          모델 검색
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#070707]">{model.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <div className="mx-auto w-full max-w-[320px] lg:mx-0">
          <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-[#ececec]">
            {model.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={model.profileImageUrl}
                alt={model.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-brand-muted">
                대표 사진 없음
              </div>
            )}
            {model.verified && (
              <span className="absolute bottom-3 left-3 rounded bg-[#070707] px-2 py-1 text-xs font-semibold text-white">
                공식 인증
              </span>
            )}
          </div>
        </div>

        <div>
          <div className="border-b border-brand-border pb-6">
            <h1 className="text-3xl font-bold tracking-tight text-[#070707]">
              {model.name}
            </h1>
            <p className="mt-2 text-base text-brand-muted">{model.age}</p>
            <p className="mt-1 text-base font-medium text-[#070707]">{bodyText}</p>
          </div>

          <section className="mt-6">
            <h2 className="mb-2 text-sm font-bold text-[#070707]">프로필 정보</h2>
            <dl className="rounded-lg border border-brand-border bg-white px-4">
              <SpecRow label="나이" value={model.age} />
              <SpecRow label="신장 / 체중" value={bodyText} />
              <SpecRow
                label="활동 태그"
                value={model.tags.length > 0 ? model.tags.map((t) => `#${t}`).join("  ") : "-"}
              />
            </dl>
          </section>

          {model.tags.length > 0 && (
            <section className="mt-6">
              <h2 className="mb-3 text-sm font-bold text-[#070707]">활동 분야</h2>
              <div className="flex flex-wrap gap-2">
                {model.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-brand-border bg-white px-3 py-1.5 text-xs font-semibold text-[#070707]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {model.bio && (
            <section className="mt-6">
              <h2 className="mb-3 text-sm font-bold text-[#070707]">소개</h2>
              <div className="rounded-lg border border-brand-border bg-white p-4 text-sm leading-relaxed text-[#070707]">
                {model.bio}
              </div>
            </section>
          )}

          {user?.role === "advertiser" && (
            <section className="mt-8 rounded-xl border border-brand-border bg-white p-5">
              <h2 className="text-sm font-bold text-[#070707]">매칭 제안</h2>
              <p className="mt-1 text-xs text-brand-muted">
                진행 중인 브랜드 공고에 이 모델을 제안할 수 있습니다.
              </p>
              <div className="mt-4 space-y-3">
                <select
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  className="w-full rounded-lg border border-brand-border px-3 py-2.5 text-sm"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="매칭 메시지 (선택)"
                  className="w-full rounded-lg border border-brand-border px-3 py-2.5 text-sm"
                  rows={3}
                />
                <button
                  type="button"
                  onClick={proposeMatching}
                  className="w-full rounded-full bg-[#070707] py-3 text-sm font-semibold text-white hover:opacity-90"
                >
                  매칭 제안하기
                </button>
              </div>
            </section>
          )}

          {!user && (
            <Link
              href="/login"
              className="mt-8 block w-full rounded-full bg-[#070707] py-3 text-center text-sm font-semibold text-white"
            >
              로그인 후 매칭 제안
            </Link>
          )}

          {status && (
            <p className="mt-4 rounded-lg bg-brand-primary-light px-4 py-3 text-sm text-[#070707]">
              {status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
