"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { ApiError, apiFetch } from "@/lib/api";
import { parseApiErrorMessage } from "@/lib/api-errors";
import type {
  Campaign,
  Matching,
  ModelProfile,
  ModelRecommendation,
} from "@/lib/types";

type Props = { campaignId: string };

export function CampaignDetailClient({ campaignId }: Props) {
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [recommendations, setRecommendations] = useState<ModelRecommendation[]>(
    [],
  );
  const [matchings, setMatchings] = useState<Matching[]>([]);
  const [models, setModels] = useState<Record<string, ModelProfile>>({});
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [campaignData, recs, matchingList] = await Promise.all([
        apiFetch<Campaign>(`/campaigns/${campaignId}`),
        apiFetch<ModelRecommendation[]>(
          `/campaigns/${campaignId}/recommendations`,
        ),
        apiFetch<Matching[]>(`/matchings?campaignId=${campaignId}`),
      ]);
      setCampaign(campaignData);
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
      setStatus("공고 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    void load();
  }, [load]);

  async function propose(modelId: string) {
    try {
      await apiFetch("/matchings", {
        method: "POST",
        body: JSON.stringify({ campaignId, modelId }),
      });
      setStatus("매칭 제안이 완료되었습니다.");
      load();
    } catch {
      setStatus("매칭 제안에 실패했습니다.");
    }
  }

  async function applyAsModel() {
    if (!user) return;
    setStatus("");

    let profile: ModelProfile;
    try {
      profile = await apiFetch<ModelProfile>(`/models/user/${user.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setStatus(
          "프로필 등록 후 지원할 수 있습니다. 프로필 관리에서 등록해 주세요.",
        );
        return;
      }
      setStatus(
        `프로필을 불러오지 못했습니다. ${parseApiErrorMessage(err) || "잠시 후 다시 시도해 주세요."}`,
      );
      return;
    }

    try {
      await apiFetch("/matchings", {
        method: "POST",
        body: JSON.stringify({ campaignId, modelId: profile.id }),
      });
      setStatus("공고 지원이 접수되었습니다.");
      load();
    } catch (err) {
      const msg = parseApiErrorMessage(err);
      if (msg.includes("already exists") || msg.includes("Matching already")) {
        setStatus("이미 이 공고에 지원하셨습니다. 지원 내역에서 확인해 주세요.");
        return;
      }
      if (msg.includes("Closed campaign") || msg.includes("마감")) {
        setStatus("마감된 공고에는 지원할 수 없습니다.");
        return;
      }
      setStatus(`지원에 실패했습니다. ${msg || "잠시 후 다시 시도해 주세요."}`);
    }
  }

  async function updateMatching(id: string, next: "accepted" | "rejected") {
    try {
      await apiFetch(`/matchings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      if (next === "accepted") {
        setStatus("매칭을 수락했습니다. 채팅 탭에서 대화를 시작할 수 있습니다.");
      }
      load();
    } catch {
      setStatus("상태 변경에 실패했습니다.");
    }
  }

  if (loading) {
    return <p className="px-4 py-16 text-center text-brand-muted">불러오는 중...</p>;
  }

  if (!campaign) {
    return <p className="px-4 py-16 text-center text-red-600">공고를 찾을 수 없습니다.</p>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <Link href="/campaigns" className="text-sm text-brand-primary hover:underline">
        ← 브랜드 공고
      </Link>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded bg-brand-primary-light px-2 py-1 text-xs text-brand-primary">
            {campaign.category}
          </span>
          <span
            className={`rounded px-2 py-1 text-xs font-semibold ${
              campaign.status === "진행중"
                ? "bg-[#070707] text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {campaign.status}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
        <p className="mt-2 text-sm text-brand-muted">페이: {campaign.pay}</p>
        <p className="text-sm text-brand-muted">{campaign.due}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {campaign.requiredTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-brand-primary-light px-2 py-1 text-xs text-brand-primary"
            >
              #{tag}
            </span>
          ))}
        </div>
        {user?.role === "model" && campaign.status === "진행중" && (
          <button
            type="button"
            onClick={() => void applyAsModel()}
            className="mt-6 w-full rounded-full bg-brand-primary py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            이 공고에 지원하기
          </button>
        )}
      </section>

      {status && (
        <p className="rounded-lg bg-brand-primary-light px-4 py-3 text-sm text-brand-primary">
          {status}
        </p>
      )}

      {user?.role === "advertiser" && (
        <>
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">AI 추천 모델</h2>
        <div className="space-y-3">
          {recommendations.length === 0 && (
            <p className="text-sm text-brand-muted">추천 모델이 없습니다.</p>
          )}
          {recommendations.map((rec) => {
            const model = models[rec.modelId];
            return (
              <div
                key={rec.modelId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-border p-4"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {model?.name ?? rec.modelId}
                  </p>
                  <p className="text-sm text-brand-muted">{rec.reason}</p>
                  <p className="text-xs text-brand-primary">적합도 {rec.score}점</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/models/${rec.modelId}`}
                    className="rounded-lg border border-brand-border px-3 py-2 text-sm"
                  >
                    프로필
                  </Link>
                  {user?.role === "advertiser" && (
                    <button
                      onClick={() => propose(rec.modelId)}
                      className="rounded-lg bg-brand-primary px-3 py-2 text-sm font-semibold text-white"
                    >
                      매칭 제안
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">매칭 현황</h2>
        <div className="space-y-3">
          {matchings.length === 0 && (
            <p className="text-sm text-brand-muted">아직 매칭 요청이 없습니다.</p>
          )}
          {matchings.map((m) => (
            <div
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-border p-4"
            >
              <div>
                <p className="text-sm font-semibold">모델 ID: {m.modelId}</p>
                <p className="text-xs text-brand-muted">
                  적합도 {m.score} · {m.status}
                </p>
              </div>
              {user?.role === "advertiser" && m.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateMatching(m.id, "accepted")}
                    className="rounded-lg bg-[#070707] px-3 py-2 text-xs font-semibold text-white"
                  >
                    수락
                  </button>
                  <button
                    onClick={() => updateMatching(m.id, "rejected")}
                    className="rounded-lg border border-brand-border px-3 py-2 text-xs"
                  >
                    거절
                  </button>
                </div>
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
