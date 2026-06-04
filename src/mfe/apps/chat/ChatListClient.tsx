"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { ApiError, apiFetch } from "@/lib/api";
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
      const list = await apiFetch<ChatRoom[]>(`/chats?userId=${user.id}`);
      const enriched = await Promise.all(
        list.map(async (room): Promise<ChatRoomSummary> => {
          try {
            const [campaign, model, messages] = await Promise.all([
              apiFetch<Campaign>(`/campaigns/${room.campaignId}`),
              apiFetch<ModelProfile>(`/models/${room.modelId}`),
              apiFetch<Array<{ content: string }>>(
                `/chats/${room.id}/messages?userId=${user.id}`,
              ),
            ]);
            const last = messages[messages.length - 1];
            return {
              ...room,
              campaignTitle: campaign.title,
              modelName: model.name,
              lastMessage: last?.content,
            };
          } catch {
            return { ...room };
          }
        }),
      );
      setRooms(enriched);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status >= 500 || err.status === 502
            ? "채팅 서버에 연결할 수 없습니다. backend에서 npm run start:msa 로 chat-service(4005)가 실행 중인지, admatch_chat DB가 생성됐는지 확인해 주세요."
            : "채팅 목록을 불러오지 못했습니다.",
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
    return <p className="px-4 py-16 text-center text-brand-muted">불러오는 중...</p>;
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

      <div className="mt-6 space-y-2">
        {rooms.length === 0 && !error && (
          <div className="rounded-xl border border-brand-border bg-white p-8 text-center">
            <p className="text-sm text-brand-muted">아직 채팅방이 없습니다.</p>
            <p className="mt-2 text-xs text-brand-muted">
              모델: 공고 지원 → 광고주 수락 시 채팅이 열립니다.
            </p>
          </div>
        )}
        {rooms.map((room) => {
          const title =
            user?.role === "advertiser"
              ? room.modelName ?? "모델"
              : room.campaignTitle ?? "브랜드 공고";
          const subtitle =
            user?.role === "advertiser"
              ? room.campaignTitle
              : room.modelName;

          return (
            <Link
              key={room.id}
              href={`/chats/${room.id}`}
              className="block rounded-xl border border-brand-border bg-white p-4 transition hover:border-[#070707]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#070707]">{title}</p>
                  {subtitle && (
                    <p className="mt-0.5 text-xs text-brand-muted">{subtitle}</p>
                  )}
                  {room.lastMessage && (
                    <p className="mt-2 line-clamp-1 text-sm text-brand-muted">
                      {room.lastMessage}
                    </p>
                  )}
                </div>
                <span className="text-xs text-brand-muted">
                  {new Date(room.updatedAt).toLocaleDateString("ko-KR")}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
