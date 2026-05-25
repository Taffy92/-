# WEBVIEW2_OFFLINE_INSTALLER_REPORT

生成时间：2026-05-24

本轮名称：`WEBVIEW2_OFFLINE_INSTALLER_ROUND`

## 1. 当前 WebView2 策略审查结果

修复前：

- `apps/desktop/src-tauri/tauri.conf.json` 未显式配置 `webviewInstallMode`。
- Tauri v1 默认使用 `downloadBootstrapper`。
- 生成的 NSIS 脚本包含：
  - `!define INSTALLWEBVIEW2MODE "downloadBootstrapper"`
  - `NSISdl::download "https://go.microsoft.com/fwlink/p/?LinkId=2124703"`
- 生成的 WiX 脚本包含：
  - `DownloadAndInvokeBootstrapper`
  - `Invoke-WebRequest -Uri "https://go.microsoft.com/fwlink/p/?LinkId=2124703"`

结论：

- 修复前安装包不适合“完全断网且目标机器没有 WebView2 Runtime”的环境。
- 有 WebView2 的电脑可以安装和运行。
- 没有 WebView2 且有网络的电脑可以由安装器联网下载 WebView2。
- 没有 WebView2 且完全断网的电脑存在安装失败或程序无法启动风险。

修复后：

- `apps/desktop/src-tauri/tauri.conf.json` 已配置：

```json
"webviewInstallMode": {
  "type": "offlineInstaller",
  "silent": true
}
```

- 生成的 NSIS 脚本显示：
  - `!define INSTALLWEBVIEW2MODE "offlineInstaller"`
  - `WEBVIEW2INSTALLERPATH` 指向构建阶段下载的 `MicrosoftEdgeWebView2RuntimeInstallerX64.exe`
  - 安装时用 `File "/oname=$TEMP\MicrosoftEdgeWebView2RuntimeInstaller.exe"` 把本地 installer 解包到临时目录并执行。
- 生成的 MSI / WiX 脚本显示：
  - `<Binary Id="MicrosoftEdgeWebView2RuntimeInstaller.exe" ... />`
  - `<CustomAction Id='InvokeStandalone' ... ExeCommand='/silent /install' />`
  - 条件：`NOT(REMOVE OR WVRTINSTALLED)`，已安装 WebView2 时跳过。

## 2. 三种离线方案对比

详见：`WEBVIEW2_OFFLINE_OPTIONS.md`

简要结论：

| 方案 | 是否完全离线 | 体积 | 维护成本 | 适合离线专业版 |
| --- | --- | --- | --- | --- |
| A 当前 bootstrapper | 否 | 最小 | 低 | 不适合 |
| B Evergreen Standalone Installer | 是 | 增加约 190 MB | 中 | 适合，已采用 |
| C Fixed Version Runtime | 是 | 最大 | 高 | 企业内网固定环境可考虑 |

## 3. 最终选择的方案

采用方案 B：捆绑 Microsoft Edge WebView2 Evergreen Standalone Installer。

原因：

1. 满足目标机器无网络、无 WebView2 Runtime 时的安装需求。
2. Tauri v1 原生支持，改动最小。
3. 不需要用户手动安装 WebView2。
4. 比 Fixed Version Runtime 更容易维护。
5. 不改变在线版、批量队列、任务历史、图片压缩 worker 和 FFmpeg 功能。

## 4. 修改文件

已修改：

- `apps/desktop/src-tauri/tauri.conf.json`

新增报告：

- `WEBVIEW2_CURRENT_STATE_AUDIT.md`
- `WEBVIEW2_OFFLINE_OPTIONS.md`
- `WEBVIEW2_CLEAN_VM_TEST_CHECKLIST.md`
- `WEBVIEW2_OFFLINE_INSTALLER_REPORT.md`

未修改：

- 在线版主流程。
- UI。
- 批量任务队列逻辑。
- 任务历史逻辑。
- 图片压缩本地 worker。
- FFmpeg 功能。
- Tauri 文件系统权限。

## 5. 是否真的支持完全断网安装

构建产物层面：支持。

证据：

- NSIS 已切换到 `offlineInstaller`。
- MSI 已内嵌 `MicrosoftEdgeWebView2RuntimeInstaller.exe`。
- 安装时会检测 WebView2 是否已经安装。
- 已安装时跳过。
- 未安装时运行本地 bundled installer。
- 不再依赖目标机器联网下载 bootstrapper。

仍需人工验证：

- 必须在干净 Windows 10/11 x64 虚拟机中验证“断网 + 无 WebView2 Runtime”场景。
- 当前开发机无法证明目标机完全无 WebView2 的真实安装体验。

## 6. 安装包体积变化

上一轮安装包：

- EXE：15.03 MB
- MSI：15.86 MB

本轮安装包：

- EXE：207.53 MB
- MSI：206.09 MB

体积变化：

- EXE 增加约 192.50 MB。
- MSI 增加约 190.23 MB。

原因：

- 安装包内嵌 Microsoft Edge WebView2 Evergreen Standalone Installer。
- 本机构建阶段下载的 `MicrosoftEdgeWebView2RuntimeInstallerX64.exe` 大小约 190 MB。

## 7. 新安装包路径、大小、SHA256

EXE：

- 路径：`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\nsis\万能格式转换器_1.0.0_x64-setup.exe`
- 大小：207.53 MB
- SHA256：`1E20AFD1C105C676D80F269A0C8DE831825A8F0413212E8E23BD1A3E8A7471FF`

MSI：

- 路径：`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\msi\万能格式转换器_1.0.0_x64_zh-CN.msi`
- 大小：206.09 MB
- SHA256：`1B84D28F91F8602E205A0770EBE82E7372E98525C81DBAC9F6F2044139B1FA74`

## 8. 是否影响在线版

不影响。

本轮只修改桌面端 Tauri Windows bundle 配置。最后已重新执行 `pnpm build:web`，当前 `apps/web/out` 已恢复为在线版静态导出产物。

## 9. 是否影响批量任务队列

不影响。

本轮未修改：

- `apps/web/src/components/tools/ToolsClient.tsx`
- `apps/web/src/lib/batchQueue.ts`
- 批量任务状态机
- 任务历史
- 输出目录
- 文件夹导入
- 图片、文档、音视频处理逻辑

## 10. 是否影响本地处理和隐私原则

不影响。

本轮没有新增云端转换 API，没有新增用户文件上传逻辑，也没有扩大文件系统权限。

WebView2 Runtime 只影响 Windows 桌面程序运行环境，不接触用户处理的图片、PDF、Word、Excel、音频、视频或转换结果。

## 11. 是否需要用户手动安装 WebView2

修复后不需要。

安装器行为：

1. 检测目标机器是否已有 WebView2 Runtime。
2. 如果已有，跳过安装。
3. 如果没有，运行安装包内嵌的 WebView2 Evergreen Standalone Installer。
4. 如果安装失败，NSIS 中文语言文件包含错误提示：
   - “无法安装 WebView2！没有它，此应用就无法运行。尝试重启安装程序。”
   - “错误：安装 WebView2 时失败，错误代码：$1”

## 12. 官方来源和再分发说明

来源：

- Tauri v1 本地 schema 明确支持 `offlineInstaller`，说明该模式不需要目标机器联网，并会让安装包增加约 127 MB。
- Microsoft WebView2 官方分发文档建议需要离线部署时使用 Evergreen Standalone Installer，并可将其包含在应用安装器或更新器中。

参考链接：

- Tauri v1 Windows 打包文档：`https://v1.tauri.app/v1/guides/building/windows/`
- Tauri v1 配置 API：`https://v1.tauri.app/v1/api/config`
- Microsoft WebView2 分发文档：`https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/distribution`
- Microsoft WebView2 下载页：`https://developer.microsoft.com/en-us/microsoft-edge/webview2/#download-section`

注意：

- 本报告不是法律意见。
- 正式发布前仍建议保留 WebView2 / Microsoft Edge WebView2 Runtime 相关许可和第三方声明，并根据 Microsoft 当前条款做最终确认。

## 13. 干净 Windows 10/11 测试清单

已生成：`WEBVIEW2_CLEAN_VM_TEST_CHECKLIST.md`

必须重点验证：

- Windows 10 x64：断网 + 无 WebView2。
- Windows 11 x64：断网 + 无 WebView2。
- 已有 WebView2 时是否跳过安装。
- 安装后是否能打开离线专业版工作台。
- 卸载和重装是否正常。
- 是否复用历史安装目录。

## 14. 执行命令与结果

已执行：

```powershell
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 test
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 build:web
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 --filter web exec tsc --noEmit
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 package:desktop
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 build:web
```

结果：

- `pnpm test`：通过，6 个测试文件，30 个测试全部通过。
- `pnpm build:web`：通过，静态导出 15 个页面。
- `pnpm --filter web exec tsc --noEmit`：通过。
- `pnpm package:desktop`：通过，EXE / MSI 均生成。
- 最后再次 `build:web`：通过，在线版静态产物已恢复。

构建警告：

- Tauri 构建阶段仍有 Node `DEP0190` 警告，来自 shell 参数拼接警告；本轮未处理，因为它不是 WebView2 离线安装阻断项。

## 15. 下一轮建议

可以进入：

1. Tauri 权限收窄专项。
2. 最终发布包整理。
3. 干净 Windows 10/11 VM 人工验收。
4. 安装包签名和发布校验清单。
