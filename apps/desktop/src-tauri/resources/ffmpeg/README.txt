FFmpeg sidecar resource for 万能格式转换器 Windows 离线专业版

当前资源仅用于内部实验开关，不代表最终商业发布许可证复核已经完成。
在线网页版不包含这些 exe/dll 文件，在线版继续使用本地 FFmpeg WASM。
离线专业版默认仍使用 FFmpeg WASM；用户主动开启实验开关且校验通过时，少量低风险格式才会尝试 sidecar。

来源候选：BtbN FFmpeg-Builds latest n7.1 win64 lgpl shared 7.1
项目地址：https://github.com/BtbN/FFmpeg-Builds
下载地址：https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-n7.1-latest-win64-lgpl-shared-7.1.zip
ZIP SHA256：233E3C0D1E73C4BC2915DA553AA211BEAB75AA902F074CF6A7D6BADE6846F2CC

关键限制：
1. 仅离线专业版内部实验使用。
2. 不允许用户输入任意 FFmpeg 命令或原始 args。
3. 只允许白名单模式：WAV 转 FLAC、MP4 转 WebM、ffprobe 信息读取、版本/构建参数检查。
4. MP3、AAC/M4A、MP4/H.264、MOV、AVI、MKV 输出不作为 sidecar 正式能力开放。
5. 商业发布前仍需对 LGPL v3 or later、libmp3lame、libopenh264、AAC、DLL 许可证和专利风险做人工复核。
