# UI_STYLE_REFRESH_ROUND 报告

## 1. 修改了哪些文件

本轮只修改 UI、页面展示和中文可见文案，没有修改核心转换逻辑、下载授权逻辑、CloudBase 云函数、Tauri 权限、WebView2 配置或 sidecar / WASM 范围。

修改文件：

- `UI_STYLE_REFRESH_PLAN.md`
- `apps/web/src/app/globals.css`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/components/layout/Header.tsx`
- `apps/web/src/components/layout/Footer.tsx`
- `apps/web/src/components/tools/ToolsClient.tsx`
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/download/page.tsx`
- `apps/web/src/components/download/DownloadAuthBox.tsx`
- `apps/web/src/app/about/page.tsx`
- `apps/web/src/app/contact/page.tsx`
- `apps/web/src/app/privacy/page.tsx`
- `apps/web/src/app/terms/page.tsx`
- `apps/web/src/app/licenses/page.tsx`
- `apps/web/src/app/tutorials/page.tsx`
- `apps/web/src/app/changelog/page.tsx`
- `apps/web/src/config/downloads.ts`

## 2. 在线版改了哪些区域

- 全局视觉升级为深蓝黑科技风，使用青蓝色高亮、细边框、深色卡片和克制阴影。
- 首页 Hero、能力卡片、本地处理说明和底部广告容器做了深色视觉统一。
- `/tools` 在线工具页保留“功能选择 → 添加文件 → 参数设置 → 开始处理 → 下载结果”的主流程，只升级：
  - 功能卡片选中态；
  - 上传区域；
  - 参数面板；
  - 文件信息和预览区；
  - 处理状态、进度、结果按钮；
  - 批量处理离线专业版提示。
- 在线版仍保持单文件或少量文件轻量处理定位，批量处理入口仍只提示下载 Windows 离线专业版。

## 3. 离线专业版改了哪些区域

- 离线专业版工作台视觉升级为深色专业工具风。
- 左侧导航、顶部工具栏、中间批量任务表格、右侧参数面板、底部状态栏统一成深色卡片和细边框样式。
- 批量任务状态标签、进度条、失败原因、任务历史、sidecar 设置面板做了视觉统一。
- 仍保留原有批量任务队列、输出目录、失败重试、取消、清空、打开输出目录、打开结果文件、导出日志和任务历史逻辑。

## 4. 下载页是否改动

已改动视觉和中文展示，不改动授权流程。

- 下载页改成深色卡片布局。
- EXE / MSI 选择、SHA256 展示、下载口令输入、CloudBase 临时链接获取入口保持原逻辑。
- 安装指南、隐私说明、开源许可证、第三方 Notices、FFmpeg 许可证说明入口继续保留。

## 5. 广告位是否仍在原位置

是。

保留位置：

- 首页：`<div id="ad-container">` 内的 `AdSlot name="homeMiddle"`。
- 在线工具页：工具区下方、页脚上方的 `<div id="ad-container">` 内的 `AdSlot name="toolBottom"`。
- 下载页：页面底部的 `<div id="ad-container">` 内的 `AdSlot name="downloadBottom"`。
- 教程页：教程列表底部的 `<div id="ad-container">` 内的 `AdSlot name="tutorialBottom"`。

## 6. 广告逻辑是否未改变

未改变。`AdSlot`、`adsConfig`、Google / Baidu / placeholder 逻辑均未修改。广告组件仍不接触 File、Blob、ArrayBuffer、Canvas 或转换结果。

## 7. 是否改动程序图标

未改动。

- 网页 Header 仍使用 `/icons/app-icon-64.png`。
- Tauri 图标配置仍为 `icons/icon.ico` 和 `icons/icon.png`，本轮未修改。

## 8. 是否新增登录 / 注册

没有新增。

## 9. 是否新增会员 / VIP

没有新增。

## 10. 是否新增不存在的功能

没有新增不存在的功能。本轮只做视觉升级和页面展示统一。

## 11. 是否新增云转换

没有新增云转换。

## 12. 是否改动 CloudBase 下载授权

未改动 CloudBase 下载授权。

- 未修改 `cloudbase/functions/createDownloadUrl/index.js`。
- 未修改 CloudBase 环境变量。
- 未修改下载口令逻辑。

## 13. 是否改动 createDownloadUrl

未改动。

## 14. 是否改动 EXE / MSI 下载口令流程

未改动。

`DownloadAuthBox` 仍按原流程向 `downloadAuthConfig.endpoint` 发送：

- `password`
- `packageType`
- `appName`
- `version`

## 15. 是否保留 SHA256 展示

保留。下载页继续展示 EXE / MSI SHA256，并保留 SHA256 校验提示。

## 16. 是否保留隐私说明入口

保留。Header、Footer、下载页和隐私页入口仍存在。

## 17. 是否保留开源许可证入口

保留。Footer、下载页和 `/licenses` 页面入口仍存在。

## 18. 是否保留第三方 Notices 入口

保留。下载页继续保留 `THIRD_PARTY_NOTICES.md` 入口，开源许可证页继续展示第三方 Notices 信息。

## 19. 是否保留 FFmpeg 许可证说明入口

保留。下载页继续保留 `FFMPEG_LICENSE_NOTICE.md` 入口，开源许可证页继续展示 FFmpeg 许可证说明。

## 20. 是否影响在线版转换功能

未改动转换核心逻辑。在线版图片、PDF、Word、Excel、音频、视频相关处理函数和调用边界未改变。

## 21. 是否影响离线专业版批量功能

未改动批量任务核心逻辑。批量队列、输出目录、任务历史、失败重试、打开结果文件、导出日志等逻辑未改变。

## 22. 是否影响 sidecar / WASM 当前范围

未改变。

- 在线版继续使用 FFmpeg WASM。
- 离线专业版继续保留 FFmpeg WASM 回退。
- 离线专业版 sidecar 优先范围未扩大，仍限于 WAV 转 FLAC、MP4 转 WebM 和媒体信息读取。

## 23. 是否影响 Tauri 权限

未修改 `apps/desktop/src-tauri/tauri.conf.json` 权限配置。

## 24. 是否影响 WebView2 offlineInstaller

未修改 WebView2 offlineInstaller 配置。`package:desktop` 过程中仍按既有 Tauri 打包配置处理 WebView2 离线安装器。

## 25. 移动端适配结果

本轮 UI 变更遵循移动端单列、按钮可点击、文本可换行、宽度不溢出的原则：

- 页面根布局使用响应式 `px-4 sm:px-6 lg:px-8`。
- 工具卡片和下载卡片在移动端降为单列。
- 长文件名、SHA256、路径文本使用 `break-words` / `break-all`。
- 在线工具页主流程仍在移动端按“功能 → 文件 → 参数 → 结果”顺序展示。

构建阶段已通过 Next 静态导出，未发现因样式导致的编译问题。实际 375px 视觉建议在部署前再用浏览器截图做人工确认。

## 26. 桌面端适配结果

桌面端采用参考图的专业工具布局语言：

- 在线版：顶部品牌、主工作区、参数面板、状态和结果区层级更清楚。
- 离线专业版：左侧导航、中间任务表格、右侧参数面板、底部状态栏保持原结构，仅升级视觉。

## 27. 回滚方式

如果需要回滚本轮 UI 改版，可按文件范围回退：

1. 回退 `apps/web/src/app/globals.css` 的深色主题样式。
2. 回退 `Header.tsx`、`Footer.tsx`、`ToolsClient.tsx`、`page.tsx`、`download/page.tsx` 等 UI 文件。
3. 保留 `cloudbase/functions/createDownloadUrl/index.js`、`tauri.conf.json`、FFmpeg / WebView2 / sidecar 相关文件不动。

由于本轮未改核心逻辑、权限、下载授权和安装包配置，回滚只需要恢复 UI 文件即可。

## 28. 验收命令结果

已执行并通过：

- `D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 test`
  - 结果：10 个测试文件通过，46 个测试通过。
- `D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 build:web`
  - 结果：Next.js 静态导出成功，生成 15 个静态页面。
- `D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 --filter web exec tsc --noEmit`
  - 结果：通过。
- `D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 package:desktop`
  - 结果：通过，EXE / MSI 均生成成功。

新生成安装包：

- EXE：`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\nsis\万能格式转换器_1.0.0_x64-setup.exe`
  - 大小：245.68 MB
  - SHA256：`1E7E4D29F2BEE93C3C1F018A68F23511A8F1851291FBAF114DB951E056065521`
- MSI：`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\msi\万能格式转换器_1.0.0_x64_zh-CN.msi`
  - 大小：256.51 MB
  - SHA256：`A6D4EB19E0E18024FB85A70571C122D5252708AEE57B9EC0087D6DCC040FAE18`

## 29. 部署状态

本轮没有部署到 CloudBase，没有执行 `tcb hosting deploy`，没有重新上传安装包。

