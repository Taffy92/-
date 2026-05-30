# 代码实现与 Playwright 验证报告

生成时间：2026-05-30

## 一、本轮目标

按照已确认的方向进入代码实现，并完成在线版、离线版的可用性验证：

- 在线版与离线版统一为简洁、稳定、低干扰的专业办公风格。
- 图片工具、文档工具、音视频工具改为折叠分组，初始不暴露全部子功能。
- 保留现有功能逻辑、隐私和本地处理原则，不新增登录、注册、会员、API 等无关功能。
- 在线版保留广告位，离线版不渲染广告容器。
- 增强预览区、任务操作区、下载结果入口和离线批量队列的可操作性。

## 二、代码改动范围

### 1. 在线版/离线版工具页

文件：

- `apps/web/src/components/tools/ToolsClient.tsx`

主要改动：

- 新增在线版折叠式工具导航分组：
  - 图片工具：图片裁切、添加水印、图片压缩、尺寸调整
  - 文档工具：PDF 转图片、Word 转图片、Excel 转图片
  - 音视频工具：视频格式转换、视频提取音频、音频格式转换
  - 离线与批量：批量处理、下载离线版
- 在线版主工作区改为三栏办公布局：左侧分类导航、中间上传与预览、右侧参数与任务信息。
- 将开始/停止任务区域放入主流程附近，减少用户从上传区到操作按钮之间的移动成本。
- 统一在线版与离线版预览组件，图片、PDF、Word、Excel、音视频均保留本地预览入口或对应占位说明。
- 修复离线裁剪场景中预览图未绑定裁剪引用的问题，避免裁剪功能找不到可操作图片节点。
- 离线版顶部操作栏保留添加文件、添加文件夹、输出目录、开始处理、停止处理、清空队列、打开输出、导出日志等高频入口。

### 2. 全局视觉样式

文件：

- `apps/web/src/app/globals.css`

主要改动：

- 将当前工作台范围切换为浅色办公风格。
- 使用 `office-workbench` 作用域覆盖原深色科技风组件，避免影响必要的页面结构。
- 优化按钮、输入框、面板、任务卡片、边框、阴影和文本对比度。

### 3. Playwright 配置与用例

文件：

- `apps/web/playwright.config.ts`
- `apps/web/src/e2e/ui-round-2.spec.ts`

主要改动：

- 修复 Playwright 配置在 ESM 下使用 `__dirname` 导致的运行错误。
- 增加本地地址 `NO_PROXY/no_proxy`，避免系统代理导致 Playwright 探测本地静态服务返回 502。
- 更新工具页响应式验证用例，适配折叠分组导航。
- 增加文档类文件上传后本地预览验证。
- 明确在线版广告容器和离线版无广告容器的断言边界。

## 三、验证结果

### 1. 单元测试

命令：

```powershell
npm test
```

结果：

- 11 个测试文件通过
- 51 个测试通过

### 2. 在线版构建

命令：

```powershell
npm run prepare:static
.\node_modules\.bin\next.CMD build
```

结果：

- Next.js 静态构建通过
- `apps/web/out` 已恢复为在线版产物，可作为后续线上发布输入

### 3. 在线版 Playwright 验证

命令：

```powershell
.\node_modules\.bin\playwright.CMD test --reporter=line
```

结果：

- 6 个 Playwright 用例通过
- 覆盖隐私网络边界、移动端、平板、桌面端、下载页说明、PDF/Word/Excel 上传预览

截图证据：

- `D:\万能格式转换器项目\verification\ui-round-2-tools-mobile-375.png`
- `D:\万能格式转换器项目\verification\ui-round-2-tools-tablet-768.png`
- `D:\万能格式转换器项目\verification\ui-round-2-tools-desktop-1440.png`

### 4. 离线版构建与 Playwright 视觉验证

命令：

```powershell
npm run build:desktop
```

随后使用本地静态服务和 Playwright 验证：

- 离线专业版标识可见
- 开始处理、停止处理、输出目录、预览区、任务队列可见
- 不渲染 `#ad-container`
- 1440px 和 1024px 视口均无横向溢出

截图证据：

- `D:\万能格式转换器项目\verification\offline-desktop-1440.png`
- `D:\万能格式转换器项目\verification\offline-compact-1024.png`

## 四、当前已知注意项

1. 当前环境 `pnpm` 不在 PATH 中，`npm run build` 的 `prebuild` 会因为内部调用 `pnpm prepare:static` 失败。本轮使用等价命令 `npm run prepare:static` 加本地 `next.CMD build` 完成在线构建。正式 CI/发布机建议恢复 `pnpm` 或调整脚本。
2. Playwright 运行时出现 Node `DEP0205` 警告，来源于当前 Node/Playwright 组合的弃用提示，不影响本轮用例结果。
3. 工作区仍存在大量历史修改和未跟踪文件，包括 `.pnpm-store/`、历史报告、截图和发布资料。正式提交或部署前仍需单独做提交范围审查，避免把无关文件纳入发布包或版本提交。
4. 本轮没有执行 CloudBase 正式部署，只完成代码实现、构建和 Playwright 验证。后续部署前应再次确认 `apps/web/out` 为在线版产物。

## 五、结论

本轮代码实现和验证已完成。在线版与离线版核心界面均已切换为更适合国企、办公、政府内网使用场景的浅色专业工作台风格；工具分类改为折叠入口；预览区、任务操作区、下载/输出入口均已调整并通过测试验证。

当前状态满足进入部署前最终审查条件，但正式发布前仍建议先处理提交范围和 `pnpm` 环境一致性问题。
