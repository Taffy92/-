# SIDECAR_FFMPEG_EXPERIMENT_FLAG_REPORT

生成时间：2026-05-24

本轮名称：`SIDECAR_FFMPEG_EXPERIMENT_FLAG_ROUND`

本轮目标是在 Windows 离线专业版中加入默认关闭的 sidecar FFmpeg 内部实验开关。在线版继续使用本地 FFmpeg WASM，离线专业版默认也继续使用 FFmpeg WASM；sidecar 只在用户主动开启、校验通过、格式白名单匹配、存在本地输入路径和本地输出目录时才会被调用。

## 1. 修改文件

1. `apps/desktop/src-tauri/resources/ffmpeg/bin/ffmpeg.exe`
2. `apps/desktop/src-tauri/resources/ffmpeg/bin/ffprobe.exe`
3. `apps/desktop/src-tauri/resources/ffmpeg/bin/avcodec-61.dll`
4. `apps/desktop/src-tauri/resources/ffmpeg/bin/avdevice-61.dll`
5. `apps/desktop/src-tauri/resources/ffmpeg/bin/avfilter-10.dll`
6. `apps/desktop/src-tauri/resources/ffmpeg/bin/avformat-61.dll`
7. `apps/desktop/src-tauri/resources/ffmpeg/bin/avutil-59.dll`
8. `apps/desktop/src-tauri/resources/ffmpeg/bin/swresample-5.dll`
9. `apps/desktop/src-tauri/resources/ffmpeg/bin/swscale-8.dll`
10. `apps/desktop/src-tauri/resources/ffmpeg/SHA256SUMS.txt`
11. `apps/desktop/src-tauri/resources/ffmpeg/BUILD_CONFIG.txt`
12. `apps/desktop/src-tauri/resources/ffmpeg/SOURCE_OFFER.txt`
13. `apps/desktop/src-tauri/resources/ffmpeg/README.txt`
14. `apps/desktop/src-tauri/resources/ffmpeg/LICENSES/BtbN-FFmpeg-LICENSE.txt`
15. `apps/desktop/src-tauri/resources/ffmpeg/LICENSES/ffmpeg-license-output.txt`
16. `apps/desktop/src-tauri/resources/ffmpeg/LICENSES/ffmpeg-encoder-check.txt`
17. `apps/desktop/src-tauri/resources/ffmpeg/LICENSES/third-party-libraries.md`
18. `apps/desktop/src-tauri/Cargo.toml`
19. `apps/desktop/src-tauri/Cargo.lock`
20. `apps/desktop/src-tauri/src/sidecar_ffmpeg.rs`
21. `apps/web/src/lib/sidecarFfmpeg.ts`
22. `apps/web/src/lib/batchQueue.ts`
23. `apps/web/src/components/tools/ToolsClient.tsx`
24. `apps/web/src/tests/sidecarFfmpegPoc.test.ts`
25. `apps/web/src/tests/sidecarFfmpegExperiment.test.ts`
26. `apps/web/src/tests/batchQueue.test.ts`
27. `SIDECAR_FFMPEG_EXPERIMENT_NOTICE.md`
28. `FFMPEG_LICENSE_NOTICE.md`
29. `OPEN_SOURCE_LICENSES.md`
30. `RELEASE_COMPLIANCE_CHECKLIST.md`

`THIRD_PARTY_NOTICES.md` 已存在 sidecar 实验资源补充段落，内容覆盖本轮新策略。

## 2. 是否复制 ffmpeg.exe

已复制。

来源：

`verification/ffmpeg-binary-candidates/BtbN-ffmpeg-n7.1-win64-lgpl-shared-7.1/extracted/ffmpeg-n7.1-latest-win64-lgpl-shared-7.1/bin/ffmpeg.exe`

目标：

`apps/desktop/src-tauri/resources/ffmpeg/bin/ffmpeg.exe`

SHA256：

`F098AA44CEABDF4AA17B206E8BFD5B1259BFC234ADDCF18F3D647512D0918798`

## 3. 是否复制 ffprobe.exe

已复制。

目标：

`apps/desktop/src-tauri/resources/ffmpeg/bin/ffprobe.exe`

SHA256：

`9CD5D66824EDD9DE1C048A1AB03DF90A03D71EA7FB8FCDCF9DC4A47BBC0683A7`

## 4. 是否复制 shared build 所需 DLL

已复制 shared build 所需 DLL。没有只复制 exe。

| 文件 | SHA256 |
|---|---|
| `bin/avcodec-61.dll` | `0E450DDD2B0F7BD8F1AE4E5A88C035432DB5EAAD50AEC8EF801A9562FBDC2AEE` |
| `bin/avdevice-61.dll` | `80EE2C4624AC56ABB56D1DC0EB00D94F78383AEA497D938A1027C3E30425FAD2` |
| `bin/avfilter-10.dll` | `2E430FA6D877FD379506B08BF58682E4C921B6303E052B850F0F105254B24F46` |
| `bin/avformat-61.dll` | `CDCB28EBA8EA4557B4B46106DFA3011DB8885FD90E0A6DBCCF659FB45E8EB920` |
| `bin/avutil-59.dll` | `F4B7A1C729666D7E1827AFC1B6CBED901BC530A6FCFA69535F81025882A6966C` |
| `bin/swresample-5.dll` | `408A449858B9ECF134506ED9B7FC4BCAF5129FA646571840ECAD63B634F43D4D` |
| `bin/swscale-8.dll` | `346BF68043421799A0A2EDEE0F6AD63E1340C5123C6DA861C6906FF55DF8B98E` |

完整清单已写入：

`apps/desktop/src-tauri/resources/ffmpeg/SHA256SUMS.txt`

## 5. 是否打入 EXE/MSI

已打入桌面端构建资源。构建后确认存在：

`apps/desktop/src-tauri/target/release/resources/ffmpeg/bin/ffmpeg.exe`

`apps/desktop/src-tauri/target/release/resources/ffmpeg/bin/ffprobe.exe`

以及 `avcodec-61.dll`、`avdevice-61.dll`、`avfilter-10.dll`、`avformat-61.dll`、`avutil-59.dll`、`swresample-5.dll`、`swscale-8.dll`。

## 6. 实验开关是否只在离线专业版显示

是。

实现位置：

`apps/web/src/components/tools/ToolsClient.tsx`

开关位于离线专业版右侧参数面板的“实验功能”区域。在线版不会渲染离线专业版工作台，因此不会显示该开关。

## 7. 默认是否关闭

是。

本机状态键：

`format-converter.desktop.sidecar-ffmpeg-experiment.v1`

只有值为 `enabled` 时才视为开启。默认没有该值，因此关闭。

## 8. 在线版是否完全不受影响

是。

检查结果：

1. `apps/web/out/ffmpeg/ffmpeg-core.js` 存在，大小 112059 字节。
2. `apps/web/out/ffmpeg/ffmpeg-core.wasm` 存在，大小 32232419 字节。
3. `apps/web/public` 和 `apps/web/out` 中未发现 `ffmpeg.exe`、`ffprobe.exe` 或 DLL。
4. 在线版仍由 `packages/media-core` 加载 `/ffmpeg/ffmpeg-core.js` 和 `/ffmpeg/ffmpeg-core.wasm`。

## 9. 离线专业版默认是否仍使用 WASM

是。

离线专业版默认仍走原有 `@doctool/media-core` / FFmpeg WASM 路径。只有同时满足以下条件才调用 sidecar：

1. 当前为 desktop / 离线专业版。
2. 用户主动开启 sidecar 实验开关。
3. `check_ffmpeg_sidecar` 返回 `sidecar_ready`。
4. SHA256 校验通过。
5. 输出目录为 Tauri 本地输出目录。
6. 输入任务存在本地文件路径。
7. 输出格式属于 sidecar 实验白名单。

其他情况全部继续使用 WASM。

## 10. WAV 转 FLAC sidecar 是否通过

代码路径已接入，允许模式为：

`convert-wav-to-flac-poc`

上一轮候选二进制隔离验证结果中，WAV 转 FLAC 通过。本轮未在真实 Tauri UI 中执行人工转换，只完成自动化静态边界测试和打包验证。

## 11. MP4 转 WebM sidecar 是否通过

代码路径已接入，允许模式为：

`convert-mp4-to-webm-poc`

上一轮候选二进制隔离验证结果中，MP4 转 WebM 通过。本轮未在真实 Tauri UI 中执行人工转换，只完成自动化静态边界测试和打包验证。

## 12. 中文路径、带空格路径、D 盘路径

上一轮候选二进制隔离验证结果：

1. 中文路径：通过。
2. 带空格路径：通过。
3. D 盘路径：通过。
4. 外部请求：0。

本轮 Rust 侧继续使用 `PathBuf` 和 `Command::new(...).args([...])`，不做 shell 拼接。

## 13. 外部请求是否为 0

本轮没有新增任何网络请求路径。sidecar 在 Rust 本地执行 `ffmpeg.exe` / `ffprobe.exe`，不调用云转换，不上传文件，不上传日志，不上传转换结果。

在线版 FFmpeg WASM 仍来自本地静态资源。`apps/web/out` 未发现 `cdn.jsdelivr.net`、`unpkg.com`、`ffmpeg.exe`、`ffprobe.exe`。

## 14. Tauri 权限是否扩大

没有扩大。

本轮保持：

1. `process.all = false`
2. `updater.active = false`
3. `shell.all = false`
4. WebView2 `offlineInstaller` 不变
5. `resources` 继续包含 `resources/ffmpeg`
6. 文件系统 scope 未扩大，仍为前一轮半收窄配置

## 15. WebView2 offlineInstaller 是否保持不变

是。

当前配置仍为：

```json
{
  "type": "offlineInstaller",
  "silent": true
}
```

## 16. 是否允许任意命令

否。

Rust command 只接受结构化请求，不接受原始命令字符串，不接受用户提供的 `ffmpeg.exe` 路径。

## 17. 是否允许任意 args

否。

Rust 侧由 `build_whitelisted_command` 生成固定白名单参数，不接受原始 args 数组。

## 18. 是否调用 cmd.exe / powershell.exe

否。

代码检查确认：

1. 未包含 `cmd.exe`。
2. 未包含 `powershell.exe`。
3. 未包含 `rawArgs`。
4. 使用 `Command::new(...).args(&built.args)`。

## 19. 文档和许可证是否更新

已更新：

1. `SIDECAR_FFMPEG_EXPERIMENT_NOTICE.md`
2. `FFMPEG_LICENSE_NOTICE.md`
3. `OPEN_SOURCE_LICENSES.md`
4. `RELEASE_COMPLIANCE_CHECKLIST.md`
5. `apps/desktop/src-tauri/resources/ffmpeg/README.txt`
6. `apps/desktop/src-tauri/resources/ffmpeg/SOURCE_OFFER.txt`
7. `apps/desktop/src-tauri/resources/ffmpeg/LICENSES/third-party-libraries.md`

`THIRD_PARTY_NOTICES.md` 已包含 sidecar 实验资源补充段落。

## 20. 测试和构建结果

已执行：

```powershell
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 test
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 build:web
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 --filter web exec tsc --noEmit
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 package:desktop
```

结果：

1. `pnpm test`：通过，10 个测试文件，46 个测试全部通过。
2. `pnpm build:web`：通过，Next.js 静态导出完成。
3. `pnpm --filter web exec tsc --noEmit`：通过。
4. `pnpm package:desktop`：通过，EXE/MSI 重新生成。

构建中的已知提示：

1. Vite CJS Node API deprecation warning，非本轮新增，不影响构建。
2. Tauri 打包阶段仍下载 WebView2 offlineInstaller，这是既有配置行为，本轮未修改。

## 21. 新 EXE / MSI 路径、大小、SHA256

EXE：

`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\nsis\万能格式转换器_1.0.0_x64-setup.exe`

- 大小：257570320 字节，约 245.64 MB
- SHA256：`8E00CDE59D7E80D2668709D5D7B7F76DC18161A1EA66F7B005E4A9E7C07815F0`

MSI：

`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\msi\万能格式转换器_1.0.0_x64_zh-CN.msi`

- 大小：268910592 字节，约 256.45 MB
- SHA256：`45AE4CE06E0CB59EF53BD64B70E04AC94707391268C3F4ECC2613E4429DC89BC`

## 22. 是否可以进入干净 Windows 10/11 VM 实测

可以进入，但必须明确这是 sidecar 内部实验功能验证，不是商业许可证最终验收。

建议 VM 实测重点：

1. 断网环境启动离线专业版。
2. 设置中心显示 sidecar 实验开关。
3. 默认关闭。
4. SHA256 校验通过时显示“sidecar 可用，当前为实验功能”。
5. WAV 转 FLAC 走 sidecar。
6. MP4 转 WebM 走 sidecar。
7. MP3、AAC/M4A、MP4/H.264 输出不走 sidecar。
8. 中文路径、带空格路径、D 盘路径。
9. 任务失败后队列继续。
10. 任务历史只记录脱敏路径和后端标识。

## 23. 是否可以进入 sidecar 默认后端评估

暂不建议。

建议先完成：

1. 干净 Windows 10 / 11 VM 实测。
2. sidecar 实验开关真实转换冒烟。
3. BtbN 候选许可证人工复核。
4. 是否改为自建 LGPL FFmpeg 的长期方案决策。

## 24. 仍不能正式商业发布的事项

1. 当前 BtbN sidecar 候选尚未完成法律/许可证人工复核。
2. LGPL v3 or later 对产品商业模式的影响尚未复核。
3. shared build 中所有 DLL 的许可证尚未逐项复核。
4. `libmp3lame`、`libopenh264`、AAC / M4A、地区专利和平台要求尚未复核。
5. 干净 Windows 10 / 11 VM 断网实测尚未完成。
6. 当前 sidecar 不能宣传为正式商业可用默认后端。
7. 当前 MP3、AAC/M4A、MP4/H.264、MOV、AVI、MKV 不应作为 sidecar 正式能力承诺。
