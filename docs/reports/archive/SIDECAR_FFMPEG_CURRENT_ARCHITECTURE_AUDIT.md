# SIDECAR_FFMPEG_CURRENT_ARCHITECTURE_AUDIT

生成时间：2026-05-24

本报告审查当前“万能格式转换器”音视频转换架构，为后续 Windows 离线专业版迁移到 Tauri sidecar FFmpeg 做技术准备。本轮只做方案设计，不修改功能代码。

## 1. 当前音视频转换入口

当前用户可见入口集中在：

`apps/web/src/components/tools/ToolsClient.tsx`

在线版功能卡片包括：

1. `video-convert`：视频格式转换。
2. `audio-convert`：音频格式转换。
3. `video-audio`：视频提取音频。
4. `batch-gate`：在线版批量处理入口，只提示下载离线专业版。

离线专业版额外包含：

1. `batch`：离线批量处理。
2. 批量模式 `video-convert`。
3. 批量模式 `audio-convert`。
4. 批量模式 `video-audio`。

## 2. 当前 FFmpeg WASM 加载方式

当前音视频核心位于：

`packages/media-core/src/index.ts`

直接依赖：

1. `@ffmpeg/core@0.12.10`
2. `@ffmpeg/ffmpeg@0.12.15`
3. `@ffmpeg/util@0.12.2`

当前静态资源基准路径：

```ts
const ffmpegAssetBase = "/ffmpeg";
```

加载资源：

```ts
coreURL: assetUrl("/ffmpeg/ffmpeg-core.js")
wasmURL: assetUrl("/ffmpeg/ffmpeg-core.wasm")
```

静态资源复制脚本：

`apps/web/scripts/prepare-static.mjs`

该脚本从 `@ffmpeg/core/dist/umd` 复制：

1. `ffmpeg-core.js`
2. `ffmpeg-core.wasm`

目标目录：

1. `apps/web/public/ffmpeg`
2. 构建后进入 `apps/web/out/ffmpeg`

## 3. 在线版和离线专业版是否共用 media-core

是。

当前在线版和离线专业版都由同一个 Next.js 静态前端承载。Tauri 配置中：

```json
"distDir": "../../web/out"
```

离线专业版实际加载的是 `apps/web/out`，因此当前在线版和离线专业版共用：

1. `ToolsClient.tsx`
2. `@doctool/media-core`
3. `@ffmpeg/ffmpeg`
4. `/ffmpeg/ffmpeg-core.js`
5. `/ffmpeg/ffmpeg-core.wasm`

区别主要由 `NEXT_PUBLIC_APP_MODE=desktop` 和 `isDesktopSurface` 控制界面与批量功能。

## 4. 当前三个音视频函数

`packages/media-core/src/index.ts` 提供：

1. `convertVideoFormat(file, options)`
2. `convertAudioFormat(file, options)`
3. `extractAudioFromVideo(file, options)`

### convertVideoFormat

用于视频格式转换。

支持输出：

1. `mp4`
2. `mov`
3. `avi`
4. `mkv`
5. `webm`

当前参数逻辑：

1. WebM 使用 `libvpx-vp9` 和 `libopus`。
2. AVI 使用 `mpeg4` 和 `libmp3lame`。
3. 其他视频默认使用 `libx264` 和 `aac`。
4. 支持分辨率参数 `original`、`1080p`、`720p`、`480p`。
5. 支持清理元数据。

### convertAudioFormat

用于音频格式转换。

支持输出：

1. `mp3`
2. `wav`
3. `aac`
4. `m4a`
5. `flac`

当前参数逻辑：

1. WAV 使用 `pcm_s16le`。
2. FLAC 使用 `flac`。
3. MP3 使用 `libmp3lame`。
4. AAC/M4A 使用 `aac`。

### extractAudioFromVideo

用于从视频中提取音频。

支持输出：

1. `mp3`
2. `wav`
3. `m4a`
4. `aac`

当前参数逻辑：

1. 使用 `-map 0:a:0` 读取第一条音轨。
2. 使用 `audioArgs` 生成音频编码参数。
3. 支持清理元数据。

## 5. 当前批量队列如何调用音视频转换

批量任务在：

`apps/web/src/components/tools/ToolsClient.tsx`

核心函数：

1. `runBatch`
2. `processBatchTask`
3. `saveBatchResult`

批量音视频调用点：

1. `mode === "video-convert"` 时调用 `convertVideoFormat`。
2. `mode === "video-audio"` 时调用 `extractAudioFromVideo`。
3. 其他音频批量模式调用 `convertAudioFormat`。

批量结果当前先生成 `Blob`，再由 `saveBatchResult` 保存：

1. Tauri 环境：`tauri.fs.writeBinaryFile`
2. 浏览器目录句柄：File System Access API
3. 否则 fallback 到 ZIP 下载

## 6. 当前 Tauri 侧架构

当前 Tauri Rust 入口：

`apps/desktop/src-tauri/src/main.rs`

当前只有标准启动代码：

```rust
tauri::Builder::default()
  .run(tauri::generate_context!())
```

目前没有：

1. 自定义 `#[tauri::command]`
2. Rust 侧 FFmpeg 调用
3. sidecar 进程管理
4. stdout/stderr 进度解析
5. Rust 侧取消任务句柄

当前 Tauri 权限：

1. `fs.readFile`
2. `fs.writeFile`
3. `fs.readDir`
4. `dialog.open`
5. `dialog.save`
6. `path.all`
7. `shell.open`

当前未开启：

1. `process.all`
2. `updater`
3. 任意 shell 执行

## 7. 未来在线版继续走 WASM 的方式

在线版应继续保持当前路径：

1. `@doctool/media-core` 保留 WASM 后端。
2. `/ffmpeg/ffmpeg-core.js` 保留。
3. `/ffmpeg/ffmpeg-core.wasm` 保留。
4. 在线版单文件音频转换、视频转换、视频提取音频继续调用 WASM。
5. 在线版批量入口继续只提示下载离线专业版。

关键要求：

1. 不从在线版删除 FFmpeg WASM。
2. 不让在线版调用 Tauri sidecar。
3. 不引入云转换。
4. 不上传用户文件。

## 8. 未来离线专业版走 sidecar 的方式

离线专业版长期目标：

1. UI 和批量队列仍由 `ToolsClient.tsx` 承载。
2. 音视频单文件和批量任务在 desktop 模式下优先调用 Tauri command。
3. Tauri command 调用打包内置的 `ffmpeg.exe` sidecar。
4. Tauri command 返回输出文件路径、进度、失败原因。
5. 前端不再把大音视频文件整体读入 WASM 内存。
6. WASM 保留为回退方案，特别是 sidecar 缺失或实验阶段失败时。

## 9. 需要抽象的接口

建议新增媒体转换后端抽象，而不是让 UI 直接区分 FFmpeg WASM 和 sidecar。

建议接口：

```ts
export type MediaBackend = "wasm" | "tauri-sidecar";

export interface MediaConversionInput {
  file: File;
  sourcePath?: string;
  outputDirectory?: string;
  outputName?: string;
}

export interface MediaConversionResult {
  blob?: Blob;
  outputPath?: string;
  resultName: string;
  mimeType: string;
}
```

建议新增后端：

1. `packages/media-core/src/wasm.ts`
2. `packages/media-core/src/types.ts`
3. `apps/web/src/lib/desktopMediaSidecar.ts`

也可以在早期阶段先保留一个薄封装：

1. `convertMediaWithBestBackend`
2. 在线版固定选择 `wasm`
3. 离线专业版实验开关选择 `tauri-sidecar`

## 10. 不能破坏的现有功能

迁移过程中不得破坏：

1. 在线版单文件音频转换。
2. 在线版单文件视频转换。
3. 在线版视频提取音频。
4. 在线版本地 FFmpeg WASM 加载。
5. 在线版批量处理专业版入口。
6. 离线专业版批量任务队列。
7. 离线专业版任务历史。
8. 输出目录选择。
9. 打开输出目录。
10. 打开单个结果文件。
11. 失败重试。
12. 取消任务。
13. 处理日志导出。
14. WebView2 offlineInstaller。
15. 当前 Tauri 文件系统权限边界。
16. 图片压缩本地 worker。

## 11. 当前架构结论

当前架构适合浏览器本地轻量转换，但不适合作为离线专业版长期音视频批量处理核心。

主要原因：

1. WASM 会占用浏览器内存，大文件和批量任务稳定性受限。
2. 当前 `@ffmpeg/core` 明确声明 `GPL-2.0-or-later`，商业发布需要严格处理许可证义务。
3. 离线专业版已经具备 Tauri 桌面能力，更适合使用 sidecar `ffmpeg.exe`。
4. 当前 Tauri 侧没有自定义命令，sidecar 迁移需要新增最小 Rust command 和参数白名单。

推荐后续方向：

1. 在线版继续使用 FFmpeg WASM。
2. 离线专业版新增 sidecar 实验后端。
3. sidecar 后端优先评估 LGPL FFmpeg 构建。
4. 保留 WASM 回退，避免一次性替换造成发布风险。
