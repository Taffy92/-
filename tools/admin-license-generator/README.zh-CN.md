# 离线专业版生码器

这个目录只给管理员本地使用。私钥、客户记录、秘密配置和生成的 `.mrx` 均已被 Git 忽略，不得放进在线网站或客户安装包。

## 随时随地签发

生产后台地址：

```text
https://gszhmrx.cn/admin/license/
```

手机和电脑都可使用。登录后粘贴用户机器码，填写客户名称并选择期限，即可复制激活码、显示二维码或下载 `license.mrx`。历史记录支持搜索、续期和重新下载。

后台迁移到 EdgeOne 后，旧 CloudBase 环境不再是生产授权入口。已签发的离线授权仍由桌面端本地验签，不受后台迁移影响。

## 第一次生成密钥

双击 `keygen.cmd`，把输出的 raw public key 写入：

```text
apps/desktop/src-tauri/src/license.rs
```

对应常量为 `PUBLIC_KEY_RAW_B64`。私钥只留在管理员电脑。

## 生成 EdgeOne 秘密配置

运行：

```powershell
powershell -ExecutionPolicy Bypass -File tools\admin-license-generator\setup-edgeone-admin.ps1
```

密码输入不会显示。密码可以是 6 位纯数字，也可以使用其他非空密码；程序不做复杂度限制，也不会因连续输错而锁定。使用短密码意味着猜中风险更高，因此后台地址和密码只应由管理员掌握。

工具会检查本地私钥是否与桌面端公钥匹配，并在被忽略的目录生成四项 EdgeOne 环境变量：

```text
tools/admin-license-generator/.tmp/edgeone-admin-secrets.env
```

不要截图、转发或提交该文件。设置到 EdgeOne 后保留一份安全离线备份；记录加密密钥丢失后，历史记录和加密备份将无法解密。

## 本地应急签发

EdgeOne 暂时不可用时，双击 `generate-license.cmd`。按提示输入机器码、授权天数和客户名称，生成：

- 终端里的激活码；
- `out/license.mrx`；
- 本地 `license_records.json`。

本地工具和 EdgeOne 后台使用相同私钥及授权格式。

## SmartScreen 提示

Windows SmartScreen 与授权逻辑无关。要降低未签名安装包的提示，需要购买代码签名证书、配置 Tauri Windows 签名并使用时间戳服务重新打包。
