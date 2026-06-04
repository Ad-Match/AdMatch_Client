"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { apiFetch } from "@/lib/api";
import type {
  Campaign,
  ChatMessage,
  ChatRoom,
  ModelProfile,
} from "@/lib/types";

type Props = { roomId: string };

export function ChatRoomClient({ roomId }: Props) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [model, setModel] = useState<ModelProfile | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadMessages = useCallback(async () => {
    if (!user) return;
    const data = await apiFetch<ChatMessage[]>(
      `/chats/${roomId}/messages?userId=${user.id}`,
    );
    setMessages(data);
  }, [roomId, user]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const roomData = await apiFetch<ChatRoom>(
        `/chats/${roomId}?userId=${user.id}`,
      );
      setRoom(roomData);
      const [campaignData, modelData] = await Promise.all([
        apiFetch<Campaign>(`/campaigns/${roomData.campaignId}`),
        apiFetch<ModelProfile>(`/models/${roomData.modelId}`),
      ]);
      setCampaign(campaignData);
      setModel(modelData);
      await loadMessages();
    } catch {
      router.push("/chats");
    } finally {
      setLoading(false);
    }
  }, [roomId, user, loadMessages, router]);

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

  useEffect(() => {
    if (!user) return;
    const timer = setInterval(() => {
      void loadMessages();
    }, 3000);
    return () => clearInterval(timer);
  }, [user, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !text.trim()) return;
    setSending(true);
    try {
      await apiFetch(`/chats/${roomId}/messages`, {
        method: "POST",
        body: JSON.stringify({ senderId: user.id, content: text.trim() }),
      });
      setText("");
      await loadMessages();
    } finally {
      setSending(false);
    }
  }

  if (authLoading || loading || !user || !room) {
    return <p className="px-4 py-16 text-center text-brand-muted">불러오는 중...</p>;
  }

  const headerTitle =
    user.role === "advertiser"
      ? model?.name ?? "모델"
      : campaign?.title ?? "브랜드 공고";

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col px-4 py-6">
      <div className="mb-4 flex items-center gap-3 border-b border-brand-border pb-4">
        <Link href="/chats" className="text-sm text-[#070707] hover:underline">
          ← 채팅 목록
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-[#070707]">{headerTitle}</h1>
          <p className="text-xs text-brand-muted">
            {user.role === "advertiser" ? campaign?.title : model?.name}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-brand-border bg-white p-4">
        {messages.map((msg) => {
          const isSystem = msg.senderId === "system";
          const isMine = msg.senderId === user.id;

          if (isSystem) {
            return (
              <p
                key={msg.id}
                className="text-center text-xs text-brand-muted"
              >
                {msg.content}
              </p>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  isMine
                    ? "bg-[#070707] text-white"
                    : "bg-brand-primary-light text-[#070707]"
                }`}
              >
                <p>{msg.content}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    isMine ? "text-neutral-400" : "text-brand-muted"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={onSubmit} className="mt-4 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="메시지를 입력하세요"
          className="flex-1 rounded-full border border-brand-border px-4 py-3 text-sm"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="rounded-full bg-[#070707] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          전송
        </button>
      </form>
    </div>
  );
}
