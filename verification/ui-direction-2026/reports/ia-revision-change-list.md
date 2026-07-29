# 信息架构修订变更清单

## 视觉原型源文件

- `assets/prototype.js`
  - 建立五分类、24 功能的唯一数据源。
  - 删除原型顶部和离线侧栏中的独立“增强工具”入口。
  - 增加桌面完整目录、390px 工具切换器和离线任务类型切换状态。
  - 增加面包屑、当前分类和克制的“离线批量”范围标签。
- `assets/prototype.css`
  - 增加统一目录、移动底部面板、离线目录和分类导航样式。
  - 调整五分类首页、在线抽屉、离线 A 折叠分类和离线 C 编号轨。
  - 保持 390px 无固定侧栏、1120×720 无整窗滚动。

六个 `prototype.html` 入口文件未修改；它们通过共享 `prototype.js` 和 `prototype.css` 获得本轮修订。

## 方向板与截图

- 覆盖六个 `concept-anchor.png`，改为由修订后真实原型截图组成的方向板。
- 重新生成 45 张正式方案截图。
- 其中新增 12 张目录/切换状态截图：
  - 在线每套：`tool-mobile-selected-390.png`
  - 在线每套：`tool-catalog-desktop-1440.png`
  - 在线每套：`tool-switcher-mobile-390.png`
  - 离线每套：`task-switcher-1280x820.png`
- 重新生成六张 `*-review-sheet.png`。
- 新增 `reports/online-ia-revision-review.png` 与 `reports/offline-ia-revision-review.png`。

完整路径见 `reports/revised-screenshot-manifest.md`。

## 设计系统

- `design-systems/online-a-precision-whitefield.md`
- `design-systems/online-b-night-calibration.md`
- `design-systems/online-c-editorial-flow.md`
- `design-systems/offline-a-clean-task-canvas.md`
- `design-systems/offline-b-professional-batch-console.md`
- `design-systems/offline-c-compact-three-band.md`

六份草案均新增统一分类、导航一致性、移动切换和离线范围标签规范。

## 报告与索引

修订：

- `README.md`
- `reports/direction-review.md`
- `reports/fidelity-ledger.md`
- `reports/visual-qa.md`
- `reports/file-manifest.md`

新增：

- `reports/unified-information-architecture.md`
- `reports/revised-screenshot-manifest.md`
- `reports/ia-revision-change-list.md`
- `reports/online-ia-revision-review.png`
- `reports/offline-ia-revision-review.png`

## 明确未修改

- `apps/web/**`
- `apps/desktop/**`
- `packages/**`
- `cloudbase/**`
- `package.json`
- `pnpm-lock.yaml`
- 正式路由、权限、转换逻辑和 `/local-tools` 路径
- 历史目录 `verification/ui-concepts/` 与 `verification/ui-v2-prototypes/`
