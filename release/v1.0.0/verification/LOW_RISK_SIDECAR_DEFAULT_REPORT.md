# LOW_RISK_SIDECAR_DEFAULT_REPORT

> 历史报告说明：本文记录 2026-05-25 当时的低风险 sidecar 复核范围。2026-06-17 起，当前发布范围以 `release/v1.0.0/docs/RELEASE_NOTES.md` 和站内更新日志为准。

生成时间：2026-05-25

## 1. 本轮目标

本轮只在 Windows 离线专业版中，将已通过人工 Windows 10 / Windows 11 VM 实测的低风险音视频格式调整为 sidecar FFmpeg 优先处理。

低风险 sidecar 优先范围严格限制为：

1. WAV 转 FLAC。
2. MP4 转 WebM。
3. ffprobe 媒体信息读取。

其余音视频能力在当时继续使用 FFmpeg WASM，不扩大当时的 sidecar 白名单范围。

## 2. 修改文件

1. `apps/web/src/lib/sidecarFfmpeg.ts`
   - 重写 sidecar 路由 helper，修复原有乱码文案。
   - 新增 `isSidecarReady`。
   - 新增 `SidecarProbeMode = "probe-duration"`。
   - 保留 sidecar 白名单：WAV 转 FLAC、MP4 转 WebM。
   - 明确排除视频提取音频、MP3、AAC/M4A、MP4/H.264、MOV、AVI、MKV 等场景。

2. `apps/web/src/components/tools/ToolsClient.tsx`
   - 离线专业版设置文案从“实验功能”调整为“使用本地 sidecar FFmpeg 优先处理低风险格式”。
   - sidecar 校验通过且用户未手动关闭时，低风险优先设置默认开启。
   - 用户可手动关闭，关闭后对应低风险格式回到 FFmpeg WASM。
   - sidecar 缺失或 SHA256 校验失败时自动关闭并回退 WASM。
   - 低风险转换任务命中白名单时调用 sidecar。
   - sidecar 执行失败时当前任务标记失败，不自动二次执行 WASM，并提示用户可关闭 sidecar 后用 WASM 重试。
   - 成功/失败任务继续记录 `backend: "sidecar"` 或 `backend: "wasm"`。
   - 通过 `probe-duration` 在离线专业版读取媒体时长；在线版不调用 sidecar。

3. `apps/web/src/tests/sidecarFfmpegExperiment.test.ts`
   - 更新为低风险 sidecar 优先路由测试。
   - 覆盖桌面端、在线端、校验失败、无本地输出目录、用户关闭、格式白名单和格式排除。

4. `apps/web/src/tests/sidecarFfmpegPoc.test.ts`
   - 更新为低风险 sidecar 后端安全边界测试。
   - 覆盖在线静态资源隔离、Tauri 权限不扩大、WebView2 offlineInstaller 不变、sidecar 资源只进桌面端。

5. `FFMPEG_LICENSE_NOTICE.md`
6. `THIRD_PARTY_NOTICES.md`
7. `OPEN_SOURCE_LICENSES.md`
8. `RELEASE_COMPLIANCE_CHECKLIST.md`
   - 追加 2026-05-25 低风险 sidecar 优先策略说明。
   - 明确在线版继续使用 FFmpeg WASM。
   - 明确离线专业版仍保留 FFmpeg WASM。
   - 明确当时的 sidecar 优先范围为 WAV 转 FLAC、MP4 转 WebM、ffprobe 信息读取。
   - 明确 BtbN FFmpeg 候选仍未完成商业许可证最终复核。

## 3. 是否只影响离线专业版

是。

在线版逻辑保持为 FFmpeg WASM，不显示 sidecar 设置，不调用 Tauri sidecar command，不进入离线批量任务队列。

## 4. 在线版是否完全不受影响

是。

在线版仍保留：

1. 音频转换。
2. 视频转换。
3. 视频提取音频。
4. `/ffmpeg/ffmpeg-core.js`。
5. `/ffmpeg/ffmpeg-core.wasm`。

构建后确认：

1. `apps/web/out/ffmpeg/ffmpeg-core.js` 存在。
2. `apps/web/out/ffmpeg/ffmpeg-core.wasm` 存在。

## 5. WAV 转 FLAC 是否默认 sidecar 优先

是，在同时满足以下条件时默认 sidecar 优先：

1. 当前为 desktop / 离线专业版。
2. sidecar 设置开启。
3. sidecar 状态为 `sidecar_ready`。
4. SHA256 校验通过。
5. 输入文件存在本地路径。
6. 输出目录为本地 Tauri 输出目录。
7. 当前任务为 WAV 转 FLAC。

用户关闭 sidecar 优先后，该任务回到 FFmpeg WASM。

## 6. MP4 转 WebM 是否默认 sidecar 优先

是，条件同上，仅限输入扩展名为 `.mp4` 且输出格式为 `webm`。

## 7. ffprobe 是否默认 sidecar 优先

是，仅限离线专业版在 sidecar 可用且用户未关闭该设置时读取媒体时长信息。在线版不调用 sidecar。

## 8. 用户关闭 sidecar 后是否回到 WASM

是。

用户关闭后，本机 `localStorage` 写入 `disabled`，后续音视频批量处理继续使用 FFmpeg WASM。设置状态不上传服务器。

## 9. sidecar 缺失或校验失败时如何处理

1. 自动关闭 sidecar 优先设置。
2. 本机 `localStorage` 写入 `disabled`。
3. 继续走 FFmpeg WASM 或在设置面板显示明确状态。
4. 不影响在线版和其他离线功能。

## 10. sidecar 失败后是否会自动二次执行 WASM

不会。

sidecar 命中白名单并开始执行后，如果失败：

1. 当前任务标记失败。
2. 错误提示为：`sidecar FFmpeg 处理失败。当前文件没有上传服务器。你可以关闭 sidecar 优先处理，改用 FFmpeg WASM 后重试。`
3. 后续任务继续处理。
4. 不自动二次执行 WASM，避免耗时翻倍。

## 11. 禁止扩展范围检查

以下场景仍不走 sidecar：

1. MP3 输出。
2. AAC 输出。
3. M4A 输出。
4. MP4 / H.264 输出。
5. MOV 输出。
6. AVI 输出。
7. MKV 输出。
8. 视频提取音频到 MP3。
9. 视频提取音频到 AAC。
10. 视频提取音频到 M4A。

这些格式继续使用 FFmpeg WASM，或显示不属于 sidecar 低风险优先范围的说明。

## 12. 任务历史和日志

任务历史继续记录：

1. `backend: "sidecar"` 或 `backend: "wasm"`。
2. `status`。
3. `outputFormat`。
4. `resultName`。
5. `durationMs`。
6. `error`。
7. 脱敏后的输入路径。
8. 脱敏后的输出路径。

继续不记录：

1. 完整源文件路径。
2. 完整输出路径。
3. 完整 FFmpeg 命令行。
4. 完整 FFmpeg stderr。
5. 文件内容。
6. 用户隐私内容。

## 13. 外部请求和用户文件上传

本轮未引入任何云转换 API。

自动化测试确认：

1. `networkGuard` 继续拦截外部 File / Blob / ArrayBuffer / FormData 上传。
2. 在线 FFmpeg WASM 从同源 `/ffmpeg` 静态资源加载。
3. `packages/media-core/src/index.ts` 不包含 `unpkg.com`、`https://` 或 `FormData`。
4. sidecar 调用仅走本机 Tauri command，不上传文件、日志、路径或转换结果。

打包阶段 Tauri 仍会处理 WebView2 offlineInstaller 资源；这不属于用户文件处理过程。

## 14. Tauri 权限和 WebView2

1. Tauri 权限未扩大。
2. `process.all` 保持 `false`。
3. `updater.active` 保持 `false`。
4. `resources/ffmpeg` 保持随离线专业版打包。
5. WebView2 `offlineInstaller` 配置保持不变。

## 15. sidecar 资源检查

`apps/desktop/src-tauri/target/release/resources/ffmpeg/bin` 中包含：

| 文件 | 大小 |
| --- | ---: |
| `ffmpeg.exe` | 429,568 bytes |
| `ffprobe.exe` | 221,184 bytes |
| `avcodec-61.dll` | 65,779,712 bytes |
| `avdevice-61.dll` | 7,449,600 bytes |
| `avfilter-10.dll` | 24,924,160 bytes |
| `avformat-61.dll` | 21,438,464 bytes |
| `avutil-59.dll` | 2,836,992 bytes |
| `swresample-5.dll` | 670,208 bytes |
| `swscale-8.dll` | 703,488 bytes |

## 16. 测试和构建结果

已执行：

1. `pnpm test`
   - 结果：通过。
   - 10 个测试文件通过。
   - 46 个测试通过。

2. `pnpm build:web`
   - 结果：通过。
   - Next.js 15.5.18 静态导出成功。
   - `/tools`、`/download`、`/licenses` 等页面正常生成。

3. `pnpm --filter web exec tsc --noEmit`
   - 结果：通过。

4. `pnpm package:desktop`
   - 结果：通过。
   - EXE / MSI 均重新生成。

## 17. 新 EXE / MSI

EXE：

`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\nsis\万能格式转换器_1.0.0_x64-setup.exe`

- 大小：257,573,561 bytes，约 245.64 MB
- SHA256：`F6757D1CC99801151919426C6EA5D873D5F1D3F227A6EA51F139F0CCCD5C1A4A`
- 生成时间：2026-05-25 08:15:25

MSI：

`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\msi\万能格式转换器_1.0.0_x64_zh-CN.msi`

- 大小：268,910,592 bytes，约 256.45 MB
- SHA256：`D04FBFB4254E314E57DB6E7474A77B57DA3C206EE23E72CF38E40E4B19D4C103`
- 生成时间：2026-05-25 08:16:04

## 18. 是否可以进入最终发布包整理

可以进入最终发布包整理，但需要保留两个前置提醒：

1. BtbN FFmpeg 候选仍需要正式商业发布前人工许可证、专利、平台和地区复核。
2. 若计划将 sidecar 扩展到 MP3、AAC/M4A、MP4/H.264、MOV、AVI、MKV，应先进入专项评估，不应在当前版本直接扩大范围。

## 19. 是否仍需要 BtbN 候选许可证人工复核

需要。

当前结果只能说明 BtbN 候选在干净 Windows 10 / 11 VM 中完成了低风险格式可用性验证，不等同于商业许可证最终复核完成。

## 20. 是否仍建议长期自建 LGPL FFmpeg

仍然建议。

长期发布策略建议：

1. 自建 LGPL FFmpeg。
2. 禁用 `--enable-gpl`。
3. 禁用 `--enable-nonfree`。
4. 固定构建参数。
5. 保存完整许可证文本、构建日志、SHA256 和源码获取方式。
6. 在正式商业发布前完成法律和许可证复核。
