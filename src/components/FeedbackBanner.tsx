"use client";

interface FeedbackBannerProps {
  pass: boolean;
  text: string;
}

export function FeedbackBanner({ pass, text }: FeedbackBannerProps) {
  return (
    <div
      className={`px-3 md:px-4 py-3 text-xs md:text-sm border-t shrink-0 ${
        pass ? "border-green-800" : "border-yellow-800"
      }`}
      style={{
        background: pass ? "rgba(79,217,124,0.08)" : "rgba(217,159,79,0.08)",
        color: pass ? "#4fd97c" : "#d99f4f",
      }}
    >
      {pass ? "✓ " : "⚠ "}
      {text}
    </div>
  );
}
