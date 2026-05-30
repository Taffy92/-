# GIT_BASELINE_ADD_COMMANDS

本文件只提供建议命令。本轮不执行 `git add`、不执行 `git commit`。

执行任何命令前，先确认当前状态：

```powershell
git status --short
```

## 第一批：基础配置和 `.gitignore`

只加入明确文件，不加入真实环境变量文件。

```powershell
git add -- .gitignore .env.example LICENSE README.md package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json
git add -- apps/web/next.config.mjs apps/web/vercel.json apps/web/cloudbaserc.json
git add -- apps/web/src/config/ads.ts apps/web/src/config/downloads.ts apps/web/src/config/site.ts
```

注意：

- `.env.example` 可以提交。
- 真实 `.env`、`.env.local`、`.env.production`、其他 `.env.*` 和 `*.local` 不允许提交。
- `apps/web/src/config` 不再整目录盲加，只列出已知配置文件。

建议提交信息：

```text
chore: establish baseline config and ignore rules
```

## 第二批：CloudBase 下载授权安全增强

```powershell
git add -- cloudbase/functions/createDownloadUrl/index.js cloudbase/functions/createDownloadUrl/security.js
git add -- cloudbase/functions/createDownloadUrl/package.json
git add -- scripts/test-create-download-url.cjs apps/web/src/tests/cloudbaseDownloadAuth.test.ts
```

如果确认 `cloudbase/functions/createDownloadUrl/package-lock.json` 存在且用于云函数部署，再单独加入该文件。

注意：

- 不要加入云函数的 `node_modules`。
- 不要提交任何真实口令、密钥或 CloudBase 环境变量值。

建议提交信息：

```text
feat: harden CloudBase download authorization CORS checks
```

## 第三批：在线大文件硬限制

```powershell
git add -- apps/web/src/components/tools/ToolsClient.tsx apps/web/src/tests/privacy.test.ts
```

建议提交信息：

```text
fix: enforce online large file limits before local parsing
```

## 第四批：UI 风格升级

提交前先查看 UI 相关 diff：

```powershell
git status --short apps/web/src/app apps/web/src/components apps/web/src/generated
```

建议加入：

```powershell
git add -- apps/web/src/app apps/web/src/components apps/web/src/generated
```

说明：

- `apps/web/src/app` 和 `apps/web/src/components` 可以按目录加入，但提交前必须执行 `git diff --cached --name-only` 和 `git diff --cached --stat` 检查。
- `apps/web/src/generated` 可以加入，但要确认不是临时构建产物；当前主要用于第三方 Notices 生成内容。
- `apps/web/out` 是静态导出产物，不进入普通 Git。

建议提交信息：

```text
style: refresh web and desktop UI presentation
```

## 第五批：发布文档和 release SHA256

```powershell
git add -- THIRD_PARTY_NOTICES.md OPEN_SOURCE_LICENSES.md FFMPEG_LICENSE_NOTICE.md RELEASE_COMPLIANCE_CHECKLIST.md
git add -- apps/web/src/config/downloads.ts apps/web/src/generated/thirdPartyNotices.ts
git add -- release/v1.0.0/docs release/v1.0.0/installers/SHA256SUMS.txt release/v1.0.0/verification/*.md
git add -- apps/web/public/release/v1.0.0/docs apps/web/public/release/v1.0.0/installers/SHA256SUMS.txt
```

说明：

- release 只提交 docs、`SHA256SUMS.txt` 和 verification 下的 Markdown 审计归档。
- EXE / MSI 通过 CloudBase 云存储、COS、GitHub Release 附件或 Git LFS 管理，不进入普通 Git。
- 后续新增 `v1.0.1`、`v1.1.0` 等版本时，同样适用 `release/*/installers/*.exe` 和 `release/*/installers/*.msi` 不进普通 Git 的策略。
- `release/*/verification/*.md` 可以提交；verification 下的日志、临时文件、样例文件、输出文件、截图和二进制不提交。

建议提交信息：

```text
docs: update release notes licenses and installer checksums
```

## 第六批：部署报告和审计报告

建议先只加入关键报告：

```powershell
git add -- GIT_BASELINE_AND_DEPLOY_GATE_REPORT.md GIT_BASELINE_COMMIT_LIST.md GIT_BASELINE_ADD_COMMANDS.md DEPLOY_GATE_FINAL_CHECKLIST.md GIT_BASELINE_COMMIT_PREP_REPORT.md GIT_BASELINE_PRE_COMMIT_FIX_REPORT.md SIDECAR_BINARY_VERSIONING_DECISION.md
git add -- PRE_DEPLOY_SECURITY_AND_REPO_CLEANUP_PLAN.md PRE_DEPLOY_SECURITY_AND_REPO_CLEANUP_REPORT.md WEBVIEW2_LOCAL_OFFLINE_INSTALLER_CACHE_REPORT.md UI_STYLE_REFRESH_REPORT.md UI_STYLE_REFRESH_FINAL_DEPLOY_READY_REPORT.md WEBSITE_DOWNLOAD_DEPLOY_REPORT.md
```

如果决定提交全部阶段报告，先人工检查后再执行：

```powershell
git add -- *.md
```

注意：

- `git add -- *.md` 不会加入安装包，但会加入大量阶段性报告。
- 更稳妥的做法是后续把报告整理到 `docs/audits/` 或 `docs/release-history/` 后再提交。

建议提交信息：

```text
docs: archive deploy gate and release audit reports
```

## 明确不要加入的路径

以下路径只作为黑名单说明，不提供可复制的 `git add` 命令：

- `node_modules/`
- `.pnpm-home/`
- `apps/web/out/`
- `apps/web/.next/`
- `apps/web/test-results/`
- `apps/web/playwright-report/`
- `apps/desktop/src-tauri/target/`
- `release/*/installers/*.exe`
- `release/*/installers/*.msi`
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
- `verification/ffmpeg-binary-candidates/`
- 真实 `.env`、`.env.*`、`*.local`
- sidecar FFmpeg 的 `bin/*.exe` 和 `bin/*.dll`，除非确认使用 Git LFS。

## sidecar FFmpeg 二进制资源

当前存在：

- `apps/desktop/src-tauri/resources/ffmpeg/bin/ffmpeg.exe`
- `apps/desktop/src-tauri/resources/ffmpeg/bin/ffprobe.exe`
- `apps/desktop/src-tauri/resources/ffmpeg/bin/*.dll`

默认不要直接加入普通 Git。

如果决定使用 Git LFS 管理，先安装并确认 Git LFS，然后执行：

```powershell
git lfs track "apps/desktop/src-tauri/resources/ffmpeg/bin/*.exe"
git lfs track "apps/desktop/src-tauri/resources/ffmpeg/bin/*.dll"
git add -- .gitattributes
```

之后再由人工确认是否加入 sidecar `bin/` 文件。

如果不使用 Git LFS，建议只提交说明、许可证和校验文件：

```powershell
git add -- apps/desktop/src-tauri/resources/ffmpeg/*.txt apps/desktop/src-tauri/resources/ffmpeg/LICENSES
```

并把 `bin/` 中的 EXE / DLL 放到私有制品仓库、CloudBase 私有归档或内部 release artifact。

## 每批提交前复查

每批 `git add` 后执行：

```powershell
git status --short
git diff --cached --stat
git diff --cached --name-only
```

如果误加入安装包、构建产物或真实环境文件，应先用 `git restore --staged -- <path>` 取消暂存，再重新检查。
