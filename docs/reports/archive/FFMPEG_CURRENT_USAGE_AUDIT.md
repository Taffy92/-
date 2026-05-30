# FFMPEG_CURRENT_USAGE_AUDIT

本报告审查“万能格式转换器”当前 FFmpeg / FFmpeg WASM 使用情况。结论基于 `package.json`、`pnpm-lock.yaml`、本地 `node_modules` 元数据、静态资源目录、构建脚本和已有第三方 Notices。本文不是法律意见，正式商业发布前建议做法律/许可证复核。

## 1. 当前 FFmpeg 相关依赖

`packages/media-core/package.json` 当前直接依赖：

| 包名 | 版本 | 本地包声明许可证 | 用途 |
| --- | --- | --- | --- |
| `@ffmpeg/core` | `0.12.10` | `GPL-2.0-or-later` | 提供 `ffmpeg-core.js` 和 `ffmpeg-core.wasm` |
| `@ffmpeg/ffmpeg` | `0.12.15` | `MIT` | 浏览器侧 FFmpeg WASM 调用封装 |
| `@ffmpeg/util` | `0.12.2` | `MIT` | `fetchFile` 等浏览器辅助工具 |

`pnpm-lock.yaml` 中存在：

1. `@ffmpeg/core@0.12.10`
2. `@ffmpeg/ffmpeg@0.12.15`
3. `@ffmpeg/types@0.12.4`
4. `@ffmpeg/util@0.12.2`

## 2. 当前 FFmpeg 静态资源路径

当前静态资源：

| 路径 | 大小 | SHA256 |
| --- | ---: | --- |
| `apps/web/public/ffmpeg/ffmpeg-core.js` | 112,059 bytes | `B266AB5B952555881DD6310663986994A182ACB2B7FF25CF10A25F7A37AC2B21` |
| `apps/web/public/ffmpeg/ffmpeg-core.wasm` | 32,232,419 bytes | `9F57947A5BD530D8F00C5B3F2CB2A3492FAA7E5D823315342D6A8656D0A6B7B7` |
| `apps/web/out/ffmpeg/ffmpeg-core.js` | 112,059 bytes | `B266AB5B952555881DD6310663986994A182ACB2B7FF25CF10A25F7A37AC2B21` |
| `apps/web/out/ffmpeg/ffmpeg-core.wasm` | 32,232,419 bytes | `9F57947A5BD530D8F00C5B3F2CB2A3492FAA7E5D823315342D6A8656D0A6B7B7` |

`apps/web/scripts/prepare-static.mjs` 会从 `@ffmpeg/core/dist/umd` 复制：

1. `ffmpeg-core.js`
2. `ffmpeg-core.wasm`

复制目标是：

`apps/web/public/ffmpeg`

因此当前在线静态站点和 Tauri 离线版构建都会包含 FFmpeg WASM。

## 3. 当前音视频功能

当前 `packages/media-core/src/index.ts` 提供：

1. 视频格式转换：`mp4`、`mov`、`avi`、`mkv`、`webm`
2. 音频格式转换：`mp3`、`wav`、`aac`、`m4a`、`flac`
3. 视频提取音频：`mp3`、`wav`、`m4a`、`aac`
4. 本地 FFmpeg WASM 加载：`/ffmpeg/ffmpeg-core.js`、`/ffmpeg/ffmpeg-core.wasm`
5. 文件写入浏览器本地内存：`ffmpeg.writeFile`
6. 本地执行：`ffmpeg.exec`
7. 本地读取结果：`ffmpeg.readFile`

当前转换参数中使用了这些编码器或容器相关能力：

1. `libx264`
2. `aac`
3. `mpeg4`
4. `libmp3lame`
5. `libvpx-vp9`
6. `libopus`
7. `flac`
8. `pcm_s16le`

其中 `libx264` 通常属于 GPL 风险重点；当前 `@ffmpeg/core` 包本身已声明 `GPL-2.0-or-later`，因此无需再通过猜测构建参数来判断是否存在 GPL 风险。

## 4. 当前许可证信息

本地包声明：

1. `@ffmpeg/core@0.12.10`：`GPL-2.0-or-later`
2. `@ffmpeg/ffmpeg@0.12.15`：`MIT`
3. `@ffmpeg/util@0.12.2`：`MIT`

FFmpeg 官方法律说明中明确：FFmpeg 主体通常是 LGPL，但启用 GPL 部分时，GPL 会适用于整个 FFmpeg 构建。`@ffmpeg/core` 当前包声明为 `GPL-2.0-or-later`，因此当前项目应按 GPL 构建来处理发布义务。

## 5. 是否存在 GPL 风险

存在。

原因：

1. 当前直接依赖 `@ffmpeg/core`。
2. `@ffmpeg/core` 本地包元数据声明为 `GPL-2.0-or-later`。
3. 当前在线版和离线版都会打包 `ffmpeg-core.js` 和 `ffmpeg-core.wasm`。
4. 当前音视频功能不是仅调用系统已安装 FFmpeg，而是随项目分发 FFmpeg WASM 静态资源。

## 6. 是否影响商业发布

会影响商业发布策略。

如果保留当前 `@ffmpeg/core` 默认构建并分发在线版/离线版，至少需要：

1. 保留 GPL 许可证声明。
2. 提供 FFmpeg / ffmpeg.wasm 对应源码获取方式。
3. 保留版权声明和第三方 Notices。
4. 在官网、下载页、软件内开源许可证入口中清楚披露。
5. 商业发布前确认 GPL 对闭源桌面软件、安装包、在线静态站点分发的影响。

## 7. 当前 THIRD_PARTY_NOTICES.md 是否足够

不完全足够。

已有内容：

1. 已列出 `@ffmpeg/core` 为 `GPL-2.0-or-later`。
2. 已提示如果包含 FFmpeg WASM，需要按 FFmpeg 对应许可证提供源码获取方式、许可证文本和版权声明。

不足：

1. 需要补充更明确的 FFmpeg 专项说明。
2. 需要独立的 `FFMPEG_LICENSE_NOTICE.md`。
3. 需要发布检查清单明确商业发布前应确认的事项。
4. 需要明确短期、中期、长期推荐策略。

## 8. 当前安装包是否包含 FFmpeg WASM

配置层面：是。

理由：

1. Tauri `distDir` 指向 `../../web/out`。
2. `build:desktop` 会以 `NEXT_PUBLIC_APP_MODE=desktop` 构建 `apps/web/out`。
3. `prepare-static.mjs` 会复制 `ffmpeg-core.js` 和 `ffmpeg-core.wasm` 到 `apps/web/public/ffmpeg`。
4. Next 静态导出会包含 `apps/web/out/ffmpeg`。

安装包压缩后无法直接在 bundle 目录中看到单独的 `ffmpeg-core.wasm`，但 Tauri 资源来源包含 `apps/web/out`，因此应按“离线安装包包含 FFmpeg WASM”处理。

## 9. 当前在线版是否包含 FFmpeg WASM

是。

`apps/web/out/ffmpeg` 当前存在：

1. `ffmpeg-core.js`
2. `ffmpeg-core.wasm`

在线版静态托管时会分发这些资源。

## 10. 当前结论

当前项目已经具备音视频本地转换能力，但由于 `@ffmpeg/core` 明确声明 `GPL-2.0-or-later`，正式发布前必须把 FFmpeg 作为 GPL 风险项处理。短期可以通过补齐许可证声明和源码获取方式降低合规风险；中长期建议将在线版与离线版音视频能力拆分，并评估 sidecar FFmpeg 或可证明的 LGPL 构建。
