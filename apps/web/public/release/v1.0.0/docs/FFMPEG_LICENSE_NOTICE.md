# FFmpeg 许可证说明

生成时间：2026-05-24

“万能格式转换器”的在线版和 Windows 离线专业版当前都包含本地 FFmpeg WASM 资源，用于音频格式转换、视频格式转换和视频提取音频。本说明不是法律意见，正式商业发布前建议做许可证复核。

## 2026-05-24 sidecar 实验补充

Windows 离线专业版新增 sidecar FFmpeg 内部实验开关，但默认关闭，不替换当前 FFmpeg WASM 默认路径。在线版不显示 sidecar 开关，也不包含 `ffmpeg.exe`、`ffprobe.exe` 或 DLL。

当前 sidecar 候选为 BtbN FFmpeg-Builds win64-lgpl-shared-7.1。初步检查显示候选声明为 LGPL v3 or later，未发现 `--enable-gpl`，未发现 `--enable-nonfree`，未包含 `libx264` / `libx265`。但候选包含 `libmp3lame`、`libopenh264` 和 AAC 相关能力，正式商业发布前仍需人工复核许可证、专利、平台和地区要求。

sidecar 白名单阶段允许 WAV 转 FLAC、MP4 / MOV / AVI / MKV / WebM 常用视频格式转换、ffprobe 读取媒体信息，以及 `ffmpeg -version` / `ffmpeg -buildconf` 内部检查。MP3、AAC/M4A 音频转换和视频提取音频仍不作为 sidecar 默认能力开放。

## 当前使用方式

在线版和离线专业版均从本地静态路径加载：

1. `/ffmpeg/ffmpeg-core.js`
2. `/ffmpeg/ffmpeg-core.wasm`

应用代码位于 `packages/media-core/src/index.ts`，使用 `@ffmpeg/ffmpeg` 加载本地 FFmpeg WASM。用户音频、视频和转换结果只在当前设备本地处理，不上传服务器，不调用云端转换 API。

## 当前许可证风险

本地依赖元数据中：

1. `@ffmpeg/core@0.12.10`：`GPL-2.0-or-later`
2. `@ffmpeg/ffmpeg@0.12.15`：`MIT`
3. `@ffmpeg/util@0.12.2`：`MIT`

由于在线版和离线专业版都继续分发 `ffmpeg-core.js` 和 `ffmpeg-core.wasm`，因此需要保留 FFmpeg / ffmpeg.wasm 的许可证说明、版权声明和源码获取方式。

## 静态资源信息

| 文件 | 大小 | SHA256 |
| --- | ---: | --- |
| `apps/web/public/ffmpeg/ffmpeg-core.js` | 112,059 bytes | `B266AB5B952555881DD6310663986994A182ACB2B7FF25CF10A25F7A37AC2B21` |
| `apps/web/public/ffmpeg/ffmpeg-core.wasm` | 32,232,419 bytes | `9F57947A5BD530D8F00C5B3F2CB2A3492FAA7E5D823315342D6A8656D0A6B7B7` |

## 源码和上游链接

1. FFmpeg 官网：`https://ffmpeg.org/`
2. FFmpeg 法律说明：`https://ffmpeg.org/legal.html`
3. ffmpeg.wasm 仓库：`https://github.com/ffmpegwasm/ffmpeg.wasm`
4. npm `@ffmpeg/core`：`https://www.npmjs.com/package/@ffmpeg/core`

## 产品边界

1. 在线版保留轻量音视频转换。
2. 在线版不开放批量音视频处理。
3. 在线版批量入口仅提示：“批量处理为离线专业版功能，请下载 Windows 离线专业版使用。”
4. 离线专业版保留完整批量任务队列和音视频批量处理。
5. 长期计划为离线专业版评估 sidecar FFmpeg / LGPL FFmpeg 构建。

## 发布前确认

正式发布前应确认：

1. 网站和软件内可以查看开源许可证页面。
2. `THIRD_PARTY_NOTICES.md` 包含 FFmpeg WASM 说明。
3. 发布包保留许可证说明和源码获取方式。
4. sidecar FFmpeg 的 `ffmpeg.exe` 来源、许可证、构建参数、SHA256 和源码链接需要随发布包持续记录。

## 2026-06-17 sidecar 本地白名单优先策略

1. 在线版继续使用本地 FFmpeg WASM，不使用 sidecar，不上传音频、视频或转换结果。
2. Windows 离线专业版仍保留 FFmpeg WASM 作为回退后端。
3. Windows 离线专业版在 sidecar 校验通过、用户未关闭该选项、输入文件有本地路径且输出目录为本地 Tauri 输出目录时，可对本地白名单格式优先使用 sidecar FFmpeg。
4. 当前 sidecar 优先范围：WAV 转 FLAC、MP4 / MOV / AVI / MKV / WebM 常用视频格式转换、ffprobe 媒体信息读取。
5. MP3、AAC/M4A 音频转换、视频提取音频和不在白名单内的音视频容器或编码组合继续使用 FFmpeg WASM。
6. BtbN FFmpeg 候选仍未完成商业许可证最终复核。正式商业发布前仍建议人工复核许可证、专利、平台和地区要求。
7. 长期仍建议自建 LGPL FFmpeg 构建，并保留构建参数、SHA256、许可证文本和源码获取方式。
