# 万能格式转换器离线版

桌面端使用 Tauri 打包 `apps/web/out`，生成 Windows 10/11 x64 可安装程序。

构建流程在仓库根目录执行：

1. `npm run package:desktop`
2. 如需继续部署在线站点，重新执行 `npm run build:web`，确保 `apps/web/out` 恢复为在线版产物。

安装包会内置静态 JS、CSS、PDF.js worker、FFmpeg WASM、图标和音视频本地转换逻辑等资源。安装后不需要服务器，核心功能可以断网使用。

Windows 安装包使用 Tauri `webviewInstallMode.type = "offlineInstaller"`，会把 WebView2 Runtime 离线安装器嵌入 EXE/MSI。这样在没有网络的 Windows 10/11 x64 电脑上也可以完成安装并使用核心功能。

离线版启动后进入白色桌面工作台：顶部选择当前工具和参数，中部把文件选择与预览合并为同一区域，右侧显示本地内核、进度和输出状态，不再单独显示下方任务列表。选择多个文件时平铺缩略图，PDF、Word、Excel 使用第一页预览。批量导入跟随当前转换工具，不作为单独页面维护。

桌面批量结果按次写入独立时间戳文件夹；PDF、Word、Excel 多页结果写入同名子文件夹。不得把图片压缩或其他批量结果重新汇总为 ZIP/7Z。

商业授权为本地 3 天试用 + 机器码绑定激活码或 `license.mrx` 授权文件。桌面端只内置公钥校验授权签名，私钥和客户记录只保留在管理员本地。详细流程见 `../../docs/offline-license.md`。

Windows SmartScreen 提示需要通过代码签名证书和长期信誉解决，不能靠安装包 UI 直接消除。说明见 `../../docs/windows-smartscreen-signing.md`。

正式发布前，需要在断网 Windows 10/11 x64 电脑或虚拟机中验证安装流程和所有核心功能。软件内保留“开源许可证”页面，用于展示依赖库的许可证和商业使用保留说明。
