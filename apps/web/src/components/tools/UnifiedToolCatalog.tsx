"use client";

import { ChevronRight, FileSpreadsheet, FileText, Film, Grid2X2, Image as ImageIcon, ScanText, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  getCategoryHref,
  getUnifiedToolCategory,
  getUnifiedToolHref,
  unifiedToolCategories
} from "@/config/toolCatalog";

const categoryIcons = {
  image: ImageIcon,
  pdf: FileText,
  document: FileSpreadsheet,
  media: Film,
  ocr: ScanText
};

export function UnifiedCategoryRail({ currentToolId }: { currentToolId: string }) {
  const currentCategory = getUnifiedToolCategory(currentToolId);

  return (
    <nav className="unified-category-rail" aria-label="工具分类">
      {unifiedToolCategories.map((category) => (
        <Link
          className={currentCategory?.id === category.id ? "active" : ""}
          href={getCategoryHref(category)}
          key={category.id}
        >
          <strong>{category.label}</strong>
          <span>{category.summary}</span>
        </Link>
      ))}
    </nav>
  );
}

export function UnifiedDesktopSidebar({
  currentToolId,
  onOpenCatalog
}: {
  currentToolId: string;
  onOpenCatalog: () => void;
}) {
  const currentCategory = getUnifiedToolCategory(currentToolId) || unifiedToolCategories[0];

  return (
    <aside className="desktop-a-sidebar" aria-label="离线工具分类">
      <div className="desktop-a-category-list">
        {unifiedToolCategories.map((category) => {
          const CategoryIcon = categoryIcons[category.id];
          return (
            <Link
              className={currentCategory.id === category.id ? "active" : ""}
              href={getCategoryHref(category)}
              key={category.id}
            >
              <span className="desktop-a-category-name"><CategoryIcon aria-hidden="true" size={15} />{category.label}</span>
              <small>{category.tools.length}</small>
            </Link>
          );
        })}
      </div>
      <div className="desktop-a-current-tools">
        <p>{currentCategory.label}</p>
        {currentCategory.tools.map((tool) => (
          <Link
            className={currentToolId === tool.id ? "active" : ""}
            href={getUnifiedToolHref(tool)}
            key={tool.id}
            title={tool.description}
          >
            <span>{tool.label}</span>
            {tool.offlineBatch ? <small>批量</small> : null}
          </Link>
        ))}
      </div>
      <button className="desktop-a-all-tools" type="button" onClick={onOpenCatalog}>
        <Grid2X2 aria-hidden="true" size={15} />
        全部工具
      </button>
    </aside>
  );
}

export function UnifiedToolDialog({
  open,
  currentToolId,
  desktop = false,
  onClose
}: {
  open: boolean;
  currentToolId: string;
  desktop?: boolean;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);

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

  return (
    <div
      className={`unified-tool-dialog-layer ${desktop ? "is-desktop" : ""}`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="unified-tool-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="unified-tool-dialog-title"
      >
        <header>
          <div>
            <p>{desktop ? "离线任务类型" : "在线工具目录"}</p>
            <h2 id="unified-tool-dialog-title">选择工具</h2>
            <span>按文件类型和处理目的查找。在线版一次处理一个文件，批量任务请使用 Windows 离线版。</span>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="关闭工具目录">
            <X aria-hidden="true" size={18} />
          </button>
        </header>
        <div className="unified-tool-grid">
          {unifiedToolCategories.map((category) => (
            <section key={category.id}>
              <h3>{category.label}</h3>
              <div>
                {category.tools.map((tool) => (
                  <Link
                    className={currentToolId === tool.id ? "active" : ""}
                    href={getUnifiedToolHref(tool)}
                    key={tool.id}
                    onClick={onClose}
                  >
                    <span>
                      <strong>{tool.label}</strong>
                      <small>{tool.description}</small>
                    </span>
                    <span className="unified-tool-link-tail">
                      {tool.offlineBatch ? <small>离线批量</small> : null}
                      <ChevronRight aria-hidden="true" size={14} />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
        <footer>
          <span>文件始终在当前设备处理。</span>
          {!desktop ? <span>“离线批量”仅说明 Windows 离线版的批量或目录输出能力。</span> : null}
        </footer>
      </section>
    </div>
  );
}
