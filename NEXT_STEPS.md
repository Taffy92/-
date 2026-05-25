# 下一步开发计划

审查日期：2026-05-22  
目标：把当前 MVP 推进到可正式发布的在线版和离线专业版。

## 阶段 1：发布前修复

优先级最高：

1. 修复 Tauri 配置和源码中的中文乱码。
2. 重新打包离线版，检查安装界面和应用标题。
3. 处理 `pnpm audit --prod` 中的高危依赖告警。
4. 重新生成 Notices 和开源许可证页面。
5. 验证下载页口令接口、CloudBase 临时链接和安装包 SHA256。

## 阶段 2：在线版 UI 收敛

1. 保持当前单页工具逻辑。
2. 文件添加区进入主流程，不漂浮、不遮挡。
3. 功能卡片中文化、选中态更明确。
4. 参数面板更紧凑，按钮主次更清楚。
5. 底部广告统一放入 `<div id="ad-container">`。

## 阶段 3：离线专业版 UI 重做

1. 改成桌面工作台布局。
2. 加入批量任务队列。
3. 加入输出目录、命名规则、失败重试。
4. 加入处理日志和结果管理。
5. 保留所有功能、使用教程、关于我们、隐私政策、使用条款。

## 阶段 4：处理能力增强

1. 图片批量压缩和批量加水印。
2. PDF 批量转图片。
3. Word/Excel 高保真本地渲染方案评估。
4. 音视频批量转换和提取音频。
5. 大文件内存限制、并发限制和取消机制。

## 阶段 5：隐私与安全加固

1. 扩展 networkGuard 浏览器端测试。
2. 增加 Playwright 网络断言：处理文件时不得上传用户文件。
3. CloudBase 下载云函数增加频率限制。
4. 发布前轮换统一下载口令。
5. 安装包代码签名。

## 阶段 6：发布验收

发布前必须跑：

```powershell
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' test
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' build:web
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' audit --prod
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' package:desktop
```

发布验收样例：

- JPG 图片压缩为 JPG。
- PNG 透明图加水印。
- PDF 逐页导出和合成一页导出。
- Word `.docx` 转图片。
- Excel `.xlsx` 转图片。
- MP4 转 WebM。
- WAV 转 MP3。
- MP4 提取 MP3。
- 离线断网安装。
- 离线断网启动和处理文件。
- 浏览器 Network 中无用户文件上传请求。

