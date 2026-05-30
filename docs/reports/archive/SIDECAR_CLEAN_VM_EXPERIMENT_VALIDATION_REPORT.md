# SIDECAR_CLEAN_VM_EXPERIMENT_VALIDATION_REPORT

生成时间：2026-05-24

本轮名称：`SIDECAR_CLEAN_VM_EXPERIMENT_VALIDATION_ROUND`

本轮目标是验证 Windows 离线专业版中的 sidecar FFmpeg 内部实验开关是否能在真实用户环境中运行。当前 Codex 会话没有可操作的干净 Windows 10 / Windows 11 虚拟机，因此本轮完成了安装包、资源、权限、安全和许可证静态核对，并生成 Windows 10/11 VM 实测报告模板。所有 VM 实测项均明确标记为“待测”，不伪造通过结果。

## 1. 测试环境

当前主机仅用于项目文件和安装包检查：

| 项目 | 内容 |
| --- | --- |
| 当前系统 | Microsoft Windows 10 专业版 |
| 版本 | 10.0.19045 |
| 架构 | 64 位 |
| Hyper-V `Get-VM` | 未发现 |
| VirtualBox `VBoxManage` | 未发现 |
| VMware `vmrun` | 未发现 |
| 是否可代表干净 Windows 10 VM | 否 |
| 是否可代表干净 Windows 11 VM | 否 |

## 2. Windows 10 测试结果

状态：未执行，待干净 Windows 10 x64 VM 实测。

原因：

1. 当前没有 Windows 10 干净 VM 快照。
2. 无法确认“断网 + 无 WebView2 Runtime”的真实状态。
3. 无法在当前环境中验证安装向导、首次启动、Windows Defender、资源 DLL 加载和真实桌面 shell 行为。

详情见：

`WINDOWS10_SIDECAR_EXPERIMENT_TEST_REPORT.md`

## 3. Windows 11 测试结果

状态：未执行，待干净 Windows 11 x64 VM 实测。

原因：

1. 当前主机不是 Windows 11。
2. 没有 Windows 11 VM 快照。
3. Windows 11 常见预装 WebView2 Runtime，仍需专门准备“无 WebView2 Runtime”的验证环境。

详情见：

`WINDOWS11_SIDECAR_EXPERIMENT_TEST_REPORT.md`

## 4. EXE 安装结果

安装包存在，但真实安装未在干净 VM 执行。

| 项目 | 内容 |
| --- | --- |
| EXE 路径 | `D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\nsis\万能格式转换器_1.0.0_x64-setup.exe` |
| 文件大小 | 257,570,320 bytes |
| 约合大小 | 245.64 MB |
| SHA256 | `8E00CDE59D7E80D2668709D5D7B7F76DC18161A1EA66F7B005E4A9E7C07815F0` |
| 安装测试 | 待 VM 实测 |

## 5. MSI 安装结果

安装包存在，但真实安装未在干净 VM 执行。

| 项目 | 内容 |
| --- | --- |
| MSI 路径 | `D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\msi\万能格式转换器_1.0.0_x64_zh-CN.msi` |
| 文件大小 | 268,910,592 bytes |
| 约合大小 | 256.45 MB |
| SHA256 | `45AE4CE06E0CB59EF53BD64B70E04AC94707391268C3F4ECC2613E4429DC89BC` |
| 安装测试 | 待 VM 实测 |

## 6. 断网 + 无 WebView2 Runtime 测试结果

状态：待 VM 实测。

配置层面已确认：

```json
{
  "type": "offlineInstaller",
  "silent": true
}
```

必须在 VM 中验证：

1. 目标机器无 WebView2 Runtime。
2. 目标机器完全断网。
3. EXE / MSI 是否能安装。
4. 安装后是否能启动软件。
5. 是否弹出 WebView2 错误。

## 7. WebView2 offlineInstaller 是否生效

配置层面：是。

真实用户环境：待 VM 实测。

说明：Tauri 配置保留 WebView2 offlineInstaller，但最终是否覆盖“断网 + 无 WebView2 Runtime”场景，必须在目标系统中验证。

## 8. sidecar 实验开关是否只在离线专业版显示

静态检查结果：通过。

证据：

1. sidecar 实验面板位于离线专业版工作台参数区域。
2. 在线版不渲染离线专业版工作台。
3. 在线版 `apps/web/public` 和 `apps/web/out` 不包含 `ffmpeg.exe`、`ffprobe.exe` 或 sidecar DLL。

真实安装环境显示效果：待 VM 实测。

## 9. sidecar 默认是否关闭

静态检查结果：通过。

| 项目 | 内容 |
| --- | --- |
| localStorage key | `format-converter.desktop.sidecar-ffmpeg-experiment.v1` |
| 默认状态 | 无值，视为关闭 |
| 开启值 | `enabled` |
| 校验失败处理 | 自动写回 `disabled` |

真实安装环境：待 VM 实测。

## 10. sidecar SHA256 校验是否通过

资源层面已准备：

`apps/desktop/src-tauri/resources/ffmpeg/SHA256SUMS.txt`

release resources 中存在对应文件。

真实安装目录内 SHA256 校验：待 VM 实测。

## 11. ffmpeg.exe / ffprobe.exe / DLL 是否完整

静态检查结果：完整。

已进入 release resources 的关键文件：

1. `bin/ffmpeg.exe`
2. `bin/ffprobe.exe`
3. `bin/avcodec-61.dll`
4. `bin/avdevice-61.dll`
5. `bin/avfilter-10.dll`
6. `bin/avformat-61.dll`
7. `bin/avutil-59.dll`
8. `bin/swresample-5.dll`
9. `bin/swscale-8.dll`

是否在安装后目录中完整存在并可加载：待 VM 实测。

## 12. WAV 转 FLAC sidecar 是否通过

代码路径：已接入。

允许模式：

`convert-wav-to-flac-poc`

当前状态：

| 检查项 | 结果 |
| --- | --- |
| 白名单存在 | 是 |
| 默认是否启用 | 否 |
| 需要用户主动开启 | 是 |
| 真实 VM 转换 | 待测 |

## 13. MP4 转 WebM sidecar 是否通过

代码路径：已接入。

允许模式：

`convert-mp4-to-webm-poc`

当前状态：

| 检查项 | 结果 |
| --- | --- |
| 白名单存在 | 是 |
| 默认是否启用 | 否 |
| 需要用户主动开启 | 是 |
| 真实 VM 转换 | 待测 |

## 14. 中文路径是否通过

代码层面：

1. Rust 使用 `PathBuf`。
2. FFmpeg 调用使用参数数组。
3. 不做 shell 拼接。

真实 Windows 安装环境：待 VM 实测。

建议测试：

`D:\万能格式转换器测试\输入 文件夹\中文音频.wav`

## 15. 带空格路径是否通过

代码层面：

1. 不拼接 shell 字符串。
2. 使用 `Command::new(...).args(&built.args)`。

真实 Windows 安装环境：待 VM 实测。

建议测试：

`D:\万能格式转换器测试\输入 文件夹\带 空格 音频.wav`

## 16. D 盘路径是否通过

配置层面：

`fs.scope` 保留 `D:/**`。

真实 Windows 安装环境：待 VM 实测。

建议测试：

1. D 盘输入目录。
2. D 盘输出目录。
3. D 盘中文路径。
4. D 盘带空格路径。

## 17. MP3 是否没有走 sidecar

静态检查结果：通过。

sidecar 实验阶段只允许 WAV 转 FLAC。MP3 输出不属于 `getSidecarExperimentMode` 白名单，应继续走 FFmpeg WASM 或显示非实验范围提示。

真实队列行为：待 VM 实测。

## 18. AAC/M4A 是否没有走 sidecar

静态检查结果：通过。

AAC/M4A 输出不属于 sidecar 白名单，应继续走 FFmpeg WASM 或显示非实验范围提示。

真实队列行为：待 VM 实测。

## 19. MP4/H.264 是否没有走 sidecar

静态检查结果：通过。

sidecar 仅允许 MP4 输入转 WebM 输出，不把 MP4/H.264 输出作为 sidecar 正式能力。

真实队列行为：待 VM 实测。

## 20. 任务失败后队列是否继续

代码层面：任务按单项状态处理，sidecar 失败会抛出明确错误，不自动吞掉，也不自动二次跑 WASM。

真实队列行为：待 VM 实测。

建议使用损坏视频或损坏音频验证：

1. 失败任务显示原因。
2. 后续任务继续处理。
3. 历史记录保存失败状态。

## 21. 任务历史是否脱敏

代码层面：任务历史记录 backend 标识，并继续使用 sanitized path。

真实安装环境：待 VM 实测。

应验证：

1. 历史中出现 `sidecar` 或 `WASM`。
2. 不记录完整敏感路径。
3. 不记录完整 FFmpeg 命令行。
4. 不记录完整 stderr。

## 22. 是否发现外部请求

静态检查：

1. sidecar Rust 执行本地 `ffmpeg.exe` / `ffprobe.exe`。
2. 没有新增云转换 API。
3. 没有新增文件上传逻辑。
4. 在线版仍使用本地 `/ffmpeg/ffmpeg-core.js` 和 `/ffmpeg/ffmpeg-core.wasm`。
5. 在线版没有 sidecar exe / DLL。

断网真实运行：待 VM 实测。

## 23. 是否发现用户文件上传

静态检查：未发现新增上传路径。

真实运行：待 VM 实测。

必须验证：

1. WAV 转 FLAC 断网可用。
2. MP4 转 WebM 断网可用。
3. 转换过程中没有网络请求。
4. 任务历史、日志、路径、结果文件不上传。

## 24. 是否发现 Windows Defender 误报

状态：待 VM 实测。

建议记录：

1. 安装前扫描 EXE。
2. 安装后扫描安装目录。
3. 首次运行时是否触发 SmartScreen 或 Defender。
4. 是否对 `ffmpeg.exe`、`ffprobe.exe`、DLL 有拦截。

## 25. 是否发现缺 DLL 或无法启动

静态资源层面：未发现缺少主要 shared DLL。

真实安装层面：待 VM 实测。

需要验证：

1. `ffmpeg.exe -version` 能否在安装目录运行。
2. sidecar 开关能否显示“sidecar 可用，当前为实验功能”。
3. WAV 转 FLAC 是否因 DLL 缺失失败。
4. MP4 转 WebM 是否因 DLL 缺失失败。

## 26. 必须修复的问题

当前基于静态检查没有发现新的 P0 代码问题。

但发布前必须补齐：

1. Windows 10 x64 断网 + 无 WebView2 Runtime 实测。
2. Windows 11 x64 断网 + 无 WebView2 Runtime 实测。
3. EXE 和 MSI 分别安装、卸载、重装测试。
4. sidecar WAV 转 FLAC / MP4 转 WebM 真实转换测试。
5. Windows Defender / SmartScreen 行为记录。
6. BtbN 候选 FFmpeg 的人工许可证复核。

## 27. 可以延后的优化

1. 自动化干净 VM 测试流水线。
2. sidecar 更完整的进度解析。
3. 更细的 Tauri 权限动态授权。
4. 长期自建 LGPL FFmpeg。
5. sidecar 默认后端评估。

## 28. 是否可以进入 sidecar 默认后端评估

不建议。

原因：

1. 干净 Windows 10/11 VM 实测尚未完成。
2. sidecar 仍是内部实验开关。
3. BtbN 候选许可证人工复核尚未完成。
4. MP3、AAC/M4A、MP4/H.264 仍不能作为 sidecar 正式能力承诺。

## 29. 是否仍需要 BtbN 候选许可证人工复核

需要。

重点复核：

1. LGPL v3 or later 对商业发布的影响。
2. shared DLL 的分发义务。
3. `libmp3lame`。
4. `libopenh264`。
5. AAC / M4A。
6. 地区专利和平台分发要求。
7. 是否需要提供源代码获取方式、构建参数、许可证文本。

## 30. 是否仍建议长期自建 LGPL FFmpeg

建议。

原因：

1. 自建 LGPL 构建更可控。
2. 可明确排除 `--enable-gpl` 和 `--enable-nonfree`。
3. 可按产品实际功能裁剪编码器和封装格式。
4. 可生成完整构建日志、源码归档、SHA256 和许可证包。
5. 更适合长期商业化发布。

## 31. 本轮生成文件

1. `SIDECAR_CLEAN_VM_PACKAGE_INFO.md`
2. `WINDOWS10_SIDECAR_EXPERIMENT_TEST_REPORT.md`
3. `WINDOWS11_SIDECAR_EXPERIMENT_TEST_REPORT.md`
4. `SIDECAR_EXPERIMENT_SECURITY_LICENSE_RECHECK.md`
5. `SIDECAR_CLEAN_VM_EXPERIMENT_VALIDATION_REPORT.md`

## 32. 总结

当前安装包、资源、权限和文档已具备进入 sidecar 干净 VM 实验验证的条件。由于当前 Codex 环境没有可操作的干净 Windows 10/11 VM，本轮没有执行真实安装和转换实测，所有 VM 项目均保留为待执行。

当前可以做的下一步不是进入 sidecar 默认后端，而是把 EXE/MSI 复制到真实干净 Windows 10/11 VM 中，按本轮两个 VM 报告逐项回填结果。
