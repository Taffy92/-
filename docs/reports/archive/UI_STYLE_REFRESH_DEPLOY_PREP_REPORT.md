# UI_STYLE_REFRESH_DEPLOY_PREP_ROUND 报告

本轮名称：`UI_STYLE_REFRESH_DEPLOY_PREP_ROUND`

生成时间：2026-05-25

## 1. 是否继续使用 v1.0.0

本轮按用户要求，在没有明确要求升级版本的情况下，继续使用 `v1.0.0` 作为测试发布包版本。

判断：

- 如果 `v1.0.0` 还没有正式大范围发给用户，可以继续覆盖测试发布包。
- 如果 `v1.0.0` 已经发给外部用户，建议下一轮改为 `v1.0.1`，避免旧安装包和新安装包 SHA256 混淆。

## 2. 是否建议升级 v1.0.1

建议：

- 当前阶段：继续 `v1.0.0` 测试发布包。
- 正式对外发布或已经分发给用户后：建议升级到 `v1.0.1`。

如果继续 `v1.0.0`，需要同步：

- `release/v1.0.0/installers/SHA256SUMS.txt`
- `apps/web/src/config/downloads.ts`
- `release/v1.0.0/docs/RELEASE_NOTES.md`
- `apps/web/public/release/v1.0.0/docs/RELEASE_NOTES.md`
- `apps/web/public/release/v1.0.0/installers/SHA256SUMS.txt`
- `apps/web/out/release/v1.0.0/...` 静态导出产物

如果改为 `v1.0.1`，需要更新：

- Tauri / package 版本号；
- EXE / MSI 文件名；
- `downloadsConfig.version`；
- `release/v1.0.1/` 目录；
- CloudBase 云存储路径 `installers/v1.0.1/`；
- `createDownloadUrl` 中安装包路径映射；
- 下载页和所有发布文档中的版本号、路径、SHA256。

## 3. release 目录是否已同步最新安装包

已同步。

安装包已复制到：

- `D:\万能格式转换器项目\release\v1.0.0\installers\万能格式转换器_1.0.0_x64-setup.exe`
- `D:\万能格式转换器项目\release\v1.0.0\installers\万能格式转换器_1.0.0_x64_zh-CN.msi`

同时已同步静态站点公开校验材料：

- `D:\万能格式转换器项目\apps\web\public\release\v1.0.0\installers\SHA256SUMS.txt`
- `D:\万能格式转换器项目\apps\web\public\release\v1.0.0\docs\RELEASE_NOTES.md`

注意：`apps/web/public/release/v1.0.0/installers/` 只同步 `SHA256SUMS.txt`，没有公开放入 EXE / MSI 安装包，下载仍走 CloudBase 授权口令流程。

## 4. 最新 EXE 路径、大小、SHA256

源文件：

- `D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\nsis\万能格式转换器_1.0.0_x64-setup.exe`

发布目录文件：

- `D:\万能格式转换器项目\release\v1.0.0\installers\万能格式转换器_1.0.0_x64-setup.exe`

信息：

- 大小：257,623,312 bytes，约 245.69 MB
- SHA256：`F02981EC18A05D7E5149AEA977D1F1469387595FCF394DE84837E0D6452AEC12`

## 5. 最新 MSI 路径、大小、SHA256

源文件：

- `D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\msi\万能格式转换器_1.0.0_x64_zh-CN.msi`

发布目录文件：

- `D:\万能格式转换器项目\release\v1.0.0\installers\万能格式转换器_1.0.0_x64_zh-CN.msi`

信息：

- 大小：268,972,032 bytes，约 256.51 MB
- SHA256：`A6D4EB19E0E18024FB85A70571C122D5252708AEE57B9EC0087D6DCC040FAE18`

## 6. SHA256SUMS.txt 是否已更新

已更新。

文件：

- `D:\万能格式转换器项目\release\v1.0.0\installers\SHA256SUMS.txt`
- `D:\万能格式转换器项目\apps\web\public\release\v1.0.0\installers\SHA256SUMS.txt`
- `D:\万能格式转换器项目\apps\web\out\release\v1.0.0\installers\SHA256SUMS.txt`

内容：

```text
A6D4EB19E0E18024FB85A70571C122D5252708AEE57B9EC0087D6DCC040FAE18  万能格式转换器_1.0.0_x64_zh-CN.msi
F02981EC18A05D7E5149AEA977D1F1469387595FCF394DE84837E0D6452AEC12  万能格式转换器_1.0.0_x64-setup.exe
```

## 7. 下载页 SHA256 是否已更新

已更新。

更新文件：

- `D:\万能格式转换器项目\apps\web\src\config\downloads.ts`
- `D:\万能格式转换器项目\apps\web\out\download\index.html`
- `D:\万能格式转换器项目\apps\web\out\download\index.txt`

下载页显示：

- EXE：`F02981EC18A05D7E5149AEA977D1F1469387595FCF394DE84837E0D6452AEC12`
- MSI：`A6D4EB19E0E18024FB85A70571C122D5252708AEE57B9EC0087D6DCC040FAE18`

## 8. RELEASE_NOTES.md 是否已更新

已更新。

更新文件：

- `D:\万能格式转换器项目\release\v1.0.0\docs\RELEASE_NOTES.md`
- `D:\万能格式转换器项目\apps\web\public\release\v1.0.0\docs\RELEASE_NOTES.md`
- `D:\万能格式转换器项目\apps\web\out\release\v1.0.0\docs\RELEASE_NOTES.md`

## 9. 是否改动 CloudBase 下载授权

未改动。

未修改：

- `D:\万能格式转换器项目\cloudbase\functions\createDownloadUrl\index.js`
- CloudBase 环境变量
- 下载口令
- 临时下载链接生成逻辑

## 10. 是否改动 createDownloadUrl

未改动。

## 11. 是否改动 EXE / MSI 下载口令流程

未改动。

前端仍通过 `DownloadAuthBox` 使用原 `downloadAuthConfig.endpoint`，按 `packageType=exe` 或 `packageType=msi` 获取授权下载链接。

## 12. 是否改动广告逻辑

未改动。

保留：

- `AdSlot`
- `adsConfig`
- `<div id="ad-container">`
- 首页、工具页、下载页、教程页原广告位置

## 13. 是否改动程序图标

未改动。

网页仍使用：

- `/icons/app-icon-64.png`

Tauri 图标配置未修改。

## 14. 是否新增登录 / 注册

没有新增。

## 15. 是否新增会员 / VIP

没有新增。

## 16. 是否新增云转换

没有新增。

服务器和 CloudBase 仍只用于静态站点、下载授权和临时下载链接，不接收用户处理文件，不做云端转换。

## 17. 是否影响在线版功能

未改动在线版转换核心逻辑。

在线版仍保持：

- 图片处理本地完成；
- PDF / Word / Excel 转图片本地完成；
- 音频 / 视频转换继续使用本地 FFmpeg WASM；
- 批量处理入口继续引导离线专业版。

## 18. 是否影响离线专业版批量功能

未改动离线专业版批量队列逻辑。

## 19. 是否影响 Tauri 权限

未改动 Tauri 权限。

`apps/desktop/src-tauri/tauri.conf.json` 未在本轮修改。

## 20. 是否影响 WebView2 offlineInstaller

未修改 WebView2 offlineInstaller 配置。

但是本轮执行 `pnpm package:desktop` 时，Tauri 打包过程需要访问 Microsoft WebView2 offlineInstaller 下载地址：

```text
https://go.microsoft.com/fwlink/?linkid=2124701
```

两次执行均失败于 TLS 连接：

```text
Connection Failed: tls connection init failed: unexpected end of file
```

说明：

- 这是外部 WebView2 下载链路问题；
- 本轮未修改 WebView2 配置；
- 第一次失败前已生成新的 NSIS EXE；
- MSI 文件沿用上一轮成功打包产物；
- 严格发布前建议在网络可访问该 Microsoft 链接时重新执行一次 `pnpm package:desktop`，拿到完整成功的桌面打包记录。

## 21. 测试和构建结果

已执行：

```text
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 test
```

结果：

- 10 个测试文件通过；
- 46 个测试通过。

已执行：

```text
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 build:web
```

结果：

- Next.js 15.5.18 构建通过；
- 静态导出成功；
- 下载页和 `/release/v1.0.0/` 静态文档中已包含最新 SHA256。

已执行：

```text
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 --filter web exec tsc --noEmit
```

结果：

- 通过。

已执行两次：

```text
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 package:desktop
```

结果：

- Web 构建通过；
- Rust release 编译通过；
- 桌面打包阶段失败于 Microsoft WebView2 offlineInstaller 下载链接 TLS 连接；
- 未改配置，未扩大权限，未改变安装包策略。

## 22. 下一轮是否可以进入 UI_STYLE_REFRESH_DEPLOY_ROUND

可以进入 `UI_STYLE_REFRESH_DEPLOY_ROUND`，但建议分两种处理：

1. 只部署静态站点和下载页：
   - 可以继续；
   - `apps/web/out` 已准备好；
   - 下载页和 `SHA256SUMS.txt` 已同步最新 hash。

2. 重新上传 EXE / MSI 安装包：
   - 可以上传当前 `release/v1.0.0/installers/` 中的安装包；
   - 但更稳妥的发布做法是先在 Microsoft WebView2 链接可访问时重新跑一次 `pnpm package:desktop`，拿到完整成功的打包记录后再上传安装包。

本轮没有自动部署到 CloudBase，没有执行 `tcb hosting deploy`，没有上传安装包。

