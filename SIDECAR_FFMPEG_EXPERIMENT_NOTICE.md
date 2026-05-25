# Sidecar FFmpeg 实验功能说明

生成时间：2026-05-24

本说明用于记录“万能格式转换器”Windows 离线专业版中的 sidecar FFmpeg 内部实验能力。本文档不是法律意见，正式商业发布前仍需做法律、许可证、专利和平台合规复核。

## 当前策略

1. 在线版继续使用本地 FFmpeg WASM，不使用 sidecar。
2. 在线版继续保留单文件音频转换、视频转换、视频提取音频。
3. 离线专业版默认仍使用 FFmpeg WASM。
4. sidecar FFmpeg 只在离线专业版中作为内部实验开关存在。
5. 实验开关默认关闭，用户主动开启且校验通过后才可能使用。
6. sidecar 失败时不自动重复跑 WASM，避免耗时翻倍；用户可关闭实验开关回退 WASM。
7. 所有文件仍在本地处理，不上传服务器，不调用云端转换 API。

## 当前候选二进制

- 来源：BtbN FFmpeg-Builds latest n7.1 win64 lgpl shared 7.1
- 项目地址：https://github.com/BtbN/FFmpeg-Builds
- Release：https://github.com/BtbN/FFmpeg-Builds/releases/tag/latest
- 文件：ffmpeg-n7.1-latest-win64-lgpl-shared-7.1.zip
- ZIP SHA256：233E3C0D1E73C4BC2915DA553AA211BEAB75AA902F074CF6A7D6BADE6846F2CC
- `ffmpeg -L`：GNU LGPL v3 or later

## 初步构建参数结论

已记录到 `apps/desktop/src-tauri/resources/ffmpeg/BUILD_CONFIG.txt`。

1. 未发现 `--enable-gpl`。
2. 未发现 `--enable-nonfree`。
3. 未发现 `--enable-libx264`。
4. 未发现 `--enable-libx265`。
5. 存在 `--enable-libmp3lame`，商业发布前仍需复核。
6. 存在 `--enable-libopenh264`，商业发布前仍需复核。
7. 存在 AAC 相关编码能力，商业发布前仍需复核地区、平台和专利要求。

## 实验白名单

当前 sidecar 实验只允许：

1. WAV 转 FLAC。
2. MP4 转 WebM。
3. ffprobe 读取媒体信息。
4. `ffmpeg -version` / `ffmpeg -buildconf` 内部检查。

当前不作为 sidecar 正式能力开放：

1. MP3 输出。
2. AAC / M4A 输出。
3. MP4 / H.264 输出。
4. MOV 输出。
5. AVI 输出。
6. MKV 输出。

## 安全边界

1. 不允许用户输入任意 FFmpeg 命令。
2. 不允许用户输入原始 args。
3. 不允许用户指定 `ffmpeg.exe` 路径。
4. 不调用系统 PATH 中的 FFmpeg。
5. 不调用 `cmd.exe` 或 `powershell.exe`。
6. 使用结构化请求和白名单参数。
7. 中文路径、D 盘路径、带空格路径使用参数数组传递。
8. 日志和任务历史继续脱敏路径。
9. 不上传日志、文件或转换结果。
10. 不新增网络权限，不扩大 Tauri 文件系统权限。

## 发布限制

当前 sidecar 实验版不能宣传为已经完成商业许可证复核。正式发布前仍需完成：

1. 干净 Windows 10 / 11 虚拟机断网验证。
2. BtbN 构建来源和构建脚本复核。
3. 所有 DLL 对应许可证复核。
4. LGPL v3 or later 义务复核。
5. `libmp3lame`、`libopenh264`、AAC / M4A、平台专利和地区要求复核。
6. 是否改为自建 LGPL FFmpeg 的长期方案决策。
