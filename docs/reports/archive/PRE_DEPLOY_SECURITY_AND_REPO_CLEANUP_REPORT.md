# PRE_DEPLOY_SECURITY_AND_REPO_CLEANUP_REPORT

本轮名称：`PRE_DEPLOY_SECURITY_AND_REPO_CLEANUP_ROUND`

日期：2026-05-25

## 结论

本轮已完成发布前安全和仓库清理的最小修复：

- 新增 `.gitignore`，明确忽略依赖、构建产物、缓存、日志和临时验证输出。
- 为 `apps/web/next.config.mjs` 增加安全响应头和 CSP 配置。
- 同步增强 `apps/web/vercel.json` 的安全 headers，因为 `output: "export"` 下 Next 自身 `headers()` 不会自动写入纯静态导出结果。
- 强化 CloudBase `createDownloadUrl` 的 CORS / `ALLOWED_ORIGIN` 校验、`OPTIONS` 预检、非法 Origin 和非法 `packageType` 响应。
- 将在线版大文件处理从“提示”改为“处理前硬拦截”，并保证在 `URL.createObjectURL`、文件摘要解析、PDF/Office/媒体读取之前发生。
- 保留 FFmpeg / GPL / LGPL / BtbN / source offer / 商业发布前人工复核等许可证说明。

未改动：

- UI 风格
- 广告位和广告逻辑
- 程序图标
- EXE / MSI 下载口令业务流程
- CloudBase 临时下载链接业务模式
- Tauri 权限
- WebView2 offlineInstaller
- sidecar / WASM 当前范围
- 核心转换逻辑
- 离线专业版批量任务队列、输出目录、任务历史

未新增：

- 云端转换
- 用户文件上传
- 登录 / 注册 / 会员

## 1. 修改了哪些文件

新增：

- `.gitignore`
- `PRE_DEPLOY_SECURITY_AND_REPO_CLEANUP_PLAN.md`
- `PRE_DEPLOY_SECURITY_AND_REPO_CLEANUP_REPORT.md`
- `cloudbase/functions/createDownloadUrl/security.js`
- `apps/web/src/tests/cloudbaseDownloadAuth.test.ts`
- `scripts/test-create-download-url.cjs`

修改：

- `apps/web/next.config.mjs`
- `apps/web/vercel.json`
- `cloudbase/functions/createDownloadUrl/index.js`
- `apps/web/src/components/tools/ToolsClient.tsx`
- `apps/web/src/tests/privacy.test.ts`

## 2. Git 未跟踪文件分类

当前工作区仍有大量未跟踪文件，因为项目迁移后的源码、报告、发布归档和产物尚未正式纳入 Git 管理。

### A. 建议提交的源码文件

- `.env.example`
- `.gitignore`
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- `apps/**`，但排除 `apps/web/.next/`、`apps/web/out/`、`apps/desktop/src-tauri/target/`、`apps/**/node_modules/`
- `packages/**`
- `cloudbase/functions/createDownloadUrl/**`，但排除 `cloudbase/functions/createDownloadUrl/node_modules/`
- `scripts/**`
- `public/**`
- `docs/**`

### B. 建议提交的文档文件

- `README.md`
- `LICENSE`
- `THIRD_PARTY_NOTICES.md`
- `OPEN_SOURCE_LICENSES.md`
- `FFMPEG_LICENSE_NOTICE.md`
- `RELEASE_COMPLIANCE_CHECKLIST.md`
- `PRIVACY_SECURITY_AUDIT.md`
- `UI_STYLE_REFRESH_REPORT.md`
- `WEBVIEW2_LOCAL_OFFLINE_INSTALLER_CACHE_REPORT.md`
- `PRE_DEPLOY_SECURITY_AND_REPO_CLEANUP_PLAN.md`
- `PRE_DEPLOY_SECURITY_AND_REPO_CLEANUP_REPORT.md`

根目录大量阶段性报告建议后续整理到 `docs/audits/` 或 `docs/release-history/`，但本轮没有移动或删除。

### C. 建议保留的 release 归档文件

- `release/v1.0.0/docs/**`
- `release/v1.0.0/installers/SHA256SUMS.txt`
- `release/v1.0.0/installers/*.exe`
- `release/v1.0.0/installers/*.msi`

策略说明：

- 本轮不删除 `release/v1.0.0`。
- 如果这是私有发布仓库，可以保留 EXE/MSI 作为发布归档。
- 如果将来推送到公开 Git 仓库，建议只提交文档和 `SHA256SUMS.txt`，EXE/MSI 放 CloudBase/COS/Release 附件，避免 Git 仓库膨胀。

### D/E. 不建议提交的生成产物和依赖目录

已通过 `.gitignore` 忽略：

- `node_modules/`
- `**/node_modules/`
- `.pnpm-home/`
- `.next/`
- `apps/web/.next/`
- `apps/web/out/`
- `out/`
- `apps/desktop/src-tauri/target/`
- `target/`

当前目录体积参考：

| 路径 | 文件数 | 大小 |
| --- | ---: | ---: |
| `apps/web/.next` | 189 | 172.75 MB |
| `apps/web/out` | 275 | 44.18 MB |
| `apps/desktop/src-tauri/target` | 8073 | 3128.77 MB |
| `node_modules` | 39419 | 2796.61 MB |
| `.pnpm-home` | 34979 | 3774.22 MB |
| `release` | 16 | 502.41 MB |
| `verification` | 298 | 418.08 MB |
| `cloudbase/functions/createDownloadUrl/node_modules` | 5321 | 14.26 MB |

### F. 不建议提交的缓存、日志、临时文件

已忽略：

- `*.log`
- `*.tmp`
- `.tmp/`
- `.icon-tmp/`
- `.DS_Store`
- `Thumbs.db`
- `desktop-preview*.png`
- `preview-*.png`
- `web-renamed-preview.png`
- `verification/out/`
- `verification/**/*.tmp`
- `verification/**/*.log`

### G. 需要人工确认的文件

- `.agents/`
- `.codex/`
- `skills-lock.json`
- `verification/**`
- 根目录大量阶段性报告是否全部提交，还是移动到审计归档目录。
- EXE/MSI 是否进入 Git 版本管理。

## 3. `.gitignore` 修改内容

新增 `.gitignore`，覆盖：

- Node / pnpm 依赖
- Next 静态构建产物
- Tauri / Rust target
- 日志和临时文件
- 本地预览截图
- verification 临时输出

没有忽略：

- `release/v1.0.0/docs/**`
- `release/v1.0.0/installers/SHA256SUMS.txt`
- `apps/web/public/release/**`
- `cloudbase/functions/createDownloadUrl/index.js`
- `cloudbase/functions/createDownloadUrl/security.js`
- 许可证文档

`release/v1.0.0/installers/*.exe` 和 `*.msi` 本轮没有加入 ignore，原因是用户要求不要删除正式发布归档，且是否提交二进制需要后续人工确认。

## 4. 安全 Header / CSP

修改：

- `apps/web/next.config.mjs`
- `apps/web/vercel.json`

新增或强化：

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=()`
- `X-Frame-Options: DENY`
- `Content-Security-Policy`

当前 CSP：

```text
default-src 'self';
base-uri 'self';
object-src 'none';
form-action 'self';
frame-ancestors 'none';
script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.doubleclick.net https://hm.baidu.com https://*.baidu.com https://*.bdstatic.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https:;
font-src 'self' data:;
connect-src 'self' blob: data: https:;
worker-src 'self' blob: data:;
frame-src 'self' https://googleads.g.doubleclick.net https://*.googlesyndication.com https://*.doubleclick.net;
upgrade-insecure-requests
```

### CSP 兼容性说明

- PDF.js：保留 `worker-src 'self' blob: data:` 和 `connect-src 'self' blob: data:`，不阻断本地 worker 和静态资源。
- FFmpeg WASM：保留 `worker-src 'self' blob: data:`、`script-src ... 'unsafe-eval' blob:` 和 `connect-src 'self' blob: data:`，避免破坏 WASM/worker 加载。
- 广告：保留 Google AdSense / DoubleClick / 百度相关域名。
- CloudBase 下载授权：`connect-src ... https:` 允许下载授权云函数调用；该调用只提交口令和包类型，不接收或上传用户处理文件。

### 静态导出限制

执行 `build:web` 时 Next 输出警告：

```text
Specified "headers" will not automatically work with "output: export".
rewrites, redirects, and headers are not applied when exporting your application, detected (headers).
```

因此：

- `next.config.mjs` 中的 `headers()` 作为 Vercel/Next 兼容配置保留。
- `apps/web/vercel.json` 已同步加入安全 headers，适合 Vercel 静态部署。
- CloudBase 静态托管是否应用这些 headers 取决于 CloudBase 平台能力，需要在 CloudBase 控制台或托管配置中进一步确认响应头设置。

## 5. CloudBase 下载授权 CORS / ALLOWED_ORIGIN

修改：

- `cloudbase/functions/createDownloadUrl/index.js`
- `cloudbase/functions/createDownloadUrl/security.js`
- `apps/web/src/tests/cloudbaseDownloadAuth.test.ts`
- `scripts/test-create-download-url.cjs`

已实现：

- 读取 `ALLOWED_ORIGIN` / `ALLOWED_ORIGINS`
- 支持逗号分隔多个 Origin
- 校验请求 `Origin`
- `OPTIONS` 预检返回 CORS 头
- 设置：
  - `Access-Control-Allow-Origin`
  - `Access-Control-Allow-Methods: POST, OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type`
  - `Vary: Origin`
- 非法 Origin 返回 `403`
- 非法 `packageType` 返回 `400`
- `packageType` 只允许 `exe` 或 `msi`
- `selectedFile` 只在 `packageType` 校验通过后读取
- `passwordMatches` 在长度不一致时先返回 `false`，避免 `timingSafeEqual` 抛错
- 不泄露环境变量
- 日志不记录口令、不记录临时下载 URL、不记录用户处理文件

下载授权流程保持不变：

- 用户输入统一下载口令
- 云函数验证 `DOWNLOAD_PASSWORD`
- 只根据 `packageType=exe/msi` 生成私有云存储文件短时临时链接
- 不接收图片、PDF、Word、Excel、音频、视频或转换结果

### CloudBase 函数本地脚本级测试

新增并执行：

```powershell
node D:\万能格式转换器项目\scripts\test-create-download-url.cjs
```

结果：通过。

覆盖：

- `OPTIONS` 预检
- 正确口令 + `packageType=exe`
- 正确口令 + `packageType=msi`
- 错误口令
- 非法 `packageType`
- 非法 `Origin`

## 6. 在线大文件硬限制

修改：

- `apps/web/src/components/tools/ToolsClient.tsx`
- `apps/web/src/tests/privacy.test.ts`

在线版现在在真正读取文件前硬拦截超限文件。

检查发生在：

- 文件类型确认之后
- `URL.createObjectURL(nextFile)` 之前
- `summarizeFile(nextFile)` 之前
- 图片解码、PDF 页数读取、Office 解析、FFmpeg WASM 加载之前

当前限制：

| 类型 | 在线版限制 |
| --- | ---: |
| 图片 | 50 MB |
| PDF | 80 MB |
| Word | 80 MB |
| Excel | 80 MB |
| 音频 | 200 MB |
| 视频 | 200 MB |

提示文案：

```text
当前文件较大，在线版可能受浏览器内存限制。请使用 Windows 离线专业版进行大文件或批量处理，文件仍在本机处理，不上传服务器。
```

离线专业版不受该限制影响：

- 不影响批量任务队列
- 不影响输出目录
- 不影响任务历史
- 不影响本地处理

## 7. 许可证和 Notices 复核

已检查并保留：

- `THIRD_PARTY_NOTICES.md`
- `OPEN_SOURCE_LICENSES.md`
- `FFMPEG_LICENSE_NOTICE.md`
- `RELEASE_COMPLIANCE_CHECKLIST.md`
- `apps/web/src/generated/thirdPartyNotices.ts`
- `release/v1.0.0/docs/**`
- `apps/web/public/release/v1.0.0/docs/**`

确认仍存在：

- `@ffmpeg/core` / FFmpeg WASM 许可证说明
- GPL / LGPL 风险说明
- source offer / 源码获取说明
- sidecar FFmpeg / BtbN 来源说明
- BtbN 候选未完成商业许可证最终复核的提醒
- 长期自建 LGPL FFmpeg 构建建议
- FFmpeg 许可证入口
- 商业发布前人工复核提醒

未发现对外宣传：

- “已完成 FFmpeg 商业许可证最终复核”
- “绝对安全”
- “完全无风险”

说明：`release/v1.0.0/docs/DOWNLOAD_PAGE_COPY.md` 中包含“请不要使用……”这类禁止表述，不属于宣传文案。

## 8. 测试结果

已执行：

```powershell
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 test
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 build:web
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 --filter web exec tsc --noEmit
node D:\万能格式转换器项目\scripts\test-create-download-url.cjs
node --check D:\万能格式转换器项目\cloudbase\functions\createDownloadUrl\index.js
node --check D:\万能格式转换器项目\cloudbase\functions\createDownloadUrl\security.js
```

结果：

- `pnpm test`：通过，11 个测试文件，51 个测试通过。
- `pnpm build:web`：通过。
- `pnpm --filter web exec tsc --noEmit`：通过。
- `createDownloadUrl` 本地脚本级测试：通过。
- `node --check`：通过。

构建警告：

- Next 提醒 `output: "export"` 下 `headers()` 不会自动应用到静态导出结果。
- 已通过 `apps/web/vercel.json` 同步 Vercel headers。
- CloudBase 静态托管响应头仍需在部署侧确认。

未执行：

- `pnpm package:desktop`

原因：

- 本轮未修改桌面端安装包内容、Tauri 权限、WebView2 offlineInstaller、sidecar/WASM 范围或安装包资源。
- 下载页 SHA256 和安装包内容未变。

## 9. 发布前注意事项

1. CloudBase 云函数部署前必须配置 `ALLOWED_ORIGIN`，建议值为正式站点 Origin，例如：

```text
https://format-converter-prod-x-d71bce41-1434109188.tcloudbaseapp.com
```

如果后续绑定自定义域名，应加入新的正式 Origin，多个 Origin 使用英文逗号分隔。

2. CloudBase 静态托管的安全响应头需要在平台侧复核。`next.config.mjs` 的 `headers()` 不会写进纯静态 `out/` 文件。

3. 如果将项目推送到公开 Git 仓库，建议不要提交：

- `node_modules/`
- `.pnpm-home/`
- `apps/web/out/`
- `apps/web/.next/`
- `apps/desktop/src-tauri/target/`
- `verification/out/`
- 本地日志和预览截图

4. 是否提交 `release/v1.0.0/installers/*.exe` / `*.msi` 需要根据发布仓库策略人工确认。

## 10. 验收项

| 项目 | 结果 |
| --- | --- |
| 修改了哪些文件 | 已列出 |
| Git 未跟踪文件如何分类 | 已分类 |
| `.gitignore` 修改内容 | 已新增 |
| 哪些文件建议提交 | 已说明 |
| 哪些文件建议不提交 | 已说明 |
| release 目录是否保留 | 保留 |
| `apps/web/out` 是否忽略 | 是 |
| 安全 Header 是否增加 | 是 |
| CSP 策略是什么 | 已列出 |
| CSP 是否影响 PDF.js | 保留 worker/blob/data 支持，预计不影响 |
| CSP 是否影响 FFmpeg WASM | 保留 worker/blob/data/unsafe-eval，预计不影响 |
| CSP 是否影响广告 | 保留 Google / DoubleClick / 百度相关域名，预计不影响 |
| CSP 是否影响 CloudBase 下载授权 | `connect-src https:` 允许调用；CloudBase Origin 由云函数 CORS 控制 |
| `createDownloadUrl` 是否增加 `ALLOWED_ORIGIN` / CORS | 是 |
| 下载授权流程是否保持不变 | 是 |
| 在线大文件硬限制是否生效 | 是，处理前拦截 |
| 是否影响离线专业版批量处理 | 否 |
| 许可证和 Notices 是否保留 | 是 |
| 是否新增云转换 | 否 |
| 是否上传用户处理文件 | 否 |
| 是否改动广告逻辑 | 否 |
| 是否改动程序图标 | 否 |
| 是否改动 Tauri 权限 | 否 |
| 测试结果 | 通过 |
| 是否可以进入 `UI_STYLE_REFRESH_DEPLOY_ROUND` | 可以，前提是部署时配置 `ALLOWED_ORIGIN` 并复核 CloudBase 静态托管响应头 |
