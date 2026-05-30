# Neat-Freak 修复执行报告

生成时间：2026-05-30

## 已执行修复

1. 下载页合规入口
   - 新增站内发布文档渲染页：`apps/web/src/app/release/v1.0.0/docs/[doc]/page.tsx`
   - 下载页不再直接链接 `.md` 文件，改为：
     - `/release/v1.0.0/docs/release-notes`
     - `/release/v1.0.0/docs/install-guide`
     - `/release/v1.0.0/docs/third-party-notices`
     - `/release/v1.0.0/docs/ffmpeg-license`

2. 离线版广告说明
   - `README.md` 和 `docs/offline.md` 已统一为：离线版不渲染在线广告容器，也不强制联网加载广告。

3. Git 忽略规则
   - `.gitignore` 已加入 `.pnpm-store/` 和 `apps/web/desktop-review*.png`。

4. 项目规则固化
   - 新增 `AGENTS.md`，记录项目硬性边界、常用命令、发布注意事项。

5. 根目录报告归档
   - 根目录阶段性 `.md` 报告已移动到 `docs/reports/archive/`。
   - 根目录仅保留 `README.md`、`AGENTS.md`、许可证和 Notice 入口文件。

6. pnpm 执行路径
   - 新增 `scripts/run-pnpm.cjs`。
   - 根目录 npm 脚本通过本地 `.pnpm-home\pnpm.CMD` 调用 pnpm，当前机器可直接执行 `npm test`、`npm run build:web` 等命令。

## 验证结果

- `npm test`：通过，11 个测试文件、51 个测试。
- `npm run build:web`：通过，生成 19 个静态页面，包含 4 个发布文档 HTML 页面。
- `Playwright`：通过，7 个用例。
- `npm run check:network`：通过，4 个隐私网络边界测试。
- `rg "release/v1.0.0/docs/.*\\.md" apps/web/src apps/web/out`：无匹配，下载页不再使用 `.md` 直链。
- `git check-ignore`：`.pnpm-store/`、`apps/web/desktop-review*.png`、`verification/**/*.png` 均已命中忽略规则。

## 仍需注意

当前工作区包含较多既有历史修改。正式提交前仍需按发布范围分批 stage，避免把非本轮目标的旧变更混入同一次提交。
