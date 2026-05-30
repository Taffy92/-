# 第一轮发布前修复报告

生成时间：2026-05-23  
项目路径：`D:\万能格式转换器项目`  
修复分支：`fix/round-1-release-hardening`

## 1. 本轮目标

本轮只处理发布前 P0 / P1 风险，不重做 UI，不新增大功能。重点范围：

- 修复 Tauri 配置和源码中文乱码。
- 修复生产依赖安全告警。
- 补齐 FFmpeg WASM、PDF.js、Tauri、Next.js 等第三方 Notices。
- 加强本地处理和网络隐私测试。
- 确认网页静态构建、类型检查、桌面离线版打包可通过。

## 2. 已修复文件

### 桌面配置与中文元数据

- `apps/desktop/src-tauri/tauri.conf.json`

修复内容：

- 重新写入为 UTF-8 无 BOM JSON，避免 Tauri JSON 解析器报错。
- 修复并确认以下字段中文正常：
  - `productName`：`万能格式转换器`
  - `publisher`：`MR.谢`
  - `copyright`：`© 2026 MR.谢. All rights reserved.`
  - `shortDescription`：`多格式本地转换工具`
  - `longDescription`：中文说明正常。
  - `windows[0].title`：`万能格式转换器`
- 保留 `webviewInstallMode.type = offlineInstaller`，用于离线安装包内置 WebView2 安装组件。

说明：此前为解决 PowerShell 显示乱码曾写入 UTF-8 BOM，但 Tauri 构建时无法解析带 BOM 的 JSON，报错 `expected value at line 1 column 1`。本轮已改为 UTF-8 无 BOM，Tauri 打包通过。

### 源码中文乱码与用户可见文案

- `apps/web/src/components/tools/ToolsClient.tsx`
- `apps/web/src/lib/privacy/networkGuard.ts`
- `packages/media-core/src/index.ts`
- `packages/export-core/src/officeImages.ts`
- `packages/shared/src/constants.ts`
- `packages/shared/src/file.ts`
- `apps/web/src/tests/networkGuard.test.ts`
- `apps/web/src/tests/privacy.test.ts`
- `apps/web/src/tests/officeImages.test.ts`
- `apps/web/src/app/licenses/page.tsx`
- `scripts/generate-third-party-notices.mjs`

修复内容：

- 修复用户可见中文、错误提示、隐私提示和测试断言中的乱码。
- 修复开源许可证页面历史编码污染。
- 修复第三方 Notices 生成脚本中的乱码，并确保 Markdown、docs 和生成的 TypeScript 数据都输出正常中文。
- 对目标文件执行乱码模式扫描，未再发现常见 mojibake 字符。

## 3. 依赖安全告警处理结果

### Next.js

- 将 Web 应用的 Next.js 升级到 `15.5.18`。
- 同步升级 `eslint-config-next`。
- 静态导出已验证通过。
- 为 `robots.ts` 和 `sitemap.ts` 增加静态导出兼容配置，避免 Next 15 在 `output: "export"` 下阻塞构建。

### xlsx

- 移除运行时 `xlsx` 依赖。
- Excel 转图片链路改为 `ExcelJS`。
- 增加限制：
  - Excel 文件最大 30MB。
  - 最多 30 个 Sheet。
  - 单 Sheet 最多 5000 行。
  - 单 Sheet 最多 50000 个单元格。
- `.xls` 暂不直接解析，提示用户先用 Excel/WPS 另存为 `.xlsx`，降低旧格式解析风险。
- 支持 `.xlsx` 和 `.csv` 本地转图片。

### postcss / transitive alerts

- 在根 `package.json` 增加 pnpm overrides：
  - `postcss: 8.5.10`
  - `uuid: 11.1.1`

### 审计结果

执行命令：

```powershell
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' audit --prod
```

结果：

```text
No known vulnerabilities found
```

## 4. FFmpeg WASM 许可证处理结果

当前项目仍使用 `@ffmpeg/core@0.12.10`，包声明许可证为 `GPL-2.0-or-later`。

本轮没有删除音视频功能，没有替换 FFmpeg 实现，只补齐发布前必须有的许可证和 Notices 说明：

- 生成 `THIRD_PARTY_NOTICES.md`。
- 同步生成 `docs/third-party-notices.md`。
- 同步生成 `docs/licenses.md`。
- 同步生成 `apps/web/src/generated/thirdPartyNotices.ts`，供 `/licenses` 页面展示。
- Notices 中明确记录：
  - `@ffmpeg/core` 许可证为 `GPL-2.0-or-later`。
  - 打包产物包含 `apps/web/out/ffmpeg` 下的 FFmpeg WASM 静态资源。
  - 正式发布时如继续使用该默认构建，需要按 GPL 要求提供源代码获取方式、许可证文本和版权声明。
  - 可选替代方案包括 LGPL FFmpeg 构建、用户本机 sidecar FFmpeg，或保留现状并补齐 GPL 义务。

最新安装包哈希已写入 Notices：

- `apps/desktop/src-tauri/target/release/bundle/nsis/万能格式转换器_1.0.0_x64-setup.exe`
  - SHA256：`31EEB3E504936A5E79260A2DFA3BE6AB557FA24455F71B9BAEB2ECF58AC7FF58`
- `apps/desktop/src-tauri/target/release/bundle/msi/万能格式转换器_1.0.0_x64_zh-CN.msi`
  - SHA256：`8B3853F1B51F665DA3735AD52CD30B664AB14565CCB99EF6CA2381BD54967E34`

## 5. 本地处理与隐私网络修复

### networkGuard 增强

- `apps/web/src/lib/privacy/networkGuard.ts`

增强内容：

- 开发环境拦截向非本站资源发送用户 `File`、`Blob`、`ArrayBuffer`、TypedArray、包含文件的 `FormData`。
- 扩展对 Request-like 对象的检测。
- 对可疑外部 `XMLHttpRequest` 上传进行拦截。
- CloudBase 下载授权口令请求保持允许，因为该请求只发送口令 JSON，不接触用户处理文件。
- 广告请求和文件处理逻辑保持隔离。

### 隐私测试覆盖

- `apps/web/src/tests/networkGuard.test.ts`
- `apps/web/src/tests/privacy.test.ts`
- `apps/web/src/e2e/privacy-network.spec.ts`

已覆盖：

- 图片处理不得上传用户文件。
- PDF 处理不得上传用户文件。
- Word / Excel 处理不得上传用户文件。
- 音频 / 视频处理不得上传用户文件。
- OCR 文本、解析文本、转换结果不得上传服务器。
- 广告脚本不得接触用户 File / Blob。
- CloudBase 下载云函数不得接触用户处理文件。
- networkGuard 能拦截开发环境外部上传。

浏览器网络测试命令：

```powershell
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' --filter web check:network:browser
```

结果：

```text
1 passed
```

备注：Playwright 启动 dev server 时出现 Windows Watchpack 非阻塞警告：

```text
Watchpack Error (initial scan): Error: EINVAL: invalid argument, lstat 'D:\System Volume Information'
```

该警告没有导致测试失败。后续可通过限制 dev server watcher 工作目录或忽略系统卷目录继续清理。

## 6. 构建与测试结果

### 单元测试

命令：

```powershell
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' test
```

结果：

```text
4 test files passed
18 tests passed
```

### Web 静态构建

命令：

```powershell
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' build:web
```

结果：

```text
Next.js 15.5.18
Compiled successfully
Static export completed
```

构建产物：

- `apps/web/out`

### TypeScript 检查

命令：

```powershell
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' --filter web exec tsc --noEmit
```

结果：通过，无类型错误。

### 生产依赖审计

命令：

```powershell
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' audit --prod
```

结果：

```text
No known vulnerabilities found
```

### 桌面离线版打包

命令：

```powershell
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' package:desktop
```

结果：通过。

输出文件：

- `D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\nsis\万能格式转换器_1.0.0_x64-setup.exe`
  - 大小：约 207.37 MB
- `D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\msi\万能格式转换器_1.0.0_x64_zh-CN.msi`
  - 大小：约 205.85 MB

安装包元数据检查：

- `ProductName`：`万能格式转换器`
- `FileDescription`：`万能格式转换器`
- `LegalCopyright`：`© 2026 MR.谢. All rights reserved.`
- `ProductVersion`：`1.0.0`
- `FileVersion`：`1.0.0`

说明：本轮已完成打包和文件元数据检查。为避免修改当前电脑系统安装状态，没有在本机执行真实安装流程。正式发布前仍建议把 EXE 复制到一台干净的无网络 Windows 10/11 x64 测试机，执行完整安装、启动、卸载和系统应用列表显示验证。

## 7. 仍需下一轮处理的问题

1. FFmpeg GPL 发布策略仍需最终决策：
   - 继续使用当前 `@ffmpeg/core`，则需要按 GPL 补齐源代码提供方式；
   - 或替换为 LGPL 构建 / sidecar FFmpeg。
2. 需要在无网络干净 Windows 测试机上人工验证：
   - EXE 是否能完全离线安装；
   - MSI 是否能完全离线安装；
   - 首次启动是否无需联网；
   - 图片、PDF、Word、Excel、视频、音频功能是否在断网环境完整可用；
   - 控制面板 / 系统应用列表中文名称是否正常。
3. Playwright dev server 的 Watchpack 系统目录扫描警告可以下一轮优化。
4. 许可证页面已经接入生成数据，但如果发布前再次重新打包，需要重新执行：

```powershell
pnpm generate:notices
pnpm build:web
```

5. 本轮没有重做 UI，也没有新增功能。UI 专业化、离线专业版批处理体验、音视频能力增强等应按后续计划进入第二轮。

## 8. 本轮结论

第一轮 P0 / P1 发布风险已完成主要修复：

- Tauri 中文配置和窗口标题已修复。
- 源码、隐私提示、许可证页面和 Notices 中文乱码已修复。
- `pnpm audit --prod` 已清零。
- `xlsx` 已从运行时 Excel 转换链路移除，改用 ExcelJS 并增加限制。
- FFmpeg WASM GPL 风险已在 Notices 中明确披露。
- 隐私网络测试已扩展并通过。
- Web 静态构建通过。
- TypeScript 检查通过。
- 桌面离线版 EXE / MSI 已重新生成。

