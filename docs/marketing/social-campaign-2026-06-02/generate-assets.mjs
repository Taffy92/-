import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const root = path.resolve(process.cwd());
const sharp = require(path.join(root, "node_modules/.pnpm/sharp@0.34.5/node_modules/sharp"));

const outDir = path.join(root, "docs/marketing/social-campaign-2026-06-02");
const iconPath = path.join(root, "apps/web/public/icons/app-icon.png");
const siteUrl = "gszhmrx.cn";

const campaigns = [
  {
    id: "moments",
    name: "朋友圈",
    size: [1080, 1080],
    palette: {
      bg: "#f6f8fb",
      panel: "#ffffff",
      ink: "#152033",
      muted: "#64748b",
      faint: "#edf2f7",
      accent: "#0f766e",
      accent2: "#eab308",
      line: "#dbe4ef"
    },
    copy: `最近做了个小工具，名字就很直白：万能格式转换器。

平时遇到那种“图片太大传不上去”“PDF 想导成图片”“MOV 发过去打不开”“视频里只想要音频”的小麻烦，可以先丢到在线版里试一下。

我自己更在意的一点是：文件尽量在本地处理，不上传服务器，也不靠云端转换 API 去处理你的文件。

如果是公司资料、客户文件、大文件，或者一堆文件要批量弄，建议用 Windows 离线专业版。装好以后核心功能断网也能用，界面也没有在线广告容器。

网址：${siteUrl}
离线版下载按下载页说明联系我拿口令就行。`,
    images: [
      { mode: "online", title: "打开网页就能处理", subtitle: "图片、PDF、音频、视频，临时用一下很顺手。", feature: "PDF 转图片", tags: ["网页打开", "本地处理", "下载结果"] },
      { mode: "online", title: "图片太大，先压一下", subtitle: "照片压缩、尺寸调整、加水印，这类小事不用开一堆软件。", feature: "图片压缩", tags: ["压缩", "改尺寸", "加水印"] },
      { mode: "offline", title: "文件多就用离线版", subtitle: "Windows 离线专业版有任务队列，适合一批文件慢慢跑。", feature: "批量队列", tags: ["批量", "队列", "Windows"] },
      { mode: "offline", title: "公司文件别乱传", subtitle: "客户资料、内部表格、大文件，放在自己电脑里处理更安心。", feature: "本地工作台", tags: ["敏感文件", "断网", "本地"] },
      { mode: "online", title: "文件处理和广告隔开", subtitle: "在线版可以有广告位，但广告脚本不接触文件和转换结果。", feature: "隐私提示", tags: ["File", "Blob", "转换结果"] },
      { mode: "mixed", title: "一个网站，一套离线版", subtitle: `在线轻量处理，离线处理重活。网址：${siteUrl}`, feature: "在线 + 离线", tags: ["图片", "文档", "音视频"] }
    ]
  },
  {
    id: "xiaohongshu",
    name: "小红书",
    size: [1080, 1440],
    palette: {
      bg: "#fff7ed",
      panel: "#fffaf5",
      ink: "#2b1b14",
      muted: "#75665b",
      faint: "#fff1e6",
      accent: "#dc2626",
      accent2: "#2563eb",
      line: "#fed7aa"
    },
    copy: `标题：这个格式转换工具，我终于把在线版和离线版都做出来了

真的不是在制造需求，日常办公里这种小问题太多了：
图片太大传不上去、PDF 想转成图片、Word/Excel 想导出页面、MOV 想转 MP4、视频里只想提取音频。

所以我做了「万能格式转换器」。

在线版适合临时用：
打开网站，选工具，添加文件，处理完自己下载。

Windows 离线专业版适合重一点的场景：
批量文件、大文件、公司资料、客户资料、断网电脑。安装后直接是工具箱界面，左边选功能，中间看任务队列，右边调参数。

我比较坚持的一点：
文件尽量在本地处理，不上传服务器，不调用云端转换 API。

网址：${siteUrl}
离线版下载在下载页按说明联系作者拿口令。

#格式转换 #办公效率 #PDF转图片 #图片压缩 #音视频转换 #Windows软件 #本地处理`,
    images: [
      { mode: "mixed", title: "在线版 + 离线版都做好了", subtitle: "一个处理零碎文件，一个处理批量和大文件。", feature: "工具箱", tags: ["办公", "学习", "创作"] },
      { mode: "online", title: "网页上就能临时转", subtitle: "PDF 转图片、图片压缩、音视频转换，打开就用。", feature: "在线工具", tags: ["不用安装", "少量文件", "快速下载"] },
      { mode: "online", title: "图片处理很常用", subtitle: "裁切、改尺寸、加水印、压缩，做图前后都能用上。", feature: "图片工具", tags: ["裁切", "水印", "压缩"] },
      { mode: "offline", title: "离线版是给重活的", subtitle: "批量队列跟着当前工具走，不用单独找批量入口。", feature: "批量处理", tags: ["批量导入", "任务队列", "参数面板"] },
      { mode: "offline", title: "敏感文件更建议离线", subtitle: "客户资料、公司文件、大视频，能不上传就别上传。", feature: "断网可用", tags: ["本地处理", "不上传", "更安心"] },
      { mode: "mixed", title: "收藏一下，需要时能救急", subtitle: `网址：${siteUrl}，在线版先试，重任务用离线版。`, feature: "下载页", tags: ["在线版", "离线专业版", "备用"] }
    ]
  },
  {
    id: "zhihu",
    name: "知乎",
    size: [1200, 675],
    palette: {
      bg: "#eef2ff",
      panel: "#ffffff",
      ink: "#111827",
      muted: "#526071",
      faint: "#f4f7ff",
      accent: "#1d4ed8",
      accent2: "#16a34a",
      line: "#c7d2fe"
    },
    copy: `题目：为什么我做格式转换工具时，优先做了本地处理和离线版？

很多格式转换需求，其实不是“高级功能”。

比如把 PDF 转成图片、压缩一张照片、给图片加水印、把 Word/Excel 页面导出来、把 MOV 转成 MP4、从视频里提取音频。这些事本身不复杂，但用户会有一个很现实的顾虑：文件到底传到哪儿去了？

所以「万能格式转换器」没有走云端转换 API 这条路，而是尽量让文件在浏览器或离线软件本地处理。在线版负责轻量任务，适合临时处理单文件或少量文件；Windows 离线专业版负责批量、大文件、敏感资料和断网办公。

离线版的界面更像工具箱：左侧选类型，中间是上传区和任务队列，右侧调参数。它的核心功能不依赖网站服务器，也不渲染在线广告容器。

当然边界也要说清楚：它是格式转换工具，不是 PDF 编辑器，不提供 PDF 内容修改、涂销、签章、批注。重要文件转换完还是要人工核对。

网址：${siteUrl}
离线专业版下载按下载页说明联系作者获取口令。`,
    images: [
      { mode: "mixed", title: "格式转换，先问文件去哪儿", subtitle: "小工具也会处理真实文件，本地处理是第一原则。", feature: "本地处理原则", tags: ["隐私", "效率", "边界"] },
      { mode: "online", title: "在线版负责轻量任务", subtitle: "单文件、少量文件，打开网页处理完就下载。", feature: "在线工具", tags: ["PDF 转图片", "图片压缩", "音视频转换"] },
      { mode: "offline", title: "离线版负责重任务", subtitle: "批量、大文件、敏感资料、断网办公，更适合装到 Windows。", feature: "离线工作台", tags: ["批量队列", "参数面板", "断网"] },
      { mode: "offline", title: "界面按工作流来", subtitle: "左侧选工具，中间看任务，右侧调参数。", feature: "专业工具箱", tags: ["工具分类", "任务队列", "导出"] },
      { mode: "online", title: "不把转换做成黑盒", subtitle: "不调用云端转换 API，转换结果由用户自己下载。", feature: "隐私说明", tags: ["不上传", "本地生成", "自己下载"] },
      { mode: "mixed", title: "它不是 PDF 编辑器", subtitle: "只做转换，不做合同涂改、签章、批注；重要内容要人工核对。", feature: "能力边界", tags: ["转换", "非编辑", "需核对"] }
    ]
  }
];

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function measure(text) {
  let width = 0;
  for (const char of text) width += /[\u4e00-\u9fff\uff00-\uffef]/.test(char) ? 2 : 1;
  return width;
}

function wrap(text, maxWidth) {
  const lines = [];
  let line = "";
  const tokens = text.match(/[A-Za-z0-9./:+-]+|[\u4e00-\u9fff\uff00-\uffef]|./g) || [];
  for (const token of tokens) {
    if (measure(line + token) > maxWidth && line) {
      lines.push(line);
      line = token.trimStart();
    } else {
      line += token;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function textBlock(lines, x, y, size, color, weight = 500, lineHeight = 1.35) {
  return lines
    .map((line, index) => {
      const yy = y + index * size * lineHeight;
      return `<text x="${x}" y="${yy}" font-size="${size}" font-weight="${weight}" fill="${color}">${escapeXml(line)}</text>`;
    })
    .join("\n");
}

function chips(items, x, y, palette, fontSize = 20) {
  let cursor = x;
  return items
    .map((item, index) => {
      const width = 34 + measure(item) * (fontSize * 0.5);
      const fill = index % 2 === 0 ? palette.accent : palette.accent2;
      const svg = `<g>
        <rect x="${cursor}" y="${y}" width="${width}" height="${fontSize + 24}" rx="${(fontSize + 24) / 2}" fill="${fill}" opacity="0.12"/>
        <text x="${cursor + 17}" y="${y + fontSize + 7}" font-size="${fontSize}" font-weight="700" fill="${fill}">${escapeXml(item)}</text>
      </g>`;
      cursor += width + 12;
      return svg;
    })
    .join("\n");
}

function onlineMockup(x, y, w, h, palette, feature) {
  const p = palette;
  const browserH = 40;
  const navW = Math.max(112, w * 0.19);
  const contentX = x + navW + 24;
  const contentW = w - navW - 48;
  const uploadY = y + browserH + 82;
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="${p.panel}" stroke="${p.line}" stroke-width="2"/>
    <rect x="${x}" y="${y}" width="${w}" height="${browserH}" rx="22" fill="${p.faint}"/>
    <circle cx="${x + 24}" cy="${y + 20}" r="6" fill="#ef4444"/>
    <circle cx="${x + 44}" cy="${y + 20}" r="6" fill="#f59e0b"/>
    <circle cx="${x + 64}" cy="${y + 20}" r="6" fill="#22c55e"/>
    <rect x="${x + 92}" y="${y + 10}" width="${w - 122}" height="20" rx="10" fill="#ffffff" stroke="${p.line}"/>
    <text x="${x + 110}" y="${y + 25}" font-size="13" fill="${p.muted}">${siteUrl}/tools</text>
    <text x="${x + 24}" y="${y + browserH + 42}" font-size="20" font-weight="800" fill="${p.ink}">万能格式转换器</text>
    <rect x="${x + 20}" y="${y + browserH + 68}" width="${navW - 32}" height="32" rx="10" fill="${p.accent}" opacity="0.12"/>
    <text x="${x + 36}" y="${y + browserH + 90}" font-size="15" font-weight="700" fill="${p.accent}">在线工具</text>
    ${["图片处理", "文档转图片", "音视频转换"].map((item, index) => `<text x="${x + 36}" y="${y + browserH + 134 + index * 34}" font-size="14" fill="${p.muted}">${item}</text>`).join("\n")}
    <text x="${contentX}" y="${y + browserH + 46}" font-size="24" font-weight="800" fill="${p.ink}">${escapeXml(feature)}</text>
    <rect x="${contentX}" y="${uploadY}" width="${contentW}" height="${h * 0.34}" rx="18" fill="${p.faint}" stroke="${p.line}" stroke-dasharray="8 8"/>
    <text x="${contentX + 28}" y="${uploadY + 52}" font-size="18" font-weight="700" fill="${p.ink}">添加文件</text>
    <text x="${contentX + 28}" y="${uploadY + 84}" font-size="15" fill="${p.muted}">文件在当前设备处理，完成后下载结果</text>
    <rect x="${contentX + 28}" y="${uploadY + 112}" width="126" height="36" rx="18" fill="${p.accent}"/>
    <text x="${contentX + 54}" y="${uploadY + 136}" font-size="15" font-weight="700" fill="#ffffff">选择文件</text>
    <rect x="${contentX}" y="${uploadY + h * 0.39}" width="${contentW * 0.48}" height="64" rx="14" fill="#ffffff" stroke="${p.line}"/>
    <rect x="${contentX + contentW * 0.52}" y="${uploadY + h * 0.39}" width="${contentW * 0.48}" height="64" rx="14" fill="#ffffff" stroke="${p.line}"/>
    <text x="${contentX + 20}" y="${uploadY + h * 0.39 + 38}" font-size="15" fill="${p.muted}">输出格式</text>
    <text x="${contentX + contentW * 0.52 + 20}" y="${uploadY + h * 0.39 + 38}" font-size="15" fill="${p.muted}">开始处理</text>
  </g>`;
}

function offlineMockup(x, y, w, h, palette, feature) {
  const p = palette;
  const topH = 42;
  const sidebarW = Math.max(130, w * 0.22);
  const rightW = Math.max(150, w * 0.24);
  const centerX = x + sidebarW + 18;
  const centerW = w - sidebarW - rightW - 48;
  const rightX = x + w - rightW - 18;
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="#ffffff" stroke="${p.line}" stroke-width="2"/>
    <rect x="${x}" y="${y}" width="${w}" height="${topH}" rx="22" fill="${p.ink}" opacity="0.92"/>
    <text x="${x + 24}" y="${y + 28}" font-size="15" font-weight="700" fill="#ffffff">万能格式转换器</text>
    <text x="${x + w - 160}" y="${y + 28}" font-size="13" fill="#d1d5db">Windows 离线专业版</text>
    <rect x="${x + 18}" y="${y + topH + 18}" width="${sidebarW}" height="${h - topH - 36}" rx="16" fill="${p.faint}"/>
    <text x="${x + 38}" y="${y + topH + 52}" font-size="15" font-weight="800" fill="${p.ink}">工具箱</text>
    ${["图片", "文档", "音频", "视频"].map((item, index) => {
      const yy = y + topH + 82 + index * 42;
      const active = index === 1;
      return `<rect x="${x + 34}" y="${yy - 22}" width="${sidebarW - 32}" height="30" rx="10" fill="${active ? p.accent : "#ffffff"}" opacity="${active ? "0.14" : "1"}" stroke="${p.line}"/>
      <text x="${x + 48}" y="${yy}" font-size="14" font-weight="${active ? "800" : "600"}" fill="${active ? p.accent : p.muted}">${item}</text>`;
    }).join("\n")}
    <text x="${centerX}" y="${y + topH + 48}" font-size="23" font-weight="800" fill="${p.ink}">${escapeXml(feature)}</text>
    <rect x="${centerX}" y="${y + topH + 70}" width="${centerW}" height="74" rx="16" fill="${p.faint}" stroke="${p.line}" stroke-dasharray="8 8"/>
    <text x="${centerX + 24}" y="${y + topH + 114}" font-size="16" font-weight="700" fill="${p.ink}">拖入文件或批量导入</text>
    ${["合同.pdf", "报价.xlsx", "素材.mov"].map((item, index) => {
      const yy = y + topH + 164 + index * 48;
      return `<rect x="${centerX}" y="${yy}" width="${centerW}" height="36" rx="10" fill="#ffffff" stroke="${p.line}"/>
      <text x="${centerX + 18}" y="${yy + 24}" font-size="13" fill="${p.muted}">${item}</text>
      <rect x="${centerX + centerW - 96}" y="${yy + 10}" width="70" height="16" rx="8" fill="${p.accent2}" opacity="0.16"/>
      <text x="${centerX + centerW - 82}" y="${yy + 23}" font-size="11" fill="${p.accent2}">等待</text>`;
    }).join("\n")}
    <rect x="${rightX}" y="${y + topH + 18}" width="${rightW}" height="${h - topH - 36}" rx="16" fill="${p.faint}"/>
    <text x="${rightX + 20}" y="${y + topH + 52}" font-size="15" font-weight="800" fill="${p.ink}">参数</text>
    ${["输出格式", "质量", "保存位置"].map((item, index) => `<rect x="${rightX + 18}" y="${y + topH + 76 + index * 58}" width="${rightW - 36}" height="38" rx="10" fill="#ffffff" stroke="${p.line}"/>
      <text x="${rightX + 34}" y="${y + topH + 101 + index * 58}" font-size="13" fill="${p.muted}">${item}</text>`).join("\n")}
    <rect x="${rightX + 18}" y="${y + h - 78}" width="${rightW - 36}" height="42" rx="21" fill="${p.accent}"/>
    <text x="${rightX + 54}" y="${y + h - 51}" font-size="15" font-weight="800" fill="#ffffff">开始处理</text>
  </g>`;
}

function mockup(image, x, y, w, h, palette) {
  if (image.mode === "offline") return offlineMockup(x, y, w, h, palette, image.feature);
  if (image.mode === "mixed") {
    const gap = 18;
    const half = (w - gap) / 2;
    return `${onlineMockup(x, y, half, h, palette, "在线版")}
      ${offlineMockup(x + half + gap, y, half, h, palette, "离线版")}`;
  }
  return onlineMockup(x, y, w, h, palette, image.feature);
}

function posterSvg(campaign, image) {
  const [width, height] = campaign.size;
  const p = campaign.palette;
  const margin = Math.round(width * 0.065);
  const isZhihu = campaign.id === "zhihu";
  const isXhs = campaign.id === "xiaohongshu";
  const titleSize = isZhihu ? 40 : isXhs ? 58 : 52;
  const bodySize = isZhihu ? 23 : isXhs ? 31 : 29;
  const titleLines = wrap(image.title, isZhihu ? 17 : isXhs ? 14 : 13);
  const bodyLines = wrap(image.subtitle, isZhihu ? 23 : isXhs ? 22 : 20);

  if (isZhihu) {
    const textX = margin;
    const mockX = width * 0.48;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="${p.bg}"/>
      <path d="M0 ${height} C${width * 0.2} ${height * 0.75}, ${width * 0.64} ${height * 0.95}, ${width} ${height * 0.7} L${width} ${height} Z" fill="${p.accent2}" opacity="0.12"/>
      <text x="${textX}" y="${margin + 34}" font-size="24" font-weight="800" fill="${p.accent}">万能格式转换器</text>
      ${textBlock(titleLines, textX, margin + 112, titleSize, p.ink, 850, 1.18)}
      ${textBlock(bodyLines, textX, margin + 112 + titleLines.length * titleSize * 1.22 + 28, bodySize, p.muted, 520, 1.38)}
      ${chips(image.tags, textX, height - margin - 86, p, 18)}
      <text x="${textX}" y="${height - margin - 20}" font-size="22" font-weight="800" fill="${p.ink}">${siteUrl}</text>
      ${mockup(image, mockX, margin + 32, width - mockX - margin, height - margin * 2 - 18, p)}
    </svg>`;
  }

  const bodyY = margin + 118 + titleLines.length * titleSize * 1.18 + 28;
  const bodyH = bodyLines.length * bodySize * 1.36;
  const mockY = bodyY + bodyH + (isXhs ? 42 : 36);
  const mockH = Math.max(isXhs ? 520 : 410, height - mockY - margin - (isXhs ? 92 : 78));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="${p.bg}"/>
    <path d="M${width * 0.56} 0 C${width * 0.84} ${height * 0.08}, ${width} ${height * 0.22}, ${width} ${height * 0.46} L${width} 0 Z" fill="${p.accent}" opacity="0.10"/>
    <path d="M0 ${height} C${width * 0.2} ${height * 0.76}, ${width * 0.55} ${height * 0.94}, ${width} ${height * 0.8} L${width} ${height} Z" fill="${p.accent2}" opacity="0.11"/>
    <text x="${margin}" y="${margin + 36}" font-size="26" font-weight="800" fill="${p.accent}">万能格式转换器</text>
    ${textBlock(titleLines, margin, margin + 112, titleSize, p.ink, 850, 1.18)}
    ${textBlock(bodyLines, margin, margin + 118 + titleLines.length * titleSize * 1.18 + 28, bodySize, p.muted, 520, 1.36)}
    ${mockup(image, margin, mockY, width - margin * 2, mockH, p)}
    ${chips(image.tags, margin, height - margin - 66, p, isXhs ? 21 : 19)}
    <text x="${width - margin - 156}" y="${height - margin - 28}" font-size="21" font-weight="800" fill="${p.ink}">${siteUrl}</text>
  </svg>`;
}

async function renderPoster(campaign, image, index) {
  const fileName = `${campaign.id}-${String(index + 1).padStart(2, "0")}.png`;
  const filePath = path.join(outDir, fileName);
  const [width] = campaign.size;
  const iconSize = campaign.id === "zhihu" ? 48 : 62;
  const margin = Math.round(width * 0.065);

  await sharp(Buffer.from(posterSvg(campaign, image)))
    .composite([
      {
        input: await sharp(iconPath).resize(iconSize, iconSize).png().toBuffer(),
        left: width - margin - iconSize,
        top: margin + 4
      }
    ])
    .png()
    .toFile(filePath);
  return fileName;
}

function markdownFor(campaign, fileNames) {
  const title = `# ${campaign.name}宣传文案`;
  const imageList = fileNames.map((file) => `![使用界面](./${file})`).join("\n\n");
  return `${title}

## 正文

${campaign.copy}

## 配图

${imageList}
`;
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const indexLines = ["# 万能格式转换器社媒宣传素材", ""];

  for (const campaign of campaigns) {
    const files = [];
    for (let i = 0; i < campaign.images.length; i += 1) {
      files.push(await renderPoster(campaign, campaign.images[i], i));
    }

    const mdFile = `${campaign.id}.md`;
    await writeFile(path.join(outDir, mdFile), markdownFor(campaign, files), "utf8");
    indexLines.push(`- [${campaign.name}文案](./${mdFile})：${files.length} 张使用界面配图`);
  }

  await writeFile(path.join(outDir, "README.md"), `${indexLines.join("\n")}\n`, "utf8");
}

await main();
