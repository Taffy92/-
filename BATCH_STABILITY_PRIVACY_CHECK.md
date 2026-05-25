# BATCH_STABILITY_PRIVACY_CHECK

生成时间：2026-05-24

本轮范围：离线专业版批量任务稳定性增强。在线版单文件流程未改为批量流程，未引入云端转换 API，未扩大 Tauri 权限。

## 结论

通过本轮检查，离线专业版新增的任务历史、打开单个结果文件、压力测试脚本均保持本地处理原则：

- 图片、PDF、Word、Excel、音频、视频文件不上传服务器。
- 转换结果不上传服务器。
- 批量任务历史不上传服务器。
- 处理日志不上传服务器。
- 广告脚本不接收 File、Blob、ArrayBuffer、Canvas 或转换结果。
- CloudBase 仍只用于下载授权口令，不接触用户处理文件。
- 图片压缩继续使用本地 worker，不请求 jsdelivr、unpkg 或其他第三方 CDN worker。
- 音视频继续使用本地 FFmpeg 静态资源，不调用云转换服务。

## 任务历史隐私检查

实现位置：

- `apps/web/src/lib/batchQueue.ts`
- `apps/web/src/components/tools/ToolsClient.tsx`

本地存储：

- `localStorage` key：`format-converter.desktop.batch-history.v1`
- 仅在 `surface === "desktop"` 的离线专业版工作台中启用。
- 在线版不显示任务历史入口。
- 最多保留最近 100 条历史记录。

保存字段：

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

不保存内容：

- 不保存用户文件内容。
- 不保存 Blob、ArrayBuffer、Canvas 数据。
- 不保存 OCR 或解析文本。
- 不保存完整敏感路径。
- 不保存转换结果内容。

路径处理：

- 历史记录通过 `sanitizeLocalPath` 写入脱敏路径。
- 展示给用户的是盘符和最后文件名 / 目录名，不展示完整中间目录。

## 打开单个结果文件检查

实现位置：

- `apps/web/src/components/tools/ToolsClient.tsx`

行为限制：

- 仅成功任务显示“打开结果文件”按钮。
- 按钮标识：`data-testid="open-result-file-button"`。
- 按钮可访问名称：`aria-label="打开结果文件"`。
- Tauri 环境下使用 `shell.open` 打开用户生成的本地结果文件。
- 浏览器环境不强行打开本地路径，仍保持下载逻辑。
- 不执行任意命令。
- 不拼接 shell 命令。
- 不扩大 Tauri shell 权限。
- 文件不存在时提示：“结果文件不存在，请重新处理或检查输出目录。”

路径兼容：

- D 盘路径：纳入验证范围。
- 中文路径：纳入验证范围。
- 带空格路径：纳入验证范围。
- 长路径：纳入验证范围。

## 外部网络隔离检查

验证文件：

- `verification/offline-smoke/offline-p0-smoke.mjs`
- `verification/offline-smoke/smoke-processing.mjs`
- `verification/offline-smoke/batch-stability-stress.mjs`

验证结果：

- 图片批量压缩外部请求数：0。
- 图片压缩本地 worker 请求数：2。
- 文档、音频、视频批量处理外部请求数：0。
- Playwright 控制台错误：0。
- 压力测试脚本不上传文件、不调用远程 API。

保留允许联网范围：

- 网站自身静态资源。
- 广告脚本。
- CloudBase 下载授权口令。
- 软件更新检查。
- 用户主动打开官网或帮助文档。

本轮未新增任何用户文件上传入口。

## 压力测试隐私检查

新增脚本：

- `verification/offline-smoke/batch-stability-stress.mjs`

证据文件：

- `verification/offline-smoke/evidence/batch-stability-stress-result.json`

脚本行为：

- 动态生成受控样例文件。
- 记录文件名、大小、格式、预期结果、内存风险提示。
- 记录 D 盘、中文路径、带空格路径、长路径、缺失目录、无权限目录场景。
- 运行后自动删除临时大文件。
- 不把大文件写入仓库。
- 不发起外部网络请求。

## 仍需后续专项处理

1. WebView2 离线安装策略：本轮按要求只记录，不处理。
2. Tauri 权限收窄：本轮未扩大权限，后续可单独做权限收窄专项，并在真实文件夹导入、输出目录选择、D 盘和中文路径场景下完整回归。
3. 更大音视频样例：本轮自动化覆盖小样例和动态压力元数据；真实 1 分钟大码率视频建议在后续压力测试专项中用外部测试目录半自动执行，避免污染仓库。

