# UI_STYLE_REFRESH_ROUND 视觉升级计划

## 0. 当前暂停状态

本计划基于用户最新上传的深色蓝黑科技风参考图重新整理。参考图只作为视觉语言参考，不作为新增功能依据。本轮在用户确认计划前暂停继续扩大代码实现。

当前已经开始过的改动范围仅限 UI / 显示层：

- `apps/web/src/app/globals.css`：全局深色背景、按钮、输入框、卡片基础样式。
- `apps/web/src/app/layout.tsx`：主题色和元信息中文显示修正。
- `apps/web/src/components/layout/Header.tsx`：顶部导航深色视觉。
- `apps/web/src/components/layout/Footer.tsx`：页脚深色视觉。
- `apps/web/src/components/tools/ToolsClient.tsx`：工具页与离线工作台部分 className 视觉调整。
- `UI_STYLE_REFRESH_PLAN.md`：本计划文件。

这些改动没有新增登录、注册、会员、API、云转换或新功能；没有修改广告组件逻辑；没有修改程序图标；没有修改 CloudBase 下载授权函数；没有修改 EXE / MSI 下载口令流程；没有修改 Tauri 权限、WebView2 配置、sidecar / WASM 范围或核心转换逻辑。

## 1. 参考图可采用的在线版视觉元素

参考图左侧“在线版”区域适合本项目在线版采用的元素：

1. 深蓝黑主背景，带克制的蓝青色高亮。
2. 顶部品牌区：保留当前图标和“万能格式转换器”产品名，不替换 logo。
3. 顶部能力标签：可以用作纯展示，例如“本地处理”“不上传服务器”“轻量转换”，但不新增不存在的功能。
4. 左侧或上方工具模块卡片：对应现有图片、PDF、Word、Excel、音频、视频工具。
5. 中央虚线上传区域：保留现有点击/拖拽添加文件逻辑，只升级视觉。
6. 右侧转换参数面板：保留现有参数，只升级卡片、边框、输入框视觉。
7. 转换状态和结果区：保留现有进度、错误、下载按钮，只增强状态层级。
8. 底部本地处理提示：保留“文件仅在本地处理，不上传服务器”等隐私表达。

在线版仍保持轻量单文件或少量文件处理，不进入离线专业版批量任务队列。

## 2. 参考图可采用的离线专业版视觉元素

参考图右侧“离线专业版”区域适合本项目离线专业版采用的元素：

1. 深色左侧导航栏。
2. 顶部操作工具栏。
3. 中间批量任务表格，使用细边框、状态标签和进度条。
4. 右侧参数面板，包含输出目录、转换设置、任务信息、日志入口。
5. 底部状态栏，展示离线可用、任务数量、成功/失败、当前输出目录。
6. 成功、失败、处理中、等待中、已取消等状态使用更清晰的颜色区分。
7. 任务历史和日志继续脱敏展示。

离线专业版功能边界保持不变：批量任务队列、输出目录、失败重试、取消、清空、打开输出目录、打开结果文件、导出日志和任务历史都只做视觉升级，不改逻辑。

## 3. 明确不能采用的参考图元素

以下元素不得采用：

1. 登录 / 注册。
2. 会员、VIP、开通会员、付费弹窗。
3. API 接口页面或 API 管理能力。
4. 账户、消息、社交、云同步。
5. 参考图中项目不存在的工具或后端管理能力。
6. 新增云端转换、云端上传、服务器处理文件。
7. 改变当前 CloudBase 下载授权或 EXE / MSI 口令流程。
8. 宣传“绝对安全”“完全无风险”“已完成 FFmpeg 商业许可证最终复核”等夸大表述。

## 4. 广告位保持方式

广告位保持现有位置、ID 和逻辑：

- 在线工具页：工具区下方的 `<div id="ad-container">`。
- 首页、下载页：保留现有广告位置和 `AdSlot` 调用。

本轮只允许让广告容器视觉融入深色页面，不改变 `AdSlot`、`adsConfig`、Google/Baidu/placeholder 逻辑，不让广告遮挡上传、处理、下载按钮。

## 5. 程序图标保持方式

当前网页 Header 使用 `/icons/app-icon-64.png`，桌面程序图标由已有 Tauri 资源和配置控制。本轮不替换、不重绘、不移动图标，不修改 Tauri 图标配置。

## 6. 下载页、隐私页、许可证页、说明入口保持方式

必须保留：

- `/download/`
- `/privacy/`
- `/licenses/`
- `/terms/`
- `/tutorials/`
- `/release/v1.0.0/docs/INSTALL_GUIDE.md`
- `/release/v1.0.0/docs/THIRD_PARTY_NOTICES.md`
- `/release/v1.0.0/docs/FFMPEG_LICENSE_NOTICE.md`
- SHA256 展示和校验说明。

下载页只做视觉升级和可见中文修正，不改变授权下载请求、口令字段、EXE/MSI 选择、CloudBase 临时链接生成流程。

## 7. CloudBase 下载授权保持方式

绝对不修改：

- `cloudbase/functions/createDownloadUrl/index.js`
- CloudBase 环境变量
- 下载口令
- `downloadAuthConfig`
- EXE / MSI packageType 流程
- 临时下载链接生成逻辑
- 静态托管部署结构

CloudBase 仍只用于静态托管、安装包存储、下载口令授权和临时下载链接生成，不接触用户处理文件。

## 8. 计划修改文件

如果用户确认继续，本轮预计只改以下 UI / 文案文件：

- `apps/web/src/app/globals.css`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/components/layout/Header.tsx`
- `apps/web/src/components/layout/Footer.tsx`
- `apps/web/src/components/tools/ToolsClient.tsx`
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/download/page.tsx`
- `apps/web/src/components/download/DownloadAuthBox.tsx`
- 视需要轻量调整 `privacy`、`licenses`、`tutorials` 等页面容器样式。

## 9. 绝对不改文件

本轮绝对不改：

- `cloudbase/functions/createDownloadUrl/index.js`
- `apps/desktop/src-tauri/tauri.conf.json`
- `apps/desktop/src-tauri/src/**`
- `packages/image-core/**`
- `packages/pdf-core/**`
- `packages/media-core/**`
- `packages/export-core/**`
- `packages/ocr-core/**`
- `apps/web/src/config/ads.ts`
- 任何安装包、WebView2 offlineInstaller、FFmpeg WASM、sidecar 二进制、SHA256 生成逻辑。

## 10. 回滚方式

如果视觉方向不符合预期，可以只回滚本轮 UI 文件：

1. `apps/web/src/app/globals.css`
2. `apps/web/src/app/layout.tsx`
3. `apps/web/src/components/layout/Header.tsx`
4. `apps/web/src/components/layout/Footer.tsx`
5. `apps/web/src/components/tools/ToolsClient.tsx`
6. `apps/web/src/app/page.tsx`
7. `apps/web/src/app/download/page.tsx`
8. `apps/web/src/components/download/DownloadAuthBox.tsx`

由于本轮不碰转换核心、CloudBase 函数、Tauri 权限、安装包和授权流程，回滚不会影响现有部署边界。
