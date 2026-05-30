# SIDECAR_CLEAN_VM_PACKAGE_INFO

生成时间：2026-05-24

本报告用于 `SIDECAR_CLEAN_VM_EXPERIMENT_VALIDATION_ROUND`。当前只确认安装包、Tauri 配置和 sidecar 资源是否具备进入干净 Windows 10 / Windows 11 虚拟机实测的条件；不把当前开发机检查结果等同于干净 VM 通过。

## 1. 测试安装包

### EXE

路径：

`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\nsis\万能格式转换器_1.0.0_x64-setup.exe`

结果：

| 项目 | 内容 |
| --- | --- |
| 是否存在 | 是 |
| 文件大小 | 257,570,320 bytes |
| 约合大小 | 245.64 MB |
| SHA256 | `8E00CDE59D7E80D2668709D5D7B7F76DC18161A1EA66F7B005E4A9E7C07815F0` |
| 构建时间 | 2026-05-24 23:43:03 +08:00 |

### MSI

路径：

`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\msi\万能格式转换器_1.0.0_x64_zh-CN.msi`

结果：

| 项目 | 内容 |
| --- | --- |
| 是否存在 | 是 |
| 文件大小 | 268,910,592 bytes |
| 约合大小 | 256.45 MB |
| SHA256 | `45AE4CE06E0CB59EF53BD64B70E04AC94707391268C3F4ECC2613E4429DC89BC` |
| 构建时间 | 2026-05-24 23:43:39 +08:00 |

## 2. Tauri 配置摘要

读取方式：Node.js 以 UTF-8 解析 `apps/desktop/src-tauri/tauri.conf.json`。

| 项目 | 当前值 |
| --- | --- |
| productName | 万能格式转换器 |
| version | 1.0.0 |
| publisher | MR.谢 |
| windows.title | 万能格式转换器 |
| WebView2 策略 | `offlineInstaller` |
| WebView2 silent | `true` |
| bundle resources | `resources/ffmpeg` |
| process.all | `false` |
| updater.active | `false` |
| fs.scope | `$HOME/**`, `$DESKTOP/**`, `$DOCUMENT/**`, `$DOWNLOAD/**`, `$PICTURE/**`, `$VIDEO/**`, `$AUDIO/**`, `D:/**` |

结论：配置层面保持 WebView2 offlineInstaller，不扩大 Tauri 权限，不启用 process.all，不启用 updater。

## 3. WebView2 offlineInstaller

配置层面确认：

```json
{
  "type": "offlineInstaller",
  "silent": true
}
```

说明：

1. 当前安装包构建时仍使用 Tauri 的 WebView2 offlineInstaller 策略。
2. 是否能在“完全断网 + 无 WebView2 Runtime”的干净 Windows 10/11 机器上成功安装和启动，必须在 VM 中验证。
3. 当前报告不伪造 VM 通过结果。

## 4. sidecar FFmpeg 资源

资源目录：

`D:\万能格式转换器项目\apps\desktop\src-tauri\resources\ffmpeg`

release 资源目录：

`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\resources\ffmpeg`

确认结果：

| 文件 | 是否存在于 resources | 是否存在于 target release resources | SHA256 |
| --- | --- | --- | --- |
| `bin/ffmpeg.exe` | 是 | 是 | `F098AA44CEABDF4AA17B206E8BFD5B1259BFC234ADDCF18F3D647512D0918798` |
| `bin/ffprobe.exe` | 是 | 是 | `9CD5D66824EDD9DE1C048A1AB03DF90A03D71EA7FB8FCDCF9DC4A47BBC0683A7` |
| `bin/avcodec-61.dll` | 是 | 是 | `0E450DDD2B0F7BD8F1AE4E5A88C035432DB5EAAD50AEC8EF801A9562FBDC2AEE` |
| `bin/avdevice-61.dll` | 是 | 是 | `80EE2C4624AC56ABB56D1DC0EB00D94F78383AEA497D938A1027C3E30425FAD2` |
| `bin/avfilter-10.dll` | 是 | 是 | `2E430FA6D877FD379506B08BF58682E4C921B6303E052B850F0F105254B24F46` |
| `bin/avformat-61.dll` | 是 | 是 | `CDCB28EBA8EA4557B4B46106DFA3011DB8885FD90E0A6DBCCF659FB45E8EB920` |
| `bin/avutil-59.dll` | 是 | 是 | `F4B7A1C729666D7E1827AFC1B6CBED901BC530A6FCFA69535F81025882A6966C` |
| `bin/swresample-5.dll` | 是 | 是 | `408A449858B9ECF134506ED9B7FC4BCAF5129FA646571840ECAD63B634F43D4D` |
| `bin/swscale-8.dll` | 是 | 是 | `346BF68043421799A0A2EDEE0F6AD63E1340C5123C6DA861C6906FF55DF8B98E` |

## 5. 许可证和来源文件

已确认以下文件存在于 `resources/ffmpeg`，并进入 target release resources：

1. `README.txt`
2. `BUILD_CONFIG.txt`
3. `SOURCE_OFFER.txt`
4. `SHA256SUMS.txt`
5. `LICENSES/BtbN-FFmpeg-LICENSE.txt`
6. `LICENSES/FFmpeg-LICENSE.txt`
7. `LICENSES/FFmpeg-COPYING.LGPLv2.1.txt`
8. `LICENSES/FFmpeg-COPYING.GPLv2.txt`
9. `LICENSES/ffmpeg-license-output.txt`
10. `LICENSES/ffmpeg-encoder-check.txt`
11. `LICENSES/third-party-libraries.md`

## 6. 在线版隔离检查

检查范围：

1. `apps/web/public`
2. `apps/web/out`

结果：

| 检查项 | 结果 |
| --- | --- |
| 是否发现 `ffmpeg.exe` | 否 |
| 是否发现 `ffprobe.exe` | 否 |
| 是否发现 sidecar DLL | 否 |
| `apps/web/out/ffmpeg/ffmpeg-core.js` | 存在，112,059 bytes |
| `apps/web/out/ffmpeg/ffmpeg-core.wasm` | 存在，32,232,419 bytes |

结论：在线版继续使用 FFmpeg WASM，没有打入 sidecar exe / DLL。

## 7. sidecar 实验开关默认状态

实现位置：

1. `apps/web/src/components/tools/ToolsClient.tsx`
2. `apps/web/src/lib/sidecarFfmpeg.ts`

默认状态：

| 项目 | 结果 |
| --- | --- |
| localStorage key | `format-converter.desktop.sidecar-ffmpeg-experiment.v1` |
| 默认值 | 无值，视为关闭 |
| 开启条件 | 必须写入 `enabled` |
| 校验失败时 | 自动写回 `disabled` |
| 在线版是否显示 | 否 |
| 离线专业版是否显示 | 是 |

结论：sidecar 实验开关默认关闭，符合本轮要求。

## 8. 可进入 VM 测试结论

当前安装包具备进入干净 VM 实测的条件：

1. EXE / MSI 均存在。
2. WebView2 offlineInstaller 配置存在。
3. sidecar FFmpeg exe、ffprobe、DLL、许可证和 SHA256 文件均存在。
4. Tauri 权限没有扩大。
5. 在线版没有 sidecar 二进制。

但以下结论仍必须在干净 VM 中确认：

1. 断网 + 无 WebView2 Runtime 是否可安装并启动。
2. Windows Defender 是否误报。
3. sidecar DLL 是否在安装后真实可加载。
4. WAV 转 FLAC、MP4 转 WebM 是否在真实安装环境中通过。
5. 中文路径、带空格路径、D 盘路径是否在真实 Tauri shell/fs 环境中通过。
