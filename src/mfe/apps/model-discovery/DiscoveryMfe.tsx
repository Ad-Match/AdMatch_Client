"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { ModelProfile, Paginated } from "@/lib/types";

const FILTER_TAGS = ["전체", "뷰티", "SNS", "숏폼", "CF", "게임", "패션"];

export function DiscoveryMfe() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("전체");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<ModelProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      const q = tagFilter !== "전체" && !query ? tagFilter : query;
      if (q) params.set("search", q);
      const result = await apiFetch<Paginated<ModelProfile>>(`/models?${params}`);
      setData(result);
    } catch {
      setError("모델 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }, [page, query, tagFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    setQuery(search.trim());
  }

  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8">
      <div className="border-b border-brand-border pb-5">
        <h1 className="text-xl font-bold text-[#070707] sm:text-2xl">모델 검색</h1>
        <p className="mt-1 text-sm text-brand-muted">
          {data ? `총 ${data.total.toLocaleString()}명 · 캠페인에 맞는 모델을 찾아보세요` : "로딩 중..."}
        </p>
      </div>

      <div className="sticky top-16 z-40 -mx-3 border-b border-brand-border bg-[#FAF6F9]/95 px-3 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
        <form onSubmit={onSearch} className="mt-0 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:items-center">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름, 태그, 특기 검색"
            className="w-full rounded-lg border border-brand-border bg-white px-3 py-2.5 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg bg-[#070707] px-5 py-2.5 text-sm font-semibold text-white sm:shrink-0"
          >
            검색
          </button>
        </form>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:mt-4">
          {FILTER_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setTagFilter(tag);
                setPage(1);
                if (tag === "전체") setQuery("");
                else setQuery(tag);
              }}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                tagFilter === tag
                  ? "bg-[#070707] text-white"
                  : "border border-brand-border bg-white text-[#070707]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-sm bg-[#ececec]" />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-2 gap-y-5 sm:grid-cols-3 sm:gap-x-3 md:grid-cols-4 lg:grid-cols-5">
          {data?.items.map((model) => (
            <Link key={model.id} href={`/models/${model.id}`} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-[#ececec]">
                {model.profileImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={model.profileImageUrl}
                    alt={model.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-brand-muted">
                    사진 없음
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                  <p className="text-[10px] text-white">
                    {model.tags.slice(0, 3).map((t) => `#${t}`).join(" ")}
                  </p>
                </div>
                {model.verified && (
                  <span className="absolute left-1.5 top-1.5 rounded bg-[#070707] px-1.5 py-0.5 text-[9px] font-bold text-white">
                    인증
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm font-bold leading-tight text-[#070707] group-hover:underline">
                {model.name}
              </p>
              <p className="text-[11px] text-brand-muted">{model.age}</p>
              <p className="text-[11px] font-medium text-[#070707]">
                {model.height && model.weight
                  ? `${model.height}cm · ${model.weight}kg`
                  : model.body}
              </p>
            </Link>
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-1 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="h-9 w-9 rounded-full border border-brand-border disabled:opacity-30"
          >
            ‹
          </button>
          <span className="px-3 text-brand-muted">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="h-9 w-9 rounded-full border border-brand-border disabled:opacity-30"
          >
            ›
          </button>
        </nav>
      )}
    </div>
  );
}
