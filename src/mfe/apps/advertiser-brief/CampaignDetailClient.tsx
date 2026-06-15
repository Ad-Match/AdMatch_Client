"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { ApiError, apiFetch } from "@/lib/api";
import { parseApiErrorMessage } from "@/lib/api-errors";
import { CampaignCover } from "@/components/campaign/CampaignCover";
import {
  formatCampaignShootSchedule,
  getCampaignDday,
} from "@/lib/campaign-due";
import { getMatchingStatusLabel, isMatchingChatOpen } from "@/lib/matching-status";
import type {
  Campaign,
  Matching,
  ModelProfile,
  ModelRecommendation,
} from "@/lib/types";

type Props = { campaignId: string };

function SectionBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-brand-border bg-white p-5 sm:p-6">
      <h2 className="text-base font-bold text-[#070707] sm:text-lg">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-[#070707] whitespace-pre-line">
        {children}
      </div>
    </section>
  );
}

export function CampaignDetailClient({ campaignId }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [recommendations, setRecommendations] = useState<ModelRecommendation[]>([]);
  const [matchings, setMatchings] = useState<Matching[]>([]);
  const [models, setModels] = useState<Record<string, ModelProfile>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const campaignData = await apiFetch<Campaign>(`/campaigns/${campaignId}`);
      setCampaign(campaignData);

      const isOwner = user?.id === campaignData.advertiserId;
      if (!isOwner) {
        setRecommendations([]);
        setMatchings([]);
        setModels({});
        return;
      }

      const [recs, matchingList] = await Promise.all([
        apiFetch<ModelRecommendation[]>(`/campaigns/${campaignId}/recommendations`),
        apiFetch<Matching[]>(`/matchings?campaignId=${campaignId}`),
      ]);
      setRecommendations(recs);
      setMatchings(matchingList);

      const modelMap: Record<string, ModelProfile> = {};
      await Promise.all(
        recs.map(async (rec) => {
          try {
            modelMap[rec.modelId] = await apiFetch<ModelProfile>(
              `/models/${rec.modelId}`,
            );
          } catch {
            /* skip */
          }
        }),
      );
      setModels(modelMap);
    } catch {
      showToast("공고 정보를 불러오지 못했습니다.", "error");
    } finally {
      setLoading(false);
    }
  }, [campaignId, showToast, user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function propose(modelId: string) {
    try {
      const result = await apiFetch<Matching>("/matchings", {
        method: "POST",
        body: JSON.stringify({ campaignId, modelId, autoAccept: true }),
      });
      showToast("매칭 제안 완료! 채팅으로 이동합니다.", "success");
      if (result.chatRoomId) {
        router.push(`/chats/${result.chatRoomId}`);
      } else {
        router.push("/chats");
      }
    } catch (err) {
      showToast(parseApiErrorMessage(err), "error");
    }
  }

  async function applyAsModel() {
    if (!user) return;

    let profile: ModelProfile;
    try {
      profile = await apiFetch<ModelProfile>(`/models/user/${user.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        showToast("프로필 등록 후 지원할 수 있습니다.", "info");
        router.push("/models/profile");
        return;
      }
      showToast(parseApiErrorMessage(err), "error");
      return;
    }

    try {
      await apiFetch("/matchings", {
        method: "POST",
        body: JSON.stringify({ campaignId, modelId: profile.id }),
      });
      showToast("공고 지원이 접수되었습니다!", "success");
      router.push("/campaigns/applications");
    } catch (err) {
      showToast(parseApiErrorMessage(err), "error");
    }
  }

  async function updateMatching(id: string, next: "negotiating" | "rejected") {
    try {
      const result = await apiFetch<Matching>(`/matchings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      if (next === "negotiating") {
        showToast("매칭을 수락했습니다. 채팅으로 이동합니다.", "success");
        if (result.chatRoomId) {
          router.push(`/chats/${result.chatRoomId}`);
          return;
        }
      } else {
        showToast("매칭을 거절했습니다.", "info");
      }
      load();
    } catch (err) {
      showToast(parseApiErrorMessage(err), "error");
    }
  }

  if (loading) {
    return <p className="px-4 py-16 text-center text-brand-muted">불러오는 중...</p>;
  }

  if (!campaign) {
    return <p className="px-4 py-16 text-center text-red-600">공고를 찾을 수 없습니다.</p>;
  }

  const isOwner = user?.id === campaign.advertiserId;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-3 py-6 sm:px-4 sm:py-8">
      <div className="flex items-center justify-between gap-3">
        <Link href="/campaigns" className="text-sm text-[#070707] hover:underline">
          ← 브랜드 공고
        </Link>
        {isOwner && (
          <Link
            href={`/campaigns/${campaignId}/edit`}
            className="shrink-0 rounded-full border border-brand-border bg-white px-4 py-2 text-sm font-semibold text-[#070707] shadow-sm hover:bg-brand-primary-light"
          >
            공고 수정
          </Link>
        )}
      </div>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="relative">
          <CampaignCover
            imageUrl={campaign.imageUrl}
            alt={campaign.title}
            className="aspect-[21/9] sm:aspect-[3/1]"
            overlay={
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            }
          />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8">
            <div className="mb-2 flex flex-wrap gap-2">
              <span className="rounded bg-white/20 px-2 py-1 text-xs">{campaign.category}</span>
              <span className="rounded bg-white px-2 py-1 text-xs font-semibold text-[#070707]">
                {campaign.status}
              </span>
            </div>
            <h1 className="text-xl font-bold sm:text-2xl">{campaign.title}</h1>
            <p className="mt-2 text-sm text-neutral-200">
              {campaign.pay}
              {" · "}
              <span className="font-semibold">{getCampaignDday(campaign.due)}</span>
              {" · "}
              {formatCampaignShootSchedule(campaign.due)}
              {campaign.location ? ` · ${campaign.location}` : ""}
            </p>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap gap-2">
            {campaign.requiredTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-brand-primary-light px-3 py-1 text-xs font-semibold text-[#070707]"
              >
                #{tag}
              </span>
            ))}
          </div>
          {user?.role === "model" && campaign.status === "진행중" && (
            <button
              type="button"
              onClick={() => void applyAsModel()}
              className="mt-6 w-full rounded-full bg-[#070707] py-3 text-sm font-semibold text-white"
            >
              이 공고에 지원하기
            </button>
          )}
        </div>
      </section>

      {campaign.description && (
        <SectionBlock title="공고 소개">{campaign.description}</SectionBlock>
      )}
      {campaign.requirements && (
        <SectionBlock title="지원 자격 · 요건">{campaign.requirements}</SectionBlock>
      )}
      {campaign.deliverables && (
        <SectionBlock title="제출물 · 진행 내용">{campaign.deliverables}</SectionBlock>
      )}

      {isOwner && (
        <>
          <section className="rounded-2xl border border-brand-border bg-white p-5 sm:p-6">
            <h2 className="text-lg font-bold">AI 추천 모델</h2>
            <p className="mt-1 text-xs text-brand-muted">
              태그 기반 적합도 · 제안 시 바로 채팅 연결
            </p>
            <div className="mt-4 space-y-3">
              {recommendations.length === 0 && (
                <p className="text-sm text-brand-muted">추천 모델이 없습니다.</p>
              )}
              {recommendations.map((rec) => {
                const model = models[rec.modelId];
                return (
                  <div
                    key={rec.modelId}
                    className="flex flex-col gap-3 rounded-xl border border-brand-border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {model?.profileImageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={model.profileImageUrl}
                          alt=""
                          className="h-14 w-11 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="font-semibold">{model?.name ?? rec.modelId}</p>
                        <p className="text-xs text-brand-muted">{rec.reason}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/models/${rec.modelId}`}
                        className="rounded-lg border border-brand-border px-3 py-2 text-sm"
                      >
                        프로필
                      </Link>
                      <button
                        type="button"
                        onClick={() => void propose(rec.modelId)}
                        className="rounded-lg bg-[#070707] px-3 py-2 text-sm font-semibold text-white"
                      >
                        제안 · 채팅
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-brand-border bg-white p-5 sm:p-6">
            <h2 className="text-lg font-bold">지원 · 매칭 현황</h2>
            <div className="mt-4 space-y-3">
              {matchings.length === 0 && (
                <p className="text-sm text-brand-muted">아직 지원자가 없습니다.</p>
              )}
              {matchings.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-col gap-3 rounded-xl border border-brand-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold">모델 ID: {m.modelId}</p>
                    <p className="text-xs text-brand-muted">
                      적합도 {m.score} · {getMatchingStatusLabel(m.status)}
                    </p>
                  </div>
                  {m.status === "proposing" && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => void updateMatching(m.id, "negotiating")}
                        className="rounded-lg bg-[#070707] px-3 py-2 text-xs font-semibold text-white"
                      >
                        수락 · 채팅
                      </button>
                      <button
                        type="button"
                        onClick={() => void updateMatching(m.id, "rejected")}
                        className="rounded-lg border border-brand-border px-3 py-2 text-xs"
                      >
                        거절
                      </button>
                    </div>
                  )}
                  {isMatchingChatOpen(m.status) && (
                    <Link
                      href="/chats"
                      className="text-xs font-semibold text-[#070707] underline"
                    >
                      채팅 열기
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
