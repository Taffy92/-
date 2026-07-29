"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Mail, MessageCircle, X } from "lucide-react";
import { siteConfig } from "@/config/site";

type SupportDialogProps = {
  open: boolean;
  onClose: () => void;
  desktop?: boolean;
};

export function SupportDialog({ open, onClose, desktop = false }: SupportDialogProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);
  const [copied, setCopied] = useState<"wechat" | "email" | "">("");

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) || []
      );
      if (!focusable.length) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    window.requestAnimationFrame(() => closeRef.current?.focus());
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  async function copyContact(kind: "wechat" | "email", value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("");
    }
  }

  return (
    <div
      className={`support-dialog-layer ${desktop ? "support-dialog-layer-desktop" : ""}`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="support-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-dialog-title"
      >
        <header className="support-dialog-head">
          <div>
            <p>SUPPORT & CONTACT</p>
            <h2 id="support-dialog-title">支持作者</h2>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="关闭支持作者弹窗">
            <X size={18} />
          </button>
        </header>

        <div className="support-dialog-body">
          <p className="support-dialog-intro">
            如果这个工具帮你节省了时间，可以自愿赞赏支持后续维护。赞赏完全自愿，不影响任何功能，不代表购买、授权或服务承诺。
          </p>

          <div className="support-qr-grid">
            <figure>
              <img src="/donate/wechat-reward-qr.png" alt="微信赞赏二维码" />
              <figcaption>微信赞赏</figcaption>
            </figure>
            <figure>
              <img src="/donate/alipay-reward-qr.png" alt="支付宝赞赏二维码" />
              <figcaption>支付宝赞赏</figcaption>
            </figure>
          </div>

          <div className="support-contact-panel">
            <h3>联系作者</h3>
            <p>需要反馈问题或咨询离线版时，可通过以下方式联系。请不要发送包含敏感信息的原始文件。</p>
            <div className="support-contact-row">
              <MessageCircle size={17} />
              <span><small>微信号</small><strong>{siteConfig.wechat}</strong></span>
              <button type="button" onClick={() => void copyContact("wechat", siteConfig.wechat)}>
                {copied === "wechat" ? <Check size={16} /> : <Copy size={16} />}
                {copied === "wechat" ? "已复制" : "复制"}
              </button>
            </div>
            <div className="support-contact-row">
              <Mail size={17} />
              <span><small>邮箱</small><strong>{siteConfig.email}</strong></span>
              <a href={`mailto:${siteConfig.email}`}>发送邮件</a>
              <button type="button" onClick={() => void copyContact("email", siteConfig.email)}>
                {copied === "email" ? <Check size={16} /> : <Copy size={16} />}
                {copied === "email" ? "已复制" : "复制"}
              </button>
            </div>
          </div>
          <p className="support-dialog-note">二维码不用于自动授权，软件不会记录是否扫码或付款。</p>
        </div>
      </section>
    </div>
  );
}
