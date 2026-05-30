# 隐私与安全审查报告

审查日期：2026-05-22  
审查目标：确认用户文件本地处理，识别上传、泄露、远程 API、依赖和发布安全风险。

## 1. 当前隐私设计

项目整体设计方向正确：

- 图片、PDF、Office、音视频处理核心在浏览器或 Tauri WebView 内执行。
- `networkGuard.ts` 在开发环境拦截向非本站资源上传 `File`、`Blob`、`ArrayBuffer`、`FormData`。
- CloudBase 云函数只用于离线安装包授权下载，不应接触用户处理文件。
- 广告组件和文件处理逻辑分离。

已验证测试：

- `src/tests/privacy.test.ts` 通过。
- `src/tests/networkGuard.test.ts` 通过。
- 测试覆盖了外部上传拦截和 PDF 编辑入口禁用等规则。

## 2. 发现的问题

### P0：依赖安全告警

`pnpm audit --prod` 发现：

- `next@14.2.35` 存在多条 Next.js 公开安全告警。
- `xlsx@0.18.5` 存在 Prototype Pollution 与 ReDoS 告警。
- `postcss` 通过 Next 依赖链出现中危告警。

建议：

- 评估升级到 Next 15.5.16 或当时可用的安全版本。
- 评估替换 SheetJS 社区版，或将 Excel 解析隔离到 Worker，并增加文件大小、工作表数量、单元格数量限制。
- 发布前重新执行 `pnpm audit --prod`。

### P0：FFmpeg WASM 许可证与发布合规

项目使用 `@ffmpeg/core`。如果正式发布包含 FFmpeg WASM 静态资源或离线安装包内置该资源，必须确认许可证义务。若包含 GPL 组件，需要按 GPL 要求提供相应源码获取方式、许可证文本和版权声明。

建议：

- 在开源许可证页面和安装包内 Notices 明确列出 FFmpeg 相关许可证。
- 如果不希望触发 GPL 分发义务，评估改用 LGPL 构建或桌面端系统/自带 sidecar 的合规版本。

### P1：开发环境网络保护存在中文乱码

`apps/web/src/lib/privacy/networkGuard.ts` 的逻辑有效，但提示文案出现乱码。功能不一定受影响，但会影响调试、发布质量和合规可信度。

建议：统一 UTF-8 重写隐私日志文案。

### P1：统一下载口令模式简单但风控弱

统一口令便于操作，但泄露后所有人都能下载，无法按用户撤销。

建议下一阶段增加：

- 口令轮换机制。
- 下载日志查看。
- 单 IP 频率限制。
- 临时下载链接有效期保持较短。
- 发布时不要在 README 或截图中公开真实口令。

## 3. 网络边界

允许的网络请求：

- 网站自身 JS/CSS/字体/图标。
- PDF.js worker、FFmpeg WASM、静态资源。
- 广告脚本。
- 下载页向 CloudBase 授权下载云函数提交口令。

禁止的网络请求：

- 上传图片、PDF、Word、Excel、音频、视频原始文件。
- 上传转换结果。
- 上传 OCR/解析文本或文件内容。
- 调用第三方图片、PDF、OCR、音视频转换 API。

## 4. 发布前安全清单

- 修复 `pnpm audit --prod` 高危告警。
- 修复 Tauri 配置乱码。
- 确认 `apps/web/out` 中不包含真实密钥。
- 确认下载口令只存放在 CloudBase 云函数环境变量。
- 保留并扩展 networkGuard 测试。
- 用浏览器 Network 面板验证处理文件时没有用户文件上传请求。
- 对 CloudBase 云函数增加频率限制或日志审计。
- 对安装包进行 SHA256 校验并在下载页展示。
- 正式发布前进行代码签名，降低 Windows 安装拦截概率。

