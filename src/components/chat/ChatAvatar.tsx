type Props = {
  name: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
};

const SIZE = {
  sm: "h-10 w-10 text-sm",
  md: "h-12 w-12 text-base",
  lg: "h-14 w-14 text-lg",
};

export function ChatAvatar({ name, imageUrl, size = "md" }: Props) {
  const initial = name.trim().slice(0, 1) || "?";

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`${SIZE[size]} shrink-0 rounded-full object-cover border border-brand-border`}
      />
    );
  }

  return (
    <div
      className={`${SIZE[size]} flex shrink-0 items-center justify-center rounded-full border border-brand-border bg-brand-primary-light font-semibold text-[#070707]`}
      aria-hidden
    >
      {initial}
    </div>
  );
}
