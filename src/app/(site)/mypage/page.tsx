"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/auth/AuthGate";
import { useAuth } from "@/context/AuthProvider";
import { apiFetch } from "@/lib/api";
import { loadMatchingHistory } from "@/lib/matching-notifications";
import { initialsFromName } from "@/lib/format";
import type { MatchingWithCampaign, ModelProfile } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  pending: "검토 중",
  accepted: "매칭 완료",
  rejected: "거절됨",
  cancelled: "취소됨",
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-[#FFF8E6] text-[#B8860B]",
  accepted: "bg-[#E8F9E8] text-[#2E7D32]",
  rejected: "bg-brand-primary-light text-brand-muted",
  cancelled: "bg-brand-primary-light text-brand-muted",
};

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 18l6-6-6-6"
        stroke="#ADB1BA"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuRow({
  href,
  icon,
  label,
  sub,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  sub?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-brand-primary-light/60"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary-light text-base">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#070707]">{label}</p>
        {sub && <p className="text-xs text-brand-muted">{sub}</p>}
      </div>
      <ChevronRight />
    </Link>
  );
}

function MatchingHistorySection() {
  const { user } = useAuth();
  const [items, setItems] = useState<MatchingWithCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await loadMatchingHistory(user);
      setItems(data.slice(0, 5));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-3 px-5 py-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-brand-primary-light" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-5 py-8 text-center">
        <p className="text-sm text-brand-muted">
          {user?.role === "advertiser"
            ? "아직 보낸 매칭 제안이 없어요"
            : "아직 지원한 공고가 없어요"}
        </p>
        <Link
          href={user?.role === "advertiser" ? "/models" : "/campaigns"}
          className="mt-4 inline-block rounded-full bg-[#070707] px-4 py-2 text-sm font-semibold text-white"
        >
          {user?.role === "advertiser" ? "모델 찾아보기" : "공고 둘러보기"}
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-brand-border">
      {items.map((m) => (
        <div key={m.id} className="px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                STATUS_STYLE[m.status] ?? STATUS_STYLE.pending
              }`}
            >
              {STATUS_LABEL[m.status] ?? m.status}
            </span>
            <span className="text-[11px] text-brand-muted">
              {new Date(m.createdAt).toLocaleDateString("ko-KR")}
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-[#070707]">
            {m.campaign?.title ?? "브랜드 공고"}
          </p>
          <p className="mt-0.5 text-xs text-brand-muted">
            {user?.role === "advertiser"
              ? `모델 · ${m.modelName ?? m.modelId.slice(0, 8)}`
              : `${m.campaign?.category ?? "카테고리"} · ${m.campaign?.pay ?? ""}`}
          </p>
          <div className="mt-3 flex gap-2">
            <Link
              href={`/campaigns/${m.campaignId}`}
              className="rounded-full border border-brand-border px-3 py-1.5 text-xs font-semibold text-[#070707]"
            >
              공고 보기
            </Link>
            {m.status === "accepted" && m.chatRoomId && (
              <Link
                href={`/chats/${m.chatRoomId}`}
                className="rounded-full bg-[#070707] px-3 py-1.5 text-xs font-semibold text-white"
              >
                채팅하기
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function MyPageContent() {
  const { user, logout } = useAuth();
  const [modelProfile, setModelProfile] = useState<ModelProfile | null>(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0 });

  const loadProfile = useCallback(async () => {
    if (!user || user.role !== "model") return;
    try {
      const profile = await apiFetch<ModelProfile>(`/models/user/${user.id}`);
      setModelProfile(profile);
    } catch {
      setModelProfile(null);
    }
  }, [user]);

  const loadStats = useCallback(async () => {
    if (!user) return;
    try {
      const data = await loadMatchingHistory(user);
      setStats({
        total: data.length,
        pending: data.filter((m) => m.status === "pending").length,
        accepted: data.filter((m) => m.status === "accepted").length,
      });
    } catch {
      setStats({ total: 0, pending: 0, accepted: 0 });
    }
  }, [user]);

  useEffect(() => {
    void loadProfile();
    void loadStats();
  }, [loadProfile, loadStats]);

  const roleLabel = user?.role === "advertiser" ? "광고주" : "모델";
  const avatarInitial = initialsFromName(user?.name ?? "?");

  const quickMenus = useMemo(() => {
    if (user?.role === "advertiser") {
      return [
        { href: "/models", icon: "🔍", label: "모델 찾기" },
        { href: "/campaigns/new", icon: "✏️", label: "공고 등록" },
        { href: "/campaigns", icon: "📋", label: "내 공고" },
        { href: "/chats", icon: "💬", label: "채팅" },
      ];
    }
    return [
      { href: "/campaigns", icon: "📋", label: "공고 탐색" },
      { href: "/models/profile", icon: "👤", label: "내 프로필" },
      { href: "/campaigns/applications", icon: "📦", label: "지원 내역" },
      { href: "/chats", icon: "💬", label: "채팅" },
    ];
  }, [user?.role]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-[#070707]">마이페이지</h1>

      {/* 프로필 + 활동 요약 */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm">
        <div className="bg-gradient-to-r from-brand-primary-light via-white to-brand-primary-light px-6 py-6">
          <div className="flex flex-wrap items-center gap-4">
            {modelProfile?.profileImageUrl ? (
              <img
                src={modelProfile.profileImageUrl}
                alt={user?.name ?? ""}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-white"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#070707] text-xl font-bold text-white">
                {avatarInitial}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xl font-bold text-[#070707]">{user?.name}</p>
                <span className="rounded-full bg-[#070707]/10 px-2 py-0.5 text-[11px] font-bold text-[#070707]">
                  {roleLabel}
                </span>
                <Link
                  href="/mypage/edit"
                  className="rounded-full border border-brand-border px-3 py-1 text-xs font-semibold text-[#070707] transition hover:bg-white"
                >
                  프로필 편집
                </Link>
              </div>
              <p className="mt-1 truncate text-sm text-brand-muted">{user?.email}</p>
              {modelProfile && (
                <p className="mt-1 text-xs text-brand-muted">
                  {modelProfile.age} · {modelProfile.body}
                  {modelProfile.verified && " · ✓ 인증"}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-md">
            {[
              { label: "전체", value: stats.total },
              { label: "진행 중", value: stats.pending },
              { label: "매칭 완료", value: stats.accepted },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-brand-border bg-white px-3 py-3 text-center"
              >
                <p className="text-lg font-bold text-[#070707]">{item.value}</p>
                <p className="text-[11px] text-brand-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 퀵 메뉴 */}
        <div className="grid grid-cols-2 gap-1 border-t border-brand-border p-4 sm:grid-cols-4">
          {quickMenus.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 transition hover:bg-brand-primary-light"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary-light text-lg">
                {item.icon}
              </span>
              <span className="text-[11px] font-medium text-[#070707]">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 최근 활동 */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-brand-border px-5 py-4">
          <h2 className="text-base font-bold text-[#070707]">
            {user?.role === "advertiser" ? "최근 매칭 제안" : "최근 지원 내역"}
          </h2>
          <Link
            href="/campaigns/applications"
            className="text-xs font-semibold text-brand-muted hover:text-[#070707]"
          >
            전체보기
          </Link>
        </div>
        <MatchingHistorySection />
      </section>

      {/* 내 계정 메뉴 */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm">
        <div className="border-b border-brand-border px-5 py-4">
          <h2 className="text-base font-bold text-[#070707]">내 계정</h2>
        </div>
        <div className="divide-y divide-brand-border">
          <MenuRow
            href="/mypage/edit"
            icon="✏️"
            label="프로필 편집"
            sub={
              user?.role === "model"
                ? "계정 정보 · 모델 프로필 수정"
                : "이름 · 비밀번호 수정"
            }
          />
          {user?.role === "model" && (
            <MenuRow
              href="/models/profile"
              icon="📸"
              label="모델 프로필 관리"
              sub="사진, 태그, 신체 정보 수정"
            />
          )}
          {user?.role === "advertiser" && (
            <>
              <MenuRow
                href="/campaigns/new"
                icon="➕"
                label="새 공고 등록"
                sub="브랜드 캠페인 모집"
              />
              <MenuRow
                href="/models"
                icon="🎯"
                label="모델 추천 받기"
                sub="태그 기반 매칭"
              />
            </>
          )}
          <MenuRow
            href="/chats"
            icon="💬"
            label="채팅 목록"
            sub="매칭된 상대와 대화"
          />
          <MenuRow
            href="/campaigns/applications"
            icon="📋"
            label={user?.role === "advertiser" ? "제안·지원 관리" : "지원 현황"}
            sub="상태 확인 및 관리"
          />
        </div>
      </section>

      <div className="mt-6">
        <button
          type="button"
          onClick={logout}
          className="w-full rounded-2xl border border-brand-border bg-white py-3.5 text-sm font-semibold text-brand-muted transition hover:bg-brand-primary-light"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}

export default function MyPage() {
  return (
    <AuthGate>
      <MyPageContent />
    </AuthGate>
  );
}
