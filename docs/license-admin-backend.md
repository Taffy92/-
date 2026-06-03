# 私有授权后台说明

公开下载页采用“直接下载 3 天试用版，试用结束后激活”的模式。私有授权后台只给管理员使用，用来签发离线激活码和 `license.mrx`。

## 访问方式

部署后打开：

```text
https://format-converter-prod-x-d71bce41.service.tcloudbase.com/licenseAdmin
```

手机和电脑浏览器都可以访问。后台页面需要管理员密码，密码本身不写入仓库，云函数只保存 SHA256 摘要。

## 授权流程

1. 用户在离线专业版里复制机器码，或导出 `activation_request.mrx`。
2. 管理员打开私有授权后台，输入机器码或粘贴请求文件内容。
3. 管理员选择授权天数并生成授权。
4. 后台返回激活码和 `license.mrx`。
5. 用户在软件里输入激活码，或导入 `license.mrx`。

用户电脑有无互联网都可以完成授权，因为桌面端只校验本地签名，不调用云端授权接口。

## 云函数环境变量

```text
LICENSE_ADMIN_PASSWORD_SHA256=<管理员密码 sha256>
LICENSE_PRIVATE_KEY_PEM_B64=<Ed25519 私钥 PEM 的 Base64>
```

私钥必须与 `apps/desktop/src-tauri/src/license.rs` 中的 `PUBLIC_KEY_RAW_B64` 对应。不要把私钥、后台密码、授权记录或生成的 `.mrx` 文件提交到 Git。

## 本地备用

如果 CloudBase 后台暂时不可用，可以继续使用：

```text
tools/admin-license-generator/generate-license.cmd
```

本地生码器和云端后台生成的授权格式相同。
