const FOOTER_HIDDEN_PREFIXES = ["/models", "/campaigns", "/chats", "/mypage"];

export function shouldShowSiteFooter(pathname: string) {
  return !FOOTER_HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
