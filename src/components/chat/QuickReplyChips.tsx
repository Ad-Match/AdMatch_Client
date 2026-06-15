"use client";

type Props = {
  labels: string[];
  disabled?: boolean;
  onSelect: (label: string) => void;
};

export function QuickReplyChips({ labels, disabled, onSelect }: Props) {
  if (labels.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto border-t border-brand-border px-4 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {labels.map((label) => (
        <button
          key={label}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(label)}
          className="shrink-0 rounded-full border border-brand-border bg-white px-3 py-1.5 text-xs font-medium text-[#070707] transition hover:border-[#070707] hover:bg-brand-primary-light disabled:cursor-not-allowed disabled:opacity-50"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export const ADVERTISER_QUICK_REPLIES = [
  "일정 공유드립니다",
  "세부 조건 전달드립니다",
  "검토 후 연락드리겠습니다",
];

export const MODEL_QUICK_REPLIES = [
  "일정 가능합니다",
  "조건 확인했습니다",
  "추가 문의 주세요",
];
