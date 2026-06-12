# FINAL_RELEASE_CHECKLIST

版本：1.0.0  
日期：2026-06-12

## 安装包

- [x] EXE 已复制到 `release/v1.0.0/installers/`。
- [x] MSI 已复制到 `release/v1.0.0/installers/`。
- [x] 已生成 `SHA256SUMS.txt`。
- [x] 未复制旧安装包。
- [x] 未复制 `node_modules`、源码树或 target 中间文件。

## 文档

- [x] RELEASE_NOTES.md
- [x] INSTALL_GUIDE.md
- [x] OFFLINE_PRO_USER_GUIDE.md
- [x] PRIVACY_NOTICE.md
- [x] DOWNLOAD_PAGE_COPY.md
- [x] OPEN_SOURCE_LICENSES.md
- [x] THIRD_PARTY_NOTICES.md
- [x] FFMPEG_LICENSE_NOTICE.md
- [x] RELEASE_COMPLIANCE_CHECKLIST.md

## 验证归档

- [x] CLEAN_VM_USER_RESULT_SUMMARY.md
- [x] MANUAL_CLEAN_VM_TEST_RESULT_TEMPLATE.md
- [x] LOW_RISK_SIDECAR_DEFAULT_REPORT.md

## 产品边界

- [x] 在线版继续使用 FFmpeg WASM。
- [x] 在线版不包含 sidecar exe / DLL。
- [x] 离线专业版保留 FFmpeg WASM 回退。
- [x] 离线专业版仅对 WAV 转 FLAC、MP4 转 WebM、ffprobe 信息读取使用 sidecar 优先。
- [x] MP3、AAC/M4A、MP4/H.264、MOV、AVI、MKV 不进入 sidecar 默认范围。
- [x] CloudBase 只用于下载授权，不接触用户处理文件。

## 发布前仍需人工确认

- [ ] 安装包代码签名。
- [ ] BtbN FFmpeg 候选商业许可证复核。
- [ ] FFmpeg / GPL / LGPL / 专利 / 平台要求复核。
- [x] 下载页正式域名、备案和 ICP 信息配置。
- [x] 正式服务器下载对象为公开只读，EXE/MSI HEAD 返回 200，线上大小与本地发布包一致。
