# FFMPEG_BINARY_SOURCE_OPTIONS

生成时间：2026-05-24

本文件用于 `FFMPEG_BINARY_SOURCE_SELECTION_ROUND`，只记录 FFmpeg sidecar 二进制来源筛选，不代表已经把二进制纳入正式安装包。

本文件不是法律意见。正式商业发布前仍需做许可证和法律复核。

## 1. 筛选原则

1. 优先 LGPL 构建。
2. 不启用 `--enable-gpl`。
3. 不启用 `--enable-nonfree`。
4. 必须包含 `ffmpeg.exe`。
5. 建议包含 `ffprobe.exe`。
6. 必须能查看 `ffmpeg -version` 和 `ffmpeg -buildconf`。
7. 必须记录 SHA256。
8. 必须保留许可证文本、构建参数、源码获取方式。
9. 不能放入 `apps/web/public` 或 `apps/web/out`。
10. 在进入正式安装包前必须先做干净 Windows 10/11 VM 验证。

## 2. 来源 A：FFmpeg 官方源码自行构建

来源名称：FFmpeg 官方源码自行构建

官网或仓库：

1. https://ffmpeg.org/
2. https://ffmpeg.org/download.html
3. https://ffmpeg.org/legal.html

是否可信：高。官方源码是最可审计来源。

是否允许再分发：取决于最终构建配置和履行许可证义务。LGPL 构建通常可再分发，但仍需保留许可证、源码获取方式和构建信息。

是否声明 LGPL / GPL / nonfree：源码本身同时支持 LGPL/GPL/nonfree 组合，最终二进制取决于 configure 参数。

是否提供完整构建参数：自行构建时可以完整保存。

是否提供源码获取方式：可以直接指向官方源码和实际构建源码包。

是否包含 `ffmpeg.exe`：自行构建后包含。

是否包含 `ffprobe.exe`：自行构建后可包含。

是否适合商业发布：最适合，但构建和维护成本最高。

是否适合离线专业版：适合。

风险等级：低到中。法律风险可控，工程成本较高。

推荐程度：长期最推荐。适合作为正式商业发布的最优路线。

## 3. 来源 B：BtbN FFmpeg-Builds LGPL shared Windows 构建

来源名称：BtbN FFmpeg-Builds `win64-lgpl-shared-7.1`

官网或仓库：

1. https://github.com/BtbN/FFmpeg-Builds
2. https://github.com/BtbN/FFmpeg-Builds/releases/tag/latest

本轮隔离下载文件：

`https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-n7.1-latest-win64-lgpl-shared-7.1.zip`

是否可信：中到高。该来源是公开 GitHub 构建项目，构建脚本和 release 可审计；但不是 FFmpeg 官方二进制。

是否允许再分发：需要按 FFmpeg 和所含第三方库许可证履行义务。当前候选 `ffmpeg -L` 声明为 GNU LGPL v3 or later。

是否声明 LGPL / GPL / nonfree：候选包名为 `lgpl-shared`，实际 `ffmpeg -buildconf` 未发现 `--enable-gpl` 和 `--enable-nonfree`。

是否提供完整构建参数：是，可通过 `ffmpeg -buildconf` 获取。

是否提供源码获取方式：仓库提供构建脚本；仍需在正式发布包中补充 FFmpeg 官方源码、构建来源和第三方库来源说明。

是否包含 `ffmpeg.exe`：是。

是否包含 `ffprobe.exe`：是。

是否适合商业发布：可作为候选，但仍需人工许可证复核，特别是 `libmp3lame`、`libopenh264`、AAC、专利和第三方库。

是否适合离线专业版：适合进入下一轮 sidecar 实验开关验证。

风险等级：中。

推荐程度：短期 POC / 实验开关推荐。正式商业发布前仍建议转为自建 LGPL 构建或完成更严格许可证复核。

## 4. 来源 C：BtbN / Gyan.dev GPL Windows 构建

来源名称：GPL Windows 构建，例如 BtbN GPL 构建或 Gyan.dev GPL/full 构建。

官网或仓库：

1. https://github.com/BtbN/FFmpeg-Builds
2. https://www.gyan.dev/ffmpeg/builds/

是否可信：中到高，取决于具体来源和版本。

是否允许再分发：允许性取决于 GPL 义务履行。若启用 GPL 组件，发布方需要按 GPL 提供对应源码、许可证、修改说明等义务。

是否声明 LGPL / GPL / nonfree：通常明确区分 GPL 包。

是否提供完整构建参数：通常可通过 `ffmpeg -buildconf` 获取。

是否提供源码获取方式：需要发布方自行整理并提供。

是否包含 `ffmpeg.exe`：通常包含。

是否包含 `ffprobe.exe`：通常包含。

是否适合商业发布：不作为当前优先路线。若选择 GPL，必须接受完整 GPL 合规义务。

是否适合离线专业版：可作为对比或功能增强路线，但不适合作为当前商业优先方案。

风险等级：高。

推荐程度：仅作为对比，不建议当前采用。

## 5. 来源 D：Gyan.dev Windows builds

来源名称：Gyan.dev FFmpeg Windows builds

官网或仓库：

https://www.gyan.dev/ffmpeg/builds/

是否可信：中。该站点长期提供 Windows FFmpeg 构建，但需要逐个包确认许可证、构建参数和再分发说明。

是否允许再分发：取决于具体包的许可证与第三方库组合。

是否声明 LGPL / GPL / nonfree：站点会区分不同构建类型，但正式采用前必须用 `ffmpeg -L` 和 `ffmpeg -buildconf` 逐项确认。

是否提供完整构建参数：通常可以通过二进制 `ffmpeg -buildconf` 获取。

是否提供源码获取方式：需要发布方自行归档。

是否包含 `ffmpeg.exe`：通常包含。

是否包含 `ffprobe.exe`：通常包含。

是否适合商业发布：可作为备选，但当前未下载验证。

是否适合离线专业版：可作为备选。

风险等级：中到高，取决于实际包。

推荐程度：备选，不作为本轮首选。

## 6. 来源 E：不明来源 / 网盘 / 第三方转载包

来源名称：不明来源 Windows FFmpeg 二进制。

官网或仓库：无可审计来源。

是否可信：低。

是否允许再分发：无法判断。

是否声明 LGPL / GPL / nonfree：无法判断。

是否提供完整构建参数：通常没有。

是否提供源码获取方式：通常没有。

是否包含 `ffmpeg.exe`：可能包含。

是否包含 `ffprobe.exe`：不确定。

是否适合商业发布：不适合。

是否适合离线专业版：不适合。

风险等级：高。

推荐程度：不推荐，禁止进入正式安装包。

## 7. 本轮推荐

短期候选：

`BtbN FFmpeg-Builds ffmpeg-n7.1-latest-win64-lgpl-shared-7.1`

原因：

1. 已隔离下载到 `verification/ffmpeg-binary-candidates/`。
2. 包含 `ffmpeg.exe` 和 `ffprobe.exe`。
3. `ffmpeg -L` 声明为 LGPL v3 or later。
4. `ffmpeg -buildconf` 未启用 `--enable-gpl`。
5. `ffmpeg -buildconf` 未启用 `--enable-nonfree`。
6. 明确禁用了 `libx264`、`libx265`、`libxvid`。
7. 本地 WAV 转 FLAC、MP4 转 WebM、中文路径、带空格路径、D 盘路径验证通过。

长期推荐：

自行构建 LGPL FFmpeg，并完整归档源码、构建脚本、构建参数、许可证文本和 SHA256。
