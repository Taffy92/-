"use client";

import { useState } from "react";
import { FileImage, FileText, ScanText, Video } from "lucide-react";

const modes = [
  {
    id: "image",
    label: "图片处理",
    title: "像素读取与本地编码",
    detail: "裁切、调整、压缩和格式处理均在当前浏览器完成。",
    icon: FileImage
  },
  {
    id: "document",
    label: "文档渲染",
    title: "页面解析与本地导出",
    detail: "PDF、Word、Excel 在本机解析后生成图片或文档结果。",
    icon: FileText
  },
  {
    id: "ocr",
    label: "OCR 识别",
    title: "本地模型读取文字",
    detail: "图片和 PDF 内容在当前设备识别，可导出可编辑 Word。",
    icon: ScanText
  },
  {
    id: "media",
    label: "音视频",
    title: "本地媒体内核处理",
    detail: "音视频转换、裁剪、提取和截图不经过云端转换接口。",
    icon: Video
  }
] as const;

export function LocalEngineStage() {
  const [activeId, setActiveId] = useState<(typeof modes)[number]["id"]>("image");
  const active = modes.find((mode) => mode.id === activeId) ?? modes[0];
  const ActiveIcon = active.icon;

  return (
    <section className="engine-stage" aria-label="本地处理路径示意">
      <header>
        <span><span className="engine-live-dot" />本地处理路径示意</span>
        <small>不读取真实文件</small>
      </header>
      <div className="engine-stage-visual">
        <div className="engine-source">
          <ActiveIcon size={24} />
          <span>本机文件</span>
        </div>
        <div className="engine-track" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="engine-core">
          <span>LOCAL</span>
          <strong>{active.label}</strong>
        </div>
        <div className="engine-track engine-track-output" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="engine-output">
          <span>RESULT</span>
          <strong>本机结果</strong>
        </div>
      </div>
      <div className="engine-stage-copy" aria-live="polite">
        <strong>{active.title}</strong>
        <p>{active.detail}</p>
      </div>
      <div className="engine-mode-tabs" role="tablist" aria-label="切换处理路径示意">
        {modes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={active.id === mode.id}
            className={active.id === mode.id ? "active" : ""}
            onClick={() => setActiveId(mode.id)}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </section>
  );
}
