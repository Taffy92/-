# 万能格式转换器 6–8 周项目改进实施计划

> 实施时严格按任务顺序推进。每个任务先写失败测试或建立失败基线，再做最小实现，验证通过后单独提交。不得覆盖用户已有工作区修改，不得提交用户文件、客户记录、私钥、激活码或生成的 `.mrx`。

**目标：** 在不新增转换功能、不改变隐私和授权边界的前提下，用 6–8 周完成真实转换质量基线、统一任务与错误模型、关键工作台解耦、下载试用激活闭环和可重复发布门禁。

**架构：** 保留现有 `@doctool/*-core`、浏览器本地 WASM、Tauri FFmpeg sidecar 和 LibreOffice。新增轻量的 `apps/web/src/lib/conversion/` 契约层，把任务状态、引擎选择、错误和输出写入从两个巨型 React 组件中抽离。Web 与 Desktop 通过显式适配器共享任务语义，不共享不适用的产品壳。

**技术栈：** Node.js 20、pnpm 9.15.4、Next.js 15、React 18、TypeScript、Vitest、Playwright、Tauri 1、Rust、FFmpeg、LibreOffice、EdgeOne Cloud Functions。

**设计规格：** `docs/superpowers/specs/2026-08-08-project-improvement-design.md`

---

## 执行约束

- 正式验证必须使用 Node 20.x 和 pnpm 9.15.4。Node 26 只能用于调查，不能签署发布结论。
- 当前计划编写时，以下改动属于用户工作区，实施者必须先检查并保留：
  - `apps/web/cloud-functions/api/admin/license/_lib/api.ts`
  - `apps/web/src/tests/edgeOneLicenseApi.test.ts`
  - 已删除的 `design-qa.md`
- 所有 UI、样式、布局、响应式或交互改动开始前，实施者必须完整读取 `D:\CodexSkills\skills\media-converter-ui-director\SKILL.md` 及其按任务指定的 references，并保留前后截图和控制台检查证据。
- 每次只迁移一个职责；不得一次性重写 `ToolsClient.tsx`、`LocalToolsClient.tsx` 或 `globals.css`。
- 测试夹具只能使用自制或允许再分发的无敏感文件，并在夹具清单记录来源。
- 每个任务的 `git add` 必须列出精确路径，不得使用 `git add .`。

## 周次映射

| 周次 | 任务 |
| --- | --- |
| 第 1 周 | Task 1–3：工具链、基线、真实样本 |
| 第 2–3 周 | Task 4–7：任务契约、输出一致性、Office、音视频与批量 |
| 第 4 周 | Task 8–9：两个工作台渐进解耦 |
| 第 5 周 | Task 10–11：授权安全、下载试用激活体验 |
| 第 6 周 | Task 12：统一发布门禁 |
| 第 7–8 周 | Task 13–14：代码签名分支、干净虚拟机与最终验收 |

---

## Task 1：固定正式工具链并保护工作区

**文件：**

- Create: `scripts/verify-toolchain.mjs`
- Create: `apps/web/src/tests/toolchain.test.ts`
- Modify: `package.json`
- Modify: `docs/operator-runbook.md`

- [ ] **Step 1：检查并记录现有工作区**

运行：

```powershell
git status --short
git diff -- apps/web/cloud-functions/api/admin/license/_lib/api.ts apps/web/src/tests/edgeOneLicenseApi.test.ts
git diff -- design-qa.md
```

预期：确认用户已有改动；本任务不恢复、不暂存、不格式化这些文件。

- [ ] **Step 2：切换正式工具链**

运行：

```powershell
node -v
.\.pnpm-home\pnpm.CMD --version
```

预期：分别为 `v20.x` 和 `9.15.4`。如果 Node 不是 20.x，先由本机 Node 版本管理器切换，再继续。

- [ ] **Step 3：先写工具链失败测试**

测试要求：

- `.nvmrc` 必须为 `20`；
- 根 `package.json` 的 `engines.node` 必须为 `20.x`；
- `packageManager` 必须为 `pnpm@9.15.4`；
- `verify:toolchain` 脚本必须存在；
- 工具链脚本对非 Node 20 或非 pnpm 9.15.4 返回非零退出码。

运行：

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/toolchain.test.ts
```

预期：因为验证脚本和 npm 入口尚不存在而失败。

- [ ] **Step 4：实现工具链验证**

`scripts/verify-toolchain.mjs` 只检查版本并输出实际值和期望值，不安装或切换运行时。根 `package.json` 增加：

```json
"verify:toolchain": "node scripts/verify-toolchain.mjs"
```

在 `docs/operator-runbook.md` 把该命令放在所有正式构建命令之前。

- [ ] **Step 5：验证并提交**

```powershell
npm run verify:toolchain
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/toolchain.test.ts
git add -- scripts/verify-toolchain.mjs apps/web/src/tests/toolchain.test.ts package.json docs/operator-runbook.md
git commit -m "build: enforce release toolchain"
```

预期：命令通过，提交只包含四个目标文件。

---

## Task 2：建立可重复的质量基线

**文件：**

- Create: `verification/reliability-2026/baseline.md`
- Create: `verification/reliability-2026/sample-matrix.json`
- Create: `apps/web/src/tests/conversionBaseline.test.ts`

- [ ] **Step 1：先定义样本清单校验测试**

测试必须拒绝：

- 少于 20 个样本；
- 图片少于 4、PDF 少于 4、Word 少于 3、Excel 少于 3、音视频少于 4、OCR 少于 2；
- 没有正常、复杂、超大、损坏或不支持用例；
- 缺少来源、许可、预期结果或稳定断言；
- 包含绝对路径、客户名称、机器码或授权信息。

运行：

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/conversionBaseline.test.ts
```

预期：清单尚不存在，测试失败。

- [ ] **Step 2：创建基线清单**

`sample-matrix.json` 每项固定包含：

```text
id, category, caseType, source, license, fixturePath,
expectedOutcome, stableAssertions, surfaces
```

`baseline.md` 记录当前版本、Node/pnpm/Rust/LibreOffice/FFmpeg 版本、标准机器信息、现有通过/跳过测试和已知问题。不得写入用户真实文件路径。

- [ ] **Step 3：验证并提交**

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/conversionBaseline.test.ts
git add -- verification/reliability-2026/baseline.md verification/reliability-2026/sample-matrix.json apps/web/src/tests/conversionBaseline.test.ts
git commit -m "test: define conversion quality baseline"
```

预期：清单结构测试通过。

---

## Task 3：加入无敏感真实转换夹具

**文件：**

- Create: `apps/web/src/test-fixtures/conversion/README.md`
- Create: `apps/web/src/test-fixtures/conversion/**`
- Modify: `verification/reliability-2026/sample-matrix.json`
- Modify: `apps/web/src/tests/conversionBaseline.test.ts`

- [ ] **Step 1：加入夹具存在性与哈希失败测试**

测试读取清单，验证每个 `fixturePath` 位于 `apps/web/src/test-fixtures/conversion/`、文件存在、大小非零，并与清单内 SHA256 相符。测试还必须拒绝 `.mrx`、PEM、客户记录和带绝对路径的文本。

运行：

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/conversionBaseline.test.ts
```

预期：真实夹具尚未完整加入而失败。

- [ ] **Step 2：生成或加入 20 个夹具**

优先使用项目自制文件；DOCX、XLSX、PDF 等压缩容器必须在 `README.md` 记录生成方式。至少加入：

- 带透明度、EXIF、大尺寸和损坏输入的图片；
- 多页、旋转页、损坏和不支持特性的 PDF；
- 含分页、表格、中文字体和复杂对象的 DOCX；
- 多工作表、日期、公式、合并单元格的 XLSX；
- 短视频、含/不含音轨的视频、不同编码音频；
- 中英文 OCR 图片和 PDF。

超大用例允许由测试脚本基于小夹具在临时目录生成，避免把大型文件提交到 Git；生成规则必须确定且有大小上限。

- [ ] **Step 3：验证隐私和提交**

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/conversionBaseline.test.ts src/tests/privacy.test.ts
git add -- apps/web/src/test-fixtures/conversion verification/reliability-2026/sample-matrix.json apps/web/src/tests/conversionBaseline.test.ts
git commit -m "test: add safe conversion fixtures"
```

预期：夹具、哈希、许可与隐私检查全部通过。

---

## Task 4：建立统一任务、状态和错误模型

**文件：**

- Create: `apps/web/src/lib/conversion/types.ts`
- Create: `apps/web/src/lib/conversion/state.ts`
- Create: `apps/web/src/lib/conversion/errors.ts`
- Create: `apps/web/src/lib/conversion/engine.ts`
- Create: `apps/web/src/lib/conversion/index.ts`
- Create: `apps/web/src/tests/conversionTask.test.ts`

- [ ] **Step 1：先写任务契约失败测试**

测试覆盖：

- 只允许 `queued → inspecting → ready → running → writing → completed`；
- `running` 和 `writing` 可以进入 `failed` 或 `cancelled`；
- 终态不能重新进入运行态；
- Office Desktop 选择 LibreOffice；
- Desktop Media 在本地路径和 sidecar 可用时选择 sidecar；
- 其他场景选择现有浏览器实现；
- 统一错误包含 `code`、`stage`、`backend`、`message`、`action`；
- 未知异常被转换为安全错误，不暴露路径或堆栈。

运行：

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/conversionTask.test.ts
```

预期：模块不存在，测试失败。

- [ ] **Step 2：实现最小纯逻辑模块**

不得引入插件注册器、依赖注入容器或通用工作流框架。类型仅覆盖现有工具；`cause` 不进入面向用户的序列化结果。

- [ ] **Step 3：验证现有边界并提交**

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/conversionTask.test.ts src/tests/privacy.test.ts src/tests/networkGuard.test.ts
git add -- apps/web/src/lib/conversion apps/web/src/tests/conversionTask.test.ts
git commit -m "refactor: add conversion task contract"
```

预期：新测试和隐私边界测试通过，尚未迁移 UI。

---

## Task 5：统一输出写入、临时文件和取消清理

**文件：**

- Create: `apps/web/src/lib/conversion/webOutput.ts`
- Create: `apps/web/src/lib/conversion/desktopOutput.ts`
- Create: `apps/web/src/lib/conversion/resources.ts`
- Create: `apps/web/src/tests/conversionOutput.test.ts`
- Modify: `apps/desktop/src-tauri/src/local_paths.rs`
- Modify: `apps/desktop/src-tauri/src/main.rs`

- [ ] **Step 1：先写输出失败测试**

覆盖：

- Web 输出只生成 Blob/Object URL，不调用网络；
- Desktop 输出在任务专用临时名称完成后再确定最终名称；
- 文件名冲突生成稳定后缀，不覆盖用户已有文件；
- 多页 PDF/Word/Excel 写入同名子文件夹；
- 单任务失败只清理本任务临时文件；
- 取消释放 Object URL、AbortController 和已启动本地任务资源；
- 清理操作不能递归删除用户选择的输出根目录。

运行：

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/conversionOutput.test.ts
```

预期：适配器尚不存在而失败。

- [ ] **Step 2：实现 Web 与 Desktop 输出适配器**

Rust 只新增最小的安全重命名或临时文件清理命令；所有目标路径必须在用户已选择的输出目录内解析并验证。不得扩大 Tauri allowlist，不得增加递归删除权限。

- [ ] **Step 3：运行 Rust 与前端测试**

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/conversionOutput.test.ts src/tests/tauriPermissions.test.ts src/tests/offlineP0.test.ts
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
```

预期：全部通过。

- [ ] **Step 4：提交**

```powershell
git add -- apps/web/src/lib/conversion apps/web/src/tests/conversionOutput.test.ts apps/desktop/src-tauri/src/local_paths.rs apps/desktop/src-tauri/src/main.rs
git commit -m "refactor: make conversion outputs atomic"
```

---

## Task 6：恢复 Office 真实转换验证

**文件：**

- Modify: `apps/web/src/tests/officeImages.test.ts`
- Create: `apps/web/src/tests/officeDesktopIntegration.test.ts`
- Modify if tests expose defects: `packages/export-core/src/officeImages.ts`
- Modify if tests expose defects: `apps/desktop/src-tauri/src/libreoffice.rs`
- Modify if tests expose defects: `apps/web/src/components/tools/ToolsClient.tsx`

- [ ] **Step 1：把跳过项改为可执行测试**

浏览器路径使用真实 DOCX/XLSX 夹具验证第一页、页数或工作表输出。Desktop 专用测试检测固定 LibreOffice 是否可用；不可用时必须明确返回“环境未准备”，正式发布门禁把该结果视为失败，而不是静默 `skip`。

运行：

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/officeImages.test.ts src/tests/officeDesktopIntegration.test.ts
```

预期：至少一个真实行为断言失败，证明测试可以捕获现状问题。

- [ ] **Step 2：做最小 Office 修复**

只修复测试暴露的分页、第一页渲染、临时 PDF 清理、超时或错误归一化问题。不得扩展到 `.doc`、`.xls` 或 PDF 编辑。

- [ ] **Step 3：运行完整 Office 回归**

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/officeImages.test.ts src/tests/officeDesktopIntegration.test.ts src/tests/libreofficeIntegration.test.ts src/tests/pdfExpansion.test.ts
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml libreoffice
```

预期：Office 关键测试全部执行并通过，没有 `skip`。

- [ ] **Step 4：提交**

只暂存实际修改的上述文件：

```powershell
git add -- apps/web/src/tests/officeImages.test.ts apps/web/src/tests/officeDesktopIntegration.test.ts packages/export-core/src/officeImages.ts apps/desktop/src-tauri/src/libreoffice.rs apps/web/src/components/tools/ToolsClient.tsx
git commit -m "test: verify real office conversions"
```

如果某个可选修改文件没有变化，不要为了匹配命令而改动它。

---

## Task 7：验证音视频后端、回退和批量隔离

**文件：**

- Create: `apps/web/src/tests/mediaConversionBehavior.test.ts`
- Modify: `apps/web/src/lib/sidecarFfmpeg.ts`
- Modify: `apps/web/src/components/tools/ToolsClient.tsx`
- Modify if tests expose defects: `apps/desktop/src-tauri/src/sidecar_ffmpeg.rs`
- Modify: `apps/web/src/lib/batchQueue.ts`
- Modify: `apps/web/src/tests/batchQueue.test.ts`

- [ ] **Step 1：先写真实媒体失败测试**

使用短媒体夹具验证编码、时长、分辨率、音轨、无音轨错误、sidecar 选择、WASM 回退、取消和批量单文件失败隔离。测试不得把本地路径传入 Web surface。

运行：

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/mediaConversionBehavior.test.ts src/tests/batchQueue.test.ts
```

预期：行为测试至少有一项失败或缺少实现。

- [ ] **Step 2：统一后端结果与错误**

将 sidecar/WASM 选择接入 Task 4 的引擎规则；将后端失败转换为统一错误。批量队列继续处理后续文件，并保留失败项状态和操作建议。

- [ ] **Step 3：验证并提交**

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/mediaConversionBehavior.test.ts src/tests/mediaCore.test.ts src/tests/mediaExpansion.test.ts src/tests/sidecarFfmpegExperiment.test.ts src/tests/batchQueue.test.ts
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml sidecar
git add -- apps/web/src/tests/mediaConversionBehavior.test.ts apps/web/src/lib/sidecarFfmpeg.ts apps/web/src/components/tools/ToolsClient.tsx apps/desktop/src-tauri/src/sidecar_ffmpeg.rs apps/web/src/lib/batchQueue.ts apps/web/src/tests/batchQueue.test.ts
git commit -m "fix: harden media conversion fallback"
```

预期：媒体和批量测试通过；没有更改在线批量边界。

---

## Task 8：渐进拆分主工作台 `ToolsClient`

**前置动作：** 完整读取 UI director 技能及其指定 references，运行当前 UI 并保存在线版与离线版基线截图。

**文件：**

- Create: `apps/web/src/components/tools/useConversionController.ts`
- Create: `apps/web/src/components/tools/DesktopTaskWorkspace.tsx`
- Create: `apps/web/src/components/tools/ConversionResultView.tsx`
- Create: `apps/web/src/tests/toolsClientArchitecture.test.ts`
- Create: `verification/reliability-2026/tools-client-visual-qa.md`
- Modify: `apps/web/src/components/tools/ToolsClient.tsx`
- Modify only as required: `apps/web/src/app/globals.css`
- Modify: `apps/web/src/e2e/desktop-ui-v2.spec.ts`

- [ ] **Step 1：建立截图和架构失败基线**

保存 1280×820、1120×720 离线工作台和 1440、375 在线页面截图。架构测试要求 `ToolsClient` 不再直接实现输出写入、Tauri 引擎选择和错误字符串归一化。

运行：

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/toolsClientArchitecture.test.ts
```

预期：现有组件仍包含这些职责，测试失败。

- [ ] **Step 2：先迁移任务控制**

把状态机、取消和错误处理迁入 `useConversionController.ts`，保持现有 DOM 结构、文案、工具顺序和授权刷新时机。

- [ ] **Step 3：再迁移桌面任务区和结果区**

提取纯呈现组件；不得把在线页导航或广告容器带入 Desktop。预览仍保持多文件平铺、Office 第一页和视频首帧规则。

- [ ] **Step 4：运行功能与视觉验证**

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/toolsClientArchitecture.test.ts src/tests/offlineP0.test.ts src/tests/privacy.test.ts src/tests/licenseBoundary.test.ts
node scripts/run-pnpm.cjs --filter web exec playwright test src/e2e/desktop-ui-v2.spec.ts
```

同时检查两种窗口尺寸无横向溢出、控制台无 error/warning，并保存改后截图与对照图。

- [ ] **Step 5：提交**

```powershell
git add -- apps/web/src/components/tools/useConversionController.ts apps/web/src/components/tools/DesktopTaskWorkspace.tsx apps/web/src/components/tools/ConversionResultView.tsx apps/web/src/components/tools/ToolsClient.tsx apps/web/src/tests/toolsClientArchitecture.test.ts apps/web/src/e2e/desktop-ui-v2.spec.ts apps/web/src/app/globals.css verification/reliability-2026/tools-client-visual-qa.md
git commit -m "refactor: separate main conversion workspace"
```

提交前确认 `verification` 中只有本任务截图与报告，不包含用户文件。

---

## Task 9：渐进拆分本地工具工作台 `LocalToolsClient`

**文件：**

- Create: `apps/web/src/components/tools/useLocalToolController.ts`
- Create: `apps/web/src/components/tools/LocalFilePreviewGrid.tsx`
- Create: `apps/web/src/components/tools/LocalToolControls.tsx`
- Create: `apps/web/src/tests/localToolsArchitecture.test.ts`
- Create: `verification/reliability-2026/local-tools-visual-qa.md`
- Modify: `apps/web/src/components/tools/LocalToolsClient.tsx`
- Modify only as required: `apps/web/src/app/globals.css`
- Modify: `apps/web/src/e2e/desktop-ui-v2.spec.ts`

- [ ] **Step 1：先写架构与行为失败测试**

测试要求组件不再直接实现 `executeTool`、桌面文件写入和通用错误处理；所有既有本地工具 ID、输入限制和输出文件命名保持不变。

- [ ] **Step 2：提取控制器和纯呈现组件**

先迁移 `run/cancel/clear`，再迁移预览网格和参数区。OCR、PDF 编辑类本地工具与音频编辑仍调用现有 core，不新增工具。

- [ ] **Step 3：按产品壳拆分必要 CSS**

只移动本任务组件使用的规则。禁止全局重命名选择器或格式化整个 `globals.css`。

- [ ] **Step 4：验证截图、控制台与测试**

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/localToolsArchitecture.test.ts src/tests/localToolsIntegration.test.ts src/tests/ocrCore.test.ts src/tests/pdfExpansion.test.ts src/tests/privacy.test.ts
node scripts/run-pnpm.cjs --filter web exec playwright test src/e2e/desktop-ui-v2.spec.ts
```

预期：工具行为和已批准视觉不变，最小窗口无溢出。

- [ ] **Step 5：提交**

```powershell
git add -- apps/web/src/components/tools/useLocalToolController.ts apps/web/src/components/tools/LocalFilePreviewGrid.tsx apps/web/src/components/tools/LocalToolControls.tsx apps/web/src/components/tools/LocalToolsClient.tsx apps/web/src/tests/localToolsArchitecture.test.ts apps/web/src/e2e/desktop-ui-v2.spec.ts apps/web/src/app/globals.css verification/reliability-2026/local-tools-visual-qa.md
git commit -m "refactor: separate local tools workspace"
```

---

## Task 10：加固授权后台同源与登录限制

**文件：**

- Modify: `apps/web/cloud-functions/api/admin/license/_lib/api.ts`
- Modify: `apps/web/src/tests/edgeOneLicenseApi.test.ts`
- Create: `verification/reliability-2026/edgeone-admin-rate-limit.md`
- Modify: `docs/operator-runbook.md`

- [ ] **Step 1：先整合用户已有修改**

检查当前 diff。保留已经把 `assertSameOrigin` 移到统一 `authorize` 的修改和受保护记录/备份跨域测试；不要重新实现或覆盖。

- [ ] **Step 2：完成应用层同源回归**

单元测试覆盖所有受保护接口：生成、记录列表、授权文件下载和备份在跨域请求下均返回 403。会话创建继续校验同源；应用函数不使用进程内 Map 实现生产限流。

运行：

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/edgeOneLicenseAuth.test.ts src/tests/edgeOneLicenseApi.test.ts
```

预期：用户已有同源改动整合后全部通过。

- [ ] **Step 3：配置 EdgeOne 精准速率限制**

在 `gszhmrx.cn` 和 `www.gszhmrx.cn` 的域名级 Web 防护中创建同一条规则：

```text
请求方法 = POST
请求路径 = /api/admin/license/session
统计维度 = 客户端 IP
计数周期 = 15 分钟
速率阈值 = 5 次
处置持续时间 = 15 分钟
处置 = 自定义响应 HTTP 429
```

规则依据腾讯云 EdgeOne 官方“自定义速率限制规则”配置：`https://cloud.tencent.com/document/product/1552/93130`。如果当前套餐无法配置上述周期、IP 维度或 429 响应，本任务状态为阻塞，不能退化为单个函数进程内的内存计数，也不能声称防暴力措施完成。

- [ ] **Step 4：生产环境黑盒验证**

从同一测试 IP 连续提交 6 次错误密码，记录前 5 次的 401 和第 6 次的 429；等待窗口结束后确认恢复。随后从另一网络确认不受前一 IP 影响。报告只记录时间、状态码和规则 ID，不记录密码、Cookie 或完整 IP。

再次运行：

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/edgeOneLicenseAuth.test.ts src/tests/edgeOneLicenseApi.test.ts src/tests/edgeOneLicenseRecords.test.ts
```

预期：应用层测试通过，生产黑盒报告满足第 6 次返回 429。

- [ ] **Step 5：提交**

```powershell
git add -- apps/web/cloud-functions/api/admin/license/_lib/api.ts apps/web/src/tests/edgeOneLicenseApi.test.ts verification/reliability-2026/edgeone-admin-rate-limit.md docs/operator-runbook.md
git commit -m "fix: harden license admin access"
```

提交前再次确认没有暂存 `design-qa.md` 的删除。

---

## Task 11：收敛下载、试用和激活路径

**前置动作：** 完整读取 UI director 技能及其指定 references，截图当前下载页、Desktop 试用状态和锁定页。

**文件：**

- Modify: `apps/web/src/app/download/page.tsx`
- Modify: `apps/web/src/components/download/InstallerDownloadButton.tsx`
- Modify: `apps/web/src/components/tools/LicenseGate.tsx`
- Modify: `apps/web/src/lib/desktopLicense.ts`
- Create: `apps/web/src/tests/licenseExperience.test.ts`
- Create: `verification/reliability-2026/delivery-visual-qa.md`
- Modify: `apps/web/src/e2e/desktop-ui-v2.spec.ts`
- Modify: `apps/web/src/e2e/ui-round-2.spec.ts`
- Modify only as required: `apps/web/src/app/globals.css`

- [ ] **Step 1：先写下载与激活流程失败测试**

覆盖：

- 下载页首屏可见离线价值、本地处理、Windows 要求、文件大小、版本和 3 天试用；
- SHA256 和分片说明可访问但不抢占主操作；
- 未签名时明确 SmartScreen 风险；
- 试用期显示剩余天数且不遮挡转换；
- 到期只锁定执行，机器码、激活码和授权文件入口仍可用；
- 激活错误区分格式、签名、机器码、过期、系统时间和损坏；
- 激活成功后回到原任务且无需重启。

- [ ] **Step 2：最小修改下载页和 LicenseGate**

不增加欢迎页、账号、支付或联网校验。继续读取 `downloadsConfig`，不得复制版本和 SHA256 常量。

- [ ] **Step 3：视觉、响应式和控制台验证**

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/licenseExperience.test.ts src/tests/licenseBoundary.test.ts src/tests/privacy.test.ts
node scripts/run-pnpm.cjs --filter web exec playwright test src/e2e/desktop-ui-v2.spec.ts src/e2e/ui-round-2.spec.ts
```

保存 1440/375 下载页、1280×820/1120×720 Desktop 截图；控制台必须无产品 error/warning。

- [ ] **Step 4：提交**

```powershell
git add -- apps/web/src/app/download/page.tsx apps/web/src/components/download/InstallerDownloadButton.tsx apps/web/src/components/tools/LicenseGate.tsx apps/web/src/lib/desktopLicense.ts apps/web/src/tests/licenseExperience.test.ts apps/web/src/e2e/desktop-ui-v2.spec.ts apps/web/src/e2e/ui-round-2.spec.ts apps/web/src/app/globals.css verification/reliability-2026/delivery-visual-qa.md
git commit -m "feat: clarify offline trial and activation"
```

---

## Task 12：建立统一正式发布门禁

**文件：**

- Create: `scripts/verify-release.mjs`
- Create: `apps/web/src/tests/releaseGate.test.ts`
- Modify: `package.json`
- Modify: `apps/web/package.json`
- Modify: `docs/operator-runbook.md`
- Modify: `docs/reports/archive/RELEASE_COMPLIANCE_CHECKLIST.md`

- [ ] **Step 1：先写门禁编排失败测试**

测试要求根脚本 `verify:release` 固定执行：

```text
verify:toolchain
test
check:privacy
check:network
cargo check/test
build:edgeone
安装包/ZIP/分片/版本/SHA256 校验
秘密与 .mrx 泄漏扫描
关键转换测试 skip 扫描
```

Office 专用验证未执行或关键测试含 `skip` 时必须失败。

- [ ] **Step 2：实现只读编排脚本**

`scripts/verify-release.mjs` 逐步执行现有 npm/cargo 命令，失败时输出阶段、命令和退出码；不得自动部署、删除产物或修改版本号。根 `package.json` 增加：

```json
"verify:release": "node scripts/verify-release.mjs"
```

- [ ] **Step 3：先运行快速门禁测试**

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/releaseGate.test.ts
```

预期：通过。

- [ ] **Step 4：在 Node 20 完整运行发布门禁**

```powershell
npm run verify:release
```

预期：全部阶段通过；如果缺少正式本地安装包或 LibreOffice 资源，门禁明确指出缺失项并停止，不生成伪成功报告。

- [ ] **Step 5：提交**

```powershell
git add -- scripts/verify-release.mjs apps/web/src/tests/releaseGate.test.ts package.json apps/web/package.json docs/operator-runbook.md docs/reports/archive/RELEASE_COMPLIANCE_CHECKLIST.md
git commit -m "build: add unified release verification"
```

---

## Task 13：完成代码签名决策分支

**文件：**

- Modify: `docs/windows-smartscreen-signing.md`
- Modify if certificate is available: `apps/desktop/src-tauri/tauri.conf.json`
- Create: `verification/reliability-2026/code-signing-decision.md`
- Modify if signed: `apps/web/src/config/downloads.ts`

- [ ] **Step 1：记录不可逆外部条件**

确认是否已有合法 OV/EV 代码签名证书、发行主体、证书 thumbprint、受保护的签名机器和时间戳服务。不得把证书、私钥或口令写入仓库。

- [ ] **Step 2A：有证书时接入签名**

仅在真实证书存在时配置 `certificateThumbprint` 和 HTTPS `timestampUrl`，用正式打包机生成 MSI。验证：

```powershell
$signedMsiPath = (Resolve-Path 'release\v2.0.0\installers\万能格式转换器_2.0.0_x64_zh-CN.msi').Path
Get-AuthenticodeSignature -LiteralPath $signedMsiPath | Format-List Status,StatusMessage,SignerCertificate,TimeStamperCertificate
```

预期：`Status` 为 `Valid`，签名主体与发行方一致。重新生成 ZIP、SHA256、分片和下载配置，再运行 `npm run verify:release`。

- [ ] **Step 2B：无证书时保留未签名状态**

保持 `certificateThumbprint: null` 和空 `timestampUrl`，在决策文档记录原因、风险、负责人和下次复核日期；下载页继续展示 SmartScreen 与 SHA256 说明。不得填入假 thumbprint。

- [ ] **Step 3：提交非秘密决策材料**

```powershell
git add -- docs/windows-smartscreen-signing.md verification/reliability-2026/code-signing-decision.md apps/desktop/src-tauri/tauri.conf.json apps/web/src/config/downloads.ts
git commit -m "docs: record Windows signing decision"
```

只暂存实际发生变化的文件；安装包、证书和原始签名材料不得进入 Git。

---

## Task 14：干净虚拟机与最终验收

**文件：**

- Create: `verification/reliability-2026/windows-10-acceptance.md`
- Create: `verification/reliability-2026/windows-11-acceptance.md`
- Create: `verification/reliability-2026/final-scorecard.md`
- Modify: `docs/reports/archive/MANUAL_CLEAN_VM_TEST_GUIDE.md`
- Modify: `docs/operator-runbook.md`

- [ ] **Step 1：准备两台干净虚拟机**

Windows 10 x64 和 Windows 11 x64 均不得安装项目开发依赖。记录系统版本和是否已有 WebView2；不得记录机器码、用户名或授权码。

- [ ] **Step 2：执行完整离线流程**

每台虚拟机分别执行：

1. 从正式站点下载 ZIP；
2. 核对 ZIP SHA256；
3. 断网；
4. 解压并安装 MSI；
5. 启动 3 天试用；
6. 转换真实图片、PDF、Word、Excel、音频和视频夹具；
7. 执行 9 文件批量任务；
8. 核对独立时间戳文件夹和多页同名子文件夹；
9. 验证取消、损坏文件和无写入权限错误；
10. 复制机器码但不写入报告；
11. 输入测试激活码和导入测试 `license.mrx`；
12. 重启应用并确认授权仍有效。

- [ ] **Step 3：复查网络与隐私**

离线期间核心转换必须成功；恢复网络后检查应用没有上传用户文件。在线版运行浏览器网络专项：

```powershell
npm run check:privacy
npm run check:network
node scripts/run-pnpm.cjs --filter web run check:network:browser
```

- [ ] **Step 4：填写最终记分卡**

记分卡必须包含：真实样本、预期失败、发布门禁、Windows 10/11、下载 SHA256、批量输出、试用激活、控制台、隐私和代码签名状态。任一“必须完成”项失败时，结论只能是“未完成”。

- [ ] **Step 5：运行最终自动化并提交验收证据**

```powershell
npm run verify:release
git add -- verification/reliability-2026/windows-10-acceptance.md verification/reliability-2026/windows-11-acceptance.md verification/reliability-2026/final-scorecard.md docs/reports/archive/MANUAL_CLEAN_VM_TEST_GUIDE.md docs/operator-runbook.md
git commit -m "docs: record release acceptance"
```

预期：提交只包含脱敏文本和允许公开的截图引用，不包含虚拟机镜像、安装包、授权材料或用户文件。

---

## 最终完成条件

- [ ] Node 20 / pnpm 9.15.4 的 `npm run verify:release` 通过。
- [ ] 真实样本矩阵中的预期成功和预期失败全部通过。
- [ ] Word、Excel 关键真实转换测试没有跳过。
- [ ] Desktop 多文件平铺预览、独立结果文件夹和多页同名子文件夹保持不变。
- [ ] Web 与 Desktop 都没有用户文件外传。
- [ ] 两个巨型工作台已经移除任务状态、引擎选择、输出写入和错误归一化中的至少三个职责，没有视觉回退。
- [ ] 授权后台所有受保护接口同源校验通过，第 6 次失败登录返回 429。
- [ ] 下载、SmartScreen 说明、试用、机器码和离线激活连续走通。
- [ ] Windows 10 和 Windows 11 干净虚拟机验收通过。
- [ ] 代码签名状态有明确、真实、无秘密的决策记录。

## 计划自检

- 范围：所有任务均服务于可靠性、交付或主链路治理；没有新增转换工具、账号或云端处理。
- 隐私：夹具无敏感内容，日志和验收报告不记录用户文件、完整路径、机器码或授权材料。
- 顺序：先建立基线和契约，再迁移工作台，最后做发布与虚拟机验收。
- 回退：每个任务独立提交；组件采用逐职责迁移，没有大爆炸重写。
- 工作区：明确保留计划编写时已有的授权 API、测试和删除文件改动。
- 验证：每项实现都有命令、预期结果和提交边界；正式结论只允许来自 Node 20 与干净 Windows 环境。
