const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DATE_IN_TEXT_RE = /(\d{4})-(\d{2})-(\d{2})/;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function parseCampaignShootDate(due: string): Date | null {
  const trimmed = due.trim();
  if (!trimmed) return null;

  if (ISO_DATE_RE.test(trimmed)) {
    const [year, month, day] = trimmed.split("-").map(Number);
    const parsed = new Date(year, month - 1, day);
    if (
      parsed.getFullYear() === year &&
      parsed.getMonth() === month - 1 &&
      parsed.getDate() === day
    ) {
      return parsed;
    }
    return null;
  }

  const match = trimmed.match(DATE_IN_TEXT_RE);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  ) {
    return parsed;
  }
  return null;
}

export function toIsoDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayIsoDate() {
  return toIsoDateString(new Date());
}

export function getCampaignDday(due: string, refDate = new Date()) {
  const shootDate = parseCampaignShootDate(due);
  if (!shootDate) return due;

  const diffDays = Math.round(
    (startOfDay(shootDate).getTime() - startOfDay(refDate).getTime()) /
      86_400_000,
  );

  if (diffDays === 0) return "D-Day";
  if (diffDays > 0) return `D-${diffDays}`;
  return `D+${Math.abs(diffDays)}`;
}

export function formatCampaignShootDate(due: string) {
  const shootDate = parseCampaignShootDate(due);
  if (!shootDate) return due;

  return shootDate.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export function formatCampaignShootSchedule(due: string, refDate = new Date()) {
  const shootDate = parseCampaignShootDate(due);
  if (!shootDate) return due;

  return `${getCampaignDday(due, refDate)} · ${formatCampaignShootDate(due)}`;
}

export function toCampaignDueInputValue(due: string) {
  const shootDate = parseCampaignShootDate(due);
  return shootDate ? toIsoDateString(shootDate) : "";
}
