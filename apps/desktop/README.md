# 万能格式转换器离线版

桌面端使用 Tauri 打包 `apps/web/out`，生成 Windows 10/11 x64 可安装程序。

构建流程在仓库根目录执行：

1. `npm run package:desktop`
2. 如需继续部署在线站点，重新执行 `npm run build:web`，确保 `apps/web/out` 恢复为在线版产物。

安装包会内置静态 JS、CSS、PDF.js worker、OCR worker、WASM、语言包、图标和音视频本地转换逻辑等资源。安装后不需要服务器，核心功能可以断网使用。

Windows 安装包使用 Tauri `webviewInstallMode.type = "offlineInstaller"`，会把 WebView2 Runtime 离线安装器嵌入 EXE/MSI。这样在没有网络的 Windows 10/11 x64 电脑上也可以完成安装并使用核心功能。

离线版启动后进入专业工具箱界面：左侧按图片、文档、音视频分组，中央显示上传入口和任务队列，右侧显示当前工具参数。批量导入跟随当前转换工具，不作为单独页面维护。

正式发布前，需要在断网 Windows 10/11 x64 电脑或虚拟机中验证安装流程和所有核心功能。软件内保留“开源许可证”页面，用于展示依赖库的许可证和商业使用保留说明。
