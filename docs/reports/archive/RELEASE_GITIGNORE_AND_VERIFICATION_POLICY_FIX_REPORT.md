# RELEASE_GITIGNORE_AND_VERIFICATION_POLICY_FIX_REPORT

本轮名称：`RELEASE_GITIGNORE_AND_VERIFICATION_POLICY_FIX_ROUND`

本轮范围：只修正 `.gitignore` 和 Git 基线文档；未执行 `git add`、未执行 `git commit`、未部署、未上传安装包、未修改 UI、未修改功能、未修改 CloudBase 下载授权业务逻辑、未修改 Tauri 权限、未修改 WebView2 offlineInstaller、未修改 sidecar / WASM 范围。

## 1. `.gitignore` 修改规则

已将写死 `v1.0.0` 的 release 安装包忽略规则：

```gitignore
release/v1.0.0/installers/*.exe
release/v1.0.0/installers/*.msi
```

改为跨版本通用规则：

```gitignore
release/*/installers/*.exe
release/*/installers/*.msi
!release/*/installers/SHA256SUMS.txt
```

结果：

- 所有 release 版本目录下的 EXE 不进入普通 Git；
- 所有 release 版本目录下的 MSI 不进入普通 Git；
- 所有 release 版本目录下的 `SHA256SUMS.txt` 可以进入 Git；
- 后续新增 `v1.0.1`、`v1.1.0` 等版本时适用同一规则。

## 2. release verification 策略

已检查当前目录：

`release/v1.0.0/verification/`

当前包含：

| 文件 | 类型 | 建议 |
|---|---|---|
| `CLEAN_VM_USER_RESULT_SUMMARY.md` | 发布验证文档 | 可以进入 Git |
| `FINAL_RELEASE_CHECKLIST.md` | 发布检查清单 | 可以进入 Git |
| `LOW_RISK_SIDECAR_DEFAULT_REPORT.md` | 发布验证报告 | 可以进入 Git |
| `MANUAL_CLEAN_VM_TEST_RESULT_TEMPLATE.md` | 人工测试模板 | 可以进入 Git |

已增加 release verification 产物忽略规则：

```gitignore
release/*/verification/**/*.log
release/*/verification/**/*.tmp
release/*/verification/**/out/
release/*/verification/**/*.exe
release/*/verification/**/*.msi
release/*/verification/**/*.zip
release/*/verification/**/*.7z
release/*/verification/**/*.png
release/*/verification/**/*.jpg
release/*/verification/**/*.jpeg
release/*/verification/**/*.webp
release/*/verification/**/*.dll
release/*/verification/**/*.wasm
```

明确策略：

- `release/*/verification/*.md` 可以提交，作为发布审计归档；
- release verification 下的日志、临时文件、样例文件、输出文件、截图和二进制不提交；
- 不删除、不移动当前 `release/v1.0.0/verification/` 文档。

## 3. 执行的检查

执行了：

```powershell
git status --short
git check-ignore -v release/v1.0.0/installers/万能格式转换器_1.0.0_x64-setup.exe
git check-ignore -v release/v1.0.0/installers/万能格式转换器_1.0.0_x64_zh-CN.msi
git check-ignore -v release/v1.0.0/installers/SHA256SUMS.txt
git check-ignore -v release/v1.0.0/verification/FINAL_RELEASE_CHECKLIST.md
```

并补充验证了假设的新版本路径：

```powershell
git check-ignore -v release/v1.0.1/installers/example.exe
git check-ignore -v release/v1.0.1/installers/example.msi
git check-ignore -v release/v1.0.1/installers/SHA256SUMS.txt
```

## 4. 检查结果

| 路径 | 结果 | 说明 |
|---|---|---|
| `release/v1.0.0/installers/万能格式转换器_1.0.0_x64-setup.exe` | 已忽略 | 命中 `release/*/installers/*.exe` |
| `release/v1.0.0/installers/万能格式转换器_1.0.0_x64_zh-CN.msi` | 已忽略 | 命中 `release/*/installers/*.msi` |
| `release/v1.0.0/installers/SHA256SUMS.txt` | 可提交 | `git status --ignored` 显示为 `??`，未被忽略；`git check-ignore -v` 显示命中反向规则 `!release/*/installers/SHA256SUMS.txt` |
| `release/v1.0.0/verification/FINAL_RELEASE_CHECKLIST.md` | 可提交 | `git check-ignore` 未命中忽略规则；`git status --ignored` 显示为 `??` |
| `release/v1.0.0/verification/test.log` | 已忽略 | release verification 日志不提交 |
| `release/v1.0.0/verification/temp.tmp` | 已忽略 | release verification 临时文件不提交 |
| `release/v1.0.0/verification/out/result.txt` | 已忽略 | release verification 输出目录不提交 |
| `release/v1.0.0/verification/screenshots/a.png` | 已忽略 | release verification 截图不提交 |
| `release/v1.0.0/verification/bin/tool.exe` | 已忽略 | release verification 二进制不提交 |
| `release/v1.0.1/installers/example.exe` | 已忽略 | 新版本 EXE 也会被忽略 |
| `release/v1.0.1/installers/example.msi` | 已忽略 | 新版本 MSI 也会被忽略 |
| `release/v1.0.1/installers/SHA256SUMS.txt` | 可提交 | 新版本 SHA256 清单可提交 |

## 5. 更新的 Git 基线文档

已同步更新：

| 文件 | 更新内容 |
|---|---|
| `GIT_BASELINE_ADD_COMMANDS.md` | 第五批 release 提交建议加入 `release/v1.0.0/verification/*.md`；明确 `release/*/installers/*.exe` / `*.msi` 不进普通 Git；明确 verification 产物不提交。 |
| `GIT_BASELINE_COMMIT_LIST.md` | 增加 release verification Markdown 可提交策略；安装包规则改为 `release/*/installers/*.exe` / `*.msi`；补充 verification 产物黑名单。 |
| `GIT_BASELINE_COMMIT_PREP_REPORT.md` | 补充 release 通用规则和 verification 策略；误暂存恢复命令改为跨版本规则。 |
| `GIT_BASELINE_PRE_COMMIT_FIX_REPORT.md` | 补充 release 跨版本安装包忽略、SHA256 可提交、verification Markdown 可提交、verification 产物忽略说明。 |
| `DEPLOY_GATE_FINAL_CHECKLIST.md` | 增加跨版本 release 安装包忽略、SHA256 保留、verification Markdown 可提交和 verification 产物不提交检查项。 |

## 6. 是否已把 `release/v1.0.0` 写死规则改为 `release/*`

是。

`.gitignore` 中 release 安装包规则已经从 `release/v1.0.0/installers/*.exe` / `*.msi` 改为：

```gitignore
release/*/installers/*.exe
release/*/installers/*.msi
!release/*/installers/SHA256SUMS.txt
```

## 7. EXE / MSI / SHA256 / verification 结论

| 项目 | 结论 |
|---|---|
| EXE 是否仍被忽略 | 是，所有 `release/*/installers/*.exe` 被忽略 |
| MSI 是否仍被忽略 | 是，所有 `release/*/installers/*.msi` 被忽略 |
| `SHA256SUMS.txt` 是否可提交 | 是，`release/*/installers/SHA256SUMS.txt` 可提交 |
| `release/*/docs/**` 是否可提交 | 是 |
| `release/*/verification/*.md` 是否可提交 | 是 |
| release verification 日志是否可提交 | 否 |
| release verification 临时文件是否可提交 | 否 |
| release verification 输出文件是否可提交 | 否 |
| release verification 截图是否可提交 | 否 |
| release verification 二进制是否可提交 | 否 |

## 8. 未做事项

- 未执行 `git add`；
- 未执行 `git commit`；
- 未部署 CloudBase；
- 未上传 EXE / MSI；
- 未删除当前 release 安装包；
- 未移动当前 release 安装包；
- 未修改 UI；
- 未修改功能；
- 未修改 CloudBase 下载授权业务逻辑；
- 未修改 Tauri 权限；
- 未修改 WebView2 offlineInstaller；
- 未修改 sidecar / WASM 当前范围；
- 未新增云转换；
- 未上传用户处理文件。

## 9. 是否可以进入 `GIT_BASELINE_EXECUTE_ROUND`

可以。

进入前仍建议人工确认：

1. 是否接受 `.agents/` 不进入产品仓库；
2. 是否接受 `.codex/` 不进入产品仓库；
3. `skills-lock.json` 是否需要提交；
4. sidecar FFmpeg `bin/*.exe` 和 `bin/*.dll` 是否使用 Git LFS、私有制品仓库、CloudBase 私有归档或内部 release artifact；
5. `release/*/installers/*.exe` 和 `release/*/installers/*.msi` 不进入普通 Git；
6. `release/*/installers/SHA256SUMS.txt`、`release/*/docs/**`、`release/*/verification/*.md` 可以进入 Git。
