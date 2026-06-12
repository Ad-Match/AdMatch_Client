"use client";

import { CAREER_CATEGORIES } from "@/lib/model-profile";
import type { ModelCareer } from "@/lib/types";

type Props = {
  value: ModelCareer[];
  onChange: (value: ModelCareer[]) => void;
};

export function CareerEditor({ value, onChange }: Props) {
  function updateItem(index: number, patch: Partial<ModelCareer>) {
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeItem(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([
      ...value,
      { category: "CF/광고", year: String(new Date().getFullYear()), title: "", role: "" },
    ]);
  }

  return (
    <div className="space-y-3">
      {value.map((item, index) => (
        <div
          key={index}
          className="grid gap-3 rounded-lg border border-brand-border bg-[#fafafa] p-3 sm:grid-cols-2"
        >
          <div>
            <label className="mb-1 block text-xs font-semibold text-brand-muted">분류</label>
            <select
              value={item.category}
              onChange={(e) => updateItem(index, { category: e.target.value })}
              className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm"
            >
              {CAREER_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-brand-muted">연도</label>
            <input
              value={item.year}
              onChange={(e) => updateItem(index, { year: e.target.value })}
              placeholder="2024"
              className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-brand-muted">작품명</label>
            <input
              value={item.title}
              onChange={(e) => updateItem(index, { title: e.target.value })}
              placeholder="작품·캠페인명"
              className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-brand-muted">역할·내용</label>
            <input
              value={item.role ?? ""}
              onChange={(e) => updateItem(index, { role: e.target.value })}
              placeholder="주연, 모델, 호스트 등"
              className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2 text-right">
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-xs text-brand-muted hover:text-red-600"
            >
              경력 삭제
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="rounded-lg border border-dashed border-brand-border px-4 py-2.5 text-sm font-semibold text-[#070707] hover:border-[#070707]"
      >
        + 경력 추가
      </button>
    </div>
  );
}
