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

在线版面向大众用户的轻量单文件处理；离线专业版面向批量处理、敏感文件和断网办公场景。离线专业版使用桌面工具箱布局，批量导入跟随当前选中的转换工具，不再作为单独功能页展示。图片尺寸调整、加水印、压缩，PDF/Word/Excel 转图片，音视频转换和视频提取音频均可加入批量队列；图片裁切仍按单张图片精确裁切框处理。涉及大量文件、敏感材料或批量音视频任务时，应优先使用 Windows 离线专业版。

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
├── public/
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## 本地开发

安装依赖：

```bash
.\.pnpm-home\pnpm.CMD install
```

启动在线版：

```bash
npm run dev:web
```

构建在线版：

```bash
npm run build:web
```

构建结果位于 `apps/web/out`，可直接用于 Vercel 或 CloudBase 静态托管。

## 环境变量

`.env.example` 中保留：

```bash
NEXT_PUBLIC_SITE_URL=https://gszhmrx.cn
NEXT_PUBLIC_DOWNLOAD_AUTH_ENABLED=false
NEXT_PUBLIC_DOWNLOAD_AUTH_ENDPOINT=
```

当前正式域名为 `https://gszhmrx.cn`，`https://www.gszhmrx.cn` 绑定到同一 CloudBase 静态托管站点。所有 canonical、sitemap、Open Graph URL 都从 `apps/web/src/config/site.ts` 的 `siteConfig.url` 读取，构建前确认 `NEXT_PUBLIC_SITE_URL=https://gszhmrx.cn`。

离线安装包默认不公开直链。正式启用授权下载时，把 `NEXT_PUBLIC_DOWNLOAD_AUTH_ENABLED` 改为 `true`，把 `NEXT_PUBLIC_DOWNLOAD_AUTH_ENDPOINT` 填成 CloudBase 授权云函数的 HTTP 地址。

## 广告配置

广告配置在 `apps/web/src/config/ads.ts`。

- `provider: "placeholder"`：显示本地广告位占位
- `provider: "google"`：启用 Google AdSense
- `provider: "baidu"`：启用百度广告
- `provider: "none"`：关闭广告

开发环境默认建议使用 placeholder，不真实请求广告脚本。离线版不渲染在线广告容器，也不强制联网加载广告。

## Vercel 部署

```bash
npm run build:web
npm run deploy:vercel
```

在 Vercel 环境变量中配置：

```bash
NEXT_PUBLIC_SITE_URL=https://gszhmrx.cn
```

## CloudBase 部署

```bash
npm run build:web
npm run deploy:cloudbase
```

`apps/web/cloudbaserc.json` 使用 `apps/web/out` 作为静态托管目录。当前仓库已配置 CloudBase 环境 `format-converter-prod-x-d71bce41`。如果部署到其他环境，再同步修改根目录 `package.json` 的 `deploy:cloudbase` 脚本和 `apps/web/cloudbaserc.json` 的 `envId`。

当前正式访问地址为 `https://gszhmrx.cn/` 和 `https://www.gszhmrx.cn/`。页脚备案号来自 `apps/web/src/config/site.ts` 的 `siteConfig.icp.text`，当前为 `鲁ICP备2026028326号`。

Vercel 安全响应头由 `apps/web/src/config/securityHeaders.js` 生成，修改后执行 `npm run sync:security` 同步到 `apps/web/vercel.json`。

## 离线版授权下载

静态网站托管不适合直接保护 EXE 安装包，所以不要把安装包上传到 `apps/web/out`。建议把安装包上传到 CloudBase 私有云存储，再用 `cloudbase/functions/createDownloadUrl` 云函数校验授权码并返回临时下载链接。

详细操作文档：`docs/authorized-download.md`。

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

离线版启动后直接进入专业工具箱：顶部命令栏、左侧分类工具、中央上传/任务队列、右侧参数面板。在线站点头尾导航和广告容器不进入离线工作台。

离线安装包在构建阶段可能需要联网下载或缓存 WebView2 离线安装器；正式发布给用户的 EXE/MSI 应包含该离线安装器。发布前建议在一台断网 Windows 10/11 x64 电脑或虚拟机中做安装和核心功能回归测试。

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

1. 更新 `apps/web/src/config/downloads.ts` 的版本号、文件名、大小、日期和 SHA256。
2. 更新 `apps/web/src/app/changelog/page.tsx`。
3. 运行 `npm test`。
4. 运行 `npm run build:web`。
5. 运行 `npm run package:desktop`。
6. 上传安装包到 CloudBase 私有云存储。
7. 更新授权记录里的 `fileID`、版本号和 SHA256。
8. 重新部署静态网站和授权云函数。

## 第三方依赖许可证

第三方依赖包括 Next.js、React、TypeScript、Tailwind CSS、PDF.js、SheetJS、browser-image-compression、Cropper.js、JSZip、@ffmpeg/ffmpeg、@ffmpeg/core、@ffmpeg/util、Tauri、lucide-react 等。上线前请根据锁文件复核许可证清单，页面 `/licenses` 已提供基础说明。

正式发布时，网站和离线软件内都必须保留“开源许可证”页面。大多数依赖允许商业使用，但需要保留各自的版权声明、许可证文本和必要的 NOTICE 信息。`@ffmpeg/core` 当前许可证为 `GPL-2.0-or-later`，商业分发时必须额外遵守 GPL 对源代码、许可证和版权声明的要求。当前离线版使用 Tauri，未引入 Electron；如以后切换到 Electron，也需要补充 Electron 及其依赖的许可证说明。
