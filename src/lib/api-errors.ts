export function parseApiErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return "";
  const raw = err.message;
  try {
    const parsed = JSON.parse(raw) as { message?: string | string[] };
    if (Array.isArray(parsed.message)) {
      return parsed.message.join(", ");
    }
    if (typeof parsed.message === "string") {
      return parsed.message;
    }
  } catch {
    /* plain text */
  }
  return raw;
}
