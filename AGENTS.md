# 项目协作规则

本项目是“万能格式转换器”，包含 `apps/web` 在线版、`apps/desktop` Tauri 离线版、`cloudbase/functions/createDownloadUrl` 下载授权云函数。

## 硬性边界

- 不新增登录、注册、会员、云端转换 API 或无关功能。
- 不改变 LOGO、隐私原则、权限模型、本地处理原则。
- 在线版可以保留广告位；离线版不渲染在线广告容器，不强制联网加载广告。
- 用户文件、Canvas、Blob、ArrayBuffer、转换结果不得上传到第三方服务。
- 发布说明、许可证、隐私说明、第三方组件声明等必要文件必须保留。

## 常用命令

当前 Windows 工作区优先使用 npm 脚本；脚本内部会通过 `scripts/run-pnpm.cjs` 调用本地 `.pnpm-home\pnpm.CMD`。

```powershell
npm test
npm run build:web
npm run check:privacy
npm run check:network
npm run package:desktop
```

在线构建产物位于 `apps/web/out`。离线构建会改写构建模式，正式部署前必须重新执行 `npm run build:web`，确保 `apps/web/out` 是在线版产物。

## 文档与发布

- 下载页不得直接链接原始 `.md` 发布文档，应链接站内 HTML 渲染页。
- 根目录只保留 README、许可证、项目规则等入口文件；阶段性报告放入 `docs/reports/archive/`。
- CloudBase 环境 ID 如需替换，必须同步修改 `package.json` 与 `apps/web/cloudbaserc.json`。
