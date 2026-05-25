# 开源许可证说明

生成时间：2026-05-24

本文件用于说明“万能格式转换器”在线版和 Windows 离线专业版涉及的主要开源组件。本文档不是法律意见，正式商业发布前建议做法律和许可证复核。

## Sidecar FFmpeg 实验说明

离线专业版包含一个默认关闭的 sidecar FFmpeg 内部实验开关。该实验资源只随 Windows 离线专业版打包，不进入在线版静态资源目录。当前候选为 BtbN FFmpeg-Builds win64-lgpl-shared-7.1，声明为 LGPL v3 or later，未发现 `--enable-gpl` 或 `--enable-nonfree`。

该候选仍包含需要商业发布前复核的组件和能力，包括 `libmp3lame`、`libopenh264`、AAC / M4A 相关能力，以及各地区可能存在的专利和平台要求。实验阶段仅开放 WAV 转 FLAC、MP4 转 WebM、ffprobe 信息读取和版本/构建参数检查，不应宣传为已完成商业许可证复核。

## 必须保留的原则

1. 网站和离线专业版都必须保留“开源许可证”入口。
2. 第三方组件的版权声明、许可证文本和必要 Notices 必须随发布包保留。
3. 用户文件处理仍然只在本地完成，不因为许可证说明而上传用户文件。
4. 若后续替换 FFmpeg 方案，需要同步更新本文件和 `THIRD_PARTY_NOTICES.md`。

## FFmpeg / FFmpeg WASM

当前在线版和离线专业版都包含：

1. `apps/web/public/ffmpeg/ffmpeg-core.js`
2. `apps/web/public/ffmpeg/ffmpeg-core.wasm`
3. `apps/web/out/ffmpeg/ffmpeg-core.js`
4. `apps/web/out/ffmpeg/ffmpeg-core.wasm`

当前 `@ffmpeg/core@0.12.10` 声明许可证为 `GPL-2.0-or-later`。由于在线版继续分发 FFmpeg WASM，因此在线版和离线专业版都必须保留 FFmpeg / GPL 说明和源码获取方式。

## 其他主要组件

| 组件 | 用途 | 许可证关注点 |
| --- | --- | --- |
| Next.js | 在线版静态站点 | MIT |
| React / React DOM | 前端 UI | MIT |
| Tauri | Windows 离线专业版 | MIT / Apache-2.0 |
| PDF.js | PDF 本地渲染 | Apache-2.0 |
| ExcelJS | Excel 解析和导出 | MIT |
| JSZip | 多文件打包 | MIT OR GPL-3.0-or-later |
| browser-image-compression | 图片压缩 | MIT |
| Cropper.js | 图片裁切 | MIT |
| docx | Word 导出/文档能力 | MIT |
| Lucide React | 图标 | ISC |
| Tailwind CSS | 样式 | MIT |
| Microsoft Edge WebView2 Runtime | Windows WebView 运行环境 | 需遵守 Microsoft Runtime 分发要求 |

## 当前产品策略

1. 在线版保留音频转换、视频转换和视频提取音频。
2. 在线版只做轻量单文件或少量文件处理。
3. 在线版不开放批量音视频处理。
4. 批量处理入口引导用户下载 Windows 离线专业版。
5. 离线专业版保留完整批量处理能力。
6. 长期为离线专业版评估 sidecar FFmpeg / LGPL FFmpeg 构建。

## 商业发布前待确认

1. FFmpeg / GPL 义务是否已经完全履行。
2. FFmpeg 构建参数、编解码器和专利风险是否已复核。
3. WebView2 Runtime 分发方式是否符合 Microsoft 要求。
4. 所有第三方许可证文本是否已经随网站和安装包发布。
5. 开源许可证页面是否能在断网离线专业版中查看。

## 2026-05-25 低风险 sidecar 优先说明

1. 在线版继续保留 FFmpeg WASM，用于单文件或少量文件的音频转换、视频转换和视频提取音频。
2. 离线专业版继续保留 FFmpeg WASM，并在低风险格式上增加 sidecar 优先处理能力。
3. sidecar 优先范围仅限 WAV 转 FLAC、MP4 转 WebM 和 ffprobe 信息读取。
4. MP3、AAC/M4A、MP4/H.264、MOV、AVI、MKV 不属于 sidecar 正式默认范围。
5. 当前 BtbN FFmpeg 候选仅作为已验证可运行的候选资源，不代表商业许可证最终复核完成。
6. 正式商业发布前仍建议进行人工许可证和法律复核；长期建议自建 LGPL FFmpeg 构建。
