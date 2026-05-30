# OFFLINE_BATCH_SMOKE_TEST_REPORT

生成时间：2026-05-24

本轮按“真实离线专业版冒烟验收”执行，只做验证和记录，没有重做 UI，没有改在线版主流程，没有引入云转换，也没有扩大 Tauri 权限。

## 1. 使用的安装包路径

EXE 安装包：

`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\nsis\万能格式转换器_1.0.0_x64-setup.exe`

- SHA256：`17A9AB6FE867E9ADBCD15D4015C4B523CDAC6355413255EF9F9D33195C1807FC`
- 大小：约 207 MB

MSI 安装包：

`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\msi\万能格式转换器_1.0.0_x64_zh-CN.msi`

- SHA256：`28D08D21534CCF597A7C8AEC1497DF43E7CAF4511C91CF494D6EB4BB503F791F`
- 大小：约 206 MB

直接启动程序：

`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\万能格式转换器.exe`

NSIS 静默安装后检测到的已安装程序：

`C:\Users\Administrator\Desktop\111\万能格式转换器.exe`

说明：NSIS 静默安装返回 `0`，注册表显示 DisplayName 为“万能格式转换器”，DisplayVersion 为 `1.0.0`，Publisher 为 `MR.谢`。但安装位置复用了当前机器上曾经选择过的 `C:\Users\Administrator\Desktop\111`，需要在干净虚拟机上再做一次人工安装流程确认。

## 2. 测试系统版本

- 系统：Microsoft Windows 10 专业版
- 版本：10.0.19045
- 架构：64 位
- 设备名：WIN-HPBOELPJLMG

## 3. 是否断网测试

本轮做了两类验证：

1. 桌面程序启动验证：启动已安装 EXE 和 release EXE，窗口标题均显示“万能格式转换器”，进程可正常运行。
2. 静态离线页面网络隔离验证：用本地 `apps/web/out` 静态产物启动 `127.0.0.1` 服务，并用 Playwright 拦截所有非本地、非 `blob:`、非 `data:` 请求。

没有真实关闭 Windows 网卡，因此“断网测试”结论为：已完成自动化网络隔离模拟，未完成物理断网安装机验证。正式发布前建议用无网络虚拟机或断网实体机再跑一次。

## 4. 样例文件清单

样例目录：

`D:\万能格式转换器项目\verification\offline-smoke\输入 文件夹`

样例文件：

- `图片 一.jpg`，7358 bytes
- `图片 二.png`，3494 bytes
- `损坏 图片.jpg`，25 bytes，用于失败任务验证
- `标准 文档.docx`，1624 bytes
- `标准 表格.xlsx`，6567 bytes
- `测试 视频.mp4`，16498 bytes
- `测试 音频.wav`，176478 bytes
- `跳过 文本.txt`，23 bytes，用于不支持文件验证

输出和证据目录：

`D:\万能格式转换器项目\verification\offline-smoke\evidence`

已生成截图：

- `desktop-workbench-1440.png`
- `image-batch-after-run.png`
- `folder-import.png`

已生成自动化结果：

- `smoke-web-result.json`
- `smoke-processing-result.json`

## 5. 图片批量处理结果

验证项目：

- 能进入“批量任务”工作台。
- 无任务时“开始处理”按钮为禁用。
- 能添加多个图片文件。
- 每个图片任务显示独立状态。
- 批量图片压缩任务能显示成功状态。
- 失败样例能显示失败原因。
- 任务可取消，取消后能显示“已取消”状态。
- 可清空全部任务。

结果：

- 图片批量队列 UI 和任务状态可用。
- 图片批量压缩自动化测试显示任务成功。
- 发现严重离线风险：图片压缩过程中触发了对 `https://cdn.jsdelivr.net/npm/browser-image-compression@2.0.2/dist/browser-image-compression.js` 的请求。

结论：

图片批量压缩功能逻辑可运行，但当前不能宣称“完全断网可用”。必须把 `browser-image-compression` 的 worker 脚本改为本地静态资源，或关闭其远程 worker 加载路径。

## 6. 文档批量处理结果

验证项目：

- Word 批量转图片。
- Excel 批量转图片。
- 中文路径和带空格路径下的文档样例。
- 所有请求被限制为本地静态资源、`blob:` 或 `data:`。

结果：

- `标准 文档.docx`：Word 批量转图片成功。
- `标准 表格.xlsx`：Excel 批量转图片成功。
- 文档批量处理期间未出现外部网络请求。
- 使用手写的极简非标准 DOCX/XLSX 样例时会失败；改用标准结构样例后成功。这属于样例文件标准性问题，不直接判定为产品缺陷。

结论：

文档批量处理在本轮标准样例下通过冒烟测试。

## 7. 音视频批量处理结果

验证项目：

- 音频批量转换。
- 视频批量转换。
- 本地 FFmpeg WASM 静态资源加载。
- 外部请求拦截。

结果：

- `测试 音频.wav`：音频批量转换为 MP3 成功。
- `测试 视频.mp4`：视频批量转换为 MP4 成功。
- 音视频转换期间未出现外部网络请求。
- 本地 FFmpeg 资源来自 `apps/web/public/ffmpeg/ffmpeg-core.js` 和 `apps/web/public/ffmpeg/ffmpeg-core.wasm`。

结论：

音视频批量处理在小文件样例下通过冒烟测试。还需要下一轮做大文件压力测试、长视频测试和失败编码样例测试。

## 8. 文件夹导入结果

验证项目：

- 能点击文件夹导入入口。
- 能从文件夹读取支持的文件。
- 能显示导入数量。

自动化结果：

- 文件夹导入入口可用。
- 在图片批量压缩模式下，浏览器目录上传导入了 3 个图片类文件。
- 自动化结果显示导入 3 个、跳过 0 个。

限制说明：

Playwright 对 `webkitdirectory` 的目录上传行为与真实 Tauri 文件夹读取不完全一致，本轮没有完整验证“同一文件夹中自动跳过 txt、docx、xlsx、wav、mp4”等混合格式跳过逻辑。Tauri 代码路径使用 `readDir` 后按当前批量类型过滤，理论上会跳过不支持文件，但仍需要在真实桌面窗口里选择混合文件夹复验。

结论：

文件夹导入基本可用；“自动跳过不支持文件”的真实桌面行为需要补一轮人工或 Tauri 自动化测试。

## 9. 输出目录选择结果

验证项目：

- 输出目录按钮存在。
- 结果管理区显示当前输出目录。
- 底部状态栏显示输出目录。
- 桌面端代码使用 Tauri `dialog.open({ directory: true })`。

结果：

- UI 中输出目录入口存在。
- 结果管理区和状态栏能显示输出目录。
- Headless 浏览器环境无法真实操作 Tauri 原生目录选择框。
- 未在本轮自动化中验证“写入用户选择的本地目录”。

结论：

输出目录 UI 和代码路径存在，但真实 Windows 目录选择与写入需要用桌面程序窗口人工确认。

## 10. 失败重试结果

验证项目：

- 上传损坏图片作为失败任务。
- 失败任务显示失败原因。
- 失败任务应显示重试按钮。

结果：

- 损坏图片任务能进入失败状态。
- 页面显示了失败原因。
- 自动化未稳定捕获到“重试”按钮可见状态，`retryButtonVisible=false`。
- 脚本尝试点击重试未抛出异常，但该项不能作为通过证据。

结论：

失败原因显示通过；失败任务重试需要修复或补充更稳定的可见性验证。建议下一轮把失败行操作按钮增加可测试标签，例如 `aria-label="重试任务"`。

## 11. 取消任务结果

验证项目：

- 添加任务后点击行内取消。
- 任务显示已取消。

结果：

- 取消按钮可点击。
- 任务状态能显示“已取消”。

结论：

取消任务冒烟通过。

## 12. 日志导出结果

验证项目：

- 结果管理区有“导出处理日志”按钮。
- 点击后不出现控制台错误。

结果：

- 按钮可点击。
- 未捕获到控制台错误。
- Headless 自动化未捕获到实际下载文件事件。

结论：

日志导出入口可用，但下载文件落地需要人工桌面复验。建议下一轮给日志导出按钮增加可测试下载文件名，便于自动化断言。

## 13. 隐私网络检查结果

自动化网络隔离结果：

- Word 批量转图片：无外部请求。
- Excel 批量转图片：无外部请求。
- 音频批量转换：无外部请求。
- 视频批量转换：无外部请求。
- 批量工作台静态资源：仅请求本地 `127.0.0.1`、`blob:`、`data:`。
- 图片批量压缩：出现外部请求。

发现的外部请求：

`https://cdn.jsdelivr.net/npm/browser-image-compression@2.0.2/dist/browser-image-compression.js`

风险判断：

该请求不是用户文件上传，但它意味着离线版本图片压缩依赖远程 worker 脚本，和“安装与全功能使用都完全离线”的目标冲突。

## 14. 发现的 bug

P0 / 必须修：

1. `apps/desktop/src-tauri/tauri.conf.json` 中文元数据出现乱码。
   - `productName`
   - `publisher`
   - `copyright`
   - `shortDescription`
   - `longDescription`
   - `windows.title`

2. 图片批量压缩触发远程 CDN worker 请求。
   - 来源：`browser-image-compression`
   - 请求：`https://cdn.jsdelivr.net/npm/browser-image-compression@2.0.2/dist/browser-image-compression.js`
   - 影响：离线版断网图片压缩可能失败或退化。

P1 / 发布前建议修：

3. Tauri 权限不够“最小必要”。
   - `fs.scope` 包含 `C:/**` 和 `D:/**`。
   - `path.all=true`。
   - 这对用户自由选择 D 盘路径有现实用途，但从最小权限角度仍偏宽。

4. NSIS 静默安装复用了当前机器上的历史安装目录 `C:\Users\Administrator\Desktop\111`。
   - 干净机器上可能正常进入默认目录。
   - 发布前必须在干净虚拟机里走一次 EXE 安装向导和静默安装。

5. 失败任务重试按钮自动化验证不稳定。
   - 失败原因可见。
   - 重试按钮未被脚本稳定识别。

P2 / 可以后续优化：

6. 文件夹导入的“跳过不支持文件”没有在真实 Tauri 环境中自动化完成。
7. 导出处理日志按钮点击无错误，但未捕获到实际下载产物。
8. 冒烟脚本结果 JSON 中部分中文在 PowerShell 输出中显示乱码，测试判断本身不受影响，但报告证据可读性需要优化。

## 15. 必须修复的问题

进入下一轮功能开发前，建议先修以下事项：

1. 重新用 UTF-8 修复 `apps/desktop/src-tauri/tauri.conf.json`，然后重新打包 EXE/MSI。
2. 把 `browser-image-compression` 的 worker 脚本改为本地加载，或在离线专业版中禁用远程 worker 路径。
3. 重新执行图片批量压缩断网测试，确保没有任何 `cdn.jsdelivr.net`、`unpkg.com` 或其他远程依赖请求。
4. 在干净 Windows 10/11 虚拟机中进行 EXE/MSI 安装测试。
5. 确认 Tauri 文件系统权限是否可以收窄，至少需要形成发布说明。

## 16. 可以延后的优化

1. 任务历史持久化。
2. 打开单个结果文件。
3. 大文件压力测试。
4. 长视频和高码率视频测试。
5. 文件夹递归深度配置。
6. 更完整的失败编码样例库。
7. 日志导出自动化断言。

## 17. 是否可以进入下一轮

暂不建议直接进入“任务历史持久化、打开单个结果文件、大文件压力测试”。

理由：

1. 离线版图片压缩仍有远程 CDN worker 请求，和“完全离线使用全功能”目标冲突。
2. Tauri 配置中文元数据乱码会影响安装包展示、系统应用列表和发布可信度。
3. Tauri 权限范围偏宽，需要至少完成一次权限收窄评估或发布说明确认。

建议下一轮先做一个小修复轮：

1. 修复 Tauri 配置中文乱码。
2. 修复图片压缩远程 worker 依赖。
3. 重新打包 EXE/MSI。
4. 在断网环境重新跑图片、文档、音视频批量冒烟。

完成后再进入任务历史持久化、打开单个结果文件和大文件压力测试。

