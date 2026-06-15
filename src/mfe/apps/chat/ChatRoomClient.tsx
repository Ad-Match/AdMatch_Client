"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatAvatar } from "@/components/chat/ChatAvatar";
import { DepositPaymentModal } from "@/components/chat/DepositPaymentModal";
import { MatchingRatingCard } from "@/components/chat/MatchingRatingCard";
import {
  ADVERTISER_QUICK_REPLIES,
  MODEL_QUICK_REPLIES,
  QuickReplyChips,
} from "@/components/chat/QuickReplyChips";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { apiFetch } from "@/lib/api";
import { formatMessageTime } from "@/lib/format";
import { getMatchingStatusLabel } from "@/lib/matching-status";
import type {
  Campaign,
  ChatMessage,
  ChatRoom,
  Matching,
  MatchingReview,
  ModelProfile,
} from "@/lib/types";

type Props = { roomId: string };

function parseDepositPreview(pay: string) {
  const digits = pay.replace(/[^\d]/g, "");
  const parsed = Number.parseInt(digits, 10);
  if (!parsed || Number.isNaN(parsed)) {
    return 100_000;
  }
  if (pay.includes("만")) {
    return Math.round(parsed * 10_000 * 0.3);
  }
  return Math.round(parsed * 0.3);
}

export function ChatRoomClient({ roomId }: Props) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [matching, setMatching] = useState<Matching | null>(null);
  const [reviews, setReviews] = useState<MatchingReview[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [model, setModel] = useState<ModelProfile | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const loadMessages = useCallback(async () => {
    if (!user) return;
    const data = await apiFetch<ChatMessage[]>(`/chats/${roomId}/messages`);
    setMessages(data);
  }, [roomId, user]);

  const loadMatchingData = useCallback(
    async (matchingId: string) => {
      const [matchingData, reviewData] = await Promise.all([
        apiFetch<Matching>(`/matchings/${matchingId}`),
        apiFetch<MatchingReview[]>(`/matchings/${matchingId}/reviews`).catch(
          () => [] as MatchingReview[],
        ),
      ]);
      setMatching(matchingData);
      setReviews(reviewData);
    },
    [],
  );

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const roomData = await apiFetch<ChatRoom>(`/chats/${roomId}`);
      setRoom(roomData);
      const [campaignData, modelData] = await Promise.all([
        apiFetch<Campaign>(`/campaigns/${roomData.campaignId}`),
        apiFetch<ModelProfile>(`/models/${roomData.modelId}`),
      ]);
      setCampaign(campaignData);
      setModel(modelData);
      await loadMatchingData(roomData.matchingId);
      await loadMessages();
    } catch {
      router.push("/chats");
    } finally {
      setLoading(false);
    }
  }, [roomId, user, loadMessages, loadMatchingData, router]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
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

  async function sendMessage(content: string) {
    if (!user || !content.trim()) return;
    setSending(true);
    try {
      await apiFetch(`/chats/${roomId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: content.trim() }),
      });
      setText("");
      await loadMessages();
    } catch {
      showToast("메시지 전송에 실패했습니다.", "error");
    } finally {
      setSending(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await sendMessage(text);
  }

  async function handleComplete() {
    if (!matching) return;
    setCompleteLoading(true);
    try {
      const updated = await apiFetch<Matching>(
        `/matchings/${matching.id}/complete`,
        { method: "PATCH" },
      );
      setMatching(updated);
      await loadMessages();
      if (updated.status === "completed") {
        showToast("거래가 완료되었습니다. 평점을 남겨 주세요.", "success");
        await loadMatchingData(matching.id);
      } else {
        showToast("완료 확인을 남겼습니다.", "success");
      }
    } catch {
      showToast("완료 처리에 실패했습니다.", "error");
    } finally {
      setCompleteLoading(false);
    }
  }

  async function handleDeposit() {
    if (!matching) return;
    setDepositLoading(true);
    try {
      const updated = await apiFetch<Matching>(
        `/matchings/${matching.id}/deposit/mock`,
        { method: "POST" },
      );
      setMatching(updated);
      setDepositOpen(false);
      await loadMessages();
      showToast("계약금 결제가 완료되었습니다. (모의 결제)", "success");
    } catch {
      showToast("계약금 결제에 실패했습니다.", "error");
    } finally {
      setDepositLoading(false);
    }
  }

  async function handleReviewSubmit(rating: number, comment: string) {
    if (!matching) return;
    setReviewSubmitting(true);
    try {
      await apiFetch(`/matchings/${matching.id}/reviews`, {
        method: "POST",
        body: JSON.stringify({ rating, comment: comment || undefined }),
      });
      await loadMatchingData(matching.id);
      showToast("평점이 등록되었습니다.", "success");
    } catch {
      showToast("평점 등록에 실패했습니다.", "error");
    } finally {
      setReviewSubmitting(false);
    }
  }

  if (authLoading || loading || !user || !room) {
    return (
      <p className="px-4 py-16 text-center text-brand-muted">불러오는 중...</p>
    );
  }

  const isAdvertiser = user.role === "advertiser";
  const partnerName = isAdvertiser
    ? model?.name ?? "모델"
    : campaign?.title ?? "브랜드 공고";
  const myCompleted = isAdvertiser
    ? matching?.advertiserCompleted
    : matching?.modelCompleted;
  const showQuickReplies = matching?.status === "negotiating";
  const showActions = matching?.status === "negotiating";
  const showRating = matching?.status === "completed";
  const myReview = reviews.find((r) => r.reviewerUserId === user.id);
  const depositPreview = campaign ? parseDepositPreview(campaign.pay) : 100_000;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/chats" className="text-sm text-[#070707] hover:underline">
        ← 채팅 목록
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ChatAvatar
            name={partnerName}
            imageUrl={isAdvertiser ? model?.profileImageUrl : undefined}
            size="lg"
          />
          <div>
            <h1 className="text-xl font-bold text-[#070707]">{partnerName}</h1>
            <p className="text-sm text-brand-muted">
              {isAdvertiser ? campaign?.title : model?.name}
            </p>
            {matching && (
              <p className="mt-0.5 text-xs font-semibold text-brand-primary">
                {getMatchingStatusLabel(matching.status)}
              </p>
            )}
          </div>
        </div>
        {campaign && (
          <Link
            href={`/campaigns/${campaign.id}`}
            className="rounded-full border border-brand-border px-4 py-2 text-sm font-semibold text-[#070707] hover:bg-brand-primary-light"
          >
            공고 보기
          </Link>
        )}
      </div>

      {campaign && (
        <div className="mt-4 rounded-xl border border-brand-border bg-white px-4 py-3 text-sm text-brand-muted">
          <span className="font-semibold text-[#070707]">{campaign.title}</span>
          {" · "}
          {campaign.category} · {campaign.pay}
          {matching?.depositPaidAt && matching.depositAmount && (
            <>
              {" · "}
              <span className="font-semibold text-[#070707]">
                계약금 {matching.depositAmount.toLocaleString("ko-KR")}원 결제됨
              </span>
            </>
          )}
        </div>
      )}

      {showActions && matching && (
        <div className="mt-4 flex flex-wrap gap-2">
          {isAdvertiser && !matching.depositPaidAt && (
            <button
              type="button"
              onClick={() => setDepositOpen(true)}
              className="rounded-full border border-brand-border bg-white px-4 py-2 text-sm font-semibold text-[#070707] hover:bg-brand-primary-light"
            >
              계약금 지불하기
            </button>
          )}
          <button
            type="button"
            disabled={completeLoading || myCompleted}
            onClick={() => void handleComplete()}
            className="rounded-full bg-[#070707] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {myCompleted ? "완료 확인됨" : "거래 완료"}
          </button>
        </div>
      )}

      {showRating && matching && (
        <div className="mt-4">
          <MatchingRatingCard
            partnerName={partnerName}
            myReview={myReview}
            submitting={reviewSubmitting}
            onSubmit={(rating, comment) => void handleReviewSubmit(rating, comment)}
          />
        </div>
      )}

      <div className="mt-6 flex min-h-[420px] flex-col rounded-2xl border border-brand-border bg-white shadow-sm">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && (
            <p className="py-8 text-center text-sm text-brand-muted">
              협상이 시작되었습니다. 첫 메시지를 보내보세요.
            </p>
          )}

          {messages.map((msg, index) => {
            const isSystem = msg.senderId === "system";
            const isMine = msg.senderId === user.id;
            const prev = messages[index - 1];
            const showDate =
              !prev ||
              new Date(prev.createdAt).toDateString() !==
                new Date(msg.createdAt).toDateString();

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
              <div key={msg.id}>
                {showDate && (
                  <p className="mb-4 text-center text-xs text-brand-muted">
                    {new Date(msg.createdAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
                <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] ${isMine ? "text-right" : ""}`}>
                    <div
                      className={`inline-block rounded-2xl px-4 py-2.5 text-sm ${
                        isMine
                          ? "bg-[#070707] text-white"
                          : "bg-brand-primary-light text-[#070707]"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                    <p className="mt-1 text-[10px] text-brand-muted">
                      {formatMessageTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {showQuickReplies && (
          <QuickReplyChips
            labels={isAdvertiser ? ADVERTISER_QUICK_REPLIES : MODEL_QUICK_REPLIES}
            disabled={sending}
            onSelect={(label) => void sendMessage(label)}
          />
        )}

        <form
          onSubmit={onSubmit}
          className="flex gap-2 border-t border-brand-border p-4"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="메시지를 입력하세요"
            className="flex-1 rounded-full border border-brand-border px-4 py-2.5 text-sm"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="rounded-full bg-[#070707] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            전송
          </button>
        </form>
      </div>

      <DepositPaymentModal
        open={depositOpen}
        amount={depositPreview}
        onClose={() => setDepositOpen(false)}
        onConfirm={() => void handleDeposit()}
        loading={depositLoading}
      />
    </div>
  );
}
