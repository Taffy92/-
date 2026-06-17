# 项目知识库与发布卫生审查（2026-06-14）

## 结论

- 根 README 与项目级 AGENTS 已补齐发布环境约束：Node 20 LTS 与 pnpm 9.15.4。
- 离线冒烟脚本已与当前桌面紧凑工作台 UI 对齐，静态浏览器冒烟只验证入队、无外联和输出目录保护，不再伪装真实 Tauri 落盘成功。
- 未发现安装包、`.mrx`、私钥、`.env`、`apps/web/out`、`target/` 等发布禁入物被 Git 跟踪。
- CloudBase 环境 ID 在 `package.json`、`apps/web/cloudbaserc.json` 与文档入口中保持一致。
- `apps/web/out` 已恢复为在线版产物，并保留 `download/` 与 `release/` 静态入口。

## 本轮审查范围

- 项目级 `AGENTS.md`、根 `README.md`、`docs/reports/README.md` 与主要发布/隐私/授权文档。
- 在线版与离线版边界：广告容器、文件不上云、离线批量输出、授权私钥与客户记录隔离。
- 发布卫生：安装包、授权文件、密钥、生成产物是否进入 Git 跟踪。
- 验证资产：`verification/offline-smoke/` 冒烟脚本与当前 UI 文案、选择器和静态测试职责是否一致。

## 已处理

- 将 Node 20 LTS 与 pnpm 9.15.4 写入项目级 AGENTS，方便后续代理和维护者遵守同一发布环境。
- 将相同运行时约束写入 README 的本地开发与发布步骤。
- 将本报告加入 `docs/reports/README.md` 的当前优先查看列表。

## 复核命令

- `npm test`
- `npm run build:web`
- `npm run check:privacy`
- `npm run check:network`
- `git ls-files` 禁入物模式扫描

## 仍需人工关注

- `THIRD_PARTY_NOTICES.md`、`docs/licenses.md` 和 `docs/third-party-notices.md` 内容重复，但分别承担根入口、站内页面和文档归档用途；后续如要压缩体积，应先梳理生成链路，避免发布页断链。
- 静态 smoke 无法替代干净 Windows 10/11 x64 机器上的真实 Tauri 安装、授权弹窗、输出目录写入和断网回归测试。
- 当前开发机若使用 Node 26 会出现 `engines` 警告；这是环境提示，不应作为正式发布环境。正式构建必须切回 Node 20 LTS。
