"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { ModelProfile, Paginated } from "@/lib/types";

export function DiscoveryMfe() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Paginated<ModelProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
      });
      if (query) params.set("search", query);
      const result = await apiFetch<Paginated<ModelProfile>>(
        `/models?${params.toString()}`,
      );
      setData(result);
    } catch {
      setError("모델 목록을 불러오지 못했습니다. 백엔드 서버를 확인해 주세요.");
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    void load();
  }, [load]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    setQuery(search.trim());
  }

  const totalPages = data?.totalPages ?? 1;
  const pageNumbers = Array.from(
    { length: Math.min(5, totalPages) },
    (_, i) => i + 1,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="border-b border-brand-border pb-6">
        <h1 className="text-2xl font-bold text-[#070707]">모델 검색</h1>
        <p className="mt-1 text-sm text-brand-muted">
          {data ? `총 ${data.total.toLocaleString()}명` : "모델 데이터 로딩 중..."}
        </p>
      </div>

      <form
        onSubmit={onSearch}
        className="mt-6 flex flex-wrap items-center gap-2 border-b border-brand-border pb-6"
      >
        <select
          className="rounded-lg border border-brand-border bg-white px-3 py-2.5 text-sm text-[#070707]"
          defaultValue="all"
          aria-label="검색 범위"
        >
          <option value="all">통합 선택</option>
        </select>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="이름, 태그, 특기로 검색"
          className="min-w-[200px] flex-1 rounded-lg border border-brand-border bg-white px-3 py-2.5 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-[#070707] px-5 py-2.5 text-sm font-semibold text-white"
        >
          검색
        </button>
        <button
          type="button"
          onClick={() => {
            setSearch("");
            setQuery("");
            setPage(1);
          }}
          className="rounded-lg border border-brand-border bg-white px-4 py-2.5 text-sm text-[#070707]"
          title="초기화"
        >
          ↺
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-brand-muted">불러오는 중...</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {data?.items.map((model) => (
            <Link
              key={model.id}
              href={`/models/${model.id}`}
              className="group block"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-[#ececec]">
                {model.profileImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={model.profileImageUrl}
                    alt={model.name}
                    className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-brand-muted">
                    사진 없음
                  </div>
                )}
                {model.verified && (
                  <span className="absolute bottom-2 left-2 rounded bg-[#070707] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    공식 인증
                  </span>
                )}
              </div>
              <p className="mt-2.5 text-sm font-bold text-[#070707] group-hover:underline">
                {model.name}
              </p>
              <p className="text-xs text-brand-muted">{model.age}</p>
              <p className="text-xs text-brand-muted">
                {model.height && model.weight
                  ? `${model.height}cm / ${model.weight}kg`
                  : model.body}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {model.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] text-brand-muted before:content-['#']"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-1 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-border disabled:opacity-30"
            aria-label="이전 페이지"
          >
            ‹
          </button>
          {pageNumbers.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              className={`flex h-9 w-9 items-center justify-center rounded-full font-semibold ${
                page === n
                  ? "bg-[#070707] text-white"
                  : "text-[#070707] hover:bg-brand-primary-light"
              }`}
            >
              {n}
            </button>
          ))}
          {totalPages > 5 && (
            <span className="px-1 text-brand-muted">…</span>
          )}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-border disabled:opacity-30"
            aria-label="다음 페이지"
          >
            ›
          </button>
        </nav>
      )}
    </div>
  );
}
