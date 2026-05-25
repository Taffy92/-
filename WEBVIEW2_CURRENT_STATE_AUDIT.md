# WEBVIEW2_CURRENT_STATE_AUDIT

生成时间：2026-05-24

本轮名称：`WEBVIEW2_OFFLINE_INSTALLER_ROUND`

## 审查对象

- `apps/desktop/src-tauri/tauri.conf.json`
- `apps/desktop/src-tauri/target/release/nsis/x64/installer.nsi`
- `apps/desktop/src-tauri/target/release/wix/x64/main.wxs`
- 当前 EXE / MSI 安装包
- Tauri v1 官方 Windows installer 文档
- Microsoft WebView2 Runtime 官方分发文档

## 当前策略

当前 `tauri.conf.json` 没有显式配置：

```json
"webviewInstallMode": {
  "type": "offlineInstaller"
}
```

因此 Tauri 采用默认策略：`downloadBootstrapper`。

生成的 NSIS 脚本中可以直接看到：

```nsi
!define INSTALLWEBVIEW2MODE "downloadBootstrapper"
NSISdl::download "https://go.microsoft.com/fwlink/p/?LinkId=2124703" "$TEMP\MicrosoftEdgeWebview2Setup.exe"
```

生成的 MSI / WiX 脚本中可以直接看到：

```xml
<CustomAction Id='DownloadAndInvokeBootstrapper' ... Invoke-WebRequest -Uri "https://go.microsoft.com/fwlink/p/?LinkId=2124703" ... />
```

## 当前风险

1. 如果目标机器已经安装 WebView2 Runtime，安装器会跳过 WebView2 安装，程序可以启动。
2. 如果目标机器没有 WebView2 Runtime，当前 EXE / MSI 会尝试从 Microsoft 下载 bootstrapper。
3. 如果目标机器完全断网且没有 WebView2 Runtime，当前安装流程会失败，或者安装完成后程序无法正常创建 WebView2 窗口。
4. 当前安装包大小约 15 MB，不包含 WebView2 Evergreen Standalone Installer，也不包含 Fixed Version Runtime。
5. `apps/desktop/README.md` 中曾写到 `offlineInstaller`，但实际生成产物与 README 不一致，需要修正配置和最终报告。

## 是否适合完全离线安装

不适合。

当前策略适合“目标机器有网络，或者已预装 WebView2”的环境，不满足“完全断网、目标机器没有 WebView2 Runtime”的安装要求。

## 目标机器没有 WebView2 时会发生什么

- 有网络：安装器下载 WebView2 bootstrapper，然后安装 Evergreen Runtime。
- 无网络：下载失败，安装器会中止或 WebView2 Runtime 缺失，离线专业版无法启动 WebView2 窗口。

## 需要修改的配置

需要在 `apps/desktop/src-tauri/tauri.conf.json` 的：

```json
tauri.bundle.windows
```

下增加：

```json
"webviewInstallMode": {
  "type": "offlineInstaller",
  "silent": true
}
```

该配置由 Tauri v1 支持，会把 Microsoft Edge WebView2 Evergreen Standalone Installer 嵌入 Windows 安装包。安装时会先检测注册表中是否已经存在 WebView2 Runtime；如果已存在则跳过，如果不存在则运行本地嵌入的离线安装器。

## 依据

- Tauri v1 文档说明：默认 `downloadBootstrapper` 需要联网；`offlineInstaller` 不需要联网，会增加约 127 MB 安装包大小。
- Microsoft WebView2 文档说明：离线部署应下载 Evergreen Standalone Installer，并包含到应用安装器或更新器中；安装前应检测 Runtime 是否已存在，缺失时运行 Standalone Installer。

参考链接：

- `https://v1.tauri.app/v1/guides/building/windows/`
- `https://v1.tauri.app/v1/api/config`
- `https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/distribution`
- `https://developer.microsoft.com/en-us/microsoft-edge/webview2/#download-section`
