const params = new URLSearchParams(window.location.search);
const screen = params.get("screen") || "home";
const state = params.get("state") || "selected";
const toolKind = params.get("tool") || "image";
const detail = params.get("detail") || "";

const logo = "/apps/web/public/icons/matrix-logo.svg";
const asset = (name) => `/verification/ui-direction-2026/assets/${name}`;

const toolGroups = [
  {
    id: "image",
    label: "图片工具",
    short: "图片",
    summary: "格式、画面、尺寸与元数据",
    tools: [
      ["图片格式转换", true],
      ["图片裁切", false],
      ["像素/百分比调整", true],
      ["添加水印", true],
      ["图片压缩", true],
      ["旋转与翻转", false],
      ["EXIF 查看与清理", true],
    ],
  },
  {
    id: "pdf",
    label: "PDF 工具",
    short: "PDF",
    summary: "页面、文件与图片互转",
    tools: [
      ["PDF 转图片", true],
      ["图片合成 PDF", false],
      ["PDF 合并", false],
      ["PDF 拆分与提取", false],
      ["PDF 页面管理", false],
      ["PDF 水印与页码", false],
    ],
  },
  {
    id: "document",
    label: "文档工具",
    short: "文档",
    summary: "Word 与 Excel 输出图片",
    tools: [
      ["Word 转图片", true],
      ["Excel 转图片", true],
    ],
  },
  {
    id: "media",
    label: "音视频工具",
    short: "音视频",
    summary: "转换、裁剪、提取与增强",
    tools: [
      ["视频格式转换", true],
      ["音频格式转换", true],
      ["视频提取音频", true],
      ["音视频裁剪", false],
      ["视频静音", false],
      ["视频截图", true],
      ["视频转 GIF", false],
      ["音频增强", false],
    ],
  },
  {
    id: "ocr",
    label: "OCR 工具",
    short: "OCR",
    summary: "图片 / PDF 文字识别",
    tools: [["图片 / PDF 文字识别", true]],
  },
];

const iconPaths = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3z"/><path d="m9 12 2 2 4-4"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h6"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
  film: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 4v16M17 4v16M2 9h5M17 9h5M2 15h5M17 15h5"/>',
  scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 8h10M7 12h10M7 16h6"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M20 15v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
  check: '<path d="m20 6-11 11-5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  play: '<path d="m5 3 14 9-14 9z"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="1"/>',
};

function icon(name, className = "") {
  return `<svg class="icon ${className}" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name]}</svg>`;
}

function brand() {
  return `<a class="brand" href="?screen=home"><img src="${logo}" alt="" /><span>万能格式转换器</span></a>`;
}

function header(active = "在线工具") {
  return `
    <header class="site-header">
      <div class="header-inner">
        ${brand()}
        <nav class="main-nav" aria-label="主导航">
          ${["首页", "在线工具", "使用教程", "离线版", "关于"].map((item) => `<a class="${item === active ? "active" : ""}" href="${item === "首页" ? "?screen=home" : "#"}">${item}</a>`).join("")}
        </nav>
        <div class="header-actions">
          <button class="text-button support-trigger" type="button" data-state="support">支持作者</button>
          <button class="mobile-catalog-trigger" type="button" data-state="catalog">${icon("grid")}<span>工具</span></button>
        </div>
      </div>
    </header>`;
}

function footer() {
  return `
    <footer class="site-footer">
      <div><strong>万能格式转换器</strong><span>文件转换，留在本机。</span></div>
      <nav aria-label="页脚导航"><a href="#">隐私说明</a><a href="#">使用条款</a><a href="#">开源许可</a><a href="#">联系我们</a></nav>
    </footer>`;
}

function categories(active = "") {
  return `
    <nav class="category-bar" aria-label="工具分类">
      <div class="category-bar-inner">
        ${toolGroups.map((group, index) => `
          <button class="${group.id === active ? "active" : ""}" type="button" data-state="catalog" data-category-jump="${group.id}">
            <span class="category-index">${String(index + 1).padStart(2, "0")}</span>
            <span><strong>${group.label}</strong><small>${group.summary}</small></span>
          </button>`).join("")}
      </div>
    </nav>`;
}

function homeDemo() {
  return `
    <section class="home-demo" aria-label="PDF 转图片操作预览">
      <header class="demo-head">
        <div><span class="eyebrow">在线工具 / PDF 工具</span><h2>PDF 转图片</h2></div>
        <span class="local-state">${icon("shield")}本地处理</span>
      </header>
      <div class="demo-file">
        <img src="${asset("word-first-page.jpg")}" alt="产品手册 PDF 第一页预览" />
        <div><strong title="2026年度产品使用手册_中文完整版_最终审核稿.pdf">2026年度产品使用手册_中文完整版_最终审核稿.pdf</strong><span>PDF · 45.6 MB · 13 页</span></div>
        <span class="read-state">${icon("check")}已读取</span>
      </div>
      <div class="demo-settings">
        <div><span>输出范围</span><strong>全部 13 页</strong></div>
        <div><span>图片格式</span><strong>JPG · 高质量</strong></div>
      </div>
      <div class="demo-result">
        <div><strong>文件已就绪</strong><span>关闭页面后，文件和结果将从页面内存清除</span></div>
        <button class="primary" type="button">开始转换</button>
      </div>
    </section>`;
}

function home() {
  return `
    <div class="a2-shell home-page">
      ${header("首页")}
      <main>
        <section class="home-hero">
          <div class="home-copy">
            <span class="eyebrow">本地格式转换工具</span>
            <h1>文件转换，留在本机。</h1>
            <p class="home-lead">处理图片、PDF、文档、音频和视频，无需登录，也不上传用户文件。选择具体任务即可开始。</p>
            <div class="home-actions"><button class="primary large" type="button" data-state="catalog">${icon("grid")}选择在线工具</button><a class="secondary large" href="#">下载 Windows 离线版</a></div>
            <div class="trust-line">
              <span>${icon("shield")}浏览器本地处理</span>
              <span>单文件在线使用</span>
              <span>批量任务在离线版完成</span>
            </div>
          </div>
          ${homeDemo()}
        </section>
        <section class="home-directory" aria-labelledby="home-directory-title">
          <header><div><span class="eyebrow">24 个真实功能</span><h2 id="home-directory-title">按任务选择，不按版本拆分</h2></div><button class="text-link" type="button" data-state="catalog">查看完整工具目录 ${icon("chevron")}</button></header>
          <div class="home-category-list">
            ${toolGroups.map((group, index) => `<button type="button" data-state="catalog" data-category-jump="${group.id}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${group.label}</strong><small>${group.summary}</small>${icon("chevron")}</button>`).join("")}
          </div>
        </section>
        <aside class="ad-region" aria-label="广告位"><span>广告</span><p>在线版保留广告位置；广告与文件操作保持明确边界。</p></aside>
      </main>
      ${footer()}
      ${state === "catalog" ? catalogDialog() : ""}
      ${state === "support" ? supportDialog() : ""}
    </div>`;
}

const toolMeta = {
  image: { category: "图片工具", name: "图片裁切", description: "拖动裁切框调整画面，结果只保存在当前页面。", icon: "image" },
  document: { category: "PDF 工具", name: "PDF 转图片", description: "预览页面并选择输出范围、格式与页面设置。", icon: "file" },
  media: { category: "音视频工具", name: "视频格式转换", description: "在画面和时间线上核对范围，再设置格式与质量。", icon: "film" },
  ocr: { category: "OCR 工具", name: "图片 / PDF 文字识别", description: "对照原文件与识别结果，完成校对、复制和导出。", icon: "scan" },
};

function taskHeader(kind) {
  const meta = toolMeta[kind];
  const stateLabels = { idle: "等待选择", selected: "已读取", running: "正在处理", success: "处理完成", error: "处理失败", cancelled: "已取消" };
  return `
    <header class="tool-heading">
      <div>
        <span class="breadcrumb">在线工具 <b>/</b> ${meta.category} <b>/</b> ${meta.name}</span>
        <div class="tool-title-row"><span class="tool-icon">${icon(meta.icon)}</span><div><h1>${meta.name}</h1><p>${meta.description}</p></div></div>
      </div>
      <span class="state-badge ${state}">${stateLabels[state] || stateLabels.selected}</span>
    </header>`;
}

function compactFile(kind) {
  const data = {
    image: ["thumb-1.jpg", "2026年夏季产品图_横版_最终确认版_客户交付.jpg", "JPG · 4.6 MB · 3840 × 2160", "已选图片缩略图"],
    document: ["word-first-page.jpg", "2026年度产品使用手册_中文完整版_最终审核稿.pdf", "PDF · 45.6 MB · 13 页", "PDF 第一页缩略图"],
    media: ["video-preview.jpg", "航拍风景_4K超清加码素材_自然风光.mp4", "MP4 · 120.3 MB · 00:02:58", "视频首帧"],
    ocr: ["word-first-page.jpg", "售后服务条款_扫描件_第3版.pdf", "PDF · 8.2 MB · 4 页", "待识别 PDF 第一页"],
  }[kind];
  return `
    <div class="compact-file">
      <img src="${asset(data[0])}" alt="${data[3]}" />
      <div class="file-text"><strong title="${data[1]}">${data[1]}</strong><span>${data[2]} · 文件仅在本机处理</span></div>
      <button class="quiet-action" type="button">重新选择</button>
    </div>`;
}

function dropzone(kind) {
  const label = kind === "image" ? "选择图片" : kind === "media" ? "选择视频" : kind === "ocr" ? "选择图片或 PDF" : "选择 PDF 文件";
  return `<button class="dropzone" type="button">${icon("upload")}<span><strong>${label}</strong><small>拖放文件到此处，或点击浏览；在线版每次处理 1 个文件</small></span></button>`;
}

function statePanel(kind) {
  if (["idle", "selected", "catalog", "support"].includes(state)) return "";
  const resultNames = {
    image: "夏季产品图_横版_裁切结果.jpg",
    document: "产品使用手册_第1-13页.zip",
    media: "航拍风景_1080P.mp4",
    ocr: "售后服务条款_识别结果.docx",
  };
  if (state === "running") {
    return `<section class="inline-state running" aria-live="polite"><div><strong>正在本机处理 · 46%</strong><span>${kind === "document" ? "正在生成第 6 / 13 页" : kind === "ocr" ? "正在识别第 2 / 4 页" : "正在生成输出结果"}</span></div><div class="progress"><span></span></div><button class="danger-text" type="button">${icon("stop")}停止处理</button></section>`;
  }
  if (state === "success") {
    return `<section class="inline-state success" aria-live="polite"><div class="state-mark">${icon("check")}</div><div><strong>处理完成</strong><span>已生成：${resultNames[kind]}</span></div><div class="state-actions"><button class="primary" type="button">${icon("download")}下载结果</button><button type="button">继续处理</button></div></section>`;
  }
  if (state === "error") {
    return `<section class="inline-state error" role="alert"><div class="state-mark">${icon("x")}</div><div><strong>处理失败</strong><span>文件可能损坏，或编码暂不受当前工具支持。</span></div><div class="state-actions"><button class="primary" type="button">重新选择</button><button type="button">查看说明</button></div></section>`;
  }
  return `<section class="inline-state cancelled" aria-live="polite"><div><strong>处理已取消</strong><span>原文件未改变，页面内未保留未完成的结果。</span></div><button type="button">重新开始</button></section>`;
}

function field(label, control, extra = "") {
  return `<label class="field"><span>${label}</span>${control}${extra}</label>`;
}

function imageWorkbench() {
  return `
    <div class="workbench image-workbench">
      <section class="workspace-primary">
        <div class="section-head"><div><span class="step-no">01</span><strong>文件与画面</strong></div><span>单文件</span></div>
        ${state === "idle" ? dropzone("image") : compactFile("image")}
        <div class="image-editor">
          <div class="editor-toolbar" aria-label="图片预览操作"><button type="button">适应窗口</button><button type="button">1:1</button><span></span><button type="button">向左旋转</button><button type="button">向右旋转</button></div>
          <div class="image-stage">
            ${state === "idle" ? `<div class="empty-preview">${icon("image")}<span>选择文件后显示图片预览</span></div>` : `<div class="crop-canvas"><img src="${asset("thumb-1.jpg")}" alt="图片裁切区域预览" /><span class="crop-frame" aria-hidden="true"><i></i><i></i><i></i><i></i></span></div>`}
          </div>
          <div class="preview-summary"><span>裁切范围 <strong>3200 × 1800 px</strong></span><span>预计输出 <strong>约 3.8 MB</strong></span></div>
        </div>
        ${statePanel("image")}
      </section>
      <aside class="inspector">
        <div class="section-head"><div><span class="step-no">02</span><strong>输出设置</strong></div><button class="text-link" type="button">恢复默认</button></div>
        <div class="field-stack">
          ${field("裁切比例", '<select><option>自由裁切</option><option>1 : 1</option><option>16 : 9</option></select>')}
          <div class="field-pair">${field("宽度（px）", '<input type="number" value="3200" />')}${field("高度（px）", '<input type="number" value="1800" />')}</div>
          ${field("输出格式", '<select><option>JPG</option><option>PNG</option><option>WebP</option></select>')}
          ${field("输出质量", '<input type="range" min="1" max="100" value="90" />', '<output>90%</output>')}
          ${detail === "long" ? `
            <div class="advanced-fields">
              <h3>更多输出设置</h3>
              ${field("颜色配置", '<select><option>保留原始配置</option><option>sRGB</option></select>')}
              ${field("文件名后缀", '<input type="text" value="_裁切结果" />')}
              <label class="check-field"><input type="checkbox" checked /><span>保留拍摄日期</span></label>
            </div>` : `<button class="expand-button" type="button">更多输出设置 <span>+</span></button>`}
        </div>
        <div class="desktop-primary-action"><button class="primary full" type="button" ${state === "idle" || state === "running" ? "disabled" : ""}>开始转换</button><p>${icon("shield")}处理在浏览器内完成，不上传文件</p></div>
      </aside>
    </div>`;
}

function documentWorkbench() {
  return `
    <div class="workbench document-workbench">
      <section class="document-area">
        <div class="section-head"><div><span class="step-no">01</span><strong>文件与页面</strong></div><span>13 页</span></div>
        ${state === "idle" ? dropzone("document") : compactFile("document")}
        <div class="document-preview">
          <nav class="page-strip" aria-label="页面预览"><button class="active" type="button"><img src="${asset("word-first-page.jpg")}" alt="第 1 页缩略图" /><span>1</span></button><button type="button"><span class="page-mini">2</span><span>2</span></button><button type="button"><span class="page-mini">3</span><span>3</span></button><button type="button"><span class="page-mini">4</span><span>4</span></button></nav>
          <figure class="document-page"><img src="${asset("word-first-page.jpg")}" alt="PDF 第 1 页大图预览" /><figcaption>第 1 / 13 页 · 适应页面</figcaption></figure>
        </div>
        ${statePanel("document")}
      </section>
      <aside class="inspector">
        <div class="section-head"><div><span class="step-no">02</span><strong>页面与输出</strong></div></div>
        <div class="field-stack">
          ${field("输出范围", '<select><option>全部页面</option><option>指定页面</option></select>')}
          ${field("页码", '<input type="text" value="1-13" aria-describedby="page-range-help" />', '<small id="page-range-help">例如：1-3, 6, 9-13</small>')}
          ${field("图片格式", '<select><option>JPG</option><option>PNG</option></select>')}
          ${field("页面质量", '<select><option>清晰（推荐）</option><option>标准</option><option>高质量</option></select>')}
          <label class="check-field"><input type="checkbox" checked /><span>按页码顺序命名</span></label>
        </div>
        <div class="result-structure"><strong>结果组织</strong><span>13 张 JPG 将打包下载；离线版可直接输出到同名文件夹。</span></div>
        <div class="desktop-primary-action"><button class="primary full" type="button" ${state === "idle" || state === "running" ? "disabled" : ""}>开始转换</button><p>${icon("shield")}PDF 内容不会离开当前设备</p></div>
      </aside>
    </div>`;
}

function mediaWorkbench() {
  return `
    <div class="workbench media-workbench">
      <section class="media-area">
        <div class="section-head"><div><span class="step-no">01</span><strong>画面与时间范围</strong></div><span>00:02:58</span></div>
        ${state === "idle" ? dropzone("media") : compactFile("media")}
        <div class="video-stage">
          <img src="${asset("video-preview.jpg")}" alt="视频画面预览" />
          <button class="play-button" type="button" aria-label="播放视频">${icon("play")}</button>
          <span class="timecode">00:00:24 / 00:02:58</span>
        </div>
        <div class="timeline" aria-label="视频时间范围预览">
          <div class="waveform">${Array.from({ length: 48 }, (_, i) => `<i style="height:${12 + ((i * 17) % 31)}px"></i>`).join("")}</div>
          <div class="range-window"><span></span><span></span></div>
          <div class="timeline-labels"><span>00:00:00</span><strong>选择范围 00:00:12—00:02:42</strong><span>00:02:58</span></div>
        </div>
        ${statePanel("media")}
      </section>
      <aside class="inspector">
        <div class="section-head"><div><span class="step-no">02</span><strong>格式与质量</strong></div></div>
        <div class="field-stack">
          ${field("输出格式", '<select><option>MP4</option><option>WebM</option></select>')}
          ${field("画面质量", '<select><option>1080P · 推荐</option><option>720P</option></select>')}
          <div class="field-pair">${field("开始时间", '<input type="text" value="00:00:12" />')}${field("结束时间", '<input type="text" value="00:02:42" />')}</div>
          ${field("音频", '<select><option>保留原音频</option><option>静音</option></select>')}
        </div>
        <div class="media-summary"><span>预计输出</span><strong>约 94 MB</strong><small>估算仅用于核对参数，不代表处理性能。</small></div>
        <div class="desktop-primary-action"><button class="primary full" type="button" ${state === "idle" || state === "running" ? "disabled" : ""}>开始转换</button><p>${icon("shield")}音视频在当前浏览器内处理</p></div>
      </aside>
    </div>`;
}

function ocrWorkbench() {
  return `
    <div class="ocr-workbench">
      <section class="ocr-source">
        <div class="section-head"><div><span class="step-no">01</span><strong>原文件</strong></div><span>第 1 / 4 页</span></div>
        ${state === "idle" ? dropzone("ocr") : compactFile("ocr")}
        <figure class="ocr-page"><img src="${asset("word-first-page.jpg")}" alt="OCR 原文件第 1 页预览" /><figcaption>可缩放核对原文</figcaption></figure>
      </section>
      <section class="ocr-result">
        <div class="section-head"><div><span class="step-no">02</span><strong>识别结果</strong></div><span class="ocr-confidence">中文 + 英文</span></div>
        <div class="ocr-controls">
          ${field("识别语言", '<select><option>中文 + 英文</option><option>中文</option><option>英文</option></select>')}
          ${field("导出格式", '<select><option>Word</option><option>TXT</option></select>')}
        </div>
        <label class="ocr-text"><span>识别文本</span><textarea rows="12">售后服务条款

一、服务范围
本产品提供格式转换、页面处理与文字识别功能。文件处理在当前设备完成，不会上传至第三方服务。

二、文件保存
在线处理结果仅保存在当前页面内存中，请在关闭页面前下载结果。</textarea></label>
        ${statePanel("ocr")}
        <div class="ocr-actions"><button type="button">${icon("copy")}复制文本</button><button class="primary" type="button">${icon("download")}下载 Word</button></div>
      </section>
    </div>`;
}

function toolPage() {
  const current = toolMeta[toolKind] || toolMeta.image;
  const content = toolKind === "document" ? documentWorkbench() : toolKind === "media" ? mediaWorkbench() : toolKind === "ocr" ? ocrWorkbench() : imageWorkbench();
  return `
    <div class="a2-shell tool-page" data-tool-kind="${toolKind}" data-process-state="${state}">
      ${header("在线工具")}
      ${categories(toolKind === "document" ? "pdf" : toolKind)}
      <div class="mobile-task-bar"><button type="button" data-state="catalog"><span><small>${current.category}</small><strong>${current.name}</strong></span>${icon("chevron")}</button></div>
      <main class="tool-main">
        ${taskHeader(toolKind)}
        ${content}
        <aside class="ad-region compact-ad" aria-label="广告位"><span>广告</span><p>广告区域与转换操作分隔显示</p></aside>
      </main>
      <div class="mobile-command" aria-label="当前任务主操作">
        <div><span>${state === "running" ? "正在本机处理" : state === "success" ? "结果已生成" : state === "error" ? "可重新选择文件" : state === "cancelled" ? "处理已取消" : "参数已就绪"}</span><strong>${state === "running" ? "46%" : current.name}</strong></div>
        ${state === "running" ? `<button class="danger-outline" type="button">停止</button>` : state === "success" ? `<button class="primary" type="button">下载结果</button>` : state === "error" ? `<button class="primary" type="button">重新选择</button>` : `<button class="primary" type="button" ${state === "idle" ? "disabled" : ""}>开始转换</button>`}
      </div>
      ${state === "catalog" ? catalogDialog() : ""}
      ${state === "support" ? supportDialog() : ""}
    </div>`;
}

function catalogDialog() {
  return `
    <div class="dialog-overlay catalog-overlay" role="presentation">
      <section class="catalog-dialog" role="dialog" aria-modal="true" aria-labelledby="catalog-title">
        <header class="catalog-header">
          <div><span class="eyebrow">在线工具目录</span><h2 id="catalog-title">选择具体任务</h2><p>五个分类，24 个真实功能。工具名称在在线版和离线版保持一致。</p></div>
          <button class="icon-button" type="button" data-close aria-label="关闭工具目录">${icon("x")}</button>
        </header>
        <div class="catalog-controls">
          <label class="catalog-search"><span class="sr-only">搜索工具</span>${icon("search")}<input type="search" placeholder="搜索格式、文件或操作" /></label>
          <nav class="catalog-jumps" aria-label="快速定位分类">${toolGroups.map((group) => `<a href="#a2-${group.id}">${group.short}</a>`).join("")}</nav>
        </div>
        <p class="batch-legend"><span class="batch-mark" aria-hidden="true"></span>带方框标记的工具支持 Windows 离线版批量能力；在线入口仍按现有范围使用。</p>
        <div class="catalog-body">
          ${toolGroups.map((group, groupIndex) => `
            <section class="catalog-section" id="a2-${group.id}" data-category="${group.id}">
              <header><span>${String(groupIndex + 1).padStart(2, "0")}</span><div><h3>${group.label}</h3><p>${group.summary}</p></div><small>${group.tools.length} 项</small></header>
              <div class="catalog-tools">
                ${group.tools.map(([name, batch]) => `<button type="button" data-tool-name="${name}" data-open-tool="${group.id}"><span>${name}</span>${batch ? `<i class="batch-mark" role="img" aria-label="支持 Windows 离线版批量能力" title="支持 Windows 离线版批量能力"></i>` : ""}${icon("chevron")}</button>`).join("")}
              </div>
            </section>`).join("")}
        </div>
      </section>
    </div>`;
}

function supportDialog() {
  return `
    <div class="dialog-overlay support-overlay" role="presentation">
      <section class="support-dialog" role="dialog" aria-modal="true" aria-labelledby="support-title">
        <header><div><span class="eyebrow">自愿支持</span><h2 id="support-title">支持作者</h2></div><button class="icon-button" type="button" data-close aria-label="关闭支持作者对话框">${icon("x")}</button></header>
        <p>如果这个工具帮你节省了时间，可以自愿支持后续维护。赞赏不影响任何功能，也不会收集或上传文件。</p>
        <div class="qr-grid">
          <figure><div class="qr-safe"><img src="/verification/ui-v2-prototypes/assets/wechat-reward-qr.png" alt="微信赞赏码" /></div><figcaption>微信赞赏 · 保留二维码静区</figcaption></figure>
          <figure><div class="qr-safe"><img src="/verification/ui-v2-prototypes/assets/alipay-reward-qr.png" alt="支付宝赞赏码" /></div><figcaption>支付宝赞赏 · 保留二维码静区</figcaption></figure>
        </div>
        <div class="support-note">${icon("shield")}支持作者、离线授权和文件处理是三个独立流程。</div>
      </section>
    </div>`;
}

function render() {
  document.getElementById("app").innerHTML = screen === "home" ? home() : toolPage();
  document.querySelector('[role="dialog"] button')?.focus();
}

document.addEventListener("click", (event) => {
  const stateButton = event.target.closest("[data-state]");
  if (stateButton) {
    const next = new URL(window.location.href);
    next.searchParams.set("state", stateButton.dataset.state);
    if (stateButton.dataset.state === "catalog" && screen !== "home") next.searchParams.set("screen", "tool");
    window.location.href = next.toString();
    return;
  }
  const toolButton = event.target.closest("[data-open-tool]");
  if (toolButton) {
    const mapping = { image: "image", pdf: "document", document: "document", media: "media", ocr: "ocr" };
    const next = new URL(window.location.href);
    next.searchParams.set("screen", "tool");
    next.searchParams.set("tool", mapping[toolButton.dataset.openTool]);
    next.searchParams.set("state", "selected");
    window.location.href = next.toString();
    return;
  }
  if (event.target.closest("[data-close]")) {
    const next = new URL(window.location.href);
    next.searchParams.set("state", screen === "home" ? "selected" : "selected");
    window.location.href = next.toString();
  }
});

document.addEventListener("input", (event) => {
  if (!event.target.matches(".catalog-search input")) return;
  const query = event.target.value.trim().toLocaleLowerCase();
  document.querySelectorAll("[data-tool-name]").forEach((button) => {
    button.hidden = query && !button.dataset.toolName.toLocaleLowerCase().includes(query);
  });
  document.querySelectorAll(".catalog-section").forEach((section) => {
    section.hidden = !section.querySelector("[data-tool-name]:not([hidden])");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.querySelector(".dialog-overlay")) {
    const next = new URL(window.location.href);
    next.searchParams.set("state", "selected");
    window.location.href = next.toString();
  }
});

render();
