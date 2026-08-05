# createDownloadUrl

CloudBase 统一下载口令云函数。当前公开下载页已改为直接下载 3 天试用版，本函数只作为备用内部分发方案保留。

用途：

1. 接收网站下载页提交的下载口令。
2. 与云函数环境变量 `DOWNLOAD_PASSWORD` 比对。
3. 校验通过后，为私有云存储里的离线安装包生成短时有效下载链接。
4. 写入下载日志，便于后续排查问题。

推荐环境变量：

```bash
DOWNLOAD_PASSWORD=你的下载口令
LOG_COLLECTION=download_authorization_logs
DOWNLOAD_URL_MAX_AGE=600
INSTALLER_ZIP_FILE_ID=cloud://<你的环境资源路径>/installers/v2.0.0/万能格式转换器_2.0.0_x64_zh-CN.zip
INSTALLER_ZIP_FILE_NAME=万能格式转换器_2.0.0_x64_zh-CN.zip
ALLOWED_ORIGINS=https://gszhmrx.cn,https://www.gszhmrx.cn
```

以后需要更换下载口令时，只需要修改云函数环境变量 `DOWNLOAD_PASSWORD` 并重新部署或保存配置，不需要再新增数据库授权记录。

前端只发送 `packageType=zip`。云函数仅为 ZIP 安装包生成短时临时链接，不接收用户正在处理的图片、文档、音频、视频或转换结果。
