# 第二轮 UI 专业化实施计划

生成时间：2026-05-23  
项目路径：`D:\万能格式转换器项目`

## 1. 本轮边界

本轮进入 UI 专业化重构，但不做泛泛审查，不大改核心转换逻辑，不新增复杂功能，不破坏第一轮已经完成的安全、隐私、许可证、构建和桌面打包结果。

本轮只做：

- 在线网页版界面收敛为轻量、快速、可信的单页工具体验。
- 离线版界面从“网页工具页”调整为“专业工作台”体验。
- 修复仍然存在的用户可见中文乱码。
- 增加响应式、截图、可访问性、性能和构建验证。

本轮不做：

- 不改图片、PDF、Word、Excel、音视频核心转换算法。
- 不新增复杂批量处理引擎。
- 不改变 networkGuard 的隐私策略。
- 不删除第一轮生成的第三方 Notices 和许可证内容。
- 不改变 CloudBase 下载授权口令逻辑。

## 2. 在线网页版 UI 方案

在线版定位：轻量、快速、简单、可信。

页面结构调整：

1. 顶部导航保留品牌、在线工具、下载专业版、使用教程、关于我们。
2. 首屏标题明确显示“万能格式转换器”。
3. 首屏副标题强调“所有文件仅在本地处理，不上传服务器”。
4. 主工作区采用单页工具流程：
   - 功能选择卡片。
   - 文件添加区。
   - 参数设置。
   - 预览 / 文件信息 / 结果下载。
5. 文件添加区进入主流程，放在功能卡片之后或右侧主区，不漂浮，不遮挡功能卡片。
6. 功能卡片全部中文化，当前功能使用明显选中态。
7. 不可用能力只做清楚提示，不隐藏用户已经熟悉的入口。
8. 参数面板缩短垂直间距，按钮主次更清楚。
9. 进度、成功、失败状态使用固定状态区展示。
10. 广告只保留在 `<div id="ad-container">` 内，放在页面底部，不遮挡上传、处理、下载按钮。

响应式目标：

- 375px：单列布局，不横向溢出，功能卡片两列或一列压缩显示，按钮全宽。
- 768px：功能卡片两到三列，参数区与结果区上下布局。
- 1440px：功能区、文件区、参数区和结果区形成清晰桌面布局。

## 3. 离线专业版 UI 方案

离线专业版定位：商业级桌面工具、批量处理、本地处理、断网可用。

打开离线版后直接进入专业工作台，不展示网站首页。

布局：

1. 左侧导航栏：
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
2. 中间主区域：
   - 文件列表
   - 批量任务队列
   - 每个任务状态
   - 进度条
   - 成功 / 失败数量
   - 失败原因
   - 重试、取消、清空按钮
3. 右侧参数面板：
   - 输出格式
   - 压缩质量
   - 尺寸设置
   - 输出目录
   - 命名规则
   - 覆盖策略
   - 是否清理 EXIF
   - 并发数量
   - 高级参数
4. 底部状态栏：
   - 离线可用
   - 当前版本
   - 当前任务数量
   - 成功数量
   - 失败数量
   - 大文件/内存提示
   - 当前输出目录

实现策略：

- 复用现有 `ToolsClient` 的文件处理状态和任务执行函数。
- 在 `surface="desktop"` 时渲染独立的 `DesktopWorkbench` 外观。
- 在线版继续渲染 `WebToolWorkspace` 外观。
- 两个界面共享处理函数和参数状态，保证在线版与离线版功能一致，但视觉和信息架构区分。

## 4. 视觉规范

- 背景：浅灰蓝 `#F5F7FB`。
- 卡片：白底、轻边框、轻阴影。
- 主色：蓝色 / 青蓝色。
- 圆角：在线版偏柔和，离线版更克制。
- 按钮：开始处理为主按钮，取消为警示次按钮，下载结果为成功按钮。
- 任务状态：运行、成功、失败、取消分别使用明确颜色。
- 错误提示：告诉用户下一步该怎么做。

## 5. 隐私表达保留

在线版和离线版都必须明显展示：

- 文件仅在本地处理。
- 不上传服务器。
- 不调用云端转换 API。
- 离线专业版断网也可使用。
- CloudBase 只用于下载授权，不接触用户处理文件。

## 6. 计划修改文件

预计修改：

- `apps/web/src/config/site.ts`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/components/layout/Header.tsx`
- `apps/web/src/components/layout/Footer.tsx`
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/tools/page.tsx`
- `apps/web/src/app/download/page.tsx`
- `apps/web/src/components/tools/ToolsClient.tsx`
- `apps/web/src/app/globals.css`
- `apps/desktop/src/offline.ts`

预计新增：

- `apps/web/src/e2e/ui-round-2.spec.ts`
- `UI_ROUND_2_CHANGE_REPORT.md`

## 7. 验证计划

代码修改后执行：

```powershell
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' test
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' build:web
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' --filter web exec tsc --noEmit
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' package:desktop
```

UI 验证：

- Playwright 截图检查 375px、768px、1440px。
- 检查 `/tools` 在线版无横向溢出。
- 检查桌面模式 `NEXT_PUBLIC_APP_MODE=desktop` 下首页直接进入专业工作台。
- 检查 `#ad-container` 仍只在底部出现，不遮挡按钮。
- 检查关键按钮可聚焦、有可理解文字。
- 检查控制台没有明显运行时错误。

## 8. 风险控制

- 不修改转换核心包中的处理算法。
- 不改 CloudBase 下载函数。
- 不改 FFmpeg / PDF.js / ExcelJS 依赖策略。
- 不改 Tauri `tauri.conf.json` 中第一轮已修好的中文配置。
- 每次 UI 改动后优先跑 TypeScript 和现有隐私测试，发现影响立即回退局部 UI 改动。

