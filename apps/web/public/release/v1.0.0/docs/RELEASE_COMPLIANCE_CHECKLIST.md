# 发布合规检查清单

生成时间：2026-05-24

本清单用于“万能格式转换器”在线版和 Windows 离线专业版发布前自检。本文档不是法律意见。

## 产品策略确认

- [x] 在线版继续保留音频格式转换。
- [x] 在线版继续保留视频格式转换。
- [x] 在线版继续保留视频提取音频。
- [x] 在线版继续保留 FFmpeg WASM。
- [x] 在线版不显示 sidecar FFmpeg 实验开关。
- [x] 离线专业版 sidecar FFmpeg 实验开关默认关闭。
- [x] sidecar 实验只允许 WAV 转 FLAC、MP4 转 WebM 和内部检测。
- [ ] sidecar 候选 FFmpeg 的 LGPL v3 or later、DLL、libmp3lame、libopenh264、AAC / M4A 许可与专利风险已完成商业发布前人工复核。
- [ ] sidecar 候选已在干净 Windows 10 / 11 断网虚拟机中验证。
- [x] 在线版不开放批量音视频处理。
- [x] 在线版批量处理入口引导下载 Windows 离线专业版。
- [x] 离线专业版继续保留图片、Word、Excel、音频、视频批量处理。
- [ ] 离线专业版 sidecar FFmpeg / LGPL 构建专项完成。

## 本地处理和隐私

- [x] 图片不上传服务器。
- [x] PDF 不上传服务器。
- [x] Word 不上传服务器。
- [x] Excel 不上传服务器。
- [x] 音频不上传服务器。
- [x] 视频不上传服务器。
- [x] 转换结果不上传服务器。
- [x] 在线版音视频转换不调用云转换 API。
- [x] 离线专业版批量队列不调用云转换 API。
- [x] 授权只控制桌面端继续使用，不接触用户处理文件。

## FFmpeg / GPL

- [x] `THIRD_PARTY_NOTICES.md` 包含 FFmpeg WASM 说明。
- [x] `FFMPEG_LICENSE_NOTICE.md` 包含 FFmpeg / GPL 风险说明。
- [x] `OPEN_SOURCE_LICENSES.md` 包含 FFmpeg 和主要依赖说明。
- [x] 保留 FFmpeg / ffmpeg.wasm 上游链接和源码获取方式。
- [x] 在线版继续分发 FFmpeg WASM，因此保留在线版许可证说明。
- [ ] 正式商业发布前完成法律/许可证复核。
- [ ] 若未来使用 sidecar FFmpeg，补充 `ffmpeg.exe` 来源、构建参数、许可证和 SHA256。

## 在线版检查

- [x] `/ffmpeg/ffmpeg-core.js` 存在。
- [x] `/ffmpeg/ffmpeg-core.wasm` 存在。
- [x] 音视频转换从本地静态资源加载。
- [x] 不请求 `unpkg.com`、`cdn.jsdelivr.net` 或其他远程 FFmpeg 资源。
- [x] 新增“批量处理为离线专业版功能，请下载 Windows 离线专业版使用。”入口。
- [x] 在线版不进入离线专业版批量任务队列。

## 离线专业版检查

- [x] 批量任务队列保留。
- [x] 图片批量处理保留。
- [x] Word 批量转图片保留。
- [x] Excel 批量转图片保留。
- [x] 音频批量转换保留。
- [x] 视频批量转换保留。
- [x] 视频批量提取音频保留。
- [x] 文件预览区和参数设置保留。
- [x] WebView2 offlineInstaller 配置保留。
- [x] Tauri 权限未扩大。

## 发布前仍需人工完成

- [ ] 干净 Windows 10 x64 虚拟机断网安装测试。
- [ ] 干净 Windows 11 x64 虚拟机断网安装测试。
- [ ] 无 WebView2 Runtime 环境安装和启动测试。
- [ ] EXE / MSI 安装、卸载、重装测试。
- [ ] D 盘、中文路径、带空格路径测试。
- [ ] FFmpeg / GPL / LGPL 法律和许可证复核。

## 2026-05-25 低风险 sidecar 优先检查

- [x] 在线版继续使用 FFmpeg WASM。
- [x] 在线版不显示 sidecar 设置。
- [x] 离线专业版继续保留 FFmpeg WASM。
- [x] 离线专业版低风险格式可 sidecar 优先。
- [x] sidecar 优先范围仅限 WAV 转 FLAC、MP4 转 WebM、ffprobe 信息读取。
- [x] MP3、AAC/M4A、MP4/H.264、MOV、AVI、MKV 继续排除在 sidecar 正式默认范围外。
- [x] sidecar 缺失或 SHA256 校验失败时回退 WASM 或显示明确提示。
- [x] 批量任务状态仅在本机工作台展示，不上传文件内容或转换结果。
- [x] Tauri 权限未扩大，WebView2 offlineInstaller 未修改。
- [ ] BtbN FFmpeg 候选许可证、专利和平台要求完成正式商业发布前人工复核。
- [ ] 长期自建 LGPL FFmpeg 构建完成。
