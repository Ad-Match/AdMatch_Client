import type { ModelCareer } from "@/lib/types";

export const CAREER_CATEGORIES = [
  "영화",
  "드라마",
  "연극",
  "뮤지컬",
  "CF/광고",
  "SNS",
  "기타",
] as const;

const CAREER_COLORS: Record<string, string> = {
  영화: "bg-amber-100 text-amber-900",
  드라마: "bg-sky-100 text-sky-900",
  연극: "bg-orange-100 text-orange-900",
  뮤지컬: "bg-violet-100 text-violet-900",
  "CF/광고": "bg-emerald-100 text-emerald-900",
  SNS: "bg-pink-100 text-pink-900",
  기타: "bg-neutral-100 text-neutral-800",
};

export function formatUpdatedAt(iso: string) {
  const date = new Date(iso);
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function formatBodyText(height?: string, weight?: string, body?: string) {
  if (height && weight) return `${height}cm / ${weight}kg`;
  return body ?? "-";
}

export function careerCategoryStyle(category: string) {
  return CAREER_COLORS[category] ?? CAREER_COLORS.기타;
}

export function groupCareersByCategory(careers: ModelCareer[]) {
  const map = new Map<string, ModelCareer[]>();
  for (const item of careers) {
    const list = map.get(item.category) ?? [];
    list.push(item);
    map.set(item.category, list);
  }
  return Array.from(map.entries());
}

export function extractYoutubeId(url?: string) {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&?/]+)/,
  );
  return match?.[1] ?? null;
}
