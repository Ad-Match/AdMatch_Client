import { ApiError } from "@/lib/api";

const MESSAGE_MAP: Record<string, string> = {
  "Email already registered": "이미 가입된 이메일입니다. 로그인해 주세요.",
  "Invalid credentials": "이메일 또는 비밀번호가 올바르지 않습니다.",
  "Matching already exists": "이미 지원·제안된 매칭입니다.",
  "Closed campaign cannot accept matching": "마감된 공고에는 지원할 수 없습니다.",
  "Profile already exists for this user": "이미 등록된 프로필이 있습니다.",
  "활동 태그는 2개 이상 입력해 주세요.": "활동 태그는 2개 이상 선택해 주세요.",
};

export function parseApiErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return "요청에 실패했습니다. 잠시 후 다시 시도해 주세요.";
  const raw = err.message;

  for (const [key, ko] of Object.entries(MESSAGE_MAP)) {
    if (raw.includes(key)) return ko;
  }

  try {
    const parsed = JSON.parse(raw) as { message?: string | string[] };
    const msg = Array.isArray(parsed.message)
      ? parsed.message.join(", ")
      : parsed.message;
    if (msg) {
      for (const [key, ko] of Object.entries(MESSAGE_MAP)) {
        if (msg.includes(key)) return ko;
      }
      return msg;
    }
  } catch {
    /* plain text */
  }

  if (err instanceof ApiError) {
    if (err.status === 401) return "로그인이 필요합니다.";
    if (err.status === 403) return "접근 권한이 없습니다.";
    if (err.status === 404) return "요청한 정보를 찾을 수 없습니다.";
    if (err.status >= 500) return "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  }

  if (raw && raw.length < 120) return raw;
  return "요청에 실패했습니다. 잠시 후 다시 시도해 주세요.";
}
