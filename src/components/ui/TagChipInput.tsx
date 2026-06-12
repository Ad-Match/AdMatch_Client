"use client";

import { KeyboardEvent, useState } from "react";

const SUGGESTED_TAGS = [
  "뷰티",
  "SNS",
  "숏폼",
  "CF",
  "게임",
  "바이럴",
  "라이브커머스",
  "패션",
  "피트니스",
];

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
  min?: number;
};

export function TagChipInput({ value, onChange, min = 2 }: Props) {
  const [input, setInput] = useState("");

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
    setInput("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div>
      <div
        className={`flex min-h-[48px] flex-wrap items-center gap-2 rounded-lg border bg-white px-3 py-2 ${
          value.length > 0 && value.length < min
            ? "border-red-400"
            : "border-brand-border"
        }`}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-[#070707] px-3 py-1 text-xs font-semibold text-white"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-0.5 opacity-80 hover:opacity-100"
              aria-label={`${tag} 삭제`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => addTag(input)}
          placeholder={value.length === 0 ? "태그 입력 후 Enter" : "추가..."}
          className="min-w-[120px] flex-1 border-0 bg-transparent py-1 text-sm outline-none"
        />
      </div>
      <p className="mt-1.5 text-xs text-brand-muted">
        현재 {value.length}개 · 최소 {min}개 이상 · Enter 또는 쉼표로 추가
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {SUGGESTED_TAGS.filter((t) => !value.includes(t)).map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => addTag(tag)}
            className="rounded-full border border-brand-border px-2.5 py-1 text-xs text-brand-muted hover:border-[#070707] hover:text-[#070707]"
          >
            + {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
