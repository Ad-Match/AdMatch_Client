"use client";

import { FormEvent, useState } from "react";
import { StarRating } from "@/components/profile/StarRating";
import type { MatchingReview } from "@/lib/types";

type Props = {
  partnerName: string;
  myReview?: MatchingReview;
  submitting?: boolean;
  onSubmit: (rating: number, comment: string) => void;
};

export function MatchingRatingCard({
  partnerName,
  myReview,
  submitting,
  onSubmit,
}: Props) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(rating, comment.trim());
  }

  if (myReview) {
    return (
      <div className="rounded-xl border border-brand-border bg-brand-primary-light px-4 py-3 text-sm">
        <p className="font-semibold text-[#070707]">평점을 남겨주셔서 감사합니다</p>
        <div className="mt-2 flex items-center gap-2">
          <StarRating value={myReview.rating} size="sm" />
          <span className="text-brand-muted">{myReview.rating}점</span>
        </div>
        {myReview.comment && (
          <p className="mt-2 text-brand-muted">{myReview.comment}</p>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-brand-border bg-white px-4 py-4"
    >
      <p className="text-sm font-semibold text-[#070707]">
        {partnerName}님과의 거래는 어떠셨나요?
      </p>
      <p className="mt-1 text-xs text-brand-muted">
        완료된 매칭에만 평점을 남길 수 있습니다.
      </p>
      <div className="mt-3">
        <StarRating value={rating} onChange={setRating} size="md" />
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="한 줄 후기 (선택)"
        rows={2}
        className="mt-3 w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={submitting}
        className="mt-3 w-full rounded-full bg-[#070707] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {submitting ? "등록 중..." : "평점 남기기"}
      </button>
    </form>
  );
}
