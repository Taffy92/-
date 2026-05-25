# 万能格式转换器离线版

桌面端使用 Tauri 打包 `apps/web/out`，生成 Windows 10/11 x64 可安装程序。

构建流程：

1. `pnpm --dir ../web build`
2. `pnpm --filter desktop package`

安装包会内置静态 JS、CSS、PDF.js worker、OCR worker、WASM、语言包、图标和音视频本地转换逻辑等资源。安装后不需要服务器，核心功能可以断网使用。

Windows 安装包使用 Tauri `webviewInstallMode.type = "offlineInstaller"`，会把 WebView2 Runtime 离线安装器嵌入 EXE/MSI。这样在没有网络的 Windows 10/11 x64 电脑上也可以完成安装并使用核心功能。

正式发布前，需要在断网 Windows 10/11 x64 电脑或虚拟机中验证安装流程和所有核心功能。软件内保留“开源许可证”页面，用于展示依赖库的许可证和商业使用保留说明。
