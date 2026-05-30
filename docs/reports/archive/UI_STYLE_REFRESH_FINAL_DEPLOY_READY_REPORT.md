# UI_STYLE_REFRESH_FINAL_DEPLOY_READY_REPORT

本轮名称：`WEBVIEW2_PACKAGE_RETRY_AND_UI_DEPLOY_DECISION_ROUND`

生成时间：2026-05-25

## 1. WebView2 下载链路是否恢复

未完全恢复。

`curl.exe` 可以访问：

```text
https://go.microsoft.com/fwlink/?linkid=2124701
```

并成功重定向到 Microsoft WebView2 离线安装器下载地址，最终响应 `200 OK`。

但是 `pnpm package:desktop` 中的 Tauri bundler 仍失败于同一链接：

```text
tls connection init failed: unexpected end of file
```

因此只能说明系统命令行 HTTP 工具可访问，Tauri bundler 当前仍不能稳定下载。

## 2. package:desktop 是否完整成功

否。

已执行：

```text
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 package:desktop
```

执行结果：

- Web 静态构建成功；
- Rust release 编译成功；
- NSIS 打包开始执行；
- Tauri bundler 在 WebView2 offlineInstaller 下载阶段失败；
- MSI 未完成重新生成；
- 整体命令退出码为 `1`。

## 3. EXE 是否重新生成

打包失败过程中 NSIS 阶段曾生成 / 覆盖 EXE，但由于整个 `package:desktop` 未完整成功，本轮不把该失败流程中的 EXE 认定为最终正式发布包。

## 4. MSI 是否重新生成

否。

由于 Tauri bundler 在 WebView2 offlineInstaller 下载阶段失败，MSI 没有完成本轮重新生成。

## 5. EXE 最新大小和 SHA256

当前发布目录仍保留上一轮同步的测试发布包：

- 路径：`D:\万能格式转换器项目\release\v1.0.0\installers\万能格式转换器_1.0.0_x64-setup.exe`
- 大小：257,623,312 bytes，约 245.69 MB
- SHA256：`F02981EC18A05D7E5149AEA977D1F1469387595FCF394DE84837E0D6452AEC12`

注意：由于本轮 `package:desktop` 没有完整成功，该文件不应被升级为“最终正式发布包”。

## 6. MSI 最新大小和 SHA256

当前发布目录仍保留上一轮同步的测试发布包：

- 路径：`D:\万能格式转换器项目\release\v1.0.0\installers\万能格式转换器_1.0.0_x64_zh-CN.msi`
- 大小：268,972,032 bytes，约 256.51 MB
- SHA256：`A6D4EB19E0E18024FB85A70571C122D5252708AEE57B9EC0087D6DCC040FAE18`

注意：由于本轮 `package:desktop` 没有完整成功，该文件不应被升级为“最终正式发布包”。

## 7. SHA256SUMS.txt 是否更新

本轮没有重新更新 `SHA256SUMS.txt`。

当前仍为上一轮同步值：

```text
A6D4EB19E0E18024FB85A70571C122D5252708AEE57B9EC0087D6DCC040FAE18  万能格式转换器_1.0.0_x64_zh-CN.msi
F02981EC18A05D7E5149AEA977D1F1469387595FCF394DE84837E0D6452AEC12  万能格式转换器_1.0.0_x64-setup.exe
```

## 8. 下载页 SHA256 是否更新

本轮没有再次更新下载页 SHA256。

下载页仍展示上一轮同步值：

- EXE：`F02981EC18A05D7E5149AEA977D1F1469387595FCF394DE84837E0D6452AEC12`
- MSI：`A6D4EB19E0E18024FB85A70571C122D5252708AEE57B9EC0087D6DCC040FAE18`

## 9. RELEASE_NOTES.md 是否更新

本轮没有再次更新。

当前 `release/v1.0.0/docs/RELEASE_NOTES.md` 与 `apps/web/public/release/v1.0.0/docs/RELEASE_NOTES.md` 保持上一轮同步值。

## 10. 是否仍使用 v1.0.0

是。当前仍使用 `v1.0.0` 测试发布包版本。

## 11. 是否建议升级 v1.0.1

如果安装包已对外分发，建议升级到 `v1.0.1`。

如果尚未大范围发给用户，可以继续使用 `v1.0.0` 作为测试发布包，但必须先解决 WebView2 打包链路，拿到一次完整成功的 `package:desktop` 记录。

## 12. 是否改动 CloudBase 下载授权

未改动。

## 13. 是否改动 createDownloadUrl

未改动。

## 14. 是否改动广告逻辑

未改动。

## 15. 是否改动程序图标

未改动。

## 16. 是否新增登录 / 注册

没有新增。

## 17. 是否新增会员 / VIP

没有新增。

## 18. 是否新增云转换

没有新增。

## 19. 是否影响 Tauri 权限

未影响。

本轮没有修改 `apps/desktop/src-tauri/tauri.conf.json`，没有扩大文件系统、shell、process 或 updater 权限。

## 20. 是否影响 WebView2 offlineInstaller

未影响配置。

WebView2 offlineInstaller 策略仍保持不变，但当前构建机的 Tauri bundler 无法稳定通过 TLS 下载 Microsoft WebView2 离线安装器。

## 21. 是否可以进入 UI_STYLE_REFRESH_DEPLOY_ROUND

建议分开处理：

1. 静态网站 UI 部署：
   - 可以进入 `UI_STYLE_REFRESH_DEPLOY_ROUND`；
   - `apps/web/out` 已经包含 UI 改版和最新下载页展示；
   - 可以只部署静态网页，不上传安装包。

2. 安装包上传：
   - 不建议现在上传为最终正式发布包；
   - 必须先解决 WebView2 bundler TLS 下载问题；
   - 需要完整成功执行 `pnpm package:desktop`，并重新生成 EXE / MSI 后再上传。

建议下一步：

- 如果只想让官网先展示新 UI，可以部署静态托管；
- 如果要发布安装包，请先进入 WebView2 本地缓存 / 本地离线安装器专项，或等待网络环境稳定后重新打包。

