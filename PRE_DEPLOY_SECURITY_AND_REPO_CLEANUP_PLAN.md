# PRE_DEPLOY_SECURITY_AND_REPO_CLEANUP_PLAN

本轮名称：`PRE_DEPLOY_SECURITY_AND_REPO_CLEANUP_ROUND`

日期：2026-05-25

## 目标边界

本轮只做发布前安全和仓库清理，不做 UI 改版，不新增功能，不改变转换逻辑，不改变广告位，不改变程序图标，不改变 EXE/MSI 下载口令业务流程，不改变 Tauri 权限，不改变 WebView2 offlineInstaller，不改变 sidecar/WASM 当前范围，不新增云转换，不上传用户处理文件。

## 1. 当前 Git 未跟踪文件分类

当前仓库几乎所有文件都处于未跟踪状态，说明该目录更像“已迁移后的工作区快照”，还没有完成源码、发布归档、生成产物之间的版本管理边界划分。

### A. 应该提交的源码文件

- `apps/`
  - `apps/web/src/**`
  - `apps/web/scripts/**`
  - `apps/web/next.config.mjs`
  - `apps/web/package.json`
  - `apps/web/vercel.json`
  - `apps/web/cloudbaserc.json`
  - `apps/desktop/src/**`
  - `apps/desktop/src-tauri/src/**`
  - `apps/desktop/src-tauri/tauri.conf.json`
  - `apps/desktop/src-tauri/Cargo.toml`
  - `apps/desktop/src-tauri/Cargo.lock`
  - `apps/desktop/src-tauri/resources/ffmpeg/**`（sidecar 实验资源及许可证归档）
- `packages/**`
- `cloudbase/functions/createDownloadUrl/**`，但不包括其 `node_modules/`
- `scripts/**`
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- `.env.example`
- `LICENSE`
- `README.md`

### B. 应该提交的文档文件

- `docs/**`
- 根目录发布前审查报告中的关键文档，例如：
  - `PRIVACY_SECURITY_AUDIT.md`
  - `THIRD_PARTY_NOTICES.md`
  - `OPEN_SOURCE_LICENSES.md`
  - `FFMPEG_LICENSE_NOTICE.md`
  - `RELEASE_COMPLIANCE_CHECKLIST.md`
  - `UI_STYLE_REFRESH_REPORT.md`
  - `WEBVIEW2_LOCAL_OFFLINE_INSTALLER_CACHE_REPORT.md`
  - 本轮新增的计划和报告文件

其他大量阶段性报告可以保留为项目审计证据，但建议后续归档到 `docs/audits/` 或 `docs/release-history/`，避免根目录长期膨胀。

### C. 应该提交或单独归档的 release 文件

- `release/v1.0.0/docs/**`
- `release/v1.0.0/installers/SHA256SUMS.txt`
- 是否提交 EXE/MSI 二进制需要人工确认。

建议：

- 如果当前仓库只是本地交付仓库，可以保留 `release/v1.0.0/installers/*.exe` 和 `*.msi` 作发布归档。
- 如果未来推送到 GitHub/GitLab，建议不要提交大型 EXE/MSI 到普通 Git 仓库，而是放到 CloudBase/COS/Release 附件，并只提交 `SHA256SUMS.txt` 和 release 文档。
- 本轮不删除 `release/v1.0.0`，只在报告中标明策略。

### D. 不应该提交的生成产物

- `apps/web/.next/`
- `apps/web/out/`
- `apps/desktop/src-tauri/target/`
- `target/`
- `.next/`
- 任何构建中间目录

### E. 不应该提交的依赖目录

- `node_modules/`
- `apps/**/node_modules/`
- `cloudbase/functions/**/node_modules/`
- `.pnpm-home/`

### F. 不应该提交的缓存、日志、临时文件

- `*.log`
- `*.tmp`
- `.tmp/`
- `.icon-tmp/`
- `desktop-preview*.png`
- `preview-*.png`
- `web-renamed-preview.png`
- `web-preview*.log`
- `desktop-preview*.log`
- `verification/out/`
- `verification/**/*.tmp`
- `verification/**/*.log`

### G. 需要人工确认的文件

- `.agents/`
- `.codex/`
- `skills-lock.json`
- `verification/**`
- 根目录大量阶段性报告是否全部提交，还是整理到文档归档目录。
- `release/v1.0.0/installers/*.exe` 与 `*.msi` 是否纳入 Git。

## 2. `.gitignore` 方案

新增 `.gitignore`，至少忽略：

- 依赖目录：`node_modules/`、`**/node_modules/`、`.pnpm-home/`
- 构建产物：`.next/`、`apps/web/.next/`、`apps/web/out/`、`apps/desktop/src-tauri/target/`、`target/`
- 日志临时：`*.log`、`*.tmp`、`.tmp/`、`.icon-tmp/`
- verification 临时输出：`verification/out/`、`verification/**/*.tmp`、`verification/**/*.log`
- 本地预览截图：`desktop-preview*.png`、`preview-*.png`、`web-renamed-preview.png`

不忽略：

- `release/v1.0.0/docs/**`
- `release/v1.0.0/installers/SHA256SUMS.txt`
- `apps/web/public/release/**`
- `cloudbase/functions/createDownloadUrl/index.js`
- 许可证和 Notices 文档

EXE/MSI 是否忽略：本轮不默认忽略 `release/v1.0.0/installers/*.exe` / `*.msi`，因为用户明确要求不要删除正式发布归档。报告会建议后续按发布平台策略决定。

## 3. 安全 Header / CSP 修复方案

修改 `apps/web/next.config.mjs`，增加 `headers()`：

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=()`
- `X-Frame-Options: DENY`
- `Content-Security-Policy`

CSP 最小可用策略需要兼容：

- Next 静态资源：`'self'`
- PDF.js worker 和静态资源：`worker-src 'self' blob:`
- FFmpeg WASM / worker：`script-src 'self' 'unsafe-eval' blob:`、`worker-src 'self' blob:`、`connect-src 'self' blob: data:`
- browser-image-compression 本地 worker：`worker-src 'self' blob:`
- 广告脚本：Google AdSense / DoubleClick / 百度统计或百度广告域名
- CloudBase 下载授权：通过环境变量配置的云函数地址，当前 CSP 将允许 `https:` 连接，但仍不允许用户文件上传，网络上传由业务代码和 `networkGuard` 约束

说明：

- `output: "export"` 的纯静态产物在 CloudBase 静态托管中是否应用这些 headers，取决于托管平台是否读取 Next headers。Vercel 可按配置处理；CloudBase 可能还需要在控制台或托管配置中单独设置响应头。本轮仍在 Next 配置中加入 hardened headers，并在报告中说明 CloudBase 侧需要复核。
- 不为了“看起来更安全”写会破坏 PDF.js、FFmpeg WASM、worker 或广告的 CSP。

## 4. CloudBase `createDownloadUrl` CORS / ALLOWED_ORIGIN 修复方案

修改 `cloudbase/functions/createDownloadUrl/index.js`，保持现有业务流程不变：

- 保留 `DOWNLOAD_PASSWORD`
- 保留 `crypto.timingSafeEqual`
- 保留 `packageType=exe/msi`
- 保留短时临时链接
- 不接收用户处理文件

新增或强化：

- 读取 `ALLOWED_ORIGIN`
- 支持多个 Origin，使用逗号分隔
- 校验请求 `Origin`
- `OPTIONS` 预检正确返回
- 设置：
  - `Access-Control-Allow-Origin`
  - `Vary: Origin`
  - `Access-Control-Allow-Methods: POST, OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type`
- 非法 Origin 返回 `403`
- 非法 `packageType` 返回 `400`，不再静默回退到 `exe`
- 错误响应不泄露环境变量
- 日志只记录授权结果、原因、包类型、Origin、User-Agent，不记录口令、不记录临时 URL、不记录用户处理文件

如 CloudBase 环境没有 `Origin` header：

- 对 server-to-server 或同源无 Origin 请求，可根据 `ALLOWED_ORIGIN` 策略决定是否放行。
- 本轮建议：如果配置了 `ALLOWED_ORIGIN`，浏览器跨域请求必须匹配；无 Origin 请求用于健康检查和直接服务访问，不返回敏感下载链接，POST 默认仍需口令。

## 5. 在线大文件硬限制方案

修改 `ToolsClient.tsx`，在真正创建 ObjectURL、读取图片、读取 PDF 页数、读取 Word/Excel、进入 FFmpeg WASM 之前硬拦截在线版超限文件。

策略：

- 仅在线版生效：`!isDesktopSurface`
- 离线专业版不受影响
- 检查位置：`handleFile(nextFile)` 文件类型确认之后，`URL.createObjectURL` 和 `summarizeFile` 之前
- 超限后：
  - 清空当前文件和预览
  - 不设置 `file`
  - 不创建 ObjectURL
  - 不执行 `summarizeFile`
  - 显示清楚提示

建议文案：

`当前文件较大，在线版可能受浏览器内存限制。请使用 Windows 离线专业版进行大文件或批量处理，文件仍在本机处理，不上传服务器。`

当前统一限制：

- `maxOnlineFileSize = 80 * 1024 * 1024`

后续可按类型细化：

- 图片：50MB
- PDF/Word/Excel：80MB
- 音视频：200MB

本轮优先做不改变功能边界的统一硬拦截，避免影响现有测试和 UI 文案。

## 6. 许可证和 Notices 保留方案

检查并保留：

- `THIRD_PARTY_NOTICES.md`
- `OPEN_SOURCE_LICENSES.md`
- `FFMPEG_LICENSE_NOTICE.md`
- `RELEASE_COMPLIANCE_CHECKLIST.md`
- `apps/web/src/generated/thirdPartyNotices.ts`
- `release/v1.0.0/docs/**`
- `apps/web/public/release/v1.0.0/docs/**`

必须继续包含：

- `@ffmpeg/core` WASM 许可证说明
- sidecar FFmpeg / BtbN 来源说明
- GPL / LGPL 风险说明
- source offer / 源码获取说明
- FFmpeg 许可证入口
- 商业发布前人工复核提醒

不得出现：

- “已完成 FFmpeg 商业许可证最终复核”
- “绝对安全”
- “完全无风险”

## 7. 风险和回滚方案

### 风险

- CSP 过严会导致 PDF.js、FFmpeg WASM、worker、广告或 CloudBase 下载授权不可用。
- CloudBase CORS 限制如果 `ALLOWED_ORIGIN` 配错，会导致下载页无法获取临时链接。
- 在线硬限制可能改变用户上传大文件时的体验，但这是发布前必要风险控制。
- `.gitignore` 可能让生成产物不再显示在 `git status`，但不会删除文件。

### 回滚

- `next.config.mjs`：移除新增 `headers()` 即可回滚安全头。
- `createDownloadUrl/index.js`：回退 CORS helper 和严格 `packageType` 校验即可恢复旧逻辑。
- `ToolsClient.tsx`：移除在线版硬拦截分支即可恢复旧提示行为。
- `.gitignore`：删除或调整对应规则，不影响实际文件。

## 8. 验收

修复后执行：

```powershell
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 test
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 build:web
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 --filter web exec tsc --noEmit
```

CloudBase 函数脚本级测试：

- 正确口令 + `packageType=exe`
- 正确口令 + `packageType=msi`
- 错误口令
- 非法 `packageType`
- 非法 `Origin`
- `OPTIONS` 预检

若未修改桌面端和安装包内容，不重新执行 `package:desktop`。
