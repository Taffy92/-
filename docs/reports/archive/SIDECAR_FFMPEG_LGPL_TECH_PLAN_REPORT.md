# SIDECAR_FFMPEG_LGPL_TECH_PLAN_REPORT

生成时间：2026-05-24

本轮名称：SIDECAR_FFMPEG_LGPL_TECH_PLAN_ROUND

本轮目标是为 Windows 离线专业版设计长期 FFmpeg sidecar / LGPL FFmpeg 构建方案。本轮只生成技术方案，不直接修改当前功能代码。

## 1. 本轮输入依据

已参考：

1. `ONLINE_AV_KEEP_BATCH_GATE_REPORT.md`
2. `FFMPEG_GPL_SIDECAR_RELEASE_STRATEGY_REPORT.md`
3. `FFMPEG_CURRENT_USAGE_AUDIT.md`
4. `FFMPEG_RELEASE_OPTIONS.md`
5. `FFMPEG_RECOMMENDED_STRATEGY.md`
6. `FFMPEG_LICENSE_NOTICE.md`
7. `THIRD_PARTY_NOTICES.md`
8. `OPEN_SOURCE_LICENSES.md`
9. `RELEASE_COMPLIANCE_CHECKLIST.md`
10. `BATCH_STABILITY_FEATURE_REPORT.md`
11. `TAURI_PERMISSION_HARDENING_REPORT.md`
12. `WEBVIEW2_OFFLINE_INSTALLER_REPORT.md`

同时检查了当前源码：

1. `packages/media-core/src/index.ts`
2. `packages/media-core/package.json`
3. `apps/web/src/components/tools/ToolsClient.tsx`
4. `apps/web/scripts/prepare-static.mjs`
5. `apps/desktop/src-tauri/tauri.conf.json`
6. `apps/desktop/src-tauri/src/main.rs`
7. `apps/desktop/src-tauri/Cargo.toml`
8. `package.json`
9. `pnpm-lock.yaml`

## 2. 本轮生成文件

本轮新增：

1. `SIDECAR_FFMPEG_CURRENT_ARCHITECTURE_AUDIT.md`
2. `SIDECAR_FFMPEG_TECHNICAL_DESIGN.md`
3. `LGPL_FFMPEG_BUILD_EVALUATION.md`
4. `SIDECAR_FFMPEG_PACKAGING_PLAN.md`
5. `SIDECAR_FFMPEG_SECURITY_PLAN.md`
6. `SIDECAR_FFMPEG_MIGRATION_ROADMAP.md`
7. `SIDECAR_FFMPEG_TEST_PLAN.md`
8. `SIDECAR_FFMPEG_LGPL_TECH_PLAN_REPORT.md`

## 3. 当前架构审查结论

当前音视频转换核心位于：

`packages/media-core/src/index.ts`

当前所有音视频能力都走 FFmpeg WASM：

1. `convertVideoFormat`
2. `convertAudioFormat`
3. `extractAudioFromVideo`

当前在线版和离线专业版共用 `media-core`。

当前 FFmpeg WASM 加载方式：

1. `@ffmpeg/ffmpeg` 负责运行时封装。
2. `@ffmpeg/core` 提供 `ffmpeg-core.js` 和 `ffmpeg-core.wasm`。
3. `apps/web/scripts/prepare-static.mjs` 把 WASM 静态资源复制到 `apps/web/public/ffmpeg`。
4. Next 静态导出后进入 `apps/web/out/ffmpeg`。
5. Tauri 离线专业版加载的也是 `apps/web/out`。

当前批量队列音视频处理点在：

`apps/web/src/components/tools/ToolsClient.tsx`

批量模式：

1. `video-convert` 调用 `convertVideoFormat`。
2. `audio-convert` 调用 `convertAudioFormat`。
3. `video-audio` 调用 `extractAudioFromVideo`。

当前 Tauri Rust 侧只有标准启动代码，没有自定义 command，也没有 sidecar 进程管理。

结论：

1. 当前架构适合在线版轻量单文件转换。
2. 当前架构不适合作为离线专业版长期大文件和批量音视频处理核心。
3. 离线专业版长期应新增 sidecar 后端，但不能一次性移除 WASM。

## 4. 推荐 sidecar 架构

推荐采用双后端架构：

```text
在线版
  -> FFmpeg WASM

离线专业版
  -> 优先 Tauri sidecar ffmpeg.exe
  -> WASM 作为回退
```

建议新增抽象：

1. `wasm` 后端：保留当前 `media-core` 逻辑。
2. `tauri-sidecar` 后端：仅在桌面模式启用。
3. `convertMediaWithBestBackend`：根据运行环境选择后端。

建议不要让 UI 直接拼接 FFmpeg 参数。UI 只提交结构化转换请求。

## 5. 在线版继续使用 FFmpeg WASM 的方案

在线版保持现状：

1. 继续保留音频转换、视频转换、视频提取音频。
2. 继续包含 `/ffmpeg/ffmpeg-core.js`。
3. 继续包含 `/ffmpeg/ffmpeg-core.wasm`。
4. 继续本地处理文件。
5. 不开放批量音视频处理。
6. 批量处理入口继续提示下载 Windows 离线专业版。

在线版不得：

1. 调用 Tauri sidecar。
2. 引入云转换。
3. 上传用户文件。
4. 请求远程 FFmpeg 静态资源。

## 6. 离线专业版迁移 sidecar 的方案

离线专业版长期迁移路径：

1. 打包 `ffmpeg.exe` 和可选 `ffprobe.exe`。
2. 新增 Tauri command，由 Rust 侧调用 sidecar。
3. 前端批量队列提交结构化参数。
4. Rust 侧白名单构建参数数组。
5. 输出结果直接写入用户选择的输出目录。
6. stdout/stderr 解析进度。
7. 取消任务时杀死当前任务对应的 FFmpeg 子进程。
8. 失败原因转为中文友好提示。
9. 任务历史继续记录脱敏路径。
10. WASM 保留为回退。

核心优势：

1. 大文件稳定性优于 WASM。
2. 批量任务内存压力更低。
3. 更符合离线专业版商业工具定位。
4. 可以独立控制 FFmpeg 构建和许可证策略。

## 7. LGPL FFmpeg 构建评估

推荐优先评估 LGPL 构建，但必须确认构建参数。

明确不能启用：

```text
--enable-gpl
--enable-nonfree
```

存在风险的能力：

1. H.264 输出：当前 WASM 使用 `libx264`，通常属于 GPL 风险重点。
2. MP3 输出：需要确认编码器许可证和专利风险。
3. AAC/M4A 输出：需要确认编码器和专利风险。
4. MOV/MP4 高兼容输出：可能受 H.264/AAC 选择影响。

较适合作为默认的能力：

1. WAV。
2. FLAC。
3. WebM。
4. 视频提取为 WAV/FLAC。
5. 可 remux 的 MP4 场景。

需要灰度或实验标记的能力：

1. MP4/H.264 编码。
2. MOV 输出。
3. AVI 输出。
4. MKV 输出。
5. MP3 输出。
6. AAC/M4A 输出。

结论：

LGPL 构建适合作为长期商业路线，但不能在未验证编码器和许可证前直接承诺全格式无风险。

## 8. 默认支持格式建议

短期 sidecar 实验阶段建议：

视频默认：

1. MP4 输入。
2. MOV 输入。
3. WebM 输出。
4. MP4 输出作为兼容目标，但 H.264 编码能力需根据实际构建确认。

音频默认：

1. WAV。
2. FLAC。
3. MP3 先保持常用入口，但商业发布前复核。
4. AAC/M4A 先保持常用入口，但商业发布前复核。

视频提取音频默认：

1. WAV。
2. M4A/AAC 或 MP3 视复核结果开放。

## 9. 许可证或专利风险

必须重点复核：

1. `@ffmpeg/core@0.12.10` 当前声明为 `GPL-2.0-or-later`。
2. 当前在线版仍分发 FFmpeg WASM，所以 GPL 说明不能删除。
3. sidecar 如果使用 LGPL 构建，必须记录构建参数。
4. sidecar 如果使用 GPL 构建，必须完整履行 GPL 义务。
5. H.264、MP3、AAC 涉及编码器和专利问题，需人工复核。
6. 不应把“LGPL FFmpeg”作为营销承诺，除非构建来源、参数、许可证已经确认。

## 10. 打包方案

推荐结构：

```text
resources/
  ffmpeg/
    bin/
      ffmpeg.exe
      ffprobe.exe
    LICENSES/
      FFmpeg-LICENSE.txt
      FFmpeg-COPYING.LGPLv2.1.txt
      FFmpeg-COPYING.GPLv2.txt
      third-party-libraries.md
    README.txt
    BUILD_CONFIG.txt
    SOURCE_OFFER.txt
    SHA256SUMS.txt
```

建议：

1. `ffmpeg.exe` 不放入在线版 `public`。
2. `ffmpeg.exe` 只进入 Tauri 离线专业版安装包。
3. 使用 `bundle.resources` 或 `bundle.externalBin` 打包。
4. 保留 WebView2 offlineInstaller。
5. 不扩大 Tauri 文件系统权限。
6. 不开启 `process.all`。
7. 不新增网络权限。

预计体积：

1. LGPL 精简构建可能增加约 30 MB 到 80 MB。
2. 完整构建可能增加约 80 MB 到 150 MB。
3. 最终以实际 EXE/MSI 为准。

## 11. 安全方案

必须采用 Rust 侧安全边界：

1. 禁止用户输入任意命令。
2. 只允许结构化请求。
3. 只允许白名单参数。
4. 输入文件必须来自用户主动选择。
5. 输出文件必须写入用户选择输出目录。
6. 不允许覆盖系统文件。
7. 不允许执行除内置 `ffmpeg.exe` / `ffprobe.exe` 外的程序。
8. 不允许 shell 拼接不可信字符串。
9. 中文路径和空格路径必须用参数数组传递。
10. 失败日志必须脱敏。
11. 不记录完整敏感路径。
12. 不上传日志、文件或结果。
13. 不新增网络权限。
14. 不打开 Tauri process 全量权限。

## 12. 迁移路线

推荐分 7 个阶段：

1. 阶段 1：只做 sidecar 可行性验证，不替换现有功能。
2. 阶段 2：离线专业版增加 sidecar 实验开关。
3. 阶段 3：离线专业版音视频默认使用 sidecar。
4. 阶段 4：保留 WASM 作为回退。
5. 阶段 5：完成许可证和 Notices 更新。
6. 阶段 6：干净 Windows 10/11 VM 验证。
7. 阶段 7：正式发布。

关键原则：

1. 不一次性删除 WASM。
2. 不影响在线版。
3. 不破坏离线专业版批量队列。
4. 每阶段都能回滚。

## 13. 测试计划

必须覆盖：

1. `ffmpeg.exe` 是否存在。
2. SHA256 是否匹配。
3. sidecar 是否可执行。
4. MP4 转 MP4 压缩。
5. MP4 转 WebM。
6. MOV 转 MP4。
7. WAV 转 MP3。
8. MP3 转 WAV。
9. 视频提取音频。
10. 中文文件名。
11. 带空格路径。
12. D 盘路径。
13. 长文件名。
14. 损坏视频。
15. 损坏音频。
16. 大文件取消。
17. 失败原因。
18. 批量队列继续处理下一项。
19. 输出目录写入。
20. 打开结果文件。
21. 任务历史。
22. 断网运行。
23. 外部请求为 0。
24. 不上传用户文件。

详见：

`SIDECAR_FFMPEG_TEST_PLAN.md`

## 14. 是否建议立即实施

不建议直接大改或一次性替换。

建议下一轮先做：

阶段 1 sidecar 可行性验证。

理由：

1. 当前在线版和离线版音视频功能可用。
2. 当前批量队列已经稳定。
3. sidecar 会引入打包、权限、许可证、杀毒误报、路径和进度解析等新风险。
4. LGPL 构建是否满足 MP4/MP3/AAC 等用户预期还需要确认。

## 15. 是否需要先完成干净 Windows 10/11 VM 实测

需要。

在正式替换默认音视频后端之前，必须先完成：

1. 当前候选包干净 Windows 10 VM 实测。
2. 当前候选包干净 Windows 11 VM 实测。
3. 断网 + 无 WebView2 Runtime 安装验证。
4. D 盘路径、中文路径、带空格路径验证。
5. 当前 WASM 批量音视频验证。

原因：

sidecar 会增加安装包复杂度，必须先确认当前基础安装包已经稳定。

## 16. 是否需要先做 FFmpeg 构建来源确认

需要。

实施 sidecar 前必须确认：

1. FFmpeg 二进制来源。
2. 是否可信。
3. 是否允许再分发。
4. 是否 LGPL、GPL 或 nonfree。
5. 完整构建参数。
6. 源码获取方式。
7. 是否包含外部库。
8. 每个外部库许可证。

不要从不明来源下载 `ffmpeg.exe` 直接打包。

## 17. 是否需要律师或许可证复核

需要。

尤其是：

1. 当前在线版继续分发 GPL FFmpeg WASM。
2. 未来 sidecar 可能分发 FFmpeg exe。
3. MP4/H.264、MP3、AAC/M4A 涉及复杂许可证和专利问题。
4. 未来可能商业化销售离线专业版。

本轮文档不是法律意见。

## 18. 下一轮 Codex 应该执行什么

建议下一轮名称：

`SIDECAR_FFMPEG_PROOF_OF_CONCEPT_ROUND`

下一轮只做可行性验证，不替换现有功能。

建议任务：

1. 创建 `apps/desktop/src-tauri/resources/ffmpeg/` 目录结构。
2. 不下载不明来源二进制，由用户提供或确认官方来源。
3. 新增 Rust command 草案。
4. 新增参数白名单 builder。
5. 新增最小 sidecar 检测命令。
6. 新增一个内部测试入口或脚本。
7. 不接入正式批量队列默认路径。
8. 不修改在线版。
9. 不扩大 Tauri 权限。
10. 不移除 WASM。

如果用户还没有完成干净 VM 实测，建议优先执行：

`CLEAN_WINDOWS_VM_RELEASE_VALIDATION_ROUND`

## 19. 最终结论

推荐长期路线：

1. 在线版保留 FFmpeg WASM，继续支持轻量单文件音视频转换。
2. 在线版批量处理继续作为离线专业版入口。
3. 离线专业版长期迁移到 Tauri sidecar FFmpeg。
4. sidecar 优先评估 LGPL 构建。
5. 如果 LGPL 构建不能满足核心格式，再评估 GPL 构建并完整履行许可证义务。
6. 迁移必须分阶段，保留 WASM 回退。
7. 任何正式发布前都必须完成干净 Windows 10/11 VM 实测和许可证复核。
