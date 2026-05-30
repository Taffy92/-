# 2026-05-31 部署后知识库整理报告

## 背景

本报告记录在线版默认 CloudBase 域名部署后的知识库整理状态，方便后续审核自定义域名、拆分提交和继续 UI 调整。

## 当前部署事实

- 默认访问地址：`https://format-converter-prod-x-d71bce41-1434109188.tcloudbaseapp.com`
- CloudBase 环境：`format-converter-prod-x-d71bce41`
- 静态产物目录：`apps/web/out`
- 部署命令：`npm run deploy:cloudbase`
- 部署结果：上传 281 个文件，失败 0 个。
- 自定义域名：尚未绑定，等待用户提供审核通过的域名后再处理。

## 已验证项

- `npm test` 通过：11 个测试文件，51 个测试。
- `npm run build:web` 通过，当前 `apps/web/out` 是在线版静态产物。
- `/download/` 线上页面包含当前 EXE/MSI SHA，未出现旧 SHA。
- `/licenses/` 线上页面包含当前 EXE SHA，未出现旧 SHA。
- 下载页文档链接使用站内 HTML 渲染页，不直接链接原始 `.md` 发布文档。

## 当前发布元数据

| 文件 | 大小 | SHA256 |
| --- | ---: | --- |
| `万能格式转换器_1.0.0_x64-setup.exe` | 257,629,869 bytes / 245.69 MB | `797B01FD201BD6D5501220F12B4BF932903549782937C933008F455F39646565` |
| `万能格式转换器_1.0.0_x64_zh-CN.msi` | 268,967,936 bytes / 256.51 MB | `AA04807713CEDFD48FE2AAB8F974BFD15871A2AE44169896F79BE7F800466D3E` |

这些值应在 `apps/web/src/config/downloads.ts`、`release/v1.0.0/installers/SHA256SUMS.txt`、`apps/web/public/release/v1.0.0/installers/SHA256SUMS.txt`、Release Notes 和第三方 Notices 中保持一致。

## 工作区交接提示

当前工作区存在大量未提交变更，提交前建议拆分为以下批次：

1. 报告归档与项目规则整理：`docs/reports/**`、`AGENTS.md`、`.gitignore`。
2. 在线 UI 重构与样式调整：`apps/web/src/app/**`、`apps/web/src/components/**`、`apps/web/src/app/globals.css`、`packages/ui/**`。
3. 下载授权与安全配置：`cloudbase/functions/createDownloadUrl/**`、`apps/web/src/components/download/**`、`apps/web/src/config/securityHeaders.*`、`apps/web/vercel.json`。
4. 发布元数据同步：`apps/web/src/config/downloads.ts`、`release/v1.0.0/**`、`apps/web/public/release/v1.0.0/**`、`THIRD_PARTY_NOTICES.md`、`docs/licenses.md`、`docs/third-party-notices.md`。
5. 构建脚本与测试工具：`package.json`、`scripts/run-pnpm.cjs`、`apps/web/scripts/**`、`apps/web/playwright.config.ts`。

不要把 `apps/web/out`、`.env.production`、本地预览图或日志文件纳入 Git。

## 后续待办

- 用户提供审核通过的自定义域名后，更新 `NEXT_PUBLIC_SITE_URL`，重新执行 `npm run build:web`，再部署并验证 canonical、sitemap、Open Graph URL。
- 如再次打包离线版，部署在线版前必须重新执行 `npm run build:web`，避免 `apps/web/out` 留在离线构建模式。
