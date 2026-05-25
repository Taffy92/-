# CLEAN_VM_TEST_PACKAGE_INFO

本报告记录 `CLEAN_WINDOWS_VM_RELEASE_VALIDATION_ROUND` 使用的安装包信息。当前步骤仅确认发布包元数据、哈希、WebView2 离线组件和 Tauri 权限摘要；不安装、不修改代码、不扩大权限。

## 安装包

### EXE

| 项目 | 内容 |
| --- | --- |
| 路径 | `D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\nsis\万能格式转换器_1.0.0_x64-setup.exe` |
| 文件大小 | 217,608,869 bytes |
| 文件大小 | 207.53 MB |
| 构建时间 | 2026-05-24 14:20:59 |
| SHA256 | `0699CDAB52533DBE634F71127A82257BC58D28A9B6DEC78EB141BF617317630E` |

### MSI

| 项目 | 内容 |
| --- | --- |
| 路径 | `D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\msi\万能格式转换器_1.0.0_x64_zh-CN.msi` |
| 文件大小 | 216,088,576 bytes |
| 文件大小 | 206.08 MB |
| 构建时间 | 2026-05-24 14:21:22 |
| SHA256 | `7006203336474BDD8FA4A48BA9A8C1F268DD4DECCAB8E8AB22CB30270A4482D9` |

## WebView2 离线组件检查

| 检查项 | 结果 |
| --- | --- |
| `tauri.conf.json` WebView2 策略 | `offlineInstaller` |
| 静默安装 | `true` |
| NSIS 脚本包含 offlineInstaller 标记 | 是 |
| NSIS 脚本包含 `MicrosoftEdgeWebView2RuntimeInstaller.exe` | 是 |
| MSI / WiX 脚本包含 `MicrosoftEdgeWebView2RuntimeInstaller.exe` | 是 |

结论：当前构建产物配置为随安装包携带 Microsoft Edge WebView2 Evergreen Standalone Installer。是否能在“完全断网 + 目标机无 WebView2 Runtime”场景中成功安装和启动，仍必须在干净 Windows 10/11 虚拟机中实测。

## 当前 Tauri 权限摘要

| 权限 | 当前状态 |
| --- | --- |
| `dialog.all` | `false` |
| `dialog.open` / `save` / `message` / `confirm` / `ask` | `true` |
| `fs.all` | `false` |
| `fs.readFile` / `readDir` / `writeFile` / `exists` / `createDir` | `true` |
| `fs.copyFile` | `false` |
| `fs.removeFile` / `removeDir` / `renameFile` | `false` |
| `fs.scope` | `$HOME/**`, `$DESKTOP/**`, `$DOCUMENT/**`, `$DOWNLOAD/**`, `$PICTURE/**`, `$VIDEO/**`, `$AUDIO/**`, `D:/**` |
| `C:/**` | 已移除 |
| `D:/**` | 保留 |
| `path.all` | `true` |
| `shell.all` | `false` |
| `shell.open` | `true` |
| `process.all` / `exit` / `relaunch` | `false` |
| `updater.active` | `false` |

## 应用元数据

| 项目 | 内容 |
| --- | --- |
| 版本号 | `1.0.0` |
| `productName` | 万能格式转换器 |
| 发布者 | MR.谢 |
| 窗口标题 | 万能格式转换器 |
| 简短说明 | 本地处理的图片、文档和音视频格式转换工具 |

## 当前主机环境

当前主机只用于包信息确认，不作为干净 VM 验收结果。

| 项目 | 内容 |
| --- | --- |
| 系统 | Microsoft Windows 10 专业版 |
| 版本 | 10.0.19045 |
| 架构 | 64 位 |
| Hyper-V PowerShell 模块 | 未发现 |
| `Get-VM` 命令 | 未发现 |
| Windows Sandbox | 未启用 |
| VirtualBox CLI | 未发现 |
| VMware CLI | 未发现 |

结论：当前会话没有可操作的干净 Windows 10/11 虚拟机环境，不能真实执行干净 VM 安装、断网和无 WebView2 Runtime 验收。
