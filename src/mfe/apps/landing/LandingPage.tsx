"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthProvider";

const HERO_MODELS = [
  { id: "47466", name: "강다민" },
  { id: "44208", name: "이현서" },
  { id: "26856", name: "김호은" },
  { id: "27995", name: "백년" },
  { id: "40085", name: "정규민" },
];

const FLOW_STEPS = [
  { step: "1", title: "공고 등록", desc: "브랜드 캠페인 조건·태그 입력" },
  { step: "2", title: "모델 지원 · 제안", desc: "AI 추천 또는 검색으로 매칭" },
  { step: "3", title: "매칭 · 채팅", desc: "수락 후 일정·조건 협의" },
];

const testimonials = [
  {
    quote:
      "공고 등록부터 모델 검색, 채팅까지 한 곳에서 끝나 캐스팅 일정이 절반으로 줄었습니다.",
    author: "뷰티 브랜드 마케팅팀",
  },
  {
    quote:
      "태그 기반 추천으로 후보를 빠르게 좁히고, 지원·제안 내역도 마이페이지에서 확인됩니다.",
    author: "게임사 UA 담당",
  },
  {
    quote:
      "프로필만 등록하면 브랜드 공고에 지원할 수 있어서 프리랜서 모델에게도 편합니다.",
    author: "패션 크리에이터",
  },
];

export function LandingPage() {
  const { user } = useAuth();
  const [persona, setPersona] = useState<"advertiser" | "model">("advertiser");

  return (
    <>
      <section className="bg-gradient-to-b from-brand-primary-soft to-[#FAF6F9] px-4 py-12 md:py-20">
        <div className="mx-auto max-w-6xl text-center">
          <p className="mb-3 text-4xl font-black tracking-tight text-brand-primary md:text-6xl">
            AdMatch
          </p>
          <h1 className="text-xl font-bold leading-snug text-gray-900 md:text-3xl">
            브랜드 광고·SNS 캠페인용 모델을 찾고
            <br />
            지원 · 매칭 · 채팅까지 한 번에
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-brand-muted md:text-base">
            광고주는 공고를 올리고 모델을 제안하고, 모델은 프로필을 등록해 브랜드 공고에
            지원합니다. 매칭되면 바로 채팅으로 이어집니다.
          </p>

          <div className="mx-auto mt-8 grid max-w-4xl grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
            {HERO_MODELS.map((m) => (
              <div key={m.id} className="overflow-hidden rounded-lg shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/seed-models/${m.id}.png`}
                  alt={m.name}
                  className="aspect-[3/4] w-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            {FLOW_STEPS.map((f) => (
              <div
                key={f.step}
                className="rounded-xl border border-brand-border bg-white p-4 text-left"
              >
                <span className="text-xs font-bold text-brand-muted">STEP {f.step}</span>
                <p className="mt-1 font-bold text-[#070707]">{f.title}</p>
                <p className="mt-1 text-xs text-brand-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-brand-border px-4 py-8">
        <div className="mx-auto flex max-w-md justify-center gap-3">
          <button
            type="button"
            onClick={() => setPersona("advertiser")}
            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold sm:px-6 sm:py-4 ${
              persona === "advertiser"
                ? "border-brand-primary bg-brand-primary text-white"
                : "border-brand-border bg-white text-gray-700"
            }`}
          >
            광고주
          </button>
          <button
            type="button"
            onClick={() => setPersona("model")}
            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold sm:px-6 sm:py-4 ${
              persona === "model"
                ? "border-brand-primary bg-brand-primary text-white"
                : "border-brand-border bg-white text-gray-700"
            }`}
          >
            모델 · 크리에이터
          </button>
        </div>
      </section>

      {persona === "advertiser" ? (
        <>
          <section className="px-4 py-12 md:py-16">
            <div className="mx-auto max-w-6xl">
              <h2 className="text-center text-2xl font-bold text-gray-900">
                광고주를 위한 모델 매칭
              </h2>
              <p className="mt-2 text-center text-sm text-brand-muted">
                모델 검색 → AI 추천 → 제안 · 채팅
              </p>

              <div className="mt-10 rounded-2xl bg-brand-primary-light p-6 md:p-10">
                <h3 className="text-lg font-bold text-gray-900 md:text-xl">
                  캠페인에 맞는 모델을 찾아 바로 제안하세요
                </h3>
                <p className="mt-2 text-sm text-brand-muted">
                  활동 태그·스펙으로 검색하고, 제안 시 채팅방이 바로 열립니다.
                </p>
                {user ? (
                  <Link
                    href="/models"
                    className="mt-5 inline-flex rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
                  >
                    모델 찾기 →
                  </Link>
                ) : (
                  <Link
                    href="/login?next=/models"
                    className="mt-5 inline-flex rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
                  >
                    로그인 후 모델 찾기 →
                  </Link>
                )}
              </div>
            </div>
          </section>

          <section className="bg-gray-50 px-4 py-12">
            <div className="mx-auto max-w-6xl">
              <h2 className="text-center text-2xl font-bold">AdMatch 이용 후기</h2>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {testimonials.map((item) => (
                  <blockquote
                    key={item.author}
                    className="rounded-2xl bg-white p-6 shadow-sm"
                  >
                    <p className="text-sm leading-relaxed text-gray-700">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                    <footer className="mt-4 text-xs font-semibold text-brand-muted">
                      {item.author}
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="px-4 py-12 md:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-gray-900">모델 · 크리에이터를 위한 플랫폼</h2>
            <p className="mt-4 text-sm text-brand-muted">
              프로필 등록 → 브랜드 공고 지원 → 매칭 · 채팅
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {user ? (
                <Link
                  href={user.role === "model" ? "/models/profile" : "/campaigns"}
                  className="rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white"
                >
                  {user.role === "model" ? "프로필 관리" : "공고 보기"}
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white"
                  >
                    시작하기
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-full border border-brand-primary px-6 py-3 text-sm font-semibold text-brand-primary"
                  >
                    로그인
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="bg-brand-primary px-4 py-12 text-center text-white md:py-16">
        <h2 className="text-xl font-bold md:text-2xl">
          지금 AdMatch와 함께
          <br />
          캐스팅 · 커리어를 시작해 보세요
        </h2>
        {user ? (
          <Link
            href={user.role === "advertiser" ? "/campaigns/new" : "/campaigns"}
            className="mt-6 inline-flex rounded-full bg-white px-8 py-3 text-sm font-semibold text-brand-primary"
          >
            {user.role === "advertiser" ? "공고 등록하기" : "공고 둘러보기"}
          </Link>
        ) : (
          <Link
            href="/register"
            className="mt-6 inline-flex rounded-full bg-white px-8 py-3 text-sm font-semibold text-brand-primary"
          >
            무료로 시작하기
          </Link>
        )}
      </section>
    </>
  );
}
