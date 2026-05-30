# GIT_BASELINE_PRE_COMMIT_FIX_REPORT

本轮名称：`GIT_BASELINE_PRE_COMMIT_FIX_ROUND`

本轮范围：只做 Git 提交前修正和复核。不执行 `git add`，不执行 `git commit`，不部署，不上传安装包，不修改 UI、功能、广告、图标、Tauri 权限、WebView2 offlineInstaller 或 sidecar / WASM 范围。

## 1. 本轮修改文件

| 文件 | 修改内容 |
|---|---|
| `.gitignore` | 补充真实环境文件、tsbuildinfo、Playwright 报告、测试结果、verification 候选二进制、sidecar EXE/DLL、release 安装包等忽略规则；修正安装包注释。 |
| `GIT_BASELINE_ADD_COMMANDS.md` | 改为更保守的分批提交建议；移除容易误复制的危险 `git add` 命令；sidecar 二进制改为人工确认后处理。 |
| `SIDECAR_BINARY_VERSIONING_DECISION.md` | 新增 sidecar FFmpeg 二进制版本管理决策，列出文件大小、SHA256、Git LFS / 私有制品仓库建议。 |
| `GIT_BASELINE_PRE_COMMIT_FIX_REPORT.md` | 新增本报告。 |

## 2. `.gitignore` 补充情况

| 检查项 | 结果 |
|---|---|
| 是否补充 `.gitignore` | 是 |
| 是否覆盖 `*.tsbuildinfo` | 是，已覆盖 `*.tsbuildinfo` 和 `**/*.tsbuildinfo` |
| 是否覆盖真实 `.env` | 是，已覆盖 `.env`、`.env.*`、`*.local` |
| 是否保留 `.env.example` | 是，使用 `!.env.example` 显式允许提交 |
| 是否覆盖 `apps/web/test-results/` | 是 |
| 是否覆盖 `apps/web/playwright-report/` | 是，已同时覆盖目录和目录内文件 |
| 是否覆盖 `apps/web/verification/` | 是 |
| 是否覆盖 verification 输出 | 是，已覆盖 `verification/out/`、`verification/**/*.tmp`、`verification/**/*.log`、`verification/ffmpeg-binary-candidates/` |
| 是否覆盖 sidecar FFmpeg EXE/DLL | 是，已覆盖 `apps/desktop/src-tauri/resources/ffmpeg/bin/*.exe` 和 `*.dll` |
| 是否覆盖 release EXE/MSI | 是，已覆盖 `release/*/installers/*.exe` 和 `*.msi` |
| 是否保留 release SHA256SUMS | 是，已显式保留 `!release/*/installers/SHA256SUMS.txt` |
| 是否明确 release verification 策略 | 是，`release/*/verification/*.md` 可提交，日志、临时文件、输出、截图和二进制已忽略 |

## 3. `.gitignore` 实测命中结果

| 路径 | 结果 | 说明 |
|---|---|---|
| `node_modules/` | 已忽略 | 依赖目录 |
| `.pnpm-home/` | 已忽略 | 本地 pnpm 目录 |
| `apps/web/out/` | 已忽略 | 静态导出产物 |
| `apps/web/.next/` | 已忽略 | Next 构建产物 |
| `apps/desktop/src-tauri/target/` | 已忽略 | Rust / Tauri 构建产物 |
| `.env` | 已忽略 | 真实环境变量 |
| `.env.production` | 已忽略 | 真实环境变量 |
| `.env.local` | 已忽略 | 本地环境变量 |
| `.env.example` | 可提交 | 示例环境文件，符合预期 |
| `apps/web/test-results/` | 已忽略 | 测试结果 |
| `apps/web/playwright-report/` | 已忽略 | Playwright 报告 |
| `verification/ffmpeg-binary-candidates/` | 已忽略 | 候选 FFmpeg 二进制验证目录 |
| `apps/desktop/src-tauri/resources/ffmpeg/bin/ffmpeg.exe` | 已忽略 | sidecar 二进制，需人工确认 |
| `apps/desktop/src-tauri/resources/ffmpeg/bin/avcodec-61.dll` | 已忽略 | sidecar DLL，需人工确认 |
| `release/*/installers/*.exe` | 已忽略 | 大型安装包，不进普通 Git |
| `release/*/installers/*.msi` | 已忽略 | 大型安装包，不进普通 Git |
| `release/*/installers/SHA256SUMS.txt` | 可提交 | 发布校验清单 |
| `release/*/verification/*.md` | 可提交 | 发布验证文档和检查清单 |
| `release/*/verification` 下的日志、临时文件、输出、截图、二进制 | 已忽略 | 不进入普通 Git |

## 4. 当前 Git 状态分类

当前 `git status --short` 仍显示大量未跟踪文件。分类如下。

| 分类 | 文件 / 目录 | 处理建议 |
|---|---|---|
| 可提交：源码 | `apps/` 中的源码、`packages/`、`public/`、`scripts/`、`package.json`、`pnpm-lock.yaml`、`pnpm-workspace.yaml`、`tsconfig.base.json` | 按 `GIT_BASELINE_ADD_COMMANDS.md` 分批加入，提交前检查 diff |
| 可提交：配置 | `.gitignore`、`.env.example`、`apps/web/next.config.mjs`、`apps/web/vercel.json`、`apps/web/cloudbaserc.json` | 可进入第一批 |
| 可提交：CloudBase 函数源码 | `cloudbase/functions/createDownloadUrl/` 源码和必要 `package.json` | 可进入第二批；不要加入 node_modules 或真实环境变量 |
| 可提交：许可证 / 隐私 / 发布说明 | `THIRD_PARTY_NOTICES.md`、`OPEN_SOURCE_LICENSES.md`、`FFMPEG_LICENSE_NOTICE.md`、`RELEASE_COMPLIANCE_CHECKLIST.md`、`docs/`、`README.md`、`LICENSE` | 可提交 |
| 可提交：release 文档 | `release/*/docs/`、`release/*/installers/SHA256SUMS.txt`、`release/*/verification/*.md` | 可提交 |
| 不建议提交：release verification 产物 | `release/*/verification/` 下的日志、临时文件、样例文件、输出文件、截图和二进制 | 已忽略 |
| 不建议提交：安装包 | `release/*/installers/*.exe`、`release/*/installers/*.msi` | 已忽略；用 CloudBase/COS/Release 附件/Git LFS 管理 |
| 不建议提交：构建产物 | `apps/web/out/`、`apps/web/.next/`、`apps/desktop/src-tauri/target/`、`target/` | 已忽略 |
| 不建议提交：依赖和缓存 | `node_modules/`、`.pnpm-home/`、日志、临时目录 | 已忽略 |
| 需要人工确认 | `.agents/`、`.codex/`、`skills-lock.json`、`verification/`、`apps/desktop/src-tauri/resources/ffmpeg/bin/*.exe`、`apps/desktop/src-tauri/resources/ffmpeg/bin/*.dll` | 默认不要一键加入；根据团队策略决定 |

## 5. `GIT_BASELINE_ADD_COMMANDS.md` 修正结果

已修正。

重点变化：

- 不再整目录盲加 `apps/web/src/config`，改为列出明确配置文件；
- 不再提供会误加入真实 `.env` 的可复制命令；
- 不再提供会误加入 EXE / MSI 的可复制命令；
- 不再提供会误加入 `apps/web/out`、`.next`、`node_modules`、`.pnpm-home`、`target` 的可复制命令；
- 不再提供会误加入 `verification/ffmpeg-binary-candidates` 的可复制命令；
- sidecar FFmpeg 的 `bin/*.exe` 和 `bin/*.dll` 单独标注为人工确认后处理；
- release 只建议加入 docs、`SHA256SUMS.txt` 和 verification 下的 Markdown 审计归档，不加入安装包。

说明：文件中仍包含 `git add -- .env.example`，这是允许提交的示例环境文件，不是真实环境变量文件。

## 6. EXE / MSI 策略

仍不建议提交 EXE / MSI 到普通 Git。

原因：

- 文件体积大；
- 每次重新打包都会改变 SHA256，普通 Git 仓库会快速膨胀；
- 安装包更适合放在 CloudBase、COS、GitHub Release 附件、私有制品库或 Git LFS。

当前建议：

- Git 中保留 `release/*/installers/SHA256SUMS.txt`；
- Git 中可保留 `release/*/docs/**` 和 `release/*/verification/*.md`；
- EXE / MSI 走 CloudBase/COS/Release artifact；
- 下载页继续展示 SHA256；
- 不把安装包加入普通 Git。

## 7. sidecar FFmpeg bin 策略

已生成 `SIDECAR_BINARY_VERSIONING_DECISION.md`。

当前结论：

- `ffmpeg.exe`、`ffprobe.exe`、`*.dll` 是离线专业版 sidecar 打包所需资源；
- 默认不要直接提交到普通 Git；
- 如果要纳入版本管理，建议使用 Git LFS；
- 如果不使用 Git LFS，应放入私有制品仓库、CloudBase 私有归档或内部 release artifact；
- Git 中至少保留 `README.txt`、`BUILD_CONFIG.txt`、`SOURCE_OFFER.txt`、`SHA256SUMS.txt`、`ffmpeg-version.txt`、`ffprobe-version.txt` 和 `LICENSES/`。

## 8. 是否仍建议先建立 Git 基线

是。

当前项目已经进入发布前阶段，建议先建立 Git 基线，再部署静态站点和下载页。这样可以明确：

- 哪些源码和配置是当前发布版本；
- 哪些文档和 SHA256 属于当前发布包；
- 哪些二进制和构建产物不进入普通 Git；
- 后续 CloudBase 部署问题可以基于干净基线回溯。

## 9. 当前是否可以进入 `GIT_BASELINE_EXECUTE_ROUND`

可以，但需要人工确认以下清单后再执行任何 `git add`：

1. 是否接受 `.agents/` 不进入产品仓库；
2. 是否接受 `.codex/skills/hallmark/` 不进入产品仓库；
3. `skills-lock.json` 是否需要提交；
4. `verification/` 中哪些文档需要归档，哪些测试输出不提交；
5. sidecar FFmpeg `bin/*.exe` 和 `bin/*.dll` 是否使用 Git LFS、私有制品仓库或 CloudBase 私有归档；
6. release 目录只提交 docs、`SHA256SUMS.txt` 和 verification Markdown 文档，不提交 EXE/MSI；
7. 提交前再次确认没有真实 `.env`、密钥、下载口令、CloudBase Secret。

## 10. 执行 git add 前必须人工确认

| 项目 | 默认建议 |
|---|---|
| `.agents/` | 不提交，除非确定要把 CloudBase Skill 本地副本纳入项目 |
| `.codex/` | 不提交，属于本地 Codex/Skill 工作目录 |
| `skills-lock.json` | 人工确认；若只是本地技能锁文件，建议不提交 |
| `verification/` | 只提交必要说明文档；候选二进制、输出、日志不提交 |
| `release/*/verification/` | 只提交 `*.md` 发布验证文档；日志、临时文件、样例、输出、截图、二进制不提交 |
| `apps/desktop/src-tauri/resources/ffmpeg/bin/*.exe` | 不进普通 Git；需要 Git LFS 或制品仓库 |
| `apps/desktop/src-tauri/resources/ffmpeg/bin/*.dll` | 不进普通 Git；需要 Git LFS 或制品仓库 |
| `release/*/installers/*.exe` | 不进普通 Git |
| `release/*/installers/*.msi` | 不进普通 Git |
| 真实 `.env` / `.env.*` | 不提交 |
| CloudBase 环境变量值 | 不提交 |

## 11. 本轮未做事项

- 未执行 `git add`；
- 未执行 `git commit`；
- 未部署 CloudBase；
- 未上传 EXE / MSI；
- 未修改 UI；
- 未修改功能逻辑；
- 未修改广告逻辑；
- 未修改程序图标；
- 未修改 CloudBase 下载授权业务流程；
- 未修改 Tauri 权限；
- 未修改 WebView2 offlineInstaller；
- 未修改 sidecar / WASM 当前范围；
- 未新增云转换；
- 未上传用户处理文件。

## 12. 结论

提交前风险点已完成静态修正：

- `.gitignore` 已覆盖真实环境变量、测试结果、构建产物、全部版本 release 安装包、release verification 产物、verification 候选二进制和 sidecar EXE/DLL；
- `GIT_BASELINE_ADD_COMMANDS.md` 已改为保守可执行清单；
- sidecar FFmpeg 二进制版本管理已单独成文；
- 当前可以在人工确认 sidecar 和本地 Skill 目录策略后进入 `GIT_BASELINE_EXECUTE_ROUND`。
