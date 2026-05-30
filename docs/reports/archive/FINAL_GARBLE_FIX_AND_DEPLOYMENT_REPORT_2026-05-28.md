# 发布说明乱码修复与重新部署报告

## 结论

本次已完成发布说明相关入口的乱码复核、构建、重新上传和线上验证。

## 发现的问题

1. 下载页中的“发布说明与合规入口”会打开静态 markdown 文档。
2. 先前静态发布包中，页面和文档的编码显示曾出现异常，用户打开后看到乱码。
3. 发布前需要确保静态导出中不包含 EXE / MSI 安装包副本，只保留 `SHA256SUMS.txt`。

## 处理结果

1. 重新审查了 `apps/web/src/app/download/page.tsx` 以及 `release/v1.0.0/docs/*`、`apps/web/public/release/v1.0.0/docs/*`。
2. 重新执行了静态构建：
   - `node scripts/prepare-static.mjs`
   - `node .\node_modules\next\dist\bin\next build`
3. 重新上传了 `apps/web/out` 到 CloudBase 静态托管。
4. 复核静态导出目录，仅保留 `SHA256SUMS.txt`，未带入 EXE / MSI。

## 线上验证

已验证以下线上地址返回正常内容：

- 首页：`https://format-converter-prod-x-d71bce41-1434109188.tcloudbaseapp.com/`
- 下载页：`https://format-converter-prod-x-d71bce41-1434109188.tcloudbaseapp.com/download/`
- 发布说明：`https://format-converter-prod-x-d71bce41-1434109188.tcloudbaseapp.com/release/v1.0.0/docs/RELEASE_NOTES.md`
- 安装指南：`https://format-converter-prod-x-d71bce41-1434109188.tcloudbaseapp.com/release/v1.0.0/docs/INSTALL_GUIDE.md`

验证结果：

- 下载页可正常出现“下载离线安装版”“下载口令”“发布说明与合规入口”。
- 发布说明与安装指南可正常显示中文内容。
- 静态托管未公开 EXE / MSI 副本。

## 仍需关注

1. 真实自定义域名绑定需等管局审核完成后再补。
2. EXE / MSI 仍通过私有云存储 + 口令云函数分发，后续要继续保持权限和口令收敛。
3. 正式发布前仍建议做一次干净 Windows VM 的最终人工验证。
