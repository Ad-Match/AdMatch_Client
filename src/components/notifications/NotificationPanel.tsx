"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  countUnreadImportant,
  getReadNotificationIds,
  loadMatchingNotifications,
  markAllNotificationsRead,
  markNotificationsRead,
  type MatchingNotification,
} from "@/lib/matching-notifications";
import type { User } from "@/lib/types";

type Tab = "important" | "general";

const statusLabel: Record<string, string> = {
  pending: "검토 중",
  accepted: "수락됨",
  rejected: "거절됨",
  cancelled: "취소됨",
};

type Props = {
  user: User;
  open: boolean;
  onClose: () => void;
  onUnreadChange: (count: number) => void;
};

function BellEmpty({ tab }: { tab: Tab }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-5xl">🔔</div>
      <p className="font-semibold text-[#070707]">
        {tab === "important" ? "중요 알림이 없어요" : "일반 알림이 없어요"}
      </p>
      <p className="mt-2 text-sm text-brand-muted">
        새로운 매칭 제안이나 업데이트가 있으면 바로 알려드릴게요!
      </p>
    </div>
  );
}

export function NotificationPanel({
  user,
  open,
  onClose,
  onUnreadChange,
}: Props) {
  const [tab, setTab] = useState<Tab>("important");
  const [important, setImportant] = useState<MatchingNotification[]>([]);
  const [general, setGeneral] = useState<MatchingNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await loadMatchingNotifications(user);
      setImportant(data.important);
      setGeneral(data.general);
      onUnreadChange(countUnreadImportant(data.important));
    } finally {
      setLoading(false);
    }
  }, [user, onUnreadChange]);

  useEffect(() => {
    if (open && user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- load on panel open
      void refresh();
    }
  }, [open, user, refresh]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function handleAction(
    matchingId: string,
    status: "accepted" | "rejected",
  ) {
    setActingId(matchingId);
    try {
      await apiFetch(`/matchings/${matchingId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      markNotificationsRead([matchingId]);
      await refresh();
    } finally {
      setActingId(null);
    }
  }

  function handleReadAll() {
    markAllNotificationsRead([...important, ...general]);
    onUnreadChange(0);
  }

  function handleOpenItem(item: MatchingNotification) {
    markNotificationsRead([item.matchingId]);
    onUnreadChange(
      countUnreadImportant(important.filter((n) => n.matchingId !== item.matchingId)),
    );
  }

  if (!open) return null;

  const list = tab === "important" ? important : general;
  const read = getReadNotificationIds();

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/40">
      <div className="flex h-full w-full max-w-md flex-col bg-[#FAF6F9] shadow-xl">
        <header className="flex items-center justify-between border-b border-brand-border bg-white px-4 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-[#070707] hover:bg-brand-primary-light"
            aria-label="닫기"
          >
            ‹
          </button>
          <h2 className="text-base font-bold text-[#070707]">알림</h2>
          <button
            type="button"
            onClick={handleReadAll}
            className="rounded-lg bg-brand-primary-light px-3 py-1.5 text-xs font-semibold text-[#070707]"
          >
            모두읽음
          </button>
        </header>

        <div className="border-b border-brand-border bg-white px-4 py-3">
          <div className="flex rounded-full bg-brand-primary-light p-1">
            <button
              type="button"
              onClick={() => setTab("important")}
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
                tab === "important"
                  ? "border border-[#070707] bg-white text-[#070707]"
                  : "text-brand-muted"
              }`}
            >
              중요 알림
            </button>
            <button
              type="button"
              onClick={() => setTab("general")}
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
                tab === "general"
                  ? "border border-[#070707] bg-white text-[#070707]"
                  : "text-brand-muted"
              }`}
            >
              일반 알림
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="py-12 text-center text-sm text-brand-muted">
              불러오는 중...
            </p>
          ) : list.length === 0 ? (
            <BellEmpty tab={tab} />
          ) : (
            <ul className="space-y-3">
              {list.map((item) => {
                const unread = !read.has(item.matchingId);
                return (
                  <li
                    key={item.matchingId}
                    className={`rounded-2xl border bg-white p-4 ${
                      unread ? "border-[#070707]" : "border-brand-border"
                    }`}
                    onClick={() => handleOpenItem(item)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-[#070707]">
                        {user.role === "advertiser"
                          ? `${item.modelName ?? "모델"}님의 지원`
                          : item.campaignTitle ?? "브랜드 공고"}
                      </p>
                      {unread && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#070707]" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-brand-muted">
                      {user.role === "advertiser"
                        ? item.campaignTitle
                        : `적합도 ${item.score}점 · ${statusLabel[item.status]}`}
                    </p>
                    {item.message && (
                      <p className="mt-2 text-sm text-gray-600">{item.message}</p>
                    )}
                    <p className="mt-2 text-[10px] text-brand-muted">
                      {new Date(item.createdAt).toLocaleString("ko-KR")}
                    </p>

                    {item.actionable && tab === "important" && (
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          disabled={actingId === item.matchingId}
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleAction(item.matchingId, "accepted");
                          }}
                          className="flex-1 rounded-full bg-[#070707] py-2 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          수락
                        </button>
                        <button
                          type="button"
                          disabled={actingId === item.matchingId}
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleAction(item.matchingId, "rejected");
                          }}
                          className="flex-1 rounded-full border border-brand-border py-2 text-xs font-semibold text-[#070707] disabled:opacity-50"
                        >
                          거절
                        </button>
                      </div>
                    )}

                    {item.status === "accepted" && (
                      <Link
                        href="/chats"
                        onClick={onClose}
                        className="mt-3 inline-block text-xs font-semibold text-[#070707] underline"
                      >
                        채팅방으로 이동 →
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
