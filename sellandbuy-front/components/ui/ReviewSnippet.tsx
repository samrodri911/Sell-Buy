interface ReviewSnippetProps {
  rating?: number;       // 1-5
  text: string;
  reviewerName: string;
}

/**
 * Recent review snippet card — purely presentational.
 */
export function ReviewSnippet({ rating = 5, text, reviewerName }: ReviewSnippetProps) {
  const stars = Math.min(5, Math.max(1, Math.round(rating)));
  const initials = reviewerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-[--color-surface-container-lowest] p-6 rounded-3xl shadow-sm">
      {/* Stars */}
      <div className="flex items-center gap-0.5 mb-3 text-[--color-tertiary]">
        {Array.from({ length: stars }).map((_, i) => (
          <span
            key={i}
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
        ))}
        {Array.from({ length: 5 - stars }).map((_, i) => (
          <span
            key={`e-${i}`}
            className="material-symbols-outlined text-sm text-[--color-outline-variant]"
          >
            star
          </span>
        ))}
      </div>

      {/* Review text */}
      <p className="text-sm italic text-[--color-on-surface-variant] mb-4 leading-relaxed">
        &ldquo;{text}&rdquo;
      </p>

      {/* Reviewer */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[--color-surface-container-highest] flex items-center justify-center text-xs font-bold text-[--color-primary]">
          {initials}
        </div>
        <span className="text-xs font-bold text-[--color-on-surface]">{reviewerName}</span>
      </div>
    </div>
  );
}
