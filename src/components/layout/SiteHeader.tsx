"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { NavDropdown } from "@/components/layout/NavDropdown";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import {
  countUnreadImportant,
  loadMatchingNotifications,
} from "@/lib/matching-notifications";

function BellIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const data = await loadMatchingNotifications(user);
      setUnreadCount(countUnreadImportant(data.important));
    } catch {
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- poll unread badge
    void refreshUnread();
    const timer = setInterval(() => {
      void refreshUnread();
    }, 15000);
    return () => clearInterval(timer);
  }, [refreshUnread]);

  const modelNavItems = [
    { href: "/models", label: "모델 리스트" },
    { href: "/models/profile", label: "프로필 관리" },
  ];

  const campaignNavItems = [
    { href: "/campaigns", label: "공고 리스트" },
    {
      href: "/campaigns/applications",
      label:
        user?.role === "advertiser" ? "매칭 제안 내역" : "공고 지원 내역",
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-brand-border bg-[#FAF6F9]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-brand-primary"
          >
            AdMatch
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <NavDropdown
              label="모델 검색"
              href="/models"
              items={modelNavItems}
            />
            <NavDropdown
              label="브랜드 공고"
              href="/campaigns"
              items={campaignNavItems}
            />
            <Link
              href="/"
              className={`text-sm font-medium transition ${
                pathname === "/"
                  ? "text-brand-primary"
                  : "text-gray-700 hover:text-brand-primary"
              }`}
            >
              서비스 소개
            </Link>
            {user && (
              <>
                <Link
                  href="/chats"
                  className={`text-sm font-medium transition ${
                    pathname.startsWith("/chats")
                      ? "text-brand-primary"
                      : "text-gray-700 hover:text-brand-primary"
                  }`}
                >
                  채팅
                </Link>
                <Link
                  href="/mypage"
                  className={`text-sm font-medium transition ${
                    pathname.startsWith("/mypage")
                      ? "text-brand-primary"
                      : "text-gray-700 hover:text-brand-primary"
                  }`}
                >
                  마이페이지
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => setNotifyOpen(true)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#070707] transition hover:bg-white"
                  aria-label="알림"
                >
                  <BellIcon />
                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#070707] px-1 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                <span className="hidden text-sm text-brand-muted sm:inline">
                  {user.name} ({user.role === "advertiser" ? "광고주" : "모델"})
                </span>
                <button
                  onClick={logout}
                  className="rounded-full border border-brand-border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-brand-primary px-5 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary-light"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </header>

      {user && (
        <NotificationPanel
          user={user}
          open={notifyOpen}
          onClose={() => {
            setNotifyOpen(false);
            void refreshUnread();
          }}
          onUnreadChange={setUnreadCount}
        />
      )}
    </>
  );
}
