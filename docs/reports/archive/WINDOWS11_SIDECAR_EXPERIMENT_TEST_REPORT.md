# WINDOWS11_SIDECAR_EXPERIMENT_TEST_REPORT

生成时间：2026-05-24

本报告用于记录 `SIDECAR_CLEAN_VM_EXPERIMENT_VALIDATION_ROUND` 的 Windows 11 x64 干净虚拟机实测。当前 Codex 会话没有可操作的 Windows 11 VM，因此本报告只记录待执行测试项和当前状态，不伪造通过结果。

## 1. 测试状态

| 项目 | 结果 |
| --- | --- |
| Windows 11 干净 VM 是否可用 | 否 |
| 是否已执行 EXE 安装 | 否 |
| 是否已执行 MSI 安装 | 否 |
| 是否已验证断网 | 否 |
| 是否已验证无 WebView2 Runtime | 否 |
| 是否已验证 sidecar 实验转换 | 否 |
| 当前结论 | 待人工 VM 实测 |

当前主机不是 Windows 11，因此不能代替 Windows 11 验收。

## 2. 应使用的安装包

EXE：

`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\nsis\万能格式转换器_1.0.0_x64-setup.exe`

SHA256：

`8E00CDE59D7E80D2668709D5D7B7F76DC18161A1EA66F7B005E4A9E7C07815F0`

MSI：

`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\msi\万能格式转换器_1.0.0_x64_zh-CN.msi`

SHA256：

`45AE4CE06E0CB59EF53BD64B70E04AC94707391268C3F4ECC2613E4429DC89BC`

## 3. Windows 11 x64 测试项

| 序号 | 测试项 | 结果 | 备注 |
| --- | --- | --- | --- |
| 1 | 断网 | 待测 | 建议禁用 VM 网络适配器 |
| 2 | 无 WebView2 Runtime | 待测 | Windows 11 常见预装 WebView2，需要特殊干净镜像或卸载后快照 |
| 3 | 安装 EXE | 待测 | 使用上方 EXE |
| 4 | 安装 MSI | 待测 | 建议独立快照测试 |
| 5 | 启动软件 | 待测 | 检查是否弹 WebView2 错误 |
| 6 | WebView2 offlineInstaller 生效 | 待测 | 若已内置 Runtime，则记录为“已有 WebView2，跳过安装” |
| 7 | 打开离线专业版工作台 | 待测 | 不应显示网页首页式界面 |
| 8 | sidecar 实验开关存在 | 待测 | 只在离线专业版显示 |
| 9 | sidecar 默认关闭 | 待测 | 默认仍使用 WASM |
| 10 | 开启 sidecar 实验开关 | 待测 | 应显示可用或明确失败原因 |
| 11 | WAV 转 FLAC | 待测 | sidecar 实验允许 |
| 12 | MP4 转 WebM | 待测 | sidecar 实验允许 |
| 13 | 中文路径 | 待测 | 输入、输出、文件名均应测试 |
| 14 | 带空格路径 | 待测 | 输入、输出、文件名均应测试 |
| 15 | D 盘路径 | 待测 | Windows 11 VM 需挂载或创建 D 盘 |
| 16 | 任务失败后队列继续 | 待测 | 使用损坏文件验证 |
| 17 | 任务历史脱敏路径和后端标识 | 待测 | 应显示 `sidecar` / `WASM` |
| 18 | MP3 输出不走 sidecar | 待测 | 不作为 sidecar 正式能力 |
| 19 | AAC/M4A 输出不走 sidecar | 待测 | 不作为 sidecar 正式能力 |
| 20 | MP4/H.264 输出不走 sidecar | 待测 | 不作为 sidecar 正式能力 |
| 21 | 外部请求为 0 | 待测 | 断网验证 + 网络监控 |
| 22 | 无用户文件上传 | 待测 | 断网下应不影响本地转换 |

## 4. 建议样例目录

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

## 5. Windows 11 特别注意

1. Windows 11 很多版本默认已有 WebView2 Runtime，若要测试“无 WebView2 Runtime”，需要准备特殊干净镜像或卸载后创建快照。
2. 若系统已有 WebView2，仍需记录安装包是否跳过重复安装，启动是否正常。
3. 若断网情况下缺 WebView2 仍能启动，才能说明 offlineInstaller 对目标场景有效。

## 6. 当前结论

状态：未执行。

原因：当前 Codex 环境没有可操作的 Windows 11 x64 VM。本报告应交给人工或自动化 VM 测试流程执行并回填结果。
