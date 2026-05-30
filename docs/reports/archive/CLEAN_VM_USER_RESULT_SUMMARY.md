# CLEAN_VM_USER_RESULT_SUMMARY

生成时间：2026-05-25

来源：用户人工回填的 Windows 10 / Windows 11 干净虚拟机测试结果。

## 1. 用户确认通过项

用户确认以下项目已通过：

1. Windows 10 EXE 断网安装启动通过。
2. Windows 10 MSI 断网安装启动通过。
3. Windows 11 EXE 断网安装启动通过。
4. Windows 11 MSI 断网安装启动通过。
5. WAV 转 FLAC sidecar 通过。
6. MP4 转 WebM sidecar 通过。
7. 中文路径通过。
8. 带空格路径通过。
9. D 盘路径通过。
10. 损坏文件失败后队列继续。
11. 外部请求为 0。
12. 无用户文件上传。

## 2. 对发布风险的影响

这些结果覆盖了之前报告中最关键的发布前风险：

1. Windows 10/11 离线安装启动。
2. EXE/MSI 两种安装包。
3. sidecar FFmpeg 内部实验开关的两个低风险格式验证。
4. 中文路径、空格路径、D 盘路径。
5. 损坏文件失败隔离。
6. 本地处理和网络隔离。

## 3. 仍建议补齐的归档信息

正式进入下一轮前，建议补齐但不阻塞当前结论的材料：

1. Windows 10 具体版本和构建号。
2. Windows 11 具体版本和构建号。
3. WebView2 Runtime 检查截图。
4. EXE/MSI SHA256 校验截图。
5. Defender / SmartScreen 是否拦截的截图或文字说明。
6. sidecar 开关默认关闭截图。
7. sidecar 开启后状态截图。
8. WAV 转 FLAC 和 MP4 转 WebM 输出结果截图。
9. 任务历史脱敏截图。

## 4. 当前结论

根据用户回填结果，当前可以进入下一阶段：

`SIDECAR_DEFAULT_BACKEND_EVALUATION_ROUND`

但下一阶段应先做“评估和设计”，不要直接把 sidecar 改成默认后端。原因：

1. sidecar 仍是内部实验功能。
2. BtbN FFmpeg 候选仍需许可证人工复核。
3. MP3、AAC/M4A、MP4/H.264 仍不应作为 sidecar 正式能力承诺。
4. 长期仍建议自建 LGPL FFmpeg。

## 5. 已同步文件

已回填：

`MANUAL_CLEAN_VM_TEST_RESULT_TEMPLATE.md`
