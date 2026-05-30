# GIT_BASELINE_COMMIT_LIST

本文件用于部署前建立 Git 基线。当前目标是分批提交源码、配置、CloudBase 函数源码、许可证、隐私、发布文档和 SHA256，不提交依赖目录、构建产物、缓存、日志、临时文件和大型安装包。

## 第一批建议提交：基础配置和 .gitignore

建议提交：

- `.gitignore`
- `.env.example`
- `LICENSE`
- `README.md`
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- `apps/web/next.config.mjs`
- `apps/web/vercel.json`
- `apps/web/cloudbaserc.json`
- `apps/web/src/config/**`

说明：

- `.env.example` 可以提交。
- 不要提交真实 `.env`、真实下载口令、CloudBase 密钥或任何生产密钥。
- `.gitignore` 已覆盖主要依赖、构建产物和临时文件目录。

## 第二批建议提交：CloudBase 下载授权安全增强

建议提交：

- `cloudbase/functions/createDownloadUrl/index.js`
- `cloudbase/functions/createDownloadUrl/security.js`
- `cloudbase/functions/createDownloadUrl/package.json`
- `cloudbase/functions/createDownloadUrl/package-lock.json`，如果该文件存在并用于云函数部署
- `scripts/test-create-download-url.cjs`
- `apps/web/src/tests/cloudbaseDownloadAuth.test.ts`

说明：

- CloudBase 函数源码应进入版本管理，方便审计和回滚。
- 不要提交 `cloudbase/functions/createDownloadUrl/node_modules/`。
- 不要在 Git 中提交真实 `DOWNLOAD_PASSWORD`、`ALLOWED_ORIGIN`、FileID 等生产环境变量值。

## 第三批建议提交：在线大文件硬限制

建议提交：

- `apps/web/src/components/tools/ToolsClient.tsx`
- `apps/web/src/tests/privacy.test.ts`
- 与在线文件限制直接相关的工具类型或测试文件，如果后续 `git diff` 显示有改动

说明：

- 在线版大文件限制必须保留在读取 `ArrayBuffer`、`Blob`、`Canvas`、FFmpeg WASM 或 Office/PDF 解析前。
- 该批提交不应包含离线专业版批量队列逻辑大改。

## 第四批建议提交：UI 风格升级

建议提交：

- `apps/web/src/app/globals.css`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/components/layout/Header.tsx`
- `apps/web/src/components/layout/Footer.tsx`
- `apps/web/src/components/download/DownloadAuthBox.tsx`
- `apps/web/src/components/tools/ToolsClient.tsx`
- `apps/web/src/app/**`
- `apps/web/src/components/**`

说明：

- 该批只应体现 UI 风格、布局质感、页面文案展示优化。
- 不应包含登录、注册、会员、VIP、API 页面、云转换或用户文件上传接口。
- 广告位 `id="ad-container"` 和广告组件逻辑不应被改变。

## 第五批建议提交：发布文档和 release SHA256

建议提交：

- `release/v1.0.0/docs/**`
- `release/v1.0.0/installers/SHA256SUMS.txt`
- `release/v1.0.0/verification/*.md`
- `apps/web/public/release/v1.0.0/docs/**`
- `apps/web/public/release/v1.0.0/installers/SHA256SUMS.txt`
- `apps/web/src/config/downloads.ts`
- `apps/web/src/generated/thirdPartyNotices.ts`
- `THIRD_PARTY_NOTICES.md`
- `OPEN_SOURCE_LICENSES.md`
- `FFMPEG_LICENSE_NOTICE.md`
- `RELEASE_COMPLIANCE_CHECKLIST.md`

说明：

- `SHA256SUMS.txt` 应提交。
- release 文档应提交。
- release verification 下的 Markdown 发布验证文档可以提交，作为审计归档。
- EXE / MSI 安装包本身不建议提交到普通 Git。
- 后续新增 `v1.0.1`、`v1.1.0` 等版本时，同样适用：`release/*/installers/*.exe` 和 `release/*/installers/*.msi` 不进普通 Git，`release/*/installers/SHA256SUMS.txt` 可以提交。

## 第六批建议提交：部署报告和审计报告

建议提交：

- `GIT_BASELINE_AND_DEPLOY_GATE_REPORT.md`
- `GIT_BASELINE_COMMIT_LIST.md`
- `GIT_BASELINE_ADD_COMMANDS.md`
- `DEPLOY_GATE_FINAL_CHECKLIST.md`
- `GIT_BASELINE_COMMIT_PREP_REPORT.md`
- `PRE_DEPLOY_SECURITY_AND_REPO_CLEANUP_REPORT.md`
- `WEBVIEW2_LOCAL_OFFLINE_INSTALLER_CACHE_REPORT.md`
- `UI_STYLE_REFRESH_REPORT.md`
- `UI_STYLE_REFRESH_FINAL_DEPLOY_READY_REPORT.md`
- `WEBSITE_DOWNLOAD_DEPLOY_REPORT.md`
- 其他需要归档的 `*_REPORT.md`、`*_PLAN.md`、`*_CHECKLIST.md`

建议后续整理：

- 将阶段性报告移动到 `docs/audits/` 或 `docs/release-history/`。
- 本轮不移动文件，只给出提交建议。

## 不建议提交的文件

不要提交：

- `node_modules/`
- `**/node_modules/`
- `.pnpm-home/`
- `.next/`
- `apps/web/.next/`
- `apps/web/out/`
- `out/`
- `target/`
- `apps/desktop/src-tauri/target/`
- `*.log`
- `*.tmp`
- `.tmp/`
- `.icon-tmp/`
- `desktop-preview*.png`
- `preview-*.png`
- `verification/out/`
- `verification/**/*.tmp`
- `verification/**/*.log`
- `release/*/verification/**/*.log`
- `release/*/verification/**/*.tmp`
- `release/*/verification/**/out/`
- `release/*/verification/**/*.exe`
- `release/*/verification/**/*.msi`
- `release/*/verification/**/*.zip`
- `release/*/verification/**/*.7z`
- `release/*/verification/**/*.png`
- `release/*/verification/**/*.jpg`
- `release/*/verification/**/*.jpeg`
- `release/*/verification/**/*.webp`

不建议普通 Git 提交：

- `release/*/installers/*.exe`
- `release/*/installers/*.msi`
- `verification/ffmpeg-binary-candidates/**`

## 需要人工确认的文件

需要人工确认：

- `.agents/`
- `.codex/`
- `skills-lock.json`
- `verification/**`
- `release/*/verification/` 中除 `*.md` 外的日志、临时文件、样例文件、输出文件、截图和二进制
- 根目录大量阶段性报告是否全部提交，还是后续整理到文档目录
- `apps/desktop/src-tauri/resources/ffmpeg/bin/*.exe`
- `apps/desktop/src-tauri/resources/ffmpeg/bin/*.dll`

说明：

- `apps/desktop/src-tauri/resources/ffmpeg/bin/ffmpeg.exe`、`ffprobe.exe` 和 DLL 不是 EXE/MSI 安装包，但属于大型第三方二进制资源。
- 如果需要复现离线专业版 sidecar 打包，可以保留这些二进制，但建议使用 Git LFS、私有制品仓库或明确的二进制归档策略。
- 如果不纳入 Git，需要在构建说明中明确如何恢复这些 sidecar 资源。

## 不要提交 EXE / MSI 的说明

不建议把 EXE / MSI 安装包放进普通 Git，原因：

1. 文件体积大，会快速膨胀仓库；
2. 每次重新打包都会改变 SHA256，普通 Git 历史会持续增长；
3. 安装包更适合存放到 CloudBase 云存储、COS、GitHub Release 附件或内部制品仓库；
4. Git 中保留 `SHA256SUMS.txt`、发布说明和下载页配置即可追踪版本。

如果必须保留 EXE / MSI：

- 使用 Git LFS；
- 或使用独立二进制发布仓库；
- 或只放在 CloudBase / COS / Release 附件中，并在 Git 中提交 SHA256 和下载路径说明。
