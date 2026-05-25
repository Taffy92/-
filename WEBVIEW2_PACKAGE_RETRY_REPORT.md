# WEBVIEW2_PACKAGE_RETRY_REPORT

本轮名称：`WEBVIEW2_PACKAGE_RETRY_AND_UI_DEPLOY_DECISION_ROUND`

生成时间：2026-05-25

## 1. 是否能访问 Microsoft WebView2 offlineInstaller 链接

部分可访问。

检查链接：

```text
https://go.microsoft.com/fwlink/?linkid=2124701
```

使用 `curl.exe -I -L --max-time 45` 检查结果：

- `go.microsoft.com` 返回 `302 Moved Temporarily`；
- 重定向目标为：

```text
https://msedge.sf.dl.delivery.mp.microsoft.com/filestreamingservice/files/f7cb0b3e-1aa1-43fc-af27-ef73fd70d744/MicrosoftEdgeWebView2RuntimeInstallerX64.exe
```

- 最终响应为 `200 OK`；
- `Content-Type: application/octet-stream`；
- `Content-Length: 199272184`。

说明：从构建机通过 `curl.exe` 可以完成 TLS 握手并拿到 WebView2 离线安装器下载响应头。

## 2. 如果失败，失败原因

`pnpm package:desktop` 仍失败。

失败发生在 Tauri bundler 下载 WebView2 offlineInstaller 阶段：

```text
Error failed to bundle project: `https://go.microsoft.com/fwlink/?linkid=2124701: Connection Failed: tls connection init failed: unexpected end of file`
```

结论：

- 链接本身可通过 `curl.exe` 访问；
- Tauri bundler 内部下载器在当前网络 / TLS 环境下仍失败；
- 这不是 UI 代码、下载页、CloudBase 授权、Tauri 权限或 WebView2 配置变更导致的问题。

## 3. 是否修改 Tauri 配置

没有修改。

未修改：

- `apps/desktop/src-tauri/tauri.conf.json`
- `webviewInstallMode`
- Tauri 权限
- WebView2 offlineInstaller 配置

## 4. 是否仍保持 offlineInstaller

是。

当前 `tauri.conf.json` 仍保持：

```json
"webviewInstallMode": {
  "type": "offlineInstaller",
  "silent": true
}
```

本轮没有切回 `downloadBootstrapper`，没有移除 offlineInstaller，也没有降低离线安装能力。

## 5. 是否建议使用本地缓存 WebView2 离线安装器

建议下一轮专项处理，但本轮不修改配置。

本机已发现 Tauri 本地缓存：

```text
C:\Users\Administrator\AppData\Local\tauri\x64\b989c718-2e60-46bb-956d-605d24cf11a6\MicrosoftEdgeWebView2RuntimeInstallerX64.exe
```

- 大小：199,178,960 bytes
- SHA256：`E8464B185B4786F43E9C7357EEA6A0E64F25B1E3BF841E1DB0F7A0E9E8A9D090`

```text
C:\Users\Administrator\AppData\Local\tauri\x64\f7cb0b3e-1aa1-43fc-af27-ef73fd70d744\MicrosoftEdgeWebView2RuntimeInstallerX64.exe
```

- 大小：199,272,184 bytes
- SHA256：`17BF623316D69C4E096365D9AE589316FED446531D7E30EBC3E5ABCAF582E603`

其中 `f7cb...` 目录对应本轮 Microsoft 重定向目标，文件大小与 `curl` 返回的 `Content-Length: 199272184` 一致。

建议：

1. 不要改成在线 bootstrapper；
2. 不要移除 WebView2 offlineInstaller；
3. 下一轮可单独研究 Tauri bundler 是否支持显式复用本地 WebView2 离线安装器，或是否需要清理 / 固化缓存；
4. 如要改配置，必须只围绕“使用可信本地 WebView2 离线安装器”处理，不能降低离线安装能力。

## 6. 是否可以重新打包

当前不建议继续反复重试。

原因：

- `curl.exe` 能访问链接；
- Tauri bundler 仍失败在 TLS 初始化；
- 连续重试会重复消耗时间，但无法保证成功；
- 本轮限制要求不随意修改 WebView2 配置，因此不能通过切换模式绕过。

建议在下一轮明确选择一种处理方式：

1. 等当前网络 / TLS 环境稳定后再执行 `pnpm package:desktop`；
2. 或开展 WebView2 本地缓存 / 本地离线安装器路径专项；
3. 完整成功生成 EXE 和 MSI 后，再进入安装包上传步骤。

