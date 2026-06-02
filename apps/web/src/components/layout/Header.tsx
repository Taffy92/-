"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { isDesktopApp } from "@/config/appMode";
import { siteConfig } from "@/config/site";
import { MatrixLogo } from "./MatrixLogo";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

const webNavItems = [
  { href: siteConfig.links.home, label: "产品首页" },
  { href: siteConfig.links.tools, label: "在线工具台" }
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
  const pathname = usePathname();
  const brandRef = useRef<HTMLAnchorElement | null>(null);
  const navItems = desktop ? desktopNavItems : webNavItems;
  const homeHref = desktop ? siteConfig.links.tools : siteConfig.links.home;

  const headerClass = desktop ? "apple-global-nav apple-global-nav-desktop" : "apple-global-nav";
  const menuButtonClass = "apple-mobile-menu-button";
  const isActive = (href: string) => href === siteConfig.links.home
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  useGSAP(() => {
    const brand = brandRef.current;
    if (!brand || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const box1 = brand.querySelector(".matrix-box-1");
    const box2 = brand.querySelector(".matrix-box-2");
    if (!box1 || !box2) return;

    gsap.fromTo([box1, box2], {
      autoAlpha: 0,
      y: 4,
      scale: 0.94
    }, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.42,
      ease: "power3.out",
      stagger: 0.08,
      clearProps: "opacity,visibility"
    });

    const onEnter = () => {
      gsap.to(box1, { x: -1.2, y: -1.2, duration: 0.28, ease: "power2.out", overwrite: "auto" });
      gsap.to(box2, { x: 1.2, y: 1.2, duration: 0.28, ease: "power2.out", overwrite: "auto" });
    };
    const onLeave = () => {
      gsap.to([box1, box2], { x: 0, y: 0, duration: 0.28, ease: "power2.out", overwrite: "auto" });
    };

    brand.addEventListener("mouseenter", onEnter);
    brand.addEventListener("mouseleave", onLeave);

    return () => {
      brand.removeEventListener("mouseenter", onEnter);
      brand.removeEventListener("mouseleave", onLeave);
    };
  }, { dependencies: [desktop] });

  return (
    <header className={headerClass}>
      <div className="apple-nav-inner">
        <Link ref={brandRef} href={homeHref} className="apple-brand" onClick={() => setOpen(false)}>
          <MatrixLogo />
          <span className="logo-text truncate">
            <span>{siteConfig.shortName}</span>
            <span className="logo-tag">PRO</span>
          </span>
          {desktop ? <span className="apple-nav-badge">专业版</span> : null}
        </Link>
        <nav className="nav-center-links">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`apple-nav-link ${isActive(item.href) ? "primary" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className={menuButtonClass}
          aria-label={open ? "关闭导航菜单" : "打开导航菜单"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open ? (
        <div className="apple-mobile-nav">
          <nav>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`apple-mobile-nav-link ${isActive(item.href) ? "primary" : ""}`}
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
