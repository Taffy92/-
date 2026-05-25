# SIDECAR_FFMPEG_BINARY_SOURCE_REVIEW

生成时间：2026-05-24

本报告用于 `SIDECAR_FFMPEG_PROOF_OF_CONCEPT_ROUND` 的二进制来源审查。

## 1. 当前是否已有 ffmpeg.exe

没有。

检查路径：

`apps/desktop/src-tauri/resources/ffmpeg/bin/ffmpeg.exe`

当前仅创建了目录和占位说明，未放入二进制。

## 2. 当前是否已有 ffprobe.exe

没有。

检查路径：

`apps/desktop/src-tauri/resources/ffmpeg/bin/ffprobe.exe`

当前仅创建了目录和占位说明，未放入二进制。

## 3. 二进制来源

当前没有二进制，因此没有来源。

本轮没有从互联网下载 FFmpeg，也没有从不明来源复制可执行文件。

## 4. 是否可信

当前没有可验证的 FFmpeg sidecar 二进制。

结论：

当前没有可用于正式打包的可信 FFmpeg sidecar 二进制。

## 5. 是否允许再分发

当前没有二进制，无法判断再分发权限。

正式进入打包验证前必须确认：

1. 二进制来源。
2. 许可证。
3. 是否允许随商业软件再分发。
4. 是否需要提供源码或对象文件。
5. 是否需要附带构建参数。

## 6. 是否 LGPL / GPL / nonfree

当前没有二进制，无法判断。

目标策略：

1. 长期优先评估 LGPL FFmpeg 构建。
2. 不能启用 `--enable-gpl`，除非明确进入 GPL 发布路线。
3. 不能启用 `--enable-nonfree`。

## 7. 是否有完整构建参数

没有。

当前 `BUILD_CONFIG.txt` 是占位模板。

## 8. 是否有源码获取方式

没有针对具体二进制的源码获取方式。

当前 `SOURCE_OFFER.txt` 只保留上游链接和模板。

## 9. SHA256

当前没有 `ffmpeg.exe` 和 `ffprobe.exe`，因此没有二进制 SHA256。

`SHA256SUMS.txt` 当前为占位文件。

## 10. 是否可以进入下一步打包验证

不可以进入正式 sidecar 打包验证。

可以进入：

1. Rust command 编译验证。
2. sidecar_missing 安全降级验证。
3. 目录结构和文档完整性验证。
4. 后续在用户确认可信 LGPL FFmpeg 构建来源后，再进入真实二进制打包验证。

## 11. 明确结论

当前没有可用于正式打包的可信 FFmpeg sidecar 二进制。

本轮只完成目录、命令、检测和 POC 框架。
