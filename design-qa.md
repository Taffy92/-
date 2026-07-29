# 方案 2 设计稿与当前渲染结果对比

## 比较目标

- Source visual truth: `C:\Users\Administrator\.codex\generated_images\019fad66-c235-7353-ad22-cdfd800fc7e1\call_vyikHmL9oJuQRCuXetHmeBEF.png`
- Online implementation: `D:\万能格式转换器项目\verification\ui-round-2-tools-desktop-1440.png`
- Online responsive evidence:
  - `D:\万能格式转换器项目\verification\ui-round-2-tools-tablet-768.png`
  - `D:\万能格式转换器项目\verification\ui-round-2-tools-mobile-375.png`
- Offline implementation: `D:\万能格式转换器项目\verification\desktop-current-import-smoke.png`
- Third-party notices implementation: `C:\Users\Administrator\AppData\Local\Temp\codex-clipboard-41127b5e-5b1c-4b1e-b2d7-5237ecf83657.png`
- Combined comparison evidence:
  - `D:\万能格式转换器项目\verification\design-qa-option2-online.png`
  - `D:\万能格式转换器项目\verification\design-qa-option2-offline.png`
  - `D:\万能格式转换器项目\verification\design-qa-option2-legal.png`

## 视口与归一化

| Artifact | Pixel dimensions | CSS viewport / density | State |
| --- | ---: | --- | --- |
| Source design board | 1586 × 992 | ImageGen 设计画板，无 CSS viewport 和 DPR 元数据 | 在线、离线均为已导入多文件状态；附下载和第三方声明状态 |
| Online desktop | 1440 × 1118 | Playwright viewport 1440 × 1100，full-page screenshot，默认 DPR 1 | 图片裁切空状态 |
| Online tablet | 768 × 1595 | Playwright viewport 768 × 980，full-page screenshot，默认 DPR 1 | 图片裁切空状态 |
| Online mobile | 375 × 2296 | Playwright viewport 375 × 900，full-page screenshot，默认 DPR 1 | 图片裁切空状态 |
| Offline | 1280 × 820 | Tauri/桌面渲染截图；DPR 未记录 | Excel 转图片，已导入 1 个文件 |
| Third-party notices | 888 × 781 | 浏览器截图；viewport 和 DPR 未记录 | 发布文档中的构建产物及 npm 依赖 |

设计稿与实现不是相同内容状态，因此不对文件行数量和具体文件内容做像素级判断。对比聚焦于状态无关的页面骨架、比例、视觉语言、导航、参数区、排版和主要操作。

## Full-view comparison evidence

- 在线组合图显示：设计稿是明亮的工程实验室风格、紧凑的任务步骤和文件队列；当前实现是深色三栏工作台，并由大面积空预览占据首屏。
- 离线组合图显示：设计稿以工具分类、平铺预览、右侧参数和底部输出信息组成；当前实现把工具与参数放在顶部，把单个预览放大为主区域，右侧主要用于内核遥测。
- 第三方声明组合图显示：设计稿是可扫描的表格；当前实现把 Markdown 表格源文本放进代码块。

## Focused region comparison evidence

- Online: `verification/design-qa-option2-online.png` 对齐了工作台主体，足以检查导航宽度、主区域比例、色彩、文字层级、操作路径和空白密度。
- Offline: `verification/design-qa-option2-offline.png` 对齐了主工作台，足以检查导航、预览、参数和输出区域的结构。多文件平铺状态尚无与设计稿同状态的实现截图。
- Legal: `verification/design-qa-option2-legal.png` 放大了声明表格区域，能直接确认 Markdown 表格符号、链接呈现和换行问题。
- Download: 设计稿包含下载状态，但当前没有同状态渲染截图，不能完成视觉对比。当前组件代码仍包含用户可见的“第 n/N 个分片”文案，此项需在实现后单独截图复核。

## Findings

- [P0] 375px 在线工作台几乎无法完成核心任务
  - Location: `/tools/` mobile, `.apple-workspace-layout`, `.ws-sidebar-panel`, `.ws-center-canvas-hub`.
  - Surface: responsiveness, layout, accessibility.
  - Evidence: 375px 截图中约 230px 的侧栏保持展开，主工作区被压缩为很窄的一列；拖放区、进度区和主按钮发生严重纵向挤压，右侧参数被推到约 1650px 之后。设计方向要求核心转换路径清楚，而当前移动端无法正常扫描和操作。
  - Impact: 核心转换任务在手机宽度下事实上不可用；测试只检查“无横向滚动”，没有检查有效内容宽度。
  - Fix: 在 `apps/web/src/app/globals.css` 的移动断点把工作台改为单列；侧栏进入抽屉或工具选择器，参数进入底部面板/折叠区，中心工作区占满宽度。增加最小可用宽度和可见性断言，而不只检查 `scrollWidth`。

- [P1] 在线版整体视觉语言与已选方案相反
  - Location: `/tools/`, `ToolsClient.tsx` online shell and `globals.css` online tokens.
  - Surface: colors, layout, typography, shape/surfaces.
  - Evidence: 设计稿使用白色/浅冷灰底、钴蓝强调、精密线性网格和轻量层级；实现使用 `#07080a` 深色底、深灰面板、青色高亮和大量暗边框。实现中的 `--v2-page: #07080a`、`--v2-surface: #12141a` 与设计意图不一致。
  - Impact: 用户已经选择的“明亮工程实验室”方向没有进入实现；当前深色网格、命令式文案和密集暗框仍有明显的模板化科技/AI 感。
  - Fix: 以浅色 token 重新映射在线工作台，不直接复用当前暗色 studio tokens。建议基线为页面 `#F7F9FC`、表面 `#FFFFFF`、主色约 `#1268FF`、正文 `#101828`、次级文字 `#667085`、细边框 `#DDE5F0`；科技感由网格、状态轨迹和动效提供，而不是霓虹与暗面板。

- [P1] 在线核心工作流的层级和首屏比例没有匹配设计稿
  - Location: `ToolsClient.tsx:2123-2260`, `.apple-workspace-layout`, `.ws-center-canvas-hub`, `.apple-canvas-viewport-expanded`.
  - Surface: information architecture, spacing, layout rhythm, behavior.
  - Evidence: 设计稿首屏明确呈现“选择文件 → 输出格式 → 参数 → 转换”、紧凑文件队列和右侧参数；实现由 260px 侧栏、中央巨大空预览和 310px 参数栏组成，文件尚未导入时大部分首屏为空。
  - Impact: 首要任务被空预览稀释，用户需要先理解“挂载源/控制台内核”等系统语言，操作路径不如设计稿直接。
  - Fix: 保留统一工具导航，但把步骤、拖放、文件队列、输出摘要和主按钮组织成连续工作流；空状态降低预览高度，文件导入后再扩展预览和队列。不要新增独立工具页面。

- [P1] 离线版的信息架构没有采用专业桌面工作台结构
  - Location: desktop branch in `ToolsClient.tsx`, `.desktop-compact-*`, `.desktop-file-workspace`, `.desktop-backend-telemetry-cluster`.
  - Surface: layout, usability, spacing.
  - Evidence: 设计稿左侧为稳定的工具分类，中间为多文件平铺预览，右侧为参数检查器，底部持续展示输出位置；当前实现把“当前工具”和参数横向放在顶部，大面积单文件预览居中，右侧主要展示 FFmpeg/Sidecar 遥测。
  - Impact: 技术状态比用户任务更突出；切换工具、理解参数和确认批量输出目录的路径不够直接。
  - Fix: 将工具分类放到稳定左栏，将右栏改为参数和输出检查器；内核状态降级为状态栏或“诊断信息”折叠项。主工具栏只保留添加文件、添加文件夹、清空、开始/暂停/停止等高频动作。

- [P1] 第三方组件声明被当作代码块渲染
  - Location: `apps/web/src/app/release/[version]/docs/[doc]/page.tsx:109-161`, especially lines 148-152.
  - Surface: typography, copy/content, links, accessibility.
  - Evidence: 设计稿使用“组件 / 版本 / 许可证 / 项目主页”的真实表格；当前渲染显示 `| --- |` 等 Markdown 源文本，所有内容使用等宽字体，项目主页不是清晰的可点击链接。
  - Impact: 页面看起来像乱码或构建日志，法律与开源声明难以阅读和核查。
  - Fix: 为 Markdown 表格建立真正的 `<table>` 渲染，链接解析为 `<a>`，长 URL 允许换行；默认显示核心组件，完整 npm/Rust 依赖放入 `<details>`。不要用“只要包含 `|` 就进入 `<pre>`”的判断。

- [P1] 下载状态仍会暴露“分片”内部实现
  - Location: `apps/web/src/components/download/InstallerDownloadButton.tsx:97`.
  - Surface: copy/content, behavior.
  - Evidence: 设计稿只允许“正在下载 46% / 正在校验完整性 / 下载完成”；当前组件会设置“正在下载并校验第 n/N 个分片…”。
  - Impact: 直接违反已确认的用户界面原则，也让下载流程显得技术化和不稳定。
  - Fix: 内部继续使用 EdgeOne 分片下载，但界面只计算并显示总进度；所有分片索引、块数和校验细节只留在内部状态或诊断日志。完成后补拍下载中、校验中、完成三个渲染状态。

- [P2] 字体层级和文案风格增加了“AI/技术演示”感
  - Location: online sidebar/header/progress copy.
  - Surface: fonts/typography, copy/content.
  - Evidence: 当前大量使用小号全大写英文、宽字距 Bahnschrift、`CORE_READY // 等待挂载源`、“挂载本地转换流程”等命令式词语；设计稿使用更直接的中文步骤和更强的标题/正文层级。
  - Impact: 普通用户需要翻译技术隐喻，且视觉更像生成式概念界面而非成熟工具。
  - Fix: 在线显示标题可用现代无衬线粗体，正文保持系统中文字体；移除 `CORE_READY`、`Tool groups` 和“挂载”等术语，改为“等待选择文件”“工具分类”“文件仅在本机处理”。离线版继续使用 `Microsoft YaHei UI`/系统字体，不引入展示字体。

- [P2] 离线预览的缩放和背景处理不够专业
  - Location: `.desktop-file-stage-preview`, `.desktop-preview-single-media`.
  - Surface: image quality, asset fidelity, spacing.
  - Evidence: 实现中的 Excel 第一页只占预览画布很小部分，周围是大面积浅黄色背景；设计稿把文档第一页作为易识别的卡片缩略图，并保留文件名和页数信息。
  - Impact: 文件内容难以辨认，画面显得空且不稳定；多文件时会进一步降低识别效率。
  - Fix: 单文件使用“适合窗口/100%”预览控制；多文件使用统一比例缩略图，文档第一页居中裁切并显示类型角标、文件名、页数/尺寸。不要用大面积黄色作为默认文档背景。

- [P2] 图标体系不一致
  - Location: online navigation badges and action icons.
  - Surface: icons, polish.
  - Evidence: 实现同时使用线性图标、汉字徽标“裁/水/压/尺”和英文技术标签；设计稿是一致的线性图标体系。
  - Impact: 导航显得拼装，降低专业完成度。
  - Fix: 使用现有统一图标库，为工具分类和具体操作定义固定尺寸、描边和对齐规范；汉字徽标只在确有语义价值时保留。

## Required fidelity surfaces

- Fonts and typography: 未匹配。设计稿的具体字体文件未知，只能判断为现代中文无衬线；实现的系统字体可读，但在线版全大写英文、宽字距和命令式小字破坏层级。离线版系统字体方向可保留。
- Spacing and layout rhythm: 未匹配。在线首屏空预览过大，移动端列宽严重失衡；离线版顶部控件与主预览之间关系松散，右侧遥测权重过高。
- Colors and visual tokens: 未匹配。选定稿为明亮工程风，实现仍是深色 editorial-industrial 风。
- Image quality and asset fidelity: 部分通过。LOGO 清晰且品牌符号基本一致；离线文档第一页缩放过小，在线空状态没有可比较的真实文件缩略图。未发现用 CSS 图形替换 LOGO。
- Copy and content: 未匹配。在线存在 `CORE_READY`、“挂载”等技术措辞；第三方声明以 Markdown 源文本呈现；下载代码仍含“分片”用户文案。

## Accessibility and interaction

- 当前实现已有 `:focus-visible` 轮廓，这是可保留项。
- 375px 布局构成严重可用性问题，应作为发布阻断项。
- 设计稿是静态画板，当前截图也不能评价 hover、focus、loading、success、error 和动画质量。
- 后续在线动效必须支持 `prefers-reduced-motion`；拖放、格式切换、文件进入队列、进度变化可动，正文、广告和持续背景不应无休止运动。
- 广告在当前工具页截图中未出现，无法确认设计稿要求的独立边界和安全间距；需要在广告真实加载状态下补拍。

## Open Questions

- 设计稿中的 `PRO` 是生成稿伪内容，按已确认原则不应实现为会员或付费身份。
- 设计稿展示已导入多文件状态，在线实现截图是空状态；需要补拍同一文件和同一任务状态后再做细节级对比。
- 离线多文件平铺、视频首帧、PDF/Word/Excel 第一页目前没有同状态截图，不能判定这些状态已经达到设计稿。
- 下载状态没有浏览器实际渲染截图；当前代码层面的文案不符合要求，但视觉布局仍待补拍。
- 动画和广告真实加载状态没有动态证据，暂不判定通过。

## Implementation Checklist

1. 先修复 375px 在线工作台：侧栏抽屉化、中心全宽、参数折叠化。
2. 把在线工作台从暗色 studio tokens 迁移到方案 2 的明亮工程风 token。
3. 重组在线首屏为连续任务流，缩小空预览占比，并在导入后展示文件队列。
4. 重组离线版为左侧工具、中间预览、右侧参数、底部输出信息；遥测降级。
5. 修复第三方声明的 Markdown 表格和链接渲染。
6. 删除下载界面中的所有“分片”用户文案，只保留总进度、校验和完成。
7. 统一图标、字体层级和中文文案，删除 `PRO`、`CORE_READY` 等不合适内容。
8. 补拍桌面/平板/手机、离线多文件、下载三状态、第三方声明和广告加载状态，再进行第二轮同状态对比。

## Follow-up Polish

- 在线版动效以任务反馈为主：拖入吸附、格式切换、文件队列进入、进度轨迹和成功收束。
- 避免粒子背景、霓虹光球、循环扫描线和持续视差；这些会重新带回“AI 味”。
- 离线版只保留短促的选择、展开和进度过渡，不做展示性动效。

## Comparison history

### Iteration 1

- Compared source option 2 against current online desktop/tablet/mobile, current offline screenshot, and current third-party notices screenshot.
- Found actionable P0/P1/P2 differences listed above.
- No fixes were applied because this request was comparison-only.
- Post-fix evidence: not available.

## Final result

final result: blocked

Blockers: mobile core workflow is not usable at 375px; online and offline layouts do not match the selected design direction; third-party notices render as raw Markdown; download UI still exposes chunk terminology; required matching-state and motion evidence is incomplete.
