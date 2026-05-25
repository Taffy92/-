# 万能格式转换器 v1.0.0 安装指南

## 支持系统

1. Windows 10 x64。
2. Windows 11 x64。

不建议在 32 位 Windows 或过旧系统中安装。

## 安装包

发布目录提供两种安装包：

1. `万能格式转换器_1.0.0_x64-setup.exe`
2. `万能格式转换器_1.0.0_x64_zh-CN.msi`

普通用户优先使用 EXE 安装包。需要企业分发、脚本部署或系统管理工具时，可使用 MSI。

## EXE 安装方式

1. 双击 `万能格式转换器_1.0.0_x64-setup.exe`。
2. 按安装向导提示继续。
3. 安装完成后，从桌面快捷方式或开始菜单启动。

## MSI 安装方式

1. 双击 `万能格式转换器_1.0.0_x64_zh-CN.msi`。
2. 按 Windows Installer 向导继续。
3. 安装完成后，从开始菜单或安装目录启动。

## 断网安装说明

本版本已将 WebView2 Evergreen Standalone Installer 打入安装包。目标电脑没有 WebView2 Runtime 且完全断网时，安装包会使用本地内置安装器安装运行环境，不需要联网下载 WebView2。

如果电脑已经安装 WebView2 Runtime，安装器会跳过该步骤。

## Defender / SmartScreen 提示

如果安装包未做代码签名，Windows Defender 或 SmartScreen 可能提示“未知发布者”或需要更多确认。这不代表一定有风险，但正式对外发布前建议购买并配置代码签名证书。

用户可以通过 SHA256 校验确认文件是否与官方发布包一致。

## 校验 SHA256

在 PowerShell 中执行：

```powershell
Get-FileHash -Algorithm SHA256 "D:\路径\万能格式转换器_1.0.0_x64-setup.exe"
Get-FileHash -Algorithm SHA256 "D:\路径\万能格式转换器_1.0.0_x64_zh-CN.msi"
```

校验值应与 `installers/SHA256SUMS.txt` 中记录一致。

## 卸载

1. 打开 Windows 设置。
2. 进入“应用”或“已安装的应用”。
3. 找到“万能格式转换器”。
4. 点击卸载。

也可以从控制面板的“程序和功能”中卸载。

## 重装

1. 先卸载旧版本。
2. 重新运行 EXE 或 MSI 安装包。
3. 如遇到历史安装目录被复用，请在安装向导中手动确认安装路径。

## 常见问题

### 安装后打不开

请确认：

1. 系统为 Windows 10/11 x64。
2. 安装过程未被杀毒软件中断。
3. WebView2 Runtime 安装没有失败。

### 断网安装失败

请确认安装包完整，优先用 SHA256 校验。如果安装包被拦截或被安全软件隔离，请先恢复文件后重试。

### SmartScreen 拦截

未签名安装包可能触发 SmartScreen。正式发布前建议完成代码签名。测试环境可点击“更多信息”后继续安装。
