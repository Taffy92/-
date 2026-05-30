# 离线版界面设计代码交接稿

生成时间：2026-05-30  
项目：万能格式转换器  
目标界面：Windows 离线专业版  
主要实现文件：`apps/web/src/components/tools/ToolsClient.tsx`、`apps/web/src/app/globals.css`

## 1. 交接说明

这份文档用于交给专业 UI / 前端人员继续修改离线版界面。  
当前离线版不是单独一套页面，而是复用 Web 前端，在 Tauri 离线壳中通过 `surface="desktop"` 切换到离线专业版工作台。

请注意以下硬性边界：

- 不新增登录、注册、会员、云端转换 API。
- 不改变 LOGO、隐私原则、本地处理原则。
- 离线版不强制联网加载广告。
- 用户文件、Canvas、Blob、ArrayBuffer、转换结果不得上传第三方服务。
- 批量处理、输出目录、sidecar FFmpeg、本地历史记录等离线功能不能删。
- 修改 UI 时优先改视觉层和布局层，不要改转换逻辑。

## 2. 当前入口关系

`apps/web/src/app/tools/page.tsx`

```tsx
import { isDesktopApp } from "@/config/appMode";
import { ToolsClient } from "@/components/tools/ToolsClient";

export default function ToolsPage() {
  return <ToolsClient surface={isDesktopApp ? "desktop" : "web"} />;
}
```

离线版运行时，`isDesktopApp` 为 `true`，会进入：

```tsx
export function ToolsClient({ surface = isDesktopApp ? "desktop" : "web" }: { surface?: "web" | "desktop" }) {
  const isDesktopSurface = surface === "desktop";
  const tabs = isDesktopSurface ? desktopTabs : webTabs;
}
```

## 3. 离线版功能导航结构

`desktopTabs` 决定离线版包含哪些工具；这里保留在线功能，并额外启用离线批量处理。

```tsx
const desktopTabs: ToolTab[] = [
  ...webTabs.filter((tab) => tab.id !== "download" && tab.id !== "batch-gate"),
  { id: "batch", label: "离线批量处理", description: "多文件打包导出", kind: "batch", icon: Files, featured: true }
];
```

左侧分类导航由 `desktopNavSections` 控制：

```tsx
const desktopNavSections = [
  {
    title: "图片工具",
    description: "裁剪 / 水印 / 压缩 / 尺寸",
    icon: Image,
    items: [
      { id: "crop", label: "裁剪", note: "适合头像和取景", badge: "裁" },
      { id: "watermark", label: "加水印", note: "文字 / 图片", badge: "水" },
      { id: "compress", label: "压缩", note: "JPG / 质量控制", badge: "压" },
      { id: "resize", label: "尺寸调整", note: "像素 / 百分比", badge: "尺" }
    ]
  },
  {
    title: "文档工具",
    description: "PDF / Word / Excel",
    icon: FileText,
    items: [
      { id: "pdf-images", label: "PDF 转图片", note: "逐页 / 合成", badge: "PDF" },
      { id: "word-images", label: "Word 转图片", note: "DOCX", badge: "Word" },
      { id: "excel-images", label: "Excel 转图片", note: "XLSX / CSV", badge: "Excel" }
    ]
  },
  {
    title: "音视频工具",
    description: "视频转换 / 提取 / 音频转换",
    icon: Video,
    items: [
      { id: "video-convert", label: "视频格式转换", note: "MP4 / MOV", badge: "视频" },
      { id: "video-audio", label: "视频提取音频", note: "导出音轨", badge: "提取" },
      { id: "audio-convert", label: "音频格式转换", note: "MP3 / WAV", badge: "音频" }
    ]
  },
  {
    title: "批量处理",
    description: "离线队列 / 历史 / 导出",
    icon: Files,
    items: [
      { id: "batch", label: "批量队列", note: "多文件顺序处理", badge: "队列" }
    ]
  }
] as const;
```

## 4. 离线版主界面布局代码

当前离线版为三栏工作台：

- 顶部：离线专业版命令栏
- 左侧：分类导航
- 中间：预览区、文件拖拽区、任务队列、进度和历史
- 右侧：属性面板、导出设置、任务信息、本地后端

核心结构：

```tsx
if (isDesktopSurface) {
  return (
    <main className="office-workbench min-h-[calc(100vh-64px)] bg-[#f4f7fb] text-slate-900">
      <section className="mx-auto max-w-[1760px] px-4 py-4 sm:px-6 lg:px-7">
        <DesktopOfficeChrome
          statusText={desktopStatusText}
          taskCount={taskCount}
          successCount={successCount}
          failureCount={failureCount}
          outputDirectory={outputDirectory}
          onPickFile={() => inputRef.current?.click()}
          onPickFolder={() => void importFolder()}
          onSelectOutput={() => void selectOutputDirectory()}
          onStart={() => void runCurrentTask()}
          onStop={cancelTask}
          onClearCompleted={clearAllBatchTasks}
          onOpenOutput={() => void openOutputDirectory()}
          onExportLog={() => void exportBatchLog()}
          canStart={canStartTask}
          canStop={status === "running"}
          isRunning={status === "running"}
        />

        <div className="mt-4 grid gap-4 xl:grid-cols-[292px_minmax(0,1fr)_344px]">
          <aside className="tech-shell h-fit p-3 xl:sticky xl:top-4">
            {/* 左侧分类导航 */}
          </aside>

          <section className="min-w-0 space-y-4">
            {/* 中间工作台：预览、拖拽、队列、进度、历史 */}
          </section>

          <aside id="settings-panel" className="tech-shell h-fit scroll-mt-24 p-3 xl:sticky xl:top-4">
            {/* 右侧属性面板 */}
          </aside>
        </div>
      </section>
    </main>
  );
}
```

## 5. 顶部命令栏组件

组件名：`DesktopOfficeChrome`

设计定位：离线版的“窗口内工具栏”，类似专业桌面软件顶部操作区。  
这里不建议做成营销式 Hero，应保持密集、清楚、可扫描。

```tsx
function DesktopOfficeChrome({
  statusText,
  taskCount,
  successCount,
  failureCount,
  outputDirectory,
  onPickFile,
  onPickFolder,
  onSelectOutput,
  onStart,
  onStop,
  onClearCompleted,
  onOpenOutput,
  onExportLog,
  canStart,
  canStop,
  isRunning
}: DesktopOfficeChromeProps) {
  const summaryChips = [
    { label: "离线可用", value: statusText, tone: "emerald" as const },
    { label: "任务", value: String(taskCount) },
    { label: "成功", value: String(successCount), tone: "emerald" as const },
    { label: "失败", value: String(failureCount), tone: "rose" as const },
    { label: "输出目录", value: outputDirectory.label }
  ];

  const quickActionClass =
    "inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/35 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-900/60 disabled:text-slate-500";

  return (
    <div className="rounded-lg border border-slate-700/80 bg-[#07101d]/92 px-4 py-3 shadow-[0_16px_45px_rgba(0,0,0,0.28)]">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <img src="/icons/app-icon-64.png" alt="万能格式转换器" className="h-10 w-10 shrink-0 rounded-xl object-cover shadow-[0_0_24px_rgba(34,211,238,0.18)]" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-semibold text-slate-50">万能格式转换器</h1>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-200">离线专业版</span>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-400">本地处理 · 批量高效 · 简洁稳定 · 适合内网办公环境</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {summaryChips.map((item) => (
            <div key={item.label} className="rounded-lg border border-slate-700/70 bg-slate-950/65 px-3 py-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">{item.label}</p>
              <p className="mt-0.5 truncate text-sm font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-800/90 pt-3">
        <button className={quickActionClass} type="button" onClick={onPickFile}>添加文件</button>
        <button className={quickActionClass} type="button" onClick={onPickFolder}>添加文件夹</button>
        <button className={quickActionClass} type="button" onClick={onSelectOutput}>输出目录</button>
        <button className={quickActionClass} type="button" disabled={!canStart} onClick={onStart}>开始处理</button>
        <button className={quickActionClass} type="button" disabled={!canStop} onClick={onStop}>停止处理</button>
        <button className={quickActionClass} type="button" onClick={onClearCompleted}>清空队列</button>
        <button className={quickActionClass} type="button" onClick={onOpenOutput}>打开输出</button>
        <button className={quickActionClass} type="button" onClick={onExportLog}>导出日志</button>
        <span>{isRunning ? "处理中" : statusText}</span>
      </div>
    </div>
  );
}
```

## 6. 左侧分类导航组件

组件名：`DesktopTreeSection`

当前视觉：深色折叠树、青色高亮。  
可改方向：更像 Windows 专业工具，可改为浅色左栏、黑色文字、蓝色竖线选中态。

```tsx
function DesktopTreeSection({
  section,
  activeTab,
  expanded,
  onToggle,
  onSelectTab
}: DesktopTreeSectionProps) {
  const SectionIcon = section.icon;

  return (
    <section className="rounded-lg border border-slate-700/80 bg-slate-950/72">
      <button
        className="flex w-full items-center justify-between gap-3 border-b border-slate-800/90 px-3 py-2.5 text-left transition hover:bg-slate-900/45"
        type="button"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md border border-cyan-300/15 bg-cyan-400/10 text-cyan-200">
            <SectionIcon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-50">{section.title}</p>
            <p className="truncate text-[11px] text-slate-500">{section.description}</p>
          </div>
        </div>
      </button>

      {expanded ? (
        <div className="space-y-1 p-2">
          {section.items.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={activeTab === item.id}
              className={activeTab === item.id ? "active-nav-item" : "normal-nav-item"}
              onClick={() => onSelectTab(item.id)}
            >
              <span>{item.badge}</span>
              <span>
                <span>{item.label}</span>
                <span>{item.note}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
```

## 7. 中间预览区组件

组件名：`DesktopPreviewPanel`

职责：

- 没有文件时显示空状态。
- 图片模式显示图片预览。
- PDF / Word / Excel 显示文档渲染预览。
- 视频显示 `<video controls />`。
- 音频显示 `<audio controls />`。
- 不支持预览时显示说明。

```tsx
function DesktopPreviewPanel({
  mode,
  modeLabel,
  file,
  fileUrl,
  previewUrl,
  previewMessage,
  documentPreview,
  summary,
  cropImageRef,
  onImageLoad
}: DesktopPreviewPanelProps) {
  const isImageMode = mode === "crop" || mode === "resize" || mode === "watermark" || mode === "compress" || mode === "batch";
  const isDocumentMode = mode === "pdf-images" || mode === "word-images" || mode === "excel-images";
  const isVideoMode = mode === "video-convert" || mode === "video-audio";
  const isAudioMode = mode === "audio-convert";
  const imagePreview = previewUrl && (mode === "resize" || mode === "watermark") ? previewUrl : fileUrl;

  let previewBody: React.ReactNode;

  if (!file) {
    previewBody = <div>先添加文件，再在这里查看预览。</div>;
  } else if (file && isImageFile(file) && isImageMode && imagePreview) {
    previewBody = <img ref={mode === "crop" ? cropImageRef : undefined} src={imagePreview} alt={`${modeLabel}预览`} onLoad={mode === "crop" ? onImageLoad : undefined} />;
  } else if (file && (isPdfFile(file) || isWordFile(file) || isExcelFile(file)) && isDocumentMode && documentPreview.url) {
    previewBody = <img src={documentPreview.url} alt={`${modeLabel}预览`} />;
  } else if (file && isVideoFile(file) && isVideoMode && fileUrl) {
    previewBody = <video src={fileUrl} controls />;
  } else if (file && isAudioFile(file) && isAudioMode && fileUrl) {
    previewBody = <audio src={fileUrl} controls />;
  } else {
    previewBody = <div>{previewMessage || documentPreview.message || "当前类型暂不展示图像式预览。"}</div>;
  }

  return (
    <section className="rounded-lg border border-slate-700/80 bg-slate-950/72 p-4">
      <div>
        <p className="text-xs font-semibold text-cyan-300">预览区</p>
        <h3 className="mt-1 text-lg font-semibold text-slate-50">当前文件预览</h3>
      </div>
      <div className="mt-4 rounded-lg border border-slate-800/90 bg-slate-950/80 p-3">
        {previewBody}
      </div>
    </section>
  );
}
```

## 8. 右侧属性面板组件

组件名：`DesktopPropertySection`、`DesktopPropertyRow`

右侧面板不要做成说明书，应更像“属性检查器”。  
字段建议保留：当前参数、导出设置、任务信息、本地后端。

```tsx
function DesktopPropertySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-700/80 bg-slate-950/60 p-3">
      <h3 className="border-b border-slate-800/80 pb-2 text-sm font-semibold text-slate-50">{title}</h3>
      <div className="mt-3 space-y-2.5">{children}</div>
    </section>
  );
}

function DesktopPropertyRow({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-md border border-slate-800/90 bg-slate-950/55 p-3 text-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="text-slate-400">{label}</span>
        <span className="text-right font-semibold text-slate-100">{value}</span>
      </div>
      {note ? <p className="mt-1 text-xs text-slate-500">{note}</p> : null}
    </div>
  );
}
```

## 9. 当前 CSS 设计变量

文件：`apps/web/src/app/globals.css`

```css
:root {
  --surface-page: #f3f6fa;
  --surface-panel: #ffffff;
  --surface-muted: #eef3f8;
  --surface-strong: #0f172a;
  --border-soft: #cbd5e1;
  --border-strong: #94a3b8;
  --text-main: #0f172a;
  --text-muted: #475569;
  --text-soft: #64748b;
  --action-main: #1e293b;
  --action-hover: #0f172a;
  --accent-blue: #0369a1;
  --success-soft: #ecfdf5;
  --success-text: #047857;
  color-scheme: light;
  background: var(--surface-page);
}
```

离线版当前通过 `.office-workbench` 做视觉隔离：

```css
.office-workbench {
  color: var(--text-main);
}

.office-workbench .tech-shell,
.office-workbench .tool-card,
.office-workbench .tech-panel,
.office-workbench .tech-muted-panel {
  border-color: var(--border-soft);
  border-radius: 6px;
  background: var(--surface-panel);
  color: var(--text-main);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
  backdrop-filter: none;
}

.office-workbench .btn-primary {
  background-color: var(--action-main) !important;
  border-color: var(--action-main) !important;
  color: #ffffff !important;
  border-radius: 3px;
  box-shadow: none;
}

.office-workbench .form-input {
  border-color: var(--border-soft) !important;
  border-radius: 3px;
  background-color: var(--surface-panel) !important;
  color: var(--text-main) !important;
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.04);
}
```

## 10. 推荐修改方向

### 方向 A：浅色专业工作台

适合大众用户和办公用户。  
建议：

- 背景：`#f3f6fa`
- 面板：白色
- 边框：`#cbd5e1`
- 主文字：`#0f172a`
- 选中态：蓝色竖线 + 浅蓝背景
- 顶部命令栏：白底或深蓝底均可，但按钮必须清楚。

### 方向 B：深色专业工具台

适合强调“专业版”的质感。  
建议：

- 深色只保留在顶部栏和核心工作区。
- 文本必须避免灰度过低。
- 选中项不要使用白字浅底。
- 输入框、选择框要有明确边界。

### 方向 C：混合式

推荐方案。  
顶部命令栏深色，左右面板和中间工作区浅色。这样既保留专业感，又降低长时间使用疲劳。

## 11. 不能破坏的功能点

专业人员修改 UI 时，请逐项确认：

- 添加单文件。
- 添加文件夹。
- 选择输出目录。
- 开始处理。
- 停止处理。
- 清空队列。
- 打开输出目录。
- 导出日志。
- 图片裁切、尺寸调整、水印、压缩。
- PDF、Word、Excel 转图片。
- 视频转换、音频转换、视频提取音频。
- 离线批量处理。
- 批量任务成功、失败、重试、取消、打开结果。
- 本地后端 / sidecar FFmpeg 状态显示。
- 任务历史只保存在本机。
- 文件不上传服务器。

## 12. 修改后验收清单

建议每次改完 UI 后至少跑：

```powershell
npm run build:web
npm test
npm run check:privacy
npm run check:network
```

离线版包验证：

```powershell
npm run package:desktop
```

人工检查：

- 1120px 最小窗口宽度下不横向挤坏。
- 1280 x 820 默认窗口下顶部命令栏不换行过乱。
- 1366 x 768 笔记本屏幕可完成基本操作。
- 高 DPI 显示下图标和文字清晰。
- 拖拽区、按钮、下拉框、滑块、文件表格均可点击。
- 运行中、成功、失败、禁用状态有明显差异。

## 13. 给设计师的备注

这不是营销网站界面，而是给普通人和办公人员长期使用的本地工具。  
界面应当：

- 干净。
- 稳定。
- 信息密度适中。
- 视觉不要花。
- 按钮和状态要明确。
- 不要大面积使用渐变和装饰图形。
- 不要把“说明文字”放得比操作区域更抢眼。
- 不要为了好看牺牲批量队列、输出目录、失败原因这些专业工具信息。

建议优先修改：

1. 顶部命令栏视觉。
2. 左侧导航选中态。
3. 中间预览和拖拽区。
4. 右侧属性面板。
5. 任务队列表格。
6. 进度、失败、成功状态。

只要保留现有组件边界，专业人员可以主要改 Tailwind class 和 CSS 变量，不需要重写转换逻辑。
