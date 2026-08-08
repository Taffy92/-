# Windows SmartScreen 与代码签名

Windows 安装包出现“Windows 已保护你的电脑”通常是因为安装包未签名，或签名证书/下载文件还没有足够的 SmartScreen 信誉。这个提示不能靠前端 UI、授权码逻辑或安装包文案彻底关闭。

可行处理方案：

- 购买 OV 或 EV 代码签名证书，EV 更适合商业软件首次发布。
- 在 Windows 打包机导入证书，配置 `apps/desktop/src-tauri/tauri.conf.json` 的 `certificateThumbprint` 和 `timestampUrl`。
- 对 MSI 使用同一个发行主体持续签名发布，积累 Windows 安装信任。
- 发布页保留 SHA256、版本号、公司/开发者信息、隐私说明和许可证说明，降低用户疑虑。

当前项目里 `certificateThumbprint` 仍为 `null`，所以本地打包出的安装包会继续有 SmartScreen 风险。没有真实证书前，不应填假的 thumbprint；否则会导致打包或签名失败。

## 当前决策（2026-08-09）

本轮检查未在 `CurrentUser\My` 或 `LocalMachine\My` 证书库发现同时具备代码签名用途和私钥的证书，正式 MSI 的 Authenticode 状态为 `NotSigned`。因此本版本继续采用未签名发布分支：

- 保持 `certificateThumbprint: null` 和空 `timestampUrl`；
- 下载页继续明确展示 SmartScreen 风险、版本和 ZIP SHA256；
- 不把证书、私钥、口令或签名材料写入仓库；
- 由项目发布负责人在 2026-09-09 或下一次公开发布前（以较早者为准）重新评估 OV/EV 证书采购与受保护签名机。

未签名发布仍可能触发 SmartScreen，且首次下载转化和用户信任会受影响。该风险已披露，但不等于安装包获得了 Windows 发行者身份验证。
