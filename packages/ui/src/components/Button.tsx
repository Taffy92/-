import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonTone = "primary" | "secondary" | "ghost" | "danger";

const toneClass: Record<ButtonTone, string> = {
  primary: "bg-brand-600 text-white shadow-sm hover:bg-brand-700",
  secondary: "bg-white text-ink ring-1 ring-line hover:bg-slate-50",
  ghost: "bg-transparent text-ink hover:bg-slate-100",
  danger: "bg-red-600 text-white hover:bg-red-700"
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: ButtonTone;
}

export function Button({ children, className = "", tone = "primary", type = "button", ...props }: PropsWithChildren<ButtonProps>) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${toneClass[tone]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
