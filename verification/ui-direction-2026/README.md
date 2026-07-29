# 万能格式转换器 · 第二阶段 UI 视觉定向

本目录是独立的视觉评审材料。它不参与 `apps/web`、`apps/desktop`、EdgeOne 或 CloudBase 的构建，也没有接入现有路由、组件、样式或业务逻辑。

## 推荐先看

1. `reports/online-a2-visual-review.md`：在线 A2 的视觉精修结论、A/A2 差异与移动端改进。
2. `reports/online-a-vs-a2-review.png`：在线 A 与 A2 的首页和 390px 对比。
3. `reports/unified-information-architecture.md`：24 个真实功能的统一分类、版本范围和被取消入口。
4. `design-systems/online-a2-precision-whitefield-refined.md`：A2 设计系统补充。
5. `reports/online-a2-visual-qa.md`：A2 的 Playwright、功能清单和项目回归结果。
6. `reports/online-a2-screenshot-manifest.md`：A2 的 16 张正式截图路径。

统一用户分类固定为：图片工具、PDF 工具、文档工具、音视频工具、OCR 工具。功能不再按新旧、组件或内部路由拆成第二套入口。

## 三套最终候选组合

本轮按跨端产品组合进行三选一。每套都使用同一份五分类、24 个真实功能目录；在线版保持单文件本地处理与广告边界，离线版保持完整批量队列、平铺预览、独立输出文件夹和本地授权。

| 候选 | 在线版 | Windows 离线版 | 适合的最终方向 |
| --- | --- | --- | --- |
| 方案一 · 清爽可信 | A2 精密白场精修版 | A 清爽任务画布 | 面向最广用户，学习成本最低，移动端与最小窗口风险最低 |
| 方案二 · 专注专业 | B 夜间校准台 | B 专业批处理台 | 音视频与长时批处理优先，信息密度最高 |
| 方案三 · 编辑流程 | C 编辑式流程页 | C 紧凑三带式 | PDF、Word、Excel 与多页任务优先，步骤和结果核对最强 |

在线 A 是方案一的历史基线，仅用于查看 A2 的精修依据，不计入本轮“三选一”。

## 在线版

| 方向 | 定位 | 原型 | 对照图 | 设计系统 |
| --- | --- | --- | --- | --- |
| A 精密白场（历史基线） | A2 的演进对照，不计入三选一 | `online/concept-a/prototype.html` | `reports/online-concept-a-review-sheet.png` | `design-systems/online-a-precision-whitefield.md` |
| A2 精密白场精修版 | A 的独立精修候选，真实任务与移动效率 | `online/concept-a2/prototype.html` | `reports/online-a-vs-a2-review.png` | `design-systems/online-a2-precision-whitefield-refined.md` |
| B 夜间校准台 | 音视频、专注、深色 | `online/concept-b/prototype.html` | `reports/online-concept-b-review-sheet.png` | `design-systems/online-b-night-calibration.md` |
| C 编辑式流程页 | 文档、多页、强步骤 | `online/concept-c/prototype.html` | `reports/online-concept-c-review-sheet.png` | `design-systems/online-c-editorial-flow.md` |

A2 拥有独立 HTML、脚本、样式、方向板和 16 张截图。查询参数包括 `screen=home|tool`、`tool=image|document|media|ocr`、`state=idle|selected|running|success|error|cancelled|catalog|support`；移动长参数状态增加 `detail=long`。

每套在线截图包含：

- `home-desktop-1440.png`
- `tool-desktop-selected-1440.png`
- `tool-tablet-running-768.png`
- `tool-mobile-selected-390.png`
- `tool-mobile-error-390.png`
- `tool-mobile-success-390.png`
- `support-dialog-desktop-1440.png`
- `tool-catalog-desktop-1440.png`
- `tool-switcher-mobile-390.png`

原型查询参数：

- `?screen=home`
- `?screen=tool&state=idle`
- `?screen=tool&state=selected`
- `?screen=tool&state=running`
- `?screen=tool&state=success`
- `?screen=tool&state=error`
- `?screen=tool&state=support`
- `?screen=tool&state=catalog`

## Windows 离线版

| 方向 | 定位 | 原型 | 对照图 | 设计系统 |
| --- | --- | --- | --- | --- |
| A 清爽任务画布 | 熟悉、浅色、低学习成本 | `offline/concept-a/prototype.html` | `reports/offline-concept-a-review-sheet.png` | `design-systems/offline-a-clean-task-canvas.md` |
| B 专业批处理台 | 视频队列、高密度、深色 | `offline/concept-b/prototype.html` | `reports/offline-concept-b-review-sheet.png` | `design-systems/offline-b-professional-batch-console.md` |
| C 紧凑三带式 | 文档批处理、小窗口效率 | `offline/concept-c/prototype.html` | `reports/offline-concept-c-review-sheet.png` | `design-systems/offline-c-compact-three-band.md` |

每套离线截图包含：

- `empty-1280x820.png`
- `workbench-running-1280x820.png`
- `compact-running-1120x720.png`
- `advanced-expanded-1280x820.png`
- `license-dialog-1280x820.png`
- `task-switcher-1280x820.png`

原型查询参数：

- `?state=idle`
- `?state=running`
- `?state=advanced`
- `?state=license`
- `?state=catalog`

运行截图中的单项状态覆盖处理中、成功、失败、等待与取消，并包含停止和失败重试；高级设置截图覆盖输出目录；授权截图覆盖机器码、离线激活码与 `license.mrx`。

## 素材说明

- `concept-anchor.png`：由修订后首页、工作台、统一目录和移动切换器组成的方向板；旧 ImageGen 锚点已被替换。
- `assets/`：只供本轮原型使用的缩略图、首帧和文档第一页审查素材。
- 在线原型复用项目现有 LOGO 和支持作者二维码。
- 锚点和审查素材都不是生产资源，不应直接并入第三阶段页面。

## 当前推荐

- 在线：A2 精密白场精修版进入人工审阅；尚未批准应用到正式项目。
- 离线：A 清爽任务画布。
- 在线 C 与离线 C 可作为文档批处理导向的第二候选。

请先完成人工审阅，再决定是否进入第三阶段。当前未修改任何现有业务代码、页面代码、组件代码、样式、依赖、配置、路由或转换逻辑。
