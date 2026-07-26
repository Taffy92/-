# 项目协作规则

本项目是“万能格式转换器”，包含 `apps/web` 在线版、`apps/desktop` Tauri 离线版、`cloudbase/functions/licenseAdmin` 私有授权后台，以及备用的 `cloudbase/functions/createDownloadUrl` 下载口令云函数。

## 硬性边界

- 不新增登录、注册、会员、云端转换 API 或无关功能。
- 不改变 LOGO、隐私原则、权限模型、本地处理原则。
- 在线版可以保留广告位；离线版不渲染在线广告容器，不强制联网加载广告。
- 用户文件、Canvas、Blob、ArrayBuffer、转换结果不得上传到第三方服务。
- 离线版选择多个文件时必须平铺预览；图片显示缩略图，PDF/Word/Excel 显示第一页缩略图，视频显示首帧容器。
- 离线版批量结果必须写入独立文件夹，PDF/Word/Excel 多页结果写入同名子文件夹，不得回退为 ZIP 或 7Z 汇总。
- 离线商业授权只允许做 Tauri 本地 3 天试用、机器码、离线激活码或授权文件校验，不引入登录、会员或云端转换。
- 授权私钥、客户记录、生成的 `.mrx` 授权文件不得进入在线站点、客户安装包或公开仓库。
- `licenseAdmin` 只给管理员生成离线激活码和 `license.mrx`，不得接收或上传用户处理文件。
- 发布说明、许可证、隐私说明、第三方组件声明等必要文件必须保留。

## 常用命令

当前 Windows 工作区优先使用 npm 脚本；脚本内部会通过 `scripts/run-pnpm.cjs` 调用本地 `.pnpm-home\pnpm.CMD`。

发布和打包环境固定为 Node 20 LTS 与 pnpm 9.15.4，根目录 `.nvmrc`、`package.json` 的 `engines` 和 `packageManager` 是准绳；非 Node 20 环境只适合本地排查，正式构建前必须切回 Node 20。

```powershell
npm test
npm run build:web
npm run build:edgeone
npm run check:privacy
npm run check:network
npm run package:desktop
npm run deploy:edgeone
npm run deploy:license-admin
```

在线构建产物位于 `apps/web/out`。离线构建会改写构建模式，正式部署到 EdgeOne 前必须执行 `npm run build:edgeone`，由脚本校验本地正式 EXE/MSI、生成同源分片和下载清单。原始安装包与生成分片不得进入 Git；`npm run build:web` 仅用于普通在线构建，不包含 EdgeOne 安装包分片。

## 文档与发布

- 下载页不得直接链接原始 `.md` 发布文档，应链接站内 HTML 渲染页。
- 根目录只保留 README、许可证、项目规则等入口文件；阶段性报告放入 `docs/reports/archive/`。
- EdgeOne 是公开网站和试用安装包的正式分发渠道；CloudBase 仅保留私有授权后台、下载口令备用云函数和过渡托管能力。
- CloudBase 环境 ID 如需替换，必须同步修改 `package.json` 与 `apps/web/cloudbaserc.json`。
