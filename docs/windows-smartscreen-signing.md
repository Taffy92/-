# Windows SmartScreen 与代码签名

Windows 安装包出现“Windows 已保护你的电脑”通常是因为安装包未签名，或签名证书/下载文件还没有足够的 SmartScreen 信誉。这个提示不能靠前端 UI、授权码逻辑或安装包文案彻底关闭。

可行处理方案：

- 购买 OV 或 EV 代码签名证书，EV 更适合商业软件首次发布。
- 在 Windows 打包机导入证书，配置 `apps/desktop/src-tauri/tauri.conf.json` 的 `certificateThumbprint` 和 `timestampUrl`。
- 对 EXE/MSI 使用同一个发行主体持续签名发布，积累 SmartScreen 信誉。
- 发布页保留 SHA256、版本号、公司/开发者信息、隐私说明和许可证说明，降低用户疑虑。

当前项目里 `certificateThumbprint` 仍为 `null`，所以本地打包出的安装包会继续有 SmartScreen 风险。没有真实证书前，不应填假的 thumbprint；否则会导致打包或签名失败。
