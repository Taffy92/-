# TAURI_PERMISSION_HARDENING_REPORT

本轮名称：`TAURI_PERMISSION_HARDENING_ROUND`

本轮目标是在不重做 UI、不改变在线版主流程、不引入云转换、不扩大 Tauri 权限的前提下，尽可能收窄离线专业版权限，并验证不破坏批量任务、WebView2 离线安装、本地处理和隐私原则。

## 1. 修改文件

本轮修改：

1. `apps/desktop/src-tauri/tauri.conf.json`
2. `apps/web/src/tests/tauriPermissions.test.ts`
3. `TAURI_PERMISSION_HARDENING_AUDIT.md`
4. `TAURI_PERMISSION_HARDENING_OPTIONS.md`
5. `TAURI_PERMISSION_HARDENING_REPORT.md`

已备份原配置：

`apps/desktop/src-tauri/tauri.conf.permission-hardening-backup.json`

## 2. 原权限

原 Tauri allowlist 重点配置：

```json
{
  "dialog": {
    "all": true,
    "open": true,
    "save": true,
    "message": true,
    "confirm": true,
    "ask": true
  },
  "fs": {
    "all": true,
    "copyFile": true,
    "readFile": true,
    "readDir": true,
    "writeFile": true,
    "exists": true,
    "createDir": true,
    "removeFile": false,
    "removeDir": false,
    "renameFile": false,
    "scope": [
      "$HOME/**",
      "$DESKTOP/**",
      "$DOCUMENT/**",
      "$DOWNLOAD/**",
      "$PICTURE/**",
      "$VIDEO/**",
      "$AUDIO/**",
      "C:/**",
      "D:/**"
    ]
  },
  "path": {
    "all": true
  },
  "shell": {
    "all": false,
    "open": true
  },
  "process": {
    "all": false,
    "exit": false,
    "relaunch": false
  }
}
```

## 3. 新权限

本轮采用“半收窄方案”：

```json
{
  "dialog": {
    "all": false,
    "open": true,
    "save": true,
    "message": true,
    "confirm": true,
    "ask": true
  },
  "fs": {
    "all": false,
    "copyFile": false,
    "readFile": true,
    "readDir": true,
    "writeFile": true,
    "exists": true,
    "createDir": true,
    "removeFile": false,
    "removeDir": false,
    "renameFile": false,
    "scope": [
      "$HOME/**",
      "$DESKTOP/**",
      "$DOCUMENT/**",
      "$DOWNLOAD/**",
      "$PICTURE/**",
      "$VIDEO/**",
      "$AUDIO/**",
      "D:/**"
    ]
  },
  "path": {
    "all": true
  },
  "shell": {
    "all": false,
    "open": true
  },
  "process": {
    "all": false,
    "exit": false,
    "relaunch": false
  }
}
```

## 4. 是否移除了 `C:/**`

已移除。

原因：

1. 用户目录、桌面、文档、下载、图片、视频、音频已经覆盖 C 盘大多数正常用户文件场景。
2. `C:/**` 属于全盘级权限，正式发布时审核和隐私观感较弱。
3. 离线专业版不需要自动读取系统盘任意目录。

影响：

1. 如果用户强行选择 `C:\` 下非用户目录作为输入或输出目录，可能受权限 scope 影响。
2. 正式发布说明中建议用户优先使用用户目录、下载目录、桌面、文档目录或 D 盘工作目录。

## 5. 是否移除了 `D:/**`

未移除。

原因：

1. 用户明确要求支持 D 盘路径。
2. 当前项目本身位于 D 盘。
3. 离线专业版的典型使用场景包含 D 盘项目目录、批量输入目录和自定义输出目录。
4. 直接移除 `D:/**` 可能破坏文件夹导入、输出目录写入、中文路径、带空格路径和批量任务结果保存。

建议：

正式发布前可保留 `D:/**`。如果后续要进一步上架审核或做企业版安全审计，建议进入单独的 Tauri 动态授权或 Tauri v2 权限模型专项。

## 6. D 盘路径测试结果

自动化覆盖：

1. 测试样例路径位于 `D:\万能格式转换器项目\verification\offline-smoke\输入 文件夹`。
2. `smoke-processing.mjs` 成功处理 D 盘下的 Word、Excel、音频、视频样例。
3. `offline-p0-smoke.mjs` 成功处理 D 盘下的图片批量压缩样例。

限制：

当前自动化冒烟通过 Playwright 加载本地静态产物验证处理逻辑和网络隔离，不能完全模拟原生 Tauri `fs.scope` 在安装后 Windows 桌面窗口里的真实授权行为。正式发布前仍需要在干净 Windows 10/11 机器上人工验证 D 盘文件夹导入和 D 盘输出目录写入。

## 7. 中文路径测试结果

自动化样例目录包含中文路径：

`D:\万能格式转换器项目\verification\offline-smoke\输入 文件夹`

结果：

1. 图片批量压缩通过。
2. Word 批量转图片通过。
3. Excel 批量转图片通过。
4. 音频批量转换通过。
5. 视频批量转换通过。

限制同上：原生 Tauri 权限层仍需干净 Windows 机器实测。

## 8. 文件夹导入测试结果

`offline-p0-smoke.mjs` 验证结果：

1. 扫描文件数：2。
2. 导入文件数：2。
3. 跳过文件数：0。
4. 图片批量压缩成功数：2。
5. 外部网络请求数：0。
6. 本地图片压缩 worker 请求数：3。

该测试覆盖了在线静态/桌面静态页面逻辑，但不完全等价于原生 Tauri 文件夹选择 API。真实桌面文件夹导入仍需安装包实测。

## 9. 输出目录写入测试结果

自动化脚本验证了批量结果生成和下载逻辑，没有发现外部上传请求。

原生 Tauri `fs.writeBinaryFile` 写入用户选择输出目录的能力，本轮通过配置和打包校验保留了必要权限：

1. `fs.writeFile=true`
2. `fs.createDir=true`
3. `fs.scope` 保留用户目录和 `D:/**`
4. `path.all=true`

但真实写入用户选择目录仍需要在干净 Windows 10/11 桌面端人工验证。

## 10. 打开输出目录测试结果

配置保留：

1. `shell.open=true`
2. `shell.all=false`
3. `shell.scope` 未扩大

自动化静态冒烟无法实际调用 Tauri 原生 `shell.open`。本轮未破坏相关前端逻辑，真实打开输出目录需安装包实测。

## 11. 打开单个结果文件测试结果

配置保留：

1. `fs.exists=true`
2. `shell.open=true`

前端成功任务行的打开文件能力未改动，测试标识仍存在：

1. `data-testid="open-result-file-button"`
2. `aria-label="打开结果文件"`

真实打开单个结果文件需安装包实测，尤其是中文路径、带空格路径和 D 盘路径。

## 12. 是否影响批量任务队列

未发现影响。

验证：

1. `pnpm test` 通过。
2. 图片批量压缩冒烟通过。
3. Word 批量转图片冒烟通过。
4. Excel 批量转图片冒烟通过。
5. 音频批量转换冒烟通过。
6. 视频批量转换冒烟通过。

## 13. 是否影响任务历史

未改动任务历史逻辑。

验证：

1. `batchQueue.test.ts` 通过。
2. 任务历史最多 100 条、路径脱敏、状态筛选等测试继续通过。

## 14. 是否影响 WebView2 离线安装

未影响。

验证：

1. `tauri.conf.json` 仍保持：

```json
{
  "webviewInstallMode": {
    "type": "offlineInstaller",
    "silent": true
  }
}
```

2. NSIS 构建脚本检查：`INSTALLWEBVIEW2MODE "offlineInstaller"` 存在。
3. MSI WiX 构建脚本检查：包含 `MicrosoftEdgeWebView2RuntimeInstaller.exe`。

注意：

本轮 `pnpm package:desktop` 过程中构建机会下载 Microsoft 官方 WebView2 Evergreen Standalone Installer 用于嵌入安装包。这是构建阶段联网，不是用户离线安装或运行阶段联网。

## 15. 是否影响本地处理和隐私原则

未影响。

验证结果：

1. 图片批量压缩没有外部请求。
2. Word 批量转图片没有外部请求。
3. Excel 批量转图片没有外部请求。
4. 音频批量转换没有外部请求。
5. 视频批量转换没有外部请求。
6. 图片压缩 worker 继续使用本地路径 `/vendor/browser-image-compression/browser-image-compression.js`。
7. CloudBase 下载授权逻辑未改动。
8. 广告组件和文件处理逻辑未改动。
9. 没有新增网络权限。

## 16. 测试和构建结果

执行命令：

```powershell
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 test
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 build:web
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 --filter web exec tsc --noEmit
D:\万能格式转换器项目\.pnpm-home\pnpm.CMD --config.store-dir=D:\万能格式转换器项目\.pnpm-home\store\v3 package:desktop
```

结果：

1. `pnpm test`：通过，7 个测试文件，33 个测试通过。
2. `pnpm build:web`：通过。
3. `pnpm --filter web exec tsc --noEmit`：通过。
4. `pnpm package:desktop`：通过，EXE/MSI 均重新生成。
5. 打包后再次执行 `pnpm build:web`：通过，用于恢复在线版 `apps/web/out` 静态产物。

重点冒烟：

1. `offline-p0-smoke.mjs`：通过。
2. `smoke-processing.mjs`：通过。
3. 外部请求数：0。
4. 控制台错误数：0。

## 17. 新 EXE/MSI 路径、大小、SHA256

EXE：

`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\nsis\万能格式转换器_1.0.0_x64-setup.exe`

大小：207.53 MB  
SHA256：

```text
0699CDAB52533DBE634F71127A82257BC58D28A9B6DEC78EB141BF617317630E
```

MSI：

`D:\万能格式转换器项目\apps\desktop\src-tauri\target\release\bundle\msi\万能格式转换器_1.0.0_x64_zh-CN.msi`

大小：206.08 MB  
SHA256：

```text
7006203336474BDD8FA4A48BA9A8C1F268DD4DECCAB8E8AB22CB30270A4482D9
```

## 18. 是否建议正式发布前保留当前权限

建议暂时保留当前“半收窄权限”。

理由：

1. 已移除 `C:/**` 和全量 `fs.all`/`dialog.all`，发布风险明显下降。
2. 保留 `D:/**` 能满足离线专业版对 D 盘项目目录、中文路径、带空格路径和批量输出目录的核心需求。
3. 没有扩大任何权限。
4. 没有破坏 WebView2 离线安装、批量任务、任务历史或本地处理原则。

发布说明建议：

1. 软件只处理用户主动添加的本地文件或文件夹。
2. 软件只写入用户选择的输出目录或默认下载目录。
3. 软件不会自动扫描磁盘。
4. 软件不会上传用户文件、任务历史、处理日志或转换结果。

## 19. 是否可以进入干净 Windows 10/11 虚拟机实测

可以进入。

建议下一步在干净 Windows 10/11 虚拟机中重点验证：

1. EXE 安装向导安装。
2. MSI 安装。
3. 断网 + 无 WebView2 Runtime 安装和启动。
4. D 盘文件夹导入。
5. C 盘用户目录文件夹导入。
6. C 盘非用户目录导入是否受限，并记录用户提示。
7. D 盘输出目录写入。
8. 中文路径输出目录写入。
9. 带空格路径输出目录写入。
10. 打开输出目录。
11. 打开单个结果文件。
12. 导出处理日志。

如果干净 VM 验证全部通过，可以进入最终发布包整理；如果发现 C 盘非用户目录场景影响较大，再评估是否恢复 `C:/**` 或改造为 Tauri 动态授权方案。
