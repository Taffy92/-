# GIT_BASELINE_COMMIT_PREP_REPORT

本轮名称：`GIT_BASELINE_COMMIT_PREP_ROUND`

生成日期：2026-05-26

## 1. 是否建议先建立 Git 基线

建议先建立 Git 基线。

原因：

1. 当前 `git status --short` 仍显示大量未跟踪文件；
2. 这些文件包含源码、配置、CloudBase 函数源码、发布文档、审计报告和 release 归档；
3. 即将进入 `UI_STYLE_REFRESH_DEPLOY_ROUND`，部署前需要一个可回滚、可审计的稳定提交点；
4. 如果直接部署，后续排查下载授权、SHA256、静态页面或 CloudBase 配置问题时缺少基准。

本轮未执行 `git add`、未执行 `git commit`。

## 2. 已生成的文件

本轮新增：

- `GIT_BASELINE_COMMIT_LIST.md`
- `GIT_BASELINE_ADD_COMMANDS.md`
- `DEPLOY_GATE_FINAL_CHECKLIST.md`
- `GIT_BASELINE_COMMIT_PREP_REPORT.md`

## 3. 已执行的检查命令

已执行：

```powershell
git status --short
git check-ignore -v apps/web/out
git check-ignore -v apps/web/.next
git check-ignore -v apps/desktop/src-tauri/target
git check-ignore -v node_modules
git check-ignore -v .pnpm-home
```

结果：

| 路径 | 结果 |
| --- | --- |
| `apps/web/out` | 被 `.gitignore` 忽略 |
| `apps/web/.next` | 被 `.gitignore` 忽略 |
| `apps/desktop/src-tauri/target` | 被 `.gitignore` 忽略 |
| `node_modules` | 被 `.gitignore` 忽略 |
| `.pnpm-home` | 被 `.gitignore` 忽略 |

`.gitignore` 当前足够覆盖本轮要求的依赖、构建产物和缓存目录。本轮没有修改 `.gitignore`。

## 4. 建议提交的文件批次

### 第一批：基础配置和 `.gitignore`

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

### 第二批：CloudBase 下载授权安全增强

建议提交：

- `cloudbase/functions/createDownloadUrl/index.js`
- `cloudbase/functions/createDownloadUrl/security.js`
- `cloudbase/functions/createDownloadUrl/package.json`
- `cloudbase/functions/createDownloadUrl/package-lock.json`，如果存在
- `scripts/test-create-download-url.cjs`
- `apps/web/src/tests/cloudbaseDownloadAuth.test.ts`

### 第三批：在线大文件硬限制

建议提交：

- `apps/web/src/components/tools/ToolsClient.tsx`
- `apps/web/src/tests/privacy.test.ts`

### 第四批：UI 风格升级

建议提交：

- `apps/web/src/app/**`
- `apps/web/src/components/**`
- `apps/web/src/generated/**`

### 第五批：发布文档和 release SHA256

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

### 第六批：部署报告和审计报告

建议提交：

- `GIT_BASELINE_AND_DEPLOY_GATE_REPORT.md`
- `GIT_BASELINE_COMMIT_LIST.md`
- `GIT_BASELINE_ADD_COMMANDS.md`
- `DEPLOY_GATE_FINAL_CHECKLIST.md`
- `GIT_BASELINE_COMMIT_PREP_REPORT.md`
- `PRE_DEPLOY_SECURITY_AND_REPO_CLEANUP_PLAN.md`
- `PRE_DEPLOY_SECURITY_AND_REPO_CLEANUP_REPORT.md`
- `WEBVIEW2_LOCAL_OFFLINE_INSTALLER_CACHE_REPORT.md`
- `UI_STYLE_REFRESH_REPORT.md`
- `UI_STYLE_REFRESH_FINAL_DEPLOY_READY_REPORT.md`
- `WEBSITE_DOWNLOAD_DEPLOY_REPORT.md`
- 其他需要归档的阶段性报告

## 5. 不建议提交的文件

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

## 6. 需要人工确认的文件

需要人工确认：

- `.agents/`
- `.codex/`
- `skills-lock.json`
- `verification/**`
- `release/*/verification/` 中除 Markdown 发布验证文档外的日志、临时文件、样例文件、输出文件、截图和二进制
- 根目录大量阶段性报告是否全部提交
- `apps/desktop/src-tauri/resources/ffmpeg/bin/*.exe`
- `apps/desktop/src-tauri/resources/ffmpeg/bin/*.dll`

特别说明：

- `apps/desktop/src-tauri/resources/ffmpeg/bin/ffmpeg.exe`、`ffprobe.exe` 和 DLL 是离线专业版 sidecar 资源。
- 它们不是 release 安装包，但属于大型第三方二进制。
- 如果希望完整复现本地打包，可以用 Git LFS 管理它们；如果不希望二进制进入 Git，应放到制品仓库并补充恢复步骤。

## 7. `.gitignore` 是否生效

生效。

已确认：

- `apps/web/out` 被忽略
- `apps/web/.next` 被忽略
- `apps/desktop/src-tauri/target` 被忽略
- `node_modules` 被忽略
- `.pnpm-home` 被忽略

本轮未发现必须补充的 `.gitignore` 规则。

## 8. 是否建议提交 EXE / MSI

不建议把 EXE / MSI 提交到普通 Git。

当前安装包：

- `release/v1.0.0/installers/万能格式转换器_1.0.0_x64-setup.exe`
- `release/v1.0.0/installers/万能格式转换器_1.0.0_x64_zh-CN.msi`

通用规则：

- `release/*/installers/*.exe` 不进入普通 Git；
- `release/*/installers/*.msi` 不进入普通 Git；
- `release/*/installers/SHA256SUMS.txt` 可以提交；
- `release/*/docs/**` 可以提交；
- `release/*/verification/*.md` 可以提交；
- `release/*/verification/` 下的日志、临时文件、样例文件、输出文件、截图和二进制不提交。

建议：

- 上传到 CloudBase 云存储 / COS / Release 附件；
- Git 中提交 `SHA256SUMS.txt`、发布说明、下载页配置；
- 如果必须版本化安装包，使用 Git LFS 或独立二进制仓库。

## 9. 如果不提交 EXE / MSI，应该如何发布

推荐发布方式：

1. 保留本地 `release/v1.0.0/installers` 作为本机发布归档；
2. 上传 EXE / MSI 到 CloudBase 云存储或 COS；
3. 在 CloudBase 云函数环境变量中配置对应 FileID；
4. Git 中提交 `SHA256SUMS.txt` 和下载页 SHA256；
5. 用户通过下载口令调用 `createDownloadUrl` 获取短时临时链接；
6. 不公开安装包永久直链。

## 10. 是否可以在人工确认后执行 `git add`

可以。

建议按 `GIT_BASELINE_ADD_COMMANDS.md` 中的批次执行，并在每一批后运行：

```powershell
git status --short
git diff --cached --stat
git diff --cached --name-only
```

如果发现误加入安装包，应执行：

```powershell
git restore --staged -- release/*/installers/*.exe release/*/installers/*.msi
```

## 11. 是否可以在 Git 基线建立后进入 `UI_STYLE_REFRESH_DEPLOY_ROUND`

可以。

建议进入部署前完成：

1. 建立 Git 基线；
2. 确认 EXE / MSI 不进入普通 Git；
3. 确认 CloudBase 云函数环境变量；
4. 上传当前 release 安装包到 CloudBase 云存储；
5. 部署静态站点和云函数；
6. 部署后验证下载口令、CORS、OPTIONS、非法 Origin、错误口令、SHA256。

## 12. 本轮结论

本轮只生成清单和建议，未提交、未部署、未上传安装包。

建议下一步由人工确认：

1. 是否按批次执行 `GIT_BASELINE_ADD_COMMANDS.md`；
2. 是否把 sidecar FFmpeg 二进制纳入 Git LFS；
3. 是否把阶段性报告先留在根目录提交，还是整理到 `docs/audits/` 后提交；
4. Git 基线建立后，再进入 `UI_STYLE_REFRESH_DEPLOY_ROUND`。
