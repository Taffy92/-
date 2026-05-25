# GIT_BASELINE_AND_DEPLOY_GATE_REPORT

本轮名称：`GIT_BASELINE_AND_DEPLOY_GATE_ROUND`

生成日期：2026-05-26

## 0. 本轮边界

本轮只做部署前 Git 基线和发布闸门确认。

未执行：

- 未执行 `tcb hosting deploy`
- 未上传 EXE / MSI
- 未部署 CloudBase 云函数
- 未修改 UI
- 未修改广告逻辑
- 未修改程序图标
- 未修改 Tauri 权限
- 未修改 WebView2 offlineInstaller
- 未修改 sidecar / WASM 当前范围
- 未新增云转换
- 未上传任何用户处理文件

本轮读取并参考：

- `PRE_DEPLOY_SECURITY_AND_REPO_CLEANUP_REPORT.md`
- `WEBVIEW2_LOCAL_OFFLINE_INSTALLER_CACHE_REPORT.md`
- `UI_STYLE_REFRESH_FINAL_DEPLOY_READY_REPORT.md`
- `UI_STYLE_REFRESH_REPORT.md`
- `WEBSITE_DOWNLOAD_DEPLOY_REPORT.md`

## 1. 当前 Git 状态摘要

已执行：

```powershell
git status --short
```

当前仓库仍处于“基线未建立”状态：大量项目源码、配置、报告、发布归档和验证目录都是未跟踪文件。

典型未跟踪项包括：

- `.env.example`
- `.gitignore`
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- `apps/`
- `packages/`
- `cloudbase/`
- `docs/`
- `public/`
- `release/`
- `scripts/`
- `verification/`
- 大量 `*.md` 审计、修复、发布、合规报告

`.gitignore` 已经使 `node_modules`、`.pnpm-home`、`apps/web/out`、`apps/web/.next`、`apps/desktop/src-tauri/target` 等目录不再出现在普通 `git status --short` 输出中。

## 2. Git 文件分类

### A. 必须纳入版本管理的源码文件

建议纳入 Git：

- `apps/web/**`
- `apps/desktop/**`
- `packages/**`
- `public/**`
- `scripts/**`
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- `LICENSE`
- `README.md`

排除这些源码树下的生成产物：

- `apps/web/.next/`
- `apps/web/out/`
- `apps/desktop/src-tauri/target/`
- `**/node_modules/`

### B. 必须纳入版本管理的配置文件

建议纳入 Git：

- `.env.example`
- `.gitignore`
- `apps/web/next.config.mjs`
- `apps/web/vercel.json`
- `apps/web/cloudbaserc.json`
- `apps/web/src/config/**`
- `apps/desktop/src-tauri/tauri.conf.json`
- `apps/desktop/src-tauri/Cargo.toml`
- `pnpm-workspace.yaml`
- `tsconfig.base.json`

不要提交真实密钥或真实下载口令。`.env.example` 可以提交，真实 `.env*` 文件应继续留在本机或部署平台环境变量中。

### C. 必须纳入版本管理的 CloudBase 函数源码

建议纳入 Git：

- `cloudbase/functions/createDownloadUrl/index.js`
- `cloudbase/functions/createDownloadUrl/security.js`
- `cloudbase/functions/createDownloadUrl/package.json`
- `cloudbase/functions/createDownloadUrl/package-lock.json` 或对应锁文件，如果存在且用于部署
- `scripts/test-create-download-url.cjs`

不建议纳入 Git：

- `cloudbase/functions/createDownloadUrl/node_modules/`

原因：云函数源码需要可审计、可回滚；依赖目录应由部署环境或安装流程恢复。

### D. 必须纳入版本管理的许可证 / 隐私 / 发布说明文档

建议纳入 Git：

- `THIRD_PARTY_NOTICES.md`
- `OPEN_SOURCE_LICENSES.md`
- `FFMPEG_LICENSE_NOTICE.md`
- `RELEASE_COMPLIANCE_CHECKLIST.md`
- `PRIVACY_SECURITY_AUDIT.md`
- `docs/**`
- `release/v1.0.0/docs/**`
- `apps/web/public/release/v1.0.0/docs/**`
- `apps/web/src/generated/thirdPartyNotices.ts`

这些文件是发布合规、广告审核、下载页说明、FFmpeg / GPL / LGPL 风险提示和 source offer 的依据，不能删除。

### E. 可以纳入版本管理的 release 文档

建议纳入 Git：

- `release/v1.0.0/docs/RELEASE_NOTES.md`
- `release/v1.0.0/docs/INSTALL_GUIDE.md`
- `release/v1.0.0/docs/OFFLINE_PRO_USER_GUIDE.md`
- `release/v1.0.0/docs/PRIVACY_NOTICE.md`
- `release/v1.0.0/docs/OPEN_SOURCE_LICENSES.md`
- `release/v1.0.0/docs/THIRD_PARTY_NOTICES.md`
- `release/v1.0.0/docs/FFMPEG_LICENSE_NOTICE.md`
- `release/v1.0.0/docs/RELEASE_COMPLIANCE_CHECKLIST.md`
- `release/v1.0.0/docs/DOWNLOAD_PAGE_COPY.md`
- `release/v1.0.0/installers/SHA256SUMS.txt`

这些文件体积小，适合作为发布记录和下载页公开材料。

### F. 不建议纳入 Git 的大型二进制安装包

不建议普通 Git 提交：

- `release/v1.0.0/installers/万能格式转换器_1.0.0_x64-setup.exe`
- `release/v1.0.0/installers/万能格式转换器_1.0.0_x64_zh-CN.msi`

当前文件：

| 文件 | 大小 | SHA256 |
| --- | ---: | --- |
| `release/v1.0.0/installers/万能格式转换器_1.0.0_x64-setup.exe` | 257,626,830 bytes | `0C86FC2BFDA97297A2858337E7BA67AD7AD275F063D8095D7CCD841A82F8F0D1` |
| `release/v1.0.0/installers/万能格式转换器_1.0.0_x64_zh-CN.msi` | 268,967,936 bytes | `A4F42391A8272AB4041FFEC34015BFED90D606531011BC62ABB3F91F63623C0D` |

建议策略：

- 私有发布归档目录可以暂时保留这些文件；
- 普通 Git 仓库不建议提交这些大二进制；
- 正式分发建议放 CloudBase 云存储 / COS / Release 附件；
- Git 中提交 `SHA256SUMS.txt` 和发布说明即可；
- 如果确实要版本化安装包，建议使用 Git LFS 或单独二进制发布仓库。

本轮没有删除这些安装包。

### G. 必须忽略的依赖目录

已由 `.gitignore` 覆盖：

- `node_modules/`
- `**/node_modules/`
- `.pnpm-home/`

`git check-ignore -v` 已确认：

- `node_modules` 被 `**/node_modules/` 忽略
- `.pnpm-home` 被 `.pnpm-home/` 忽略

### H. 必须忽略的构建产物

已由 `.gitignore` 覆盖：

- `.next/`
- `apps/web/.next/`
- `apps/web/out/`
- `out/`
- `target/`
- `apps/desktop/src-tauri/target/`

`git check-ignore -v` 已确认：

- `apps/web/out` 被忽略
- `apps/web/.next` 被忽略
- `apps/desktop/src-tauri/target` 被忽略

### I. 必须忽略的缓存 / 日志 / 临时文件

已由 `.gitignore` 覆盖：

- `*.log`
- `*.tmp`
- `.tmp/`
- `.icon-tmp/`
- `.DS_Store`
- `Thumbs.db`
- `desktop-preview*.png`
- `preview-*.png`
- `web-renamed-preview.png`
- `icon-refined-preview*.png`
- `verification/out/`
- `verification/**/*.tmp`
- `verification/**/*.log`

### J. 需要人工确认的文件

建议人工确认后再决定是否纳入 Git：

- `.agents/`
- `.codex/`
- `skills-lock.json`
- `verification/**`
- 根目录大量阶段性报告 `*_REPORT.md`、`*_PLAN.md`、`*_CHECKLIST.md`
- `release/v1.0.0/installers/*.exe`
- `release/v1.0.0/installers/*.msi`

建议：

- `.agents/`、`.codex/` 如果只是本机 Codex / Agent 配置，不建议提交；
- `skills-lock.json` 如果用于复现本项目 Codex 技能环境，可以提交；如果只是本机技能状态，人工确认；
- `verification/**` 中如包含 FFmpeg 候选二进制、测试样例或内部验证材料，不建议提交到公开 Git；
- 阶段性报告建议统一整理到 `docs/audits/` 或 `docs/release-history/` 后再提交，避免根目录长期过于混乱。

## 3. `.gitignore` 是否足够

本轮检查的必须规则均已存在：

| 规则 | 状态 |
| --- | --- |
| `node_modules/` | 已存在 |
| `**/node_modules/` | 已存在 |
| `.pnpm-home/` | 已存在 |
| `.next/` | 已存在 |
| `apps/web/.next/` | 已存在 |
| `apps/web/out/` | 已存在 |
| `target/` | 已存在 |
| `apps/desktop/src-tauri/target/` | 已存在 |
| `*.log` | 已存在 |
| `*.tmp` | 已存在 |
| `.tmp/` | 已存在 |
| `.icon-tmp/` | 已存在 |
| `verification/out/` | 已存在 |
| `verification/**/*.tmp` | 已存在 |
| `verification/**/*.log` | 已存在 |
| `desktop-preview*.png` | 已存在 |
| `preview-*.png` | 已存在 |

结论：本轮没有必要修改 `.gitignore`。

## 4. 重点文件确认

### 4.1 `apps/web/out` 是否被忽略

是。

`git check-ignore -v apps/web/out` 确认命中 `.gitignore`。

### 4.2 `apps/web/.next` 是否被忽略

是。

### 4.3 `apps/desktop/src-tauri/target` 是否被忽略

是。

### 4.4 `node_modules` 是否被忽略

是。

### 4.5 `.pnpm-home` 是否被忽略

是。

### 4.6 `verification/out` 是否被忽略

`.gitignore` 已包含 `verification/out/`。如果该目录存在，应被忽略。

### 4.7 `release/v1.0.0/docs` 是否保留

是，建议保留并纳入版本管理。

### 4.8 `release/v1.0.0/installers/SHA256SUMS.txt` 是否保留

是，建议保留并纳入版本管理。

当前内容与最新本地 EXE / MSI 一致：

```text
A4F42391A8272AB4041FFEC34015BFED90D606531011BC62ABB3F91F63623C0D  万能格式转换器_1.0.0_x64_zh-CN.msi
0C86FC2BFDA97297A2858337E7BA67AD7AD275F063D8095D7CCD841A82F8F0D1  万能格式转换器_1.0.0_x64-setup.exe
```

### 4.9 `release/v1.0.0/installers/*.exe` 和 `*.msi` 是否建议进普通 Git

不建议进入普通 Git。

建议上传到 CloudBase 云存储或对象存储，Git 中保留 SHA256 和发布说明。

### 4.10 `cloudbase/functions/createDownloadUrl` 源码是否应该保留

是，应该保留并纳入版本管理。

原因：

- 下载授权安全逻辑需要可审计；
- `ALLOWED_ORIGIN` / CORS、`packageType` 白名单、`timingSafeEqual` 安全比较都在该函数中；
- 后续部署云函数需要源码。

## 5. 部署闸门确认

### 5.1 最新 EXE / MSI 是否已在 `release/v1.0.0/installers`

是。

- EXE：`release/v1.0.0/installers/万能格式转换器_1.0.0_x64-setup.exe`
- MSI：`release/v1.0.0/installers/万能格式转换器_1.0.0_x64_zh-CN.msi`

### 5.2 `SHA256SUMS.txt` 是否与最新 EXE / MSI 一致

是。

本轮重新计算本地文件 SHA256：

- EXE：`0C86FC2BFDA97297A2858337E7BA67AD7AD275F063D8095D7CCD841A82F8F0D1`
- MSI：`A4F42391A8272AB4041FFEC34015BFED90D606531011BC62ABB3F91F63623C0D`

与 `release/v1.0.0/installers/SHA256SUMS.txt` 一致。

### 5.3 `apps/web/src/config/downloads.ts` 中 SHA256 是否一致

是。

当前配置：

- EXE：`0C86FC2BFDA97297A2858337E7BA67AD7AD275F063D8095D7CCD841A82F8F0D1`
- MSI：`A4F42391A8272AB4041FFEC34015BFED90D606531011BC62ABB3F91F63623C0D`

### 5.4 `apps/web/out/release/v1.0.0/installers/SHA256SUMS.txt` 是否一致

是。

静态导出目录中的 `SHA256SUMS.txt` 与 release 目录一致。

### 5.5 `RELEASE_NOTES.md` 中 SHA256 是否一致

是。

`release/v1.0.0/docs/RELEASE_NOTES.md` 和 `apps/web/out/release/v1.0.0/docs/RELEASE_NOTES.md` 都包含最新 EXE / MSI SHA256。

### 5.6 `createDownloadUrl` 是否已加入 `ALLOWED_ORIGIN` / CORS

是。

已确认：

- 读取 `ALLOWED_ORIGIN` / `ALLOWED_ORIGINS`
- 支持 `OPTIONS` 预检
- 设置 `Access-Control-Allow-Origin`
- 设置 `Access-Control-Allow-Methods: POST, OPTIONS`
- 设置 `Access-Control-Allow-Headers: Content-Type`
- 校验非法 Origin

### 5.7 CloudBase 环境变量是否需要配置 `ALLOWED_ORIGIN` 或 `ALLOWED_ORIGINS`

是。

部署云函数前必须配置正式站点 Origin，例如：

```text
ALLOWED_ORIGIN=https://format-converter-prod-x-d71bce41-1434109188.tcloudbaseapp.com
```

如果绑定自定义域名，应改为或追加自定义域名 Origin，例如：

```text
ALLOWED_ORIGINS=https://example.com,https://format-converter-prod-x-d71bce41-1434109188.tcloudbaseapp.com
```

不要把 `*` 作为生产配置。

### 5.8 是否存在云转换接口

未发现新增云转换接口。

当前 CloudBase 只用于：

- 静态网站托管
- 安装包存储
- 下载口令授权
- 临时下载链接生成

### 5.9 广告是否接收用户文件数据

未发现广告组件接收 `File` / `Blob` / `ArrayBuffer` / `Canvas` / 转换结果。

页脚和下载页仍保留说明：

```text
广告不接收 File、Blob、ArrayBuffer、Canvas 或转换结果。
```

### 5.10 在线大文件硬限制是否在读取文件前执行

是。

`ToolsClient.tsx` 中 `handleFile` 在调用以下逻辑前就执行超限判断：

- `URL.createObjectURL(nextFile)`
- `summarizeFile(nextFile)`
- 图片 / PDF / Office / 音视频进一步解析

超限提示建议用户使用 Windows 离线专业版，并明确文件仍在本机处理、不上传服务器。

### 5.11 许可证和 Notices 入口是否仍存在

是。

确认入口包括：

- `/licenses`
- `/privacy`
- `/release/v1.0.0/docs/THIRD_PARTY_NOTICES.md`
- `/release/v1.0.0/docs/FFMPEG_LICENSE_NOTICE.md`
- `/release/v1.0.0/docs/OPEN_SOURCE_LICENSES.md`

### 5.12 是否存在登录 / 注册 / 会员 / VIP

未发现新增登录、注册、会员、VIP 业务逻辑。

注意：如果页面文案或历史报告中出现“不要新增登录/注册/会员”这类审计文字，不等于产品功能中存在登录或会员系统。

### 5.13 程序图标是否未改

本轮未修改图标文件或 Tauri 图标配置。

### 5.14 Tauri 权限是否未扩大

本轮未修改 `apps/desktop/src-tauri/tauri.conf.json`。

### 5.15 WebView2 offlineInstaller 是否未改变

本轮未修改 WebView2 offlineInstaller 配置。

根据上一轮报告，当前安装包已通过本地 WebView2 offlineInstaller 缓存完成一次完整 `package:desktop`。

## 6. 是否允许进入部署

### 6.1 是否允许部署静态站点

结论：允许进入静态站点部署准备，但建议先提交 Git 基线。

理由：

- 当前 `apps/web/out` 已存在并包含最新 SHA256、下载页和 release 文档；
- 下载页、隐私页、许可证页、Notices 入口存在；
- 未发现云转换接口；
- 但 Git 当前几乎全量未跟踪，未建立可回滚基线，直接部署会增加回滚和审计风险。

### 6.2 是否允许上传 EXE / MSI

结论：允许上传当前 `release/v1.0.0/installers` 中的 EXE / MSI 到 CloudBase 云存储或对象存储；不建议提交到普通 Git。

当前允许上传的安装包：

- `release/v1.0.0/installers/万能格式转换器_1.0.0_x64-setup.exe`
- `release/v1.0.0/installers/万能格式转换器_1.0.0_x64_zh-CN.msi`

上传后必须同步确认：

- 云存储路径与 `createDownloadUrl` 配置一致；
- 下载页展示 SHA256 与下载后的文件 SHA256 一致；
- 不要上传旧安装包。

### 6.3 是否允许部署 `createDownloadUrl` 云函数

结论：允许部署，但部署前必须配置环境变量。

必须配置：

- `DOWNLOAD_PASSWORD`
- `ALLOWED_ORIGIN` 或 `ALLOWED_ORIGINS`
- `INSTALLER_EXE_FILE_ID`
- `INSTALLER_MSI_FILE_ID`
- 如文件名不使用默认值，则配置 `INSTALLER_EXE_FILE_NAME` / `INSTALLER_MSI_FILE_NAME`

部署后必须验证：

- 正确口令 + `packageType=exe`
- 正确口令 + `packageType=msi`
- 错误口令
- 非法 `packageType`
- 非法 Origin
- `OPTIONS` 预检

### 6.4 是否必须先提交 Git 基线

正式部署建议：必须先提交 Git 基线。

原因：

- 当前所有源码和配置几乎都处于未跟踪状态；
- 部署后若出现问题，没有稳定提交点可回滚；
- CloudBase 函数、下载页、SHA256、release 文档、安全 Header、在线大文件限制都已经涉及发布安全边界；
- 先建立 Git 基线可以让部署、回滚、后续热修更可控。

如果只是内部临时预览部署，可以跳过提交，但风险较高。

## 7. 建议先 `git add` 的文件

建议第一批纳入 Git：

```text
.env.example
.gitignore
LICENSE
README.md
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
tsconfig.base.json
apps/
packages/
public/
docs/
cloudbase/functions/createDownloadUrl/
scripts/
THIRD_PARTY_NOTICES.md
OPEN_SOURCE_LICENSES.md
FFMPEG_LICENSE_NOTICE.md
RELEASE_COMPLIANCE_CHECKLIST.md
release/v1.0.0/docs/
release/v1.0.0/installers/SHA256SUMS.txt
apps/web/public/release/v1.0.0/docs/
apps/web/public/release/v1.0.0/installers/SHA256SUMS.txt
```

如果要保留审计历史，也可以提交：

```text
*_REPORT.md
*_PLAN.md
*_CHECKLIST.md
```

但更推荐后续整理到 `docs/audits/` 或 `docs/release-history/`。

## 8. 不要 `git add` 的文件

不要提交：

```text
node_modules/
**/node_modules/
.pnpm-home/
apps/web/.next/
apps/web/out/
apps/desktop/src-tauri/target/
target/
verification/out/
*.log
*.tmp
.tmp/
.icon-tmp/
desktop-preview*.png
preview-*.png
```

不建议普通 Git 提交：

```text
release/v1.0.0/installers/*.exe
release/v1.0.0/installers/*.msi
verification/ffmpeg-binary-candidates/**
```

## 9. 需要人工确认的文件

部署前建议人工确认：

- `.agents/`
- `.codex/`
- `skills-lock.json`
- `verification/**`
- 根目录全部阶段报告是否保持根目录，还是整理到 `docs/audits/`
- `release/v1.0.0/installers/*.exe` / `*.msi` 是否使用 Git LFS 或完全放云存储

## 10. 如果直接部署的风险

如果不先提交 Git 基线直接部署，主要风险：

1. 部署后无法从 Git 精确回滚到当前状态；
2. CloudBase 函数、下载页、SHA256 和 release 文件若后续再被修改，难以追踪差异；
3. 大量未跟踪文件混杂，容易误传安装包、验证样例、内部报告或临时产物；
4. 如果部署错误版本的 EXE / MSI，下载页 SHA256 与实际文件可能再次不一致；
5. 安全 Header / CORS / 大文件限制虽然本地已验证，但未提交前不具备稳定审计基线；
6. 后续绑定正式域名、配置 `ALLOWED_ORIGIN` 时，缺少稳定参照点。

## 11. 推荐提交顺序

建议按以下顺序建立 Git 基线：

### 1. 基础配置和 `.gitignore`

包含：

- `.gitignore`
- `.env.example`
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- `apps/web/next.config.mjs`
- `apps/web/vercel.json`

### 2. CloudBase 下载授权安全增强

包含：

- `cloudbase/functions/createDownloadUrl/index.js`
- `cloudbase/functions/createDownloadUrl/security.js`
- `scripts/test-create-download-url.cjs`
- `apps/web/src/tests/cloudbaseDownloadAuth.test.ts`

### 3. 在线大文件硬限制

包含：

- `apps/web/src/components/tools/ToolsClient.tsx`
- `apps/web/src/tests/privacy.test.ts`

### 4. UI 风格升级

包含：

- `apps/web/src/app/globals.css`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/components/layout/Header.tsx`
- `apps/web/src/components/layout/Footer.tsx`
- `apps/web/src/app/**`
- `apps/web/src/components/**`

### 5. 发布文档和 release SHA256

包含：

- `release/v1.0.0/docs/**`
- `release/v1.0.0/installers/SHA256SUMS.txt`
- `apps/web/public/release/v1.0.0/docs/**`
- `apps/web/public/release/v1.0.0/installers/SHA256SUMS.txt`
- `apps/web/src/config/downloads.ts`
- `THIRD_PARTY_NOTICES.md`
- `OPEN_SOURCE_LICENSES.md`
- `FFMPEG_LICENSE_NOTICE.md`
- `RELEASE_COMPLIANCE_CHECKLIST.md`

不包含：

- `release/v1.0.0/installers/*.exe`
- `release/v1.0.0/installers/*.msi`

除非明确采用 Git LFS 或私有二进制发布仓库。

### 6. 部署报告和审计报告

包含：

- `PRE_DEPLOY_SECURITY_AND_REPO_CLEANUP_REPORT.md`
- `WEBVIEW2_LOCAL_OFFLINE_INSTALLER_CACHE_REPORT.md`
- `UI_STYLE_REFRESH_REPORT.md`
- `UI_STYLE_REFRESH_FINAL_DEPLOY_READY_REPORT.md`
- `GIT_BASELINE_AND_DEPLOY_GATE_REPORT.md`
- 其他需要归档的阶段报告

建议后续整理到：

```text
docs/audits/
docs/release-history/
```

## 12. 最终闸门结论

| 闸门项 | 结论 |
| --- | --- |
| 是否允许部署静态站点 | 允许，但建议先提交 Git 基线 |
| 是否允许上传 EXE / MSI | 允许上传到 CloudBase / COS；不建议普通 Git 提交 |
| 是否允许部署 `createDownloadUrl` 云函数 | 允许，前提是配置 `ALLOWED_ORIGIN(S)` 和下载包 FileID |
| 是否必须先提交 Git 基线 | 正式部署前建议必须提交 |
| 哪些文件建议先 `git add` | 源码、配置、CloudBase 函数源码、许可证、隐私、发布文档、SHA256 |
| 哪些文件不要 `git add` | `node_modules`、`.pnpm-home`、`.next`、`out`、`target`、日志、临时文件、大型安装包 |
| 哪些文件需要人工确认 | `.agents/`、`.codex/`、`skills-lock.json`、`verification/**`、根目录大量阶段报告、EXE/MSI 是否 Git LFS |
| 直接部署风险 | 回滚困难、审计困难、容易混淆旧包和新包、云函数环境变量遗漏风险 |
| 是否可以进入 `UI_STYLE_REFRESH_DEPLOY_ROUND` | 可以，建议先完成 Git 基线提交并配置 CloudBase 环境变量 |

## 13. 下一步建议

1. 先按推荐顺序建立 Git 基线，不提交安装包二进制到普通 Git。
2. 在 CloudBase 云函数中配置 `ALLOWED_ORIGIN` / `ALLOWED_ORIGINS`。
3. 上传当前 `release/v1.0.0/installers` 中的 EXE / MSI 到 CloudBase 云存储对应路径。
4. 部署静态站点 `apps/web/out`。
5. 部署或更新 `createDownloadUrl` 云函数。
6. 部署后验证下载页 SHA256、EXE/MSI 临时下载链接、CORS、OPTIONS、非法 Origin、错误口令。

本轮未自动部署，等待确认后再进入 `UI_STYLE_REFRESH_DEPLOY_ROUND`。
