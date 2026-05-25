# SIDECAR_FFMPEG_PROOF_OF_CONCEPT_REPORT

生成时间：2026-05-24

本轮名称：SIDECAR_FFMPEG_PROOF_OF_CONCEPT_ROUND

## 1. 本轮目标

本轮只完成 Windows 离线专业版 sidecar FFmpeg 的可行性验证框架，不替换现有功能，不接入默认批量任务队列，不删除 FFmpeg WASM，不扩大 Tauri 权限。

当前产品策略保持不变：

1. 在线版继续使用本地 FFmpeg WASM。
2. 在线版继续保留单文件音频转换、视频转换、视频提取音频。
3. 在线版批量处理入口继续引导下载 Windows 离线专业版。
4. 离线专业版当前批量音视频转换仍默认使用 FFmpeg WASM。
5. sidecar 仅作为内部 POC，不作为默认生产能力。

## 2. 修改文件

本轮新增或修改的文件：

1. `apps/desktop/src-tauri/src/main.rs`
2. `apps/desktop/src-tauri/src/sidecar_ffmpeg.rs`
3. `apps/desktop/src-tauri/tauri.conf.json`
4. `apps/desktop/src-tauri/resources/ffmpeg/README.txt`
5. `apps/desktop/src-tauri/resources/ffmpeg/BUILD_CONFIG.txt`
6. `apps/desktop/src-tauri/resources/ffmpeg/SOURCE_OFFER.txt`
7. `apps/desktop/src-tauri/resources/ffmpeg/SHA256SUMS.txt`
8. `apps/desktop/src-tauri/resources/ffmpeg/bin/README.md`
9. `apps/desktop/src-tauri/resources/ffmpeg/LICENSES/FFmpeg-LICENSE.txt`
10. `apps/desktop/src-tauri/resources/ffmpeg/LICENSES/FFmpeg-COPYING.LGPLv2.1.txt`
11. `apps/desktop/src-tauri/resources/ffmpeg/LICENSES/FFmpeg-COPYING.GPLv2.txt`
12. `apps/desktop/src-tauri/resources/ffmpeg/LICENSES/third-party-libraries.md`
13. `apps/web/src/tests/sidecarFfmpegPoc.test.ts`
14. `verification/sidecar-ffmpeg-poc/README.md`
15. `verification/sidecar-ffmpeg-poc/sample-generation.mjs`
16. `verification/sidecar-ffmpeg-poc/sidecar-poc.mjs`
17. `verification/sidecar-ffmpeg-poc/sidecar-poc-results.json`
18. `SIDECAR_FFMPEG_BINARY_SOURCE_REVIEW.md`
19. `SIDECAR_FFMPEG_PROOF_OF_CONCEPT_REPORT.md`

## 3. Sidecar 资源目录

已新增目录：

`apps/desktop/src-tauri/resources/ffmpeg/`

目录结构：

```text
resources/
  ffmpeg/
    bin/
      README.md
    LICENSES/
      FFmpeg-LICENSE.txt
      FFmpeg-COPYING.LGPLv2.1.txt
      FFmpeg-COPYING.GPLv2.txt
      third-party-libraries.md
    README.txt
    BUILD_CONFIG.txt
    SOURCE_OFFER.txt
    SHA256SUMS.txt
```

本轮没有放入：

1. `ffmpeg.exe`
2. `ffprobe.exe`

原因：当前项目中没有可用于正式打包的可信 LGPL FFmpeg sidecar 二进制。按照本轮要求，没有从不明来源下载或打包 FFmpeg 二进制。

## 4. FFmpeg 二进制来源结论

已生成：

`SIDECAR_FFMPEG_BINARY_SOURCE_REVIEW.md`

结论：

1. 当前没有 `ffmpeg.exe`。
2. 当前没有 `ffprobe.exe`。
3. 当前没有可信二进制来源。
4. 当前不能判定 LGPL / GPL / nonfree 构建属性。
5. 当前没有可用于正式发布的 SHA256。
6. 当前没有完整构建参数。
7. 当前不能进入真实 sidecar 打包验证。
8. 本轮只完成目录、命令、检测和 POC 框架。

## 5. Rust POC Command

已新增 Tauri Rust command：

1. `check_ffmpeg_sidecar()`
2. `get_ffmpeg_sidecar_version()`
3. `run_ffmpeg_sidecar_poc()`

实现文件：

`apps/desktop/src-tauri/src/sidecar_ffmpeg.rs`

安全边界：

1. 只查找内置资源目录中的 `ffmpeg.exe` / `ffprobe.exe`。
2. 不允许用户传入 `ffmpeg.exe` 路径。
3. 不允许用户传入原始命令字符串。
4. 不允许用户传入原始 args 数组。
5. 不调用 `cmd.exe`。
6. 不调用 `powershell.exe`。
7. 不做 shell 字符串拼接。
8. 使用 `Command::new(...).args(&built.args)` 参数数组。
9. 缺少 `ffmpeg.exe` 时返回 `sidecar_missing`，不影响现有功能。
10. 当前不接入正式批量任务队列。
11. 当前不替换 FFmpeg WASM。

## 6. 参数白名单 Builder

已新增最小白名单构建器，允许的 POC 模式：

1. `version-check`
2. `probe-duration`
3. `convert-mp4-to-webm-poc`
4. `convert-wav-to-flac-poc`

限制：

1. 参数全部由程序生成。
2. 输入文件必须存在，并且扩展名在白名单内。
3. 输出目录必须存在。
4. 拒绝 `..` 路径跳转。
5. 拒绝输出到程序安装目录。
6. 拒绝输出到资源目录。
7. 拒绝输出到 Windows 系统目录。
8. 输出文件名清理 Windows 非法字符。
9. 中文路径、D 盘路径、带空格路径通过 `PathBuf` 和参数数组处理。
10. 对外展示路径使用脱敏路径。

## 7. Tauri 配置变化

修改文件：

`apps/desktop/src-tauri/tauri.conf.json`

本轮只新增：

```json
"resources": [
  "resources/ffmpeg"
]
```

同时修复了该文件中的中文元数据乱码：

1. `productName`：`万能格式转换器`
2. `publisher`：`MR.谢`
3. `copyright`：`© 2026 MR.谢. All rights reserved.`
4. `shortDescription`：正常中文
5. `longDescription`：正常中文
6. `windows.title`：`万能格式转换器`

未扩大权限：

1. `process.all` 仍为 `false`。
2. `updater.active` 仍为 `false`。
3. `shell.all` 仍为 `false`。
4. WebView2 `offlineInstaller` 保持不变。
5. 文件系统权限没有新增 C 盘全盘权限。
6. 没有新增网络权限。

## 8. 在线版影响

在线版未接入 sidecar，不包含 `ffmpeg.exe` 或 `ffprobe.exe`。

检查结果：

1. `apps/web/out/ffmpeg/ffmpeg-core.js` 存在，大小 112059 字节。
2. `apps/web/out/ffmpeg/ffmpeg-core.wasm` 存在，大小 32232419 字节。
3. `apps/web/public/ffmpeg/ffmpeg-core.js` 存在，大小 112059 字节。
4. `apps/web/public/ffmpeg/ffmpeg-core.wasm` 存在，大小 32232419 字节。
5. `apps/web/public`、`apps/web/out`、`apps/web/scripts` 中未发现 `ffmpeg.exe` / `ffprobe.exe`。

在线音视频冒烟结果：

```json
{
  "audioConvert": true,
  "videoConvert": true,
  "videoExtractAudio": true,
  "externalRequests": [],
  "consoleErrors": []
}
```

结论：在线版音频转换、视频转换、视频提取音频仍可用，仍使用本地 FFmpeg WASM，没有外部请求。

## 9. 离线专业版影响

离线专业版当前批量音视频仍默认使用 FFmpeg WASM，本轮没有替换为 sidecar。

桌面模式离线冒烟结果：

```json
{
  "wordBatchRow": "标准 文档.docxWord 批量转图片1.6 KBPNG成功—",
  "excelBatchRow": "标准 表格.xlsxExcel 批量转图片6.4 KBPNG成功—",
  "audioBatchRow": "测试 音频.wav音频批量转换172 KBMP3成功—",
  "videoBatchRow": "测试 视频.mp4视频批量转换16 KBMP4成功—",
  "externalRequests": [],
  "consoleErrors": []
}
```

结论：

1. Word 批量转图片未受影响。
2. Excel 批量转图片未受影响。
3. 音频批量转换未受影响。
4. 视频批量转换未受影响。
5. 批量处理期间未发现外部请求。

## 10. Sidecar POC 脚本结果

脚本目录：

`verification/sidecar-ffmpeg-poc/`

已新增：

1. `sample-generation.mjs`
2. `sidecar-poc.mjs`
3. `README.md`
4. `sidecar-poc-results.json`

执行结果：

```json
{
  "ffmpegExists": false,
  "ffprobeExists": false,
  "sha256Matches": null,
  "versionCheck": false,
  "probeDuration": false,
  "mp4ToWebm": false,
  "wavToFlac": false,
  "chinesePath": false,
  "spacedPath": false,
  "dDrivePath": true,
  "corruptedFile": false,
  "externalRequests": 0,
  "status": "sidecar_missing"
}
```

结论：

1. 当前没有可信 `ffmpeg.exe`，脚本正确返回 `sidecar_missing`。
2. 缺少 sidecar 二进制不会导致项目失败。
3. POC 脚本未产生外部网络请求。
4. D 盘路径识别正常。
5. 中文样例路径和提示已恢复为正常 UTF-8。

## 11. 安全检查

检查项：

1. 未发现 `process.all=true`。
2. 未发现 `updater.active=true`。
3. 未发现 `shell.all=true`。
4. 未发现 `cmd.exe`。
5. 未发现 `powershell.exe`。
6. 未发现 `rawArgs`。
7. 未发现 `user_command`。
8. 未将 `ffmpeg.exe` / `ffprobe.exe` 放入在线版静态资源。
9. 未引入云转换。
10. 未新增文件上传路径。

## 12. 测试与构建结果

已执行命令：

```powershell
pnpm test
pnpm build:web
pnpm --filter web exec tsc --noEmit
pnpm package:desktop
```

实际使用固定 pnpm：

```powershell
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3
```

结果：

1. `pnpm test`：通过，9 个测试文件，41 个测试全部通过。
2. `pnpm build:web`：通过，Next.js 15.5.18 静态导出成功。
3. `pnpm --filter web exec tsc --noEmit`：通过。
4. `pnpm package:desktop`：通过，EXE / MSI 均已生成。

备注：

1. `package:desktop` 构建日志中仍出现 WebView2 offlineInstaller 的构建期下载记录，这是既有 WebView2 离线安装策略的一部分，本轮未修改。
2. Vite CJS deprecation warning 仍存在，但不影响本轮测试通过。

## 13. 新安装包

EXE：

`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\nsis\万能格式转换器_1.0.0_x64-setup.exe`

大小：217667479 字节，约 207.58 MB

SHA256：

`AEDA7064B20E9CC6447950AECAAC8891889AA44EB2FA2E4B404CAEC7AF923975`

MSI：

`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\msi\万能格式转换器_1.0.0_x64_zh-CN.msi`

大小：216178688 字节，约 206.16 MB

SHA256：

`54AB635D375538AB7CE382A797DA495F6BFD9D39F0FF23ED19A9F87FDA075D10`

## 14. 是否影响其他功能

结论：

1. 未影响在线版音频转换。
2. 未影响在线版视频转换。
3. 未影响在线版视频提取音频。
4. 未影响在线版批量处理入口。
5. 未影响离线专业版批量任务队列。
6. 未影响离线专业版批量音视频转换。
7. 未影响任务历史。
8. 未影响图片功能。
9. 未影响 PDF 转图片。
10. 未影响 Word 转图片。
11. 未影响 Excel 转图片。
12. 未影响 WebView2 offlineInstaller。
13. 未扩大 Tauri 权限。

## 15. 是否可以进入下一轮

可以进入下一轮：sidecar 实验开关设计。

但进入真实 sidecar 功能之前，必须先补齐可信 FFmpeg 二进制来源：

1. 明确来源。
2. 明确 LGPL / GPL / nonfree 构建属性。
3. 禁用 `--enable-gpl` 和 `--enable-nonfree` 的 LGPL 构建优先。
4. 获取完整构建参数。
5. 获取许可证文本。
6. 获取源码获取方式。
7. 记录 `ffmpeg.exe` / `ffprobe.exe` SHA256。
8. 在干净 Windows 10/11 虚拟机中验证。

## 16. 仍需等待干净 VM 实测的事项

正式发布前仍需在干净 Windows 10/11 VM 中确认：

1. EXE 安装。
2. MSI 安装。
3. 完全断网安装。
4. 无 WebView2 Runtime 时安装和启动。
5. WebView2 offlineInstaller 是否真实生效。
6. 中文软件名、窗口标题、发布者显示。
7. D 盘路径。
8. 中文路径。
9. 带空格路径。
10. 批量图片、文档、音频、视频处理。
11. 输出目录写入。
12. 打开输出目录。
13. 打开单个结果文件。
14. 导出处理日志。

## 17. 下一轮建议

下一轮建议执行：

`SIDECAR_FFMPEG_EXPERIMENT_FLAG_ROUND`

前置条件：

1. 先确认可信 LGPL FFmpeg 构建来源。
2. 不改变在线版 WASM。
3. 不默认启用 sidecar。
4. 只在离线专业版设置中心加入内部实验开关。
5. 继续禁止用户输入任意命令或 args。
6. 继续保持所有文件本地处理，不上传服务器。
