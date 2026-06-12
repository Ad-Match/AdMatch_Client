"use client";

import { StarRating } from "@/components/profile/StarRating";
import type { ModelHobby } from "@/lib/types";

type Props = {
  value: ModelHobby[];
  onChange: (value: ModelHobby[]) => void;
};

export function HobbyEditor({ value, onChange }: Props) {
  function updateItem(index: number, patch: Partial<ModelHobby>) {
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([...value, { name: "", rating: 3 }]);
  }

  return (
    <div className="space-y-3">
      {value.map((item, index) => (
        <div
          key={index}
          className="flex flex-wrap items-center gap-3 rounded-lg border border-brand-border bg-[#fafafa] px-3 py-3"
        >
          <input
            value={item.name}
            onChange={(e) => updateItem(index, { name: e.target.value })}
            placeholder="예) 전라도 사투리, 검도"
            className="min-w-[140px] flex-1 rounded-lg border border-brand-border bg-white px-3 py-2 text-sm"
          />
          <StarRating
            value={item.rating}
            onChange={(rating) => updateItem(index, { rating })}
          />
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="text-xs text-brand-muted hover:text-red-600"
          >
            삭제
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="rounded-lg border border-dashed border-brand-border px-4 py-2.5 text-sm font-semibold text-[#070707] hover:border-[#070707]"
      >
        + 취미·특기 추가
      </button>
    </div>
  );
}
