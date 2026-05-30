# WINDOWS10_SIDECAR_EXPERIMENT_TEST_REPORT

生成时间：2026-05-24

本报告用于记录 `SIDECAR_CLEAN_VM_EXPERIMENT_VALIDATION_ROUND` 的 Windows 10 x64 干净虚拟机实测。当前 Codex 会话没有可操作的干净 Windows 10 VM、没有 VM 快照，也无法构造“断网 + 无 WebView2 Runtime”的真实目标环境。因此本报告只记录待执行测试项和当前状态，不伪造通过结果。

## 1. 测试状态

| 项目 | 结果 |
| --- | --- |
| Windows 10 干净 VM 是否可用 | 否 |
| 是否已执行 EXE 安装 | 否 |
| 是否已执行 MSI 安装 | 否 |
| 是否已验证断网 | 否 |
| 是否已验证无 WebView2 Runtime | 否 |
| 是否已验证 sidecar 实验转换 | 否 |
| 当前结论 | 待人工 VM 实测 |

当前主机信息仅供参考，不作为干净 VM 结论：

| 项目 | 内容 |
| --- | --- |
| 当前主机系统 | Microsoft Windows 10 专业版 |
| 版本 | 10.0.19045 |
| 架构 | 64 位 |
| Hyper-V PowerShell | 未发现 |
| `Get-VM` | 未发现 |
| `VBoxManage` | 未发现 |
| `vmrun` | 未发现 |

## 2. 应使用的安装包

EXE：

`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\nsis\万能格式转换器_1.0.0_x64-setup.exe`

SHA256：

`8E00CDE59D7E80D2668709D5D7B7F76DC18161A1EA66F7B005E4A9E7C07815F0`

MSI：

`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\msi\万能格式转换器_1.0.0_x64_zh-CN.msi`

SHA256：

`45AE4CE06E0CB59EF53BD64B70E04AC94707391268C3F4ECC2613E4429DC89BC`

## 3. Windows 10 x64 断网 + 无 WebView2 Runtime 测试项

| 序号 | 测试项 | 结果 | 备注 |
| --- | --- | --- | --- |
| 1 | 断网 | 待测 | 建议禁用虚拟网卡或设置 VM 无网络 |
| 2 | 无 WebView2 Runtime | 待测 | 安装前检查注册表和程序列表 |
| 3 | 安装 EXE | 待测 | 使用上方 EXE |
| 4 | 安装 MSI | 待测 | 建议单独快照测试，避免互相污染 |
| 5 | 启动软件 | 待测 | 检查是否弹 WebView2 错误 |
| 6 | WebView2 offlineInstaller 生效 | 待测 | 断网无 WebView2 时最关键 |
| 7 | 打开离线专业版工作台 | 待测 | 应直接进入专业工作台 |
| 8 | sidecar 实验开关存在 | 待测 | 只应在离线专业版显示 |
| 9 | sidecar 默认关闭 | 待测 | 未开启前仍走 WASM |
| 10 | 开启 sidecar 实验开关 | 待测 | 应显示可用或明确失败原因 |
| 11 | WAV 转 FLAC | 待测 | 允许走 sidecar |
| 12 | MP4 转 WebM | 待测 | 允许走 sidecar |
| 13 | 中文路径 | 待测 | 例如 `D:\万能格式转换器测试\输入 文件夹\中文音频.wav` |
| 14 | 带空格路径 | 待测 | 目录和文件名均带空格 |
| 15 | D 盘路径 | 待测 | 输入和输出均在 D 盘 |
| 16 | 任务失败后队列继续 | 待测 | 使用损坏媒体文件触发失败 |
| 17 | 任务历史脱敏路径和后端标识 | 待测 | 历史应记录 `sidecar` / `WASM`，路径不完整暴露 |
| 18 | MP3 输出不走 sidecar | 待测 | 应继续 WASM 或提示非实验范围 |
| 19 | AAC/M4A 输出不走 sidecar | 待测 | 应继续 WASM 或提示非实验范围 |
| 20 | MP4/H.264 输出不走 sidecar | 待测 | 不作为 sidecar 正式能力 |
| 21 | 外部请求为 0 | 待测 | 可用系统网络监控或断网验证 |
| 22 | 无用户文件上传 | 待测 | 断网下应不影响本地转换 |

## 4. 建议样例目录

在 VM 中创建：

```text
D:\万能格式转换器测试\输入 文件夹
D:\万能格式转换器测试\输出 文件夹
C:\Users\当前用户\Downloads\万能格式转换器测试
C:\Users\当前用户\Desktop\测试 文件夹
```

建议样例文件：

1. `中文音频.wav`
2. `带 空格 音频.wav`
3. `中文视频.mp4`
4. `带 空格 视频.mp4`
5. `损坏视频.mp4`
6. `损坏音频.wav`

## 5. 通过标准

Windows 10 x64 通过标准：

1. EXE 和 MSI 至少各在独立快照中成功安装一次。
2. 断网 + 无 WebView2 Runtime 时可以安装并启动。
3. sidecar 实验开关默认关闭。
4. 用户开启后，SHA256 校验通过并显示 sidecar 可用，或给出明确失败原因。
5. WAV 转 FLAC 和 MP4 转 WebM 在中文路径、带空格路径、D 盘路径下可用。
6. MP3、AAC/M4A、MP4/H.264 不走 sidecar。
7. 任务失败后队列继续。
8. 外部请求为 0。
9. 未发现用户文件上传。

## 6. 当前结论

状态：未执行。

原因：当前 Codex 环境没有可操作的干净 Windows 10 x64 VM。本报告应交给人工或自动化 VM 测试流程执行并回填结果。
