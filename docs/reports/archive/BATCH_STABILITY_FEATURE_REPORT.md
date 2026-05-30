# BATCH_STABILITY_FEATURE_REPORT

生成时间：2026-05-24

本轮名称：`BATCH_STABILITY_FEATURE_ROUND`

## 读取资料

已参考：

- `TAURI_PERMISSION_REVIEW.md`
- `OFFLINE_BATCH_SMOKE_TEST_REPORT.md`
- `BATCH_QUEUE_IMPLEMENTATION_REPORT.md`
- `BATCH_QUEUE_PRIVACY_CHECK.md`
- `HALLMARK_UI_POLISH_REPORT.md`

说明：当前项目根目录未找到 `OFFLINE_P0_FIX_REPORT.md`。本轮没有因此中断，改为基于现有 P0 产物、冒烟证据和当前代码重新验证。

## 修改文件

本轮修改：

- `apps/web/src/lib/batchQueue.ts`
- `apps/web/src/components/tools/ToolsClient.tsx`
- `apps/web/src/tests/batchQueue.test.ts`
- `apps/web/src/tests/offlineP0.test.ts`
- `verification/offline-smoke/smoke-processing.mjs`
- `verification/offline-smoke/batch-stability-stress.mjs`
- `BATCH_STABILITY_PRIVACY_CHECK.md`
- `BATCH_STABILITY_FEATURE_REPORT.md`

## 任务历史持久化

实现方式：

- 仅在离线专业版 `surface === "desktop"` 下启用。
- 使用浏览器本机 `localStorage` 持久化，不依赖服务器。
- 存储 key：`format-converter.desktop.batch-history.v1`。
- 最近 100 条记录，超出后自动保留最新记录。
- 支持清空历史。
- 支持筛选：全部、成功、失败、取消。

记录字段：

- `id`
- `fileName`
- `fileType`
- `fileSize`
- `mode`
- `outputFormat`
- `sanitizedSourcePath`
- `sanitizedOutputPath`
- `resultName`
- `status`
- `error`
- `createdAt`
- `completedAt`
- `durationMs`

隐私处理：

- 不保存用户文件内容。
- 不保存 Blob、ArrayBuffer、Canvas 数据。
- 不保存完整敏感路径。
- 源路径和输出路径写入前经过 `sanitizeLocalPath` 脱敏。
- 在线版不显示任务历史。

## 打开单个结果文件

实现状态：已实现。

行为：

- 成功任务行显示“打开结果文件”按钮。
- 失败任务不显示该按钮。
- 保留“打开输出目录”能力。
- Tauri 环境下使用 `shell.open` 打开用户生成的本地结果文件。
- 非 Tauri 环境仍保持浏览器下载逻辑，不强行打开本地文件。
- 文件不存在时提示：“结果文件不存在，请重新处理或检查输出目录。”

可测性：

- `data-testid="open-result-file-button"`
- `aria-label="打开结果文件"`

安全边界：

- 不执行任意命令。
- 不扩大 Tauri 权限。
- 只针对用户生成的本地结果文件或输出目录。

## 大文件压力测试

新增脚本：

- `verification/offline-smoke/batch-stability-stress.mjs`

证据文件：

- `verification/offline-smoke/evidence/batch-stability-stress-result.json`

覆盖样例：

- 5MB JPG：`5MB_中文文件名_压缩测试.jpg`
- 10MB PNG：`10MB_表格截图_压缩测试.png`
- 大分辨率 PNG：`大分辨率_2500x2500.png`
- 损坏图片：`损坏图片.jpg`
- 长文件名 JPG
- 多媒体样例：`WAV 转 MP3_30秒.wav`
- 损坏视频：`损坏视频.mp4`
- 损坏文档：`损坏文档.docx`
- 损坏表格：`损坏表格.xlsx`

路径场景：

- D 盘路径
- 中文路径
- 带空格路径
- 长路径
- 输出目录不存在
- 无权限目录

结果：

- 压力样例动态生成并自动清理。
- 没有把大文件长期写入仓库。
- 脚本记录外部网络请求数为 0。
- 大文件真实耗时和内存峰值仍建议在下一轮专项中用外部样例目录半自动验证。

## 通过的功能

自动化 / 冒烟结果：

- 任务历史新增：通过单元测试覆盖。
- 历史记录最多 100 条：通过单元测试覆盖。
- 清空历史：界面已实现。
- 历史记录不包含完整敏感路径：通过单元测试覆盖。
- 成功任务显示打开结果文件按钮：通过源码测试标识覆盖。
- 失败任务不显示打开结果文件按钮：由成功状态条件控制。
- 打开结果文件路径为本地路径：实现中限制为本地路径和 Tauri `shell.open`。
- 图片批量压缩不请求远程 CDN：冒烟结果外部请求为 0，本地 worker 请求为 2。
- 批量处理无外部上传请求：文档、音频、视频冒烟外部请求为 0。
- Word 批量转图片：成功。
- Excel 批量转图片：成功。
- 音频批量转换：成功。
- 视频批量转换：成功。

## 失败或可接受限制

1. `OFFLINE_P0_FIX_REPORT.md` 当前根目录缺失。
   - 处理：本轮记录该事实，并用现有报告和实际测试重新验证。

2. WebView2 完整离线安装策略未处理。
   - 处理：按本轮限制只记录，不实现。

3. Tauri 权限未收窄。
   - 处理：本轮没有扩大权限；收窄会影响文件夹导入、输出目录选择、D 盘路径和中文路径，需要单独专项验证。

4. 大码率 1 分钟视频和无权限目录的真实写入失败体验未做完整人工压测。
   - 处理：本轮提供动态压力样例和验证清单，建议下一轮压力测试专项执行。

## 是否影响在线版

在线版主流程未改为批量流程。

影响范围：

- `batchQueue.ts` 新增历史工具函数，但历史功能只在 desktop surface 使用。
- 在线版仍保持单文件轻量处理流程。
- 最终已重新执行 `pnpm build:web`，`apps/web/out` 已恢复为在线版静态导出产物。

## 本地处理和隐私原则

本轮未引入云转换 API。

验证结论：

- 用户文件不上传服务器。
- 转换结果不上传服务器。
- 历史记录不上传服务器。
- 处理日志不上传服务器。
- 广告脚本和文件处理逻辑隔离。
- CloudBase 只用于下载授权口令。
- 图片压缩继续使用本地 worker。
- 音视频继续使用本地 FFmpeg 静态资源。

详见：`BATCH_STABILITY_PRIVACY_CHECK.md`。

## 测试和构建结果

已执行：

```powershell
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 --filter web exec tsc --noEmit
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 test
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 build:web
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 package:desktop
node verification\offline-smoke\batch-stability-stress.mjs
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 --filter web exec node ..\..\verification\offline-smoke\offline-p0-smoke.mjs
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 --filter web exec node ..\..\verification\offline-smoke\smoke-processing.mjs
```

结果：

- TypeScript：通过。
- Vitest：6 个测试文件，30 个测试全部通过。
- `build:web`：通过，静态导出 15 个页面。
- `package:desktop`：通过，EXE / MSI 已生成。
- 图片批量压缩 P0 冒烟：通过，外部请求 0。
- 文档 / 音频 / 视频批量冒烟：通过，外部请求 0，控制台错误 0。
- 压力样例脚本：通过，生成并清理本地样例。

## 新安装包

EXE：

- 路径：`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\nsis\万能格式转换器_1.0.0_x64-setup.exe`
- 大小：15.03 MB
- SHA256：`736B90BB98F1E3A8C8D7B97B5FC6C04DC9E9F3A99BA8153BBE0BA30BE9743D0D`

MSI：

- 路径：`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\msi\万能格式转换器_1.0.0_x64_zh-CN.msi`
- 大小：15.86 MB
- SHA256：`D2446AC2083AB0622A929E55E295464322F28A7316F4C41D289492DC98311DD4`

## 下一轮建议

可以进入：

1. WebView2 离线安装策略专项。
2. Tauri 权限收窄专项。
3. 大文件压力测试专项，使用外部测试目录，不污染仓库。
4. 打开单个结果文件的真实 Windows 安装环境人工验证。

