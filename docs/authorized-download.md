# 离线安装版统一下载口令备用方案

当前公开下载页已改为“直接下载 3 天试用版，试用结束后激活”。本文件只作为备用内部分发方案保留；除非明确恢复口令下载，不应把它作为公开下载页主流程。

在线版当前通过 EdgeOne 同源静态分片分发 3 天试用安装包，浏览器逐片校验并在本地拼装。以下 CloudBase 方案仅在需要临时收紧下载渠道时启用：

```text
CloudBase 私有云存储安装包 + 统一下载口令 + 云函数临时下载链接
```

备用方案不需要给每个用户新增数据库授权码，只维护一个下载口令即可。正式授权仍由 EdgeOne 私有授权后台或本地生码器签发离线激活码。

## 备用环境信息

- CloudBase 环境：`format-converter-prod-x-d71bce41`
- 下载页：`https://gszhmrx.cn/download/`
- 云函数：`createDownloadUrl`
- 云函数地址：`https://format-converter-prod-x-d71bce41.service.tcloudbase.com/createDownloadUrl`
- 私有安装包 fileID：

```text
cloud://<你的环境资源路径>/installers/v1.0.0/万能格式转换离线专业版_1.0.0_x64-setup.exe
```

## 用户下载流程

1. 用户打开下载页。
2. 用户输入你提供的下载口令。
3. 网站把口令提交给 `createDownloadUrl` 云函数。
4. 云函数与环境变量 `DOWNLOAD_PASSWORD` 比对。
5. 口令正确后，云函数生成一个短时有效的安装包下载链接。
6. 用户下载 EXE 后，可以复制到 U 盘，在无网络电脑上安装和使用。

## 如何设置或修改下载口令

在 CloudBase 控制台中：

1. 进入环境 `format-converter-prod-x-d71bce41`。
2. 打开“云函数”。
3. 找到 `createDownloadUrl`。
4. 进入“函数配置”或“环境变量”。
5. 修改环境变量：

```text
DOWNLOAD_PASSWORD=你的新下载口令
```

6. 保存配置。
7. 重新部署或等待配置生效。
8. 把新口令发给允许下载的用户。

建议口令不要太简单，可以使用类似：

```text
你的品牌-年份-随机字符
OFFLINE-2026-随机字符
```

## 云函数需要的环境变量

```env
DOWNLOAD_PASSWORD=你的下载口令
LOG_COLLECTION=download_authorization_logs
DOWNLOAD_URL_MAX_AGE=600
INSTALLER_FILE_ID=cloud://<你的环境资源路径>/installers/v1.0.0/万能格式转换离线专业版_1.0.0_x64-setup.exe
INSTALLER_EXE_FILE_ID=cloud://<你的环境资源路径>/installers/v1.0.0/万能格式转换离线专业版_1.0.0_x64-setup.exe
INSTALLER_MSI_FILE_ID=cloud://<你的环境资源路径>/installers/v1.0.0/万能格式转换离线专业版_1.0.0_x64_zh-CN.msi
INSTALLER_FILE_NAME=万能格式转换离线专业版_1.0.0_x64-setup.exe
INSTALLER_EXE_FILE_NAME=万能格式转换离线专业版_1.0.0_x64-setup.exe
INSTALLER_MSI_FILE_NAME=万能格式转换离线专业版_1.0.0_x64_zh-CN.msi
ALLOWED_ORIGINS=https://gszhmrx.cn,https://www.gszhmrx.cn
```

## 安全注意事项

1. 只有明确恢复口令下载时才启用本方案。
2. 不要把真实下载口令、私钥或临时下载 URL 写进前端代码。
3. 下载口令如果被转发，别人也可能下载；发现外泄后立即更换 `DOWNLOAD_PASSWORD`。
4. 统一口令只能控制安装包获取渠道；正式使用权仍由桌面端本地许可证校验控制。
