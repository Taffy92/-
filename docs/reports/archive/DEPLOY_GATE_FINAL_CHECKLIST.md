# DEPLOY_GATE_FINAL_CHECKLIST

本清单用于进入 `UI_STYLE_REFRESH_DEPLOY_ROUND` 前最终复查。

## 安装包与 SHA256

- [x] 最新 EXE 在 `release/v1.0.0/installers`
  - `release/v1.0.0/installers/万能格式转换器_1.0.0_x64-setup.exe`
  - SHA256：`0C86FC2BFDA97297A2858337E7BA67AD7AD275F063D8095D7CCD841A82F8F0D1`
- [x] 最新 MSI 在 `release/v1.0.0/installers`
  - `release/v1.0.0/installers/万能格式转换器_1.0.0_x64_zh-CN.msi`
  - SHA256：`A4F42391A8272AB4041FFEC34015BFED90D606531011BC62ABB3F91F63623C0D`
- [x] `release/v1.0.0/installers/SHA256SUMS.txt` 与最新安装包一致
- [x] `apps/web/src/config/downloads.ts` 与 `SHA256SUMS.txt` 一致
- [x] `apps/web/out/release/v1.0.0/installers/SHA256SUMS.txt` 与 `SHA256SUMS.txt` 一致
- [x] `release/v1.0.0/docs/RELEASE_NOTES.md` 中 SHA256 一致

## CloudBase 下载授权

- [x] `createDownloadUrl` 已加入 `ALLOWED_ORIGIN` / `ALLOWED_ORIGINS`
- [x] `createDownloadUrl` 已支持 CORS 响应头
- [x] `createDownloadUrl` 已支持 `OPTIONS` 预检
- [x] `packageType` 只允许 `exe` 或 `msi`
- [x] `passwordMatches` 已避免 `timingSafeEqual` 长度不一致时报错
- [ ] CloudBase 环境变量已配置 `DOWNLOAD_PASSWORD`
- [ ] CloudBase 环境变量已配置 `ALLOWED_ORIGIN` 或 `ALLOWED_ORIGINS`
- [ ] CloudBase 环境变量已配置 `INSTALLER_EXE_FILE_ID`
- [ ] CloudBase 环境变量已配置 `INSTALLER_MSI_FILE_ID`
- [ ] 部署后验证正确口令 + `packageType=exe`
- [ ] 部署后验证正确口令 + `packageType=msi`
- [ ] 部署后验证错误口令
- [ ] 部署后验证非法 `packageType`
- [ ] 部署后验证非法 Origin
- [ ] 部署后验证 `OPTIONS` 预检

## 本地处理与安全边界

- [x] 未发现云转换接口
- [x] 在线大文件硬限制已在读取文件前执行
- [x] 广告不接收 `File` / `Blob` / `ArrayBuffer` / `Canvas` / 转换结果
- [x] CloudBase 只用于静态托管、安装包存储、下载授权和临时下载链接生成
- [x] 没有新增登录 / 注册 / 会员 / VIP
- [x] 程序图标未改
- [x] Tauri 权限未扩大
- [x] WebView2 offlineInstaller 未改变
- [x] sidecar / WASM 当前范围未改变

## 许可证与说明入口

- [x] `/privacy` 隐私说明入口存在
- [x] `/licenses` 开源许可证入口存在
- [x] `/release/v1.0.0/docs/THIRD_PARTY_NOTICES.md` 入口存在
- [x] `/release/v1.0.0/docs/FFMPEG_LICENSE_NOTICE.md` 入口存在
- [x] `/release/v1.0.0/docs/OPEN_SOURCE_LICENSES.md` 入口存在
- [x] FFmpeg WASM / GPL 风险说明仍存在
- [x] sidecar FFmpeg / BtbN 来源说明仍存在
- [x] source offer / 源码获取说明仍存在
- [x] 商业发布前人工许可证复核提醒仍存在

## Git 基线

- [x] `.gitignore` 覆盖 `node_modules`
- [x] `.gitignore` 覆盖 `.pnpm-home`
- [x] `.gitignore` 覆盖 `apps/web/out`
- [x] `.gitignore` 覆盖 `apps/web/.next`
- [x] `.gitignore` 覆盖 `apps/desktop/src-tauri/target`
- [x] `.gitignore` 覆盖 `release/*/installers/*.exe`
- [x] `.gitignore` 覆盖 `release/*/installers/*.msi`
- [x] `.gitignore` 保留 `release/*/installers/SHA256SUMS.txt`
- [x] `release/*/docs/**` 可提交
- [x] `release/*/verification/*.md` 可提交
- [x] `release/*/verification/` 下日志、临时文件、输出文件、截图和二进制不提交
- [ ] Git 基线提交已完成
- [ ] 确认未提交 `release/*/installers/*.exe`
- [ ] 确认未提交 `release/*/installers/*.msi`
- [ ] 确认未提交 `node_modules`
- [ ] 确认未提交 `.pnpm-home`
- [ ] 确认未提交 `apps/web/out`
- [ ] 确认未提交 `apps/web/.next`
- [ ] 确认未提交 `apps/desktop/src-tauri/target`

## 进入部署的建议结论

- 静态站点：可以进入部署，但建议先提交 Git 基线。
- EXE / MSI：可以上传到 CloudBase 云存储或 COS；不建议提交普通 Git。
- `createDownloadUrl` 云函数：可以部署，但必须先配置 CloudBase 环境变量。
- 正式公开前：建议绑定已备案自定义域名，并重新验证下载页、CORS、SHA256、移动端显示和默认域名风险提示是否消失。
