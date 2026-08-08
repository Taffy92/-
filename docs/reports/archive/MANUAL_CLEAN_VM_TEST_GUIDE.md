# MANUAL_CLEAN_VM_TEST_GUIDE

本轮名称：`MANUAL_CLEAN_VM_TEST_EXECUTION_KIT_ROUND`

用途：给人工测试人员在真实干净 Windows 10 / Windows 11 虚拟机中逐项验证“万能格式转换器”离线专业版、WebView2 离线安装、sidecar FFmpeg 内部实验开关和本地处理原则。

本指南只用于人工测试执行。不新增功能，不修改代码，不重新打包，不把 sidecar 设置为默认后端。

## 0. v2.0.0 当前验收补充（2026-08-09）

本节是当前正式发布验收口径，优先于本文后续保留的 v1.0.0、EXE 和 sidecar 历史步骤。v2.0.0 的公开交付物只有 ZIP，ZIP 内只包含 MSI：

- 正式下载页：`https://gszhmrx.cn/download/`
- ZIP：`万能格式转换器_2.0.0_x64_zh-CN.zip`
- ZIP SHA256：`191767A4402244E58EAE44DA4AFBC516EF7458C83B014C7EB7A21158C1CD87EC`
- 验收报告：`verification/reliability-2026/windows-10-acceptance.md` 与 `windows-11-acceptance.md`

Windows 10 x64 和 Windows 11 x64 必须分别使用未安装本项目、Node.js、Rust、pnpm、LibreOffice 开发资源或仓库副本的干净虚拟机。每台 VM 都要从正式站点下载 ZIP、核对 SHA256、断网安装 MSI，并完成真实图片、PDF、Word、Excel、音频、视频、9 文件批量、取消、损坏文件、无写入权限、3 天试用、激活码、`license.mrx` 导入和重启后授权持久化。

报告不得记录用户名、完整路径中的个人信息、机器码、激活码、授权文件内容、Cookie、IP 或虚拟机镜像。没有执行的项目必须写“未执行”；环境不具备时必须写“阻塞”及原因，不能以宿主机、开发机或自动化测试代替干净 VM 通过结论。

## 1. 测试前准备

请准备两台或两个快照：

1. Windows 10 x64 干净虚拟机。
2. Windows 11 x64 干净虚拟机。

每个系统建议至少准备 3 个快照：

1. 有网络，未安装本软件。
2. 断网，未安装本软件。
3. 断网，尽量无 WebView2 Runtime。

如果 Windows 11 镜像默认已有 WebView2 Runtime，不要强行破坏系统。记录为“已有 WebView2 Runtime”，并继续验证安装、启动和 sidecar 功能。

测试前请确认：

1. 虚拟机里不要放真实合同、证件、财务资料或隐私文件。
2. 测试文件必须是专门准备的样例文件。
3. 测试过程保持本地处理，不上传文件。
4. sidecar FFmpeg 只是内部实验功能，默认关闭。
5. MP3、AAC/M4A、MP4/H.264 不作为 sidecar 正式能力测试。

## 2. 需要复制到虚拟机的文件

从主机复制以下文件到虚拟机，例如放到：

`C:\Users\当前用户\Desktop\万能格式转换器测试包`

必须复制：

1. EXE 安装包：
   `D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\nsis\万能格式转换器_1.0.0_x64-setup.exe`
2. MSI 安装包：
   `D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\msi\万能格式转换器_1.0.0_x64_zh-CN.msi`
3. 本测试指南：
   `D:\万能格式转换器项目\docs\reports\archive\MANUAL_CLEAN_VM_TEST_GUIDE.md`
4. 结果回填模板：
   `D:\万能格式转换器项目\release\v1.0.0\verification\MANUAL_CLEAN_VM_TEST_RESULT_TEMPLATE.md`
5. 样例文件：
   准备常见文档、图片、音视频和压缩包样例，复制到 VM 本地目录。

建议复制到 VM 后立即断网，再开始关键离线测试。

## 3. EXE / MSI 路径和 SHA256

### EXE

主机路径：

`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\nsis\万能格式转换器_1.0.0_x64-setup.exe`

文件大小：

`257,570,320 bytes`

SHA256：

`8E00CDE59D7E80D2668709D5D7B7F76DC18161A1EA66F7B005E4A9E7C07815F0`

### MSI

主机路径：

`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\msi\万能格式转换器_1.0.0_x64_zh-CN.msi`

文件大小：

`268,910,592 bytes`

SHA256：

`45AE4CE06E0CB59EF53BD64B70E04AC94707391268C3F4ECC2613E4429DC89BC`

### 在虚拟机里校验 SHA256

打开 PowerShell，执行：

```powershell
Get-FileHash -LiteralPath "C:\Users\当前用户\Desktop\万能格式转换器测试包\万能格式转换器_1.0.0_x64-setup.exe" -Algorithm SHA256
Get-FileHash -LiteralPath "C:\Users\当前用户\Desktop\万能格式转换器测试包\万能格式转换器_1.0.0_x64_zh-CN.msi" -Algorithm SHA256
```

如果 SHA256 不一致，不要继续测试，重新复制安装包。

## 4. 建议测试目录

在虚拟机中创建：

```text
D:\万能格式转换器测试\输入 文件夹
D:\万能格式转换器测试\输出 文件夹
C:\Users\当前用户\Downloads\万能格式转换器测试
C:\Users\当前用户\Desktop\测试 文件夹
```

如果虚拟机没有 D 盘：

1. 给虚拟机添加一个新的虚拟磁盘并格式化为 D 盘；或
2. 在结果模板里记录“无 D 盘，D 盘测试未执行”。

## 5. Windows 10 测试步骤

建议按以下顺序执行：

1. 创建 Windows 10 x64 干净快照。
2. 复制安装包、测试文档和样例文件。
3. 校验 EXE / MSI SHA256。
4. 检查是否已有 WebView2 Runtime。
5. 断开网络。
6. 使用 EXE 安装。
7. 启动软件。
8. 验证 WebView2 offlineInstaller 是否生效。
9. 进入离线专业版工作台。
10. 检查 sidecar 实验开关默认关闭。
11. 开启 sidecar 实验开关。
12. 测试 WAV 转 FLAC。
13. 测试 MP4 转 WebM。
14. 测试中文路径。
15. 测试带空格路径。
16. 测试 D 盘路径。
17. 测试损坏文件失败后队列继续。
18. 测试任务历史脱敏。
19. 测试 MP3 / AAC / M4A / MP4-H264 不走 sidecar。
20. 检查是否有外部请求或文件上传。
21. 记录 Defender / SmartScreen 行为。
22. 卸载。
23. 恢复快照。
24. 使用 MSI 重复测试。

## 6. Windows 11 测试步骤

Windows 11 的步骤与 Windows 10 基本一致，但额外注意：

1. Windows 11 通常已内置 WebView2 Runtime。
2. 如果无法得到“无 WebView2 Runtime”的干净环境，请在模板中记录“已有 WebView2 Runtime”。
3. 仍需在断网状态下安装、启动和执行 sidecar 实验转换。
4. 仍需分别测试 EXE 和 MSI。

建议顺序：

1. 创建 Windows 11 x64 干净快照。
2. 复制测试包。
3. 校验 SHA256。
4. 检查 WebView2 Runtime。
5. 断网。
6. 安装 EXE。
7. 启动软件并进入离线专业版工作台。
8. 测试 sidecar 默认关闭和主动开启。
9. 执行 WAV 转 FLAC、MP4 转 WebM。
10. 执行中文路径、带空格路径、D 盘路径测试。
11. 执行损坏文件、任务历史、外部请求测试。
12. 卸载。
13. 恢复快照。
14. 使用 MSI 重复测试。

## 7. 如何制造断网环境

推荐方式：

1. 在虚拟机设置中断开网络适配器。
2. 或在 Windows 里禁用网络适配器。

Windows 内禁用方式：

1. 打开“控制面板”。
2. 进入“网络和 Internet”。
3. 进入“网络连接”。
4. 右键当前网卡。
5. 点击“禁用”。

PowerShell 方式：

```powershell
Get-NetAdapter
Disable-NetAdapter -Name "以太网" -Confirm:$false
```

恢复网络：

```powershell
Enable-NetAdapter -Name "以太网" -Confirm:$false
```

注意：不同系统网卡名称可能不是“以太网”，请以 `Get-NetAdapter` 输出为准。

断网确认：

```powershell
ping www.baidu.com
ping www.microsoft.com
```

预期：无法访问。

## 8. 如何检查是否已有 WebView2 Runtime

PowerShell 执行：

```powershell
Get-ItemProperty 'HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}' -ErrorAction SilentlyContinue
Get-ItemProperty 'HKCU:\Software\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}' -ErrorAction SilentlyContinue
```

也可以检查：

1. 打开“设置”。
2. 进入“应用”。
3. 搜索 `WebView2`。
4. 查看是否有 `Microsoft Edge WebView2 Runtime`。

记录规则：

1. 如果注册表或应用列表存在 WebView2，记录“已有 WebView2 Runtime”。
2. 如果不存在，记录“无 WebView2 Runtime”。
3. 如果不确定，截图并记录“不确定”。

## 9. 如何安装 EXE

双击：

`万能格式转换器_1.0.0_x64-setup.exe`

检查：

1. 安装界面中文是否正常。
2. 软件名是否为“万能格式转换器”。
3. 发布者是否显示 MR.谢。
4. 安装过程是否需要联网。
5. 是否弹出 WebView2 相关错误。
6. 是否被 Defender / SmartScreen 拦截。

也可以用 PowerShell：

```powershell
Start-Process -FilePath "C:\Users\当前用户\Desktop\万能格式转换器测试包\万能格式转换器_1.0.0_x64-setup.exe" -Wait
```

## 10. 如何安装 MSI

建议在恢复快照后单独测试 MSI，避免 EXE 安装残留影响判断。

双击：

`万能格式转换器_1.0.0_x64_zh-CN.msi`

或 PowerShell：

```powershell
Start-Process msiexec.exe -ArgumentList '/i "C:\Users\当前用户\Desktop\万能格式转换器测试包\万能格式转换器_1.0.0_x64_zh-CN.msi"' -Wait
```

检查项同 EXE。

## 11. 如何验证 WebView2 offlineInstaller 是否生效

关键场景：

1. 断网。
2. 安装前无 WebView2 Runtime。
3. 安装 EXE 或 MSI。
4. 安装后启动软件。

判断标准：

1. 安装过程不要求联网。
2. 启动时不报 WebView2 缺失。
3. 软件窗口正常打开。
4. 能进入离线专业版工作台。

安装后可再次检查 WebView2：

```powershell
Get-ItemProperty 'HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}' -ErrorAction SilentlyContinue
Get-ItemProperty 'HKCU:\Software\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}' -ErrorAction SilentlyContinue
```

如果安装前无 WebView2，安装后可启动，则说明 offlineInstaller 大概率生效。请保留截图。

## 12. 如何打开离线专业版工作台

安装后：

1. 从桌面快捷方式打开“万能格式转换器”。
2. 或从开始菜单搜索“万能格式转换器”。
3. 进入软件后应直接看到离线专业版工作台。

工作台应包含类似区域：

1. 左侧导航。
2. 中间任务队列。
3. 右侧参数面板。
4. 底部状态栏。

如果打开的是网页式首页，记录为问题。

## 13. 如何确认 sidecar 实验开关默认关闭

进入离线专业版后：

1. 打开“设置中心”或右侧参数面板中的“实验功能”区域。
2. 找到“实验功能：使用 sidecar FFmpeg 处理音视频”。
3. 确认开关默认为关闭。
4. 确认说明文字包含：默认仍使用 FFmpeg WASM、仅 WAV 转 FLAC / MP4 转 WebM 会尝试 sidecar、所有文件本地处理。

通过标准：

1. 默认关闭。
2. 未主动开启前，音视频任务仍走 WASM。
3. 在线网页版不显示该开关。

## 14. 如何开启 sidecar 实验开关

在离线专业版中：

1. 点击刷新或检测 sidecar 状态。
2. 如果显示“sidecar 可用，当前为实验功能”，打开开关。
3. 如果显示“sidecar 未配置”或“sidecar 校验失败”，不要继续 sidecar 转换，记录失败原因。

通过标准：

1. 可用时能开启。
2. 校验失败时不能开启。
3. 开启后仍明确提示这是实验功能。

## 15. 如何测试 WAV 转 FLAC

准备文件：

`D:\万能格式转换器测试\输入 文件夹\中文音频.wav`

步骤：

1. 打开离线专业版。
2. 添加 `中文音频.wav`。
3. 选择音频格式转换。
4. 输出格式选择 `FLAC`。
5. 输出目录选择：
   `D:\万能格式转换器测试\输出 文件夹`
6. 开启 sidecar 实验开关。
7. 点击开始处理。
8. 等待任务完成。

通过标准：

1. 任务成功。
2. 结果文件为 `.flac`。
3. 任务行或历史中后端标识为 `sidecar`。
4. 输出目录能打开。
5. 结果文件能打开。
6. 断网状态下可完成。

失败记录：

1. 错误提示全文。
2. 是否缺 DLL。
3. 是否校验失败。
4. 是否输出目录无权限。

## 16. 如何测试 MP4 转 WebM

准备文件：

`D:\万能格式转换器测试\输入 文件夹\中文视频.mp4`

步骤：

1. 添加 `中文视频.mp4`。
2. 选择视频格式转换。
3. 输出格式选择 `WebM`。
4. 输出目录选择 D 盘输出目录。
5. 开启 sidecar 实验开关。
6. 点击开始处理。

通过标准：

1. 任务成功。
2. 结果文件为 `.webm`。
3. 任务行或历史中后端标识为 `sidecar`。
4. 能打开输出目录。
5. 断网状态下完成。

## 17. 如何测试中文路径

使用目录：

`D:\万能格式转换器测试\输入 文件夹`

使用文件：

1. `中文音频.wav`
2. `中文视频.mp4`

通过标准：

1. 文件能导入。
2. 转换能完成。
3. 输出目录能写入。
4. 打开结果文件正常。
5. 任务历史不暴露完整路径。

## 18. 如何测试带空格路径

使用目录：

`D:\万能格式转换器测试\输入 文件夹`

使用文件：

1. `带 空格 音频.wav`
2. `带 空格 视频.mp4`

通过标准同中文路径测试。

如果出现路径错误，重点记录：

1. 软件提示。
2. 文件真实路径。
3. 是否因为空格被截断。

## 19. 如何测试 D 盘路径

输入目录：

`D:\万能格式转换器测试\输入 文件夹`

输出目录：

`D:\万能格式转换器测试\输出 文件夹`

步骤：

1. 添加 D 盘输入文件。
2. 选择 D 盘输出目录。
3. 执行 WAV 转 FLAC。
4. 执行 MP4 转 WebM。
5. 打开输出目录。
6. 打开单个结果文件。

通过标准：

1. D 盘文件能导入。
2. D 盘输出目录能写入。
3. 打开输出目录正常。
4. 打开结果文件正常。

## 20. 如何测试损坏文件失败后队列继续

准备：

1. `损坏音频.wav`
2. `中文音频.wav`
3. `损坏视频.mp4`
4. `中文视频.mp4`

步骤：

1. 同时添加一个损坏文件和一个正常文件。
2. 开始批量处理。
3. 观察损坏文件失败提示。
4. 观察正常文件是否继续处理。

通过标准：

1. 损坏文件状态为失败。
2. 失败原因清楚。
3. 后续正常任务继续执行。
4. 队列不整体中断。
5. 失败记录进入任务历史。

## 21. 如何查看任务历史是否脱敏

步骤：

1. 完成至少一个成功任务。
2. 完成至少一个失败任务。
3. 打开任务历史或结果管理。
4. 查看记录字段。

通过标准：

1. 能看到任务状态。
2. 能看到输出格式。
3. 能看到后端标识：`sidecar` 或 `WASM`。
4. 不显示完整敏感路径。
5. 不显示完整 FFmpeg 命令行。
6. 不显示完整 stderr。

## 22. 如何确认 MP3 / AAC / M4A / MP4-H264 不走 sidecar

在 sidecar 开启状态下分别测试：

1. WAV 转 MP3。
2. WAV 转 AAC。
3. WAV 转 M4A。
4. MP4 转 MP4 / H.264。

通过标准：

1. 这些任务不标记为 `sidecar`。
2. 软件提示“当前不属于 sidecar 实验范围”或继续使用 WASM。
3. 不把这些格式宣传为 sidecar 正式能力。

## 23. 如何确认没有外部请求

最简单验证：

1. 断网。
2. 执行 WAV 转 FLAC。
3. 执行 MP4 转 WebM。
4. 如果任务能完成，说明核心转换不依赖网络。

更严格验证：

1. 打开“资源监视器”。
2. 切换到“网络”。
3. 找到“万能格式转换器”相关进程。
4. 处理文件时观察是否有外部连接。

也可用 PowerShell：

```powershell
Get-NetTCPConnection | Sort-Object OwningProcess | Format-Table -AutoSize
```

通过标准：

1. 转换任务没有外部连接。
2. 没有上传用户文件。
3. 没有上传日志。
4. 没有上传路径。
5. 没有上传转换结果。

注意：如果你主动点击“访问官网”“检查更新”等入口，应单独记录，不计入文件处理流程。

## 24. 如何记录 Windows Defender / SmartScreen 是否拦截

测试时记录：

1. 安装包复制到 VM 后是否被删除或隔离。
2. 双击安装包时是否出现 SmartScreen。
3. 安装过程中是否被 Defender 拦截。
4. 首次启动软件是否被拦截。
5. 进入 sidecar 转换时 `ffmpeg.exe` / `ffprobe.exe` 是否被拦截。

建议截图保存到：

`C:\Users\当前用户\Desktop\万能格式转换器测试截图`

截图命名建议：

1. `windows10-exe-smartscreen.png`
2. `windows10-defender-ffmpeg.png`
3. `windows11-msi-install.png`
4. `windows11-sidecar-status.png`

## 25. 如何卸载

方式一：

1. 打开“设置”。
2. 进入“应用”。
3. 找到“万能格式转换器”。
4. 点击卸载。

方式二：

1. 打开“控制面板”。
2. 进入“程序和功能”。
3. 找到“万能格式转换器”。
4. 卸载。

卸载后检查：

1. 桌面快捷方式是否移除。
2. 开始菜单入口是否移除。
3. 安装目录是否残留。
4. 用户数据和任务历史是否按预期保留或删除。

## 26. 如何重装

建议：

1. 先卸载。
2. 重启 VM。
3. 再安装同一个 EXE 或 MSI。
4. 检查是否复用历史安装目录。
5. 检查是否能正常启动。
6. 检查 sidecar 开关是否仍默认关闭。

如果测试“干净重装”，建议直接恢复快照。

## 27. 如何回填测试报告

打开：

`D:\万能格式转换器项目\release\v1.0.0\verification\MANUAL_CLEAN_VM_TEST_RESULT_TEMPLATE.md`

每次测试建议新增一行：

1. Windows 10 + EXE + 断网 + 无 WebView2。
2. Windows 10 + MSI + 断网 + 无 WebView2。
3. Windows 11 + EXE + 断网 + 无 WebView2 或已有 WebView2。
4. Windows 11 + MSI + 断网 + 无 WebView2 或已有 WebView2。

字段填写规则：

1. 能确认就写“通过”或“失败”。
2. 没有执行就写“未测”。
3. 环境不具备就写“无法执行：原因”。
4. 发现问题时写清楚复现步骤、错误提示、截图路径。
5. 不要把未执行项写成通过。

## 28. 通过门槛

进入下一轮 sidecar 默认后端评估前，至少需要：

1. Windows 10 EXE 断网安装启动通过。
2. Windows 10 MSI 断网安装启动通过。
3. Windows 11 EXE 断网安装启动通过。
4. Windows 11 MSI 断网安装启动通过。
5. WAV 转 FLAC sidecar 通过。
6. MP4 转 WebM sidecar 通过。
7. 中文路径通过。
8. 带空格路径通过。
9. D 盘路径通过。
10. 损坏文件失败后队列继续通过。
11. 外部请求为 0。
12. 无用户文件上传。

如果其中任何 P0 项失败，应先修复，不进入 sidecar 默认后端评估。
