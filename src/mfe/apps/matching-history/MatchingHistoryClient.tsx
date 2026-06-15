"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { ApiError, apiFetch } from "@/lib/api";
import { loadMatchingHistory } from "@/lib/matching-notifications";
import type { Campaign, Matching } from "@/lib/types";

import {
  getMatchingStatusLabel,
  isMatchingActionable,
  isMatchingChatOpen,
} from "@/lib/matching-status";

type EnrichedMatching = Matching & {
  campaign?: Campaign;
  modelName?: string;
};

export function MatchingHistoryClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<EnrichedMatching[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const data = await loadMatchingHistory(user);
      setItems(
        data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    } catch (err) {
      if (user.role === "model" && err instanceof ApiError && err.status === 404) {
        setError("프로필을 먼저 등록해 주세요.");
      } else {
        setError("내역을 불러오지 못했습니다.");
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on auth ready
      void load();
    }
  }, [user, authLoading, router, load]);

  async function updateStatus(id: string, status: "negotiating" | "rejected") {
    setActingId(id);
    try {
      await apiFetch(`/matchings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await load();
    } finally {
      setActingId(null);
    }
  }

  if (authLoading || loading) {
    return <p className="px-4 py-16 text-center text-brand-muted">불러오는 중...</p>;
  }

  const isAdvertiser = user?.role === "advertiser";
  const title = isAdvertiser ? "매칭 제안 내역" : "공고 지원 내역";
  const subtitle = isAdvertiser
    ? "내 공고에 들어온 모델 지원·매칭 제안 전체 목록입니다."
    : "내가 지원한 브랜드 공고 전체 목록입니다.";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/campaigns" className="text-sm text-brand-primary hover:underline">
        ← 브랜드 공고
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-[#070707]">{title}</h1>
      <p className="mt-1 text-sm text-brand-muted">{subtitle}</p>

      {error && (
        <div className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}{" "}
          {!isAdvertiser && (
            <Link href="/models/profile" className="font-semibold underline">
              프로필 등록하기
            </Link>
          )}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {items.length === 0 && !error && (
          <p className="text-sm text-brand-muted">아직 내역이 없습니다.</p>
        )}
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-brand-border bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1">
                <h2 className="font-semibold text-[#070707]">
                  {isAdvertiser
                    ? `${item.modelName ?? "모델"} · ${item.campaign?.title ?? "공고"}`
                    : item.campaign?.title ?? `공고 #${item.campaignId}`}
                </h2>
                <p className="mt-1 text-xs text-brand-muted">
                  적합도 {item.score}점 · {getMatchingStatusLabel(item.status)}
                </p>
                {item.message && (
                  <p className="mt-2 text-sm text-gray-600">{item.message}</p>
                )}
                <p className="mt-1 text-[10px] text-brand-muted">
                  {new Date(item.createdAt).toLocaleString("ko-KR")}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {item.campaign && (
                  <Link
                    href={`/campaigns/${item.campaignId}`}
                    className="rounded-lg border border-brand-border px-3 py-2 text-center text-xs font-semibold"
                  >
                    공고 보기
                  </Link>
                )}
                {isMatchingActionable(item.status, user?.role) && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={actingId === item.id}
                      onClick={() => void updateStatus(item.id, "negotiating")}
                      className="rounded-lg bg-[#070707] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      수락
                    </button>
                    <button
                      type="button"
                      disabled={actingId === item.id}
                      onClick={() => void updateStatus(item.id, "rejected")}
                      className="rounded-lg border border-brand-border px-3 py-2 text-xs font-semibold disabled:opacity-50"
                    >
                      거절
                    </button>
                  </div>
                )}
                {isMatchingChatOpen(item.status) && (
                  <Link
                    href="/chats"
                    className="rounded-lg bg-brand-primary-light px-3 py-2 text-center text-xs font-semibold text-[#070707]"
                  >
                    채팅
                  </Link>
                )}
                {!isAdvertiser && (
                  <Link
                    href={`/models/${item.modelId}`}
                    className="rounded-lg border border-brand-border px-3 py-2 text-center text-xs font-semibold"
                  >
                    내 프로필
                  </Link>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
