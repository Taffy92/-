# WEBVIEW2_LOCAL_OFFLINE_INSTALLER_CACHE_REPORT

本轮名称：`WEBVIEW2_LOCAL_OFFLINE_INSTALLER_CACHE_ROUND`

日期：2026-05-25

## 结论

本轮没有修改 UI、广告逻辑、程序图标、CloudBase 下载授权、`createDownloadUrl`、EXE/MSI 下载口令流程、Tauri 权限、WebView2 安装策略、sidecar/WASM 范围或核心转换逻辑。

在不修改 `tauri.conf.json` 的前提下，已确认本机 Tauri WebView2 离线安装器缓存完整，并重新执行 `package:desktop`。本次 `pnpm package:desktop` 已完整成功，NSIS EXE 和 MSI 均重新生成。随后已同步 `release/v1.0.0`、下载页配置、公开 SHA256 文件和发布说明，并重新执行 `build:web` 与 TypeScript 检查，均通过。

## WebView2 本地离线安装器缓存

缓存文件：

`C:\Users\Administrator\AppData\Local\tauri\x64\f7cb0b3e-1aa1-43fc-af27-ef73fd70d744\MicrosoftEdgeWebView2RuntimeInstallerX64.exe`

| 检查项 | 结果 |
| --- | --- |
| 文件是否存在 | 是 |
| 文件大小 | 199,272,184 bytes |
| 预期大小 | 199,272,184 bytes |
| 大小是否匹配 | 是 |
| SHA256 | `17BF623316D69C4E096365D9AE589316FED446531D7E30EBC3E5ABCAF582E603` |
| 预期 SHA256 | `17BF623316D69C4E096365D9AE589316FED446531D7E30EBC3E5ABCAF582E603` |
| SHA256 是否匹配 | 是 |
| Authenticode 签名 | Valid |
| 签名主体 | Microsoft Corporation |
| 产品信息 | Microsoft Edge Update |
| 文件说明 | Microsoft Edge Update Setup |
| 产品版本 | 1.3.233.3 |

补充验证：

- `/?` 参数查询会启动该安装器，但 15 秒内未自动退出，已主动终止查询进程；未发现文件损坏或签名异常。
- 文件大小与 Microsoft WebView2 offlineInstaller 链接返回的 `Content-Length: 199272184` 一致。
- 结合官方下载链接、Tauri 默认缓存路径、文件大小、SHA256 和 Microsoft 有效签名，判断该文件适合用于本机 Tauri 打包缓存。

## Tauri WebView2 配置检查

当前配置仍为：

```json
{
  "type": "offlineInstaller",
  "silent": true
}
```

Tauri 版本：

- `@tauri-apps/cli`: 1.6.3
- `tauri`: 1.6
- `tauri-build`: 1.5

配置能力检查：

- Tauri 1.x schema 中 `offlineInstaller` 只支持 `type` 和 `silent`。
- 未发现 `offlineInstaller` 显式本地路径字段。
- `fixedRuntime.path` 是另一种运行时方案，不等同于 Evergreen Standalone offlineInstaller，本轮未切换。
- 本轮采用最小方案：复用 Tauri 默认缓存，不修改配置。

## 打包结果

执行命令：

```powershell
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 package:desktop
```

结果：完整成功。

Tauri 输出：

- `D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\nsis\万能格式转换器_1.0.0_x64-setup.exe`
- `D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\msi\万能格式转换器_1.0.0_x64_zh-CN.msi`

## 最新安装包

| 文件 | 大小 | SHA256 |
| --- | ---: | --- |
| `D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\nsis\万能格式转换器_1.0.0_x64-setup.exe` | 257,626,830 bytes / 245.69 MB | `0C86FC2BFDA97297A2858337E7BA67AD7AD275F063D8095D7CCD841A82F8F0D1` |
| `D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\msi\万能格式转换器_1.0.0_x64_zh-CN.msi` | 268,967,936 bytes / 256.51 MB | `A4F42391A8272AB4041FFEC34015BFED90D606531011BC62ABB3F91F63623C0D` |

已同步到：

- `D:\万能格式转换器项目\release\v1.0.0\installers\万能格式转换器_1.0.0_x64-setup.exe`
- `D:\万能格式转换器项目\release\v1.0.0\installers\万能格式转换器_1.0.0_x64_zh-CN.msi`

## 已同步文件

已更新：

- `D:\万能格式转换器项目\release\v1.0.0\installers\SHA256SUMS.txt`
- `D:\万能格式转换器项目\apps\web\src\config\downloads.ts`
- `D:\万能格式转换器项目\apps\web\src\generated\thirdPartyNotices.ts`
- `D:\万能格式转换器项目\release\v1.0.0\docs\RELEASE_NOTES.md`
- `D:\万能格式转换器项目\release\v1.0.0\docs\THIRD_PARTY_NOTICES.md`
- `D:\万能格式转换器项目\apps\web\public\release\v1.0.0\installers\SHA256SUMS.txt`
- `D:\万能格式转换器项目\apps\web\public\release\v1.0.0\docs\RELEASE_NOTES.md`
- `D:\万能格式转换器项目\apps\web\public\release\v1.0.0\docs\THIRD_PARTY_NOTICES.md`

`SHA256SUMS.txt` 当前内容：

```text
A4F42391A8272AB4041FFEC34015BFED90D606531011BC62ABB3F91F63623C0D  万能格式转换器_1.0.0_x64_zh-CN.msi
0C86FC2BFDA97297A2858337E7BA67AD7AD275F063D8095D7CCD841A82F8F0D1  万能格式转换器_1.0.0_x64-setup.exe
```

已验证：

- `release/v1.0.0/installers/SHA256SUMS.txt` 与最新 EXE/MSI 一致。
- `apps/web/public/release/v1.0.0/installers/SHA256SUMS.txt` 与最新 EXE/MSI 一致。
- 下载页配置中的 EXE/MSI SHA256 与 `SHA256SUMS.txt` 一致。
- `RELEASE_NOTES.md` 中的 EXE/MSI SHA256 与 `SHA256SUMS.txt` 一致。
- 未发现旧哈希残留：`F02981EC...`、`A6D4EB19...`、`357BB684...`、`9C530EEC...`。

## 验证命令

已执行：

```powershell
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 build:web
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 --filter web exec tsc --noEmit
```

结果：

- `build:web`：通过。
- `tsc --noEmit`：通过。
- `apps/web/out/release/v1.0.0/installers/SHA256SUMS.txt` 已包含最新 EXE/MSI SHA256。
- `apps/web/out/release/v1.0.0/docs/RELEASE_NOTES.md` 已包含最新 EXE/MSI SHA256。

## 逐项结论

1. 本地 WebView2 离线安装器是否存在：是。
2. 文件大小是否匹配：是，199,272,184 bytes。
3. SHA256 是否匹配：是。
4. 是否确认是 Microsoft WebView2 Evergreen Standalone Installer：根据 Microsoft 官方链接、Tauri 缓存路径、文件大小、SHA256 和 Microsoft 有效签名，可作为本机 Tauri WebView2 offlineInstaller 缓存使用。
5. 是否修改 `tauri.conf.json`：否。
6. 是否仍保持 `offlineInstaller`：是。
7. 是否切回 `downloadBootstrapper`：否。
8. 是否降低断网安装能力：否。
9. `package:desktop` 是否完整成功：是。
10. EXE 是否重新生成：是。
11. MSI 是否重新生成：是。
12. EXE 最新大小和 SHA256：257,626,830 bytes，`0C86FC2BFDA97297A2858337E7BA67AD7AD275F063D8095D7CCD841A82F8F0D1`。
13. MSI 最新大小和 SHA256：268,967,936 bytes，`A4F42391A8272AB4041FFEC34015BFED90D606531011BC62ABB3F91F63623C0D`。
14. `SHA256SUMS.txt` 是否更新：是。
15. 下载页 SHA256 是否更新：是。
16. `RELEASE_NOTES.md` 是否更新：是。
17. 是否改动 CloudBase 下载授权：否。
18. 是否改动 `createDownloadUrl`：否。
19. 是否改动广告逻辑：否。
20. 是否改动程序图标：否。
21. 是否新增登录 / 注册：否。
22. 是否新增会员 / VIP：否。
23. 是否新增云转换：否。
24. 是否影响 Tauri 权限：否。
25. 是否影响 WebView2 offlineInstaller：未改变策略，仍为 `offlineInstaller`。
26. 是否可以进入 `UI_STYLE_REFRESH_DEPLOY_ROUND`：可以。当前静态站点、下载页 SHA256、release 目录和安装包已一致；本轮不自动部署。

## 仍需注意

- 本轮解决的是构建机上 Tauri bundler 下载链路不稳定问题，并拿到了一次完整成功的打包记录。
- 正式上传 CloudBase 前，建议只上传本轮同步后的 `release/v1.0.0/installers` 中两个安装包和对应 `SHA256SUMS.txt`。
- 不要上传旧安装包，避免下载页 SHA256 与实际文件不一致。
