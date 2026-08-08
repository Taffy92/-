# 线上站点、下载与授权后台运维

公开网站、Windows 试用安装包和私有授权后台均由腾讯云 EdgeOne Pages 承载。CloudBase 不再是生产主链路，只保留历史代码、备用下载口令云函数和应急静态托管配置。

## 生产结构

- 正式域名：`https://gszhmrx.cn`、`https://www.gszhmrx.cn`
- EdgeOne 项目：`format-converter-web-upload`（唯一正式项目，直接上传）
- 授权后台：`https://gszhmrx.cn/admin/license/`
- 静态与函数产物：`apps/web/out`
- 原始安装包：`release/v2.0.0/installers/`，仅保存在本地并被 Git 忽略
- 下载清单：`/release/v2.0.0/edgeone-v24/manifest.json`
- 安装包分片：`/release/v2.0.0/edgeone-v24/zip/part-*.bin`

浏览器从 `gszhmrx.cn` 与 `www.gszhmrx.cn` 两个自有 EdgeOne 域名并行下载分片并校验 SHA256。用户处理文件始终留在本机，不会进入 EdgeOne 函数或 Blob。

## 构建与部署

发布环境固定为 Node 20 LTS 与 pnpm 9.15.4。

正式发布前先运行统一门禁：

```powershell
npm run verify:release
```

该命令按固定顺序执行工具链、完整测试、隐私与网络、Cargo check/test、真实 Office 转换、EdgeOne 构建、安装包/ZIP/分片/版本/SHA256、秘密泄漏和关键测试 skip 检查。任一阶段失败都会输出阶段、命令和退出码并停止。它不会部署、删除发布产物或修改版本号；只有全部通过后，管理员才单独执行部署命令。

需要分项排查时可运行：

```powershell
npm run verify:toolchain
npm test
npm run check:privacy
npm run check:network
npm run build:edgeone
npm run deploy:edgeone
```

`build:edgeone` 会：

1. 构建在线静态站；
2. 拆分 FFmpeg WASM；
3. 核对本地正式 ZIP 的 SHA256，并检查 ZIP 内只有 MSI；
4. 从本地正式安装包生成不超过 24 MiB 的同源分片和清单；
5. 把 `cloud-functions` 与最小运行依赖纳入产物；
6. 从根目录 `edgeone.json` 生成不含构建命令和输出目录的直传配置到 `apps/web/out`，供直接上传部署读取响应头和函数配置；
7. 拒绝大于 25 MiB 的文件，以及私钥、客户记录或 `.mrx`。

不要用 `build:web` 的产物覆盖正式 EdgeOne 站点，因为普通构建不包含安装包分片和生产函数部署内容。

## 授权后台秘密配置

先在管理员电脑运行：

```powershell
powershell -ExecutionPolicy Bypass -File tools\admin-license-generator\setup-edgeone-admin.ps1
```

把生成文件中的四项值逐项设置到 EdgeOne 项目 `format-converter-web-upload` 的生产环境变量，设置完立即关闭文件，不在日志或聊天中粘贴。记录加密密钥必须安全离线备份；丢失后历史授权记录无法解密。

后台密码允许 6 位纯数字，程序不做复杂度限制。生产环境必须依靠 EdgeOne 域名级 Web 防护限制登录尝试，不能在单个函数进程内使用内存计数器代替分布式限流。

### 授权后台登录限流

在 `gszhmrx.cn` 和 `www.gszhmrx.cn` 的域名级 Web 防护中创建相同规则：

```text
请求方法 = POST
请求路径 = /api/admin/license/session
统计维度 = 客户端 IP
计数周期 = 15 分钟
速率阈值 = 5 次
处置持续时间 = 15 分钟
处置 = 自定义响应 HTTP 429
```

发布验收必须从同一测试网络确认前 5 次错误登录返回 401、第 6 次返回 429，窗口结束后恢复，并从另一网络确认互不影响。报告只记录时间、状态码和 EdgeOne 规则 ID，不记录密码、Cookie 或完整 IP。当前验证状态见 `verification/reliability-2026/edgeone-admin-rate-limit.md`；该报告未通过时不得声称登录防暴力措施完成。

## 上线检查

部署后至少检查：

```text
https://gszhmrx.cn/
https://gszhmrx.cn/download/
https://gszhmrx.cn/admin/license/
https://gszhmrx.cn/api/admin/license/health
https://gszhmrx.cn/release/v2.0.0/edgeone-v24/manifest.json
https://gszhmrx.cn/release/v2.0.0/edgeone-v24/zip/part-001.bin
https://www.gszhmrx.cn/
```

- 首页、下载页、后台登录页与健康检查返回 HTTPS 200；
- 错误密码不登录，正确密码可进入；同一 IP 第 6 次错误登录由 EdgeOne 返回 429；
- 可生成测试授权、复制激活码、展示二维码、下载 `.mrx`；
- 历史记录可搜索、续期和重新下载，备份下载为加密内容；
- 清单只包含 ZIP，首尾分片可下载；
- 完整下载后的文件大小和 SHA256 与发布记录一致；
- 页面不跳转 GitHub、CloudBase 对象存储或其他境外下载地址。

测试授权完成后不要把机器码、授权码或 `.mrx` 留在公开记录、截图和 Git 中。

## 常见故障

下载按钮仍跳转 GitHub，通常表示访问到了旧部署或浏览器缓存。先强制刷新，再确认线上 HTML 来自最新 EdgeOne 部署。

下载停在某个分片时，检查该分片是否返回 200、大小是否与清单一致，并确认自定义域名 HTTPS 已部署。

后台提示“尚未完成安全配置”时，检查 EdgeOne 生产环境是否完整设置四项环境变量，并重新执行生产部署。登录后看不到旧历史时，优先确认记录加密密钥没有被更换。

根域名与 `www` 的 DNS 和 HTTPS 生效时间可能不同。EdgeOne 控制台显示已生效后，再用不同国内网络复测。

## CloudBase 保留边界

- 旧 `licenseAdmin`：只保留历史实现，不再部署为生产后台；
- `createDownloadUrl`：只有明确恢复口令下载时才启用；
- `deploy:cloudbase`：过渡或应急托管，不是正常发布命令。

CloudBase 停止续费不会影响 EdgeOne 网站、同源安装包下载或新的 EdgeOne 授权后台。管理员仍应保留本地生码器，作为完全离线的应急方案。

任何授权私钥、后台密码、客户记录、秘密配置和生成的 `.mrx` 都不得进入前端、安装包或 Git。
