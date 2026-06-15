"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import {
  countUnread,
  loadNotifications,
} from "@/lib/matching-notifications";

function BellIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const data = await loadNotifications(user);
      setUnreadCount(countUnread(data));
    } catch {
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    void refreshUnread();
    const timer = setInterval(() => void refreshUnread(), 15000);
    return () => clearInterval(timer);
  }, [refreshUnread]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const showModelsNav = user?.role === "advertiser";
  const showCampaignsNav = Boolean(user);
  const showServiceIntro = !user;

  const navLinkClass = (active: boolean) =>
    `text-sm font-medium ${active ? "text-brand-primary" : "text-gray-700"}`;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-brand-border bg-[#FAF6F9]/95 backdrop-blur">
        <div className="relative mx-auto flex h-16 max-w-6xl items-center px-4">
          <Link
            href="/"
            className="z-10 shrink-0 text-xl font-bold tracking-tight text-brand-primary"
          >
            AdMatch
          </Link>

          <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-6 whitespace-nowrap md:flex">
            {showModelsNav && (
              <Link
                href="/models"
                className={navLinkClass(pathname.startsWith("/models"))}
              >
                모델 찾기
              </Link>
            )}
            {showCampaignsNav && (
              <Link
                href="/campaigns"
                className={navLinkClass(pathname.startsWith("/campaigns"))}
              >
                브랜드 공고
              </Link>
            )}
            {showServiceIntro && (
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
            )}
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

          <div className="z-10 ml-auto flex shrink-0 items-center justify-end gap-2 sm:gap-3">
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
                <span
                  className="hidden max-w-[140px] truncate text-sm text-brand-muted lg:inline"
                  title={`${user.name} (${user.role === "advertiser" ? "광고주" : "모델"})`}
                >
                  {user.name} ({user.role === "advertiser" ? "광고주" : "모델"})
                </span>
                <button
                  onClick={logout}
                  className="hidden rounded-full border border-brand-border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white sm:inline-flex"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-brand-primary px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary-light sm:px-5"
              >
                로그인
              </Link>
            )}
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-border md:hidden"
              aria-label="메뉴"
              onClick={() => setMobileOpen((v) => !v)}
            >
              ☰
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-brand-border bg-[#FAF6F9] px-4 py-4 md:hidden">
            <div className="flex flex-col gap-2 text-sm font-medium">
              {showServiceIntro && (
                <Link href="/" className="rounded-lg px-3 py-2 hover:bg-white">
                  서비스 소개
                </Link>
              )}
              {showModelsNav && (
                <Link href="/models" className="rounded-lg px-3 py-2 hover:bg-white">
                  모델 찾기
                </Link>
              )}
              {showCampaignsNav && (
                <Link href="/campaigns" className="rounded-lg px-3 py-2 hover:bg-white">
                  브랜드 공고
                </Link>
              )}
              {user && (
                <>
                  <Link href="/chats" className="rounded-lg px-3 py-2 hover:bg-white">
                    채팅
                  </Link>
                  <Link href="/mypage" className="rounded-lg px-3 py-2 hover:bg-white">
                    마이페이지
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-lg px-3 py-2 text-left text-brand-muted hover:bg-white"
                  >
                    로그아웃
                  </button>
                </>
              )}
              {!user && (
                <Link href="/register" className="rounded-lg px-3 py-2 hover:bg-white">
                  회원가입
                </Link>
              )}
            </div>
          </div>
        )}
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
