# SIDECAR_BINARY_VERSIONING_DECISION

本文件用于提交前确认 sidecar FFmpeg 二进制资源的版本管理策略。本轮不执行 `git add`、不提交、不部署。

## 1. 当前 sidecar FFmpeg 二进制文件

当前目录：

`apps/desktop/src-tauri/resources/ffmpeg/bin/`

| 文件 | 大小 bytes | SHA256 |
|---|---:|---|
| `ffmpeg.exe` | 429568 | `F098AA44CEABDF4AA17B206E8BFD5B1259BFC234ADDCF18F3D647512D0918798` |
| `ffprobe.exe` | 221184 | `9CD5D66824EDD9DE1C048A1AB03DF90A03D71EA7FB8FCDCF9DC4A47BBC0683A7` |
| `avcodec-61.dll` | 65779712 | `0E450DDD2B0F7BD8F1AE4E5A88C035432DB5EAAD50AEC8EF801A9562FBDC2AEE` |
| `avdevice-61.dll` | 7449600 | `80EE2C4624AC56ABB56D1DC0EB00D94F78383AEA497D938A1027C3E30425FAD2` |
| `avfilter-10.dll` | 24924160 | `2E430FA6D877FD379506B08BF58682E4C921B6303E052B850F0F105254B24F46` |
| `avformat-61.dll` | 21438464 | `CDCB28EBA8EA4557B4B46106DFA3011DB8885FD90E0A6DBCCF659FB45E8EB920` |
| `avutil-59.dll` | 2836992 | `F4B7A1C729666D7E1827AFC1B6CBED901BC530A6FCFA69535F81025882A6966C` |
| `swresample-5.dll` | 670208 | `408A449858B9ECF134506ED9B7FC4BCAF5129FA646571840ECAD63B634F43D4D` |
| `swscale-8.dll` | 703488 | `346BF68043421799A0A2EDEE0F6AD63E1340C5123C6DA861C6906FF55DF8B98E` |

当前说明和许可证文件：

- `apps/desktop/src-tauri/resources/ffmpeg/README.txt`
- `apps/desktop/src-tauri/resources/ffmpeg/BUILD_CONFIG.txt`
- `apps/desktop/src-tauri/resources/ffmpeg/SOURCE_OFFER.txt`
- `apps/desktop/src-tauri/resources/ffmpeg/SHA256SUMS.txt`
- `apps/desktop/src-tauri/resources/ffmpeg/ffmpeg-version.txt`
- `apps/desktop/src-tauri/resources/ffmpeg/ffprobe-version.txt`
- `apps/desktop/src-tauri/resources/ffmpeg/LICENSES/`

## 2. 是否必须进入 Git 才能复现打包

这些 EXE / DLL 必须在本机打包时存在，离线专业版才能把 sidecar 资源打入安装包。

但它们不一定必须进入普通 Git。可复现打包需要满足其中一种方式：

1. 使用 Git LFS 跟踪 `bin/*.exe` 和 `bin/*.dll`；
2. 使用私有制品仓库保存这些二进制；
3. 使用 CloudBase 私有归档或内部 release artifact 保存这些二进制；
4. 在打包前按 `SHA256SUMS.txt` 从可信归档恢复到 `apps/desktop/src-tauri/resources/ffmpeg/bin/`。

## 3. 如果进入 Git，是否建议使用 Git LFS

建议使用 Git LFS，不建议直接提交到普通 Git。

原因：

- DLL 体积较大，普通 Git 会快速膨胀仓库；
- 后续升级 FFmpeg 版本会产生重复大对象；
- 普通 Git 不适合长期保存多版本大型二进制；
- Git LFS 或制品仓库更适合管理可发布二进制。

如果使用 Git LFS，至少跟踪：

- `apps/desktop/src-tauri/resources/ffmpeg/bin/*.exe`
- `apps/desktop/src-tauri/resources/ffmpeg/bin/*.dll`

## 4. 如果不进入 Git，应该放到哪里

推荐位置：

1. 私有制品仓库；
2. CloudBase 私有归档目录；
3. GitHub Release 私有或受控附件；
4. 内部 NAS / 对象存储；
5. 发布包归档目录，但不作为普通 Git 跟踪内容。

不建议：

- 放入 `apps/web/public`；
- 放入 `apps/web/out`；
- 混入在线版静态站点；
- 只保存在单台构建机且无校验备份。

## 5. 如果只提交许可证和说明，如何恢复 bin 目录

如果普通 Git 只提交说明、许可证和校验文件，恢复流程建议为：

1. 从可信制品仓库下载 sidecar FFmpeg 归档；
2. 解压到 `apps/desktop/src-tauri/resources/ffmpeg/bin/`；
3. 使用 `apps/desktop/src-tauri/resources/ffmpeg/SHA256SUMS.txt` 校验所有 EXE / DLL；
4. 校验通过后再执行桌面端打包；
5. 如果校验失败，停止打包，不要用未知二进制替代。

## 6. 当前建议方案

当前建议：

1. 不要直接提交 `apps/desktop/src-tauri/resources/ffmpeg/bin/*.exe` 到普通 Git；
2. 不要直接提交 `apps/desktop/src-tauri/resources/ffmpeg/bin/*.dll` 到普通 Git；
3. 普通 Git 至少保留 `README.txt`、`BUILD_CONFIG.txt`、`SOURCE_OFFER.txt`、`SHA256SUMS.txt`、`ffmpeg-version.txt`、`ffprobe-version.txt` 和 `LICENSES/`；
4. 二进制使用 Git LFS、私有制品仓库、CloudBase 私有归档或内部 release artifact 管理；
5. 正式决定前，把 sidecar `bin/` 视为需要人工确认的文件，不进入默认 `git add` 命令。

该策略不改变 sidecar / WASM 当前功能范围，不影响在线版，不扩大 Tauri 权限。
