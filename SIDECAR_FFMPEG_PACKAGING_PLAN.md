# SIDECAR_FFMPEG_PACKAGING_PLAN

生成时间：2026-05-24

本文件设计 Windows 离线专业版未来打包 sidecar FFmpeg 的目录结构和发布要求。本轮不修改安装包配置。

## 1. 推荐安装包资源结构

建议在 Tauri 资源中放置：

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

说明：

1. `bin/ffmpeg.exe`：实际执行的转换程序。
2. `bin/ffprobe.exe`：用于读取时长、编码、音轨信息。
3. `LICENSES/`：许可证文本。
4. `BUILD_CONFIG.txt`：完整构建参数。
5. `SOURCE_OFFER.txt`：源码获取方式或上游链接。
6. `SHA256SUMS.txt`：记录每个可执行文件哈希。

## 2. ffmpeg.exe 放在哪里

推荐放在：

`apps/desktop/src-tauri/resources/ffmpeg/bin/ffmpeg.exe`

Tauri 打包后进入安装目录的资源路径，由 Rust 侧通过 Tauri resource resolver 查找。

不要把 `ffmpeg.exe` 放在：

1. `apps/web/public`
2. `apps/web/out`
3. 在线版静态资源目录

原因：

1. 在线版不需要下载 Windows exe。
2. 避免把 sidecar 暴露到网站静态托管。
3. 降低在线版体积。

## 3. 是否需要 ffprobe.exe

建议需要。

用途：

1. 获取媒体总时长。
2. 检测是否存在音轨。
3. 检测分辨率和编码。
4. 提前给出格式不支持错误。
5. 提高进度计算准确度。

如果不打包 `ffprobe.exe`，也可以从 FFmpeg stderr 解析 `Duration`，但稳定性和可维护性较差。

## 4. Tauri sidecar 配置怎么写

Tauri v1 可使用 `bundle.externalBin` 或 `bundle.resources`。

建议优先评估 `externalBin`：

```json
{
  "tauri": {
    "bundle": {
      "externalBin": [
        "resources/ffmpeg/bin/ffmpeg",
        "resources/ffmpeg/bin/ffprobe"
      ],
      "resources": [
        "resources/ffmpeg/LICENSES",
        "resources/ffmpeg/README.txt",
        "resources/ffmpeg/BUILD_CONFIG.txt",
        "resources/ffmpeg/SOURCE_OFFER.txt",
        "resources/ffmpeg/SHA256SUMS.txt"
      ]
    }
  }
}
```

注意：Tauri externalBin 对文件命名和平台后缀有要求，实际实现前需用最小样例验证。

备选方案：

1. 将 `ffmpeg.exe` 作为 `resources` 打包。
2. Rust 侧解析资源路径后调用。
3. 不依赖前端 shell 权限。

## 5. 是否需要修改 tauri.conf.json

需要，但应最小化修改。

可能需要新增：

1. `bundle.externalBin`
2. `bundle.resources`

不应新增：

1. `process.all`
2. `shell.all`
3. 额外网络权限
4. 更宽的 `fs.scope`
5. updater

## 6. 是否影响 WebView2 offlineInstaller

不应影响。

WebView2 配置保持：

```json
"webviewInstallMode": {
  "type": "offlineInstaller",
  "silent": true
}
```

sidecar FFmpeg 只增加安装包资源，不改变 WebView2 Runtime 安装策略。

## 7. 安装包体积预计增加

取决于 FFmpeg 构建：

1. LGPL 精简构建：可能增加约 30 MB 到 80 MB。
2. 完整 GPL 构建：可能增加约 80 MB 到 150 MB。
3. 带 ffprobe 和许可证文件后略增。

当前安装包已包含 WebView2 offlineInstaller，约 200 MB 量级。加入 sidecar 后，可能进一步增加到 250 MB 到 350 MB。

实际体积必须以最终构建产物为准。

## 8. 如何记录 SHA256

发布前生成：

```powershell
Get-FileHash .\resources\ffmpeg\bin\ffmpeg.exe -Algorithm SHA256
Get-FileHash .\resources\ffmpeg\bin\ffprobe.exe -Algorithm SHA256
```

写入：

`resources/ffmpeg/SHA256SUMS.txt`

格式：

```text
<SHA256>  bin/ffmpeg.exe
<SHA256>  bin/ffprobe.exe
```

同时写入：

1. `THIRD_PARTY_NOTICES.md`
2. `FFMPEG_LICENSE_NOTICE.md`
3. `OPEN_SOURCE_LICENSES.md`
4. 发布包清单

## 9. 如何保留 FFmpeg 许可证文本

安装目录中必须保留：

1. FFmpeg 许可证文本。
2. 外部库许可证文本。
3. 构建参数。
4. 源码获取方式。
5. 修改声明。

如果是 LGPL 构建，保留 LGPL 文本。

如果是 GPL 构建，保留 GPL 文本，并按 GPL 要求提供源码。

## 10. 如何保留构建参数

将以下内容写入：

`resources/ffmpeg/BUILD_CONFIG.txt`

建议包含：

1. FFmpeg 版本。
2. 下载来源。
3. 构建日期。
4. 构建机器或 CI 信息。
5. 完整 `./configure` 参数。
6. 是否启用 GPL。
7. 是否启用 nonfree。
8. 外部库列表。

## 11. 如何保留源码获取方式

写入：

`resources/ffmpeg/SOURCE_OFFER.txt`

包含：

1. FFmpeg 官方源码链接。
2. 实际使用构建来源。
3. 若有自定义构建，提供对应源码包或仓库地址。
4. 如果按 GPL 发布，说明源码获取期限和方式。

## 12. 如何在开源许可证页面展示

网站和离线软件 `/licenses` 应展示：

1. FFmpeg 使用说明。
2. 构建类型：LGPL 或 GPL。
3. FFmpeg 版本。
4. `ffmpeg.exe` SHA256。
5. `ffprobe.exe` SHA256。
6. 许可证文本入口。
7. 源码获取方式。
8. “正式商业发布前已复核”或“仍需复核”的状态。

## 13. 如何在安装目录中保留 Notices

建议安装目录保留：

```text
licenses/
  THIRD_PARTY_NOTICES.md
  FFMPEG_LICENSE_NOTICE.md
  OPEN_SOURCE_LICENSES.md
  RELEASE_COMPLIANCE_CHECKLIST.md
```

也可放入：

```text
resources/notices/
```

关键是用户安装后离线也能查看。

## 14. 打包风险

需要验证：

1. Tauri externalBin 文件名规则。
2. NSIS 是否正确包含 `ffmpeg.exe`。
3. MSI 是否正确包含 `ffmpeg.exe`。
4. Windows Defender 是否误报。
5. 未签名 exe 的用户体验。
6. 安装目录权限。
7. 卸载时是否清理 sidecar 文件。

## 15. 打包结论

推荐短期技术验证使用 `resources` 打包，降低 Tauri externalBin 命名风险。

推荐长期正式版本使用 Tauri 支持的 sidecar/externalBin 方式，并配套：

1. SHA256。
2. 许可证文本。
3. 构建参数。
4. 源码获取说明。
5. 干净 Windows 10/11 VM 安装验证。
