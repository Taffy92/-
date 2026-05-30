# BUG 与质量问题报告

审查日期：2026-05-22  
本报告记录当前审查中发现的问题、已验证状态和建议修复顺序。本次未直接修改业务代码。

## 1. 已验证通过

执行结果：

- `pnpm test`：通过。
- `pnpm build:web`：通过。
- `pnpm --filter web exec tsc --noEmit`：通过。

说明：当前代码能通过单元测试、类型检查和在线版静态构建。

## 2. 高优先级问题

### P0：Tauri 发布配置中文乱码

文件：`D:\万能格式转换器项目\apps\desktop\src-tauri\tauri.conf.json`

现象：

- `productName`
- `publisher`
- `copyright`
- `shortDescription`
- `longDescription`
- `windows.title`

这些字段出现乱码。安装包文件名虽然是中文，但安装界面、窗口标题、系统应用列表可能显示异常。

建议：用 UTF-8 重写 Tauri 配置中文字段，重新执行 `package:desktop` 并安装验证。

### P0：依赖安全告警

`pnpm audit --prod` 发现 17 个漏洞告警。重点是：

- `next@14.2.35`
- `xlsx@0.18.5`

建议：先做依赖升级评估，不要盲目升级；Next 14 到 15 可能影响静态导出和构建行为，必须先建分支测试。

### P1：多个源码文件存在中文乱码

已确认乱码出现在：

- `apps/web/src/components/tools/ToolsClient.tsx`
- `apps/web/src/lib/privacy/networkGuard.ts`
- `packages/media-core/src/index.ts`
- `packages/export-core/src/officeImages.ts`
- `apps/desktop/src-tauri/tauri.conf.json`

影响：

- UI 文案不专业。
- 错误提示不清楚。
- 用户体验下降。
- 安装包发布元数据异常。

建议：优先修复用户可见文案和错误提示，再修复内部日志。

### P1：Word/Excel 转图片不是高保真实现

文件：

- `packages/export-core/src/officeImages.ts`

现状：

- Word：解析 `.docx` XML 文本和表格后用 Canvas 重绘。
- Excel：SheetJS 读取单元格后用 Canvas 重绘。

问题：

- 复杂样式、图片、图表、合并单元格、页眉页脚、分页、字体可能不一致。
- 不适合宣传为“完全保持原格式”。

建议：在线版标注为轻量转换；离线专业版引入本地 Office/LibreOffice 渲染链路。

## 3. 中优先级问题

- 音视频转换没有看到完整浏览器端大文件压力测试记录。
- 批量处理存在入口，但还需要结果表格、失败重试、任务日志、输出目录管理。
- 下载授权云函数是统一口令模式，便捷但无法单用户撤销。
- 广告位需要继续确认只在页面底部 `id="ad-container"` 内，不遮挡工具操作。

## 4. 建议修复顺序

1. 修复乱码，尤其是 Tauri 配置和用户可见错误提示。
2. 处理依赖安全告警，重点评估 Next 和 xlsx。
3. 补充音视频和 Office 转图片的真实样本测试。
4. 完善离线专业版批量任务工作台。
5. 增加发布前检查脚本：构建、测试、依赖审计、隐私网络检查、安装包校验。

