# 离线专业版商业授权

离线专业版采用本地 3 天试用和离线激活机制。授权只用于控制 Tauri 桌面端继续使用，不改变在线版 UI，不新增登录、注册、会员系统或云端转换 API。

## 授权边界

- 首次运行会在本机生成 3 天试用记录。
- 试用结束后，桌面端锁定工作台，用户需要输入激活码或导入 `license.mrx`。
- 授权绑定当前机器码，桌面端只内置 Ed25519 公钥，用于验证管理员签发的授权签名。
- 用户文件、Canvas、Blob、ArrayBuffer 和转换结果仍然只在本机处理，不因授权机制上传到第三方服务。
- 在线版保持原有界面和广告策略；离线版不渲染在线广告容器，也不强制联网加载广告。

## 管理员本地签发

管理员工具位于 `tools/admin-license-generator`，只在本地使用。

首次生成密钥：

```powershell
node tools/admin-license-generator/keygen.mjs
```

把命令输出的 raw public key 写入 `apps/desktop/src-tauri/src/license.rs` 的 `PUBLIC_KEY_RAW_B64`。私钥保留在管理员机器，不进入安装包、在线站点或公开仓库。

按机器码签发授权：

```powershell
node tools/admin-license-generator/main.mjs --machine XXXX-XXXX-XXXX-XXXX --days 365 --customer "客户名称"
```

也可以让用户在锁定页导出 `activation_request.mrx`，管理员再用请求文件签发：

```powershell
node tools/admin-license-generator/main.mjs --request activation_request.mrx --days 365 --customer "客户名称"
```

输出包括终端里的激活码、`tools/admin-license-generator/out/license.mrx` 和本地 `license_records.json`。这些文件已在 `.gitignore` 中排除。

## 私有授权后台

`cloudbase/functions/licenseAdmin` 是管理员手机可用的私有授权后台。它和本地生码器使用同一套授权格式：

- 输入用户机器码，或粘贴 `activation_request.mrx` 内容。
- 生成 `UFC1-` 激活码和 `license.mrx` 授权文件。
- 用户电脑有互联网时，可复制激活码给用户；用户电脑无互联网时，也可通过电话、微信或 U 盘传递激活码/授权文件。
- 桌面端只用内置公钥本地验签，不依赖后台在线可用性。

后台私钥通过 CloudBase 函数环境变量 `LICENSE_PRIVATE_KEY_PEM_B64` 注入，管理员密码只保存 SHA256 到 `LICENSE_ADMIN_PASSWORD_SHA256`。不要把这些值写入代码、在线前端、客户安装包或 Git。

## 发布前检查

正式发布前需要完成：

- 生成生产密钥对，替换桌面端公钥，确认开发测试公钥不用于正式安装包。
- 确认 `tools/admin-license-generator/keys/`、`license_records.json`、`tools/admin-license-generator/out/` 和 `.mrx` 授权文件没有进入客户包。
- 确认 `licenseAdmin` 云函数使用的私钥和桌面端生产公钥匹配。
- 运行 `npm test`、`cargo check`、`cargo test`、`npm run build:web`。
- 如执行过 `npm run package:desktop`，正式部署在线站点前必须重新运行 `npm run build:web`，确保 `apps/web/out` 是在线版产物。

## 已知限制

纯离线授权无法阻止有逆向能力的人修改本地程序，只能提高普通复制和随意转发的门槛。当前版本的私有后台只负责签发离线授权，不做联网校验、黑名单同步或自动续费；这些能力如果以后要做，仍不得引入云端文件转换或上传用户文件。
