"use client";

import type { ReactNode } from "react";

type DesktopTaskWorkspaceProps = {
  taskCount: number;
  toolLabel: string;
  canSave: boolean;
  onSave: () => void;
  children: ReactNode;
};

export function DesktopTaskWorkspace({
  taskCount,
  toolLabel,
  canSave,
  onSave,
  children
}: DesktopTaskWorkspaceProps) {
  return (
    <section className="desktop-a-task-canvas">
      <header>
        <div>
          <h1>任务画布{taskCount ? `（${taskCount}）` : ""}</h1>
          <p>{toolLabel} · 文件仅在本机处理</p>
        </div>
        <div>
          <button type="button" disabled={!canSave} onClick={onSave}>保存结果</button>
        </div>
      </header>
      <div className="desktop-a-preview-area">{children}</div>
    </section>
  );
}
