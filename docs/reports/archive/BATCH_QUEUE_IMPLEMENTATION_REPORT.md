# Batch Queue Implementation Report

生成时间：2026-05-23

## 1. 修改文件

新增：

1. `BATCH_QUEUE_IMPLEMENTATION_PLAN.md`
2. `BATCH_QUEUE_PRIVACY_CHECK.md`
3. `BATCH_QUEUE_IMPLEMENTATION_REPORT.md`
4. `apps/web/src/lib/batchQueue.ts`
5. `apps/web/src/tests/batchQueue.test.ts`

修改：

1. `apps/web/src/components/tools/ToolsClient.tsx`
2. `apps/desktop/src-tauri/tauri.conf.json`

## 2. 新增数据结构

新增 `BatchTaskStatus`：

- `queued`：等待中
- `running`：处理中
- `success`：成功
- `failed`：失败
- `cancelled`：已取消

新增 `BatchTask`：

- `id`
- `file`
- `fileName`
- `sourcePath`
- `fileType`
- `fileSize`
- `mode`
- `outputFormat`
- `outputPath`
- `resultName`
- `progress`
- `status`
- `error`
- `createdAt`
- `completedAt`

新增 `BatchImportSummary`：

- `imported`
- `skipped`
- `total`
- `source`

新增 `BatchOutputDirectory`：

- `download`
- `tauri`
- `browser`

## 3. 批量任务队列实现程度

已实现：

1. 离线专业版真实任务队列状态。
2. 多文件添加后生成独立任务行。
3. 每个任务独立记录：
   - 文件名；
   - 文件类型；
   - 文件大小；
   - 输出格式；
   - 进度；
   - 状态；
   - 失败原因；
   - 输出路径；
   - 创建时间；
   - 完成时间。
4. 支持顺序处理，默认并发为 1，降低大文件内存风险。
5. 支持任务取消。
6. 支持失败 / 已取消任务重试。
7. 支持清空已完成任务。
8. 支持清空全部任务。
9. 支持任务完成后记录结果文件名和输出路径。
10. 支持导出处理日志。

批量模式覆盖：

1. 图片批量压缩。
2. 图片批量加水印。
3. Word 批量转图片。
4. Excel 批量转图片。
5. 视频批量转换。
6. 音频批量转换。
7. 视频批量提取音频。

## 4. 输出目录选择是否真实可用

已实现。

Tauri 离线版：

- 使用 `window.__TAURI__.dialog.open({ directory: true })` 选择本地输出目录；
- 使用 `fs.writeBinaryFile` 写入结果；
- 使用 `shell.open` 打开输出目录；
- 默认尝试使用系统下载目录。

浏览器回退：

- 如果存在 `showDirectoryPicker`，使用浏览器本地目录授权写入；
- 如果不可用，则回退为本地 ZIP 下载。

路径展示：

- UI 展示使用脱敏路径，例如 `D:/.../输出目录`；
- 日志不记录完整敏感路径。

## 5. 文件夹导入是否真实可用

已实现。

Tauri 离线版：

- 使用目录选择对话框选择文件夹；
- 使用 `fs.readDir` 逐层扫描；
- 最大扫描深度：4；
- 最大扫描文件项：500；
- 只导入当前批量模式支持的格式；
- 自动跳过不支持的文件；
- 显示扫描总数、导入数量、跳过数量。

浏览器回退：

- 使用隐藏的 `webkitdirectory` 文件输入；
- 同样按当前批量模式过滤支持格式。

## 6. 失败重试是否真实可用

已实现。

失败或已取消任务会显示重试按钮。点击后：

1. 状态重置为等待中；
2. 清除失败原因；
3. 清除完成时间和旧输出路径；
4. 下次点击“开始处理”时会重新执行。

## 7. 结果管理是否真实可用

已实现基础结果管理：

1. 显示成功数量。
2. 显示失败数量。
3. 显示当前输出目录。
4. 支持打开输出目录。
5. 支持复制输出路径。
6. 支持查看任务行失败原因。
7. 支持失败任务重试。
8. 支持导出处理日志。

限制：

- 当前没有持久化历史记录，关闭应用后队列不会保留；
- 没有做多任务并发，当前设计为顺序处理；
- 复杂 Office 高保真渲染仍沿用现有本地轻量方案。

## 8. 是否影响在线版

影响范围很小。

在线版继续保持：

1. 单文件轻量工具；
2. 不显示批量任务 Tab；
3. 不显示离线专业版左中右工作台；
4. 不显示文件夹导入和输出目录选择；
5. 不改变原有“功能选择 → 添加文件 → 参数设置 → 开始处理 → 下载结果”顺序。

新增批量代码主要在 `surface="desktop"` 的离线专业版分支中生效。

## 9. 是否影响本地处理和隐私逻辑

没有破坏。

继续保持：

1. 用户文件不上传服务器。
2. 文件夹导入不上传任何文件。
3. 输出目录选择不上传路径。
4. 批量处理不调用云端转换 API。
5. 日志不记录敏感完整路径。
6. 广告脚本和文件处理逻辑隔离。
7. CloudBase 只用于下载授权，不接触用户处理文件。

详情见：

- `BATCH_QUEUE_PRIVACY_CHECK.md`

## 10. Tauri 配置变更

文件：

- `apps/desktop/src-tauri/tauri.conf.json`

新增最小权限：

- `dialog.open`
- `fs.readDir`
- `fs.readFile`
- `fs.writeFile`
- `fs.createDir`
- `path.all`
- `shell.open`

同时启用：

- `withGlobalTauri: true`

用途：

1. 选择输出目录。
2. 选择文件夹。
3. 读取本地文件。
4. 写入转换结果。
5. 打开输出目录。

没有增加任何网络上传权限。

## 11. 测试和构建结果

已执行：

```powershell
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' test
```

结果：通过。

- 5 个测试文件通过；
- 24 个测试通过。

已执行：

```powershell
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' build:web
```

结果：通过。Next.js 15.5.18 静态导出成功。

已执行：

```powershell
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' --filter web exec tsc --noEmit
```

结果：通过。

已执行：

```powershell
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' package:desktop
```

结果：通过。

重新生成：

- `D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\nsis\万能格式转换器_1.0.0_x64-setup.exe`
  - 大小：217,562,811 bytes
  - 更新时间：2026-05-23 17:56:17
- `D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\msi\万能格式转换器_1.0.0_x64_zh-CN.msi`
  - 大小：216,031,232 bytes
  - 更新时间：2026-05-23 17:54:52

## 12. 下一轮应该做什么

建议下一轮进入“批量能力稳定性增强”：

1. 在真实离线软件中用样例文件验证：
   - 图片批量压缩；
   - 图片批量加水印；
   - Word 批量转图片；
   - Excel 批量转图片；
   - 视频批量转换；
   - 音频批量转换；
   - 视频批量提取音频。
2. 增加桌面端真实文件夹导入 E2E 冒烟脚本。
3. 增加大文件队列压力测试。
4. 增加任务历史持久化。
5. 增加打开单个结果文件。
6. 评估 Tauri sidecar FFmpeg，提高大视频处理性能。

