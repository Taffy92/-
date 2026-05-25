# Batch Queue Implementation Plan

生成时间：2026-05-23

## 1. 当前文件处理逻辑在哪里

当前核心入口在：

- `apps/web/src/components/tools/ToolsClient.tsx`

现有单文件处理函数：

- `runCrop`
- `runResize`
- `runWatermark`
- `runCompress`
- `runPdfImages`
- `runWordImages`
- `runExcelImages`
- `runVideoConvert`
- `runAudioConvert`
- `runVideoExtractAudio`

现有批量处理入口：

- `handleBatchFiles`
- `runBatch`

现状：`runBatch` 已经可以按顺序处理多个 `File`，但只有全局状态，没有每个任务独立状态、失败原因、输出目录、文件夹导入和真实结果管理。

底层本地处理能力分布：

- 图片：`packages/image-core`
- PDF：`packages/pdf-core`
- Word / Excel 转图片：`packages/export-core`
- 音视频：`packages/media-core`
- 文件类型、命名、格式判断：`packages/shared`

## 2. 当前在线版和离线版共用哪些组件

在线版和离线版共用：

- `ToolsClient`
- `ControlPanel`
- `ToolTabButton`
- `FileSummaryView`
- `BatchSummaryView`
- `StatusBadge`
- 单文件处理函数
- 大部分转换核心包

离线版通过：

```ts
surface="desktop"
```

进入专业工作台布局。在线版继续使用单页轻量流程，不显示批量任务 Tab。

## 3. 离线专业版批量任务队列应该放在哪些文件

本轮最小风险实现放在：

- `apps/web/src/components/tools/ToolsClient.tsx`

原因：

1. 当前批量 UI 和处理函数已经在该组件内。
2. 不需要新增全局状态库。
3. 可以复用现有处理参数和本地转换函数。
4. 不影响在线版主流程。

后续如果队列逻辑继续变复杂，可再拆分到：

- `apps/web/src/components/tools/batchQueue.ts`
- `apps/web/src/components/tools/desktopFileSystem.ts`
- `apps/web/src/components/tools/batchProcessing.ts`

## 4. 是否需要新增 task 类型定义

需要。

新增任务类型建议：

```ts
type BatchTaskStatus = "queued" | "running" | "success" | "failed" | "cancelled";

type BatchTask = {
  id: string;
  file: File;
  fileName: string;
  sourcePath?: string;
  fileType: string;
  fileSize: number;
  outputFormat: string;
  outputPath?: string;
  progress: number;
  status: BatchTaskStatus;
  error?: string;
  createdAt: number;
  completedAt?: number;
  resultName?: string;
};
```

任务内部保留 `File` 引用用于本地处理，但 UI 和日志只展示文件名、大小、类型和脱敏路径。

## 5. 是否需要新增本地状态管理

需要，但本轮不引入外部状态库。

新增 React 本地状态：

- `batchTasks`
- `activeTaskId`
- `outputDirectory`
- `outputDirectoryHandle`
- `importSummary`
- `batchLog`

原因：

1. 当前队列只服务离线专业版页面。
2. 不需要跨页面共享。
3. 避免引入 Redux/Zustand 等额外依赖和发布风险。

## 6. 是否需要使用 Tauri 文件系统 API

需要最小化使用。

本轮策略：

1. 优先使用 Tauri 全局 API：
   - `dialog.open` 选择输出目录；
   - `dialog.open` 选择文件夹；
   - `fs.readDir` 扫描目录；
   - `fs.readBinaryFile` 读取文件为本地 `File`；
   - `fs.writeBinaryFile` 写入转换结果；
   - `shell.open` 打开输出目录。
2. 如果不是 Tauri 环境，回退到：
   - `<input webkitdirectory>` 文件夹导入；
   - File System Access API `showDirectoryPicker`；
   - 普通浏览器下载。

需要最小化调整：

- `apps/desktop/src-tauri/tauri.conf.json`

增加 `dialog`、`fs`、`path` 允许项，继续保持 CSP 只允许本地资源。

## 7. 如何保证所有文件本地处理

1. 文件读取来自用户选择的 `File`、Tauri 本地文件系统 API 或浏览器本地目录 API。
2. 批量处理调用现有本地核心包，不调用云端转换 API。
3. 输出结果写入用户选择的本地目录，或生成本地 Blob 下载。
4. 日志只记录文件名、大小、状态和脱敏路径，不上传。
5. 继续保留并扩展 networkGuard / privacy 测试。
6. CloudBase 仍只用于下载授权，不接触用户处理文件。

## 8. 如何处理 Windows 路径、中文路径、D 盘路径

1. UI 展示路径时脱敏，只显示盘符、末级目录或文件名。
2. Tauri 文件系统 API 使用原始路径，不手动拼接 shell 命令。
3. 输出路径拼接使用 `/` 规整，但不通过命令行执行。
4. 允许 D 盘和用户目录作为读写范围。
5. 测试覆盖：
   - `D:\测试资料\图片一.jpg`
   - `C:\Users\用户\Downloads`
   - 含空格路径
   - 含中文路径

## 9. 如何避免一次性加载大文件导致卡死

1. 批量任务按顺序执行，默认并发为 1。
2. 文件夹扫描限制最大深度和最大数量。
3. 只导入支持格式，跳过不支持文件。
4. 单个任务完成后释放 Blob URL。
5. 大文件失败时只标记该任务失败，不中断整个队列。
6. 音视频任务使用 AbortController 支持取消。
7. 后续可把部分处理迁移到 Worker 或 Tauri sidecar，本轮先不做。

## 10. 如何逐步开发，降低风险

第一步：

- 新增 `BatchTask` 数据结构；
- 让多个文件添加后变成真实任务行；
- 每个任务有独立状态和失败原因。

第二步：

- 重构 `runBatch` 为逐任务执行；
- 成功任务记录结果文件名和输出路径；
- 失败任务保留错误原因并允许重试。

第三步：

- 接入输出目录选择；
- Tauri 环境写入真实目录；
- 非 Tauri 环境回退为 ZIP 下载。

第四步：

- 接入文件夹导入；
- 支持 Tauri 原生目录扫描和浏览器 `webkitdirectory` 回退；
- 显示导入数量和跳过数量。

第五步：

- 增加结果管理：
  - 成功数量；
  - 失败数量；
  - 打开输出目录；
  - 复制输出路径；
  - 导出处理日志。

第六步：

- 增加测试：
  - 队列状态；
  - 无任务按钮禁用；
  - 添加文件后任务数变化；
  - 失败原因；
  - 中文路径和 D 盘路径脱敏；
  - 隐私网络边界。

