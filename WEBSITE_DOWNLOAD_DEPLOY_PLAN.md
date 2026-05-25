# WEBSITE_DOWNLOAD_DEPLOY_PLAN

本轮名称：WEBSITE_DOWNLOAD_DEPLOY_ROUND

生成时间：2026-05-25

## 1. 推荐部署结构

推荐采用“静态官网 + 私有安装包 + CloudBase 下载授权”的结构：

```text
CloudBase 静态网站托管
  /
  /tools/
  /download/
  /privacy/
  /licenses/
  /release/v1.0.0/docs/*.md
  /release/v1.0.0/installers/SHA256SUMS.txt

CloudBase 云存储或 COS 私有目录
  installers/v1.0.0/万能格式转换器_1.0.0_x64-setup.exe
  installers/v1.0.0/万能格式转换器_1.0.0_x64_zh-CN.msi

CloudBase 云函数
  createDownloadUrl
    - 校验统一下载口令
    - 根据 EXE/MSI 类型生成短时临时下载链接
    - 不接收用户处理文件
```

## 2. 静态站点目录

静态站点构建目录：

```text
apps/web/out
```

部署到 CloudBase 静态托管根目录：

```text
/
```

静态站点只包含网页、JS/CSS、PDF.js、FFmpeg WASM、说明文档和 SHA256SUMS，不包含用户处理文件。

## 3. 安装包存放目录

安装包不建议放入公开静态托管目录。建议上传到 CloudBase 云存储或 COS 的私有路径：

```text
installers/v1.0.0/万能格式转换器_1.0.0_x64-setup.exe
installers/v1.0.0/万能格式转换器_1.0.0_x64_zh-CN.msi
```

下载页不公开直链，用户输入作者提供的下载口令后，由 CloudBase 云函数返回短时有效临时链接。

## 4. SHA256SUMS.txt 展示方式

公开展示：

```text
/release/v1.0.0/installers/SHA256SUMS.txt
```

下载页同时展示 EXE / MSI 的 SHA256，用户下载后可用 PowerShell 校验：

```powershell
Get-FileHash -Algorithm SHA256 ".\万能格式转换器_1.0.0_x64-setup.exe"
Get-FileHash -Algorithm SHA256 ".\万能格式转换器_1.0.0_x64_zh-CN.msi"
```

## 5. 下载按钮链接策略

下载页展示两个入口：

1. 获取 EXE 下载链接；
2. 获取 MSI 下载链接。

实际下载流程：

1. 用户选择 EXE 或 MSI；
2. 输入下载口令；
3. 前端调用 CloudBase 下载授权云函数；
4. 云函数只校验口令和安装包类型；
5. 云函数返回对应安装包的短时有效临时链接；
6. 用户直接下载安装包。

下载授权接口不得接收图片、文档、音频、视频、转换结果或 OCR/解析内容。

## 6. 是否走 CloudBase 下载授权

建议继续使用 CloudBase 下载授权。

当前下载页已经保留授权说明：

- 离线专业版需要输入下载口令；
- CloudBase 只校验口令并生成下载链接；
- CloudBase 不接触用户处理文件。

## 7. 是否需要对象存储 COS

当前可先使用 CloudBase 云存储保存安装包。

如果后续下载量增大，建议迁移到 COS 私有 Bucket，并继续由 CloudBase 云函数生成临时链接。

COS 建议：

- 不公开 Bucket；
- 不开启任意匿名读；
- 下载链接短时有效；
- 仅记录授权下载日志，不记录用户处理文件。

## 8. 隐私政策页面

必须保留：

```text
/privacy/
```

页面需要继续说明：

- 文件默认在本地处理；
- 不上传用户文件；
- 在线版音视频使用本地 FFmpeg WASM；
- 离线专业版可断网使用；
- CloudBase 只用于下载授权；
- 广告不接收用户处理文件。

## 9. 开源许可证页面

必须保留：

```text
/licenses/
```

同时公开发布归档文档：

```text
/release/v1.0.0/docs/OPEN_SOURCE_LICENSES.md
/release/v1.0.0/docs/THIRD_PARTY_NOTICES.md
/release/v1.0.0/docs/FFMPEG_LICENSE_NOTICE.md
/release/v1.0.0/docs/RELEASE_COMPLIANCE_CHECKLIST.md
```

## 10. 下载页安全提示

下载页必须继续展示：

- 文件默认在本地处理，不上传服务器；
- 批量处理为 Windows 离线专业版功能；
- SmartScreen / 未签名安装包可能出现提示；
- 下载后建议核对 SHA256；
- FFmpeg 相关许可证和商业发布前复核提醒。

不要使用：

- “绝对安全”；
- “完全无风险”；
- “已完成 FFmpeg 商业许可证最终复核”。

## 11. 回滚方案

静态站点回滚：

1. 保留上一版 `apps/web/out` 归档；
2. 如果新版异常，重新上传上一版静态目录；
3. 确认 `/download/`、`/tools/`、`/privacy/`、`/licenses/` 可访问。

安装包回滚：

1. 不删除旧版安装包；
2. 下载授权云函数切回旧版 `INSTALLER_EXE_FILE_ID` / `INSTALLER_MSI_FILE_ID`；
3. 下载页版本号和 SHA256 同步回滚；
4. 不直接覆盖同名文件，避免用户校验混乱。

## 12. 上线前检查清单

1. `pnpm test` 通过；
2. `pnpm build:web` 通过；
3. `pnpm --filter web exec tsc --noEmit` 通过；
4. `apps/web/out` 生成成功；
5. `/download/` 页面展示 EXE / MSI 两个安装包；
6. `/download/` 页面展示最终 SHA256；
7. `/release/v1.0.0/installers/SHA256SUMS.txt` 可访问；
8. `/privacy/` 可访问；
9. `/licenses/` 可访问；
10. `/release/v1.0.0/docs/FFMPEG_LICENSE_NOTICE.md` 可访问；
11. 安装包上传到私有云存储；
12. CloudBase 云函数环境变量配置完成；
13. 下载口令接口可以分别返回 EXE / MSI 临时链接；
14. 下载授权接口不接收用户处理文件；
15. 在线版处理文件时没有上传请求；
16. 下载页移动端无横向溢出；
17. 没有云端转换 API；
18. 广告不遮挡下载和授权区域。

## 13. 服务器或 CloudBase 功能边界

允许：

- 官网；
- 静态网页；
- 下载页；
- 安装包下载；
- 下载授权；
- 隐私说明；
- 开源许可证说明。

禁止：

- 云端图片转换；
- 云端视频转换；
- 云端音频转换；
- 云端 Word / Excel / PDF 转换；
- 接收用户处理文件；
- 存储用户转换结果。

