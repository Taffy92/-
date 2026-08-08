"use client";

import { useRef, useState } from "react";
import type { FileSummary, ProcessState } from "@doctool/shared";

export type DocumentPreviewState = {
  url: string;
  title: string;
  message: string;
};

export type ResultPreviewState = {
  name: string;
  kind: "video" | "audio";
  url: string;
  objectUrl: boolean;
};

export function useConversionController() {
  const cancelRef = useRef(false);
  const mediaAbortRef = useRef<AbortController | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [summary, setSummary] = useState<FileSummary | null>(null);
  const [status, setStatus] = useState<ProcessState>("idle");
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [error, setError] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultName, setResultName] = useState("");
  const [resultFiles, setResultFiles] = useState<Array<{ blob: Blob; name: string }>>([]);
  const [resultFolderPath, setResultFolderPath] = useState("");
  const [resultPreview, setResultPreview] = useState<ResultPreviewState | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewMessage, setPreviewMessage] = useState("");
  const [documentPreview, setDocumentPreview] = useState<DocumentPreviewState>({ url: "", title: "", message: "" });
  const [compressionStats, setCompressionStats] = useState("");

  function cancelTask() {
    cancelRef.current = true;
    mediaAbortRef.current?.abort();
    setProgressMessage("已请求取消，当前任务会在安全节点停止。");
  }

  return {
    cancelRef,
    mediaAbortRef,
    file,
    setFile,
    fileUrl,
    setFileUrl,
    summary,
    setSummary,
    status,
    setStatus,
    progress,
    setProgress,
    progressMessage,
    setProgressMessage,
    error,
    setError,
    resultBlob,
    setResultBlob,
    resultName,
    setResultName,
    resultFiles,
    setResultFiles,
    resultFolderPath,
    setResultFolderPath,
    resultPreview,
    setResultPreview,
    previewUrl,
    setPreviewUrl,
    previewMessage,
    setPreviewMessage,
    documentPreview,
    setDocumentPreview,
    compressionStats,
    setCompressionStats,
    cancelTask
  };
}

export function friendlyError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  if (/withResolvers/i.test(message)) return "当前运行环境缺少 Promise.withResolvers，已内置兼容层；请重新打开离线版后再试。";
  if (/password|encrypted/i.test(message)) return "PDF 可能已加密，请先使用无密码版本再转换。";
  if (/memory|allocation/i.test(message)) return "浏览器内存不足，请降低清晰度、缩小图片或使用离线安装版。";
  if (/cancel|abort/i.test(message)) return "任务已取消。";
  return message || "处理失败，请更换文件或使用离线安装版重试。";
}
