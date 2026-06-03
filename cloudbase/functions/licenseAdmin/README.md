# licenseAdmin

私有离线授权后台 HTTP 云函数。公开下载页负责让用户直接下载 3 天试用版；本函数只给管理员使用，用来按机器码签发离线激活码和 `license.mrx`。

## 环境变量

- `LICENSE_ADMIN_PASSWORD_SHA256`：管理员密码的 SHA256 十六进制摘要。
- `LICENSE_PRIVATE_KEY_PEM_B64`：Ed25519 私钥 PEM 的 Base64 编码。

不要把明文后台密码、私钥 PEM 或 Base64 私钥写进仓库。

## 访问方式

部署后打开：

```text
https://<envId>.service.tcloudbase.com/licenseAdmin
```

手机和电脑浏览器都可以访问。用户是否联网不影响授权：管理员生成的激活码和 `license.mrx` 会在桌面端本地验签。
