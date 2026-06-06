# FFMPEG_BINARY_SOURCE_SELECTION_REPORT

生成时间：2026-05-24

本轮名称：FFMPEG_BINARY_SOURCE_SELECTION_ROUND

本报告只记录 FFmpeg sidecar 二进制来源筛选、隔离下载、许可证初步确认和本地验证结果。本轮没有把 `ffmpeg.exe` 打进正式安装包，没有启用 sidecar 实验开关，没有替换现有 FFmpeg WASM。

本报告不是法律意见。正式商业发布前仍需人工法律/许可证复核。

## 1. 本轮读取和参考的文件

前置 sidecar、许可和打包研究报告已在 2026-06-06 文档清理中归并到本选型结论，不再单独保留。仍保留的依据入口：

1. `FFMPEG_LICENSE_NOTICE.md`
2. `THIRD_PARTY_NOTICES.md`
3. `OPEN_SOURCE_LICENSES.md`
4. `docs/reports/archive/RELEASE_COMPLIANCE_CHECKLIST.md`

## 2. 本轮生成的文件

长期保留入口：

1. `docs/reports/archive/FFMPEG_BINARY_SOURCE_SELECTION_REPORT.md`
2. `FFMPEG_LICENSE_NOTICE.md`
3. `THIRD_PARTY_NOTICES.md`
4. `OPEN_SOURCE_LICENSES.md`
5. `docs/reports/archive/RELEASE_COMPLIANCE_CHECKLIST.md`

候选 ZIP 和解压文件只位于：

`verification/ffmpeg-binary-candidates/BtbN-ffmpeg-n7.1-win64-lgpl-shared-7.1/`

## 3. 是否找到可信候选

本轮找到一个可进入下一轮内部实验开关验证的候选：

`BtbN FFmpeg-Builds latest n7.1 win64 lgpl shared 7.1`

下载地址：

`https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-n7.1-latest-win64-lgpl-shared-7.1.zip`

项目地址：

`https://github.com/BtbN/FFmpeg-Builds`

重要限定：

1. 该候选不是 FFmpeg 官方直接发布的 Windows 二进制。
2. 它是公开 GitHub 构建来源，可审计程度较高。
3. 当前只作为隔离候选，不进入正式安装包。
4. 正式商业发布前仍建议优先自建 LGPL FFmpeg，或对 BtbN 候选做完整许可证复核。

## 4. 推荐来源

短期推荐：

`BtbN FFmpeg-Builds win64-lgpl-shared-7.1`

用途：

1. 进入下一轮 `SIDECAR_FFMPEG_EXPERIMENT_FLAG_ROUND`。
2. 只作为离线专业版内部实验开关。
3. 不作为默认生产能力。
4. 不进入在线版。

长期推荐：

自行构建 LGPL FFmpeg。

原因：

1. 构建参数可完全掌控。
2. 源码和许可证归档更清晰。
3. 更适合商业发布。
4. 更容易针对产品实际格式做裁剪。

## 5. 是否 LGPL

候选 `ffmpeg -L` 输出显示：

GNU Lesser General Public License version 3 or later.

结论：

初步可视为 LGPL v3 or later 候选，但不是最终法律结论。

需要注意：

1. 不是 LGPL v2.1，而是 LGPL v3 or later。
2. 本产品若商业化销售，必须确认 LGPL v3 条款是否可接受。
3. 必须复核所有 DLL 和第三方库许可证。

## 6. 是否启用 --enable-gpl

检查结果：

未发现 `--enable-gpl`。

来源：

`verification/ffmpeg-binary-candidates/BtbN-ffmpeg-n7.1-win64-lgpl-shared-7.1/ffmpeg-buildconf.txt`

## 7. 是否启用 --enable-nonfree

检查结果：

未发现 `--enable-nonfree`。

同时发现：

`--disable-libfdk-aac`

## 8. 是否包含 libx264

检查结果：

1. 未发现 `--enable-libx264`。
2. 发现 `--disable-libx264`。

结论：

该候选未包含 x264 GPL 编码器。

## 9. 是否包含 libx265

检查结果：

1. 未发现 `--enable-libx265`。
2. 发现 `--disable-libx265`。

结论：

该候选未包含 x265。

## 10. 是否包含 libmp3lame

检查结果：

1. 发现 `--enable-libmp3lame`。
2. `ffmpeg -encoders` 可见 `libmp3lame` MP3 encoder。

结论：

该候选支持 MP3 编码，但 `libmp3lame`、历史专利、销售地区和平台要求仍需商业发布前复核。

## 11. 是否包含 ffmpeg.exe / ffprobe.exe

包含：

`ffmpeg.exe`

`verification/ffmpeg-binary-candidates/BtbN-ffmpeg-n7.1-win64-lgpl-shared-7.1/extracted/ffmpeg-n7.1-latest-win64-lgpl-shared-7.1/bin/ffmpeg.exe`

`ffprobe.exe`

`verification/ffmpeg-binary-candidates/BtbN-ffmpeg-n7.1-win64-lgpl-shared-7.1/extracted/ffmpeg-n7.1-latest-win64-lgpl-shared-7.1/bin/ffprobe.exe`

未放入：

1. `apps/desktop/src-tauri/resources/ffmpeg/bin/ffmpeg.exe`
2. `apps/desktop/src-tauri/resources/ffmpeg/bin/ffprobe.exe`
3. `apps/web/public`
4. `apps/web/out`

## 12. SHA256

ZIP：

`233E3C0D1E73C4BC2915DA553AA211BEAB75AA902F074CF6A7D6BADE6846F2CC`

`ffmpeg.exe`：

`F098AA44CEABDF4AA17B206E8BFD5B1259BFC234ADDCF18F3D647512D0918798`

`ffprobe.exe`：

`9CD5D66824EDD9DE1C048A1AB03DF90A03D71EA7FB8FCDCF9DC4A47BBC0683A7`

已写入：

`verification/ffmpeg-binary-candidates/SHA256SUMS.txt`

## 13. 构建参数

完整构建参数保存：

`verification/ffmpeg-binary-candidates/BtbN-ffmpeg-n7.1-win64-lgpl-shared-7.1/ffmpeg-buildconf.txt`

关键摘录：

```text
--enable-version3
--enable-shared
--disable-static
--enable-libmp3lame
--enable-libopus
--enable-libvpx
--enable-libopenh264
--disable-libfdk-aac
--disable-libx264
--disable-libx265
--disable-libxvid
```

未发现：

```text
--enable-gpl
--enable-nonfree
--enable-libx264
--enable-libx265
```

## 14. 源码获取方式

本轮记录：

1. FFmpeg 官方源码：https://ffmpeg.org/download.html
2. FFmpeg 官方法律说明：https://ffmpeg.org/legal.html
3. BtbN 构建项目：https://github.com/BtbN/FFmpeg-Builds
4. BtbN latest release：https://github.com/BtbN/FFmpeg-Builds/releases/tag/latest

已写入：

`verification/ffmpeg-binary-candidates/SOURCE.txt`

正式发布前仍需补充：

1. 实际源码归档或获取说明。
2. BtbN 构建脚本版本。
3. 所有第三方库对应源码或上游链接。
4. 若采用 LGPL v3 or later，按 LGPL 义务提供必要说明。

## 15. 许可证文本是否齐全

当前状态：

1. 候选 archive 中包含若干第三方库许可证文件。
2. 本轮已捕获 `ffmpeg -L` 输出。
3. 本轮已生成 `LICENSE_REVIEW.md` 初审。

尚未完成：

1. 未逐个核对所有 DLL 对应许可证。
2. 未把许可证文本并入正式安装包。
3. 未完成法律/许可证人工复核。

结论：

作为下一轮内部实验候选足够，作为正式商业发布仍不够。

## 16. 是否适合商业发布

当前结论：

暂不直接用于正式商业发布。

原因：

1. 需要复核 LGPL v3 or later。
2. 需要复核 shared build 中每个 DLL 的许可证。
3. 需要复核 `libmp3lame`、`libopenh264`、AAC 和专利问题。
4. 需要干净 Windows 10/11 VM 验证。
5. 最好改为自建 LGPL FFmpeg 以降低长期维护和合规不确定性。

## 17. 是否适合进入 sidecar 实验开关

适合进入下一轮内部实验开关。

条件：

1. 只能离线专业版使用。
2. 不默认启用。
3. 不替换现有 WASM。
4. 不进入在线版。
5. 保持参数白名单。
6. 不允许用户输入任意命令。
7. 仍不扩大 Tauri 权限。

## 18. 候选本地测试结果

报告：

候选测试过程报告已归并到本文，不再单独保留。

验证脚本：

`verification/ffmpeg-binary-candidates/run-candidate-test.mjs`

关键结果：

```json
{
  "wavToFlac": true,
  "spacedPath": true,
  "mp4ToWebm": true,
  "chinesePath": true,
  "dDrivePath": true,
  "externalRequests": 0
}
```

命令结果：

1. `ffmpeg.exe -version`：通过。
2. `ffmpeg.exe -buildconf`：通过。
3. `ffprobe.exe -version`：通过。
4. 生成 WAV：通过。
5. WAV 转 FLAC：通过。
6. 生成 MP4：通过。
7. MP4 转 WebM：通过。
8. 中文路径：通过。
9. 带空格路径：通过。
10. D 盘路径：通过。
11. 外部网络请求：0。

## 19. 是否影响现有产品功能

未影响。

确认：

1. 在线版仍使用 FFmpeg WASM。
2. 在线版 `ffmpeg-core.js` 存在，大小 112059 字节。
3. 在线版 `ffmpeg-core.wasm` 存在，大小 32232419 字节。
4. 在线版没有 `ffmpeg.exe`。
5. 在线版没有 `ffprobe.exe`。
6. 离线专业版批量音视频仍默认使用 WASM。
7. sidecar POC command 仍保持内部能力。
8. Tauri 权限没有扩大。
9. WebView2 offlineInstaller 未改动。
10. 没有新增云转换。
11. 没有新增用户文件上传路径。

## 20. 测试和构建结果

已执行：

```powershell
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 test
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 build:web
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 --filter web exec tsc --noEmit
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 package:desktop
```

结果：

1. `pnpm test`：通过，9 个测试文件，41 个测试全部通过。
2. `pnpm build:web`：通过。
3. `pnpm --filter web exec tsc --noEmit`：通过。
4. `pnpm package:desktop`：通过。
5. 离线批量冒烟：Word、Excel、音频、视频批量处理通过，外部请求为空。
6. 最后已重新执行 `build:web`，恢复在线版静态输出。

备注：

1. `package:desktop` 仍在构建阶段下载 WebView2 offlineInstaller，这是既有配置行为，本轮未修改。
2. Vite CJS deprecation warning 仍存在，不影响本轮结果。

## 21. 新安装包信息

EXE：

`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\nsis\万能格式转换器_1.0.0_x64-setup.exe`

大小：217663411 字节，约 207.58 MB

SHA256：

`D8B800D3BDE9A1B252A7F4F9CAB1EC9C41E3C15320EA16635C80095EF3C06473`

MSI：

`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\msi\万能格式转换器_1.0.0_x64_zh-CN.msi`

大小：216178688 字节，约 206.16 MB

SHA256：

`3A9E5669B0D7A75B416ABDF5C89D6660A5271A752EE11CF0C0EF6A590B9A1EB6`

## 22. 是否需要人工法律/许可证复核

需要。

复核重点：

1. LGPL v3 or later 是否适合本产品商业模式。
2. shared build 中所有 DLL 的许可证。
3. `libmp3lame` 的许可证和专利历史。
4. `libopenh264` 的许可证、二进制和专利条款。
5. 原生 AAC / MediaFoundation AAC 的地区和平台要求。
6. 是否需要提供对象文件或重新链接方式。
7. 是否需要保留完整源码镜像。
8. 安装目录和软件内开源许可证展示。

## 23. 下一轮是否可以进入 SIDECAR_FFMPEG_EXPERIMENT_FLAG_ROUND

可以进入，但只建议做“内部实验开关”。

下一轮边界建议：

1. 只在离线专业版设置中心显示实验开关。
2. 默认关闭。
3. 在线版继续使用 WASM。
4. 离线专业版默认仍使用 WASM。
5. sidecar 只用于用户主动开启后的测试任务。
6. 不扩大 Tauri 权限。
7. 不允许任意命令或任意 args。
8. 不上传文件。
9. 不引入云转换。

## 24. 仍必须等干净 Windows 10/11 VM 实测的事项

1. 候选 shared build 所需 DLL 是否在打包后完整。
2. 无开发环境机器上能否运行 `ffmpeg.exe`。
3. Windows 10 x64 断网运行。
4. Windows 11 x64 断网运行。
5. 中文路径。
6. 带空格路径。
7. D 盘路径。
8. 输出目录写入。
9. 大文件取消。
10. 批量队列失败后继续处理下一项。
11. Windows Defender 误报风险。
12. 安装包体积变化。
13. 卸载是否清理 sidecar 文件。
14. 开源许可证是否可离线查看。
