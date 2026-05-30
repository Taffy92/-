# Batch Queue Privacy Check

生成时间：2026-05-23

## 1. 文件夹导入

实现位置：

- `apps/web/src/components/tools/ToolsClient.tsx`
- `apps/web/src/lib/batchQueue.ts`

检查结果：

1. 文件夹导入只读取用户主动选择的本地目录。
2. Tauri 环境使用 `window.__TAURI__.dialog.open` 选择目录，使用 `fs.readDir` 和 `fs.readBinaryFile` 读取本地文件。
3. 浏览器回退使用 `<input webkitdirectory>`，同样只读取用户主动授权的本地文件。
4. 不会把文件夹路径、文件内容或文件列表发送到服务器。
5. 扫描限制为最大 4 层、最多 500 个文件项，避免误选大目录后长时间卡死。
6. 不支持的文件会被跳过，只记录导入数量和跳过数量。

## 2. 输出目录选择

检查结果：

1. Tauri 环境使用本地 `dialog.open({ directory: true })` 选择输出目录。
2. 浏览器回退使用 File System Access API `showDirectoryPicker`。
3. 输出目录仅保存在当前页面状态中。
4. 输出目录不会上传到服务器。
5. UI 展示路径时使用 `sanitizeLocalPath` 脱敏，例如：
   - `D:\客户资料\身份证\图片一.jpg`
   - 展示为：`D:/.../图片一.jpg`

## 3. 批量处理

检查结果：

1. 图片压缩、图片加水印、Word 转图片、Excel 转图片、视频转换、音频转换、视频提取音频均调用现有本地核心能力。
2. 没有新增云端转换 API。
3. 没有新增外部上传端点。
4. 每个任务单独执行，失败任务不会上传或中断其他任务。
5. 输出结果优先写入本地输出目录；无法写入目录时，回退为本地 ZIP 下载。

## 4. 日志隐私

检查结果：

1. 批量日志由 `buildBatchLog` 生成。
2. 日志记录任务状态、文件名、脱敏来源、脱敏输出和失败原因。
3. 日志不记录完整敏感路径。
4. 日志导出为本地 `.txt` 文件，不上传服务器。

## 5. 广告和 CloudBase 隔离

检查结果：

1. 广告仍只在 `#ad-container` 中展示。
2. 广告组件不接收 `File`、`Blob`、`ArrayBuffer`、Canvas 或转换结果。
3. CloudBase 仍只用于下载授权口令和临时安装包链接。
4. CloudBase 云函数不导入 `@doctool/*`、FFmpeg、PDF.js、ExcelJS 或转换核心。
5. CloudBase 不接触用户处理文件。

## 6. Tauri 权限检查

本轮最小化增加：

- `dialog.open`
- `fs.readDir`
- `fs.readFile`
- `fs.writeFile`
- `path.all`
- `shell.open`

用途：

1. 选择输出目录。
2. 读取用户选择的文件夹。
3. 写入本地转换结果。
4. 打开输出目录。

未增加：

- 网络上传权限；
- 远程 API 调用；
- 后台服务上传；
- 自动扫描系统目录。

## 7. 测试结果

已新增：

- `apps/web/src/tests/batchQueue.test.ts`

覆盖：

1. 批量任务状态。
2. 成功、失败、处理中、已取消、等待中统计。
3. 主流批量格式识别。
4. 文件夹导入统计。
5. 中文路径和 D 盘路径脱敏。
6. 日志不泄露完整敏感路径。

已保留：

- `networkGuard.test.ts`
- `privacy.test.ts`

结论：本轮批量队列开发没有改变“文件仅在本地处理，不上传服务器”的隐私边界。

