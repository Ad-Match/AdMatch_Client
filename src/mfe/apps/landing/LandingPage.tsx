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

const MODEL_FLOW_STEPS = [
  { step: "1", title: "프로필 등록", desc: "사진·스펙·활동 태그·SNS를 한 번에 정리" },
  { step: "2", title: "공고 탐색 · 지원", desc: "뷰티·패션·게임 등 브랜드 캠페인에 지원" },
  { step: "3", title: "매칭 · 채팅", desc: "브랜드 수락 후 일정·조건을 바로 협의" },
];

const ADVERTISER_FEATURES = [
  {
    title: "간편한 캠페인 공고 등록",
    desc: "카테고리, 예산, 촬영 일정, 활동 태그만 입력하면 모델 모집 공고를 바로 올릴 수 있어요.",
  },
  {
    title: "태그·스펙으로 모델 검색",
    desc: "뷰티, 패션, 게임 등 활동 분야와 키·나이 조건으로 원하는 후보를 빠르게 찾아보세요.",
  },
  {
    title: "AI 기반 모델 추천",
    desc: "등록한 공고 조건에 맞는 모델을 자동으로 추천해 캐스팅 후보를 좁히는 시간을 줄여 드립니다.",
  },
  {
    title: "제안부터 채팅까지 한 곳에서",
    desc: "모델 제안, 지원 수락, 채팅 협의를 앱 안에서 이어가 별도 연락처 공유 없이 진행할 수 있어요.",
  },
];

const ADVERTISER_FLOW_STEPS = [
  { step: "1", title: "공고 등록", desc: "캠페인 조건·예산·태그를 입력해 모집 시작" },
  { step: "2", title: "모델 검색 · 추천", desc: "검색 또는 AI 추천으로 후보를 선별" },
  { step: "3", title: "제안 · 채팅", desc: "모델에게 제안하고 매칭 후 일정·조건 협의" },
];

const MODEL_FEATURES = [
  {
    title: "한눈에 보이는 프로필 카드",
    desc: "대표 사진, 갤러리, 키·나이·거주지, 자기소개까지 브랜드가 바로 확인할 수 있어요.",
  },
  {
    title: "활동 태그로 공고와 연결",
    desc: "뷰티, 패션, 게임, 라이프스타일 등 태그를 등록하면 맞는 브랜드 공고를 찾기 쉬워요.",
  },
  {
    title: "경력 · 취미 · SNS 링크",
    desc: "광고·촬영 경력, 취미, 인스타·유튜브 링크를 넣어 나만의 포트폴리오를 완성하세요.",
  },
  {
    title: "지원부터 채팅까지 한 곳에서",
    desc: "공고 지원, 매칭 수락, 채팅 협의를 앱 안에서 이어가 별도 연락처 공유 없이 진행할 수 있어요.",
  },
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

const modelTestimonials = [
  {
    quote:
      "프로필만 잘 채워두면 브랜드가 먼저 제안해 주기도 해요. 예전처럼 에이전시에 이력서 보낼 필요가 없어졌습니다.",
    author: "프리랜서 모델",
  },
  {
    quote:
      "태그로 활동 분야를 적어두니 뷰티·패션 공고만 골라 지원할 수 있어요. 지원 현황도 마이페이지에서 한눈에 봅니다.",
    author: "뷰티 크리에이터",
  },
  {
    quote:
      "매칭되면 바로 채팅이 열려서 촬영 일정이랑 단가를 빠르게 맞출 수 있어요. DM 여러 개 오가던 때보다 훨씬 깔끔합니다.",
    author: "SNS 인플루언서",
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

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {ADVERTISER_FEATURES.map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm"
                  >
                    <h3 className="font-bold text-gray-900">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {ADVERTISER_FLOW_STEPS.map((f) => (
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

          <section className="bg-gray-50 px-4 py-12">
            <div className="mx-auto max-w-6xl">
              <h2 className="text-center text-2xl font-bold">AdMatch 이용 후기</h2>
              <p className="mt-2 text-center text-sm text-brand-muted">
                AdMatch로 캐스팅을 간소화한 브랜드 이용 경험
              </p>
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
        <>
          <section className="px-4 py-12 md:py-16">
            <div className="mx-auto max-w-6xl">
              <h2 className="text-center text-2xl font-bold text-gray-900">
                모델 · 크리에이터를 위한 커리어 플랫폼
              </h2>
              <p className="mt-2 text-center text-sm text-brand-muted">
                프로필 등록 → 브랜드 공고 지원 → 매칭 · 채팅
              </p>

              <div className="mt-10 rounded-2xl bg-brand-primary-light p-6 md:p-10">
                <h3 className="text-lg font-bold text-gray-900 md:text-xl">
                  프로필 하나로 브랜드 캠페인에 도전하세요
                </h3>
                <p className="mt-2 text-sm text-brand-muted">
                  사진·스펙·태그만 등록하면 뷰티, 패션, 게임 등 다양한 브랜드 공고에 지원할 수
                  있습니다. 매칭되면 채팅으로 바로 협의해 보세요.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {user ? (
                    <>
                      <Link
                        href={user.role === "model" ? "/models/profile" : "/register"}
                        className="inline-flex rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
                      >
                        {user.role === "model" ? "프로필 관리 →" : "모델로 가입하기 →"}
                      </Link>
                      <Link
                        href="/campaigns"
                        className="inline-flex rounded-full border border-brand-primary px-6 py-3 text-sm font-semibold text-brand-primary hover:bg-white"
                      >
                        브랜드 공고 보기
                      </Link>
                    </>
                  ) : (
                    <Link
                      href="/login?next=/campaigns"
                      className="inline-flex rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
                    >
                      로그인 후 공고 보기 →
                    </Link>
                  )}
                </div>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {MODEL_FEATURES.map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm"
                  >
                    <h3 className="font-bold text-gray-900">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {MODEL_FLOW_STEPS.map((f) => (
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

          <section className="bg-gray-50 px-4 py-12">
            <div className="mx-auto max-w-6xl">
              <h2 className="text-center text-2xl font-bold">모델 · 크리에이터 후기</h2>
              <p className="mt-2 text-center text-sm text-brand-muted">
                AdMatch로 브랜드와 연결된 실제 이용 경험
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {modelTestimonials.map((item) => (
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
