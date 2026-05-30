# 正式发布执行报告（2026-05-28）

## 1. 本次目标

根据前一轮“仍需关注的部署前事项”，完成发布前审查、必要修复、重新构建，并将在线版正式部署到 CloudBase 静态托管。

## 2. 调用的 Skill / MCP

- `code-reviewer`：发布链路、构建产物、测试结果和风险项复核。
- `security-audit`：下载授权、静态公开文件、安装包暴露风险复核。
- `webapp-testing`：上线后 HTTP 回读、页面可访问性和静态资源验证思路。
- CloudBase MCP：
  - `queryFunctions` / `queryGateway`：核对 `createDownloadUrl` 云函数与公网入口。
  - `manageStorage` / `queryStorage`：上传并确认 EXE/MSI 位于 CloudBase 私有云存储。
  - `queryHosting` / `manageHosting`：确认静态托管状态、上传 `apps/web/out`、核对线上文件。

## 3. 本次发现并处理的问题

### 3.1 静态站点误包含安装包副本

发现：

- `apps/web/public/release/v1.0.0/installers/` 内存在 EXE / MSI。
- 构建后的 `apps/web/out` 体积约 573 MB。
- 这会导致 CloudBase 静态托管上传超时，并且有绕过下载授权、直接公开安装包的风险。

处理：

- 已移除前端静态目录中的 EXE / MSI 副本。
- 保留 `SHA256SUMS.txt`，用于用户校验。
- 安装包继续保留在：
  - 本地发布目录：`release/v1.0.0/installers/`
  - CloudBase 私有云存储：`installers/v1.0.0/`
- 重新构建后 `apps/web/out` 约 46 MB，静态托管上传成功。

### 3.2 安装包 SHA256 重新核对

最终以当前真实落盘安装包为准，确认：

| 文件 | SHA256 |
| --- | --- |
| `万能格式转换器_1.0.0_x64-setup.exe` | `797B01FD201BD6D5501220F12B4BF932903549782937C933008F455F39646565` |
| `万能格式转换器_1.0.0_x64_zh-CN.msi` | `AA04807713CEDFD48FE2AAB8F974BFD15871A2AE44169896F79BE7F800466D3E` |

已同步位置：

- `release/v1.0.0/installers/SHA256SUMS.txt`
- `apps/web/public/release/v1.0.0/installers/SHA256SUMS.txt`
- `release/v1.0.0/docs/RELEASE_NOTES.md`
- `apps/web/public/release/v1.0.0/docs/RELEASE_NOTES.md`
- `release/v1.0.0/docs/THIRD_PARTY_NOTICES.md`
- `apps/web/public/release/v1.0.0/docs/THIRD_PARTY_NOTICES.md`
- `apps/web/src/config/downloads.ts`
- `apps/web/src/generated/thirdPartyNotices.ts`

### 3.3 CloudBase CLI 超时

发现：

- 全局 `pnpm` 不在当前 shell PATH。
- `tcb hosting deploy` 在首次上传时无输出并超时，根因与大体积 `out` 有关。

处理：

- 构建改用项目本地 Next.js：`node .\node_modules\next\dist\bin\next build`。
- 部署改用 CloudBase MCP `manageHosting(action="upload")`。
- 在移除静态安装包副本后，部署成功。

## 4. 构建与验证结果

### 4.1 本地构建

执行：

```powershell
node scripts/prepare-static.mjs
node .\node_modules\next\dist\bin\next build
```

结果：

- Next.js production build：通过。
- 静态导出：通过。
- `apps/web/out/release/v1.0.0/installers/` 仅保留 `SHA256SUMS.txt`。
- `apps/web/out` 文件数：275。
- `apps/web/out` 总大小：约 46.46 MB。

### 4.2 下载授权函数

执行：

```powershell
node scripts/test-create-download-url.cjs
```

结果：

- `createDownloadUrl local checks passed`
- 本地校验覆盖：
  - OPTIONS 预检
  - EXE / MSI packageType
  - 错误口令
  - 非法 packageType
  - 非法 Origin
  - 非 JSON 请求 `415`
  - 超大请求体 `413`

### 4.3 CloudBase 存储

已上传并确认：

- `installers/v1.0.0/万能格式转换器_1.0.0_x64-setup.exe`
- `installers/v1.0.0/万能格式转换器_1.0.0_x64_zh-CN.msi`

说明：

- 这些文件位于 CloudBase 存储路径，由 `createDownloadUrl` 校验口令后返回临时下载链接。
- 没有作为静态站点公开文件发布。

## 5. 正式部署结果

正式站点：

- https://format-converter-prod-x-d71bce41-1434109188.tcloudbaseapp.com/

下载页：

- https://format-converter-prod-x-d71bce41-1434109188.tcloudbaseapp.com/download/

下载授权云函数：

- https://format-converter-prod-x-d71bce41.service.tcloudbase.com/createDownloadUrl

线上回读结果：

| 检查项 | 结果 |
| --- | --- |
| 首页 `/` | HTTP 200 |
| 下载页 `/download/` | HTTP 200 |
| `SHA256SUMS.txt` | HTTP 200 |
| 静态托管 `release/v1.0.0/installers/` | 仅存在目录和 `SHA256SUMS.txt` |
| 公开 EXE URL | 未返回安装包二进制，命中 404 页面内容 |

## 6. 仍需人工跟进的正式发布事项

1. 真实域名完成管局审核后，需要绑定到 CloudBase，并同步更新 `createDownloadUrl` 的 `ALLOWED_ORIGIN`。
2. 对外大规模分发前，建议配置 Windows 代码签名证书，降低 SmartScreen / Defender 拦截提示。
3. FFmpeg WASM / sidecar FFmpeg 相关 GPL / LGPL / 专利风险仍需人工法律复核。
4. 离线安装包仍建议在干净 Windows 10 / Windows 11、断网、无 WebView2 Runtime 环境中做最终人工安装测试。
5. 当前工作区仍有多处历史修改和未跟踪文件，正式提交前需要单独做 Git 提交范围审查，避免把临时截图、`.pnpm-store/` 或无关报告误提交。

## 7. 当前结论

在线版已完成正式 CloudBase 部署。当前默认域名可访问，下载页可访问，安装包不再进入静态公开目录，安装包下载仍由 CloudBase 私有存储加授权云函数控制。

