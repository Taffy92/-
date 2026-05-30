# ONLINE_AV_KEEP_BATCH_GATE_REPORT

生成时间：2026-05-24 15:30 +08:00

本轮名称：ONLINE_AV_KEEP_BATCH_GATE_ROUND

## 1. 本轮目标

本轮按新的产品策略执行：

1. 在线版继续保留音频格式转换、视频格式转换、视频提取音频。
2. 在线版继续使用本地 FFmpeg WASM，不拆除、不隐藏、不改成云转换。
3. 在线版不开放批量音视频处理，不进入离线专业版批量任务队列。
4. 在线版新增“批量处理”入口，引导用户下载 Windows 离线专业版。
5. 离线专业版继续保留完整批量处理能力，包括图片、Word、Excel、音频、视频。
6. 保留 FFmpeg / GPL / 开源许可证说明。

## 2. 修改文件

本轮修改或新增文件：

1. `apps/web/src/components/tools/ToolsClient.tsx`
2. `apps/web/src/tests/onlineBatchGate.test.ts`
3. `verification/online-av-smoke.mjs`
4. `FFMPEG_RECOMMENDED_STRATEGY.md`
5. `FFMPEG_RELEASE_OPTIONS.md`
6. `FFMPEG_GPL_SIDECAR_RELEASE_STRATEGY_REPORT.md`
7. `FFMPEG_LICENSE_NOTICE.md`
8. `THIRD_PARTY_NOTICES.md`
9. `OPEN_SOURCE_LICENSES.md`
10. `RELEASE_COMPLIANCE_CHECKLIST.md`

## 3. 在线版音视频功能保留情况

在线版继续保留以下功能：

1. 音频格式转换。
2. 视频格式转换。
3. 视频提取音频。

在线版仍使用本地静态 FFmpeg WASM 资源：

1. `apps/web/out/ffmpeg/ffmpeg-core.js`
2. `apps/web/out/ffmpeg/ffmpeg-core.wasm`

构建产物检查结果：

| 文件 | 大小 | SHA256 |
| --- | ---: | --- |
| `apps/web/out/ffmpeg/ffmpeg-core.js` | 112,059 bytes | `B266AB5B952555881DD6310663986994A182ACB2B7FF25CF10A25F7A37AC2B21` |
| `apps/web/out/ffmpeg/ffmpeg-core.wasm` | 32,232,419 bytes | `9F57947A5BD530D8F00C5B3F2CB2A3492FAA7E5D823315342D6A8656D0A6B7B7` |

在线音视频烟雾测试结果：

```json
{
  "checks": {
    "audioConvert": true,
    "videoConvert": true,
    "videoExtractAudio": true
  },
  "externalRequests": [],
  "consoleErrors": []
}
```

结论：在线版音频转换、视频转换、视频提取音频继续可用，测试期间没有发现外部请求。

## 4. 批量处理专业版入口

在线版新增“批量处理”入口。

入口文案包含指定句子：

> 批量处理为离线专业版功能，请下载 Windows 离线专业版使用。

补充说明为：

> 离线专业版支持批量任务队列、输出目录选择、失败重试、处理日志、任务历史，所有文件仍然只在本地处理，不上传服务器。

行为说明：

1. 在线版点击“批量处理”只展示离线专业版说明和下载入口。
2. 在线版不会进入离线专业版批量任务队列。
3. 在线版不会启用批量导入文件夹、批量队列、任务历史等离线专业版能力。
4. 移动端 375px 检查中，该入口没有遮挡主流程。

浏览器检查结果：

```json
{
  "external": [],
  "hasUploadPrompt": 0,
  "hasBatchQueueText": 1,
  "screenshot": "D:\\万能格式转换器项目\\preview-online-batch-gate-375.png"
}
```

说明：`hasBatchQueueText` 来自说明文案中的“批量任务队列”，不是在线版真实队列表格。`hasUploadPrompt: 0` 表示该入口下没有显示在线单文件上传流程，也没有误启用批量队列。

## 5. 离线专业版批量功能保持情况

离线专业版真实批量队列没有被本轮改动。

离线专业版烟雾测试结果：

```json
{
  "checks": {
    "wordBatch": true,
    "excelBatch": true,
    "audioBatch": true,
    "videoBatch": true
  },
  "externalRequests": [],
  "consoleErrors": []
}
```

结论：

1. 批量任务队列未受影响。
2. 音频批量转换未受影响。
3. 视频批量转换未受影响。
4. 视频提取音频未受影响。
5. 输出目录和任务历史逻辑未受影响。

## 6. 图片、PDF、Word、Excel 功能影响

本轮没有修改图片、PDF、Word、Excel 的核心处理逻辑。

影响结论：

1. 图片处理功能未被改动。
2. PDF 转图片功能未被改动。
3. Word 转图片功能未被改动。
4. Excel 转图片功能未被改动。
5. 在线版单文件轻量流程未被改动。
6. 离线专业版批量队列未被替换或重构。

## 7. 本地处理和隐私原则

本轮没有新增上传接口、云转换接口或远程文件处理逻辑。

继续保持：

1. 用户音频不上传服务器。
2. 用户视频不上传服务器。
3. 转换结果不上传服务器。
4. 在线版 FFmpeg WASM 从本地静态资源加载。
5. 未发现 `unpkg.com`、`cdn.jsdelivr.net` 或远程 FFmpeg 资源请求。
6. CloudBase 仍只用于下载授权，不接触用户处理文件。
7. 广告组件不接触 File、Blob、ArrayBuffer、Canvas 或转换结果。

## 8. WebView2 和 Tauri 权限影响

本轮没有修改 Tauri 权限。

当前关键配置摘要：

```json
{
  "webviewInstallMode": {
    "type": "offlineInstaller",
    "silent": true
  },
  "fsScope": [
    "$HOME/**",
    "$DESKTOP/**",
    "$DOCUMENT/**",
    "$DOWNLOAD/**",
    "$PICTURE/**",
    "$VIDEO/**",
    "$AUDIO/**",
    "D:/**"
  ],
  "pathAll": true,
  "shellOpen": true,
  "process": {
    "all": false,
    "exit": false,
    "relaunch": false
  },
  "updater": {
    "active": false
  }
}
```

结论：

1. WebView2 offlineInstaller 配置保留。
2. Tauri 权限没有扩大。
3. 没有开启 updater。
4. 没有开启 process 权限。
5. 没有新增网络权限。

## 9. FFmpeg / GPL 文档更新

已按新策略更新 FFmpeg 相关文档：

1. 在线版保留音视频转换。
2. 在线版保留 FFmpeg WASM。
3. 在线版不开放批量音视频处理。
4. 批量处理入口引导下载离线专业版。
5. 离线专业版保留完整批量音视频处理。
6. 长期方案为离线专业版 sidecar FFmpeg / LGPL 构建专项。
7. 由于在线版仍分发 FFmpeg WASM，在线版继续保留 FFmpeg / GPL 许可证说明和源码获取方式。
8. 正式商业发布前仍需法律/许可证复核。

## 10. 执行命令和结果

### 测试

命令：

```powershell
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' test
```

结果：

1. 8 个测试文件通过。
2. 36 个测试通过。

### TypeScript 检查

命令：

```powershell
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' --filter web exec tsc --noEmit
```

结果：通过。

### 在线版构建

命令：

```powershell
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' build:web
```

结果：通过，`apps/web/out` 已重新生成。

### 离线专业版打包

命令：

```powershell
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' package:desktop
```

结果：通过。

说明：打包过程存在构建期 WebView2 offline installer 下载日志，这是 Tauri 打包阶段获取离线安装组件，不是运行时联网转换用户文件。

### 在线音视频烟雾测试

命令：

```powershell
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' --filter web exec node '..\..\verification\online-av-smoke.mjs'
```

结果：

1. 在线音频转换通过。
2. 在线视频转换通过。
3. 在线视频提取音频通过。
4. 未发现外部请求。
5. 未发现控制台错误。

### 离线专业版批量烟雾测试

命令：

```powershell
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' --filter web exec node '..\..\verification\offline-smoke\smoke-processing.mjs'
```

结果：

1. Word 批量转图片通过。
2. Excel 批量转图片通过。
3. 音频批量转换通过。
4. 视频批量转换通过。
5. 未发现外部请求。
6. 未发现控制台错误。

## 11. 新 EXE / MSI 产物

| 类型 | 路径 | 大小 | SHA256 |
| --- | --- | ---: | --- |
| EXE | `D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\nsis\万能格式转换器_1.0.0_x64-setup.exe` | 217,604,046 bytes | `357BB684C84A1B7AEC40771C691F22F6EE7DC149EB29DA59A05956A82D7D7493` |
| MSI | `D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\msi\万能格式转换器_1.0.0_x64_zh-CN.msi` | 216,088,576 bytes | `9C530EECC86355D283C8057C4877E7DDAADBC928DA5ACF980E306DDEFE10309D` |

## 12. 结论

本轮结论：

1. 在线版继续保留音频转换、视频转换、视频提取音频。
2. 在线版继续包含 FFmpeg WASM。
3. 在线版新增“批量处理为离线专业版功能，请下载 Windows 离线专业版使用。”入口。
4. 在线版没有误启用批量任务队列。
5. 离线专业版批量能力保持正常。
6. 图片、PDF、Word、Excel 功能未受影响。
7. 本地处理和隐私原则未被破坏。
8. WebView2 offlineInstaller 未被破坏。
9. Tauri 权限没有扩大。
10. FFmpeg / GPL 文档已按新策略更新。

## 13. 下一轮建议

可以进入下一轮：

1. sidecar FFmpeg / LGPL FFmpeg 技术方案设计。
2. 干净 Windows 10 / 11 虚拟机实测。
3. 最终发布包整理和签名策略。

正式发布前仍必须完成：

1. 干净 Windows 10 / 11 虚拟机断网安装和运行实测。
2. WebView2 offlineInstaller 在无 WebView2 机器上的实际安装验证。
3. EXE / MSI 安装、卸载、重装验证。
4. FFmpeg / GPL 商业发布法律和许可证复核。
5. 如果未来改为 sidecar FFmpeg 或 LGPL 构建，需要重新生成 Notices 和发布检查清单。
