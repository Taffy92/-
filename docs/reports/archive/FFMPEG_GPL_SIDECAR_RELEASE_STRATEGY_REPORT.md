# FFMPEG_GPL_SIDECAR_RELEASE_STRATEGY_ROUND 报告

生成时间：2026-05-24

本报告已按新的产品策略更新：当前阶段不执行在线版 FFmpeg 拆分，不删除在线版音视频功能，不破坏离线专业版批量队列。长期商业优化方向调整为“离线专业版 sidecar FFmpeg / LGPL FFmpeg 构建专项”。

> 本报告不是法律意见。正式商业发布前，仍建议完成法律和开源许可证复核。

## 1. 当前 FFmpeg 使用情况

当前音视频能力由 `packages/media-core` 提供：

1. 视频格式转换：MP4、MOV、AVI、MKV、WebM。
2. 音频格式转换：MP3、WAV、AAC、M4A、FLAC。
3. 视频提取音频：MP3、WAV、M4A、AAC。

当前依赖：

| 包 | 版本 | 许可证 | 用途 |
| --- | --- | --- | --- |
| `@ffmpeg/core` | `0.12.10` | `GPL-2.0-or-later` | 提供 `ffmpeg-core.js` 和 `ffmpeg-core.wasm` |
| `@ffmpeg/ffmpeg` | `0.12.15` | `MIT` | 浏览器端 FFmpeg 调用封装 |
| `@ffmpeg/util` | `0.12.2` | `MIT` | `fetchFile` 等工具函数 |

当前静态资源：

| 文件 | 大小 | SHA256 |
| --- | ---: | --- |
| `apps/web/public/ffmpeg/ffmpeg-core.js` | 112,059 bytes | `B266AB5B952555881DD6310663986994A182ACB2B7FF25CF10A25F7A37AC2B21` |
| `apps/web/public/ffmpeg/ffmpeg-core.wasm` | 32,232,419 bytes | `9F57947A5BD530D8F00C5B3F2CB2A3492FAA7E5D823315342D6A8656D0A6B7B7` |

`packages/media-core/src/index.ts` 显式从 `/ffmpeg/ffmpeg-core.js` 和 `/ffmpeg/ffmpeg-core.wasm` 加载本地资源，不使用云转换 API。

## 2. 新产品策略

1. 在线版继续保留音频转换、视频转换、视频提取音频。
2. 在线版继续分发 FFmpeg WASM。
3. 在线版只支持轻量单文件或少量文件处理。
4. 在线版不开放批量音视频处理。
5. 在线版新增批量处理入口，提示：“批量处理为离线专业版功能，请下载 Windows 离线专业版使用。”
6. 离线专业版继续保留完整批量处理能力，包括图片、Word、Excel、音频、视频批量处理。
7. 长期方案是为离线专业版做 sidecar FFmpeg / LGPL FFmpeg 构建专项，而不是当前阶段移除在线版音视频。

## 3. 当前许可证风险

确认仍存在 GPL 风险：

1. `@ffmpeg/core@0.12.10` 声明许可证为 `GPL-2.0-or-later`。
2. 在线版继续分发 FFmpeg WASM，因此在线版也必须保留 FFmpeg / GPL 说明和源码获取方式。
3. 离线专业版继续包含 FFmpeg WASM，因此安装包也必须保留开源许可证说明。
4. 当前文档已保留 FFmpeg / ffmpeg.wasm 上游链接和源码获取方式。

上游链接：

1. FFmpeg 官网：`https://ffmpeg.org/`
2. FFmpeg 法律说明：`https://ffmpeg.org/legal.html`
3. ffmpeg.wasm 仓库：`https://github.com/ffmpegwasm/ffmpeg.wasm`
4. npm `@ffmpeg/core`：`https://www.npmjs.com/package/@ffmpeg/core`

## 4. 发布方案对比

| 方案 | 内容 | 当前结论 |
| --- | --- | --- |
| A | 保留当前 FFmpeg WASM，并补齐 GPL 声明和源码获取说明 | 可作为短期基础 |
| B | 在线版保留音视频，但批量处理只作为离线专业版入口 | 当前推荐 |
| C | 为离线专业版设计 sidecar FFmpeg / LGPL 构建 | 长期推荐 |
| D | 隐藏或标记音视频为实验功能 | 当前不采用 |

## 5. 推荐方案

当前推荐方案：

1. 在线版保留音视频单文件转换。
2. 在线版批量入口只展示专业版说明和下载入口。
3. 离线专业版保留完整批量队列。
4. 继续维护 FFmpeg / GPL / 开源许可证说明。
5. 下一轮可进入 sidecar FFmpeg / LGPL 技术方案设计。

## 6. 本轮修改范围

本轮允许修改：

1. 在线版批量入口 UI。
2. FFmpeg / GPL / 发布策略文档。
3. 针对在线批量入口和本地 FFmpeg 加载的测试。

本轮不修改：

1. 在线版音频转换功能。
2. 在线版视频转换功能。
3. 在线版视频提取音频功能。
4. 离线专业版批量任务队列。
5. Tauri 权限。
6. WebView2 offlineInstaller。
7. 图片压缩本地 worker。
8. CloudBase 下载授权。

## 7. 本地处理和隐私原则

继续保持：

1. 音频不上传服务器。
2. 视频不上传服务器。
3. 转换结果不上传服务器。
4. 不调用云端音视频转换 API。
5. CloudBase 只用于下载授权，不接触用户处理文件。
6. 广告脚本不接收用户 File、Blob、ArrayBuffer、Canvas 或转换结果。

## 8. 后续发布前必须完成

1. 干净 Windows 10/11 虚拟机断网安装和运行测试。
2. 无 WebView2 Runtime 环境安装测试。
3. 离线专业版批量音视频处理断网测试。
4. FFmpeg / GPL / LGPL 法律和许可证复核。
5. 如果进入 sidecar FFmpeg 专项，记录 `ffmpeg.exe` 来源、许可证、构建参数、SHA256 和源码链接。
