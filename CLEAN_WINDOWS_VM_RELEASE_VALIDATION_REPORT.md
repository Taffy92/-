# CLEAN_WINDOWS_VM_RELEASE_VALIDATION_REPORT

本轮名称：`CLEAN_WINDOWS_VM_RELEASE_VALIDATION_ROUND`

本轮目标是正式发布前的干净 Windows 10 / Windows 11 虚拟机安装与运行验收。当前 Codex 会话没有可操作的干净 VM 环境，因此本报告不会伪造通过结果；已完成安装包信息、WebView2 离线配置、Tauri 权限和当前主机能力检查，并生成 VM 实测报告模板。

## 1. 测试环境

当前主机只作为项目检查环境，不作为干净 VM 验收结果。

| 项目 | 内容 |
| --- | --- |
| 当前系统 | Microsoft Windows 10 专业版 |
| 版本 | 10.0.19045 |
| 架构 | 64 位 |
| Hyper-V PowerShell 模块 | 未发现 |
| `Get-VM` 命令 | 未发现 |
| Windows Sandbox | 未启用 |
| VirtualBox CLI | 未发现 |
| VMware CLI | 未发现 |

结论：当前会话无法执行干净 Windows 10/11 VM 安装测试。

## 2. Windows 10 测试结果

状态：未执行，待干净 Windows 10 x64 VM 实测。

原因：当前主机不是干净 VM，没有可操作的 Windows 10 VM 快照，也无法确认“无 WebView2 Runtime”的干净状态。

详情见：

`WINDOWS10_CLEAN_VM_TEST_REPORT.md`

## 3. Windows 11 测试结果

状态：未执行，待干净 Windows 11 x64 VM 实测。

原因：当前主机不是 Windows 11，也没有可操作的 Windows 11 VM 快照。

详情见：

`WINDOWS11_CLEAN_VM_TEST_REPORT.md`

## 4. EXE 安装结果

状态：待干净 VM 实测。

当前已确认 EXE 文件存在：

`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\nsis\万能格式转换器_1.0.0_x64-setup.exe`

大小：207.53 MB  
SHA256：`0699CDAB52533DBE634F71127A82257BC58D28A9B6DEC78EB141BF617317630E`

## 5. MSI 安装结果

状态：待干净 VM 实测。

当前已确认 MSI 文件存在：

`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\msi\万能格式转换器_1.0.0_x64_zh-CN.msi`

大小：206.08 MB  
SHA256：`7006203336474BDD8FA4A48BA9A8C1F268DD4DECCAB8E8AB22CB30270A4482D9`

## 6. 断网 + 无 WebView2 测试结果

状态：待干净 VM 实测。

当前只能确认配置和打包脚本：

1. `tauri.conf.json` 使用 `webviewInstallMode.type=offlineInstaller`。
2. NSIS 脚本包含 `offlineInstaller` 标记。
3. NSIS 和 MSI/WiX 产物脚本均包含 `MicrosoftEdgeWebView2RuntimeInstaller.exe`。

## 7. WebView2 offlineInstaller 是否生效

配置层面：是。  
真实安装层面：待干净 VM 实测。

必须在目标机“断网 + 无 WebView2 Runtime”状态下验证安装和启动。

## 8. 中文显示是否正常

配置层面已确认：

1. `productName`：万能格式转换器
2. `publisher`：MR.谢
3. `windows.title`：万能格式转换器

真实安装界面、开始菜单、系统应用列表、窗口标题：待干净 VM 实测。

## 9. 安装目录是否正常

状态：待干净 VM 实测。

需要分别验证：

1. EXE 普通安装。
2. MSI 普通安装。
3. 静默安装。
4. 卸载后重装是否复用历史安装目录。

## 10. 卸载和重装是否正常

状态：待干净 VM 实测。

建议 EXE 和 MSI 分开快照测试，避免注册表和安装目录互相污染。

## 11. D 盘路径是否正常

状态：待干净 VM 实测。

当前 Tauri 权限保留 `D:/**`，设计上支持 D 盘导入和输出。必须实测：

1. `D:\万能格式转换器测试\输入 文件夹`
2. `D:\万能格式转换器测试\输出 文件夹`

## 12. C 盘用户目录是否正常

状态：待干净 VM 实测。

当前 Tauri 权限保留：

1. `$HOME/**`
2. `$DESKTOP/**`
3. `$DOCUMENT/**`
4. `$DOWNLOAD/**`

预期 C 盘用户目录可用，但仍需 VM 实测。

## 13. C 盘非用户目录限制表现

状态：待干净 VM 实测。

当前已移除 `C:/**`。预期 C 盘非用户目录可能被 Tauri scope 限制。必须验证限制时是否有合理错误提示，避免用户误以为文件损坏。

## 14. 中文路径是否正常

状态：待干净 VM 实测。

建议使用：

1. `D:\万能格式转换器测试\输入 文件夹`
2. `D:\万能格式转换器测试\输出 文件夹`
3. `C:\Users\当前用户\Desktop\测试 文件夹`

## 15. 带空格路径是否正常

状态：待干净 VM 实测。

建议使用目录名和文件名都带空格的样例，例如 `输入 文件夹`、`输出 文件夹`、`图片 一.jpg`。

## 16. 输出目录写入是否正常

状态：待干净 VM 实测。

需要验证：

1. D 盘输出目录写入。
2. Downloads 输出目录写入。
3. Desktop 输出目录写入。
4. 不存在或无权限目录的错误提示。

## 17. 打开输出目录是否正常

状态：待干净 VM 实测。

当前保留 `shell.open=true`，但真实 Windows shell 行为必须在安装版中验证。

## 18. 打开单个结果文件是否正常

状态：待干净 VM 实测。

需要验证中文路径、带空格路径和 D 盘路径下的结果文件。

## 19. 导出处理日志是否正常

状态：待干净 VM 实测。

要求：

1. 日志可导出。
2. 日志不上传。
3. 日志不包含完整敏感路径。
4. 失败任务原因清楚。

## 20. 批量任务是否正常

状态：待干净 VM 实测。

必须验证：

1. 图片批量压缩。
2. Word 批量转图片。
3. Excel 批量转图片。
4. 音频批量转换。
5. 视频批量转换。
6. 视频提取音频。
7. 失败任务重试。
8. 取消任务。
9. 清空已完成任务。

## 21. 任务历史是否正常

状态：待干净 VM 实测。

要求：

1. 成功/失败/取消任务写入历史。
2. 最多保留最近 100 条。
3. 关闭重开仍保留。
4. 清空历史可用。
5. 历史记录路径脱敏。

## 22. 是否发现联网请求

当前主机静态冒烟：未发现外部请求。  
干净 VM 断网验收：待执行。

必须在 VM 中验证：

1. 图片处理不联网。
2. 文档处理不联网。
3. 音频处理不联网。
4. 视频处理不联网。
5. WebView2 安装不联网。
6. FFmpeg wasm 不联网。
7. 图片压缩 worker 不联网。

## 23. 是否发现隐私风险

当前配置未发现新增隐私风险。

仍需 VM 验证：

1. CloudBase 只用于下载授权，不接触用户文件。
2. 广告不接收 File、Blob、ArrayBuffer、Canvas 或转换结果。
3. 任务历史和处理日志不上传。
4. 输出目录路径不上传。

## 24. 必须修复的问题

当前没有基于干净 VM 实测发现的新 P0，因为干净 VM 尚未执行。

发布前必须完成：

1. Windows 10 x64 断网 + 无 WebView2 Runtime EXE 安装测试。
2. Windows 10 x64 断网 + 无 WebView2 Runtime MSI 安装测试。
3. Windows 11 x64 EXE/MSI 安装、卸载、重装测试。
4. D 盘、C 盘用户目录、中文路径、带空格路径和输出目录写入测试。
5. 断网音视频、Word、Excel、图片批量处理测试。

## 25. 可以延后的问题

1. C 盘非用户目录完全支持可以延后；当前权限收窄后预期受限。
2. 更严格移除 `D:/**` 可以延后到 Tauri v2 动态授权或应用商店审核专项。
3. 更完整的自动化 VM 测试框架可以延后。

## 26. 是否可以进入 FFmpeg / GPL / sidecar 发布策略专项

可以进入“评估专项”，但不建议跳过干净 VM 验收直接正式发布。

原因：

1. 当前第三方 Notices 已存在。
2. FFmpeg / GPL / sidecar 是发布合规重点。
3. 但离线安装能否在无 WebView2 Runtime 机器上跑通，仍是发布前硬门槛。

## 27. 是否可以进入最终发布包整理

暂不建议进入最终发布包整理。

进入条件：

1. Windows 10 干净 VM 验收通过。
2. Windows 11 干净 VM 验收通过。
3. 断网 + 无 WebView2 Runtime 安装启动通过。
4. EXE/MSI 卸载和重装通过。
5. 离线批量核心功能通过。
6. 网络隐私检查通过。

## 本轮生成文件

1. `CLEAN_VM_TEST_PACKAGE_INFO.md`
2. `WINDOWS10_CLEAN_VM_TEST_REPORT.md`
3. `WINDOWS11_CLEAN_VM_TEST_REPORT.md`
4. `CLEAN_VM_OFFLINE_FUNCTION_TEST_REPORT.md`
5. `CLEAN_VM_PRIVACY_NETWORK_TEST_REPORT.md`
6. `CLEAN_WINDOWS_VM_RELEASE_VALIDATION_REPORT.md`
