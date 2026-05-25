# FFMPEG_LGPL_BUILD_REQUIREMENTS

生成时间：2026-05-24

本文件定义 Windows 离线专业版未来 sidecar FFmpeg 的 LGPL 构建要求。本文件不是法律意见。

## 1. 必须禁止的构建参数

LGPL 构建不能启用：

```text
--enable-gpl
--enable-nonfree
```

如果出现上述任一参数，不能再把该二进制称为 LGPL 构建。

## 2. libx264

`libx264` 通常会导致 GPL 路线。

LGPL 优先构建要求：

1. 不包含 `--enable-libx264`。
2. 建议明确包含 `--disable-libx264`。
3. 如必须支持 x264，需要单独进入 GPL 发布策略。

本轮 BtbN 候选：

1. 未启用 `--enable-libx264`。
2. 已包含 `--disable-libx264`。

## 3. libx265

`libx265` 通常会导致 GPL 路线或更复杂许可证风险。

LGPL 优先构建要求：

1. 不包含 `--enable-libx265`。
2. 建议明确包含 `--disable-libx265`。
3. 如必须支持 x265/HEVC 编码，需要单独复核。

本轮 BtbN 候选：

1. 未启用 `--enable-libx265`。
2. 已包含 `--disable-libx265`。

## 4. libmp3lame

`libmp3lame` 通常可出现在 LGPL 构建中，但商业发布前仍需复核：

1. LAME 许可证。
2. 目标销售地区的历史专利风险。
3. 应用商店或平台要求。

本轮 BtbN 候选：

1. 启用 `--enable-libmp3lame`。
2. `ffmpeg -encoders` 可见 `libmp3lame` MP3 encoder。

建议：

MP3 可作为实验或灰度格式，商业发布前必须人工法律/许可证复核。

## 5. AAC 编码器

LGPL 路线下建议避免 `libfdk-aac`，因为它常涉及 nonfree 风险。

要求：

1. 不启用 `--enable-libfdk-aac`。
2. 建议明确 `--disable-libfdk-aac`。
3. 可使用 FFmpeg 原生 AAC encoder，但仍需复核地区和平台要求。

本轮 BtbN 候选：

1. 未启用 `--enable-libfdk-aac`。
2. 已包含 `--disable-libfdk-aac`。
3. `ffmpeg -encoders` 可见原生 `aac` encoder。

## 6. VP9 / Opus

WebM 常用组合：

1. VP9：`libvpx-vp9`
2. Opus：`libopus`

LGPL 路线下相对更适合作为默认开放格式，但仍需保留第三方库许可证说明。

本轮 BtbN 候选：

1. 启用 `--enable-libvpx`。
2. 启用 `--enable-libopus`。
3. MP4 转 WebM 本地验证通过。

## 7. WebM 支持

建议默认支持：

1. MP4 / MOV / AVI / MKV / WebM 输入到 WebM。
2. WebM 输出使用 VP9 + Opus。

本轮候选已通过：

1. MP4 转 WebM。
2. ffprobe 读取 WebM 时长。

## 8. MP4 容器支持

MP4 容器本身可支持，但编码器选择决定许可证和兼容性风险。

建议：

1. MP4 输入默认开放。
2. MP4 输出先标记为实验，直到确认 H.264/AAC 编码方案和许可证。
3. 可以优先支持 remux 或 MPEG-4 Part 2 等低风险路径，但用户兼容性需要实测。

## 9. H.264 编码

LGPL 构建不能使用 `libx264`，除非转入 GPL 路线。

可选路线：

1. `libopenh264`：需复核 OpenH264 许可证、Cisco 二进制/源码和专利相关条款。
2. Windows Media Foundation：依赖系统编码器，兼容性和授权需复核。
3. 不默认开放 H.264 输出，先以 WebM 为默认视频输出。

本轮 BtbN 候选：

1. 启用 `--enable-libopenh264`。
2. 未启用 `libx264`。

建议：

H.264 输出不要直接作为默认正式能力，应先做法律和兼容性复核。

## 10. 默认开放格式建议

可默认开放：

1. WAV 输入/输出。
2. FLAC 输入/输出。
3. WebM 输出，VP9 + Opus。
4. 视频提取音频到 WAV / FLAC。

可作为实验或灰度开放：

1. MP3 输出。
2. AAC / M4A 输出。
3. MP4 输出。
4. H.264 输出。
5. MOV 输出。
6. AVI 输出。
7. MKV 输出。

## 11. 商业发布前必须复核

必须人工复核：

1. 是否启用 `--enable-gpl`。
2. 是否启用 `--enable-nonfree`。
3. 是否包含 `libx264`。
4. 是否包含 `libx265`。
5. 是否包含 `libmp3lame`。
6. 是否包含 `libopenh264`。
7. 是否使用原生 AAC 或平台 AAC。
8. 所有第三方库许可证文本。
9. 源码获取方式。
10. 是否需要提供对象文件或重新链接方式。
11. 目标销售地区专利和平台合规要求。
12. 安装包内许可证展示方式。
