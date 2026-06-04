"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { apiFetch } from "@/lib/api";
import type { Campaign, Paginated } from "@/lib/types";

export function AdvertiserBriefMfe() {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>("");
  const [data, setData] = useState<Paginated<Campaign> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "20" });
      if (status) params.set("status", status);
      const result = await apiFetch<Paginated<Campaign>>(
        `/campaigns?${params.toString()}`,
      );
      setData(result);
    } catch {
      setError("공고 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    void load();
  }, [load]);

  const activeCount =
    data?.items.filter((c) => c.status === "진행중").length ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 overflow-hidden rounded-2xl bg-[#070707] p-8 text-white">
        <p className="text-lg font-bold">브랜드 캠페인 AI 매칭</p>
        <p className="mt-2 text-sm text-neutral-300">
          공고 등록 후 적합 모델을 자동 추천받고 매칭까지 진행하세요
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">브랜드 공고</h1>
          <p className="mt-1 text-sm text-brand-muted">
            {data ? `총 ${activeCount}개 공고 진행 중` : "로딩 중..."}
          </p>
        </div>
        {user?.role === "advertiser" && (
          <Link
            href="/campaigns/new"
            className="rounded-full bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            공고 올리기
          </Link>
        )}
      </div>

      <div className="mb-6 flex gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-brand-border bg-white px-3 py-2 text-sm"
        >
          <option value="">전체</option>
          <option value="진행중">진행중</option>
          <option value="마감">마감</option>
        </select>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-brand-muted">불러오는 중...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.items.map((post) => (
            <Link
              key={post.id}
              href={`/campaigns/${post.id}`}
              className="overflow-hidden rounded-xl border border-brand-border bg-white transition hover:shadow-md"
            >
              <div className="relative aspect-[4/3] bg-gradient-to-br from-brand-primary-soft to-white">
                <span className="absolute bottom-2 left-2 rounded bg-gray-800/80 px-2 py-0.5 text-xs text-white">
                  {post.category}
                </span>
                <span
                  className={`absolute bottom-2 right-2 rounded px-2 py-0.5 text-xs font-semibold ${
                    post.status === "진행중"
                      ? "bg-[#070707] text-white"
                      : "bg-gray-500 text-white"
                  }`}
                >
                  {post.status}
                </span>
              </div>
              <div className="p-4">
                <h2 className="line-clamp-2 text-sm font-bold text-gray-900">
                  {post.title}
                </h2>
                <p className="mt-2 text-xs text-brand-muted">페이 : {post.pay}</p>
                <p className="mt-1 text-xs text-brand-muted">{post.due}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
