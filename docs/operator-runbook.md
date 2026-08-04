# 线上站点、下载与授权后台运维

公开网站、Windows 试用安装包和私有授权后台均由腾讯云 EdgeOne Pages 承载。CloudBase 不再是生产主链路，只保留历史代码、备用下载口令云函数和应急静态托管配置。

## 生产结构

- 正式域名：`https://gszhmrx.cn`、`https://www.gszhmrx.cn`
- EdgeOne 项目：`format-converter-web`
- 授权后台：`https://gszhmrx.cn/admin/license/`
- 静态与函数产物：`apps/web/out`
- 原始安装包：`release/v2.0.0/installers/`，仅保存在本地并被 Git 忽略
- 下载清单：`/release/v2.0.0/edgeone-v24/manifest.json`
- 安装包分片：`/release/v2.0.0/edgeone-v24/{exe|msi}/part-*.bin`

浏览器从同源地址逐片下载并校验 SHA256。用户处理文件始终留在本机，不会进入 EdgeOne 函数或 Blob。

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
2. 拆分 FFmpeg WASM；
3. 核对本地正式 EXE/MSI 的 SHA256；
4. 生成不超过 24 MiB 的同源安装包分片和清单；GitHub 关联构建无法读取本地安装包时，不复用旧分片布局，改为重新拉取已校验的发布资产；
5. 把 `cloud-functions` 与最小运行依赖纳入产物；
6. 拒绝大于 25 MiB 的文件，以及私钥、客户记录或 `.mrx`。

不要用 `build:web` 的产物覆盖正式 EdgeOne 站点，因为普通构建不包含安装包分片和生产函数部署内容。

## 授权后台秘密配置

先在管理员电脑运行：

```powershell
powershell -ExecutionPolicy Bypass -File tools\admin-license-generator\setup-edgeone-admin.ps1
```

把生成文件中的四项值逐项设置到 EdgeOne 项目 `format-converter-web` 的生产环境变量，设置完立即关闭文件，不在日志或聊天中粘贴。记录加密密钥必须安全离线备份；丢失后历史授权记录无法解密。

后台密码允许 6 位纯数字，程序不做复杂度限制，也不因连续错误锁定。此选择适合单管理员使用，但必须避免把地址和密码告知他人。

## 上线检查

部署后至少检查：

```text
https://gszhmrx.cn/
https://gszhmrx.cn/download/
https://gszhmrx.cn/admin/license/
https://gszhmrx.cn/api/admin/license/health
https://gszhmrx.cn/release/v2.0.0/edgeone-v24/manifest.json
https://gszhmrx.cn/release/v2.0.0/edgeone-v24/exe/part-001.bin
https://www.gszhmrx.cn/
```

- 首页、下载页、后台登录页与健康检查返回 HTTPS 200；
- 错误密码不登录，正确密码可进入且不会触发应用层锁定；
- 可生成测试授权、复制激活码、展示二维码、下载 `.mrx`；
- 历史记录可搜索、续期和重新下载，备份下载为加密内容；
- 清单同时包含 EXE、MSI，首尾分片可下载；
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
