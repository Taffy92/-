# SIDECAR_EXPERIMENT_SECURITY_LICENSE_RECHECK

生成时间：2026-05-24

本报告用于复查 sidecar FFmpeg 内部实验功能的安全边界和许可证声明。检查方式为源码、配置、构建产物和文档静态检查；真实转换行为仍需在干净 Windows 10/11 VM 中验证。

## 1. 安全边界检查

| 检查项 | 结果 | 证据 |
| --- | --- | --- |
| sidecar 默认关闭 | 通过 | localStorage key 默认为无值，只有 `enabled` 才视为开启 |
| 只在离线专业版显示 | 通过 | 实验面板位于离线专业版工作台参数区域；在线版不渲染该工作台 |
| 禁止用户输入任意 FFmpeg 命令 | 通过 | Rust command 只接受结构化请求 |
| 禁止用户输入任意 args | 通过 | 参数由 `build_whitelisted_command` 生成 |
| 不允许用户提供 ffmpeg.exe 路径 | 通过 | Rust 只解析内置 `resources/ffmpeg/bin/ffmpeg.exe` |
| 不调用系统 PATH 中的 ffmpeg | 通过 | 使用内置资源路径 |
| 不调用 `cmd.exe` | 通过 | 源码静态搜索未发现 `cmd.exe` |
| 不调用 `powershell.exe` | 通过 | 源码静态搜索未发现 `powershell.exe` |
| 不做 shell 字符串拼接 | 通过 | 使用 `Command::new(...).args(&built.args)` |
| 不开启 `process.all` | 通过 | `process.all=false` |
| 不开启 updater | 通过 | `updater.active=false` |
| 不扩大 Tauri 文件权限 | 通过 | fs.scope 仍为用户目录 + `D:/**` |
| 不新增网络权限 | 通过 | 本轮未改 CSP/connect-src/Tauri 网络能力 |
| 不上传文件、日志、路径、转换结果 | 通过静态检查 | sidecar 在 Rust 本地执行；没有新增上传 API |
| 日志脱敏 | 通过静态检查 | 输出路径使用 sanitized path，stderr 截断并脱敏 |
| 失败不影响其他队列任务 | 待 VM 实测 | 代码按单任务失败记录，但真实桌面队列需安装后测试 |

## 2. sidecar 白名单检查

允许的 sidecar 实验模式：

1. `version-check`
2. `buildconf-check`
3. `probe-duration`
4. `convert-wav-to-flac-poc`
5. `convert-mp4-to-webm-poc`

前端使用条件：

1. desktop / 离线专业版环境。
2. 用户主动开启 sidecar 实验开关。
3. sidecar 状态为 `sidecar_ready`。
4. SHA256 校验通过。
5. 输出目录为 Tauri 本地输出目录。
6. 输入文件有本地路径。
7. 输出格式命中白名单。

不作为 sidecar 正式能力开放：

1. MP3 输出。
2. AAC / M4A 输出。
3. MP4 / H.264 输出。
4. MOV 输出。
5. AVI 输出。
6. MKV 输出。

## 3. Tauri 权限复查

当前关键权限：

| 权限 | 当前值 | 结论 |
| --- | --- | --- |
| `dialog.all` | `false` | 未全开 |
| `dialog.open/save/message/confirm/ask` | `true` | 文件选择、目录选择和提示需要 |
| `fs.all` | `false` | 未全开 |
| `fs.readFile/readDir/writeFile/exists/createDir` | `true` | 批量处理和输出需要 |
| `fs.removeFile/removeDir/renameFile` | `false` | 未开放删除和重命名 |
| `fs.scope` | 用户目录 + `D:/**` | 维持上一轮半收窄方案 |
| `path.all` | `true` | 仍需后续专项评估更细化 |
| `shell.all` | `false` | 未全开 |
| `shell.open` | `true` | 打开输出目录和结果文件需要 |
| `process.all` | `false` | 未启用 |
| `updater.active` | `false` | 未启用 |

结论：本轮没有扩大 Tauri 权限。

## 4. 许可证和来源复查

sidecar 候选来源：

| 项目 | 内容 |
| --- | --- |
| 来源 | BtbN FFmpeg-Builds |
| 版本 | latest n7.1 win64 lgpl shared 7.1 |
| 类型 | shared build |
| 项目地址 | `https://github.com/BtbN/FFmpeg-Builds` |
| 下载地址 | `https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-n7.1-latest-win64-lgpl-shared-7.1.zip` |
| ZIP SHA256 | `233E3C0D1E73C4BC2915DA553AA211BEAB75AA902F074CF6A7D6BADE6846F2CC` |
| 当前用途 | 离线专业版内部实验 |
| 商业许可证最终复核 | 未完成 |

构建参数静态检查：

| 项目 | 结果 |
| --- | --- |
| `--enable-gpl` | 未发现 |
| `--enable-nonfree` | 未发现 |
| `libx264` | `--disable-libx264` |
| `libx265` | `--disable-libx265` |
| `libmp3lame` | `--enable-libmp3lame`，商业发布前需复核 |
| `libopenh264` | `--enable-libopenh264`，商业发布前需复核 |
| AAC encoder | 存在 `aac` / `aac_mf`，商业发布前需复核 |

## 5. SHA256 保留情况

已保留：

1. `apps/desktop/src-tauri/resources/ffmpeg/SHA256SUMS.txt`
2. `apps/desktop/src-tauri/resources/ffmpeg/BUILD_CONFIG.txt`
3. `apps/desktop/src-tauri/resources/ffmpeg/SOURCE_OFFER.txt`
4. `apps/desktop/src-tauri/resources/ffmpeg/README.txt`
5. `apps/desktop/src-tauri/resources/ffmpeg/LICENSES/*`

关键 SHA256：

| 文件 | SHA256 |
| --- | --- |
| `bin/ffmpeg.exe` | `F098AA44CEABDF4AA17B206E8BFD5B1259BFC234ADDCF18F3D647512D0918798` |
| `bin/ffprobe.exe` | `9CD5D66824EDD9DE1C048A1AB03DF90A03D71EA7FB8FCDCF9DC4A47BBC0683A7` |
| `bin/avcodec-61.dll` | `0E450DDD2B0F7BD8F1AE4E5A88C035432DB5EAAD50AEC8EF801A9562FBDC2AEE` |
| `bin/avformat-61.dll` | `CDCB28EBA8EA4557B4B46106DFA3011DB8885FD90E0A6DBCCF659FB45E8EB920` |
| `bin/avutil-59.dll` | `F4B7A1C729666D7E1827AFC1B6CBED901BC530A6FCFA69535F81025882A6966C` |
| `bin/swresample-5.dll` | `408A449858B9ECF134506ED9B7FC4BCAF5129FA646571840ECAD63B634F43D4D` |
| `bin/swscale-8.dll` | `346BF68043421799A0A2EDEE0F6AD63E1340C5123C6DA861C6906FF55DF8B98E` |

## 6. 文档声明复查

已存在并应保留的文档：

1. `SIDECAR_FFMPEG_EXPERIMENT_NOTICE.md`
2. `FFMPEG_LICENSE_NOTICE.md`
3. `THIRD_PARTY_NOTICES.md`
4. `OPEN_SOURCE_LICENSES.md`
5. `RELEASE_COMPLIANCE_CHECKLIST.md`
6. `apps/desktop/src-tauri/resources/ffmpeg/README.txt`
7. `apps/desktop/src-tauri/resources/ffmpeg/SOURCE_OFFER.txt`

文档已明确：

1. 在线版继续使用 FFmpeg WASM。
2. 离线专业版默认仍使用 FFmpeg WASM。
3. sidecar FFmpeg 仅为内部实验功能。
4. 当前候选为 BtbN FFmpeg-Builds win64 LGPL shared 7.1。
5. 当前未发现 `--enable-gpl` 和 `--enable-nonfree`。
6. 当前包含 `libmp3lame`、`libopenh264`、AAC 相关能力，商业发布前仍需复核。
7. 当前不能宣传为已经完成商业许可证最终复核。
8. MP3、AAC/M4A、MP4/H.264 不作为 sidecar 正式能力承诺。

## 7. 仍需 VM 验证的安全项

1. sidecar SHA256 校验在真实安装目录中是否通过。
2. shared DLL 是否完整加载。
3. Windows Defender 是否误报。
4. WAV 转 FLAC 和 MP4 转 WebM 是否在真实安装环境中通过。
5. 中文路径、带空格路径、D 盘路径是否通过。
6. 任务失败后队列是否继续。
7. 断网环境下是否没有外部请求。

## 8. 结论

静态安全和许可证声明检查通过，可以进入干净 Windows 10/11 VM 实测。

但当前 sidecar 仍是内部实验功能，不建议进入默认后端评估，更不能作为正式商业音视频后端宣传。正式商业发布前仍需要：

1. 干净 Windows 10/11 VM 实测。
2. BtbN 候选和所有 DLL 的许可证人工复核。
3. `libmp3lame`、`libopenh264`、AAC/M4A、专利和地区合规复核。
4. 长期自建 LGPL FFmpeg 的可行性评估。
