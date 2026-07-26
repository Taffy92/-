# EdgeOne 私有离线授权后台实施计划

> 实施时按任务顺序执行。每个任务先写失败测试，再做最小实现，验证通过后单独提交。不得把密码、私钥、客户记录或生成的 `.mrx` 提交到 Git。

**目标：** 在现有 EdgeOne Makers 项目中增加一个国内网络可访问、手机和电脑均可使用的私有离线授权后台，同时保持官网、安装包下载和桌面端授权协议不变。

**架构：** `apps/web` 继续静态导出官网和管理页面；`apps/web/cloud-functions` 提供 Node.js 20 Cloud Functions；`@edgeone/pages-blob` 保存逐条 AES-256-GCM 加密的授权记录；现有 Ed25519 私钥仅存在于 EdgeOne 服务端环境变量和本地备用生成器中。

**技术栈：** Next.js 15 静态导出、React 18、TypeScript、Node.js 20 `crypto`、EdgeOne Cloud Functions、`@edgeone/pages-blob`、Vitest、Playwright。

**设计规格：** `docs/superpowers/specs/2026-07-26-edgeone-license-admin-design.md`

---

## 文件结构

### 新增后台函数

```text
apps/web/cloud-functions/api/admin/license/
├── health.ts
├── session.ts
├── generate.ts
├── backup.ts
├── records/
│   ├── index.ts
│   └── [id]/
│       └── file.ts
└── _lib/
    ├── auth.ts
    ├── config.ts
    ├── http.ts
    ├── license.ts
    ├── machine-code.ts
    ├── record-crypto.ts
    ├── record-store.ts
    └── types.ts
```

`_lib` 文件不导出 EdgeOne Function Handler，因此只作为辅助模块，不形成公开路由。

### 新增管理页面

```text
apps/web/src/app/admin/license/
└── page.tsx

apps/web/src/components/license-admin/
├── LicenseAdminApp.tsx
├── LoginPanel.tsx
├── IssuePanel.tsx
├── LicenseResult.tsx
├── LicenseHistory.tsx
└── license-admin.module.css

apps/web/src/lib/license-admin/
├── client.ts
├── machine-code.ts
└── types.ts
```

### 新增测试

```text
apps/web/src/tests/edgeOneLicenseCore.test.ts
apps/web/src/tests/edgeOneLicenseAuth.test.ts
apps/web/src/tests/edgeOneLicenseRecords.test.ts
apps/web/src/tests/edgeOneLicenseApi.test.ts
apps/web/src/tests/edgeOneLicenseBuild.test.ts
apps/web/src/e2e/license-admin.spec.ts
```

### 新增本地配置工具

```text
tools/admin-license-generator/setup-edgeone-admin.ps1
tools/admin-license-generator/setup-edgeone-admin.mjs
```

生成的秘密值只写入已经被 `.gitignore` 排除的：

```text
tools/admin-license-generator/.tmp/edgeone-admin-secrets.env
```

---

## Task 1：建立桌面端兼容的授权核心

**文件：**

- Create: `apps/web/src/tests/edgeOneLicenseCore.test.ts`
- Create: `apps/web/cloud-functions/api/admin/license/_lib/types.ts`
- Create: `apps/web/cloud-functions/api/admin/license/_lib/machine-code.ts`
- Create: `apps/web/cloud-functions/api/admin/license/_lib/license.ts`

### Step 1：先写授权核心失败测试

测试必须覆盖：

- `test-test-test-test` 规范化为 `TEST-TEST-TEST-TEST`；
- 带空格、换行或连字符的 16 位机器码被重新格式化为四组四位；
- 出现 `I`、`O`、`0`、`1` 或长度错误时拒绝；
- 生成结果以 `UFC1-` 开头；
- `license.mrx` 使用 `ufc-license-v1` envelope；
- Ed25519 签名可以被对应公钥验证；
- `canonicalLicensePayload` 的字段名称和顺序与现有桌面端一致；
- 未到期续期从旧到期时间累加；
- 已到期续期从当前时间累加；
- 永久授权固定到 `2099-12-31 23:59:59`（Asia/Shanghai）。

运行：

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/edgeOneLicenseCore.test.ts
```

预期：因为实现文件尚不存在而失败。

### Step 2：实现纯授权函数

实现以下纯函数，不读取环境变量、不访问 Blob：

- `normalizeMachineCode`
- `canonicalLicensePayload`
- `calculateExpiresAt`
- `generateLicense`
- `verifyActivationRequest`

要求：

- 复用现有产品名、软件名、版本、默认功能和签名格式；
- 保留现有 `activation_request.mrx` HMAC 校验；
- 时间全部使用 Unix 秒；
- 不修改 `apps/desktop/src-tauri/src/license.rs`；
- 不把 CloudBase HTTP Server 代码复制进新核心。

### Step 3：运行核心测试

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/edgeOneLicenseCore.test.ts
```

预期：全部通过。

### Step 4：运行现有授权回归测试

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/licenseAdminFunction.test.ts src/tests/licenseBoundary.test.ts
```

预期：现有 CloudBase 备用代码和授权边界测试继续通过。

### Step 5：提交

```powershell
git add -- apps/web/cloud-functions/api/admin/license/_lib apps/web/src/tests/edgeOneLicenseCore.test.ts
git commit -m "feat: add EdgeOne license signing core"
```

---

## Task 2：实现密码会话与请求保护

**文件：**

- Create: `apps/web/src/tests/edgeOneLicenseAuth.test.ts`
- Create: `apps/web/cloud-functions/api/admin/license/_lib/config.ts`
- Create: `apps/web/cloud-functions/api/admin/license/_lib/auth.ts`
- Create: `apps/web/cloud-functions/api/admin/license/_lib/http.ts`

### Step 1：先写认证失败测试

测试必须覆盖：

- scrypt 摘要格式可以校验 6 位纯数字密码；
- 错误密码只得到统一错误，不透露配置情况；
- 连续多次错误不会触发锁定、等待或 429；
- 成功登录生成 8 小时会话；
- Cookie 包含 `HttpOnly`、`Secure`、`SameSite=Strict` 和 `Path=/api/admin/license`；
- Cookie 未过期且签名正确时通过；
- 篡改、过期或错误密钥的 Cookie 被拒绝；
- 状态改变请求的 `Origin` 必须与当前请求 origin 相同；
- 认证响应包含 `Cache-Control: no-store`。

运行：

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/edgeOneLicenseAuth.test.ts
```

预期：失败。

### Step 2：实现认证辅助模块

实现：

- Node.js `crypto.scrypt` 密码校验；
- HMAC-SHA256 签名的无状态会话；
- 8 小时过期时间；
- Cookie 解析、创建和清除；
- 同源检查；
- 统一 JSON、安全响应头和错误响应；
- 单次请求体上限 64 KiB。

明确不实现：

- 密码复杂度检查；
- 登录错误次数记录；
- 应用层限流、锁定或等待；
- 密码找回；
- 浏览器端密码保存。

环境变量在请求处理时读取，缺失时返回通用的“后台暂不可用”，测试不得依赖真实生产秘密值。

### Step 3：运行认证测试

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/edgeOneLicenseAuth.test.ts
```

预期：全部通过。

### Step 4：提交

```powershell
git add -- apps/web/cloud-functions/api/admin/license/_lib apps/web/src/tests/edgeOneLicenseAuth.test.ts
git commit -m "feat: add EdgeOne admin sessions"
```

---

## Task 3：实现授权记录加密与 Blob 存储

**文件：**

- Modify: `apps/web/package.json`
- Modify: `pnpm-lock.yaml`
- Create: `apps/web/src/tests/edgeOneLicenseRecords.test.ts`
- Create: `apps/web/cloud-functions/api/admin/license/_lib/record-crypto.ts`
- Create: `apps/web/cloud-functions/api/admin/license/_lib/record-store.ts`

### Step 1：安装官方 Blob SDK

使用 Node 20：

```powershell
node scripts/run-pnpm.cjs --filter web add @edgeone/pages-blob
```

预期：只修改 `apps/web/package.json` 和 `pnpm-lock.yaml`。

### Step 2：先写记录层失败测试

使用内存 Store 替身，不连接生产 Blob。测试覆盖：

- AES-256-GCM 加密后对象中不出现客户名称、完整机器码、`UFC1-` 或 `license.mrx` 明文；
- 使用正确密钥可以完整解密；
- 修改密文、IV 或认证标签会失败；
- `machine_lookup` 是密钥化 HMAC，而不是普通 SHA-256；
- 每条记录使用独立 key 和随机 IV；
- 写入使用 `onlyIfNew: true`，不覆盖旧记录；
- 新签、续期都追加记录；
- 同一机器从旧记录点击续期时，选择该机器最新到期时间；
- 按客户名称和完整机器码搜索；
- 列表对机器码脱敏；
- 文件重新下载可以还原原始 `license.mrx`；
- 加密备份不包含明文记录。

运行：

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/edgeOneLicenseRecords.test.ts
```

预期：失败。

### Step 3：实现逐记录存储

Store 名称固定为：

```text
license-admin-records
```

对象 key 固定为：

```text
records/v1/YYYY/MM/{record-id}.json
```

实现要求：

- 每条记录使用 AES-256-GCM；
- `machine_lookup` 使用从记录密钥派生的 HMAC-SHA256；
- 写入使用 `onlyIfNew: true`；
- 查找最近授权和写入后的读取使用强一致；
- 历史查询使用 Blob 的自动分页列出 `records/v1/` 下的全部对象；
- API 默认每页 20 条，最大 50 条；
- 服务端解密、筛选、排序后执行 API 分页，只向浏览器返回当前页面；
- 不实现删除或编辑历史记录；
- Blob 错误不得降级为未记录签发。

### Step 4：运行记录测试

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/edgeOneLicenseRecords.test.ts
```

预期：全部通过。

### Step 5：提交

```powershell
git add -- apps/web/package.json pnpm-lock.yaml apps/web/cloud-functions/api/admin/license/_lib apps/web/src/tests/edgeOneLicenseRecords.test.ts
git commit -m "feat: encrypt and store license history"
```

---

## Task 4：实现 EdgeOne 管理 API

**文件：**

- Create: `apps/web/src/tests/edgeOneLicenseApi.test.ts`
- Create: `apps/web/cloud-functions/api/admin/license/health.ts`
- Create: `apps/web/cloud-functions/api/admin/license/session.ts`
- Create: `apps/web/cloud-functions/api/admin/license/generate.ts`
- Create: `apps/web/cloud-functions/api/admin/license/backup.ts`
- Create: `apps/web/cloud-functions/api/admin/license/records/index.ts`
- Create: `apps/web/cloud-functions/api/admin/license/records/[id]/file.ts`

### Step 1：先写 API 失败测试

使用模拟请求、测试密钥和内存 Store，覆盖：

- `GET /health` 无需登录，只返回 `{ ok: true }`；
- `POST /session` 正确密码设置 Cookie；
- `POST /session` 错误密码返回 401；
- `DELETE /session` 清除 Cookie；
- 未认证不能查询、签发、下载或备份；
- 错误 Origin 不能签发；
- 空机器码、非法机器码、非法时长返回 400；
- 新签成功返回机器码、到期时间、激活码和 `license.mrx`；
- 续期成功保留剩余时间并写入 `parent_license_id`；
- Blob 写入失败时不返回授权码；
- 记录列表分页、搜索和状态字段正确；
- 文件接口只返回目标记录的 `license.mrx`；
- 备份接口只返回加密 envelope；
- 所有管理响应均为 `no-store`，错误不带堆栈或环境变量名。

运行：

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/edgeOneLicenseApi.test.ts
```

预期：失败。

### Step 2：实现薄路由

每个路由文件只负责：

- 选择 HTTP 方法；
- 读取和校验请求；
- 调用 `_lib`；
- 返回标准响应。

业务规则、签名、认证和记录加密不得重复写进路由文件。

`generate` 接口只接受：

```text
customerName
machineCode
duration
remark
parentRecordId（续期时）
```

`edition` 和 `features` 由服务端固定为现有默认值，不能由浏览器任意修改。

### Step 3：运行 API 测试

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/edgeOneLicenseApi.test.ts
```

预期：全部通过。

### Step 4：提交

```powershell
git add -- apps/web/cloud-functions/api/admin/license apps/web/src/tests/edgeOneLicenseApi.test.ts
git commit -m "feat: add EdgeOne license admin API"
```

---

## Task 5：实现简洁的手机优先管理界面

**文件：**

- Modify: `apps/web/package.json`
- Modify: `pnpm-lock.yaml`
- Create: `apps/web/src/app/admin/license/page.tsx`
- Create: `apps/web/src/components/license-admin/LicenseAdminApp.tsx`
- Create: `apps/web/src/components/license-admin/LoginPanel.tsx`
- Create: `apps/web/src/components/license-admin/IssuePanel.tsx`
- Create: `apps/web/src/components/license-admin/LicenseResult.tsx`
- Create: `apps/web/src/components/license-admin/LicenseHistory.tsx`
- Create: `apps/web/src/components/license-admin/license-admin.module.css`
- Create: `apps/web/src/lib/license-admin/client.ts`
- Create: `apps/web/src/lib/license-admin/machine-code.ts`
- Create: `apps/web/src/lib/license-admin/types.ts`
- Create: `apps/web/src/e2e/license-admin.spec.ts`

### Step 1：安装二维码依赖

```powershell
node scripts/run-pnpm.cjs --filter web add qrcode
node scripts/run-pnpm.cjs --filter web add -D @types/qrcode
```

预期：只修改 `apps/web/package.json` 和 `pnpm-lock.yaml`。

### Step 2：先写浏览器失败测试

Playwright 通过 `page.route` 模拟管理 API，不需要连接生产 Blob。覆盖桌面和手机宽度：

- 管理页包含 `noindex`；
- 页面没有官网主导航或广告容器；
- 登录页只有密码、进入按钮和简单状态；
- 6 位数字密码可以提交；
- 错误密码显示统一错误；
- 登录后显示客户、机器码、五个时长选项和备注；
- 粘贴带空格的机器码会显示为 `XXXX-XXXX-XXXX-XXXX`；
- 生成期间按钮禁用；
- 结果卡片优先显示复制、二维码和 `.mrx` 下载；
- 完整长授权码默认折叠；
- 历史可以搜索、展开详情和点击续期；
- 会话过期后显示登录页；
- 375px 宽度没有横向滚动；
- 键盘焦点、表单标签和状态提示可识别。

运行：

```powershell
node scripts/run-pnpm.cjs --filter web exec playwright test src/e2e/license-admin.spec.ts
```

预期：页面尚不存在，测试失败。

### Step 3：实现静态页面

页面要求：

- `page.tsx` 保持可静态导出；
- Metadata 设置 `robots: { index: false, follow: false }`；
- 不加入 `siteConfig.links`、官网导航或 sitemap；
- 主界面由一个 Client Component 管理；
- 不把密码写入 storage；
- API 客户端始终使用 `credentials: "same-origin"`；
- 复制、二维码和下载均基于服务端返回结果；
- 下载使用内存 Blob，仅保存管理员主动点击的 `license.mrx`；
- 退出后清理页面内的授权结果和历史数据。

视觉要求：

- 手机优先单列；
- 大尺寸机器码输入框；
- 主要操作不超过一屏内的必要层级；
- 技术信息、环境变量、私钥状态和调试信息不出现在页面；
- 使用现有品牌色和字体，但不复用公开工具页的广告或复杂工具导航。

### Step 4：构建并运行浏览器测试

```powershell
npm run build:web
node scripts/run-pnpm.cjs --filter web exec playwright test src/e2e/license-admin.spec.ts
```

预期：静态页面生成，桌面和手机测试全部通过。

### Step 5：提交

```powershell
git add -- apps/web/package.json pnpm-lock.yaml apps/web/src/app/admin/license apps/web/src/components/license-admin apps/web/src/lib/license-admin apps/web/src/e2e/license-admin.spec.ts
git commit -m "feat: add private license admin page"
```

---

## Task 6：把 Cloud Functions 纳入 EdgeOne 部署产物

**文件：**

- Modify: `apps/web/scripts/build-edgeone.mjs`
- Modify: `apps/web/edgeone.json`
- Create: `apps/web/src/tests/edgeOneLicenseBuild.test.ts`

### Step 1：先写构建产物失败测试

测试构建脚本的输出规则：

- `apps/web/out/admin/license/index.html` 存在；
- `apps/web/out/cloud-functions/api/admin/license` 存在；
- `apps/web/out/package.json` 只包含函数运行所需的公开依赖；
- 输出依赖包含 `@edgeone/pages-blob`；
- `out` 中不存在私钥 PEM、管理员密码值、客户记录文件或 `.mrx`；
- 函数源码中可以出现环境变量名称和 `UFC1-` 协议常量，但静态页面中不能出现实际秘密值或测试授权码；
- `edgeone.json` 中 Cloud Functions 中国大陆地域为 `ap-guangzhou`；
- 现有安装包分片和 25 MiB 单文件限制仍生效。

运行：

```powershell
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/edgeOneLicenseBuild.test.ts
```

预期：函数尚未被复制到 `out`，测试失败。

### Step 2：修改 EdgeOne 构建脚本

在现有 Next.js 构建、WASM 分片和安装包分片完成后：

1. 递归复制 `apps/web/cloud-functions` 到 `apps/web/out/cloud-functions`；
2. 从 `apps/web/package.json` 读取函数需要的依赖版本；
3. 在 `out/package.json` 写入最小 ESM 清单，只保留 `@edgeone/pages-blob`；
4. 复制更新后的 `edgeone.json`；
5. 对完整输出继续执行单文件 25 MiB 检查；
6. 扫描并拒绝私钥 PEM、秘密环境变量值、`license_records.json` 和 `.mrx`。

不要把整个 `apps/web/package.json` 原样复制到 `out`，避免 EdgeOne 安装不需要的工作区依赖。

### Step 3：配置函数地域

在 `apps/web/edgeone.json` 增加：

```json
{
  "mainlandRegions": ["ap-guangzhou"]
}
```

保留现有 headers 和静态缓存规则。对 `/admin/license/*` 与 `/api/admin/license/*` 增加 `Cache-Control: no-store`；不要影响 `_next/static`、FFmpeg 和安装包分片的长期缓存。

### Step 4：运行 EdgeOne 构建和测试

使用 Node 20：

```powershell
npm run build:edgeone
node scripts/run-pnpm.cjs --filter web exec vitest run src/tests/edgeOneLicenseBuild.test.ts
```

预期：构建成功，所有产物断言通过，且没有超过 25 MiB 的文件。

### Step 5：提交

```powershell
git add -- apps/web/scripts/build-edgeone.mjs apps/web/edgeone.json apps/web/src/tests/edgeOneLicenseBuild.test.ts
git commit -m "build: package EdgeOne license functions"
```

---

## Task 7：增加本地秘密配置工具并更新运维文档

**文件：**

- Create: `tools/admin-license-generator/setup-edgeone-admin.ps1`
- Create: `tools/admin-license-generator/setup-edgeone-admin.mjs`
- Modify: `tools/admin-license-generator/README.zh-CN.md`
- Modify: `tools/admin-license-generator/README.md`
- Modify: `docs/license-admin-backend.md`
- Modify: `docs/operator-runbook.md`
- Modify: `docs/offline-license.md`
- Modify: `README.md`
- Modify: `AGENTS.md`
- Modify: `package.json`

### Step 1：实现本地配置工具

PowerShell 入口要求：

- 使用隐藏输入读取管理员密码；
- 允许 6 位纯数字，不做复杂度检查；
- 只在进程内短暂转为明文；
- 调用 Node.js 20 生成 scrypt 摘要；
- 从现有忽略目录读取 Ed25519 私钥；
- 生成随机 32 字节会话密钥和记录加密密钥；
- 写入 `tools/admin-license-generator/.tmp/edgeone-admin-secrets.env`；
- 结束时清除临时环境变量；
- 不把实际秘密打印到普通日志。

Node.js 工具生成：

```text
LICENSE_ADMIN_PASSWORD_SCRYPT
LICENSE_PRIVATE_KEY_PEM_B64
LICENSE_SESSION_SECRET_B64
LICENSE_RECORD_ENCRYPTION_KEY_B64
```

输出文件必须继续被 `.gitignore` 排除。

### Step 2：验证配置工具

使用测试密码在本地运行：

```powershell
powershell -ExecutionPolicy Bypass -File tools\admin-license-generator\setup-edgeone-admin.ps1
```

预期：

- 忽略目录中出现四项配置；
- `git status --short` 不显示秘密文件；
- 私钥对应公钥仍与桌面端内置公钥一致；
- 删除测试生成的临时配置后，可重新生成。

不要把测试密码或配置内容复制到提交信息、测试快照或聊天记录。

### Step 3：更新文档和脚本

文档明确：

- 新生产后台地址；
- EdgeOne 控制台中四项环境变量的安全配置步骤；
- 6 位数字密码和无锁定的已知风险；
- 记录加密密钥丢失后的影响；
- 新签、续期、二维码、复制和 `.mrx` 操作流程；
- CloudBase 环境已经隔离，不再作为生产后台；
- 本地生成器继续作为应急方案；
- 旧授权不受迁移影响。

根 `package.json`：

- 保留 `deploy:edgeone`；
- 把 `deploy:license-admin` 改为先构建并部署完整 EdgeOne 站点；
- 不再让该脚本调用 CloudBase。

### Step 4：运行文档和边界检查

```powershell
npm run check:privacy
npm run check:network
git diff --check
```

预期：全部通过，文档中不存在真实秘密值。

### Step 5：提交

```powershell
git add -- tools/admin-license-generator/setup-edgeone-admin.ps1 tools/admin-license-generator/setup-edgeone-admin.mjs tools/admin-license-generator/README.zh-CN.md tools/admin-license-generator/README.md docs/license-admin-backend.md docs/operator-runbook.md docs/offline-license.md README.md AGENTS.md package.json
git commit -m "docs: migrate license operations to EdgeOne"
```

---

## Task 8：完整验证、预览部署和生产部署

**文件：**

- Modify only if verification exposes an in-scope defect: files introduced in Tasks 1–7
- Do not commit: EdgeOne environment values, customer records, test `.mrx`, installers

### Step 1：确认发布环境

```powershell
node --version
node scripts/run-pnpm.cjs --version
git status --short
```

预期：

- Node 为 `v20.x`；
- pnpm 为 `9.15.4`；
- 工作区只包含本次尚未提交的预期更改。

### Step 2：运行全部自动验证

```powershell
npm test
npm run check:privacy
npm run check:network
npm run build:edgeone
```

然后运行静态浏览器测试：

```powershell
node scripts/run-pnpm.cjs --filter web run check:network:browser
```

预期：

- 全部测试通过；
- EdgeOne 构建成功；
- 官网转换和下载测试不回退；
- 管理页手机和桌面测试通过；
- 输出扫描没有秘密值。

### Step 3：本地检查部署产物

检查：

```powershell
Get-ChildItem apps\web\out\cloud-functions -Recurse -File
Get-Content -Raw apps\web\out\package.json
rg -n "BEGIN PRIVATE KEY|BEGIN ENCRYPTED PRIVATE KEY" apps\web\out
Get-ChildItem apps\web\out -Recurse -File -Include *.mrx,license_records.json
```

预期：

- 函数文件和最小依赖清单存在；
- 私钥和禁止文件扫描无结果；
- `apps/web/out/admin/license/index.html` 中没有密码值或测试授权码。

### Step 4：安全配置 EdgeOne 环境

1. 在本机运行 `setup-edgeone-admin.ps1`；
2. 管理员在本机终端输入最终密码，不在聊天中发送密码；
3. 通过 EdgeOne Makers 控制台把四项秘密值先设置到 preview；
4. 确认环境变量只对服务端函数可见；
5. 保留本地临时配置，直至 preview 和 production 都完成配置；记录加密密钥另做独立离线备份。

这是实施中唯一需要管理员直接接触秘密值的步骤。

### Step 5：部署预览环境

```powershell
edgeone makers deploy apps/web/out -n format-converter-web -e preview
```

预期：部署成功并返回预览地址。

在预览环境验证：

- `/admin/license/` 可打开；
- `/api/admin/license/health` 返回可用；
- 正确密码登录成功；
- 错误密码不会锁定；
- 生成测试授权、复制、二维码和 `.mrx` 下载正常；
- 测试授权可以被现有桌面端公钥验证；
- 历史刷新后仍存在；
- 续期保留剩余时间；
- 加密备份不含明文。

### Step 6：配置并部署生产环境

预览验证全部通过后：

1. 通过 EdgeOne Makers 控制台把同一组四项秘密值设置到 production；
2. 确认变量只对服务端函数可见；
3. 部署生产环境：

```powershell
edgeone makers deploy apps/web/out -n format-converter-web -e production
```

预期：生产部署成功。确认生产后台正常后，删除本地 `.tmp/edgeone-admin-secrets.env`，保留记录加密密钥的独立离线备份。

### Step 7：生产验收

验证：

```text
https://gszhmrx.cn/
https://gszhmrx.cn/download/
https://gszhmrx.cn/admin/license/
https://gszhmrx.cn/api/admin/license/health
```

检查：

- 国内网络下首页、下载页和管理后台正常；
- `gszhmrx.cn` 与 `www.gszhmrx.cn` HTTPS 正常；
- EXE/MSI 分片下载仍可完成并通过 SHA-256；
- 管理后台不在导航和 sitemap；
- 真实桌面端导入测试授权成功；
- 用户文件没有上传请求；
- EdgeOne 日志不包含密码、完整机器码或授权码。

### Step 8：最终提交与推送

如果生产验证只产生本次范围内的修正：

1. 使用 `git status --short` 列出修改；
2. 逐个使用明确路径执行 `git add -- 路径`，不使用目录通配符；
3. 执行 `git diff --cached --check`；
4. 提交：

```powershell
git commit -m "fix: complete EdgeOne license admin rollout"
```

确认工作区干净后：

```powershell
git push origin fix/round-1-release-hardening
```

预期：远程分支包含设计、计划、实现、测试和运维文档，秘密文件始终未进入 Git。

---

## 实施完成判定

以下条件必须同时成立：

- EdgeOne 生产后台在国内网络可访问；
- 6 位纯数字密码可登录且不会触发应用层锁定；
- 手机和电脑均可签发、复制、显示二维码和下载 `.mrx`；
- 新授权可以被当前桌面端验证；
- 未到期续期保留剩余时间；
- 历史记录逐条加密保存、可查询、可续期、可重新下载、可导出加密备份；
- 私钥、密码、客户记录和 `.mrx` 不在 Git、静态站或安装包中；
- 官网转换、隐私边界和安装包下载没有回归；
- CloudBase 停用不影响新后台；
- 本地生成器仍能独立应急；
- 生产部署完成后工作区干净并已推送。

## 官方实现依据

- [EdgeOne Cloud Functions 文件路由和 Node.js Handler](https://cloud.tencent.com/document/product/1552/127419)
- [EdgeOne Cloud Functions Node.js 20 与中国大陆地域](https://cloud.tencent.com/document/product/1552/127418)
- [EdgeOne Blob SDK、强一致读取、分页和 onlyIfNew](https://cloud.tencent.com/document/product/1552/131425)
- [EdgeOne CLI 手动部署产物要求](https://cloud.tencent.com/document/product/1552/127423)
- [EdgeOne edgeone.json 配置](https://cloud.tencent.com/document/product/1552/127389)
