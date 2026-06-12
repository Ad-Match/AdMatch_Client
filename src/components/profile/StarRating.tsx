"use client";

type Props = {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md";
};

export function StarRating({ value, onChange, size = "md" }: Props) {
  const starSize = size === "sm" ? "text-sm" : "text-lg";
  const interactive = Boolean(onChange);

  return (
    <div className="inline-flex gap-0.5" role={interactive ? "radiogroup" : undefined}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={`${starSize} leading-none ${
            interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
          } ${star <= value ? "text-amber-400" : "text-neutral-300"}`}
          aria-label={`${star}점`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
