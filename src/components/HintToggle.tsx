"use client";

interface HintToggleProps {
  hint: string;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

export function HintToggle({ hint, show, setShow }: HintToggleProps) {
  if (!show) return null;

  return (
    <div className="px-3 md:px-4 py-3  text-xs md:text-sm border-t shrink-0 border-yellow-800 bg-[rgba(217,159,79,0.08)]">
      {hint}
    </div>
  );
}
