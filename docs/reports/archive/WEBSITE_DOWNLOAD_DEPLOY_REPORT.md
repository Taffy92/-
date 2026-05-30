# WEBSITE_DOWNLOAD_DEPLOY_REPORT

本轮名称：WEBSITE_DOWNLOAD_DEPLOY_ROUND

生成时间：2026-05-25

## 1. 部署到了哪里

已部署到当前绑定的腾讯云 CloudBase 环境：

- 环境 ID：`format-converter-prod-x-d71bce41`
- 静态托管默认域名：`https://format-converter-prod-x-d71bce41-1434109188.tcloudbaseapp.com`
- 下载授权云函数域名：`https://format-converter-prod-x-d71bce41.service.tcloudbase.com/createDownloadUrl`
- 安装包云存储路径：
  - `installers/v1.0.0/万能格式转换器_1.0.0_x64-setup.exe`
  - `installers/v1.0.0/万能格式转换器_1.0.0_x64_zh-CN.msi`

说明：CloudBase 默认 `tcloudbaseapp.com` 测试域名会出现腾讯云“风险提醒”访问页。正式对外发布前，建议绑定已备案自定义域名，避免用户看到测试域名提醒。

## 2. 下载页地址

```text
https://format-converter-prod-x-d71bce41-1434109188.tcloudbaseapp.com/download/
```

下载页已更新并上传，包含：

- 在线版入口；
- Windows 离线专业版介绍；
- EXE 安装包信息；
- MSI 安装包信息；
- SHA256 校验值；
- 安装指南入口；
- 隐私说明入口；
- 开源许可证入口；
- 第三方组件声明入口；
- FFmpeg 许可证说明入口；
- 文件本地处理说明；
- 批量处理为离线专业版功能说明；
- SmartScreen / 未签名安装包提示。

## 3. 在线版地址

```text
https://format-converter-prod-x-d71bce41-1434109188.tcloudbaseapp.com/tools/
```

在线版继续保持轻量单文件或少量文件处理，不启用离线专业版批量任务队列。

## 4. EXE 下载地址

EXE 安装包未放入公开静态托管直链。

下载方式：

1. 用户打开下载页；
2. 选择 `EXE 安装包`；
3. 输入作者提供的下载口令；
4. 前端调用 CloudBase 下载授权云函数；
5. 云函数返回短时有效临时下载链接。

EXE 云存储路径：

```text
installers/v1.0.0/万能格式转换器_1.0.0_x64-setup.exe
```

EXE SHA256：

```text
CFCBBAA5CF9DAF39CF864E5FD59D8B4DFADAA5388112578E6EA21575EBCADE0F
```

部署后验证：下载授权接口以 `packageType=exe` 请求时已返回临时下载链接。

## 5. MSI 下载地址

MSI 安装包未放入公开静态托管直链。

下载方式：

1. 用户打开下载页；
2. 选择 `MSI 安装包`；
3. 输入作者提供的下载口令；
4. 前端调用 CloudBase 下载授权云函数；
5. 云函数返回短时有效临时下载链接。

MSI 云存储路径：

```text
installers/v1.0.0/万能格式转换器_1.0.0_x64_zh-CN.msi
```

MSI SHA256：

```text
BB7E6CE8DEBD3AB41A75372FC407B24A24C8F839B7CF782DC9FA0809DAAE6160
```

部署后验证：下载授权接口以 `packageType=msi` 请求时已返回临时下载链接。

## 6. SHA256SUMS 地址

```text
https://format-converter-prod-x-d71bce41-1434109188.tcloudbaseapp.com/release/v1.0.0/installers/SHA256SUMS.txt
```

已验证 HTTP 状态码：`200`

内容包含：

```text
BB7E6CE8DEBD3AB41A75372FC407B24A24C8F839B7CF782DC9FA0809DAAE6160  万能格式转换器_1.0.0_x64_zh-CN.msi
CFCBBAA5CF9DAF39CF864E5FD59D8B4DFADAA5388112578E6EA21575EBCADE0F  万能格式转换器_1.0.0_x64-setup.exe
```

## 7. 隐私说明地址

页面版：

```text
https://format-converter-prod-x-d71bce41-1434109188.tcloudbaseapp.com/privacy/
```

发布文档版：

```text
https://format-converter-prod-x-d71bce41-1434109188.tcloudbaseapp.com/release/v1.0.0/docs/PRIVACY_NOTICE.md
```

## 8. 开源许可证地址

页面版：

```text
https://format-converter-prod-x-d71bce41-1434109188.tcloudbaseapp.com/licenses/
```

发布文档版：

```text
https://format-converter-prod-x-d71bce41-1434109188.tcloudbaseapp.com/release/v1.0.0/docs/OPEN_SOURCE_LICENSES.md
```

## 9. 第三方 Notices 地址

```text
https://format-converter-prod-x-d71bce41-1434109188.tcloudbaseapp.com/release/v1.0.0/docs/THIRD_PARTY_NOTICES.md
```

已验证 HTTP 状态码：`200`

## 10. FFmpeg 许可证说明地址

```text
https://format-converter-prod-x-d71bce41-1434109188.tcloudbaseapp.com/release/v1.0.0/docs/FFMPEG_LICENSE_NOTICE.md
```

已验证 HTTP 状态码：`200`

## 11. 是否使用 CloudBase 下载授权

是。

已更新并部署云函数：

```text
createDownloadUrl
```

云函数行为：

- 接收 `password`、`packageType`、`appName`、`version`；
- `packageType=exe` 返回 EXE 临时下载链接；
- `packageType=msi` 返回 MSI 临时下载链接；
- 只生成安装包临时链接；
- 不接收、不读取、不处理用户图片、PDF、Word、Excel、音频、视频或转换结果。

云函数健康检查：

```json
{"ok":true,"service":"createDownloadUrl","mode":"shared_password","configured":true}
```

## 12. 是否使用服务器或 COS

使用 CloudBase：

- CloudBase 静态网站托管：部署官网、在线版、下载页和公开说明文档；
- CloudBase 云存储：保存 EXE / MSI 安装包；
- CloudBase 云函数：下载口令授权和临时下载链接生成。

没有新增任何云端转换服务。

## 13. 是否上传任何用户处理文件

否。

本轮只上传：

- 网站静态构建产物 `apps/web/out`；
- EXE / MSI 安装包；
- SHA256SUMS；
- 发布说明、安装指南、隐私说明、开源许可证和第三方 Notices。

没有上传用户处理文件、测试隐私样例文件、转换结果、OCR 文本、解析内容或任务历史。

## 14. 是否新增云转换

否。

CloudBase 只用于：

- 静态网页托管；
- 安装包云存储；
- 下载口令授权；
- 临时下载链接生成。

没有新增：

- 云端图片转换；
- 云端视频转换；
- 云端音频转换；
- 云端 Word / Excel / PDF 转换；
- 用户文件上传接口。

## 15. 下载链接是否验证

已验证。

验证方式：

- `packageType=exe` + 正确下载口令：返回临时链接；
- `packageType=msi` + 正确下载口令：返回临时链接；
- 临时链接不写入代码和页面，不作为永久公开链接。

## 16. SHA256 是否验证

已验证：

- 本地 release 目录 SHA256 已生成；
- 下载页配置已更新为最终 SHA256；
- `/release/v1.0.0/installers/SHA256SUMS.txt` 已上传并可访问；
- 下载页 HTML 中包含最终 EXE / MSI SHA256。

## 17. 移动端是否检查

已做 375px 自动化访问检查。

结果：

- CloudBase 默认测试域名首先显示腾讯云“风险提醒”页；
- 风险提醒页本身无横向溢出；
- 由于默认测试域名拦截，自动化未能直接进入真实下载页完成完整移动端视觉核查；
- 静态文件和页面内容通过 HTTP 检查可访问。

正式对外发布建议：

1. 绑定已备案自定义域名；
2. 在自定义域名下重新做 375px、768px、1440px 页面检查；
3. 再确认下载页卡片、口令输入框和文档入口无横向溢出。

## 18. 是否可以给测试用户试用

可以给小范围测试用户试用，但有两个前提：

1. 当前默认域名会显示 CloudBase 测试域名风险提醒，测试用户需要点击确认访问；
2. 正式公开推广前应绑定已备案自定义域名，避免测试域名提醒影响信任度。

测试用户可使用：

```text
https://format-converter-prod-x-d71bce41-1434109188.tcloudbaseapp.com/download/
```

并通过作者提供的统一下载口令获取 EXE 或 MSI 临时下载链接。

## 19. 正式商业发布前仍需完成事项

1. 绑定正式域名；
2. 完成 ICP 备案和 CloudBase 自定义域名配置；
3. 在正式域名下重新检查下载页、在线工具页和文档入口；
4. 检查 CloudBase 默认风险提醒是否消失；
5. 如果需要公开商业销售，继续完成 FFmpeg / BtbN / FFmpeg WASM 许可证人工复核；
6. 评估 Windows 代码签名证书，降低 SmartScreen 提示；
7. 明确授权下载、退款、售后、发票和用户协议流程；
8. 根据正式域名更新 `NEXT_PUBLIC_SITE_URL` 并重新构建部署；
9. 根据正式域名更新下载授权云函数 `ALLOWED_ORIGIN`；
10. 如果下载量较大，考虑将安装包迁移到私有 COS Bucket 并配置 CDN。

