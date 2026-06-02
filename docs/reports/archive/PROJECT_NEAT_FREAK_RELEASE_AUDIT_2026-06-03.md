# 2026-06-03 项目审查与发布准备记录

## 结论

本轮已完成项目审查、离线版重新打包、在线版重新构建和发布信息同步。CloudBase 线上部署未完成，原因是本机 CloudBase CLI 身份临时凭证已过期，旧 refreshToken 刷新返回 `AUTH_FAIL`，需要重新登录或使用腾讯云 API 密钥登录后才能继续上传部署。

## 已处理事项

1. 重新打包 Windows 离线版 EXE 与 MSI。
2. 将发布安装包命名改为 `万能格式转换离线专业版`。
3. 更新下载页配置、授权云函数默认文件名、授权下载文档、安装指南、发布说明和 SHA256SUMS。
4. 重新生成第三方组件 Notices，并同步到站内发布文档。
5. 在线版完成最新静态构建，`apps/web/out` 已恢复为在线版产物。
6. 清理构建产生的根目录 `.cargo/` 缓存，并加入 `.gitignore`。

## 最新安装包

| 类型 | 文件名 | 大小 | SHA256 |
| --- | --- | ---: | --- |
| EXE | `万能格式转换离线专业版_1.0.0_x64-setup.exe` | 255,288,601 bytes / 243.46 MB | `C261524B05DBD962AA73331553FE36801AA59C73C2E105FD8124D867FEF549D9` |
| MSI | `万能格式转换离线专业版_1.0.0_x64_zh-CN.msi` | 266,510,336 bytes / 254.16 MB | `FD51973A66786ECA79AF2E8BF0556B061157762D19BA436128ACB574D11D160B` |

## 验证结果

| 检查 | 结果 |
| --- | --- |
| `npm test` | 通过，11 个测试文件 / 53 个测试 |
| `npm run check:privacy` | 通过 |
| `npm run check:network` | 通过 |
| `cargo check` | 通过 |
| `npm run build:web` | 通过 |

## 待执行部署

CloudBase CLI 需要重新登录后继续：

```powershell
.\node_modules\.bin\tcb.cmd login --key
```

登录完成后应继续执行：

1. 上传 `release/v1.0.0/installers/` 中的 EXE/MSI 到私有云存储 `installers/v1.0.0/`。
2. 同步云函数环境变量 `INSTALLER_EXE_FILE_ID`、`INSTALLER_MSI_FILE_ID`、`INSTALLER_EXE_FILE_NAME`、`INSTALLER_MSI_FILE_NAME`。
3. 部署 `cloudbase/functions/createDownloadUrl`。
4. 部署 `apps/web/out` 到 CloudBase 静态托管。
5. 访问 `https://gszhmrx.cn/download/` 验证下载页展示与授权接口。
