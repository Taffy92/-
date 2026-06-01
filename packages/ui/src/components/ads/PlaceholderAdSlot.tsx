"use client";

export interface PlaceholderAdSlotProps {
  label?: string;
  className?: string;
}

const ADSENSE_SCRIPT_URL =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3864852988527369";
const ADSENSE_SCRIPT_HTML = `<script async src="${ADSENSE_SCRIPT_URL}" crossorigin="anonymous"></script>`;

export function PlaceholderAdSlot({ label = "广告位", className = "" }: PlaceholderAdSlotProps) {
  return (
    <div
      className={`flex min-h-[100px] w-full items-center justify-center rounded-sm border border-dashed border-slate-300 bg-white text-sm text-slate-500 ${className}`}
      aria-label={label}
    >
      <span dangerouslySetInnerHTML={{ __html: ADSENSE_SCRIPT_HTML }} />
      {label}
    </div>
  );
}
