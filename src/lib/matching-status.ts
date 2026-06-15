export type MatchingStatusValue =
  | "proposing"
  | "negotiating"
  | "completed"
  | "rejected";

export const MATCHING_STATUS_LABEL: Record<MatchingStatusValue, string> = {
  proposing: "제안 보내는 중",
  negotiating: "협상 중",
  completed: "완료됨",
  rejected: "거절됨",
};

export const MATCHING_STATUS_STYLE: Record<MatchingStatusValue, string> = {
  proposing: "bg-[#FFF8E6] text-[#B8860B]",
  negotiating: "bg-[#E8F4FF] text-[#1565C0]",
  completed: "bg-[#E8F9E8] text-[#2E7D32]",
  rejected: "bg-brand-primary-light text-brand-muted",
};

export function getMatchingStatusLabel(status: string) {
  return (
    MATCHING_STATUS_LABEL[status as MatchingStatusValue] ?? status
  );
}

export function getMatchingStatusStyle(status: string) {
  return (
    MATCHING_STATUS_STYLE[status as MatchingStatusValue] ??
    MATCHING_STATUS_STYLE.proposing
  );
}

export function isMatchingActionable(status: string, role?: string | null) {
  return role === "advertiser" && status === "proposing";
}

export function isMatchingChatOpen(status: string) {
  return status === "negotiating" || status === "completed";
}
