# 全项目整理报告

日期：2026-06-02

## 当前结论

- 在线版正式域名：`https://gszhmrx.cn/` 和 `https://www.gszhmrx.cn/`。
- CloudBase 环境：`format-converter-prod-x-d71bce41`。
- 静态托管产物目录：`apps/web/out`。
- 线上首页与本地 `apps/web/out/index.html` 哈希一致：`eedb2f334f348a7f68d4a318c053a9601b177379bb6c2210456f065ee6edd9bb`。
- 页脚备案号来源：`apps/web/src/config/site.ts` 的 `siteConfig.icp.text`，当前为 `鲁ICP备2026028326号`。
- `release/v1.0.0/docs` 与 `apps/web/public/release/v1.0.0/docs` 的发布文档镜像一致；`SHA256SUMS.txt` 也一致。

## 已整理

- 活跃入口文档已指向正式域名和当前 CloudBase 下载授权云函数。
- `.env.example` 保持本地开发默认关闭下载授权，避免误连生产；生产环境通过 `apps/web/.env.production` 启用授权下载和广告配置。
- 旧默认域名引用仅保留在 `docs/reports/archive/` 的历史报告中，作为阶段性记录，不再作为当前操作入口。

## 注意事项

- `createDownloadUrl` 源码中的信息页下载链接已指向 `https://gszhmrx.cn/download/`，但线上云函数根路径回读仍显示旧 CloudBase 默认域名链接。下载授权健康检查正常，且该问题只影响直接访问云函数根路径的信息页。
- 如需修正线上云函数信息页，单独更新 `createDownloadUrl` 云函数代码；不要覆盖现有生产环境变量 `DOWNLOAD_PASSWORD`、`INSTALLER_EXE_FILE_ID`、`INSTALLER_MSI_FILE_ID` 和 `ALLOWED_ORIGINS`。
