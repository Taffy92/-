# 线上站点与下载运维

本项目的公开网站和 Windows 试用安装包由腾讯云 EdgeOne Pages 分发。CloudBase 不再是公开下载主链路，只保留私有授权后台、下载口令备用云函数和过渡托管能力。

## 生产结构

- 正式域名：`https://gszhmrx.cn`、`https://www.gszhmrx.cn`
- EdgeOne 项目：`format-converter-web`
- 静态产物：`apps/web/out`
- 原始安装包：`release/v1.0.0/installers/`，只保存在本地发布归档并被 Git 忽略
- 下载清单：`/release/v1.0.0/edgeone/manifest.json`
- 安装包分片：`/release/v1.0.0/edgeone/{exe|msi}/part-*.bin`

浏览器从同源地址逐片下载，对每片执行 SHA256 校验，再直接写入用户选择的文件；不支持文件系统保存接口的浏览器会在本地内存中拼装后下载。安装包和用户处理文件都不会进入 Git。

## 构建与部署

发布环境固定为 Node 20 LTS 与 pnpm 9.15.4。

```powershell
npm test
npm run check:privacy
npm run check:network
npm run build:edgeone
npm run deploy:edgeone
```

`build:edgeone` 会：

1. 构建在线静态站；
2. 将 FFmpeg WASM 拆成 EdgeOne 可接受的分片；
3. 读取本地正式 EXE/MSI 并核对整包 SHA256；
4. 生成不超过 16 MiB 的同源安装包分片和清单；
5. 拒绝任何大于 25 MiB 的最终静态文件。

不要用 `build:web` 的产物直接覆盖正式 EdgeOne 站点，因为普通构建不包含安装包分片。

## 上线检查

部署后至少检查：

```text
https://gszhmrx.cn/
https://gszhmrx.cn/download/
https://gszhmrx.cn/release/v1.0.0/edgeone/manifest.json
https://gszhmrx.cn/release/v1.0.0/edgeone/exe/part-001.bin
https://www.gszhmrx.cn/
```

- 首页和下载页返回 HTTPS 200；
- 清单同时包含 EXE、MSI，分片数量和总大小正确；
- 抽查首尾分片可下载；
- 浏览器完整下载后的文件大小和 SHA256 与发布记录一致；
- 页面不再跳转 GitHub、CloudBase 对象存储或其他境外下载地址。

## 常见故障

下载按钮仍跳转 GitHub，通常表示访问到了旧部署或浏览器缓存。先强制刷新，再检查线上 HTML 是否来自最新 EdgeOne 部署。

下载停在某个分片时，检查该分片是否返回 200、文件大小是否与清单一致，并确认自定义域名 HTTPS 已部署。不要绕过分片校验。

根域名与 `www` 的 DNS 生效时间可能不同。EdgeOne 控制台显示域名已生效且 HTTPS 已部署后，再使用不同国内网络和公共 DNS 复测。

## CloudBase 保留边界

- `licenseAdmin`：管理员私有离线授权后台；
- `createDownloadUrl`：只有明确恢复口令下载时才启用；
- `deploy:cloudbase`：过渡或应急托管，不是正常生产发布命令。

CloudBase 环境停止续费不会影响 EdgeOne 网站和同源安装包下载，但会影响依赖该环境的私有授权后台和备用下载云函数。管理员应同时保留 `tools/admin-license-generator` 作为完全离线的授权备用方案。

任何授权私钥、后台密码、客户记录和生成的 `.mrx` 文件都不得进入前端、安装包或 Git。
