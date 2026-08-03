"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  AudioLines,
  Crop,
  FileImage,
  FilePlus2,
  FileSpreadsheet,
  FileText,
  Files,
  Film,
  Images,
  ListOrdered,
  Maximize2,
  Minimize2,
  MonitorDown,
  Music2,
  RotateCw,
  ScanText,
  Scissors,
  Search,
  SlidersHorizontal,
  SplitSquareVertical,
  Stamp,
  Tags,
  Video,
  VolumeX
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AdSlot } from "@doctool/ui";
import { adsConfig } from "@/config/ads";
import { siteConfig } from "@/config/site";
import {
  getUnifiedToolCategory,
  getUnifiedToolHref,
  unifiedToolCategories,
  unifiedTools
} from "@/config/toolCatalog";
import type { UnifiedToolCategoryId, UnifiedToolId } from "@/config/toolCatalog";
import { ToolsClient } from "@/components/tools/ToolsClient";

type DirectoryFilter = "all" | UnifiedToolCategoryId;

const categoryIcons: Record<UnifiedToolCategoryId, LucideIcon> = {
  image: Images,
  pdf: FileText,
  document: FileSpreadsheet,
  media: Film,
  ocr: ScanText
};

const toolIcons: Partial<Record<UnifiedToolId, LucideIcon>> = {
  "image-convert": Images,
  crop: Crop,
  resize: Maximize2,
  watermark: Stamp,
  compress: Minimize2,
  "image-transform": RotateCw,
  "image-metadata": Tags,
  "pdf-images": FileImage,
  "images-pdf": FilePlus2,
  "pdf-merge": Files,
  "pdf-split": SplitSquareVertical,
  "pdf-pages": ListOrdered,
  "pdf-decorate": Stamp,
  "word-images": FileText,
  "excel-images": FileSpreadsheet,
  "video-convert": Video,
  "audio-convert": Music2,
  "video-audio": AudioLines,
  "media-trim": Scissors,
  "video-mute": VolumeX,
  "video-frame": Film,
  "video-gif": Images,
  "audio-enhance": SlidersHorizontal,
  ocr: ScanText
};

export function OnlineToolsEntry() {
  const searchParams = useSearchParams();
  if (searchParams.has("tool")) return <ToolsClient surface="web" />;
  return <OnlineToolDirectory />;
}

function OnlineToolDirectory() {
  const [activeFilter, setActiveFilter] = useState<DirectoryFilter>("all");
  const [query, setQuery] = useState("");

  const visibleTools = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
    return unifiedTools.filter((tool) => {
      const category = getUnifiedToolCategory(tool.id);
      const matchesCategory = activeFilter === "all" || category?.id === activeFilter;
      const matchesQuery = !normalizedQuery || [tool.label, tool.description, category?.label, category?.summary]
        .filter(Boolean)
        .some((value) => value?.toLocaleLowerCase("zh-CN").includes(normalizedQuery));
      return matchesCategory && matchesQuery;
    });
  }, [activeFilter, query]);

  const chooseFilter = (filter: DirectoryFilter) => {
    setActiveFilter(filter);
  };

  return (
    <main className="online-tool-directory">
      <section className="online-tool-directory-intro" aria-labelledby="online-tool-directory-title">
        <div>
          <p>在线工具目录</p>
          <h1 id="online-tool-directory-title">所有转换任务，一页找到。</h1>
          <span>在线单文件，本机处理；批量任务使用 Windows 离线版。</span>
        </div>
        <div className="online-tool-directory-controls">
          <label className="online-tool-directory-search">
            <Search aria-hidden="true" size={18} />
            <span className="sr-only">搜索工具或格式</span>
            <input
              type="search"
              value={query}
              placeholder="搜索工具或格式"
              onChange={(event) => setQuery(event.currentTarget.value)}
            />
          </label>
          <nav className="online-tool-directory-tabs" aria-label="工具分类筛选">
            <button type="button" className={activeFilter === "all" ? "active" : ""} aria-pressed={activeFilter === "all"} onClick={() => chooseFilter("all")}>全部</button>
            {unifiedToolCategories.map((category) => (
              <button
                type="button"
                className={activeFilter === category.id ? "active" : ""}
                aria-pressed={activeFilter === category.id}
                key={category.id}
                onClick={() => chooseFilter(category.id)}
              >
                {category.label.replace("工具", "")}
              </button>
            ))}
          </nav>
        </div>
      </section>

      <section className="online-tool-directory-browser" aria-label="全部在线工具">
        <nav className="online-tool-directory-sidebar" aria-label="工具分类导航">
          <button type="button" className={activeFilter === "all" ? "active" : ""} aria-pressed={activeFilter === "all"} onClick={() => chooseFilter("all")}>
            <ListOrdered aria-hidden="true" size={17} />
            <span>全部工具</span>
            <small>{unifiedTools.length}</small>
          </button>
          {unifiedToolCategories.map((category) => {
            const Icon = categoryIcons[category.id];
            return (
              <button
                type="button"
                className={activeFilter === category.id ? "active" : ""}
                aria-pressed={activeFilter === category.id}
                key={category.id}
                onClick={() => chooseFilter(category.id)}
              >
                <Icon aria-hidden="true" size={17} />
                <span>{category.label}</span>
                <small>{category.tools.length}</small>
              </button>
            );
          })}
        </nav>

        <div className="online-tool-directory-results">
          <header>
            <div>
              <p>{activeFilter === "all" ? "全部工具" : unifiedToolCategories.find((category) => category.id === activeFilter)?.label}</p>
              <span>{query ? `找到 ${visibleTools.length} 项结果` : `共 ${visibleTools.length} 项工具`}</span>
            </div>
          </header>
          {visibleTools.length ? (
            <div className="online-tool-directory-grid">
              {visibleTools.map((tool) => {
                const category = getUnifiedToolCategory(tool.id);
                const Icon = toolIcons[tool.id] || FileText;
                return (
                  <Link href={getUnifiedToolHref(tool)} data-category={category?.id} key={tool.id}>
                    <span className="online-tool-directory-icon"><Icon aria-hidden="true" size={23} /></span>
                    <span className="online-tool-directory-card-copy">
                      <strong>{tool.label}</strong>
                      <small>{tool.description}</small>
                    </span>
                    <ArrowRight className="online-tool-directory-arrow" aria-hidden="true" size={16} />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="online-tool-directory-empty">
              <strong>没有找到匹配的工具</strong>
              <span>尝试搜索“PDF”“图片”“音频”，或切换到全部分类。</span>
              <button type="button" onClick={() => { setQuery(""); setActiveFilter("all"); }}>查看全部工具</button>
            </div>
          )}
        </div>
      </section>

      {adsConfig.enabled ? (
        <section
          id="baidu-tool-directory-ad-container"
          className="online-tool-directory-ad"
          aria-label="百度联盟广告区域"
          data-ad-provider="baidu"
        >
          <span>广告</span>
          <AdSlot config={adsConfig} name="toolBottom" className="v2-tool-directory-ad-slot" />
        </section>
      ) : null}

      <section className="online-tool-directory-offline" aria-label="Windows 离线版">
        <span className="online-tool-directory-offline-icon"><MonitorDown aria-hidden="true" size={25} /></span>
        <div>
          <strong>需要批量处理？</strong>
          <span>Windows 离线版支持多文件队列、文件夹监控和本地目录输出。</span>
        </div>
        <Link href={siteConfig.links.download}>查看 Windows 离线版 <ArrowRight aria-hidden="true" size={16} /></Link>
      </section>
    </main>
  );
}
