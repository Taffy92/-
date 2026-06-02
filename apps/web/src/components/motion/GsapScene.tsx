"use client";

import { ReactNode, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

type GsapSceneProps = {
  animateKey?: string;
  children: ReactNode;
  variant: "home" | "tools";
};

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function GsapScene({ animateKey, children, variant }: GsapSceneProps) {
  const scopeRef = useRef<HTMLDivElement | null>(null);
  const hasAnimatedKeyRef = useRef(false);

  useGSAP(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    const q = gsap.utils.selector(scope);
    const reduceMotion = prefersReducedMotion();

    if (reduceMotion) {
      gsap.set(q("[data-animate]"), { autoAlpha: 1, clearProps: "transform,opacity,visibility" });
      return;
    }

    if (variant === "home") {
      const shell = q('[data-animate="home-shell"]');
      const intro = q('[data-animate="home-intro"]');
      const trustItems = q('[data-animate="home-trust-item"]');
      const cards = q('[data-animate="home-card"]');

      gsap.set([...shell, ...intro, ...trustItems, ...cards], { willChange: "transform, opacity" });

      gsap.timeline({ defaults: { duration: 0.55, ease: "power3.out" } })
        .from(shell, { autoAlpha: 0, y: 22, duration: 0.5, clearProps: "transform,opacity,visibility,willChange" })
        .from(intro, { autoAlpha: 0, y: 16, stagger: 0.07, clearProps: "transform,opacity,visibility,willChange" }, "-=0.22")
        .from(trustItems, { autoAlpha: 0, x: 14, stagger: 0.06, clearProps: "transform,opacity,visibility,willChange" }, "-=0.2");

      ScrollTrigger.batch(cards, {
        interval: 0.08,
        once: true,
        start: "top 88%",
        onEnter: (batch) => {
          gsap.from(batch, {
            autoAlpha: 0,
            y: 22,
            scale: 0.985,
            duration: 0.52,
            stagger: 0.06,
            ease: "power2.out",
            clearProps: "transform,opacity,visibility,willChange"
          });
        }
      });
    }

    if (variant === "tools") {
      const chrome = q('[data-animate="tools-chrome"]');
      const nav = q('[data-animate="tools-nav"]');
      const header = q('[data-animate="tools-header"]');
      const main = q('[data-animate="tools-main"]');
      const side = q('[data-animate="tools-side"]');
      const dropzone = q('[data-animate="tools-dropzone"]');
      const actions = q('[data-animate="tools-actions"]');
      const preview = q('[data-animate="tools-preview"]');
      const ad = q('[data-animate="tools-ad"]');

      gsap.set([...chrome, ...nav, ...header, ...main, ...side, ...dropzone, ...actions, ...preview, ...ad], { willChange: "transform, opacity" });

      gsap.timeline({ defaults: { duration: 0.48, ease: "power3.out" } })
        .from(chrome, { autoAlpha: 0, y: 18, clearProps: "transform,opacity,visibility,willChange" })
        .from([nav, header, main, side], {
          autoAlpha: 0,
          y: 18,
          stagger: 0.07,
          clearProps: "transform,opacity,visibility,willChange"
        }, "-=0.2")
        .from([dropzone, actions, preview, ad], {
          autoAlpha: 0,
          y: 14,
          stagger: 0.05,
          clearProps: "transform,opacity,visibility,willChange"
        }, "-=0.2");
    }

    window.setTimeout(() => ScrollTrigger.refresh(), 250);
  }, { scope: scopeRef });

  useGSAP(() => {
    const scope = scopeRef.current;
    if (!scope || !animateKey) return;

    if (!hasAnimatedKeyRef.current) {
      hasAnimatedKeyRef.current = true;
      return;
    }

    if (prefersReducedMotion()) return;

    const q = gsap.utils.selector(scope);
    const panels = q('[data-animate-dynamic="true"]');
    if (!panels.length) return;

    gsap.fromTo(panels, {
      autoAlpha: 0.92,
      y: 10
    }, {
      autoAlpha: 1,
      y: 0,
      duration: 0.28,
      stagger: 0.04,
      ease: "power2.out",
      overwrite: "auto",
      clearProps: "transform,opacity,visibility"
    });
  }, { scope: scopeRef, dependencies: [animateKey] });

  return <div ref={scopeRef}>{children}</div>;
}
