"use client";

interface ErrorBannerProps {
  error: string;
}

export function ErrorBanner({ error }: ErrorBannerProps) {
  return (
    <div className="px-3 md:px-4 py-2 border-t border-red-900 bg-red-950 shrink-0">
      <p className="text-xs text-red-400 font-mono break-words">{error}</p>
    </div>
  );
}
