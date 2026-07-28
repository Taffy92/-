# UI v2.0.0 技术设计

## 1. 实施原则

- 保留现有处理核心和 React 状态，只替换页面外壳、布局和视觉系统。
- 在线与离线共享品牌、联系方式、二维码和基础状态色，但使用独立页面壳。
- 不把设计师 HTML 的内联脚本直接复制到正式项目。
- 不引入新的远程字体、图标 CDN、支付 SDK 或广告提供商。

## 2. 模块边界

### 在线版

- `app/page.tsx`：深色首页、真实功能图谱、本地处理说明和首页百度广告。
- `components/layout/Header.tsx`：桌面导航、移动菜单和赞赏入口。
- `components/layout/Footer.tsx`：合规入口、作者邮箱、联系方式入口。
- `components/tools/ToolsClient.tsx`：基础工具工作台，保留真实文件处理函数。
- `components/tools/LocalToolsClient.tsx`：增强工具工作台，保留真实文件处理函数。
- `app/tutorials/page.tsx`：教程正文及教程末尾百度广告。
- `app/contact/page.tsx`、`app/about/page.tsx`：作者微信和邮箱。

### 离线版

- `ToolsClient` 的 `surface="desktop"` 分支作为 Fluent 工作台。
- `LocalToolsClient` 的桌面分支复用同一套浅色令牌。
- `LicenseGate.tsx` 改为浅色离线授权面板。
- 新增本地“关于与支持/赞赏”组件，不依赖在线请求。
- Tauri 的文件选择、输出目录、授权和 Sidecar 调用保持原接口。

### 共享

- `config/site.ts` 统一保存公开微信和邮箱。
- `components/support/SupportDialog.tsx` 负责赞赏与联系方式展示。
- `public/donate/*` 保存无损二维码。
- `config/ads.ts` 和 `packages/ui` 只保留百度与无广告模式。

## 3. 视觉令牌

### 在线

- 背景：`#07080A`
- 面板：`#12141A`
- 抬升面板：`#171B23`
- 主强调：`#38BDF8`
- 次强调：`#22D3EE`
- 成功：`#34D399`
- 错误：`#F87171`

### 离线

- 应用背景：`#F3F3F3`
- 面板：`#FFFFFF`
- 侧栏：`#EAEAEA`
- 边框：`#D1D1D1`
- 主强调：`#0067B8`
- 成功：`#107C41`
- 错误：`#C42B1C`

CSS 通过 Web 与 Desktop 根类隔离，避免构建模式互相污染。

## 4. 状态模型

继续使用现有 `idle/running/done/error/cancelled` 和批量任务状态，不创建第二套模拟状态。UI 根据真实状态渲染：

- idle 且无文件：空状态
- idle 且有文件：已载入
- running：处理中
- done：完成
- error：错误
- cancelled：已取消

## 5. 广告设计

- `AdProvider` 收敛为 `baidu | placeholder | none`。
- 仅保留 `homeMiddle` 与 `tutorialBottom`。
- 开发环境允许显示明确标注的原型占位；正式环境未配置槽位时返回 `null`。
- Desktop 模式始终返回 `null`。
- CSP 仅加入百度实际需要的域名，不保留 Google/DoubleClick。

## 6. 联系与赞赏

- 微信：`___Skyblue`
- 邮箱：`370298218@qq.com`
- 在线完整联系方式放在 `/contact`；页脚展示邮箱和联系入口。
- 离线完整联系方式放在“关于与支持”和授权界面。
- SupportDialog 使用本地 PNG、焦点管理、Esc 和遮罩关闭。

## 7. 测试策略

- 单元测试：广告提供商、联系配置、版本号、Desktop 无广告、隐私边界。
- 构建测试：Web 静态构建、EdgeOne 构建、Desktop 构建与安装包。
- 浏览器测试：首页、工具页、增强工具、教程、联系、赞赏、移动菜单。
- 网络测试：在线只允许必要站点资源和百度白名单；离线零广告请求。
- 功能回归：图片、PDF、Office、音视频、OCR 和批量任务沿用现有测试。

## 8. 风险与处理

- 当前工作区已有未提交功能扩展：所有修改按现有文件继续追加，不回滚、不覆盖无关变化。
- 设计稿功能入口少于真实功能：保留完整工具清单，视觉上使用分组和折叠解决密度。
- 设计稿包含不实硬件信息：改为实时可验证状态或删除。
- 设计稿移动端失效：使用现有 React 移动菜单和专门断点重构。
- 新 v2.0.0 安装包尚未生成：先更新产品版本，下载页正式文件名和哈希在打包成功后由构建流程生成，不伪造哈希。

