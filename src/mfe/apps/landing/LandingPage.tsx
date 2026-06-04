"use client";

import Link from "next/link";
import { useState } from "react";

const testimonials = [
  {
    quote:
      "키, 나이, 스타일 필터로 수동 작업이 줄어 캠페인 모델 선정이 훨씬 빨라졌습니다.",
    author: "뷰티 브랜드 마케팅팀",
  },
  {
    quote:
      "공고 등록 후 AI 추천 후보가 자동으로 들어와서 첫 미팅까지 일정이 단축됐습니다.",
    author: "게임사 UA 담당",
  },
  {
    quote:
      "모델 풀이 이렇게 많은 플랫폼은 처음이고, 공고 지원부터 매칭까지 한 곳에서 관리됩니다.",
    author: "패션 커머스 PD",
  },
];

export function LandingPage() {
  const [persona, setPersona] = useState<"advertiser" | "model">("advertiser");

  return (
    <>
      <section className="bg-gradient-to-b from-brand-primary-soft to-[#FAF6F9] px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl text-center">
          <p className="mb-4 text-5xl font-black tracking-tight text-brand-primary md:text-6xl">
            AdMatch
          </p>
          <h1 className="text-2xl font-bold leading-snug text-gray-900 md:text-4xl">
            성공적인 광고 캐스팅의 시작,
            <br />
            AdMatch와 함께해 보세요.
          </h1>

          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-3 gap-3 md:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-lg bg-gradient-to-br from-gray-200 to-gray-100 shadow-sm"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-brand-border px-4 py-10">
        <div className="mx-auto flex max-w-md justify-center gap-3">
          <button
            onClick={() => setPersona("advertiser")}
            className={`flex-1 rounded-xl border px-6 py-4 text-sm font-semibold transition ${
              persona === "advertiser"
                ? "border-brand-primary bg-brand-primary text-white"
                : "border-brand-border bg-white text-gray-700"
            }`}
          >
            광고주
          </button>
          <button
            onClick={() => setPersona("model")}
            className={`flex-1 rounded-xl border px-6 py-4 text-sm font-semibold transition ${
              persona === "model"
                ? "border-brand-primary bg-brand-primary text-white"
                : "border-brand-border bg-white text-gray-700"
            }`}
          >
            모델 회원
          </button>
        </div>
      </section>

      {persona === "advertiser" ? (
        <>
          <section className="px-4 py-16">
            <div className="mx-auto max-w-6xl">
              <h2 className="text-center text-2xl font-bold text-gray-900 md:text-3xl">
                광고주를 위한
                <br />
                올인원 모델 매칭 서비스
              </h2>
              <p className="mt-3 text-center text-sm text-brand-muted">
                완벽한 캠페인을 위한 획기적인 솔루션
              </p>

              <div className="mt-12 rounded-2xl bg-brand-primary-light p-8 md:p-12">
                <h3 className="text-xl font-bold text-gray-900">
                  캠페인에 딱 맞는 모델을 찾아
                  <br />
                  매칭을 편리하게
                </h3>
                <p className="mt-3 text-sm text-brand-muted">
                  18,000명 이상의 모델 풀. 원하는 조건의 모델을 빠르고 정확하게
                  찾아보세요!
                </p>
                <Link
                  href="/models"
                  className="mt-6 inline-flex rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
                >
                  모델 DB 검색하기 →
                </Link>

                <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
                  {["강다민", "이현서", "김호은", "백년", "정규민"].map((name) => (
                    <div key={name} className="rounded-lg bg-white p-2 shadow-sm">
                      <div className="aspect-[3/4] rounded bg-gray-100" />
                      <p className="mt-2 text-xs font-semibold">{name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-16 grid gap-12 md:grid-cols-2 md:items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    광고주의 일들을
                    <br />
                    효율적으로 처리해주는 지원자 관리
                  </h3>
                  <p className="mt-3 text-sm text-brand-muted">
                    캠페인에 필요한 핵심 기능을 모두 모았습니다.
                  </p>
                  <ul className="mt-6 space-y-4 text-sm text-gray-700">
                    <li className="rounded-lg border border-brand-border p-4">
                      <strong>공고별 지원자 관리</strong>
                      <p className="mt-1 text-brand-muted">
                        브랜드 공고 작성 후 역할별 지원 모델을 확인하고 관리
                      </p>
                    </li>
                    <li className="rounded-lg border border-brand-border p-4">
                      <strong>지원자 리스트 분류</strong>
                      <p className="mt-1 text-brand-muted">
                        캠페인별로 그룹 분류하여 한눈에 확인
                      </p>
                    </li>
                    <li className="rounded-lg border border-brand-border p-4">
                      <strong>지원자별 메모 기록</strong>
                      <p className="mt-1 text-brand-muted">
                        미팅 전후 피드백을 모델별로 기록
                      </p>
                    </li>
                  </ul>
                  <Link
                    href="/campaigns"
                    className="mt-6 inline-flex rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
                  >
                    브랜드 공고 보기 →
                  </Link>
                </div>
                <div className="aspect-video rounded-2xl bg-gray-100" />
              </div>
            </div>
          </section>

          <section className="bg-gray-50 px-4 py-16">
            <div className="mx-auto max-w-6xl">
              <h2 className="text-center text-2xl font-bold">AdMatch 이용 후기</h2>
              <div className="mt-10 grid gap-4 md:grid-cols-3">
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

          <section className="px-4 py-16">
            <div className="mx-auto max-w-6xl text-center">
              <h2 className="text-2xl font-bold">함께 성장하는 AdMatch</h2>
              <div className="mt-10 grid gap-6 md:grid-cols-3">
                {[
                  { label: "누적 모델 가입", value: "+ 206% 성장" },
                  { label: "누적 매칭 지원", value: "+ 605% 성장" },
                  { label: "누적 매칭 성사", value: "+ 707% 성장" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-brand-border p-8"
                  >
                    <p className="text-sm text-brand-muted">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold text-brand-primary">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              모델 회원을 위한 커리어 플랫폼
            </h2>
            <p className="mt-4 text-sm text-brand-muted">
              프로필 등록, 브랜드 공고 지원, 매칭 제안까지 한 곳에서 관리하세요.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/campaigns"
                className="rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white"
              >
                공고 지원하기
              </Link>
              <Link
                href="/models"
                className="rounded-full border border-brand-primary px-6 py-3 text-sm font-semibold text-brand-primary"
              >
                내 프로필 관리
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="bg-brand-primary px-4 py-16 text-center text-white">
        <h2 className="text-2xl font-bold">
          지금 바로 AdMatch와 함께
          <br />
          커리어를 만들어 가세요!
        </h2>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-full bg-white px-8 py-3 text-sm font-semibold text-brand-primary"
        >
          로그인 / 회원가입
        </Link>
      </section>
    </>
  );
}
