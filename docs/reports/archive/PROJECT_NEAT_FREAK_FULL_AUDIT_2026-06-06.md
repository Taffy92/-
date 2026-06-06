# 项目全量卫生审查

日期：2026-06-06

## 结论

项目主流程可构建、核心隐私边界测试通过，报告归档已明显收束。本轮已处理发布产物一致性风险：`v1.0.0` 已选定唯一正式安装包集合，下载配置与 SHA/Notices 已对齐，静态站构建产物不再包含 EXE/MSI 二进制。

## 2026-06-06 处理结果

- 已选定 `release/v1.0.0/installers/` 中的 `DF8258E77E22...` EXE 与 `83AE0FF2E23E...` MSI 作为当前正式 `v1.0.0` 安装包集合。
- `apps/web/src/config/downloads.ts` 已改为默认使用 CloudBase 公开对象路径 `/installers/v1.0.0/`，EXE 与 MSI 链接均已通过 HEAD 校验返回 200，并与正式归档包大小一致。
- `apps/web/public/release/v1.0.0/installers/` 与重新构建后的 `apps/web/out/release/v1.0.0/installers/` 均只保留 `SHA256SUMS.txt`，不再包含 EXE/MSI 二进制。
- 原公开静态目录中的 746/752 MB 新包已移入本地忽略目录 `.tmp/release-public-installers-2026-06-04/`，不再参与静态站构建或部署。
- Notices 生成流程已改为读取 `release/v1.0.0/installers/`，`THIRD_PARTY_NOTICES.md`、`docs/licenses.md`、`docs/third-party-notices.md` 与 `apps/web/src/generated/thirdPartyNotices.ts` 已重新生成并对齐正式包。
- 已验证：`npm run build:web`、`npm run generate:notices`、`npm run check:privacy`、`npm run check:network`、`npm test` 均通过；`git diff --check -- .` 未发现空白错误，仅保留既有 CRLF 提示。

## 已验证

- `npm run check:privacy`：通过，11 个测试通过。
- `npm run check:network`：通过，4 个测试通过，第三方上传拦截日志为预期行为。
- `npm test`：通过，13 个测试文件、60 个测试通过。
- `npm run build:web`：通过，Next.js 静态导出成功。
- `git diff --check -- .`：未发现空白错误；仅有 Windows 行尾提示。

## 已清理

- 删除已被否决的临时审查稿：`verification/online-page-redesign-preview.html`。
- 去掉营销稿中的相对时间表达：`docs/marketing/social-campaign-2026-06-02/moments.md`。
- 报告归档已在本轮前序清理中从 102 个文件收束到当前有效入口。

## 已处理的高优先级问题

### 1. 静态站产物包含大安装包

已处理。`apps/web/public/release/v1.0.0/installers/` 与重新构建后的 `apps/web/out/release/v1.0.0/installers/` 均只保留 `SHA256SUMS.txt`。原公开静态目录中的 746/752 MB 新包已移入本地忽略目录 `.tmp/release-public-installers-2026-06-04/`，不再参与静态站构建或部署。

### 2. `v1.0.0` 安装包集合不一致

已处理。当前正式 `v1.0.0` 采用 `release/v1.0.0/installers/` 中的安装包：

- EXE：`255,387,018 bytes`，约 `243.56 MiB`，SHA256 以 `DF8258E77E22` 开头。
- MSI：`266,625,024 bytes`，约 `254.27 MiB`，SHA256 以 `83AE0FF2E23E` 开头。

下载配置、`SHA256SUMS.txt`、第三方 Notices 和生成的 `thirdPartyNotices.ts` 已统一到这套正式包。CloudBase 公开对象路径 `/installers/v1.0.0/` 下的 EXE/MSI 链接均已通过 HEAD 校验返回 200。

### 3. 工作区存在多组未提交改动

仍需提交时分组处理。当前除了报告清理和发布产物修复外，工作区还有授权、Tauri 权限、备案 footer、广告脚本、测试和部署脚本相关改动。它们可能都合理，但不应和报告清理混在同一个提交里。

建议拆分为至少三组：

- 文档/报告清理。
- 发布产物与下载配置一致性修复。
- 业务代码与权限/授权逻辑改动。

## 良好状态

- `AGENTS.md` 约 26 行，保持为项目规则而不是历史流水账。
- `README.md` 与当前命令、CloudBase 环境 ID、隐私原则和离线授权边界基本一致。
- 未发现裸 `.env`，只保留 `.env.example`。
- Git 只跟踪安装包 SHA256 清单，未跟踪 EXE/MSI 本体。
- `docs/licenses.md` 与 `docs/third-party-notices.md` 的重复是生成脚本明确保留的双入口，不是散落副本。

## 后续注意事项

1. 提交时按“文档/报告清理”“发布产物与下载配置一致性修复”“业务代码与权限/授权逻辑改动”拆分。
2. 如后续重新打包 `v1.0.0` 或发布新版本，先同步 `release/<version>/installers/`、SHA 清单、对象存储链接和下载配置，再重新运行 Notices 生成流程。
3. 正式部署前继续执行 `npm run build:web`，确认 `apps/web/out/release/<version>/installers/` 不含 EXE/MSI 二进制。
