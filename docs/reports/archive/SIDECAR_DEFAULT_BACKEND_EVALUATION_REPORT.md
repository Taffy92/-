# SIDECAR_DEFAULT_BACKEND_EVALUATION_REPORT

生成时间：2026-05-25

本轮名称：`SIDECAR_DEFAULT_BACKEND_EVALUATION_ROUND`

本报告根据用户人工回填的干净 Windows 10 / Windows 11 VM 测试结果，评估 sidecar FFmpeg 是否可以从“内部实验开关”进入“离线专业版低风险格式优先后端”。本轮只做评估和方案设计，不修改代码，不重新打包，不改变在线版，不扩大 Tauri 权限。

## 1. 当前 sidecar 实验验证结论

当前 sidecar FFmpeg 已完成从“POC 框架”到“离线专业版内部实验开关”的验证闭环：

1. sidecar 资源已进入离线专业版安装包资源目录。
2. `ffmpeg.exe`、`ffprobe.exe` 和 shared build DLL 已随安装包资源存在。
3. sidecar 开关默认关闭。
4. sidecar 只在离线专业版显示。
5. 在线版继续使用 FFmpeg WASM。
6. 离线专业版默认仍使用 FFmpeg WASM。
7. Rust 侧不接受任意命令、不接受任意 args、不调用 `cmd.exe` / `powershell.exe`。
8. sidecar 只通过白名单模式执行。
9. 用户已在干净 Windows 10 / Windows 11 VM 中确认关键功能通过。

结论：sidecar 已具备进入“低风险格式优先后端”的评估条件，但不具备直接成为全量音视频默认后端的条件。

## 2. 用户人工 VM 测试通过项

用户已确认通过：

1. Windows 10 EXE 断网安装启动通过。
2. Windows 10 MSI 断网安装启动通过。
3. Windows 11 EXE 断网安装启动通过。
4. Windows 11 MSI 断网安装启动通过。
5. WAV 转 FLAC sidecar 通过。
6. MP4 转 WebM sidecar 通过。
7. 中文路径通过。
8. 带空格路径通过。
9. D 盘路径通过。
10. 损坏文件失败后队列继续。
11. 外部请求为 0。
12. 无用户文件上传。

这些结果覆盖了发布前最关键的功能可用性、离线安装、路径兼容、本地处理和网络隔离风险。

## 3. 仍缺少的归档材料

以下资料仍建议正式发布归档前补齐，但不阻塞本轮进入下一阶段评估：

1. Windows 10 具体版本号和构建号。
2. Windows 11 具体版本号和构建号。
3. WebView2 Runtime 检查截图。
4. EXE / MSI SHA256 校验截图。
5. Defender 是否误报的截图或文字记录。
6. SmartScreen 是否拦截的截图或文字记录。
7. sidecar 开关默认关闭截图。
8. sidecar 开启后状态截图。
9. WAV 转 FLAC 输出结果截图。
10. MP4 转 WebM 输出结果截图。
11. 任务历史脱敏截图。

建议：进入默认后端实施前，至少补齐 Defender / SmartScreen / sidecar 状态截图，便于正式发布包归档。

## 4. 是否存在 P0 / P1 阻塞问题

根据用户回填结果，当前没有用户报告的 P0 / P1 阻塞问题。

已覆盖的 P0 风险：

1. 安装包断网安装启动失败：已通过。
2. WebView2 离线安装失效导致无法启动：未报告失败。
3. sidecar 缺 DLL 或无法运行：未报告失败。
4. 文件上传或外部请求：外部请求为 0，无用户文件上传。
5. 中文路径、空格路径、D 盘路径失败：已通过。
6. 损坏文件导致队列整体中断：队列继续。

仍需注意：

1. Defender / SmartScreen 信息未提供，不能视为已完全排除误报。
2. WebView2 Runtime 检查截图未提供，不能形成完整审计链。
3. BtbN FFmpeg 候选尚未完成商业许可证最终复核。

## 5. 是否建议进入默认后端

建议进入下一轮“低风险 sidecar 默认后端”实施评估，但不建议直接把 sidecar 改成全量默认后端。

建议进入的下一轮名称：

`LOW_RISK_SIDECAR_DEFAULT_ROUND`

下一轮应只做以下范围：

1. 离线专业版。
2. 用户已通过 VM 的低风险格式。
3. 保留 FFmpeg WASM 回退。
4. 在线版完全不受影响。
5. sidecar 失败时明确提示并允许用户回退 WASM。

## 6. 如果建议进入，默认范围应该是什么

建议默认范围仅限：

| 场景 | 默认后端建议 | 原因 |
| --- | --- | --- |
| 离线专业版 WAV 转 FLAC | sidecar 优先 | 已通过 Windows 10/11 VM、路径和断网验证 |
| 离线专业版 MP4 转 WebM | sidecar 优先 | 已通过 Windows 10/11 VM、路径和断网验证 |
| 离线专业版 ffprobe 媒体信息读取 | sidecar 优先 | 本地 sidecar 更适合读取时长、编码信息，且不涉及输出编码承诺 |
| 在线版全部音视频转换 | WASM | 在线版不能使用 sidecar，本地 WASM 继续保持 |
| 其他离线音视频格式 | WASM | 未完成 sidecar 正式验证和许可证复核 |

默认策略应命名为：

“低风险格式 sidecar 优先，WASM 保留回退”

不要命名为：

1. “sidecar 全量默认”。
2. “FFmpeg 原生商业后端”。
3. “已完成商业许可证复核后端”。

## 7. 如果不建议进入，原因是什么

不建议进入“全量默认后端”，原因如下：

1. 当前只验证了 WAV 转 FLAC 和 MP4 转 WebM。
2. MP3、AAC/M4A、MP4/H.264 未完成许可证和专利复核。
3. BtbN FFmpeg 候选不是自建 LGPL 构建。
4. shared build 中包含 `libmp3lame`、`libopenh264`、AAC 相关能力，商业发布前仍需复核。
5. Defender / SmartScreen 截图尚未归档。
6. 任务历史脱敏截图尚未归档。

因此，本轮建议进入“低风险默认”而不是“全量默认”。

## 8. 可以优先使用 sidecar 的格式

可以优先使用 sidecar 的格式：

1. WAV 转 FLAC。
2. MP4 转 WebM。
3. ffprobe 媒体信息读取。
4. ffmpeg 版本和 buildconf 内部检查。

谨慎扩展候选，但下一轮不应默认开放：

1. 视频提取音频到 WAV。
2. 视频提取音频到 FLAC。

原因：这两个方向理论上风险较低，但用户本轮没有明确回填“视频提取音频到 WAV/FLAC sidecar 通过”，建议另开小范围验证后再纳入。

## 9. 必须继续使用 WASM 的格式

以下场景必须继续使用 WASM：

1. 在线版全部音频转换。
2. 在线版全部视频转换。
3. 在线版视频提取音频。
4. 离线专业版 MP3 输出。
5. 离线专业版 AAC 输出。
6. 离线专业版 M4A 输出。
7. 离线专业版 MP4 / H.264 输出。
8. 离线专业版 MOV 输出。
9. 离线专业版 AVI 输出。
10. 离线专业版 MKV 输出。
11. 任何 sidecar 校验失败场景。
12. 任何没有本地文件路径或没有本地输出目录的场景。

## 10. 必须继续标记为实验或禁用的格式

继续标记为实验或禁用的格式：

| 格式 / 能力 | 建议状态 | 原因 |
| --- | --- | --- |
| MP3 输出 | 继续 WASM / 不走 sidecar | `libmp3lame` 商业发布前需复核 |
| AAC 输出 | 继续 WASM / 不走 sidecar | AAC 地区、平台、专利和编码器风险需复核 |
| M4A 输出 | 继续 WASM / 不走 sidecar | AAC/M4A 相关风险未复核 |
| MP4 / H.264 输出 | 继续 WASM / 不走 sidecar | H.264、OpenH264、平台兼容和专利风险需复核 |
| MOV 输出 | 继续 WASM / 不走 sidecar | 未完成 sidecar 默认验证 |
| AVI 输出 | 继续 WASM / 不走 sidecar | 未完成 sidecar 默认验证 |
| MKV 输出 | 继续 WASM / 不走 sidecar | 未完成 sidecar 默认验证 |
| 视频提取音频到 MP3/AAC/M4A | 继续 WASM / 不走 sidecar | 输出编码相关风险未复核 |

## 11. WASM 回退策略

下一轮若进入低风险默认，建议采用以下回退策略：

1. 在线版永远使用 FFmpeg WASM。
2. 离线专业版启动时检查 sidecar 资源。
3. sidecar 资源缺失时，低风险格式直接走 WASM。
4. sidecar SHA256 校验失败时，低风险格式直接走 WASM，并提示“sidecar 校验失败，已回退 WASM”。
5. sidecar 执行失败时，不自动重复执行 WASM，避免用户等待时间翻倍。
6. sidecar 执行失败后，在任务行显示明确错误，并给出“可切换为 WASM 后重试”的操作。
7. 用户可在设置中关闭 sidecar 优先策略。

推荐文案：

```text
sidecar FFmpeg 处理失败。当前文件没有上传服务器。你可以关闭 sidecar 优先处理，改用 FFmpeg WASM 后重试。
```

## 12. 用户关闭 sidecar 后的行为

用户关闭 sidecar 后：

1. 离线专业版所有音视频任务继续使用 FFmpeg WASM。
2. 不再调用 sidecar。
3. 设置保存到本机。
4. 不上传设置状态。
5. 任务历史记录 backend 为 `WASM`。
6. 用户可以随时重新开启 sidecar 优先处理。

建议设置名称从“实验功能”调整为更清楚的两级表达：

1. 主开关：`使用本地 sidecar FFmpeg 优先处理低风险格式`
2. 辅助说明：`当前仅适用于 WAV 转 FLAC、MP4 转 WebM。其他格式仍使用 FFmpeg WASM。`

但下一轮实施时仍要避免营销化文案，不要暗示全部音视频都已使用 sidecar。

## 13. sidecar 失败后的行为

sidecar 失败时建议：

1. 当前任务标记为失败。
2. 后续任务继续处理。
3. 失败原因显示为用户可理解中文。
4. 不记录完整 FFmpeg 命令行。
5. 不记录完整 stderr。
6. 不记录完整敏感路径。
7. 任务历史写入失败状态和 backend=`sidecar`。
8. 提供“使用 WASM 重试”或提示用户关闭 sidecar 优先后重试。

不要做：

1. 不要自动吞掉错误。
2. 不要自动二次执行 WASM，除非用户明确点击重试。
3. 不要上传日志。
4. 不要上传文件。
5. 不要上传转换结果。

## 14. 任务历史如何记录 backend

任务历史建议继续记录：

1. `backend: "sidecar"`。
2. `backend: "wasm"`。
3. `status`。
4. `outputFormat`。
5. `resultName`。
6. `durationMs`。
7. `error`。
8. 脱敏后的输入路径。
9. 脱敏后的输出路径。

不要记录：

1. 完整源文件路径。
2. 完整输出路径。
3. 完整 FFmpeg 命令。
4. 完整 FFmpeg stderr。
5. 文件内容。
6. OCR / 文档解析内容。

## 15. 日志如何继续脱敏

日志脱敏要求：

1. Windows 路径只保留盘符和文件名，或使用中间省略。
2. 用户名、桌面、下载、文档路径应隐藏。
3. FFmpeg stderr 只保留摘要。
4. 错误日志最多保留必要诊断信息。
5. 导出处理日志不包含完整敏感路径。
6. 不上传处理日志。

建议错误格式：

```text
任务失败：sidecar FFmpeg 无法处理该文件。
下一步：请确认文件是否损坏，或关闭 sidecar 优先处理后使用 WASM 重试。
```

## 16. 是否影响在线版

本轮评估不影响在线版。

下一轮实施也必须保证：

1. 在线版继续使用 FFmpeg WASM。
2. 在线版不出现 sidecar 开关。
3. 在线版不打包 `ffmpeg.exe`、`ffprobe.exe` 或 DLL。
4. 在线版不引入云转换。
5. 在线版不上传用户文件。

## 17. 是否影响隐私原则

不应影响隐私原则。

当前和下一轮必须保持：

1. 音频不上传服务器。
2. 视频不上传服务器。
3. 转换结果不上传服务器。
4. 任务历史不上传服务器。
5. 处理日志不上传服务器。
6. 输出路径不上传服务器。
7. CloudBase 只用于下载授权，不接触用户文件。
8. 广告不接触 File / Blob / ArrayBuffer / Canvas / 转换结果。
9. sidecar 在本机调用内置 `ffmpeg.exe` / `ffprobe.exe`。

## 18. 是否影响 Tauri 权限

不应影响 Tauri 权限。

下一轮实施要求：

1. 不开启 `process.all`。
2. 不开启 updater。
3. 不扩大 `fs.scope`。
4. 不新增网络权限。
5. 不允许用户提供任意 ffmpeg 路径。
6. 不允许用户输入任意命令。
7. 不允许用户输入任意 args。
8. 继续使用结构化请求和白名单参数。

当前权限仍应保持上一轮半收窄方案：

1. 用户目录。
2. 桌面、文档、下载、图片、视频、音频目录。
3. `D:/**`。
4. `shell.open` 仅用于打开输出目录和结果文件。

## 19. 是否影响 WebView2 offlineInstaller

不应影响 WebView2 offlineInstaller。

当前用户已确认：

1. Windows 10 EXE 断网安装启动通过。
2. Windows 10 MSI 断网安装启动通过。
3. Windows 11 EXE 断网安装启动通过。
4. Windows 11 MSI 断网安装启动通过。

下一轮实施不得修改：

1. `webviewInstallMode.type = "offlineInstaller"`。
2. `webviewInstallMode.silent = true`。
3. NSIS / MSI 打包策略。
4. 现有 WebView2 离线安装资源。

## 20. BtbN 候选许可证风险

BtbN 候选当前适合内部实验和低风险格式评估，但不等于商业许可证最终复核完成。

已知信息：

1. 候选为 BtbN FFmpeg-Builds latest n7.1 win64 lgpl shared 7.1。
2. `ffmpeg -L` 初步显示 LGPL v3 or later。
3. 未发现 `--enable-gpl`。
4. 未发现 `--enable-nonfree`。
5. `libx264` 为 disabled。
6. `libx265` 为 disabled。
7. 包含 `libmp3lame`。
8. 包含 `libopenh264`。
9. 存在 AAC 相关编码能力。

风险：

1. LGPL v3 对商业产品分发义务需要复核。
2. shared DLL 的分发、替换、源码获取方式需要复核。
3. `libmp3lame` 仍需复核。
4. `libopenh264` 仍需复核。
5. AAC/M4A 地区、平台、专利风险仍需复核。
6. BtbN 不是项目自建构建，长期可控性弱于自建 LGPL FFmpeg。

结论：BtbN 候选可以继续作为低风险格式 sidecar 后端评估对象，但不应作为“已完成商业许可证复核”的宣传点。

## 21. 是否仍建议长期自建 LGPL FFmpeg

仍然建议。

原因：

1. 自建 LGPL FFmpeg 可以固定版本、固定参数、固定依赖。
2. 可以明确禁用 `--enable-gpl` 和 `--enable-nonfree`。
3. 可以按产品实际格式裁剪编码器和封装格式。
4. 可以生成完整构建日志、源码包、SHA256 和许可证包。
5. 可以减少第三方候选构建变化带来的长期维护风险。
6. 更适合未来商业销售和审计。

建议路线：

1. 短期：BtbN 候选用于低风险格式 sidecar 优先后端。
2. 中期：建立自建 LGPL FFmpeg 构建脚本和归档流程。
3. 长期：自建 LGPL FFmpeg 替代 BtbN 候选，作为正式离线专业版音视频 sidecar 后端。

## 22. 下一轮是否可以进入 LOW_RISK_SIDECAR_DEFAULT_ROUND

可以进入。

进入条件已满足：

1. Windows 10/11 EXE/MSI 断网安装启动通过。
2. WAV 转 FLAC sidecar 通过。
3. MP4 转 WebM sidecar 通过。
4. 中文路径通过。
5. 带空格路径通过。
6. D 盘路径通过。
7. 损坏文件失败后队列继续。
8. 外部请求为 0。
9. 无用户文件上传。
10. 当前无用户报告的 P0 / P1 阻塞问题。

下一轮实施边界必须写死：

1. 只改离线专业版。
2. 在线版不变。
3. 只把 WAV 转 FLAC、MP4 转 WebM 改为 sidecar 优先。
4. FFmpeg WASM 保留。
5. 用户可关闭 sidecar 优先。
6. sidecar 失败不自动吞掉。
7. sidecar 失败不自动上传日志。
8. 不扩大 Tauri 权限。
9. 不开放 MP3、AAC/M4A、MP4/H.264 为 sidecar 正式能力。
10. 不宣称 BtbN 候选已完成商业许可证最终复核。

## 23. 建议的下一轮验收标准

`LOW_RISK_SIDECAR_DEFAULT_ROUND` 完成后必须验证：

1. 在线版仍使用 WASM。
2. 离线专业版 WAV 转 FLAC 默认 sidecar 优先。
3. 离线专业版 MP4 转 WebM 默认 sidecar 优先。
4. 用户关闭 sidecar 后回到 WASM。
5. sidecar 校验失败时回到 WASM 或明确提示。
6. MP3、AAC/M4A、MP4/H.264 仍不走 sidecar。
7. 任务历史正确记录 backend。
8. 日志继续脱敏。
9. 外部请求为 0。
10. 无用户文件上传。
11. Tauri 权限不扩大。
12. WebView2 offlineInstaller 不变。

## 24. 总结

根据用户人工 VM 测试结果，sidecar FFmpeg 已经通过了离线专业版最关键的低风险格式验证。当前可以进入 `LOW_RISK_SIDECAR_DEFAULT_ROUND`，但下一轮只能把 `WAV -> FLAC` 和 `MP4 -> WebM` 设为离线专业版 sidecar 优先处理，不得扩展到 MP3、AAC/M4A、MP4/H.264，也不得影响在线版。

最终商业化前仍需完成 BtbN 候选许可证人工复核，并建议长期建设自建 LGPL FFmpeg。
