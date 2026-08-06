# 万能格式转换器

万能格式转换器是一套“网站在线版 + Windows 离线安装版”的免费格式转换工具。项目采用 monorepo 结构，在线版使用 Next.js 静态导出，离线版使用 Tauri 打包，核心目标是让常见图片、PDF、Word、Excel、音频和视频处理尽量在本机完成。

开发者：MR.谢  
联系邮箱：370298218@qq.com  
版权信息：© 2026 MR.谢. All rights reserved.

## 功能范围

在线版和离线版共用以下核心处理能力：

- 图片裁切
- 图片尺寸调整
- 图片添加水印
- 图片压缩
- PDF 转图片，支持逐页导出和合成一页导出
- Word 转图片，支持逐页导出和合成一页导出
- Excel 转图片，支持逐页导出和合成一页导出
- 视频格式转换：MP4、MOV、AVI、MKV、WebM
- 音频格式转换：MP3、WAV、AAC、M4A、FLAC
- 视频提取音频：MP3、WAV、M4A、AAC

在线版面向大众用户的轻量单文件处理；离线专业版面向批量处理、敏感文件和断网办公场景。离线专业版使用白色桌面工作台，文件选择区和预览区合并；选择多个文件时，图片直接显示缩略图，PDF、Word、Excel 显示第一页缩略图，视频显示首帧容器。批量导入跟随当前选中的转换工具，不再作为单独功能页展示。图片尺寸调整、加水印、压缩，PDF/Word/Excel 转图片，音视频转换和视频提取音频均可加入批量队列；图片裁切仍按单张图片精确裁切框处理。桌面批量结果保存到独立时间戳文件夹，多页 PDF/Word/Excel 保存到同名子文件夹，不使用 ZIP 或 7Z 汇总。涉及大量文件、敏感材料或批量音视频任务时，应优先使用 Windows 离线专业版。

本项目不包含 PDF 编辑功能，不提供 PDF 文字修改、PDF 涂销、PDF 签名盖章、PDF 批注标注，也不适合用于修改合同、发票、证件、财务票据等文件内容。

## 隐私保护

核心原则：用户图片、PDF、Word、Excel、音频、视频和转换结果不上传服务器，不调用云端转换 API，不调用云端图片、音频或视频处理 API。广告脚本与文件处理逻辑隔离，不接触用户文件、Canvas、Blob 或转换结果。

在线版会加载站点自身 JS/CSS、PDF.js worker、FFmpeg WASM、本地静态资源和可选广告脚本。敏感文件、大文件和断网场景建议使用离线安装版。

## 项目结构

```text
DocToolPlatform/
├── apps/
│   ├── web/        # Next.js 在线版
│   └── desktop/    # Tauri 离线安装版
├── packages/
│   ├── ui/
│   ├── image-core/
│   ├── pdf-core/
│   ├── media-core/
│   ├── export-core/
│   └── shared/
├── docs/
├── release/        # 发布说明、校验清单与本地安装包归档
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## 本地开发

运行时版本：发布和打包环境固定为 Node.js 20 LTS 与 pnpm 9.15.4。根目录 `.nvmrc`、`package.json` 的 `engines` 和 `packageManager` 是准绳。

Windows 工作区优先运行 npm 脚本，脚本会调用本地 `.pnpm-home\pnpm.CMD`。

安装依赖：

```bash
.\.pnpm-home\pnpm.CMD install
```

启动在线版：

```bash
npm run dev:web
```

普通在线构建：

```bash
npm run build:web
```

EdgeOne 正式构建：

```bash
npm run build:edgeone
```

两种构建结果都位于 `apps/web/out`。正式域名必须使用 `build:edgeone`，它会同时生成 FFmpeg WASM 分片、安装包分片和下载清单；普通 `build:web` 不包含试用安装包分片。

## 环境变量

`.env.example` 中主要保留：

```bash
NEXT_PUBLIC_SITE_URL=https://gszhmrx.cn
```

当前正式域名为 `https://gszhmrx.cn`，`https://www.gszhmrx.cn` 绑定到同一 EdgeOne Pages 项目。所有 canonical、sitemap、Open Graph URL 都从 `apps/web/src/config/site.ts` 的 `siteConfig.url` 读取，构建前确认 `NEXT_PUBLIC_SITE_URL=https://gszhmrx.cn`。

离线安装包按 3 天试用模式直接下载。下载页固定读取 EdgeOne 同源清单 `/release/v2.0.0/edgeone-v24/manifest.json`，不再依赖可变的外部安装包 URL 环境变量。

授权后台四项秘密值只配置在 EdgeOne 服务端环境变量中，不写入 `.env`、在线前端或 Git。使用 `tools/admin-license-generator/setup-edgeone-admin.ps1` 在本地安全生成。

## 广告配置

广告配置在 `apps/web/src/config/ads.ts`。

- `provider: "placeholder"`：显示本地广告位占位
- `provider: "baidu"`：启用百度广告
- `provider: "none"`：关闭广告

开发环境默认建议使用 placeholder，不真实请求广告脚本。离线版不渲染在线广告容器，也不强制联网加载广告。

## EdgeOne 正式部署

```bash
npm run build:edgeone
npm run deploy:edgeone
```

EdgeOne 唯一正式项目名为 `format-converter-web-upload`，通过本地构建产物直接上传，不使用 GitHub Provider。正式构建会从被 Git 忽略的 `release/v2.0.0/installers/` 读取 ZIP，先核对 ZIP 整包 SHA256 和内部 MSI，再生成不超过 24 MiB 的分片。浏览器从两个自有域名并行下载、逐片校验并在本地拼装，避免国内用户被跳转到 GitHub；ZIP 内只保留 MSI 安装包。分片目录使用 `edgeone-v24`，避免长期缓存命中旧分片。

正式构建还会纳入 EdgeOne 授权函数，并检查私钥、客户记录和 `.mrx` 没有进入发布产物。具体检查地址与故障处理见 `docs/operator-runbook.md`。

## 备用托管

仓库仍保留 `deploy:vercel` 和 `deploy:cloudbase` 作为应急静态托管命令，但它们不是当前正式发布通道，也不会自动生成 EdgeOne 下载分片。CloudBase 环境 `format-converter-prod-x-d71bce41` 已隔离，只保留历史授权实现和备用下载口令云函数。

`apps/web/cloudbaserc.json` 使用 `apps/web/out` 作为静态托管目录。当前仓库已配置 CloudBase 环境 `format-converter-prod-x-d71bce41`。如果部署到其他环境，再同步修改根目录 `package.json` 的 `deploy:cloudbase` 脚本和 `apps/web/cloudbaserc.json` 的 `envId`。

当前正式访问地址为 `https://gszhmrx.cn/` 和 `https://www.gszhmrx.cn/`。页脚备案号来自 `apps/web/src/config/site.ts` 的 `siteConfig.icp.text`，当前为 `鲁ICP备2026028326号`。

EdgeOne 构建、函数地域和响应头配置位于根目录 `edgeone.json`。Vercel 备用配置由 `apps/web/src/config/securityHeaders.js` 生成，修改后执行 `npm run sync:security` 同步到 `apps/web/vercel.json`。

## 离线版试用下载

离线专业版采用“直接下载 3 天试用，试用结束后激活”的模式。下载入口不再要求统一下载口令，授权控制发生在桌面端启动和试用到期之后。

当前 ZIP 由 EdgeOne 同源分片分发。原始安装包只保存在本地发布归档，构建产物和安装包都不会提交到 Git。旧的 `cloudbase/functions/createDownloadUrl` 口令云函数作为备用内部分发方案保留，但不是公开下载页主流程。

## 私有授权后台

私有授权后台位于 `https://gszhmrx.cn/admin/license/`。管理员可在手机或电脑登录，粘贴用户机器码并选择期限，随后复制激活码、展示二维码或下载 `license.mrx`；历史记录支持搜索、续期和重新下载。桌面端始终使用本地公钥验签，用户电脑有网或无网都可以授权。

部署命令：

```bash
npm run deploy:license-admin
```

首次部署前，在管理员电脑运行：

```powershell
powershell -ExecutionPolicy Bypass -File tools\admin-license-generator\setup-edgeone-admin.ps1
```

把生成的四项值安全设置到 EdgeOne 生产环境变量后再部署。密码允许 6 位纯数字，程序不做复杂度限制或连续错误锁定；不要公开后台地址和密码。记录加密密钥丢失后历史记录无法恢复。管理员本地生码器继续作为完全离线的备用方案。

## 离线安装版

离线版位于 `apps/desktop`，使用 Tauri。打包前需要 Rust、Cargo、Tauri CLI、Windows WebView2 离线安装器支持。

打包命令：

```bash
npm run package:desktop
```

安装包输出目录：

```text
apps/desktop/src-tauri/target/release/bundle/
```

离线版使用 Tauri `webviewInstallMode.type = "offlineInstaller"`，目标是满足“安装和使用都完全离线”。安装包会内置网站构建产物、PDF.js worker、FFmpeg WASM、图标和本地音视频转换逻辑。核心功能不依赖服务器，不需要账号，不上传文件。

离线版启动后直接进入白色桌面工作台：顶部选择当前工具、转换参数、清空任务、输出目录和下载结果，中部把文件选择与预览合并为同一区域，大号橙色选择文件按钮支持单选和多选，右侧显示本地内核、任务进度和输出状态。多个文件会在主区域平铺缩略图；底部只显示“本地运行，保护隐私安全”和开发者信息。在线站点头尾导航和广告容器不进入离线工作台。

桌面批量任务每次创建独立结果文件夹，图片压缩等多文件结果直接写入该文件夹；PDF、Word、Excel 逐页导出时在其中创建同名子文件夹。离线版不会再为这些结果生成 ZIP 或 7Z。

离线专业版包含本地 3 天试用和机器码绑定授权。试用结束后继续使用需要管理员签发的激活码或 `license.mrx`，授权细节见 `docs/offline-license.md`。该机制不引入登录、会员或云端转换，也不上传用户文件。

离线安装包在构建阶段可能需要联网下载或缓存 WebView2 离线安装器；正式发布给用户的 ZIP 内 MSI 应包含该离线安装器。发布前建议在一台断网 Windows 10/11 x64 电脑或虚拟机中做安装和核心功能回归测试。

## 修改站点信息

- 网站名称、开发者、邮箱：`apps/web/src/config/site.ts`
- 离线版名称和安装包描述：`apps/desktop/src-tauri/tauri.conf.json`
- 离线安装包下载信息：`apps/web/src/config/downloads.ts`
- 图标：`apps/web/public/icons/` 和 `apps/desktop/src-tauri/icons/`

## 验证文件没有上传

在线版可按 F12 打开浏览器开发者工具，进入 Network 面板，上传图片、PDF、Word、Excel、音频或视频并执行处理。正常情况下，不应出现把原始文件或转换结果上传到第三方接口的请求。

项目内置隐私检查：

```bash
npm run check:privacy
npm run check:network
```

`networkGuard` 会在开发环境拦截疑似向非本站资源上传 `File`、`Blob`、`ArrayBuffer` 或 `FormData` 的请求。

## 能力边界

PDF 转图片：支持逐页导出和合成一页导出。超大 PDF 建议分批选择页码处理。

Word 转图片：支持标准 `.docx` 文档。旧版 `.doc` 请先另存为 `.docx`。复杂浮动对象、艺术字和特殊排版需要人工检查。

Excel 转图片：支持 `.xlsx`、`.csv`。旧版 `.xls` 请先用 Excel/WPS 另存为 `.xlsx` 后再转换。很宽或很长的表格会生成较大的图片，重要数字和日期请人工核对。

音视频转换：依赖浏览器或离线版内置 WebView 的本地解码与编码能力，不同环境支持的输出格式不同。长视频通常需要按播放时长等待。

## 发布新版本

1. 确认 `node -v` 为 `v20.x`，`.\.pnpm-home\pnpm.CMD --version` 为 `9.15.4`。
2. 更新 `apps/web/src/config/downloads.ts` 的版本号、文件名、大小、日期和 SHA256。
3. 更新 `apps/web/src/app/changelog/page.tsx`。
4. 运行 `npm test`。
5. 运行 `npm run build:web`。
6. 商业发布前确认离线授权生产公钥已替换，管理员私钥和授权记录没有进入客户包。
7. 运行 `npm run package:desktop`。
8. 生成只含 MSI 的新 ZIP，同步到 `release/<version>/installers/`，更新 ZIP SHA256，并同步下载配置和 EdgeOne 构建脚本中的版本、文件名与校验值。
9. 运行本地秘密配置工具，确认 EdgeOne 后台私钥对应桌面端 `PUBLIC_KEY_RAW_B64`，并安全备份记录加密密钥。
10. 运行 `npm run build:edgeone` 和 `npm run deploy:edgeone`，完成国内站点、同源下载与私有授权后台验证。

## 第三方依赖许可证

第三方依赖包括 Next.js、React、TypeScript、Tailwind CSS、PDF.js、docx-preview、html2canvas、ExcelJS、browser-image-compression、Cropper.js、JSZip、@ffmpeg/ffmpeg、@ffmpeg/core、@ffmpeg/util、Tauri、lucide-react 等。上线前请根据锁文件复核许可证清单，页面 `/licenses` 已提供基础说明。

正式发布时，网站和离线软件内都必须保留“开源许可证”页面。大多数依赖允许商业使用，但需要保留各自的版权声明、许可证文本和必要的 NOTICE 信息。`@ffmpeg/core` 当前许可证为 `GPL-2.0-or-later`，商业分发时必须额外遵守 GPL 对源代码、许可证和版权声明的要求。当前离线版使用 Tauri，未引入 Electron；如以后切换到 Electron，也需要补充 Electron 及其依赖的许可证说明。
