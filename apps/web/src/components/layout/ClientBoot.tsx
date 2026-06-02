"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { installNetworkGuard } from "@/lib/privacy/networkGuard";

export function ClientBoot() {
  const pathname = usePathname();

  useEffect(() => {
    installNetworkGuard();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const page = document.querySelector<HTMLElement>(".apple-document-page");
    if (!page) return;

    const directBlocks = Array.from(page.querySelectorAll<HTMLElement>(":scope > section, :scope > article"));
    const namedBlocks = Array.from(page.querySelectorAll<HTMLElement>(".document-hero, .document-article"));
    const targets = Array.from(new Set([...directBlocks, ...namedBlocks]));
    if (!targets.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(targets, {
        autoAlpha: 0,
        y: 14
      }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.42,
        ease: "power2.out",
        stagger: 0.05,
        clearProps: "transform,opacity,visibility"
      });
    }, page);

    return () => ctx.revert();
  }, [pathname]);

  return null;
}
