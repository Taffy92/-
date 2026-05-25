# FINAL_RELEASE_PACKAGE_PREP_REPORT

本轮名称：FINAL_RELEASE_PACKAGE_PREP_ROUND

生成时间：2026-05-25

## 1. release 目录结构

已创建并整理：

```text
release/
  v1.0.0/
    installers/
      万能格式转换器_1.0.0_x64-setup.exe
      万能格式转换器_1.0.0_x64_zh-CN.msi
      SHA256SUMS.txt
    docs/
      RELEASE_NOTES.md
      INSTALL_GUIDE.md
      OFFLINE_PRO_USER_GUIDE.md
      PRIVACY_NOTICE.md
      DOWNLOAD_PAGE_COPY.md
      OPEN_SOURCE_LICENSES.md
      THIRD_PARTY_NOTICES.md
      FFMPEG_LICENSE_NOTICE.md
      RELEASE_COMPLIANCE_CHECKLIST.md
    verification/
      CLEAN_VM_USER_RESULT_SUMMARY.md
      MANUAL_CLEAN_VM_TEST_RESULT_TEMPLATE.md
      LOW_RISK_SIDECAR_DEFAULT_REPORT.md
      FINAL_RELEASE_CHECKLIST.md
```

release 包只包含安装包、面向用户和发布归档需要的文档，没有复制源码、node_modules、target 中间文件或构建缓存。

## 2. 复制的安装包

已从最新桌面打包产物复制：

- 源 EXE：`apps/desktop/src-tauri/target/release/bundle/nsis/万能格式转换器_1.0.0_x64-setup.exe`
- 源 MSI：`apps/desktop/src-tauri/target/release/bundle/msi/万能格式转换器_1.0.0_x64_zh-CN.msi`

发布目录安装包：

- `release/v1.0.0/installers/万能格式转换器_1.0.0_x64-setup.exe`
- `release/v1.0.0/installers/万能格式转换器_1.0.0_x64_zh-CN.msi`
- `release/v1.0.0/installers/SHA256SUMS.txt`

## 3. EXE 信息

- 路径：`D:\万能格式转换器项目\release\v1.0.0\installers\万能格式转换器_1.0.0_x64-setup.exe`
- 大小：257,582,317 bytes，约 245.65 MB
- SHA256：`CFCBBAA5CF9DAF39CF864E5FD59D8B4DFADAA5388112578E6EA21575EBCADE0F`

## 4. MSI 信息

- 路径：`D:\万能格式转换器项目\release\v1.0.0\installers\万能格式转换器_1.0.0_x64_zh-CN.msi`
- 大小：268,914,688 bytes，约 256.46 MB
- SHA256：`BB7E6CE8DEBD3AB41A75372FC407B24A24C8F839B7CF782DC9FA0809DAAE6160`

## 5. 生成的文档

本轮新增或更新：

- `release/v1.0.0/docs/RELEASE_NOTES.md`
- `release/v1.0.0/docs/INSTALL_GUIDE.md`
- `release/v1.0.0/docs/OFFLINE_PRO_USER_GUIDE.md`
- `release/v1.0.0/docs/PRIVACY_NOTICE.md`
- `release/v1.0.0/docs/DOWNLOAD_PAGE_COPY.md`
- `release/v1.0.0/verification/FINAL_RELEASE_CHECKLIST.md`

## 6. 隐私说明

已包含 `release/v1.0.0/docs/PRIVACY_NOTICE.md`，明确说明：

- 图片、文档、音频、视频默认在本地处理；
- 离线专业版支持断网处理；
- 文件内容、输出结果、任务历史、处理日志不上传服务器；
- CloudBase 只用于下载授权，不接触用户处理文件；
- 广告不接收 File、Blob、ArrayBuffer、Canvas 或转换结果。

## 7. 安装指南

已包含 `release/v1.0.0/docs/INSTALL_GUIDE.md`，覆盖：

- Windows 10 / Windows 11 支持；
- EXE / MSI 安装方式；
- 断网安装；
- WebView2 offlineInstaller；
- Defender / SmartScreen 提示；
- SHA256 校验；
- 卸载、重装和常见问题排查。

## 8. 用户指南

已包含 `release/v1.0.0/docs/OFFLINE_PRO_USER_GUIDE.md`，覆盖：

- 添加文件和文件夹；
- 输出目录选择；
- 批量处理、失败重试、取消任务；
- 打开输出目录、打开单个结果文件；
- 导出处理日志；
- 任务历史；
- 图片、Word、Excel、音频、视频批量处理；
- sidecar 低风险格式优先范围和 WASM 回退说明。

## 9. 开源许可证文档

已复制到 `release/v1.0.0/docs/`：

- `OPEN_SOURCE_LICENSES.md`
- `THIRD_PARTY_NOTICES.md`
- `FFMPEG_LICENSE_NOTICE.md`
- `RELEASE_COMPLIANCE_CHECKLIST.md`

## 10. FFmpeg 许可证说明

已包含 FFmpeg WASM、BtbN FFmpeg 候选、sidecar 低风险优先范围、GPL / LGPL 风险、源码获取方式和商业发布前许可证复核提醒。

当前发布材料继续强调：

- 在线版继续使用 FFmpeg WASM；
- 离线专业版保留 FFmpeg WASM 回退；
- 离线专业版 sidecar 优先范围仅限 WAV 转 FLAC、MP4 转 WebM、ffprobe 媒体信息读取；
- MP3、AAC/M4A、MP4/H.264、MOV、AVI、MKV 不属于 sidecar 默认范围；
- BtbN FFmpeg 候选不宣传为已完成商业许可证最终复核；
- 长期仍建议自建 LGPL FFmpeg 并做人工许可证复核。

## 11. 发布合规清单

已包含 `release/v1.0.0/docs/RELEASE_COMPLIANCE_CHECKLIST.md`，用于正式发布前复核隐私、本地处理、开源许可证、FFmpeg、WebView2 和安装包验证事项。

## 12. 是否影响在线版

未修改在线版功能代码。

核查结果：

- `apps/web/out/ffmpeg/ffmpeg-core.js` 存在；
- `apps/web/out/ffmpeg/ffmpeg-core.wasm` 存在；
- `apps/web/out` 未发现 `ffmpeg.exe`、`ffprobe.exe` 或 sidecar DLL；
- 在线版没有引入 sidecar 二进制；
- 在线版仍保持 FFmpeg WASM 音视频能力和批量处理专业版入口策略。

## 13. 是否影响离线专业版

未修改离线专业版核心转换逻辑。

本轮重新执行 `pnpm package:desktop`，生成了最新 EXE / MSI，并复制到 release 目录。

桌面端 sidecar 资源仍存在于 Tauri release resources 中：

- `ffmpeg.exe`
- `ffprobe.exe`
- `avcodec-61.dll`
- `avdevice-61.dll`
- `avfilter-10.dll`
- `avformat-61.dll`
- `avutil-59.dll`
- `swresample-5.dll`
- `swscale-8.dll`

## 14. 是否扩大 sidecar 默认范围

没有扩大。

保持现有边界：

- WAV 转 FLAC：sidecar 优先；
- MP4 转 WebM：sidecar 优先；
- ffprobe 媒体信息读取：sidecar 优先；
- 其他音视频格式继续走 WASM 或按既有逻辑处理。

## 15. 是否扩大 Tauri 权限

没有扩大。

核查 `apps/desktop/src-tauri/tauri.conf.json`：

- `process.all=false`
- `updater.active=false`
- WebView2 `offlineInstaller` 配置保持不变；
- `resources/ffmpeg` 保持在 bundle resources；
- 文件系统 scope 保持上一轮权限收窄后的配置，未在本轮新增权限。

## 16. 是否影响 WebView2 offlineInstaller

没有修改 WebView2 offlineInstaller。

本轮 `package:desktop` 仍正常执行，打包阶段包含 WebView2 offline installer 处理。该下载发生在构建机打包阶段，不属于用户文件处理，也不影响已打包安装包在目标机器的断网安装能力。

## 17. 测试和构建结果

执行命令：

```powershell
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 test
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 build:web
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 --filter web exec tsc --noEmit
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 package:desktop
```

结果：

- `pnpm test`：通过，10 个测试文件，46 个测试通过；
- `pnpm build:web`：通过，Next.js 15.5.18 静态导出成功；
- `pnpm --filter web exec tsc --noEmit`：通过；
- `pnpm package:desktop`：通过，NSIS EXE 和 MSI 均已生成。

备注：`package:desktop` 阶段出现 Node `DEP0190` 警告，属于当前构建链路的非阻塞警告，不影响安装包生成。

## 18. 是否可以上传到服务器或 CloudBase 下载页

可以进入官网 / CloudBase 下载页材料准备阶段。

建议上传对象：

- EXE：`release/v1.0.0/installers/万能格式转换器_1.0.0_x64-setup.exe`
- MSI：`release/v1.0.0/installers/万能格式转换器_1.0.0_x64_zh-CN.msi`
- 校验文件：`release/v1.0.0/installers/SHA256SUMS.txt`
- 下载页文案：`release/v1.0.0/docs/DOWNLOAD_PAGE_COPY.md`
- 用户可见说明：`RELEASE_NOTES.md`、`INSTALL_GUIDE.md`、`PRIVACY_NOTICE.md`、`OPEN_SOURCE_LICENSES.md`

如果下载仍需授权，应继续通过 CloudBase 下载授权口令或后续授权机制分发，不要直接公开未授权下载链接。

## 19. 正式商业发布前仍需完成事项

仍建议完成：

1. 对 BtbN FFmpeg 候选和 FFmpeg WASM 的许可证义务做人工法律/许可证复核；
2. 保留 FFmpeg、WebView2、Tauri、Next.js、PDF.js、ExcelJS 等第三方许可证入口；
3. 在干净 Windows 10 / 11 机器中再次抽检最终 release 目录中的 EXE / MSI，而不是 target 目录中的旧包；
4. 检查 Defender / SmartScreen 提示，并准备用户说明；
5. 根据实际部署域名更新 `NEXT_PUBLIC_SITE_URL`；
6. 如果启用 CloudBase 下载授权，确认云函数只校验下载授权，不接触用户处理文件；
7. 正式商业售卖前补齐授权、退款、服务条款和发票/合同流程。

## 20. 下一轮建议

可以进入官网 / 下载页部署：

- 使用 `DOWNLOAD_PAGE_COPY.md` 更新下载页；
- 上传 release 安装包和 SHA256；
- 配置 CloudBase 静态托管和下载授权；
- 验证下载链接、授权口令、SHA256 展示和隐私说明。

