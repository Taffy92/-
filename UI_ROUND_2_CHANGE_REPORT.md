# 第二轮 UI 专业化重构变更报告

生成时间：2026-05-23

项目路径：`D:\万能格式转换器项目`

## 1. 本轮目标

本轮按照 `FIX_ROUND_1_REPORT.md`、`PROJECT_AUDIT_REPORT.md`、`UI_REDESIGN_PLAN.md`、`FEATURE_ENHANCEMENT_PLAN.md`、`OFFLINE_PRO_VERSION_PLAN.md`、`PRIVACY_SECURITY_AUDIT.md`、`NEXT_STEPS.md`、`THIRD_PARTY_NOTICES.md` 继续执行，不重新做泛泛审查。

本轮只处理发布前第二轮 UI 专业化：

- 在线网页版保持轻量、快速、简单、可信；
- 离线专业版改为桌面软件工作台，不再像网站首页；
- 不改核心转换逻辑；
- 不新增复杂转换功能；
- 不破坏第一轮安全、隐私、构建、许可证修复结果；
- 文件继续只在本地处理，不上传服务器。

## 2. 已修改文件

### 新增报告和测试

- `UI_ROUND_2_IMPLEMENTATION_PLAN.md`
- `UI_ROUND_2_CHANGE_REPORT.md`
- `apps/web/src/e2e/ui-round-2.spec.ts`

### 在线版和通用布局

- `apps/web/src/config/site.ts`
- `apps/web/src/config/downloads.ts`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/tools/page.tsx`
- `apps/web/src/app/download/page.tsx`
- `apps/web/src/components/layout/Header.tsx`
- `apps/web/src/components/layout/Footer.tsx`
- `apps/web/src/components/download/DownloadAuthBox.tsx`
- `apps/web/src/components/tools/ToolsClient.tsx`
- `apps/web/src/app/globals.css`

### 离线版

- `apps/desktop/src/offline.ts`

### Notices 和许可证产物

- `THIRD_PARTY_NOTICES.md`
- `docs/third-party-notices.md`
- `docs/licenses.md`
- `apps/web/src/generated/thirdPartyNotices.ts`

## 3. 在线版 UI 变更

在线版首页和工具页调整为更直接的工具站结构：

- 首屏品牌统一为“万能格式转换器”；
- 明确展示“所有文件仅在本地处理，不上传服务器”；
- 顶部导航精简为：在线工具、下载专业版、使用教程、关于我们；
- `/tools` 保持单页工具逻辑；
- 文件添加区进入主流程，不再漂浮或遮挡功能卡片；
- 功能卡片保持中文化，当前选中项使用更明显的边框、背景和图标态；
- 去除重复的横向功能 Tab，减少页面噪音；
- 参数面板继续复用原有处理逻辑，但视觉上更集中；
- 开始处理、取消任务、下载结果按钮继续保留主次关系；
- 底部广告保持在 `<div id="ad-container">` 中，不遮挡上传、处理和下载按钮；
- 下载页补充专业版说明：批量处理仅在离线专业版提供，CloudBase 只用于下载授权。

## 4. 离线专业版 UI 变更

离线版通过 `NEXT_PUBLIC_APP_MODE=desktop` 进入独立的专业工作台界面，不再显示在线网站首页。

已实现的桌面工作台结构：

- 左侧导航栏：
  - 首页工作台
  - 图片工具
  - 文档工具
  - 音视频工具
  - 批量任务
  - 结果管理
  - 使用教程
  - 隐私政策
  - 开源许可证
  - 设置中心
  - 关于我们
- 中间主区域：
  - 任务总数、成功数、失败数、当前功能指标；
  - 文件添加区；
  - 任务队列表格；
  - 文件名、文件类型、状态、操作；
  - 进度条；
  - 失败提示；
  - 下载结果区；
  - 结果管理摘要。
- 右侧参数面板：
  - 复用当前功能的参数设置；
  - 增加输出目录、命名规则、覆盖策略、EXIF 清理、并发数量、高级参数等专业版占位设置；
  - 明确提示文件仅在本机内存或本地目录处理。
- 底部状态栏：
  - 离线可用；
  - 当前版本；
  - 当前任务数量；
  - 成功数量；
  - 失败数量；
  - 大文件提示；
  - 当前输出目录。

离线版顶部导航也单独调整为：专业工作台、使用教程、隐私政策、开源许可证、关于我们，不再出现在线版“下载专业版”入口。

## 5. 新增或重构组件

在 `apps/web/src/components/tools/ToolsClient.tsx` 中新增或重构：

- `controlPanel`：抽出原有参数面板，在线版和离线版共用，避免重复逻辑；
- `DesktopMetric`：桌面专业版顶部指标卡；
- `DesktopTaskRow`：桌面专业版任务队列表格行；
- `surface="desktop"` 分支：专门承载离线版工作台 UI；
- `currentTab`、`taskCount`、`successCount`、`failureCount`：用于工作台指标和状态栏展示。

在 `apps/web/src/components/layout/Header.tsx` 中新增：

- `desktop?: boolean` 属性；
- 在线版和离线版不同导航结构。

在 `apps/web/src/app/globals.css` 中新增：

- `btn-primary`
- `btn-secondary`

用于统一主要按钮和次要按钮视觉层级。

## 6. 响应式适配结果

新增 Playwright 响应式检查：

- 375px 移动端；
- 768px 平板；
- 1440px 桌面。

检查结果：

- `/tools` 页面在 375px、768px、1440px 下均未出现页面级横向溢出；
- 品牌标题可见；
- “文件不上传服务器”提示可见；
- 当前功能选中态可识别；
- 文件添加区可见；
- `#ad-container` 只出现 1 个；
- 下载页授权说明和本地处理说明可见。

截图产物：

- `verification/ui-round-2-tools-mobile-375.png`
- `verification/ui-round-2-tools-tablet-768.png`
- `verification/ui-round-2-tools-desktop-1440.png`
- `verification/ui-round-2-desktop-workbench.png`

## 7. 截图检查结果

已通过 Playwright 生成并人工检查截图：

- 在线版移动端：单列布局正常，功能卡片和文件区在主流程内；
- 在线版平板：功能选择和文件处理区不会遮挡；
- 在线版桌面：主工作区层级清楚，广告位在底部；
- 离线专业版：左侧导航、中间任务队列、右侧参数面板、底部状态栏均可见。

截图中可见的浏览器开发提示小浮层属于本地开发环境，不属于应用 UI。

## 8. 可访问性检查结果

本轮没有引入新的第三方可访问性依赖，使用 Playwright 做基础可访问性验证：

- 主标题可被定位；
- 当前功能按钮使用 `aria-pressed` 表示选中态；
- 上传按钮、开始处理、取消任务、下载结果等按钮保留可见文本；
- 移动端触控区域保持较大间距；
- 没有使用广告浮窗遮挡主流程。

下一轮如需更严格检查，建议引入 `@axe-core/playwright` 做自动化 WCAG 扫描。

## 9. 性能检查结果

本轮未增加新的重型转换依赖，核心处理逻辑保持不变。

`pnpm build:web` 结果：

- `/tools` First Load JS：约 447 kB；
- `/` First Load JS：约 450 kB；
- 共享 First Load JS：约 103 kB；
- Next.js 静态导出成功。

当前较大的首屏包体主要来自既有本地转换能力和工具页客户端组件。本轮 UI 改动没有新增音视频、PDF、Office 转换核心依赖。

## 10. 隐私和本地处理影响

本轮没有改动核心转换逻辑和网络上传逻辑。

继续保持：

- 图片不上传服务器；
- PDF 不上传服务器；
- Word 不上传服务器；
- Excel 不上传服务器；
- 音频不上传服务器；
- 视频不上传服务器；
- 转换结果不上传服务器；
- OCR 文本、解析文本、文件内容不上传服务器；
- 不调用第三方云转换 API；
- CloudBase 只用于下载授权，不接触用户处理文件；
- 广告位只放在 `#ad-container`，并与文件处理逻辑隔离。

浏览器端隐私网络测试结果：

- `privacy-network.spec.ts` 通过；
- 广告和下载授权请求与用户处理文件隔离；
- 未检测到用户文件上传请求。

## 11. 构建和打包影响

本轮重新执行桌面打包，成功生成：

- `apps/desktop/src-tauri/target/release/bundle/nsis/万能格式转换器_1.0.0_x64-setup.exe`
- `apps/desktop/src-tauri/target/release/bundle/msi/万能格式转换器_1.0.0_x64_zh-CN.msi`

当前最终安装包信息：

- EXE 大小：207.37 MB
- EXE SHA256：`D4116F2381CC43E9CD06528654B20C788C0E32EF11BD02FB935AA1F256FE58ED`
- MSI 大小：205.85 MB
- MSI SHA256：`577B82E93898E0CDB37208FFBDF4644264ED8BB50760F86B28417F87AF84A6A3`

`THIRD_PARTY_NOTICES.md`、`docs/licenses.md`、`apps/web/src/generated/thirdPartyNotices.ts` 已根据最新构建产物重新生成。

注意：本机打包过程仍会在构建阶段下载 WebView2 离线安装资源；这是打包机行为，不代表最终用户使用软件时需要联网。最终 EXE/MSI 仍需在一台完全断网的干净 Windows 电脑上做实机安装验收。

## 12. 验收命令结果

已执行：

```powershell
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' test
```

结果：通过。4 个测试文件，18 个测试通过。

已执行：

```powershell
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' build:web
```

结果：通过。Next.js 15.5.18 静态导出成功。

已执行：

```powershell
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' --filter web exec tsc --noEmit
```

结果：通过，无 TypeScript 错误。

已执行：

```powershell
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' package:desktop
```

结果：通过。EXE 和 MSI 均重新生成。

额外执行：

```powershell
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' --filter web check:network:browser
```

结果：通过。5 个 Playwright 用例通过。

额外执行：

```powershell
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' generate:notices
```

结果：通过。NPM packages 835、Rust crates 415、artifacts 5。

## 13. 非阻塞提示

测试和打包中出现以下非阻塞提示：

- Vite CJS Node API deprecated：来自测试工具链提示，不影响当前构建；
- Node `module.register()` deprecated：来自 Playwright/工具链提示，不影响测试结果；
- Watchpack 扫描 `D:\System Volume Information` 报 EINVAL：开发服务器扫描 D 盘系统目录时出现，不影响页面构建和测试；
- 桌面打包阶段下载 WebView2 离线资源：属于构建机依赖准备动作。

## 14. 下一轮建议

下一轮建议不要再继续做视觉大改，优先做可验证的功能增强：

1. 给离线专业版补真实批量任务队列的数据结构、失败重试和结果目录选择；
2. 使用 Tauri 文件系统 API 接入真实输出目录，而不是仅展示占位文案；
3. 加入 `@axe-core/playwright` 做 WCAG 自动检查；
4. 增加桌面离线模式的端到端冒烟脚本；
5. 在一台完全断网 Windows 10/11 x64 电脑上验证 EXE/MSI 安装和核心功能；
6. 对 `/tools` 的重型客户端包继续做代码分割，降低首屏 JS；
7. 给音视频转换增加小样本真实转换回归测试。

