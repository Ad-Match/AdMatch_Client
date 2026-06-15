"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatAvatar } from "@/components/chat/ChatAvatar";
import { useAuth } from "@/context/AuthProvider";
import { ApiError, apiFetch } from "@/lib/api";
import { parseApiErrorMessage } from "@/lib/api-errors";
import { formatRelativeTime } from "@/lib/format";
import type { Campaign, ChatRoom, ChatRoomSummary, ModelProfile } from "@/lib/types";

export function ChatListClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<ChatRoomSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const list = await apiFetch<ChatRoom[]>(`/chats`);
      const enriched = await Promise.all(
        list.map(async (room): Promise<ChatRoomSummary & { modelImageUrl?: string }> => {
          try {
            const [campaign, model, messages] = await Promise.all([
              apiFetch<Campaign>(`/campaigns/${room.campaignId}`),
              apiFetch<ModelProfile>(`/models/${room.modelId}`),
              apiFetch<Array<{ content: string }>>(
                `/chats/${room.id}/messages`,
              ),
            ]);
            const last = messages[messages.length - 1];
            return {
              ...room,
              campaignTitle: campaign.title,
              modelName: model.name,
              modelImageUrl: model.profileImageUrl,
              lastMessage: last?.content,
            };
          } catch {
            return { ...room };
          }
        }),
      );
      enriched.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
      setRooms(enriched);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status >= 500 || err.status === 502
            ? "채팅 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요."
            : parseApiErrorMessage(err),
        );
      } else {
        setError("채팅 목록을 불러오지 못했습니다.");
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on auth ready
      void load();
    }
  }, [user, authLoading, router, load]);

  if (authLoading || loading) {
    return (
      <p className="px-4 py-16 text-center text-brand-muted">불러오는 중...</p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-[#070707]">채팅</h1>
      <p className="mt-1 text-sm text-brand-muted">
        매칭이 수락된 공고에 대해 광고주와 모델이 대화할 수 있습니다.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {rooms.length === 0 && !error && (
          <div className="rounded-2xl border border-brand-border bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-semibold text-[#070707]">
              아직 채팅방이 없습니다.
            </p>
            <p className="mt-2 text-sm text-brand-muted">
              {user?.role === "model"
                ? "공고에 지원하고 매칭이 수락되면 채팅이 열립니다."
                : "모델에게 제안하고 수락되면 채팅이 열립니다."}
            </p>
            <Link
              href={user?.role === "model" ? "/campaigns" : "/models"}
              className="mt-5 inline-block rounded-full bg-[#070707] px-5 py-2.5 text-sm font-semibold text-white"
            >
              {user?.role === "model" ? "공고 둘러보기" : "모델 찾아보기"}
            </Link>
          </div>
        )}

        {rooms.map((room) => {
          const isAdvertiser = user?.role === "advertiser";
          const title = isAdvertiser
            ? room.modelName ?? "모델"
            : room.campaignTitle ?? "브랜드 공고";
          const subtitle = isAdvertiser
            ? room.campaignTitle
            : room.modelName;
          const avatarName = isAdvertiser
            ? room.modelName ?? "모"
            : room.campaignTitle ?? "공";
          const modelImageUrl = (room as ChatRoomSummary & { modelImageUrl?: string })
            .modelImageUrl;

          return (
            <Link
              key={room.id}
              href={`/chats/${room.id}`}
              className="flex items-center gap-4 rounded-2xl border border-brand-border bg-white p-4 shadow-sm transition hover:border-[#070707]"
            >
              <ChatAvatar
                name={avatarName}
                imageUrl={isAdvertiser ? modelImageUrl : undefined}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate font-semibold text-[#070707]">{title}</p>
                  <span className="shrink-0 text-xs text-brand-muted">
                    {formatRelativeTime(room.updatedAt)}
                  </span>
                </div>
                {subtitle && (
                  <p className="mt-0.5 truncate text-xs text-brand-muted">
                    {subtitle}
                  </p>
                )}
                {room.lastMessage && (
                  <p className="mt-1.5 line-clamp-1 text-sm text-brand-muted">
                    {room.lastMessage}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
