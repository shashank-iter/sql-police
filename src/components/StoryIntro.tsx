"use client";

import { useState } from "react";

interface StoryIntroProps {
  story: string;
}

export function StoryIntro({ story }: StoryIntroProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-secondary transition-colors"
      >
        <span
          className="text-xs tracking-widest uppercase"
          style={{ color: "var(--primary)" }}
        >
          Case Brief
        </span>
        <span className="text-muted-foreground text-xs">
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
            {story}
          </p>
        </div>
      )}
    </div>
  );
}
