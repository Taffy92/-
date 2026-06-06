"use client";

export interface PlaceholderAdSlotProps {
  label?: string;
  className?: string;
}

export function PlaceholderAdSlot({ label = "广告位", className = "" }: PlaceholderAdSlotProps) {
  return (
    <div
      className={`flex min-h-[100px] w-full items-center justify-center rounded-sm border border-dashed border-slate-300 bg-white text-sm text-slate-500 ${className}`}
      aria-label={label}
    >
      {label}
    </div>
  );
}
