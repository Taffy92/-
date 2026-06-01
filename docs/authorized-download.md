# 离线安装版统一下载口令方案

在线版是静态网站，不能把离线安装包直接放在 `apps/web/out` 里公开下载。当前采用更简单的方案：

```text
CloudBase 私有云存储安装包 + 统一下载口令 + 云函数临时下载链接
```

你以后不需要给每个用户新增数据库授权码。只需要维护一个下载口令，把这个口令发给允许下载的人即可。

## 当前线上信息

- CloudBase 环境：`format-converter-prod-x-d71bce41`
- 静态网站地址：`https://gszhmrx.cn`（`https://www.gszhmrx.cn` 同站点）
- 下载页：`https://gszhmrx.cn/download/`
- 云函数：`createDownloadUrl`
- 云函数地址：`https://format-converter-prod-x-d71bce41.service.tcloudbase.com/createDownloadUrl`
- 私有安装包 fileID：

```text
cloud://<你的环境资源路径>/installers/v1.0.0/万能格式转换器_1.0.0_x64-setup.exe
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
INSTALLER_FILE_ID=cloud://<你的环境资源路径>/installers/v1.0.0/万能格式转换器_1.0.0_x64-setup.exe
INSTALLER_EXE_FILE_ID=cloud://<你的环境资源路径>/installers/v1.0.0/万能格式转换器_1.0.0_x64-setup.exe
INSTALLER_MSI_FILE_ID=cloud://<你的环境资源路径>/installers/v1.0.0/万能格式转换器_1.0.0_x64_zh-CN.msi
INSTALLER_FILE_NAME=万能格式转换器_1.0.0_x64-setup.exe
INSTALLER_EXE_FILE_NAME=万能格式转换器_1.0.0_x64-setup.exe
INSTALLER_MSI_FILE_NAME=万能格式转换器_1.0.0_x64_zh-CN.msi
ALLOWED_ORIGINS=https://gszhmrx.cn,https://www.gszhmrx.cn
```

## 网站环境变量

网站构建时需要：

```env
NEXT_PUBLIC_DOWNLOAD_AUTH_ENABLED=true
NEXT_PUBLIC_DOWNLOAD_AUTH_ENDPOINT=https://format-converter-prod-x-d71bce41.service.tcloudbase.com/createDownloadUrl
```

修改后重新构建并上传 `apps/web/out`。

## 安全注意事项

1. 不要把安装包放进 `apps/web/out`。
2. 不要把安装包真实下载 URL 写进前端代码。
3. 不要把云存储目录设置为长期公开读。
4. 下载口令如果被转发，别人也可能下载；发现外泄后立即更换 `DOWNLOAD_PASSWORD`。
5. 统一口令适合简单授权下载；如果以后要限制单个用户下载次数，再恢复“每用户授权码”模式。
6. 授权下载只能控制安装包获取渠道；如果还要控制安装后的使用，需要在离线软件里增加本地许可证校验。
