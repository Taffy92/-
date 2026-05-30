# 在线版界面重设计交接文档

日期：2026-05-30  
项目：万能格式转换器  
范围：`apps/web` 在线版界面  
目标读者：UI/UX 设计师、前端工程师、产品负责人

## 设计目标

本轮在线版界面完全推翻旧的深色技术感工作台，改为更适合大众用户的干净、专业、低学习成本的工具型界面。

核心目标：

- 首页第一屏直接表达“万能格式转换器”和核心能力。
- 在线工具页第一屏直接进入“选择任务、添加文件、导出结果”的使用路径。
- 保留广告位，但广告位与文件处理区域保持视觉和逻辑隔离。
- 保留所有现有转换功能，不新增登录、会员、云端转换 API 或无关功能。
- 强调隐私承诺：文件仅在本地处理，不上传服务器，不调用云端转换 API。
- 移动端保持可用，不出现横向滚动。

## 当前截图

设计预览图位于：

- `D:\万能格式转换器项目\verification\online-redesign-home-desktop.png`
- `D:\万能格式转换器项目\verification\online-redesign-tools-desktop.png`
- `D:\万能格式转换器项目\verification\online-redesign-tools-mobile.png`

## 主要改动文件

### 首页

文件：

`D:\万能格式转换器项目\apps\web\src\app\page.tsx`

职责：

- 在线版首页首屏。
- 展示品牌名、隐私承诺、主要工具能力、下载离线专业版入口。
- 保留首页广告位 `homeMiddle`。

关键结构：

```tsx
<main className="bg-[#f6f8fb] text-slate-950">
  <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)] lg:px-8 lg:py-14">
    ...
  </section>

  <div id="ad-container" className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
    <AdSlot config={adsConfig} name="homeMiddle" />
  </div>
</main>
```

首页设计语言：

- 背景：浅灰 `#f6f8fb`
- 主按钮：深色实心 `bg-slate-950`
- 卡片：白底、浅边框、轻阴影
- 强调色：少量绿色用于“本地处理/隐私承诺”

### 在线工具页

文件：

`D:\万能格式转换器项目\apps\web\src\components\tools\ToolsClient.tsx`

职责：

- 在线版和离线桌面版共用工具组件。
- 本轮主要修改在线版分支：`surface === "web"`。
- 文件处理、转换、预览、下载逻辑保持原有实现。

在线版主结构在 `ToolsClient` 组件后半段的非桌面分支：

```tsx
return (
  <main className="office-workbench min-h-[calc(100vh-64px)] bg-[#f6f8fb] text-slate-900">
    <section id="tool-picker" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      ...
    </section>
  </main>
);
```

页面结构：

1. 顶部说明区
   - 标识“在线版 / 文件本地处理”
   - 主标题：“选择一个转换任务，添加文件后直接导出”
   - 隐私说明卡片：“在线版说明”

2. 工具分类导航
   - 图片工具
   - 文档工具
   - 音视频工具
   - 离线与批量

3. 主操作区
   - 当前工具标题
   - 隐私和能力边界说明
   - 拖拽/点击上传区域
   - 任务操作按钮
   - 文件预览区域
   - 进度和结果区域

4. 右侧参数栏
   - 当前参数
   - 任务信息
   - 能力边界

5. 广告位
   - 工具页底部 `toolBottom`

广告位代码：

```tsx
<div id="ad-container" className="mt-8">
  <AdSlot config={adsConfig} name="toolBottom" />
</div>
```

### Header

文件：

`D:\万能格式转换器项目\apps\web\src\components\layout\Header.tsx`

职责：

- 在线版使用浅色导航。
- 离线桌面版继续使用深色导航。
- 移动端保留汉堡菜单。

在线版导航项：

```tsx
const webNavItems = [
  { href: siteConfig.links.tools, label: "在线工具", primary: true },
  { href: siteConfig.links.download, label: "离线专业版" },
  { href: siteConfig.links.tutorials, label: "使用教程" },
  { href: siteConfig.links.about, label: "关于" }
] as const;
```

### Footer

文件：

`D:\万能格式转换器项目\apps\web\src\components\layout\Footer.tsx`

职责：

- 在线版使用白底页脚。
- 保留必要链接：关于、隐私政策、使用条款、开源许可证、联系、下载、教程、更新日志。
- 保留隐私和广告隔离说明。

关键文案：

```tsx
文件处理在本地完成。CloudBase 只用于下载授权，不接触用户处理文件；广告不接收 File、Blob、ArrayBuffer、Canvas 或转换结果。
```

### 全局样式

文件：

`D:\万能格式转换器项目\apps\web\src\app\globals.css`

关键调整：

```css
:root {
  color-scheme: light;
  background: #f4f7fb;
}

html {
  scroll-behavior: smooth;
  overflow-x: clip;
}

body {
  margin: 0;
  overflow-x: clip;
  background: #f6f8fb;
  color: #172033;
  font-family: Arial, "Microsoft YaHei", "PingFang SC", sans-serif;
}
```

注意：

- `.office-workbench` 下有一组覆盖规则，用来把原来偏深色的工具组件转换为浅色界面。
- 如果专业人员继续精修，建议逐步把这些覆盖规则收敛为更清晰的组件级 class，而不是长期依赖大量 `!important`。

## 保留的功能边界

本轮没有改动以下逻辑：

- 图片裁切
- 图片尺寸调整
- 添加水印
- 图片压缩
- PDF 转图片
- Word 转图片
- Excel 转图片
- 视频格式转换
- 音频格式转换
- 视频提取音频
- 在线版批量处理引导
- 离线专业版下载入口
- CloudBase 下载授权逻辑
- 广告配置 `adsConfig`
- 隐私网络拦截逻辑
- 发布文档 HTML 渲染路由

## 专业人员可重点修改的位置

### 1. 首页视觉层

建议优先看：

`apps/web/src/app/page.tsx`

可改方向：

- 首页左右布局比例
- 工具总览卡片样式
- CTA 按钮文案和视觉权重
- 是否增加更清晰的“支持格式”展示

不要改：

- `AdSlot`
- `isDesktopApp` 分支
- 隐私承诺文案的核心含义

### 2. 在线工具页信息架构

建议优先看：

`apps/web/src/components/tools/ToolsClient.tsx`

可改方向：

- 工具分类导航的展开方式
- 上传区域视觉样式
- 右侧参数栏的信息密度
- 移动端工具分类是否默认展开
- 预览区空状态

不要改：

- `handleFile`
- `runCurrentTask`
- 各转换函数
- 文件大小限制
- `inputRef` / `folderInputRef`
- `AdSlot`

### 3. 设计系统收敛

建议优先看：

`apps/web/src/app/globals.css`

当前设计没有单独抽象完整 design token。若继续专业化，可考虑新增：

```css
:root {
  --surface-page: #f6f8fb;
  --surface-card: #ffffff;
  --border-soft: #d7e0ea;
  --text-main: #172033;
  --text-muted: #64748b;
  --action-main: #0f172a;
  --success-soft: #ecfdf5;
}
```

再逐步替换 Tailwind 中重复出现的色值。

## 验证结果

已执行：

```powershell
npm test
npm run build:web
node scripts/run-pnpm.cjs --filter web check:network:browser
```

结果：

- Vitest：11 个测试文件，51 个测试通过。
- Next.js 静态构建通过。
- Playwright 浏览器回归：7/7 通过。
- 截图检查：桌面首页、桌面工具页、移动工具页均无横向滚动。

截图检查输出：

```json
[
  {
    "path": "verification/online-redesign-home-desktop.png",
    "width": 1440,
    "height": 1000,
    "overflow": false,
    "title": "万能格式转换器"
  },
  {
    "path": "verification/online-redesign-tools-desktop.png",
    "width": 1440,
    "height": 1100,
    "overflow": false,
    "title": "选择一个转换任务，添加文件后直接导出"
  },
  {
    "path": "verification/online-redesign-tools-mobile.png",
    "width": 375,
    "height": 900,
    "overflow": false,
    "title": "选择一个转换任务，添加文件后直接导出"
  }
]
```

## 后续修改建议

建议专业人员按以下顺序处理：

1. 先确认首页首屏是否符合品牌感和大众工具定位。
2. 再确认在线工具页的工具分类是否足够直观。
3. 然后检查移动端是否需要减少卡片数量或压缩间距。
4. 最后再做颜色、阴影、字号、边框半径等视觉细节微调。

每次修改后建议至少执行：

```powershell
npm run build:web
node scripts/run-pnpm.cjs --filter web check:network:browser
```

如果涉及转换逻辑或文件输入区域，还需要执行：

```powershell
npm test
```
