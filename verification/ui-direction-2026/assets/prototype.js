const params = new URLSearchParams(window.location.search);
const surface = document.body.dataset.surface;
const concept = document.body.dataset.concept;
const screen = params.get("screen") || (surface === "online" ? "home" : "workbench");
const state = params.get("state") || (surface === "online" ? "selected" : "running");
const isSupport = state === "support";
const isLicense = state === "license";
const isAdvanced = state === "advanced";
const isCatalog = state === "catalog";

const asset = (name) => `/verification/ui-direction-2026/assets/${name}`;
const logo = "/apps/web/public/icons/matrix-logo.svg";

const unifiedToolGroups = [
  {
    id: "image",
    label: "图片工具",
    short: "图",
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
    short: "文",
    tools: [
      ["Word 转图片", true],
      ["Excel 转图片", true],
    ],
  },
  {
    id: "media",
    label: "音视频工具",
    short: "视",
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
    tools: [
      ["图片 / PDF 文字识别", true],
    ],
  },
];

const imageFiles = [
  ["2026年夏季产品图_横版_最终确认版.jpg", "JPG · 4.6 MB · 3840 × 2160", "success", "转换成功", "thumb-1.jpg"],
  ["海岸日落宣传图_适配网页首屏_修订3.jpg", "JPG · 2.1 MB · 2560 × 1440", "running", "处理中 65%", "thumb-2.jpg"],
  ["秋色森林小径_损坏副本.webp", "WebP · 1.4 MB · 2560 × 1706", "error", "无法读取文件内容", "thumb-3.jpg"],
  ["城市夜景天际线_活动主视觉.jpg", "JPG · 2.7 MB · 3840 × 2160", "warning", "等待中", "thumb-4.jpg"],
  ["高山草甸云海_横版输出.jpg", "JPG · 1.7 MB · 4032 × 2268", "warning", "等待中", "thumb-5.jpg"],
  ["雪景小镇风光_客户取消.jpg", "JPG · 2.3 MB · 3840 × 2160", "", "已取消", "thumb-6.jpg"]
];

const videoFiles = [
  ["旅行的意义_4K风景延时摄影.mp4", "00:05:32 · 384.7 MB", "running", "处理中 45%", "video-1.jpg"],
  ["城市夜景延时摄影_最终版.mp4", "00:03:15 · 223.4 MB", "running", "处理中 12%", "video-2.jpg"],
  ["产品宣传片_最终版.mp4", "00:02:48 · 198.6 MB", "warning", "等待中", "video-3.jpg"],
  ["家庭聚会_2026.mp4", "00:01:35 · 125.3 MB", "success", "转换成功", "video-4.jpg"],
  ["极简生活方式短片.mp4", "00:04:10 · 312.6 MB", "error", "处理失败", "video-5.jpg"],
  ["航拍中国_山河壮丽.mp4", "00:04:22 · 456.8 MB", "", "已取消", "video-6.jpg"]
];

const wordFiles = [
  ["项目计划书_最终确认版.docx", "10 页 · 1.23 MB", "running", "处理 3/10 页", "word-first-page.jpg"],
  ["市场调研报告_华东区_修订2.docx", "18 页 · 2.45 MB", "error", "第 7 页读取失败", "word-first-page.jpg"],
  ["产品需求文档_移动端重构.docx", "25 页 · 3.12 MB", "success", "转换成功", "word-first-page.jpg"],
  ["用户手册_离线专业版.docx", "32 页 · 4.08 MB", "warning", "等待中", "word-first-page.jpg"],
  ["销售合同模板_法务确认.docx", "12 页 · 1.05 MB", "success", "转换成功", "word-first-page.jpg"],
  ["年度总结报告_研发中心.docx", "15 页 · 1.76 MB", "", "已取消", "word-first-page.jpg"],
  ["培训材料_新员工入职.docx", "28 页 · 3.35 MB", "warning", "等待中", "word-first-page.jpg"],
  ["会议纪要_产品评审会.docx", "6 页 · 0.68 MB", "success", "转换成功", "word-first-page.jpg"]
];

function brand(desktop = false) {
  return `<div class="brand"><img src="${logo}" alt="" /><span>万能格式转换器</span>${desktop ? `<small>离线专业版 · 本地处理</small>` : ""}</div>`;
}

function categoryTabs(activeLabel, className = "category-tabs") {
  return `
    <nav class="${className}" aria-label="统一工具分类">
      ${unifiedToolGroups.map((group) => `<button class="${group.label === activeLabel ? "active" : ""}" type="button" data-set-state="catalog">${group.label}</button>`).join("")}
    </nav>
  `;
}

function toolCatalog({ currentTool, desktop = false }) {
  return `
    <div class="${desktop ? "desktop-catalog-overlay" : "tool-catalog-overlay"}" role="presentation">
      <section class="${desktop ? "desktop-catalog" : "tool-catalog"}" role="dialog" aria-modal="true" aria-labelledby="${desktop ? "desktop-catalog-title" : "tool-catalog-title"}">
        <header class="catalog-head">
          <div><span class="section-label">${desktop ? "离线任务类型" : "统一在线工具目录"}</span><h2 id="${desktop ? "desktop-catalog-title" : "tool-catalog-title"}">按实际任务选择工具</h2></div>
          <button type="button" data-close-overlay aria-label="关闭工具分类">关闭</button>
        </header>
        <div class="catalog-grid">
          ${unifiedToolGroups.map((group) => `
            <section class="catalog-group" data-category="${group.id}">
              <h3><span>${group.short}</span>${group.label}</h3>
              <div class="catalog-items">
                ${group.tools.map(([name, offlineBatch]) => `
                  <button class="${name === currentTool ? "active" : ""}" type="button">
                    <span>${name}</span>
                    ${offlineBatch ? `<small class="scope-tag">离线批量</small>` : ""}
                  </button>
                `).join("")}
              </div>
            </section>
          `).join("")}
        </div>
        ${desktop ? `
          <footer class="catalog-secondary">
            <div><strong>批量任务</strong><span>跟随当前工具创建队列，不重复列出功能。</span></div>
            <div><strong>输出与任务结果</strong><span>选择目录、查看本次任务结果并打开输出位置。</span></div>
          </footer>
        ` : `<footer class="catalog-foot"><span>全部工具按同一分类查找。</span><span><b class="scope-tag">离线批量</b> 表示该工具的批量或目录输出能力仅在 Windows 离线版提供；在线单文件入口仍按当前权限显示。</span></footer>`}
      </section>
    </div>
  `;
}

function onlineHeader(active = "在线工具") {
  return `
    <header class="online-header">
      ${brand(false)}
      <nav aria-label="主导航">
        ${["首页", "在线工具", "使用教程", "离线版", "关于"].map((item) => `<a class="${item === active ? "active" : ""}" href="#">${item}</a>`).join("")}
      </nav>
      <div class="header-actions">
        <button class="quiet" type="button" data-set-state="support">支持作者</button>
        <button class="mobile-tool-switch" type="button" data-set-state="catalog" aria-label="打开工具分类">工具</button>
      </div>
    </header>
  `;
}

function onlineStatePanel(currentState = state, kind = "pdf") {
  const copy = {
    image: {
      running: "正在生成裁切结果，请保持当前页面打开。",
      result: "已生成：2026年夏季产品图_横版_裁切结果.jpg",
      failed: "无法读取“2026年夏季产品图_横版_最终确认版.jpg”",
      reason: "文件可能已损坏，或图片编码暂不受当前工具支持。请重新选择文件，或查看使用说明。",
    },
    video: {
      running: "正在转换视频，请保持当前页面打开。",
      result: "已生成：航拍风景_4K超清加码素材_转换结果.mp4",
      failed: "无法读取“航拍风景_4K超清加码素材.mp4”",
      reason: "文件可能已损坏，或视频编码暂不受当前工具支持。请重新选择文件，或查看使用说明。",
    },
    pdf: {
      running: "正在生成第 6 / 13 页，请保持当前页面打开。",
      result: "已生成：产品手册_第1-13页.zip",
      failed: "无法读取“2026年度资料汇总_最终审核版.pdf”",
      reason: "文件可能已损坏或包含暂不支持的内容。请重新选择文件，或查看使用说明。",
    },
  }[kind];
  if (currentState === "running") {
    return `
      <section class="state-panel" aria-live="polite">
        <div class="status running">正在本机处理 · 46%</div>
        <div class="progress" style="--progress:46%"><span></span></div>
        <p class="muted">${copy.running}</p>
        <div class="state-actions"><button class="danger" type="button">取消转换</button></div>
      </section>
    `;
  }
  if (currentState === "success") {
    return `
      <section class="state-panel success" aria-live="polite">
        <div class="status success">转换完成</div>
        <h3>${copy.result}</h3>
        <p class="muted">结果仅保存在当前页面内存中，关闭页面后将被清除。</p>
        <div class="state-actions"><button class="primary" type="button">下载结果</button><button type="button">继续转换</button></div>
      </section>
    `;
  }
  if (currentState === "error") {
    return `
      <section class="state-panel error" role="alert">
        <div class="status error">处理失败</div>
        <h3>${copy.failed}</h3>
        <p>${copy.reason}</p>
        <div class="state-actions"><button class="primary" type="button">重新选择</button><button type="button">查看说明</button></div>
      </section>
    `;
  }
  return `
    <section class="state-panel">
      <div class="status">参数已就绪</div>
      <p class="muted">确认输出格式与范围后即可开始转换。</p>
    </section>
  `;
}

function selectedOnlineFile(kind = "image") {
  const isPdf = kind === "pdf";
  const isVideo = kind === "video";
  const fileName = isPdf
    ? "2026年度产品使用手册_中文完整版_最终审核稿.pdf"
    : isVideo
      ? "航拍风景_4K超清加码素材_自然风光湖泊森林山脉延时摄影.mp4"
      : "2026年夏季产品图_横版_最终确认版_客户交付.jpg";
  const meta = isPdf ? "PDF · 45.6 MB · 13 页" : isVideo ? "MP4 · 120.3 MB · 00:02:58" : "JPG · 4.6 MB · 3840 × 2160";
  const image = isPdf ? "word-first-page.jpg" : isVideo ? "video-preview.jpg" : "thumb-1.jpg";
  return `
    <div class="file-row">
      <img src="${asset(image)}" alt="${isPdf ? "PDF 第一页缩略图" : isVideo ? "视频首帧" : "已选图片缩略图"}" />
      <div class="min-w-0">
        <div class="file-name" title="${fileName}">${fileName}</div>
        <div class="file-meta">${meta} · 文件仅在本机处理</div>
      </div>
      <span class="status success">已读取</span>
    </div>
  `;
}

function supportDialog() {
  return `
    <div class="support-overlay" role="presentation">
      <section class="support-dialog" role="dialog" aria-modal="true" aria-labelledby="support-title">
        <header class="dialog-head">
          <h2 id="support-title">支持作者</h2>
          <button type="button" aria-label="关闭支持作者弹窗" data-close-overlay>关闭</button>
        </header>
        <div class="dialog-body">
          <p>如果这个工具帮你节省了时间，可以自愿支持后续维护。赞赏完全自愿，不影响任何功能，也不会收集或上传文件。</p>
          <div class="qr-grid">
            <figure><img src="/verification/ui-v2-prototypes/assets/wechat-reward-qr.png" alt="微信赞赏码" /><figcaption>微信赞赏 · 请使用原图扫码</figcaption></figure>
            <figure><img src="/verification/ui-v2-prototypes/assets/alipay-reward-qr.png" alt="支付宝赞赏码" /><figcaption>支付宝赞赏 · 请使用原图扫码</figcaption></figure>
          </div>
          <p class="muted">需要反馈问题时，可通过站内联系入口与作者沟通。支持作者与离线授权是两个独立流程。</p>
        </div>
      </section>
    </div>
  `;
}

function oaHome() {
  return `
    <div class="online-shell oa-home">
      ${onlineHeader("首页")}
      <main>
        <section class="oa-hero">
          <div>
            <span class="section-label">本地格式转换工具</span>
            <h1>文件转换，留在本机。</h1>
            <p>图片、文档、音频和视频都在当前设备处理。无需登录，不上传用户文件；选择工具后即可开始。</p>
            <div class="oa-hero-actions"><button class="primary" data-set-state="catalog">选择在线工具</button><button>下载 Windows 离线版</button></div>
          </div>
          <div class="oa-demo" aria-label="转换流程预览">
            <div class="oa-demo-head"><strong>PDF 转图片</strong><span class="status success">本地处理</span></div>
            <div class="oa-demo-stage"><div><strong>1 选择文件</strong><span class="muted">PDF / 单文件</span></div><div><strong>2 设置参数</strong><span class="muted">页码与格式</span></div><div><strong>3 下载结果</strong><span class="muted">页面内存</span></div></div>
            <div class="oa-demo-foot"><span class="muted">当前未选择文件</span><button class="primary">选择文件</button></div>
          </div>
        </section>
        <div class="oa-sections unified-home-map">
          <section><span class="section-label">图片工具</span><h2>转换、裁切与画面处理</h2><p class="muted">图片格式转换、裁切、尺寸、水印、压缩、旋转翻转、EXIF 清理。</p></section>
          <section><span class="section-label">PDF 工具</span><h2>页面与 PDF 文件整理</h2><p class="muted">PDF 转图片、图片合成 PDF、合并、拆分、页面管理、水印与页码。</p></section>
          <section><span class="section-label">文档工具</span><h2>Word 与 Excel 输出图片</h2><p class="muted">Word 转图片、Excel 转图片；多页批量输出在离线版完成。</p></section>
          <section><span class="section-label">音视频工具</span><h2>转换、裁剪与提取</h2><p class="muted">格式转换、音频提取、裁剪、静音、截图、GIF 与音频增强。</p></section>
          <section><span class="section-label">OCR 工具</span><h2>图片 / PDF 文字识别</h2><p class="muted">中文、英文和中英混合识别，导出 TXT 或 Word。</p></section>
        </div>
      </main>
      ${isCatalog ? toolCatalog({ currentTool: "图片裁切" }) : ""}
    </div>
  `;
}

function oaTool() {
  const shownState = isSupport || isCatalog ? "selected" : state;
  return `
    <div class="online-shell">
      ${onlineHeader("在线工具")}
      ${categoryTabs("图片工具", "oa-tool-cats")}
      <main class="oa-tool">
        <header class="oa-tool-title">
          <div><span class="tool-breadcrumb">在线工具 / 图片工具 / 图片裁切</span><h1>图片裁切</h1><p>拖动裁切框，文件只在当前设备处理。</p></div>
          <span class="status ${shownState === "running" ? "running" : shownState === "error" ? "error" : "success"}">${shownState === "running" ? "处理中" : shownState === "error" ? "处理失败" : "在线 · 本地处理"}</span>
        </header>
        <div class="oa-tool-grid">
          <section class="oa-workflow">
            <div class="oa-step"><b>1</b>选择文件</div>
            <div class="dropzone"><div><strong>拖放图片到这里，或点击选择文件</strong><p>在线版当前工具每次处理 1 个文件</p></div></div>
            ${shownState !== "idle" ? selectedOnlineFile("image") : ""}
            <div class="oa-step"><b>2</b>裁切与预览</div>
            <div class="oa-preview">${shownState === "idle" ? `<span class="muted">选择文件后显示预览</span>` : `<img src="${asset("thumb-1.jpg")}" alt="图片裁切预览" />`}</div>
            ${shownState === "idle" ? "" : onlineStatePanel(shownState, "image")}
          </section>
          <aside class="oa-inspector">
            <h2>输出参数</h2>
            <div class="oa-fields">
              <label class="field"><span>输出格式</span><select><option>JPG</option><option>PNG</option><option>WebP</option></select></label>
              <label class="field"><span>裁切比例</span><select><option>自由裁切</option><option>1 : 1</option><option>16 : 9</option></select></label>
              <label class="field"><span>输出质量：90</span><input type="range" value="90" /></label>
            </div>
            <button class="primary" ${shownState === "idle" ? "disabled" : ""}>开始转换</button>
          </aside>
          <div class="ad-region">广告</div>
        </div>
      </main>
      ${isSupport ? supportDialog() : ""}
      ${isCatalog ? toolCatalog({ currentTool: "图片裁切" }) : ""}
    </div>
  `;
}

function obHome() {
  return `
    <div class="online-shell">
      ${onlineHeader("首页")}
      <main class="ob-home">
        <aside class="ob-rail" aria-label="工具分类">${unifiedToolGroups.map((group, index) => `<button class="${index === 0 ? "active" : ""}" type="button" data-set-state="catalog" aria-label="${group.label}">${group.short}</button>`).join("")}</aside>
        <section class="ob-home-main">
          <div><span class="section-label">离线式浏览器处理</span><h1>专注处理，不离开当前设备。</h1><p>面向夜间与长时间使用的低干扰界面。五类真实任务使用同一工具目录，核心工作区始终保留主要宽度。</p><button class="primary" data-set-state="catalog">打开在线工具</button></div>
          <div class="ob-home-panel">
            <aside class="ob-home-tools"><strong>图片工具</strong><button>图片格式转换</button><button>图片裁切</button><button>图片压缩</button><button>旋转与翻转</button><button>EXIF 查看与清理</button></aside>
            <div class="ob-home-canvas"><div class="dropzone"><div><strong>选择一个文件开始</strong><p>不会上传服务器</p></div></div><div class="ob-home-flow"><div>选择</div><div>参数</div><div>处理</div><div>结果</div></div><div class="ad-region">广告</div></div>
          </div>
        </section>
      </main>
      ${isCatalog ? toolCatalog({ currentTool: "图片裁切" }) : ""}
    </div>
  `;
}

function obTool() {
  const shownState = isSupport || isCatalog ? "selected" : state;
  const mediaGroup = unifiedToolGroups.find((group) => group.id === "media");
  return `
    <div class="online-shell">
      ${onlineHeader("在线工具")}
      <main class="ob-layout">
        <aside class="ob-rail" aria-label="分类图标轨">${unifiedToolGroups.map((group) => `<button class="${group.id === "media" ? "active" : ""}" type="button" data-set-state="catalog" aria-label="${group.label}">${group.short}</button>`).join("")}</aside>
        <aside class="ob-drawer"><h2>音视频工具</h2><div class="ob-tool-list">${mediaGroup.tools.map(([tool, offlineBatch]) => `<button class="${tool === "视频格式转换" ? "active" : ""}"><span>${tool}</span>${offlineBatch ? `<small class="scope-tag">离线批量</small>` : ""}</button>`).join("")}</div><button class="ob-all-tools" type="button" data-set-state="catalog">浏览全部分类</button></aside>
        <section class="ob-center">
          <div><span class="tool-breadcrumb">在线工具 / 音视频工具 / 视频格式转换</span><h1>视频格式转换</h1><p class="muted">文件只在当前设备处理，不上传服务器。</p></div>
          ${shownState === "idle" ? `<div class="dropzone"><div><strong>选择一个视频文件</strong><p>支持当前工具可读取的视频类型</p></div></div>` : selectedOnlineFile("video")}
          <div class="ob-video">
            ${shownState === "idle" ? `<div class="desktop-empty"><span class="muted">选择文件后显示视频预览</span></div>` : `<img src="${asset("video-preview.jpg")}" alt="视频首帧预览" /><div class="ob-video-controls"><span>00:00:42 / 00:02:58</span><div class="progress" style="--progress:24%"><span></span></div><span>播放</span></div>`}
          </div>
          ${shownState === "idle" ? "" : onlineStatePanel(shownState, "video")}
          <div class="ob-command">
            <label class="field"><span>输出格式</span><select><option>MP4</option><option>WebM</option></select></label>
            <label class="field"><span>质量</span><select><option>均衡</option><option>高质量</option></select></label>
            <span class="muted">处理完成后在浏览器中下载</span>
            <button class="danger" ${shownState !== "running" ? "disabled" : ""}>取消转换</button>
            <button class="primary" ${shownState === "idle" ? "disabled" : ""}>开始转换</button>
          </div>
        </section>
        <aside class="ob-inspector"><h2>转换设置</h2><label class="field"><span>输出格式</span><select><option>MP4</option></select></label><label class="field"><span>质量</span><select><option>均衡</option></select></label><label class="field"><span>视频尺寸</span><select><option>原始尺寸</option></select></label><label class="field"><span>音频码率</span><select><option>128K</option></select></label><label class="check"><input type="checkbox" checked />清除元数据</label><div class="ad-region ob-ad">广告</div></aside>
      </main>
      <nav class="mobile-bottom-nav" aria-label="移动端关键导航"><button class="active">当前工具</button><button data-set-state="catalog">选择工具</button><button>参数</button></nav>
      ${isSupport ? supportDialog() : ""}
      ${isCatalog ? toolCatalog({ currentTool: "视频格式转换" }) : ""}
    </div>
  `;
}

function ocHome() {
  return `
    <div class="online-shell">
      ${onlineHeader("首页")}
      <main>
        <section class="oc-home-hero">
          <div><span class="section-label">万能格式转换器</span><h1>把复杂参数，留在需要的时候。</h1><p>先按图片、PDF、文档、音视频或 OCR 选择任务，再展示相关设置。在线版坚持单文件、本地处理；批量任务交给 Windows 离线专业版。</p><button class="primary" data-set-state="catalog">选择在线工具</button></div>
          <article class="oc-home-doc"><span class="section-label">一次转换的三个步骤</span><ol><li><div><strong>选择当前工具</strong><div class="muted">图片、文档、音频或视频</div></div></li><li><div><strong>读取本地文件</strong><div class="muted">文件不会上传服务器</div></div></li><li><div><strong>下载处理结果</strong><div class="muted">结果仅保存在当前页面</div></div></li></ol></article>
        </section>
        <div class="oc-home-sections unified-home-map"><section><span class="section-label">图片工具</span><h2>图像处理</h2><p class="muted">格式、裁切、尺寸、水印、压缩、旋转和 EXIF。</p></section><section><span class="section-label">PDF 工具</span><h2>页面整理</h2><p class="muted">转换、合成、合并、拆分、页面、水印与页码。</p></section><section><span class="section-label">文档工具</span><h2>Office 输出</h2><p class="muted">Word 与 Excel 转图片。</p></section><section><span class="section-label">音视频工具</span><h2>媒体处理</h2><p class="muted">转换、提取、裁剪、静音、截图、GIF 和音频增强。</p></section><section><span class="section-label">OCR 工具</span><h2>文字识别</h2><p class="muted">图片 / PDF 识别与 TXT、Word 导出。</p></section></div>
      </main>
      ${isCatalog ? toolCatalog({ currentTool: "PDF 转图片" }) : ""}
    </div>
  `;
}

function ocTool() {
  const shownState = isSupport || isCatalog ? "selected" : state;
  return `
    <div class="online-shell">
      ${onlineHeader("在线工具")}
      <div class="oc-current-tool"><div><span class="tool-breadcrumb">在线工具 / PDF 工具</span><strong>当前工具：PDF 转图片</strong></div><button data-set-state="catalog">切换工具</button></div>
      <main class="oc-layout">
        <nav class="oc-step-rail" aria-label="转换步骤"><button class="active">01<br />选择 PDF</button><button>02<br />输出方式</button><button>03<br />预览与开始</button></nav>
        <article class="oc-flow">
          <section class="oc-section"><h2><b>01</b>选择 PDF</h2>${shownState === "idle" ? `<div class="dropzone"><div><strong>选择一个 PDF 文件</strong><p>文件只在本机处理</p></div></div>` : `<div class="oc-file"><img src="${asset("word-first-page.jpg")}" alt="PDF 第一页缩略图" /><dl class="oc-definition"><dt>文件名</dt><dd>2026年度产品使用手册_中文完整版_最终审核稿.pdf</dd><dt>文件大小</dt><dd>45.6 MB</dd><dt>页数</dt><dd>13 页</dd><dt>处理位置</dt><dd>当前设备</dd></dl></div>`}</section>
          <section class="oc-section"><h2><b>02</b>输出方式与页码</h2><div class="oc-parameter-row"><label class="field"><span>输出格式</span><select><option>JPG</option><option>PNG</option></select></label><label class="field"><span>页面范围</span><select><option>全部页面</option><option>自定义</option></select></label><label class="field"><span>输出方式</span><select><option>每页一张</option><option>合并长图</option></select></label><label class="field"><span>图片质量：90</span><input type="range" value="90" /></label></div></section>
          <section class="oc-section"><h2><b>03</b>预览与开始</h2>${shownState === "idle" ? `<p class="muted">选择文件后显示摘要。</p>` : onlineStatePanel(shownState, "pdf")}<p><button class="primary" ${shownState === "idle" ? "disabled" : ""}>开始转换</button></p></section>
        </article>
        <aside class="oc-margin"><section><h2>本地处理保障</h2><p>文件仅在当前设备处理，不上传服务器。关闭页面后，页面内存中的文件和结果将被清除。</p></section><section><h2>需要帮助？</h2><p>查看当前工具的文件要求与处理说明。</p><button data-set-state="support">打开支持与说明</button></section><section><div class="ad-region">广告</div></section></aside>
      </main>
      ${isSupport ? supportDialog() : ""}
      ${isCatalog ? toolCatalog({ currentTool: "PDF 转图片" }) : ""}
    </div>
  `;
}

function desktopTitlebar() {
  return `<header class="desktop-titlebar">${brand(true)}<div class="window-controls" aria-hidden="true"><span>—</span><span>□</span><span>×</span></div></header>`;
}

function desktopCommandbar(tool, category) {
  return `
    <div class="desktop-commandbar">
      <button class="primary">添加文件</button><button>添加文件夹</button><button>清空</button>
      <div class="output-path"><button class="desktop-tool-switch" type="button" data-set-state="catalog">${category} / ${tool}</button><span title="D:\\转换结果\\2026-07-29_1432">输出到：D:\\转换结果\\2026-07-29_1432</span><button>浏览</button></div>
      <button class="primary">开始转换</button><button class="danger">停止</button>
    </div>
  `;
}

function desktopCategoryNav(activeCategory, currentTool) {
  return `
    <nav class="ofa-nav" aria-label="离线工具分类">
      ${unifiedToolGroups.map((group) => `
        <button class="desktop-category-row ${group.label === activeCategory ? "active" : ""}" type="button" data-set-state="catalog"><span>${group.label}</span><small>${group.tools.length}</small></button>
        ${group.label === activeCategory ? `<div class="desktop-category-tools">${group.tools.map(([tool, offlineBatch]) => `<button class="${tool === currentTool ? "active" : ""}" type="button"><span>${tool}</span>${offlineBatch ? `<small class="scope-tag">批量</small>` : ""}</button>`).join("")}</div>` : ""}
      `).join("")}
      <h3>工作区</h3>
      <button type="button">批量任务</button>
      <button type="button">输出与任务结果</button>
      <h3>应用</h3>
      <button type="button">支持作者</button>
      <button type="button" data-set-state="license">本地授权</button>
    </nav>
  `;
}

function desktopStatusbar(label = "当前文件：2026年夏季产品图_横版_最终确认版.jpg") {
  return `
    <footer class="desktop-statusbar">
      <div><span>总体进度 2 / 6</span><div class="progress" style="--progress:33%;margin-top:4px"><span></span></div></div>
      <div>${label}</div>
      <div class="status-counts"><span>成功 <b>1</b></span><span>失败 <b>1</b></span><span>等待 <b>2</b></span><button>打开输出目录</button></div>
    </footer>
  `;
}

function tile([name, meta, tone, statusText, image], index, doc = false) {
  return `
    <article class="file-tile ${index === 0 ? "selected" : ""} ${doc ? "doc" : ""}">
      <img src="${asset(image)}" alt="${doc ? "文档第一页缩略图" : "文件缩略图"}" />
      <div class="file-tile-body"><div class="file-name" title="${name}">${name}</div><div class="file-meta">${meta}</div><div class="status ${tone}">${statusText}</div>${tone === "running" ? `<div class="progress" style="--progress:65%"><span></span></div>` : ""}</div>
      ${tone === "error" ? `<button class="tile-action">重试</button>` : ""}
    </article>
  `;
}

function desktopEmpty(title, message) {
  return `<div class="desktop-empty"><div class="desktop-empty-inner"><span class="section-label">等待导入</span><h2>${title}</h2><p>${message}</p><button class="primary">添加文件</button></div></div>`;
}

function licenseDialog() {
  return `
    <div class="license-overlay">
      <section class="license-dialog" role="dialog" aria-modal="true" aria-labelledby="license-title">
        <header class="dialog-head"><h2 id="license-title">本地授权</h2><button data-close-overlay>关闭</button></header>
        <div class="dialog-body">
          <p>离线专业版可在当前设备试用 3 天。激活过程只校验本机机器码、离线激活码或授权文件，不需要登录。</p>
          <label class="field"><span>机器码</span><input value="MRX-7F2A-9C10-4D6B" readonly /></label>
          <label class="field" style="margin-top:14px"><span>离线激活码</span><input placeholder="输入管理员提供的激活码" /></label>
          <div class="state-actions" style="margin-top:16px"><button class="primary">验证激活码</button><button>导入 license.mrx</button></div>
          <p class="muted">授权与支持作者是两个独立流程。授权界面不上传用户处理文件。</p>
        </div>
      </section>
    </div>
  `;
}

function inspector(tool, mode) {
  return `
    <aside class="inspector">
      <span class="section-label">当前工具</span><h2>${tool}</h2>
      <label class="field"><span>输出格式</span><select><option>${tool === "Word 转图片" ? "PNG" : tool === "视频格式转换" ? "MP4" : "PNG"}</option></select></label>
      ${tool === "视频格式转换" ? `<label class="field"><span>质量</span><select><option>均衡</option></select></label><label class="field"><span>视频尺寸</span><select><option>原始尺寸</option></select></label><label class="field"><span>音频码率</span><select><option>128K</option></select></label><label class="check"><input type="checkbox" checked />清除元数据</label>` : `<label class="field"><span>输出目录</span><input value="D:\\转换结果\\本次任务" readonly /></label>`}
      <section class="accordion"><button aria-expanded="${mode === "advanced"}"><strong>高级设置</strong><span>${mode === "advanced" ? "收起" : "展开"}</span></button>${mode === "advanced" ? `<div class="accordion-panel"><label class="check"><input type="checkbox" checked />保留原始尺寸</label><label class="check"><input type="checkbox" />处理成功后打开目录</label><p class="muted">高级参数跟随当前工具，不改变输出文件夹规则。</p></div>` : ""}</section>
      <button class="primary">开始转换（${tool === "Word 转图片" ? "8" : "6"}）</button>
      <div class="trial-line">本地试用剩余 2 天 · <button class="link-button" data-set-state="license">查看授权</button></div>
    </aside>
  `;
}

function ofaWorkbench() {
  const shownState = isLicense || isCatalog ? "running" : state;
  return `
    <div class="desktop-shell">
      ${desktopTitlebar()}${desktopCommandbar("图片格式转换", "图片工具")}
      <main class="ofa-workspace">
        ${desktopCategoryNav("图片工具", "图片格式转换")}
        <section class="ofa-canvas">${shownState === "idle" ? desktopEmpty("添加要处理的图片", "可以选择多个文件或整个文件夹。文件会平铺显示，处理结果写入独立任务文件夹。") : `<header class="ofa-canvas-head"><h2>任务画布（6）</h2><div><button>全选</button> <button>移除</button></div></header><div class="tile-grid">${imageFiles.map((file, index) => tile(file, index)).join("")}</div>`}</section>
        ${inspector("图片格式转换", isAdvanced ? "advanced" : shownState)}
      </main>
      ${desktopStatusbar()}
      ${isLicense ? licenseDialog() : ""}
      ${isCatalog ? toolCatalog({ currentTool: "图片格式转换", desktop: true }) : ""}
    </div>
  `;
}

function ofbWorkbench() {
  const shownState = isLicense || isCatalog ? "running" : state;
  return `
    <div class="desktop-shell">
      ${desktopTitlebar()}${desktopCommandbar("视频格式转换", "音视频工具")}
      <main class="ofb-workspace">
        <aside class="ofb-summary"><h2>任务概览</h2><div class="ofb-filter"><button class="active"><span>全部任务</span><b>6</b></button><button><span>处理中</span><b>2</b></button><button><span>成功</span><b>1</b></button><button><span>失败</span><b>1</b></button><button><span>已取消</span><b>1</b></button></div><h3>任务队列</h3><div class="ofb-queue">${videoFiles.map((file, index) => `<button class="${index === 0 ? "active" : ""}"><span>${String(index + 1).padStart(2, "0")}</span><span class="file-name">${file[0]}<small class="status ${file[2]}">${file[3]}</small></span></button>`).join("")}</div></aside>
        ${shownState === "idle" ? `<section class="ofb-main" style="grid-column:2/4">${desktopEmpty("导入视频批量任务", "添加多个视频后，左侧显示队列索引，中央平铺首帧，右侧显示当前选中项。")}</section>` : `<section class="ofb-main"><div class="ofb-grid"><div class="tile-grid">${videoFiles.map((file, index) => tile(file, index)).join("")}</div></div><div class="ofb-preview"><img src="${asset("video-preview.jpg")}" alt="当前选中视频首帧" /><div class="ofb-preview-meta"><strong>旅行的意义_4K风景延时摄影.mp4</strong><p>MP4 · 3840 × 2160 · 00:05:32 · 384.7 MB</p><div class="progress" style="--progress:45%"><span></span></div></div></div></section>`}
        <section class="ofb-params"><label class="field"><span>输出格式</span><select><option>MP4</option></select></label><label class="field"><span>质量</span><select><option>均衡</option></select></label><label class="field"><span>视频尺寸</span><select><option>原始尺寸</option></select></label><label class="field"><span>音频码率</span><select><option>128K</option></select></label><label class="field"><span>高级设置</span><button>${isAdvanced ? "已展开" : "展开"}</button></label></section>
      </main>
      ${desktopStatusbar("当前任务：旅行的意义_4K风景延时摄影.mp4 · 正在转换")}
      ${isLicense ? licenseDialog() : ""}
      ${isCatalog ? toolCatalog({ currentTool: "视频格式转换", desktop: true }) : ""}
    </div>
  `;
}

function ledgerRows() {
  return wordFiles.map((file, index) => `<tr><td>${index + 1}</td><td title="${file[0]}">${file[0].replace("_最终确认版", "")}</td><td>${file[1].split(" · ")[0]}</td><td><span class="status ${file[2]}">${file[3]}</span></td><td>${file[2] === "success" ? `D:\\转换输出\\${file[0].replace(".docx", "")}\\` : "—"}</td></tr>`).join("");
}

function ofcWorkbench() {
  const shownState = isLicense || isCatalog ? "running" : state;
  const currentGroup = unifiedToolGroups.find((group) => group.id === "document");
  return `
    <div class="desktop-shell">
      ${desktopTitlebar()}${desktopCommandbar("Word 转图片", "文档工具")}
      <main class="ofc-workspace">
        <nav class="ofc-rail" aria-label="工具分类">${unifiedToolGroups.map((group, index) => `<button class="${group.id === "document" ? "active" : ""}" type="button" data-set-state="catalog"><span>${String(index + 1).padStart(2, "0")}</span><span>${group.label}</span></button>`).join("")}<div class="ofc-current-tools">${currentGroup.tools.map(([tool, offlineBatch]) => `<button class="${tool === "Word 转图片" ? "active" : ""}" type="button"><span>${tool}</span>${offlineBatch ? `<small class="scope-tag">批量</small>` : ""}</button>`).join("")}</div><button type="button">批量任务</button><button type="button">输出与任务结果</button></nav>
        <section class="ofc-grid">${shownState === "idle" ? desktopEmpty("添加 Word 文档", "每个文档显示第一页缩略图；多页结果写入同名子文件夹，不压缩。") : `<div class="tile-grid">${wordFiles.map((file, index) => tile(file, index, true)).join("")}</div>`}</section>
        ${inspector("Word 转图片", isAdvanced ? "advanced" : shownState)}
        <section class="ofc-ledger"><header class="ofc-ledger-head"><div><strong>任务列表（8）</strong> <span class="muted">总体进度 37%</span></div><button>重试失败</button></header><table class="ofc-table"><thead><tr><th>#</th><th>文件名</th><th>页数</th><th>状态</th><th>输出</th></tr></thead><tbody>${ledgerRows()}</tbody></table></section>
      </main>
      ${desktopStatusbar("当前文件：项目计划书_最终确认版.docx · 第 3 / 10 页")}
      ${isLicense ? licenseDialog() : ""}
      ${isCatalog ? toolCatalog({ currentTool: "Word 转图片", desktop: true }) : ""}
    </div>
  `;
}

function render() {
  const app = document.querySelector("#app");
  if (!app) return;
  if (surface === "online") {
    if (screen === "home") app.innerHTML = concept === "a" ? oaHome() : concept === "b" ? obHome() : ocHome();
    else app.innerHTML = concept === "a" ? oaTool() : concept === "b" ? obTool() : ocTool();
  } else {
    app.innerHTML = concept === "a" ? ofaWorkbench() : concept === "b" ? ofbWorkbench() : ofcWorkbench();
  }
}

render();

document.addEventListener("click", (event) => {
  const setState = event.target.closest("[data-set-state]");
  if (setState) {
    const next = new URL(window.location.href);
    next.searchParams.set("state", setState.dataset.setState);
    window.location.href = next.toString();
    return;
  }
  if (event.target.closest("[data-close-overlay]")) {
    const next = new URL(window.location.href);
    next.searchParams.set("state", surface === "online" ? "selected" : "running");
    window.location.href = next.toString();
  }
});
