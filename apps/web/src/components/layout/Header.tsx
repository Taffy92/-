"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { isDesktopApp } from "@/config/appMode";
import { siteConfig } from "@/config/site";

const webNavItems = [
  { href: siteConfig.links.tools, label: "在线工具" },
  { href: siteConfig.links.download, label: "下载专业版", primary: true },
  { href: siteConfig.links.tutorials, label: "使用教程" },
  { href: siteConfig.links.about, label: "关于我们" }
] as const;

const desktopNavItems = [
  { href: siteConfig.links.tools, label: "专业工作台" },
  { href: siteConfig.links.tutorials, label: "使用教程" },
  { href: siteConfig.links.privacy, label: "隐私政策" },
  { href: siteConfig.links.licenses, label: "开源许可证" },
  { href: siteConfig.links.about, label: "关于我们" }
] as const;

export function Header({ desktop = isDesktopApp }: { desktop?: boolean }) {
  const [open, setOpen] = useState(false);
  const navItems = desktop ? desktopNavItems : webNavItems;
  const homeHref = desktop ? siteConfig.links.tools : siteConfig.links.home;

  return (
    <header className="sticky top-0 z-40 border-b border-cyan-300/15 bg-slate-950/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href={homeHref} className="flex min-w-0 items-center gap-2 font-bold text-slate-50" onClick={() => setOpen(false)}>
          <img src="/icons/app-icon-64.png" alt={siteConfig.name} className="h-9 w-9 rounded-xl object-cover shadow-[0_0_24px_rgba(34,211,238,0.22)]" />
          <span className="truncate">{siteConfig.shortName}</span>
          {desktop ? <span className="hidden rounded-full border border-cyan-300/25 bg-cyan-400/10 px-2 py-1 text-xs font-semibold text-cyan-200 sm:inline">专业版</span> : null}
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                "primary" in item && item.primary
                  ? "border border-cyan-300/50 bg-cyan-400 text-slate-950 shadow-[0_0_22px_rgba(34,211,238,0.18)] hover:bg-cyan-300"
                  : "text-slate-300 hover:bg-cyan-400/10 hover:text-cyan-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/20 bg-slate-900 text-slate-100 md:hidden"
          aria-label={open ? "关闭导航菜单" : "打开导航菜单"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-cyan-300/15 bg-slate-950 px-4 pb-4 md:hidden">
          <nav className="mx-auto grid max-w-7xl gap-2 pt-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                  "primary" in item && item.primary ? "bg-cyan-400 text-slate-950" : "border border-cyan-300/10 bg-slate-900 text-slate-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
