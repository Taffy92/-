# SIDECAR_FFMPEG_TECHNICAL_DESIGN

生成时间：2026-05-24

本设计用于 Windows 离线专业版长期迁移到 Tauri sidecar FFmpeg。本轮不直接实现，只定义可落地的技术方案和边界。

## 1. 目标架构

目标是形成双后端架构：

1. 在线网页版：继续使用 FFmpeg WASM。
2. Windows 离线专业版：优先使用 Tauri sidecar `ffmpeg.exe`。
3. 离线专业版保留 FFmpeg WASM 作为阶段性回退。
4. UI、任务队列、参数面板尽量复用现有结构。
5. 所有用户文件仍然只在本地处理，不上传服务器。

建议分层：

```text
ToolsClient.tsx
  -> media conversion adapter
      -> wasm backend
      -> tauri sidecar backend
          -> Tauri command
              -> validated ffmpeg argument builder
              -> bundled ffmpeg.exe
```

## 2. 在线版继续使用 FFmpeg WASM

在线版保持当前方案：

1. `packages/media-core/src/index.ts` 继续导出 WASM 转换函数。
2. `apps/web/scripts/prepare-static.mjs` 继续复制 FFmpeg WASM。
3. 在线版继续从 `/ffmpeg/ffmpeg-core.js` 和 `/ffmpeg/ffmpeg-core.wasm` 加载。
4. 在线版只做单文件或少量文件轻量处理。
5. 在线版批量处理入口只跳转或提示下载离线专业版。

在线版不得：

1. 调用 Tauri sidecar。
2. 调用云端转换 API。
3. 上传音频、视频或转换结果。
4. 请求 unpkg、jsdelivr 或其他远程 FFmpeg 资源。

## 3. 离线专业版使用 sidecar ffmpeg.exe

离线专业版新增 sidecar 后端：

1. 打包 `ffmpeg.exe` 到安装目录资源中。
2. 可选打包 `ffprobe.exe` 用于媒体信息检测。
3. 前端在 `isDesktopSurface === true` 且 sidecar 可用时调用 Tauri command。
4. Tauri command 使用 sidecar 执行转换。
5. 转换结果直接写入用户选择的输出目录。

建议 Tauri command：

```rust
#[tauri::command]
async fn convert_media_sidecar(request: MediaSidecarRequest) -> Result<MediaSidecarResult, String>
```

建议请求字段：

```ts
type MediaSidecarRequest = {
  taskId: string;
  mode: "video-convert" | "audio-convert" | "video-audio";
  inputPath: string;
  outputDir: string;
  outputName: string;
  outputFormat: string;
  quality: "small" | "balanced" | "high";
  videoSize?: "original" | "1080p" | "720p" | "480p";
  audioBitrate?: "96k" | "128k" | "192k" | "256k";
  stripMetadata: boolean;
}
```

建议结果字段：

```ts
type MediaSidecarResult = {
  taskId: string;
  outputPath: string;
  resultName: string;
  durationMs: number;
}
```

## 4. 如何通过 Tauri 调用 sidecar

Tauri v1 可通过 Rust 侧 `Command` 或 Tauri sidecar API 调用。推荐由 Rust command 管理，不把命令执行暴露给前端。

Rust 侧职责：

1. 根据 `mode` 和白名单参数构建参数数组。
2. 解析输入路径和输出目录。
3. 检查输入文件存在。
4. 检查输出目录存在。
5. 检查输出路径不指向系统目录。
6. 启动 `ffmpeg.exe`。
7. 捕获 stderr 进度。
8. 返回成功或失败。

前端职责：

1. 提交结构化参数。
2. 显示进度。
3. 展示失败原因。
4. 记录任务历史。
5. 不拼接命令字符串。

## 5. 如何限制命令参数，避免任意命令执行

必须禁止用户输入任意 FFmpeg 参数。

只允许白名单：

1. 模式白名单：`video-convert`、`audio-convert`、`video-audio`。
2. 输入格式白名单：`mp4`、`mov`、`avi`、`mkv`、`webm`、`mp3`、`wav`、`aac`、`m4a`、`flac`。
3. 输出格式白名单：同产品支持格式。
4. 质量白名单：`small`、`balanced`、`high`。
5. 分辨率白名单：`original`、`1080p`、`720p`、`480p`。
6. 音频码率白名单：`96k`、`128k`、`192k`、`256k`。
7. 布尔选项：`stripMetadata`。

Rust 侧只接受结构化字段，不接受原始 args。

命令必须用参数数组：

```rust
Command::new(ffmpeg_path).args(args)
```

不得使用：

1. `cmd /c`
2. PowerShell 拼接命令
3. shell 字符串拼接
4. 用户可控完整命令行

## 6. 如何解析 FFmpeg 进度

推荐使用 FFmpeg 的 `-progress pipe:2` 或 `-progress pipe:1`。

命令参数示例：

```text
-hide_banner
-nostdin
-y
-progress pipe:2
-i input
...
output
```

FFmpeg progress 输出中可解析：

1. `out_time_ms`
2. `out_time`
3. `progress=continue`
4. `progress=end`

需要先获取总时长：

方案 1：用 `ffprobe.exe` 读取 duration。

方案 2：从 FFmpeg stderr 中解析 `Duration: 00:01:23.45`。

推荐长期方案：

1. 打包 `ffprobe.exe`。
2. 转换前读取时长。
3. 根据 `out_time_ms / durationMs` 计算进度。

## 7. 如何取消任务

需要由 Rust 侧维护进程句柄。

建议设计：

1. 前端每个任务有 `taskId`。
2. `convert_media_sidecar` 启动时把 child process 记录到任务表。
3. 新增 Tauri command：`cancel_media_sidecar_task(taskId)`。
4. 用户点击取消时，Rust 侧 kill 对应 child process。
5. 清理未完成输出文件。
6. 返回“用户取消处理”。

取消任务不得杀死其他任务。

## 8. 如何处理失败原因

Rust 侧应把 FFmpeg stderr 转为友好错误。

错误映射建议：

1. 输入文件不存在：`文件不存在，请重新添加文件。`
2. 输出目录不存在：`输出目录不存在，请重新选择输出目录。`
3. 无权限写入：`无法写入输出目录，请选择有写入权限的位置。`
4. 无音轨：`该视频没有可提取的音频轨道。`
5. 编码器不可用：`当前 FFmpeg 构建不支持该输出格式，请换用其他格式。`
6. 文件损坏：`文件可能已损坏或编码不受支持，请换用其他文件重试。`
7. 用户取消：`用户取消处理。`

日志中只展示脱敏路径。

## 9. 中文路径、D 盘路径、带空格路径

必须使用参数数组传递路径，不能拼接 shell 字符串。

路径规则：

1. Windows 路径保持原始 `PathBuf`。
2. 输入文件来自用户主动选择或文件夹导入。
3. 输出目录来自用户主动选择。
4. 输出文件名由程序生成，并清理非法字符。
5. 支持 `D:\`。
6. 支持中文路径。
7. 支持带空格路径。
8. 支持较长文件名，但需限制最终输出文件名长度，避免 Windows 路径过长。

建议输出文件名处理：

1. 保留原文件主名。
2. 清理 `<>:"/\|?*`。
3. 限制主名长度，例如 120 字符。
4. 自动追加后缀：`converted`、`audio`。

## 10. 输出目录

离线专业版当前已有输出目录选择逻辑。

sidecar 后端应复用：

1. `outputDirectory.kind === "tauri"`。
2. `outputDirectory.path` 作为输出目录。
3. 如果未选择输出目录，使用默认下载目录或当前 fallback 下载逻辑。

建议 sidecar 初期只在已选择 Tauri 输出目录时启用。

如果没有输出目录：

1. 提示用户选择输出目录。
2. 或自动使用下载目录。
3. 不建议 sidecar 输出到浏览器 Blob 后再下载，因为这会失去 sidecar 大文件优势。

## 11. 视频格式转换

sidecar 视频转换应支持：

1. MP4
2. MOV
3. AVI
4. MKV
5. WebM

建议初期默认支持：

1. MP4 输出。
2. WebM 输出。
3. MOV 到 MP4。

其他格式先保留实验或提示。

参数建议：

MP4/MOV：

```text
-map 0:v:0 -map 0:a? -shortest
-c:v <chosen-video-encoder>
-pix_fmt yuv420p
-c:a aac
-movflags +faststart
```

WebM：

```text
-c:v libvpx-vp9
-c:a libopus
```

如果使用 LGPL 构建且不启用 `libx264`，H.264 编码需要单独评估，详见 `LGPL_FFMPEG_BUILD_EVALUATION.md`。

## 12. 音频格式转换

sidecar 音频转换应支持：

1. MP3
2. WAV
3. AAC
4. M4A
5. FLAC

默认参数：

1. WAV：`pcm_s16le`
2. FLAC：`flac`
3. AAC/M4A：`aac`
4. MP3：优先评估 LGPL 构建中可用编码器和许可证风险

## 13. 视频提取音频

推荐实现：

```text
-map 0:a:0
-vn
```

输出格式：

1. MP3
2. WAV
3. M4A
4. AAC

无音轨时必须返回明确错误：

`该视频没有可提取的音频轨道。`

## 14. 接入现有批量任务队列

建议新增统一执行函数：

```ts
async function processMediaTask(item, mode, onProgress) {
  if (isDesktopSurface && sidecarEnabled && item.sourcePath && outputDirectory.kind === "tauri") {
    return runMediaSidecarTask(...)
  }
  return runMediaWasmTask(...)
}
```

接入点：

1. `processBatchTask`
2. `runVideoConvert`
3. `runAudioConvert`
4. `runVideoExtractAudio`

阶段 1 不替换现有逻辑，只新增检测和实验开关。

## 15. 任务历史

任务历史继续沿用：

`apps/web/src/lib/batchQueue.ts`

sidecar 成功后记录：

1. `resultName`
2. `outputPath`
3. `status`
4. `durationMs`
5. `sanitizedOutputPath`
6. `error`

不得保存：

1. 文件内容。
2. 完整敏感路径。
3. FFmpeg 原始完整命令行。

## 16. 导出日志

处理日志继续使用现有 `buildBatchLog`。

新增 sidecar 后建议记录：

1. 任务模式。
2. 输出格式。
3. 结果文件名。
4. 脱敏输出路径。
5. 友好失败原因。
6. 耗时。

不得记录：

1. 完整输入路径。
2. 完整输出路径。
3. 原始 FFmpeg stderr 全量内容。
4. 用户文件内容。

## 17. 保持所有文件本地处理

sidecar 架构下文件处理仍然完全本地：

1. 输入文件来自本机路径。
2. `ffmpeg.exe` 在本机执行。
3. 输出文件写入本机目录。
4. 任务历史保存在本机。
5. 日志保存在本机。
6. 不需要服务器参与。

## 18. 避免云转换或文件上传

不得新增：

1. 音视频上传接口。
2. 云端转换 API。
3. 远程 FFmpeg 服务。
4. 日志上传。
5. 路径上传。
6. 转换结果上传。

Tauri 配置不得新增不必要的网络权限。

## 19. 推荐实施结论

推荐采用：

1. 在线版：保持 FFmpeg WASM。
2. 离线专业版：新增 sidecar FFmpeg 后端。
3. 初期：实验开关，不默认替换。
4. 中期：离线专业版音视频默认 sidecar。
5. 长期：保留 WASM 回退，并完成 LGPL 或 GPL 发布合规。
