# 离线专业版生码器

这个目录只给管理员本地使用，不要放进在线网站、客户安装包或公开仓库。

手机或远程办公优先使用 `cloudbase/functions/licenseAdmin` 私有授权后台；本地生码器作为后台不可用时的备用工具。两者生成的激活码和 `license.mrx` 格式相同。

## 第一次使用

双击：

```text
keygen.cmd
```

命令会生成 `keys/private_key.pem`，并打印 raw public key。正式发布前，把 raw public key 写入：

```text
apps/desktop/src-tauri/src/license.rs
```

对应常量：

```text
PUBLIC_KEY_RAW_B64
```

私钥只留在管理员电脑。

## 给用户生成激活码

让用户在软件锁定页复制机器码，或导出 `activation_request.mrx`。最简单流程是双击：

```text
generate-license.cmd
```

按提示输入机器码、授权天数和客户名称。生成结果包括：

- 终端里显示的激活码。
- `out/license.mrx` 授权文件。
- 本地 `license_records.json` 客户记录。

这些本地文件已经被 `.gitignore` 排除。

## SmartScreen 提示

图 5 的 Windows SmartScreen 不是授权逻辑导致，而是安装包未签名或签名信誉不足。要尽量消除，需要购买代码签名证书，配置 Tauri Windows 签名，并使用时间戳服务重新打包。EV 代码签名证书通常更容易降低首次下载拦截概率。
