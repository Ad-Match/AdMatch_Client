export function getKakaoRedirectUri(): string {
  if (process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI) {
    return process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;
  }
  if (typeof window !== "undefined") {
    return `${window.location.origin}/auth/kakao/callback`;
  }
  return "http://localhost:3000/auth/kakao/callback";
}
