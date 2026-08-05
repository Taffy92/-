# EdgeOne 私有授权后台

私有授权后台只给管理员签发离线激活码和 `license.mrx`，不接收用户处理的图片、文档、音视频或转换结果。

## 访问地址

```text
https://gszhmrx.cn/admin/license/
```

手机和电脑浏览器都可以使用。页面不会被搜索引擎收录，接口与页面都禁止缓存，但管理员仍需保管好地址和密码。

## 日常流程

1. 用户在离线专业版复制 `XXXX-XXXX-XXXX-XXXX` 机器码。
2. 管理员登录后台，填写客户名称并粘贴机器码。
3. 选择 30、90、180、365 天或永久授权。
4. 生成后直接复制短激活码、展示二维码，或下载 `license.mrx` 发给用户。
5. 需要续期时在历史记录选择“续期”；未到期授权会保留剩余时间。
6. 用户输入激活码或导入 `license.mrx`，桌面端在本地完成验签。

用户电脑无需连接授权后台。后台日后停用也不会让已签发的授权失效。

## 首次安全配置

在管理员电脑运行：

```powershell
powershell -ExecutionPolicy Bypass -File tools\admin-license-generator\setup-edgeone-admin.ps1
```

输入内容不会显示。密码允许为 6 位纯数字，也允许其他非空内容；没有复杂度限制，也没有连续错误临时锁定。短密码更容易被猜中，因此不要向其他人公开后台地址或密码。

工具会把以下四项写入被 Git 忽略的本地文件：

```text
LICENSE_ADMIN_PASSWORD_SCRYPT
LICENSE_PRIVATE_KEY_PEM_B64
LICENSE_SESSION_SECRET_B64
LICENSE_RECORD_ENCRYPTION_KEY_B64
```

在唯一的 EdgeOne Pages 项目 `format-converter-web-upload` 的生产环境变量中逐项添加，然后从本地构建产物直接部署完整站点：

```powershell
npm run deploy:license-admin
```

不要在聊天、截图、构建日志或 Git 中保存实际值。`LICENSE_RECORD_ENCRYPTION_KEY_B64` 用于解密历史记录；丢失后无法恢复 Blob 中的历史记录或后台导出的加密备份。四项值变更时，密码、现有会话、解密能力或签名身份也会相应改变。

## 记录与备份

授权记录逐条使用 AES-256-GCM 加密后写入 EdgeOne Blob。列表只显示脱敏机器码。后台右上角可导出加密备份；备份本身不含私钥，但仍应按敏感数据妥善保存。

## 迁移边界

旧 CloudBase `licenseAdmin` 已隔离并保留为历史代码，不再作为生产授权入口。备用下载口令云函数也不在公开下载主链路中。本地 `tools/admin-license-generator/generate-license.cmd` 继续作为完全离线的应急签发方式。
