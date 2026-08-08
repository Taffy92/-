"use client";

import { CheckCircle2, Download, Loader2, Play, Square } from "lucide-react";
import type { ProcessState } from "@doctool/shared";

type ResultFile = { blob: Blob; name: string };

type ConversionResultViewProps = {
  status: ProcessState;
  progress: number;
  progressText: string;
  fileReady: boolean;
  compressionStats: string;
  error: string;
  resultName: string;
  resultFiles: ResultFile[];
  canDownload: boolean;
  canStartTask: boolean;
  onDownload: () => void;
  onCancel: () => void;
  onStart: () => void | Promise<void>;
  onDownloadResultFile: (file: ResultFile) => void;
};

export function ConversionResultView({
  status,
  progress,
  progressText,
  fileReady,
  compressionStats,
  error,
  resultName,
  resultFiles,
  canDownload,
  canStartTask,
  onDownload,
  onCancel,
  onStart,
  onDownloadResultFile
}: ConversionResultViewProps) {
  const progressPercent = Math.round(progress * 100);

  return (
    <div className={`a2-task-status is-${status}`} data-animate="tools-actions" aria-live="polite">
      <div className="a2-task-status-copy">
        <div>
          <strong>
            {status === "running"
              ? `正在处理 · ${progressPercent}%`
              : status === "done"
                ? "转换完成"
                : status === "error"
                  ? "处理失败"
                  : status === "cancelled"
                    ? "已取消"
                    : fileReady
                      ? "文件已就绪"
                      : "等待选择文件"}
          </strong>
          <span>{progressText}</span>
        </div>
        {status === "running" ? <span>{progressPercent}%</span> : null}
      </div>
      <div className="a2-progress-track" aria-label={progressText}>
        <span style={{ width: `${progressPercent}%` }} />
      </div>
      {compressionStats ? <p className="a2-status-note">{compressionStats}</p> : null}
      {error ? <p className="a2-status-error">处理失败：{error}。请检查文件格式或重新选择文件后再试。</p> : null}
      {resultName ? (
        <p className="a2-status-result">
          <CheckCircle2 aria-hidden="true" size={17} />
          <span title={resultName}>已生成：{resultName}</span>
        </p>
      ) : null}
      {resultFiles.length > 1 ? (
        <div className="a2-page-download-list" aria-label="逐页下载结果">
          {resultFiles.map((item) => (
            <button type="button" key={item.name} onClick={() => onDownloadResultFile(item)}>
              <Download aria-hidden="true" size={14} />
              <span title={item.name}>{item.name}</span>
            </button>
          ))}
        </div>
      ) : null}
      <div className="a2-task-actions">
        <button
          className="a2-button-secondary"
          type="button"
          disabled={!canDownload}
          onClick={onDownload}
          title={canDownload ? undefined : "转换完成后可下载结果"}
        >
          <Download aria-hidden="true" size={16} />
          下载结果
        </button>
        <button
          className="a2-button-danger"
          type="button"
          disabled={status !== "running"}
          onClick={onCancel}
        >
          <Square aria-hidden="true" size={15} />
          停止
        </button>
        <button
          className="a2-button-primary"
          type="button"
          disabled={!canStartTask}
          onClick={() => void onStart()}
          title={canStartTask ? undefined : "请先添加文件后再开始"}
        >
          {status === "running" ? <Loader2 className="animate-spin" aria-hidden="true" size={16} /> : <Play aria-hidden="true" size={16} />}
          开始转换
        </button>
      </div>
    </div>
  );
}
