# WEBVIEW2_OFFLINE_OPTIONS

生成时间：2026-05-24

## 目标

解决 Windows 离线专业版在“完全断网、目标机器没有 WebView2 Runtime”的情况下能否安装和运行的问题。

## 方案 A：继续使用当前 bootstrapper

策略：

- 保持当前 `downloadBootstrapper`。
- 安装包较小。
- 如果目标机器没有 WebView2 Runtime，则安装时联网下载 Microsoft bootstrapper。

是否完全离线：

- 否。

安装包体积影响：

- 最小，当前 EXE / MSI 约 15 MB。

维护成本：

- 低。

用户体验：

- 有网络或已安装 WebView2 的电脑体验较好。
- 完全断网且无 WebView2 的电脑会失败。

适合免费版还是专业版：

- 更适合在线版辅助下载或普通免费版。

是否适合“离线专业版”定位：

- 不适合。

## 方案 B：捆绑 Microsoft Edge WebView2 Evergreen Standalone Installer

策略：

- 使用 Tauri v1 `webviewInstallMode.type = "offlineInstaller"`。
- 构建时由 Tauri 获取官方 Evergreen Standalone Installer。
- 打包进 EXE / MSI。
- 安装时先检测 WebView2 是否已存在，已存在则跳过，缺失时运行本地 bundled installer。

是否完全离线：

- 是，安装阶段不需要目标机器联网。

安装包体积影响：

- Tauri 官方文档预估增加约 127 MB。

维护成本：

- 中等。需要定期重新构建发布包，以便更新随包携带的 Evergreen Standalone Installer。
- 运行后 Evergreen Runtime 仍可由 Microsoft 机制自动更新；如果目标机器长期离线，则保持安装时携带的版本。

用户体验：

- 最适合普通用户。
- 不要求用户手动安装 WebView2。
- 安装包变大，但流程更稳定。

适合免费版还是专业版：

- 更适合离线专业版。

是否适合“离线专业版”定位：

- 适合，推荐。

## 方案 C：使用 Fixed Version WebView2 Runtime

策略：

- 下载指定版本 Fixed Version Runtime。
- 解压 `.cab` 到固定目录。
- 使用 Tauri `webviewInstallMode.type = "fixedRuntime"` 并指定路径。
- 应用始终使用随应用打包的固定 WebView2 版本。

是否完全离线：

- 是。

安装包体积影响：

- Microsoft 文档说明 Fixed Version binaries 超过 250 MB。
- Tauri 文档预估安装包增加约 180 MB。

维护成本：

- 高。需要开发者定期下载新 Fixed Version，重新打包，跟进安全更新。
- 如果不定期更新，可能引入 Chromium 安全风险。

用户体验：

- 离线确定性最好。
- 安装包最大。
- 更新维护压力最大。

适合免费版还是专业版：

- 适合强管控企业内网版、长期固定环境版。

是否适合“离线专业版”定位：

- 可用，但当前阶段不推荐。项目主要是大众化离线专业版，不需要锁定某一个 WebView2 版本。

## 推荐方案

推荐方案 B：捆绑 Microsoft Edge WebView2 Evergreen Standalone Installer。

理由：

1. 满足“安装和使用都完全离线”的核心目标。
2. 用户无需手动安装 WebView2。
3. 比 Fixed Version 更容易维护。
4. Tauri v1 原生支持，改动最小。
5. 不影响在线版、批量队列、任务历史、图片压缩 worker 和 FFmpeg 功能。

## 参考链接

- Tauri v1 Windows 打包文档：`https://v1.tauri.app/v1/guides/building/windows/`
- Tauri v1 配置 API：`https://v1.tauri.app/v1/api/config`
- Microsoft WebView2 分发文档：`https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/distribution`
- Microsoft WebView2 下载页：`https://developer.microsoft.com/en-us/microsoft-edge/webview2/#download-section`
