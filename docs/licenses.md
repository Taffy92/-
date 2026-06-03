# 第三方开源许可证与 Notices

本文件为“万能格式转换器”在线版和 Windows 离线安装版的第三方开源软件 Notices。内容根据锁文件、本地依赖元数据和最终构建产物生成，用于正式发布前的许可证归档和产品内展示。

- 生成时间：2026-06-03T13:14:04.835Z
- npm 依赖数量：728
- 直接 npm 依赖数量：35
- Rust crate 数量：439
- 构建产物记录数量：7
- 开发者：MR.谢
- 联系邮箱：370298218@qq.com

## 生成来源

- `pnpm-lock.yaml`
- `node_modules/.pnpm/**/package.json`
- `apps/desktop/src-tauri/Cargo.lock`
- `本机 Cargo registry manifest（可用时）`
- `apps/web/out`
- `apps/desktop/src-tauri/target/release/bundle`

## 发布前必须保留的重点说明

- 本项目使用的第三方库大多数允许商业使用，但必须保留对应版权声明、许可证文本和必要 NOTICE。
- Next.js、React、PDF.js、JSZip、Tauri、Rust 依赖等应随网站“开源许可证”页面和离线安装包保留许可证说明。
- 当前项目音视频转换使用 `@ffmpeg/core`（包声明许可证：`GPL-2.0-or-later`）。如果正式发布包内包含 FFmpeg WASM 静态资源，需要按 FFmpeg 对应构建许可证提供源代码获取方式、许可证文本和版权声明。
- 如果继续保留 `@ffmpeg/core` 默认构建且其许可证为 GPL-2.0-or-later，发布方需要按 GPL 要求履行源代码提供义务；可选替代方案包括使用合规的 LGPL FFmpeg 构建、改为用户本机 sidecar FFmpeg，或保留现状并补齐 GPL 声明和源代码获取方式。
- 本轮已将 Excel 转图片链路从 xlsx 切换到 ExcelJS，并增加文件大小、工作表数量、行数和单元格数量限制。
- 本文件不是法律意见。正式商业发布前，建议根据投放地区、应用商店要求和广告平台要求进行最终合规审查。

## 最终构建产物记录

| 名称 | 路径 | 类型 | 文件数 | 大小 | SHA256 | 说明 |
| --- | --- | --- | --- | --- | --- | --- |
| Next.js 静态网站产物 | `apps/web/out` | 目录 | 295 | 42.19 MB | - | 在线版和离线版共用的静态页面、JS、CSS 和静态资源。 |
| PDF.js 静态资源 | `apps/web/out/pdfjs` | 目录 | 189 | 3.80 MB | - | 来自 pdfjs-dist 的主模块、worker、CMaps 和字体资源。 |
| FFmpeg WASM 静态资源 | `apps/web/out/ffmpeg` | 目录 | 2 | 30.85 MB | - | 来自 @ffmpeg/core 的 ffmpeg-core.js 和 ffmpeg-core.wasm。 |
| Windows NSIS 安装包 | `apps/desktop/src-tauri/target/release/bundle/nsis/万能格式转换器_1.0.0_x64-setup.exe` | 文件 | 1 | 243.56 MB | DF8258E77E2250CA513CAACF4FA4BC380812A92F687030E75042E6FAF1B2F6FD | 离线版 Windows x64 EXE 安装包。 |
| Windows NSIS 安装包 | `apps/desktop/src-tauri/target/release/bundle/nsis/万能格式转换离线专业版_1.0.0_x64-setup.exe` | 文件 | 1 | 243.56 MB | DF8258E77E2250CA513CAACF4FA4BC380812A92F687030E75042E6FAF1B2F6FD | 离线版 Windows x64 EXE 安装包。 |
| Windows MSI 安装包 | `apps/desktop/src-tauri/target/release/bundle/msi/万能格式转换器_1.0.0_x64_zh-CN.msi` | 文件 | 1 | 254.27 MB | 83AE0FF2E23EAE9B0B9E64CD4579DD86202C392EBD330A0D78A142309B9577E8 | 离线版 Windows x64 MSI 安装包。 |
| Windows MSI 安装包 | `apps/desktop/src-tauri/target/release/bundle/msi/万能格式转换离线专业版_1.0.0_x64_zh-CN.msi` | 文件 | 1 | 254.27 MB | 83AE0FF2E23EAE9B0B9E64CD4579DD86202C392EBD330A0D78A142309B9577E8 | 离线版 Windows x64 MSI 安装包。 |

## 直接 npm 依赖

| 包名 | 版本 | 许可证 | 仓库/主页 | 许可证文件 |
| --- | --- | --- | --- | --- |
| @cloudbase/cli | 3.3.3 | ISC | - | - |
| @ffmpeg/core | 0.12.10 | GPL-2.0-or-later | git+https://github.com/ffmpegwasm/ffmpeg.wasm.git | - |
| @ffmpeg/ffmpeg | 0.12.15 | MIT | git+https://github.com/ffmpegwasm/ffmpeg.wasm.git | - |
| @ffmpeg/util | 0.12.2 | MIT | git+https://github.com/ffmpegwasm/ffmpeg.wasm.git | - |
| @gsap/react | 2.1.2 | SEE LICENSE AT https://gsap.com/standard-license | git+https://github.com/greensock/react.git | - |
| @playwright/test | 1.60.0 | Apache-2.0 | git+https://github.com/microsoft/playwright.git | LICENSE |
| @tauri-apps/api | 1.6.0 | Apache-2.0 OR MIT | git+https://github.com/tauri-apps/tauri.git | - |
| @tauri-apps/cli | 1.6.3 | Apache-2.0 OR MIT | git+https://github.com/tauri-apps/tauri.git | - |
| @types/file-saver | 2.0.7 | MIT | https://github.com/DefinitelyTyped/DefinitelyTyped.git | LICENSE |
| @types/node | 14.18.63 | MIT | https://github.com/DefinitelyTyped/DefinitelyTyped.git | LICENSE |
| @types/node | 16.18.11 | MIT | https://github.com/DefinitelyTyped/DefinitelyTyped.git | LICENSE |
| @types/node | 20.19.41 | MIT | https://github.com/DefinitelyTyped/DefinitelyTyped.git | LICENSE |
| @types/react | 18.3.28 | MIT | https://github.com/DefinitelyTyped/DefinitelyTyped.git | LICENSE |
| @types/react-dom | 18.3.7 | MIT | https://github.com/DefinitelyTyped/DefinitelyTyped.git | LICENSE |
| autoprefixer | 10.5.0 | MIT | postcss/autoprefixer | LICENSE |
| browser-image-compression | 2.0.2 | MIT | https://github.com/Donaldcwl/browser-image-compression | LICENSE |
| cropperjs | 1.6.2 | MIT | git+https://github.com/fengyuanchen/cropperjs.git | LICENSE |
| eslint | 8.57.1 | MIT | eslint/eslint | LICENSE |
| eslint-config-next | 15.5.18 | MIT | vercel/next.js | - |
| exceljs | 4.4.0 | MIT | https://github.com/exceljs/exceljs.git | LICENSE |
| file-saver | 2.0.5 | MIT | https://github.com/eligrey/FileSaver.js | LICENSE.md |
| gsap | 3.15.0 | Standard 'no charge' license: https://gsap.com/standard-license. | git+https://github.com/greensock/GSAP.git | - |
| jsdom | 24.1.3 | MIT | git+https://github.com/jsdom/jsdom.git | LICENSE.txt |
| jszip | 3.10.1 | (MIT OR GPL-3.0-or-later) | https://github.com/Stuk/jszip.git | LICENSE.markdown |
| lucide-react | 0.468.0 | ISC | https://github.com/lucide-icons/lucide.git | LICENSE |
| next | 15.5.18 | MIT | vercel/next.js | license.md |
| pdfjs-dist | 4.10.38 | Apache-2.0 | git+https://github.com/mozilla/pdf.js.git | LICENSE |
| postcss | 8.5.10 | MIT | postcss/postcss | LICENSE |
| react | 18.3.1 | MIT | https://github.com/facebook/react.git | LICENSE |
| react-dom | 18.3.1 | MIT | https://github.com/facebook/react.git | LICENSE |
| tailwindcss | 3.4.19 | MIT | https://github.com/tailwindlabs/tailwindcss.git#v3 | LICENSE |
| typescript | 4.9.5 | Apache-2.0 | https://github.com/Microsoft/TypeScript.git | LICENSE.txt |
| typescript | 5.9.3 | Apache-2.0 | https://github.com/microsoft/TypeScript.git | LICENSE.txt |
| vercel | 34.4.0 | Apache-2.0 | https://github.com/vercel/vercel.git | LICENSE |
| vitest | 1.6.1 | MIT | git+https://github.com/vitest-dev/vitest.git | LICENSE.md |

## 完整 npm 依赖 Notices

| 包名 | 版本 | 许可证 | 直接依赖 | 锁文件 | 仓库/主页 | 许可证文件 | NOTICE 文件 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| @alloc/quick-lru | 5.2.0 | MIT | 否 | 是 | sindresorhus/quick-lru | license | - |
| @asamuzakjp/css-color | 3.2.0 | MIT | 否 | 是 | git+https://github.com/asamuzaK/cssColor.git | LICENSE | - |
| @cloudbase/cli | 3.3.3 | ISC | 是 | 是 | - | - | - |
| @cspotcode/source-map-support | 0.8.1 | MIT | 否 | 是 | https://github.com/cspotcode/node-source-map-support | LICENSE.md | - |
| @csstools/color-helpers | 5.1.0 | MIT-0 | 否 | 是 | git+https://github.com/csstools/postcss-plugins.git | LICENSE.md | - |
| @csstools/css-calc | 2.1.4 | MIT | 否 | 是 | git+https://github.com/csstools/postcss-plugins.git | LICENSE.md | - |
| @csstools/css-color-parser | 3.1.0 | MIT | 否 | 是 | git+https://github.com/csstools/postcss-plugins.git | LICENSE.md | - |
| @csstools/css-parser-algorithms | 3.0.5 | MIT | 否 | 是 | git+https://github.com/csstools/postcss-plugins.git | LICENSE.md | - |
| @csstools/css-tokenizer | 3.0.4 | MIT | 否 | 是 | git+https://github.com/csstools/postcss-plugins.git | LICENSE.md | - |
| @edge-runtime/format | 2.2.1 | MPL-2.0 | 否 | 是 | git+https://github.com/vercel/edge-runtime.git | LICENSE.md | - |
| @edge-runtime/node-utils | 2.3.0 | MPL-2.0 | 否 | 是 | git+https://github.com/vercel/edge-runtime.git | LICENSE.md | - |
| @edge-runtime/ponyfill | 2.4.2 | MPL-2.0 | 否 | 是 | git+https://github.com/vercel/edge-runtime.git | LICENSE.md | - |
| @edge-runtime/primitives | 4.1.0 | MPL-2.0 | 否 | 是 | git+https://github.com/vercel/edge-runtime.git | LICENSE.md | - |
| @edge-runtime/vm | 3.2.0 | MPL-2.0 | 否 | 是 | git+https://github.com/vercel/edge-runtime.git | LICENSE.md | - |
| @esbuild/win32-x64 | 0.21.5 | MIT | 否 | 是 | git+https://github.com/evanw/esbuild.git | - | - |
| @eslint-community/eslint-utils | 4.9.1 | MIT | 否 | 是 | https://github.com/eslint-community/eslint-utils | LICENSE | - |
| @eslint-community/regexpp | 4.12.2 | MIT | 否 | 是 | https://github.com/eslint-community/regexpp | LICENSE | - |
| @eslint/eslintrc | 2.1.4 | MIT | 否 | 是 | eslint/eslintrc | LICENSE | - |
| @eslint/js | 8.57.1 | MIT | 否 | 是 | https://github.com/eslint/eslint.git | LICENSE | - |
| @fast-csv/format | 4.3.5 | MIT | 否 | 是 | git+https://github.com/C2FO/fast-csv.git | LICENSE | - |
| @fast-csv/parse | 4.3.6 | MIT | 否 | 是 | git+https://github.com/C2FO/fast-csv.git | LICENSE | - |
| @fastify/busboy | 2.1.1 | MIT | 否 | 是 | git+https://github.com/fastify/busboy.git | LICENSE | - |
| @ffmpeg/core | 0.12.10 | GPL-2.0-or-later | 是 | 是 | git+https://github.com/ffmpegwasm/ffmpeg.wasm.git | - | - |
| @ffmpeg/ffmpeg | 0.12.15 | MIT | 是 | 是 | git+https://github.com/ffmpegwasm/ffmpeg.wasm.git | - | - |
| @ffmpeg/types | 0.12.4 | MIT | 否 | 是 | git+https://github.com/ffmpegwasm/ffmpeg.wasm.git | - | - |
| @ffmpeg/util | 0.12.2 | MIT | 是 | 是 | git+https://github.com/ffmpegwasm/ffmpeg.wasm.git | - | - |
| @gsap/react | 2.1.2 | SEE LICENSE AT https://gsap.com/standard-license | 是 | 是 | git+https://github.com/greensock/react.git | - | - |
| @humanwhocodes/config-array | 0.13.0 | Apache-2.0 | 否 | 是 | git+https://github.com/humanwhocodes/config-array.git | LICENSE | - |
| @humanwhocodes/module-importer | 1.0.1 | Apache-2.0 | 否 | 是 | git+https://github.com/humanwhocodes/module-importer.git | LICENSE | - |
| @humanwhocodes/object-schema | 2.0.3 | BSD-3-Clause | 否 | 是 | git+https://github.com/humanwhocodes/object-schema.git | LICENSE | - |
| @img/colour | 1.1.0 | MIT | 否 | 是 | git+https://github.com/lovell/colour.git | LICENSE.md | - |
| @img/sharp-win32-x64 | 0.34.5 | Apache-2.0 AND LGPL-3.0-or-later | 否 | 是 | git+https://github.com/lovell/sharp.git | LICENSE | - |
| @jest/schemas | 29.6.3 | MIT | 否 | 是 | https://github.com/jestjs/jest.git | LICENSE | - |
| @jridgewell/gen-mapping | 0.3.13 | MIT | 否 | 是 | git+https://github.com/jridgewell/sourcemaps.git | LICENSE | - |
| @jridgewell/resolve-uri | 3.1.2 | MIT | 否 | 是 | https://github.com/jridgewell/resolve-uri | LICENSE | - |
| @jridgewell/sourcemap-codec | 1.5.5 | MIT | 否 | 是 | git+https://github.com/jridgewell/sourcemaps.git | LICENSE | - |
| @jridgewell/trace-mapping | 0.3.31 | MIT | 否 | 是 | git+https://github.com/jridgewell/sourcemaps.git | LICENSE | - |
| @jridgewell/trace-mapping | 0.3.9 | MIT | 否 | 是 | git+https://github.com/jridgewell/trace-mapping.git | LICENSE | - |
| @mapbox/node-pre-gyp | 1.0.11 | BSD-3-Clause | 否 | 是 | git://github.com/mapbox/node-pre-gyp.git | LICENSE | - |
| @napi-rs/canvas | 0.1.100 | MIT | 否 | 是 | git+https://github.com/Brooooooklyn/canvas.git | LICENSE | - |
| @napi-rs/canvas-win32-x64-msvc | 0.1.100 | MIT | 否 | 是 | git+https://github.com/Brooooooklyn/canvas.git | - | - |
| @next/env | 15.5.18 | MIT | 否 | 是 | https://github.com/vercel/next.js | - | - |
| @next/eslint-plugin-next | 15.5.18 | MIT | 否 | 是 | vercel/next.js | - | - |
| @next/swc-win32-x64-msvc | 15.5.18 | MIT | 否 | 是 | https://github.com/vercel/next.js | - | - |
| @nodelib/fs.scandir | 2.1.5 | MIT | 否 | 是 | https://github.com/nodelib/nodelib/tree/master/packages/fs/fs.scandir | LICENSE | - |
| @nodelib/fs.stat | 2.0.5 | MIT | 否 | 是 | https://github.com/nodelib/nodelib/tree/master/packages/fs/fs.stat | LICENSE | - |
| @nodelib/fs.walk | 1.2.8 | MIT | 否 | 是 | https://github.com/nodelib/nodelib/tree/master/packages/fs/fs.walk | LICENSE | - |
| @nolyfill/is-core-module | 1.0.39 | MIT | 否 | 是 | https://github.com/SukkaW/nolyfill | LICENSE | - |
| @playwright/test | 1.60.0 | Apache-2.0 | 是 | 是 | git+https://github.com/microsoft/playwright.git | LICENSE | NOTICE |
| @rollup/pluginutils | 4.2.1 | MIT | 否 | 是 | rollup/plugins | - | - |
| @rollup/rollup-win32-x64-gnu | 4.60.4 | MIT | 否 | 是 | git+https://github.com/rollup/rollup.git | - | - |
| @rollup/rollup-win32-x64-msvc | 4.60.4 | MIT | 否 | 是 | git+https://github.com/rollup/rollup.git | - | - |
| @rtsao/scc | 1.1.0 | MIT | 否 | 是 | rtsao/scc | LICENSE | - |
| @rushstack/eslint-patch | 1.16.1 | MIT | 否 | 是 | https://github.com/microsoft/rushstack.git | LICENSE | - |
| @sinclair/typebox | 0.25.24 | MIT | 否 | 是 | https://github.com/sinclairzx81/typebox | license | - |
| @sinclair/typebox | 0.27.10 | MIT | 否 | 是 | https://github.com/sinclairzx81/typebox-legacy | license | - |
| @swc/helpers | 0.5.15 | Apache-2.0 | 否 | 是 | git+https://github.com/swc-project/swc.git | LICENSE | - |
| @tauri-apps/api | 1.6.0 | Apache-2.0 OR MIT | 是 | 是 | git+https://github.com/tauri-apps/tauri.git | - | - |
| @tauri-apps/cli | 1.6.3 | Apache-2.0 OR MIT | 是 | 是 | git+https://github.com/tauri-apps/tauri.git | - | - |
| @tauri-apps/cli-win32-x64-msvc | 1.6.3 | MIT | 否 | 是 | - | - | - |
| @tootallnate/once | 2.0.0 | MIT | 否 | 是 | git://github.com/TooTallNate/once.git | LICENSE | - |
| @ts-morph/common | 0.11.1 | MIT | 否 | 是 | git+https://github.com/dsherret/ts-morph.git | LICENSE | - |
| @tsconfig/node10 | 1.0.12 | MIT | 否 | 是 | https://github.com/tsconfig/bases.git | LICENSE | - |
| @tsconfig/node12 | 1.0.11 | MIT | 否 | 是 | https://github.com/tsconfig/bases.git | LICENSE | - |
| @tsconfig/node14 | 1.0.3 | MIT | 否 | 是 | https://github.com/tsconfig/bases.git | LICENSE | - |
| @tsconfig/node16 | 1.0.4 | MIT | 否 | 是 | https://github.com/tsconfig/bases.git | LICENSE | - |
| @types/estree | 1.0.8 | MIT | 否 | 是 | https://github.com/DefinitelyTyped/DefinitelyTyped.git | LICENSE | - |
| @types/estree | 1.0.9 | MIT | 否 | 是 | https://github.com/DefinitelyTyped/DefinitelyTyped.git | LICENSE | - |
| @types/file-saver | 2.0.7 | MIT | 是 | 是 | https://github.com/DefinitelyTyped/DefinitelyTyped.git | LICENSE | - |
| @types/json-schema | 7.0.15 | MIT | 否 | 是 | https://github.com/DefinitelyTyped/DefinitelyTyped.git | LICENSE | - |
| @types/json5 | 0.0.29 | MIT | 否 | 是 | https://www.github.com/DefinitelyTyped/DefinitelyTyped.git | - | - |
| @types/node | 14.18.63 | MIT | 是 | 是 | https://github.com/DefinitelyTyped/DefinitelyTyped.git | LICENSE | - |
| @types/node | 16.18.11 | MIT | 是 | 是 | https://github.com/DefinitelyTyped/DefinitelyTyped.git | LICENSE | - |
| @types/node | 20.19.41 | MIT | 是 | 是 | https://github.com/DefinitelyTyped/DefinitelyTyped.git | LICENSE | - |
| @types/prop-types | 15.7.15 | MIT | 否 | 是 | https://github.com/DefinitelyTyped/DefinitelyTyped.git | LICENSE | - |
| @types/react | 18.3.28 | MIT | 是 | 是 | https://github.com/DefinitelyTyped/DefinitelyTyped.git | LICENSE | - |
| @types/react-dom | 18.3.7 | MIT | 是 | 是 | https://github.com/DefinitelyTyped/DefinitelyTyped.git | LICENSE | - |
| @typescript-eslint/eslint-plugin | 8.59.3 | MIT | 否 | 是 | https://github.com/typescript-eslint/typescript-eslint.git | LICENSE | - |
| @typescript-eslint/parser | 8.59.3 | MIT | 否 | 是 | https://github.com/typescript-eslint/typescript-eslint.git | LICENSE | - |
| @typescript-eslint/project-service | 8.59.3 | MIT | 否 | 是 | https://github.com/typescript-eslint/typescript-eslint.git | LICENSE | - |
| @typescript-eslint/scope-manager | 8.59.3 | MIT | 否 | 是 | https://github.com/typescript-eslint/typescript-eslint.git | LICENSE | - |
| @typescript-eslint/tsconfig-utils | 8.59.3 | MIT | 否 | 是 | https://github.com/typescript-eslint/typescript-eslint.git | LICENSE | - |
| @typescript-eslint/type-utils | 8.59.3 | MIT | 否 | 是 | https://github.com/typescript-eslint/typescript-eslint.git | LICENSE | - |
| @typescript-eslint/types | 8.59.3 | MIT | 否 | 是 | https://github.com/typescript-eslint/typescript-eslint.git | LICENSE | - |
| @typescript-eslint/typescript-estree | 8.59.3 | MIT | 否 | 是 | https://github.com/typescript-eslint/typescript-eslint.git | LICENSE | - |
| @typescript-eslint/utils | 8.59.3 | MIT | 否 | 是 | https://github.com/typescript-eslint/typescript-eslint.git | LICENSE | - |
| @typescript-eslint/visitor-keys | 8.59.3 | MIT | 否 | 是 | https://github.com/typescript-eslint/typescript-eslint.git | LICENSE | - |
| @ungap/structured-clone | 1.3.1 | ISC | 否 | 是 | git+https://github.com/ungap/structured-clone.git | LICENSE | - |
| @unrs/resolver-binding-win32-x64-msvc | 1.11.1 | MIT | 否 | 是 | git+https://github.com/unrs/unrs-resolver.git | - | - |
| @vercel/build-utils | 8.3.2 | Apache-2.0 | 否 | 是 | https://github.com/vercel/vercel.git | LICENSE | - |
| @vercel/error-utils | 2.0.2 | Apache-2.0 | 否 | 是 | https://github.com/vercel/vercel.git | LICENSE | - |
| @vercel/fun | 1.1.0 | Apache-2.0 | 否 | 是 | vercel/fun | license.md | - |
| @vercel/gatsby-plugin-vercel-analytics | 1.0.11 | Apache-2.0 | 否 | 是 | https://github.com/vercel/vercel.git | LICENSE | - |
| @vercel/gatsby-plugin-vercel-builder | 2.0.36 | 未声明 | 否 | 是 | https://github.com/vercel/vercel.git | LICENSE | - |
| @vercel/go | 3.1.1 | Apache-2.0 | 否 | 是 | https://github.com/vercel/vercel.git | LICENSE | - |
| @vercel/hydrogen | 1.0.2 | Apache-2.0 | 否 | 是 | https://github.com/vercel/vercel.git | LICENSE | - |
| @vercel/next | 4.3.2 | Apache-2.0 | 否 | 是 | https://github.com/vercel/vercel.git | LICENSE | - |
| @vercel/nft | 0.27.2 | MIT | 否 | 是 | vercel/nft | LICENSE | - |
| @vercel/node | 3.2.3 | Apache-2.0 | 否 | 是 | https://github.com/vercel/vercel.git | LICENSE | - |
| @vercel/python | 4.3.0 | Apache-2.0 | 否 | 是 | https://github.com/vercel/vercel.git | LICENSE | - |
| @vercel/redwood | 2.1.0 | Apache-2.0 | 否 | 是 | https://github.com/vercel/vercel.git | LICENSE | - |
| @vercel/remix-builder | 2.1.10 | Apache-2.0 | 否 | 是 | https://github.com/vercel/vercel.git | LICENSE | - |
| @vercel/routing-utils | 3.1.0 | Apache-2.0 | 否 | 是 | https://github.com/vercel/vercel.git | LICENSE | - |
| @vercel/ruby | 2.1.0 | Apache-2.0 | 否 | 是 | https://github.com/vercel/vercel.git | LICENSE | - |
| @vercel/static-build | 2.5.14 | Apache-2.0 | 否 | 是 | https://github.com/vercel/vercel.git | LICENSE | - |
| @vercel/static-config | 3.0.0 | Apache-2.0 | 否 | 是 | https://github.com/vercel/vercel.git | LICENSE | - |
| @vitest/expect | 1.6.1 | MIT | 否 | 是 | git+https://github.com/vitest-dev/vitest.git | LICENSE | - |
| @vitest/runner | 1.6.1 | MIT | 否 | 是 | git+https://github.com/vitest-dev/vitest.git | LICENSE | - |
| @vitest/snapshot | 1.6.1 | MIT | 否 | 是 | git+https://github.com/vitest-dev/vitest.git | LICENSE | - |
| @vitest/spy | 1.6.1 | MIT | 否 | 是 | git+https://github.com/vitest-dev/vitest.git | LICENSE | - |
| @vitest/utils | 1.6.1 | MIT | 否 | 是 | git+https://github.com/vitest-dev/vitest.git | LICENSE | - |
| abbrev | 1.1.1 | ISC | 否 | 是 | http://github.com/isaacs/abbrev-js | LICENSE | - |
| acorn | 8.16.0 | MIT | 否 | 是 | git+https://github.com/acornjs/acorn.git | LICENSE | - |
| acorn-import-attributes | 1.9.5 | MIT | 否 | 是 | https://github.com/xtuc/acorn-import-attributes | LICENSE | - |
| acorn-jsx | 5.3.2 | MIT | 否 | 是 | https://github.com/acornjs/acorn-jsx | LICENSE | - |
| acorn-walk | 8.3.5 | MIT | 否 | 是 | https://github.com/acornjs/acorn.git | LICENSE | - |
| agent-base | 6.0.2 | MIT | 否 | 是 | git://github.com/TooTallNate/node-agent-base.git | - | - |
| agent-base | 7.1.4 | MIT | 否 | 是 | https://github.com/TooTallNate/proxy-agents.git | LICENSE | - |
| ajv | 6.15.0 | MIT | 否 | 是 | https://github.com/ajv-validator/ajv.git | LICENSE | - |
| ajv | 8.6.3 | MIT | 否 | 是 | ajv-validator/ajv | LICENSE | - |
| ansi-regex | 5.0.1 | MIT | 否 | 是 | chalk/ansi-regex | license | - |
| ansi-styles | 4.3.0 | MIT | 否 | 是 | chalk/ansi-styles | license | - |
| ansi-styles | 5.2.0 | MIT | 否 | 是 | chalk/ansi-styles | license | - |
| any-promise | 1.3.0 | MIT | 否 | 是 | https://github.com/kevinbeaty/any-promise | LICENSE | - |
| anymatch | 3.1.3 | ISC | 否 | 是 | https://github.com/micromatch/anymatch | LICENSE | - |
| aproba | 2.1.0 | ISC | 否 | 是 | https://github.com/iarna/aproba | LICENSE | - |
| archiver | 5.3.2 | MIT | 否 | 是 | https://github.com/archiverjs/node-archiver.git | LICENSE | - |
| archiver-utils | 2.1.0 | MIT | 否 | 是 | https://github.com/archiverjs/archiver-utils.git | LICENSE | - |
| archiver-utils | 3.0.4 | MIT | 否 | 是 | https://github.com/archiverjs/archiver-utils.git | LICENSE | - |
| are-we-there-yet | 2.0.0 | ISC | 否 | 是 | https://github.com/npm/are-we-there-yet.git | LICENSE.md | - |
| arg | 4.1.0 | MIT | 否 | 是 | zeit/arg | LICENSE.md | - |
| arg | 4.1.3 | MIT | 否 | 是 | zeit/arg | LICENSE.md | - |
| arg | 5.0.2 | MIT | 否 | 是 | vercel/arg | LICENSE.md | - |
| argparse | 2.0.1 | Python-2.0 | 否 | 是 | nodeca/argparse | LICENSE | - |
| aria-query | 5.3.2 | Apache-2.0 | 否 | 是 | git+https://github.com/A11yance/aria-query.git | LICENSE | - |
| array-buffer-byte-length | 1.0.2 | MIT | 否 | 是 | git+https://github.com/inspect-js/array-buffer-byte-length.git | LICENSE | - |
| array-includes | 3.1.9 | MIT | 否 | 是 | git://github.com/es-shims/array-includes.git | LICENSE | - |
| array.prototype.findlast | 1.2.5 | MIT | 否 | 是 | git+https://github.com/es-shims/Array.prototype.findLast.git | LICENSE | - |
| array.prototype.findlastindex | 1.2.6 | MIT | 否 | 是 | git+https://github.com/es-shims/Array.prototype.findLastIndex.git | LICENSE | - |
| array.prototype.flat | 1.3.3 | MIT | 否 | 是 | git://github.com/es-shims/Array.prototype.flat.git | LICENSE | - |
| array.prototype.flatmap | 1.3.3 | MIT | 否 | 是 | git://github.com/es-shims/Array.prototype.flatMap.git | LICENSE | - |
| array.prototype.tosorted | 1.1.4 | MIT | 否 | 是 | git+https://github.com/es-shims/Array.prototype.toSorted.git | LICENSE | - |
| arraybuffer.prototype.slice | 1.0.4 | MIT | 否 | 是 | git+https://github.com/es-shims/ArrayBuffer.prototype.slice.git | LICENSE | - |
| assertion-error | 1.1.0 | MIT | 否 | 是 | git@github.com:chaijs/assertion-error.git | - | - |
| ast-types-flow | 0.0.8 | MIT | 否 | 是 | git+https://github.com/kyldvs/ast-types-flow.git | LICENSE | - |
| async | 3.2.6 | MIT | 否 | 是 | https://github.com/caolan/async.git | LICENSE | - |
| async-function | 1.0.0 | MIT | 否 | 是 | git+https://github.com/ljharb/async-function.git | LICENSE | - |
| async-listen | 1.2.0 | MIT | 否 | 是 | git://github.com/zeit/async-listen.git | - | - |
| async-listen | 3.0.0 | MIT | 否 | 是 | git://github.com/vercel/async-listen.git | - | - |
| async-listen | 3.0.1 | MIT | 否 | 是 | vercel/async-listen | - | - |
| async-sema | 3.1.1 | MIT | 否 | 是 | git+https://github.com/vercel/async-sema.git | license.md | - |
| asynckit | 0.4.0 | MIT | 否 | 是 | git+https://github.com/alexindigo/asynckit.git | LICENSE | - |
| autoprefixer | 10.5.0 | MIT | 是 | 是 | postcss/autoprefixer | LICENSE | - |
| available-typed-arrays | 1.0.7 | MIT | 否 | 是 | git+https://github.com/inspect-js/available-typed-arrays.git | LICENSE | - |
| axe-core | 4.11.4 | MPL-2.0 | 否 | 是 | https://github.com/dequelabs/axe-core.git | LICENSE | - |
| axobject-query | 4.1.0 | Apache-2.0 | 否 | 是 | git+https://github.com/A11yance/axobject-query.git | LICENSE | - |
| balanced-match | 1.0.2 | MIT | 否 | 是 | git://github.com/juliangruber/balanced-match.git | LICENSE.md | - |
| balanced-match | 4.0.4 | MIT | 否 | 是 | git://github.com/juliangruber/balanced-match.git | LICENSE.md | - |
| base64-js | 1.5.1 | MIT | 否 | 是 | git://github.com/beatgammit/base64-js.git | LICENSE | - |
| baseline-browser-mapping | 2.10.30 | Apache-2.0 | 否 | 是 | git+https://github.com/web-platform-dx/baseline-browser-mapping.git | LICENSE.txt | - |
| big-integer | 1.6.52 | Unlicense | 否 | 是 | git@github.com:peterolson/BigInteger.js.git | LICENSE | - |
| binary | 0.3.0 | MIT | 否 | 是 | http://github.com/substack/node-binary.git | - | - |
| binary-extensions | 2.3.0 | MIT | 否 | 是 | sindresorhus/binary-extensions | license | - |
| bindings | 1.5.0 | MIT | 否 | 是 | git://github.com/TooTallNate/node-bindings.git | LICENSE.md | - |
| bl | 4.1.0 | MIT | 否 | 是 | https://github.com/rvagg/bl.git | LICENSE.md | - |
| bluebird | 3.4.7 | MIT | 否 | 是 | git://github.com/petkaantonov/bluebird.git | LICENSE | - |
| brace-expansion | 1.1.14 | MIT | 否 | 是 | git://github.com/juliangruber/brace-expansion.git | LICENSE | - |
| brace-expansion | 2.1.0 | MIT | 否 | 是 | git://github.com/juliangruber/brace-expansion.git | LICENSE | - |
| brace-expansion | 5.0.6 | MIT | 否 | 是 | git+ssh://git@github.com/juliangruber/brace-expansion.git | LICENSE | - |
| braces | 3.0.3 | MIT | 否 | 是 | micromatch/braces | LICENSE | - |
| browser-image-compression | 2.0.2 | MIT | 是 | 是 | https://github.com/Donaldcwl/browser-image-compression | LICENSE | - |
| browserslist | 4.28.2 | MIT | 否 | 是 | browserslist/browserslist | LICENSE | - |
| buffer | 5.7.1 | MIT | 否 | 是 | git://github.com/feross/buffer.git | LICENSE | - |
| buffer-crc32 | 0.2.13 | MIT | 否 | 是 | git://github.com/brianloveswords/buffer-crc32.git | LICENSE | - |
| buffer-indexof-polyfill | 1.0.2 | MIT | 否 | 是 | git+https://github.com/sarosia/buffer-indexof-polyfill.git | LICENSE | - |
| buffers | 0.1.1 | 未声明 | 否 | 是 | http://github.com/substack/node-buffers.git | - | - |
| bytes | 3.1.0 | MIT | 否 | 是 | visionmedia/bytes.js | LICENSE | - |
| cac | 6.7.14 | MIT | 否 | 是 | egoist/cac | LICENSE | - |
| call-bind | 1.0.9 | MIT | 否 | 是 | git+https://github.com/ljharb/call-bind.git | LICENSE | - |
| call-bind-apply-helpers | 1.0.2 | MIT | 否 | 是 | git+https://github.com/ljharb/call-bind-apply-helpers.git | LICENSE | - |
| call-bound | 1.0.4 | MIT | 否 | 是 | git+https://github.com/ljharb/call-bound.git | LICENSE | - |
| callsites | 3.1.0 | MIT | 否 | 是 | sindresorhus/callsites | license | - |
| camelcase-css | 2.0.1 | MIT | 否 | 是 | stevenvachon/camelcase-css | license | - |
| caniuse-lite | 1.0.30001792 | CC-BY-4.0 | 否 | 是 | browserslist/caniuse-lite | LICENSE | - |
| chai | 4.5.0 | MIT | 否 | 是 | https://github.com/chaijs/chai | LICENSE | - |
| chainsaw | 0.1.0 | MIT/X11 | 否 | 是 | http://github.com/substack/node-chainsaw.git | - | - |
| chalk | 4.1.2 | MIT | 否 | 是 | chalk/chalk | license | - |
| check-error | 1.0.3 | MIT | 否 | 是 | git+ssh://git@github.com/chaijs/check-error.git | LICENSE | - |
| chokidar | 3.3.1 | MIT | 否 | 是 | git+https://github.com/paulmillr/chokidar.git | LICENSE | - |
| chokidar | 3.6.0 | MIT | 否 | 是 | git+https://github.com/paulmillr/chokidar.git | LICENSE | - |
| chownr | 1.1.4 | ISC | 否 | 是 | git://github.com/isaacs/chownr.git | LICENSE | - |
| chownr | 2.0.0 | ISC | 否 | 是 | git://github.com/isaacs/chownr.git | LICENSE | - |
| cjs-module-lexer | 1.2.3 | MIT | 否 | 是 | git+https://github.com/nodejs/cjs-module-lexer.git | LICENSE | - |
| client-only | 0.0.1 | MIT | 否 | 是 | https://reactjs.org/ | - | - |
| code-block-writer | 10.1.1 | MIT | 否 | 是 | git+https://github.com/dsherret/code-block-writer.git | LICENSE | - |
| color-convert | 2.0.1 | MIT | 否 | 是 | Qix-/color-convert | LICENSE | - |
| color-name | 1.1.4 | MIT | 否 | 是 | git@github.com:colorjs/color-name.git | LICENSE | - |
| color-support | 1.1.3 | ISC | 否 | 是 | git+https://github.com/isaacs/color-support.git | LICENSE | - |
| combined-stream | 1.0.8 | MIT | 否 | 是 | git://github.com/felixge/node-combined-stream.git | License | - |
| commander | 4.1.1 | MIT | 否 | 是 | https://github.com/tj/commander.js.git | LICENSE | - |
| compress-commons | 4.1.2 | MIT | 否 | 是 | https://github.com/archiverjs/node-compress-commons.git | LICENSE | - |
| concat-map | 0.0.1 | MIT | 否 | 是 | git://github.com/substack/node-concat-map.git | LICENSE | - |
| confbox | 0.1.8 | MIT | 否 | 是 | unjs/confbox | LICENSE | - |
| console-control-strings | 1.1.0 | ISC | 否 | 是 | https://github.com/iarna/console-control-strings | LICENSE | - |
| content-type | 1.0.4 | MIT | 否 | 是 | jshttp/content-type | LICENSE | - |
| convert-hrtime | 3.0.0 | MIT | 否 | 是 | sindresorhus/convert-hrtime | license | - |
| core-util-is | 1.0.3 | MIT | 否 | 是 | git://github.com/isaacs/core-util-is | LICENSE | - |
| crc-32 | 1.2.2 | Apache-2.0 | 否 | 是 | git://github.com/SheetJS/js-crc32.git | LICENSE | - |
| crc32-stream | 4.0.3 | MIT | 否 | 是 | https://github.com/archiverjs/node-crc32-stream.git | LICENSE | - |
| create-require | 1.1.1 | MIT | 否 | 是 | nuxt-contrib/create-require | LICENSE | - |
| cropperjs | 1.6.2 | MIT | 是 | 是 | git+https://github.com/fengyuanchen/cropperjs.git | LICENSE | - |
| cross-spawn | 7.0.6 | MIT | 否 | 是 | git@github.com:moxystudio/node-cross-spawn.git | LICENSE | - |
| cssesc | 3.0.0 | MIT | 否 | 是 | https://github.com/mathiasbynens/cssesc.git | - | - |
| cssstyle | 4.6.0 | MIT | 否 | 是 | jsdom/cssstyle | LICENSE | - |
| csstype | 3.2.3 | MIT | 否 | 是 | https://github.com/frenic/csstype | LICENSE | - |
| damerau-levenshtein | 1.0.8 | BSD-2-Clause | 否 | 是 | https://github.com/tad-lispy/node-damerau-levenshtein.git | LICENSE | - |
| data-urls | 5.0.0 | MIT | 否 | 是 | jsdom/data-urls | LICENSE.txt | - |
| data-view-buffer | 1.0.2 | MIT | 否 | 是 | git+https://github.com/inspect-js/data-view-buffer.git | LICENSE | - |
| data-view-byte-length | 1.0.2 | MIT | 否 | 是 | git+https://github.com/inspect-js/data-view-byte-length.git | LICENSE | - |
| data-view-byte-offset | 1.0.1 | MIT | 否 | 是 | git+https://github.com/inspect-js/data-view-byte-offset.git | LICENSE | - |
| dayjs | 1.11.20 | MIT | 否 | 是 | https://github.com/iamkun/dayjs.git | LICENSE | - |
| debug | 3.2.7 | MIT | 否 | 是 | git://github.com/visionmedia/debug.git | LICENSE | - |
| debug | 4.1.1 | MIT | 否 | 是 | git://github.com/visionmedia/debug.git | LICENSE | - |
| debug | 4.4.3 | MIT | 否 | 是 | git://github.com/debug-js/debug.git | LICENSE | - |
| decimal.js | 10.6.0 | MIT | 否 | 是 | https://github.com/MikeMcl/decimal.js.git | LICENCE.md | - |
| deep-eql | 4.1.4 | MIT | 否 | 是 | git@github.com:chaijs/deep-eql.git | LICENSE | - |
| deep-is | 0.1.4 | MIT | 否 | 是 | http://github.com/thlorenz/deep-is.git | LICENSE | - |
| define-data-property | 1.1.4 | MIT | 否 | 是 | git+https://github.com/ljharb/define-data-property.git | LICENSE | - |
| define-properties | 1.2.1 | MIT | 否 | 是 | git://github.com/ljharb/define-properties.git | LICENSE | - |
| delayed-stream | 1.0.0 | MIT | 否 | 是 | git://github.com/felixge/node-delayed-stream.git | License | - |
| delegates | 1.0.0 | MIT | 否 | 是 | visionmedia/node-delegates | License | - |
| depd | 1.1.2 | MIT | 否 | 是 | dougwilson/nodejs-depd | LICENSE | - |
| detect-libc | 2.1.2 | Apache-2.0 | 否 | 是 | git://github.com/lovell/detect-libc.git | LICENSE | - |
| didyoumean | 1.2.2 | Apache-2.0 | 否 | 是 | https://github.com/dcporter/didyoumean.js.git | LICENSE | - |
| diff | 4.0.4 | BSD-3-Clause | 否 | 是 | git://github.com/kpdecker/jsdiff.git | LICENSE | - |
| diff-sequences | 29.6.3 | MIT | 否 | 是 | https://github.com/jestjs/jest.git | LICENSE | - |
| dlv | 1.1.3 | MIT | 否 | 是 | developit/dlv | - | - |
| doctrine | 2.1.0 | Apache-2.0 | 否 | 是 | eslint/doctrine | LICENSE, LICENSE.closure-compiler, LICENSE.esprima | - |
| doctrine | 3.0.0 | Apache-2.0 | 否 | 是 | eslint/doctrine | LICENSE, LICENSE.closure-compiler, LICENSE.esprima | - |
| dunder-proto | 1.0.1 | MIT | 否 | 是 | git+https://github.com/es-shims/dunder-proto.git | LICENSE | - |
| duplexer2 | 0.1.4 | BSD-3-Clause | 否 | 是 | deoxxa/duplexer2 | LICENSE.md | - |
| edge-runtime | 2.5.9 | MPL-2.0 | 否 | 是 | git+https://github.com/vercel/edge-runtime.git | LICENSE.md | - |
| electron-to-chromium | 1.5.357 | ISC | 否 | 是 | git+https://github.com/Kilian/electron-to-chromium.git | LICENSE | - |
| emoji-regex | 8.0.0 | MIT | 否 | 是 | https://github.com/mathiasbynens/emoji-regex.git | - | - |
| emoji-regex | 9.2.2 | MIT | 否 | 是 | https://github.com/mathiasbynens/emoji-regex.git | - | - |
| end-of-stream | 1.1.0 | MIT | 否 | 是 | git://github.com/mafintosh/end-of-stream.git | LICENSE | - |
| end-of-stream | 1.4.5 | MIT | 否 | 是 | git://github.com/mafintosh/end-of-stream.git | LICENSE | - |
| entities | 6.0.1 | BSD-2-Clause | 否 | 是 | git://github.com/fb55/entities.git | LICENSE | - |
| es-abstract | 1.24.2 | MIT | 否 | 是 | git://github.com/ljharb/es-abstract.git | LICENSE | - |
| es-define-property | 1.0.1 | MIT | 否 | 是 | git+https://github.com/ljharb/es-define-property.git | LICENSE | - |
| es-errors | 1.3.0 | MIT | 否 | 是 | git+https://github.com/ljharb/es-errors.git | LICENSE | - |
| es-iterator-helpers | 1.3.2 | MIT | 否 | 是 | git+https://github.com/es-shims/iterator-helpers.git | LICENSE | - |
| es-module-lexer | 1.4.1 | MIT | 否 | 是 | git+https://github.com/guybedford/es-module-lexer.git | LICENSE | - |
| es-object-atoms | 1.1.1 | MIT | 否 | 是 | git+https://github.com/ljharb/es-object-atoms.git | LICENSE | - |
| es-set-tostringtag | 2.1.0 | MIT | 否 | 是 | git+https://github.com/es-shims/es-set-tostringtag.git | LICENSE | - |
| es-shim-unscopables | 1.1.0 | MIT | 否 | 是 | git+https://github.com/ljharb/es-shim-unscopables.git | LICENSE | - |
| es-to-primitive | 1.3.0 | MIT | 否 | 是 | git://github.com/ljharb/es-to-primitive.git | LICENSE | - |
| esbuild | 0.14.47 | MIT | 否 | 是 | https://github.com/evanw/esbuild | LICENSE.md | - |
| esbuild | 0.21.5 | MIT | 否 | 是 | git+https://github.com/evanw/esbuild.git | LICENSE.md | - |
| esbuild-windows-64 | 0.14.47 | MIT | 否 | 是 | https://github.com/evanw/esbuild | - | - |
| escalade | 3.2.0 | MIT | 否 | 是 | lukeed/escalade | license | - |
| escape-string-regexp | 4.0.0 | MIT | 否 | 是 | sindresorhus/escape-string-regexp | license | - |
| eslint | 8.57.1 | MIT | 是 | 是 | eslint/eslint | LICENSE | - |
| eslint-config-next | 15.5.18 | MIT | 是 | 是 | vercel/next.js | - | - |
| eslint-import-resolver-node | 0.3.10 | MIT | 否 | 是 | https://github.com/import-js/eslint-plugin-import | LICENSE | - |
| eslint-import-resolver-typescript | 3.10.1 | ISC | 否 | 是 | https://github.com/import-js/eslint-import-resolver-typescript | LICENSE | - |
| eslint-module-utils | 2.12.1 | MIT | 否 | 是 | git+https://github.com/import-js/eslint-plugin-import.git | LICENSE | - |
| eslint-plugin-import | 2.32.0 | MIT | 否 | 是 | https://github.com/import-js/eslint-plugin-import | LICENSE | - |
| eslint-plugin-jsx-a11y | 6.10.2 | MIT | 否 | 是 | https://github.com/jsx-eslint/eslint-plugin-jsx-a11y | LICENSE.md | - |
| eslint-plugin-react | 7.37.5 | MIT | 否 | 是 | https://github.com/jsx-eslint/eslint-plugin-react | LICENSE | - |
| eslint-plugin-react-hooks | 5.2.0 | MIT | 否 | 是 | https://github.com/facebook/react.git | LICENSE | - |
| eslint-scope | 7.2.2 | BSD-2-Clause | 否 | 是 | eslint/eslint-scope | LICENSE | - |
| eslint-visitor-keys | 3.4.3 | Apache-2.0 | 否 | 是 | eslint/eslint-visitor-keys | LICENSE | - |
| eslint-visitor-keys | 5.0.1 | Apache-2.0 | 否 | 是 | https://github.com/eslint/js.git | LICENSE | - |
| espree | 9.6.1 | BSD-2-Clause | 否 | 是 | eslint/espree | LICENSE | - |
| esquery | 1.7.0 | BSD-3-Clause | 否 | 是 | https://github.com/estools/esquery.git | license.txt | - |
| esrecurse | 4.3.0 | BSD-2-Clause | 否 | 是 | https://github.com/estools/esrecurse.git | - | - |
| estraverse | 5.3.0 | BSD-2-Clause | 否 | 是 | http://github.com/estools/estraverse.git | LICENSE.BSD | - |
| estree-walker | 2.0.2 | MIT | 否 | 是 | https://github.com/Rich-Harris/estree-walker | LICENSE | - |
| estree-walker | 3.0.3 | MIT | 否 | 是 | https://github.com/Rich-Harris/estree-walker | LICENSE | - |
| esutils | 2.0.3 | BSD-2-Clause | 否 | 是 | http://github.com/estools/esutils.git | LICENSE.BSD | - |
| etag | 1.8.1 | MIT | 否 | 是 | jshttp/etag | LICENSE | - |
| events-intercept | 2.0.0 | MIT | 否 | 是 | https://github.com/brandonhorst/events-intercept.git | LICENSE | - |
| exceljs | 4.4.0 | MIT | 是 | 是 | https://github.com/exceljs/exceljs.git | LICENSE | - |
| execa | 3.2.0 | MIT | 否 | 是 | sindresorhus/execa | license | - |
| execa | 8.0.1 | MIT | 否 | 是 | sindresorhus/execa | license | - |
| fast-csv | 4.3.6 | MIT | 否 | 是 | git+https://github.com/C2FO/fast-csv.git | LICENSE | - |
| fast-deep-equal | 3.1.3 | MIT | 否 | 是 | git+https://github.com/epoberezkin/fast-deep-equal.git | LICENSE | - |
| fast-glob | 3.3.1 | MIT | 否 | 是 | mrmlnc/fast-glob | LICENSE | - |
| fast-glob | 3.3.3 | MIT | 否 | 是 | mrmlnc/fast-glob | LICENSE | - |
| fast-json-stable-stringify | 2.1.0 | MIT | 否 | 是 | git://github.com/epoberezkin/fast-json-stable-stringify.git | LICENSE | - |
| fast-levenshtein | 2.0.6 | MIT | 否 | 是 | https://github.com/hiddentao/fast-levenshtein.git | LICENSE.md | - |
| fastq | 1.20.1 | ISC | 否 | 是 | git+https://github.com/mcollina/fastq.git | LICENSE | - |
| fd-slicer | 1.1.0 | MIT | 否 | 是 | git://github.com/andrewrk/node-fd-slicer.git | LICENSE | - |
| fdir | 6.5.0 | MIT | 否 | 是 | git+https://github.com/thecodrr/fdir.git | LICENSE | - |
| file-entry-cache | 6.0.1 | MIT | 否 | 是 | royriojas/file-entry-cache | LICENSE | - |
| file-saver | 2.0.5 | MIT | 是 | 是 | https://github.com/eligrey/FileSaver.js | LICENSE.md | - |
| file-uri-to-path | 1.0.0 | MIT | 否 | 是 | git://github.com/TooTallNate/file-uri-to-path.git | LICENSE | - |
| fill-range | 7.1.1 | MIT | 否 | 是 | jonschlinkert/fill-range | LICENSE | - |
| find-up | 5.0.0 | MIT | 否 | 是 | sindresorhus/find-up | license | - |
| flat-cache | 3.2.0 | MIT | 否 | 是 | jaredwray/flat-cache | LICENSE | - |
| flatted | 3.4.2 | ISC | 否 | 是 | git+https://github.com/WebReflection/flatted.git | LICENSE | - |
| for-each | 0.3.5 | MIT | 否 | 是 | https://github.com/Raynos/for-each.git | LICENSE | - |
| form-data | 4.0.5 | MIT | 否 | 是 | git://github.com/form-data/form-data.git | License | - |
| fraction.js | 5.3.4 | MIT | 否 | 是 | git+ssh://git@github.com/rawify/Fraction.js.git | LICENSE | - |
| fs-constants | 1.0.0 | MIT | 否 | 是 | https://github.com/mafintosh/fs-constants.git | LICENSE | - |
| fs-extra | 11.1.0 | MIT | 否 | 是 | https://github.com/jprichardson/node-fs-extra | LICENSE | - |
| fs-extra | 8.1.0 | MIT | 否 | 是 | https://github.com/jprichardson/node-fs-extra | LICENSE | - |
| fs-minipass | 1.2.7 | ISC | 否 | 是 | git+https://github.com/npm/fs-minipass.git | LICENSE | - |
| fs-minipass | 2.1.0 | ISC | 否 | 是 | git+https://github.com/npm/fs-minipass.git | LICENSE | - |
| fs.realpath | 1.0.0 | ISC | 否 | 是 | git+https://github.com/isaacs/fs.realpath.git | LICENSE | - |
| fstream | 1.0.12 | ISC | 否 | 是 | https://github.com/npm/fstream.git | LICENSE | - |
| function-bind | 1.1.2 | MIT | 否 | 是 | https://github.com/Raynos/function-bind.git | LICENSE | - |
| function.prototype.name | 1.1.8 | MIT | 否 | 是 | git://github.com/es-shims/Function.prototype.name.git | LICENSE | - |
| functions-have-names | 1.2.3 | MIT | 否 | 是 | git+https://github.com/inspect-js/functions-have-names.git | LICENSE | - |
| gauge | 3.0.2 | ISC | 否 | 是 | https://github.com/iarna/gauge | LICENSE | - |
| generator-function | 2.0.1 | MIT | 否 | 是 | git+https://github.com/TimothyGu/generator-function.git | LICENSE.md | - |
| generic-pool | 3.4.2 | MIT | 否 | 是 | http://github.com/coopernurse/node-pool.git | - | - |
| get-func-name | 2.0.2 | MIT | 否 | 是 | git+ssh://git@github.com/chaijs/get-func-name.git | LICENSE | - |
| get-intrinsic | 1.3.0 | MIT | 否 | 是 | git+https://github.com/ljharb/get-intrinsic.git | LICENSE | - |
| get-proto | 1.0.1 | MIT | 否 | 是 | git+https://github.com/ljharb/get-proto.git | LICENSE | - |
| get-stream | 5.2.0 | MIT | 否 | 是 | sindresorhus/get-stream | license | - |
| get-stream | 8.0.1 | MIT | 否 | 是 | sindresorhus/get-stream | license | - |
| get-symbol-description | 1.1.0 | MIT | 否 | 是 | git+https://github.com/inspect-js/get-symbol-description.git | LICENSE | - |
| get-tsconfig | 4.14.0 | MIT | 否 | 是 | privatenumber/get-tsconfig | LICENSE | - |
| glob | 7.2.3 | ISC | 否 | 是 | git://github.com/isaacs/node-glob.git | LICENSE | - |
| glob-parent | 5.1.2 | ISC | 否 | 是 | gulpjs/glob-parent | LICENSE | - |
| glob-parent | 6.0.2 | ISC | 否 | 是 | gulpjs/glob-parent | LICENSE | - |
| globals | 13.24.0 | MIT | 否 | 是 | sindresorhus/globals | license | - |
| globalthis | 1.0.4 | MIT | 否 | 是 | git://github.com/ljharb/System.global.git | LICENSE | - |
| gopd | 1.2.0 | MIT | 否 | 是 | git+https://github.com/ljharb/gopd.git | LICENSE | - |
| graceful-fs | 4.2.11 | ISC | 否 | 是 | https://github.com/isaacs/node-graceful-fs | LICENSE | - |
| graphemer | 1.4.0 | MIT | 否 | 是 | https://github.com/flmnt/graphemer.git | LICENSE | - |
| gsap | 3.15.0 | Standard 'no charge' license: https://gsap.com/standard-license. | 是 | 是 | git+https://github.com/greensock/GSAP.git | - | - |
| has-bigints | 1.1.0 | MIT | 否 | 是 | git+https://github.com/ljharb/has-bigints.git | LICENSE | - |
| has-flag | 4.0.0 | MIT | 否 | 是 | sindresorhus/has-flag | license | - |
| has-property-descriptors | 1.0.2 | MIT | 否 | 是 | git+https://github.com/inspect-js/has-property-descriptors.git | LICENSE | - |
| has-proto | 1.2.0 | MIT | 否 | 是 | git+https://github.com/inspect-js/has-proto.git | LICENSE | - |
| has-symbols | 1.1.0 | MIT | 否 | 是 | git://github.com/inspect-js/has-symbols.git | LICENSE | - |
| has-tostringtag | 1.0.2 | MIT | 否 | 是 | git+https://github.com/inspect-js/has-tostringtag.git | LICENSE | - |
| has-unicode | 2.0.1 | ISC | 否 | 是 | https://github.com/iarna/has-unicode | LICENSE | - |
| hasown | 2.0.3 | MIT | 否 | 是 | git+https://github.com/inspect-js/hasOwn.git | LICENSE | - |
| html-encoding-sniffer | 4.0.0 | MIT | 否 | 是 | jsdom/html-encoding-sniffer | LICENSE.txt | - |
| http-errors | 1.4.0 | MIT | 否 | 是 | jshttp/http-errors | LICENSE | - |
| http-errors | 1.7.3 | MIT | 否 | 是 | jshttp/http-errors | LICENSE | - |
| http-proxy-agent | 7.0.2 | MIT | 否 | 是 | https://github.com/TooTallNate/proxy-agents.git | LICENSE | - |
| https-proxy-agent | 5.0.1 | MIT | 否 | 是 | git://github.com/TooTallNate/node-https-proxy-agent.git | - | - |
| https-proxy-agent | 7.0.6 | MIT | 否 | 是 | https://github.com/TooTallNate/proxy-agents.git | LICENSE | - |
| human-signals | 1.1.1 | Apache-2.0 | 否 | 是 | ehmicky/human-signals | LICENSE | - |
| human-signals | 5.0.0 | Apache-2.0 | 否 | 是 | ehmicky/human-signals | LICENSE | - |
| iconv-lite | 0.4.24 | MIT | 否 | 是 | git://github.com/ashtuchkin/iconv-lite.git | LICENSE | - |
| iconv-lite | 0.6.3 | MIT | 否 | 是 | git://github.com/ashtuchkin/iconv-lite.git | LICENSE | - |
| ieee754 | 1.2.1 | BSD-3-Clause | 否 | 是 | git://github.com/feross/ieee754.git | LICENSE | - |
| ignore | 5.3.2 | MIT | 否 | 是 | git@github.com:kaelzhang/node-ignore.git | - | - |
| ignore | 7.0.5 | MIT | 否 | 是 | git@github.com:kaelzhang/node-ignore.git | - | - |
| immediate | 3.0.6 | MIT | 否 | 是 | git://github.com/calvinmetcalf/immediate.git | LICENSE.txt | - |
| import-fresh | 3.3.1 | MIT | 否 | 是 | sindresorhus/import-fresh | license | - |
| imurmurhash | 0.1.4 | MIT | 否 | 是 | https://github.com/jensyt/imurmurhash-js | - | - |
| inflight | 1.0.6 | ISC | 否 | 是 | https://github.com/npm/inflight.git | LICENSE | - |
| inherits | 2.0.1 | ISC | 否 | 是 | git://github.com/isaacs/inherits | LICENSE | - |
| inherits | 2.0.4 | ISC | 否 | 是 | git://github.com/isaacs/inherits | LICENSE | - |
| internal-slot | 1.1.0 | MIT | 否 | 是 | git+https://github.com/ljharb/internal-slot.git | LICENSE | - |
| is-array-buffer | 3.0.5 | MIT | 否 | 是 | git+https://github.com/inspect-js/is-array-buffer.git | LICENSE | - |
| is-async-function | 2.1.1 | MIT | 否 | 是 | git://github.com/inspect-js/is-async-function.git | LICENSE | - |
| is-bigint | 1.1.0 | MIT | 否 | 是 | git+https://github.com/inspect-js/is-bigint.git | LICENSE | - |
| is-binary-path | 2.1.0 | MIT | 否 | 是 | sindresorhus/is-binary-path | license | - |
| is-boolean-object | 1.2.2 | MIT | 否 | 是 | git://github.com/inspect-js/is-boolean-object.git | LICENSE | - |
| is-bun-module | 2.0.0 | MIT | 否 | 是 | git+https://github.com/SunsetTechuila/is-bun-module.git | LICENSE | - |
| is-callable | 1.2.7 | MIT | 否 | 是 | git://github.com/inspect-js/is-callable.git | LICENSE | - |
| is-core-module | 2.16.2 | MIT | 否 | 是 | git+https://github.com/inspect-js/is-core-module.git | LICENSE | - |
| is-data-view | 1.0.2 | MIT | 否 | 是 | git+https://github.com/inspect-js/is-data-view.git | LICENSE | - |
| is-date-object | 1.1.0 | MIT | 否 | 是 | git://github.com/inspect-js/is-date-object.git | LICENSE | - |
| is-extglob | 2.1.1 | MIT | 否 | 是 | jonschlinkert/is-extglob | LICENSE | - |
| is-finalizationregistry | 1.1.1 | MIT | 否 | 是 | git+https://github.com/inspect-js/is-finalizationregistry.git | LICENSE | - |
| is-fullwidth-code-point | 3.0.0 | MIT | 否 | 是 | sindresorhus/is-fullwidth-code-point | license | - |
| is-generator-function | 1.1.2 | MIT | 否 | 是 | git://github.com/inspect-js/is-generator-function.git | LICENSE | - |
| is-glob | 4.0.3 | MIT | 否 | 是 | micromatch/is-glob | LICENSE | - |
| is-map | 2.0.3 | MIT | 否 | 是 | git+https://github.com/inspect-js/is-map.git | LICENSE | - |
| is-negative-zero | 2.0.3 | MIT | 否 | 是 | git://github.com/inspect-js/is-negative-zero.git | LICENSE | - |
| is-number | 7.0.0 | MIT | 否 | 是 | jonschlinkert/is-number | LICENSE | - |
| is-number-object | 1.1.1 | MIT | 否 | 是 | git://github.com/inspect-js/is-number-object.git | LICENSE | - |
| is-path-inside | 3.0.3 | MIT | 否 | 是 | sindresorhus/is-path-inside | license | - |
| is-potential-custom-element-name | 1.0.1 | MIT | 否 | 是 | https://github.com/mathiasbynens/is-potential-custom-element-name.git | - | - |
| is-regex | 1.2.1 | MIT | 否 | 是 | git://github.com/inspect-js/is-regex.git | LICENSE | - |
| is-set | 2.0.3 | MIT | 否 | 是 | git+https://github.com/inspect-js/is-set.git | LICENSE | - |
| is-shared-array-buffer | 1.0.4 | MIT | 否 | 是 | git+https://github.com/inspect-js/is-shared-array-buffer.git | LICENSE | - |
| is-stream | 2.0.1 | MIT | 否 | 是 | sindresorhus/is-stream | license | - |
| is-stream | 3.0.0 | MIT | 否 | 是 | sindresorhus/is-stream | license | - |
| is-string | 1.1.1 | MIT | 否 | 是 | git://github.com/inspect-js/is-string.git | LICENSE | - |
| is-symbol | 1.1.1 | MIT | 否 | 是 | git://github.com/inspect-js/is-symbol.git | LICENSE | - |
| is-typed-array | 1.1.15 | MIT | 否 | 是 | git://github.com/inspect-js/is-typed-array.git | LICENSE | - |
| is-weakmap | 2.0.2 | MIT | 否 | 是 | git+https://github.com/inspect-js/is-weakmap.git | LICENSE | - |
| is-weakref | 1.1.1 | MIT | 否 | 是 | git+https://github.com/inspect-js/is-weakref.git | LICENSE | - |
| is-weakset | 2.0.4 | MIT | 否 | 是 | git+https://github.com/inspect-js/is-weakset.git | LICENSE | - |
| isarray | 0.0.1 | MIT | 否 | 是 | git://github.com/juliangruber/isarray.git | - | - |
| isarray | 1.0.0 | MIT | 否 | 是 | git://github.com/juliangruber/isarray.git | - | - |
| isarray | 2.0.5 | MIT | 否 | 是 | git://github.com/juliangruber/isarray.git | LICENSE | - |
| isexe | 2.0.0 | ISC | 否 | 是 | git+https://github.com/isaacs/isexe.git | LICENSE | - |
| iterator.prototype | 1.1.5 | MIT | 否 | 是 | git+https://github.com/ljharb/Iterator.prototype.git | LICENSE | - |
| jiti | 1.21.7 | MIT | 否 | 是 | unjs/jiti | LICENSE | - |
| js-tokens | 4.0.0 | MIT | 否 | 是 | lydell/js-tokens | LICENSE | - |
| js-tokens | 9.0.1 | MIT | 否 | 是 | lydell/js-tokens | LICENSE | - |
| js-yaml | 4.1.1 | MIT | 否 | 是 | nodeca/js-yaml | LICENSE | - |
| jsdom | 24.1.3 | MIT | 是 | 是 | git+https://github.com/jsdom/jsdom.git | LICENSE.txt | - |
| json-buffer | 3.0.1 | MIT | 否 | 是 | git://github.com/dominictarr/json-buffer.git | LICENSE | - |
| json-schema-to-ts | 1.6.4 | MIT | 否 | 是 | git+https://github.com/ThomasAribart/json-schema-to-ts.git | LICENSE | - |
| json-schema-traverse | 0.4.1 | MIT | 否 | 是 | git+https://github.com/epoberezkin/json-schema-traverse.git | LICENSE | - |
| json-schema-traverse | 1.0.0 | MIT | 否 | 是 | git+https://github.com/epoberezkin/json-schema-traverse.git | LICENSE | - |
| json-stable-stringify-without-jsonify | 1.0.1 | MIT | 否 | 是 | git://github.com/samn/json-stable-stringify.git | LICENSE | - |
| json5 | 1.0.2 | MIT | 否 | 是 | git+https://github.com/json5/json5.git | LICENSE.md | - |
| jsonfile | 4.0.0 | MIT | 否 | 是 | git@github.com:jprichardson/node-jsonfile.git | LICENSE | - |
| jsonfile | 6.2.1 | MIT | 否 | 是 | git@github.com:jprichardson/node-jsonfile.git | LICENSE | - |
| jsx-ast-utils | 3.3.5 | MIT | 否 | 是 | https://github.com/jsx-eslint/jsx-ast-utils | LICENSE.md | - |
| jszip | 3.10.1 | (MIT OR GPL-3.0-or-later) | 是 | 是 | https://github.com/Stuk/jszip.git | LICENSE.markdown | - |
| keyv | 4.5.4 | MIT | 否 | 是 | git+https://github.com/jaredwray/keyv.git | - | - |
| language-subtag-registry | 0.3.23 | CC0-1.0 | 否 | 是 | https://github.com/mattcg/language-subtag-registry | - | - |
| language-tags | 1.0.9 | MIT | 否 | 是 | git://github.com/mattcg/language-tags.git | - | - |
| lazystream | 1.0.1 | MIT | 否 | 是 | https://github.com/jpommerening/node-lazystream.git | LICENSE | - |
| levn | 0.4.1 | MIT | 否 | 是 | git://github.com/gkz/levn.git | LICENSE | - |
| lie | 3.3.0 | MIT | 否 | 是 | https://github.com/calvinmetcalf/lie.git | license.md | - |
| lilconfig | 3.1.3 | MIT | 否 | 是 | https://github.com/antonk52/lilconfig | LICENSE | - |
| lines-and-columns | 1.2.4 | MIT | 否 | 是 | https://github.com/eventualbuddha/lines-and-columns.git | LICENSE | - |
| listenercount | 1.0.1 | ISC | 否 | 是 | git@github.com:jden/node-listenercount.git | LICENSE.md | - |
| local-pkg | 0.5.1 | MIT | 否 | 是 | git+https://github.com/antfu/local-pkg.git | LICENSE | - |
| locate-path | 6.0.0 | MIT | 否 | 是 | sindresorhus/locate-path | license | - |
| lodash.defaults | 4.2.0 | MIT | 否 | 是 | lodash/lodash | LICENSE | - |
| lodash.difference | 4.5.0 | MIT | 否 | 是 | lodash/lodash | LICENSE | - |
| lodash.escaperegexp | 4.1.2 | MIT | 否 | 是 | lodash/lodash | LICENSE | - |
| lodash.flatten | 4.4.0 | MIT | 否 | 是 | lodash/lodash | LICENSE | - |
| lodash.groupby | 4.6.0 | MIT | 否 | 是 | lodash/lodash | LICENSE | - |
| lodash.isboolean | 3.0.3 | MIT | 否 | 是 | lodash/lodash | LICENSE | - |
| lodash.isequal | 4.5.0 | MIT | 否 | 是 | lodash/lodash | LICENSE | - |
| lodash.isfunction | 3.0.9 | MIT | 否 | 是 | lodash/lodash | LICENSE | - |
| lodash.isnil | 4.0.0 | MIT | 否 | 是 | lodash/lodash | LICENSE | - |
| lodash.isplainobject | 4.0.6 | MIT | 否 | 是 | lodash/lodash | LICENSE | - |
| lodash.isundefined | 3.0.1 | MIT | 否 | 是 | lodash/lodash | LICENSE.txt | - |
| lodash.merge | 4.6.2 | MIT | 否 | 是 | lodash/lodash | LICENSE | - |
| lodash.union | 4.6.0 | MIT | 否 | 是 | lodash/lodash | LICENSE | - |
| lodash.uniq | 4.5.0 | MIT | 否 | 是 | lodash/lodash | LICENSE | - |
| loose-envify | 1.4.0 | MIT | 否 | 是 | git://github.com/zertosh/loose-envify.git | LICENSE | - |
| loupe | 2.3.7 | MIT | 否 | 是 | https://github.com/chaijs/loupe | LICENSE | - |
| lru-cache | 10.4.3 | ISC | 否 | 是 | git://github.com/isaacs/node-lru-cache.git | LICENSE | - |
| lru-cache | 6.0.0 | ISC | 否 | 是 | git://github.com/isaacs/node-lru-cache.git | LICENSE | - |
| lucide-react | 0.468.0 | ISC | 是 | 是 | https://github.com/lucide-icons/lucide.git | LICENSE | - |
| magic-string | 0.30.21 | MIT | 否 | 是 | git+https://github.com/Rich-Harris/magic-string.git | LICENSE | - |
| make-dir | 3.1.0 | MIT | 否 | 是 | sindresorhus/make-dir | license | - |
| make-error | 1.3.6 | ISC | 否 | 是 | git://github.com/JsCommunity/make-error.git | LICENSE | - |
| math-intrinsics | 1.1.0 | MIT | 否 | 是 | git+https://github.com/es-shims/math-intrinsics.git | LICENSE | - |
| merge-stream | 2.0.0 | MIT | 否 | 是 | grncdr/merge-stream | LICENSE | - |
| merge2 | 1.4.1 | MIT | 否 | 是 | git@github.com:teambition/merge2.git | LICENSE | - |
| micro | 9.3.5-canary.3 | MIT | 否 | 是 | zeit/micro | LICENSE | - |
| micromatch | 4.0.8 | MIT | 否 | 是 | micromatch/micromatch | LICENSE | - |
| mime-db | 1.52.0 | MIT | 否 | 是 | jshttp/mime-db | LICENSE | - |
| mime-types | 2.1.35 | MIT | 否 | 是 | jshttp/mime-types | LICENSE | - |
| mimic-fn | 2.1.0 | MIT | 否 | 是 | sindresorhus/mimic-fn | license | - |
| mimic-fn | 4.0.0 | MIT | 否 | 是 | sindresorhus/mimic-fn | license | - |
| minimatch | 10.2.5 | BlueOak-1.0.0 | 否 | 是 | git@github.com:isaacs/minimatch | LICENSE.md | - |
| minimatch | 3.1.5 | ISC | 否 | 是 | git://github.com/isaacs/minimatch.git | LICENSE | - |
| minimatch | 5.1.9 | ISC | 否 | 是 | git://github.com/isaacs/minimatch.git | LICENSE | - |
| minimist | 1.2.8 | MIT | 否 | 是 | git://github.com/minimistjs/minimist.git | LICENSE | - |
| minipass | 2.9.0 | ISC | 否 | 是 | git+https://github.com/isaacs/minipass.git | LICENSE | - |
| minipass | 3.3.6 | ISC | 否 | 是 | git+https://github.com/isaacs/minipass.git | LICENSE | - |
| minipass | 5.0.0 | ISC | 否 | 是 | git+https://github.com/isaacs/minipass.git | LICENSE | - |
| minizlib | 1.3.3 | MIT | 否 | 是 | git+https://github.com/isaacs/minizlib.git | LICENSE | - |
| minizlib | 2.1.2 | MIT | 否 | 是 | git+https://github.com/isaacs/minizlib.git | LICENSE | - |
| mkdirp | 0.5.6 | MIT | 否 | 是 | https://github.com/substack/node-mkdirp.git | LICENSE | - |
| mkdirp | 1.0.4 | MIT | 否 | 是 | https://github.com/isaacs/node-mkdirp.git | LICENSE | - |
| mlly | 1.8.2 | MIT | 否 | 是 | unjs/mlly | LICENSE | - |
| mri | 1.2.0 | MIT | 否 | 是 | lukeed/mri | license.md | - |
| ms | 2.1.1 | MIT | 否 | 是 | zeit/ms | license.md | - |
| ms | 2.1.3 | MIT | 否 | 是 | vercel/ms | license.md | - |
| mz | 2.7.0 | MIT | 否 | 是 | normalize/mz | LICENSE | - |
| nanoid | 3.3.12 | MIT | 否 | 是 | ai/nanoid | LICENSE | - |
| napi-postinstall | 0.3.4 | MIT | 否 | 是 | git+https://github.com/un-ts/napi-postinstall.git | LICENSE | - |
| natural-compare | 1.4.0 | MIT | 否 | 是 | git://github.com/litejs/natural-compare-lite.git | - | - |
| next | 15.5.18 | MIT | 是 | 是 | vercel/next.js | license.md | - |
| node-exports-info | 1.6.0 | MIT | 否 | 是 | git+https://github.com/inspect-js/node-exports-info.git | LICENSE | - |
| node-fetch | 2.6.7 | MIT | 否 | 是 | https://github.com/bitinn/node-fetch.git | LICENSE.md | - |
| node-fetch | 2.6.9 | MIT | 否 | 是 | https://github.com/bitinn/node-fetch.git | LICENSE.md | - |
| node-gyp-build | 4.8.4 | MIT | 否 | 是 | https://github.com/prebuild/node-gyp-build.git | LICENSE | - |
| node-releases | 2.0.44 | MIT | 否 | 是 | git+https://github.com/chicoxyzzy/node-releases.git | LICENSE | - |
| nopt | 5.0.0 | ISC | 否 | 是 | https://github.com/npm/nopt.git | LICENSE | - |
| normalize-path | 3.0.0 | MIT | 否 | 是 | jonschlinkert/normalize-path | LICENSE | - |
| npm-run-path | 4.0.1 | MIT | 否 | 是 | sindresorhus/npm-run-path | license | - |
| npm-run-path | 5.3.0 | MIT | 否 | 是 | sindresorhus/npm-run-path | license | - |
| npmlog | 5.0.1 | ISC | 否 | 是 | https://github.com/npm/npmlog.git | LICENSE | - |
| nwsapi | 2.2.23 | MIT | 否 | 是 | git://github.com/dperini/nwsapi.git | LICENSE | - |
| object-assign | 4.1.1 | MIT | 否 | 是 | sindresorhus/object-assign | license | - |
| object-hash | 3.0.0 | MIT | 否 | 是 | https://github.com/puleos/object-hash | LICENSE | - |
| object-inspect | 1.13.4 | MIT | 否 | 是 | git://github.com/inspect-js/object-inspect.git | LICENSE | - |
| object-keys | 1.1.1 | MIT | 否 | 是 | git://github.com/ljharb/object-keys.git | LICENSE | - |
| object.assign | 4.1.7 | MIT | 否 | 是 | git://github.com/ljharb/object.assign.git | LICENSE | - |
| object.entries | 1.1.9 | MIT | 否 | 是 | git://github.com/es-shims/Object.entries.git | LICENSE | - |
| object.fromentries | 2.0.8 | MIT | 否 | 是 | git://github.com/es-shims/Object.fromEntries.git | LICENSE | - |
| object.groupby | 1.0.3 | MIT | 否 | 是 | git+https://github.com/es-shims/Object.groupBy.git | LICENSE | - |
| object.values | 1.2.1 | MIT | 否 | 是 | git://github.com/es-shims/Object.values.git | LICENSE | - |
| once | 1.3.3 | ISC | 否 | 是 | git://github.com/isaacs/once | LICENSE | - |
| once | 1.4.0 | ISC | 否 | 是 | git://github.com/isaacs/once | LICENSE | - |
| onetime | 5.1.2 | MIT | 否 | 是 | sindresorhus/onetime | license | - |
| onetime | 6.0.0 | MIT | 否 | 是 | sindresorhus/onetime | license | - |
| optionator | 0.9.4 | MIT | 否 | 是 | git://github.com/gkz/optionator.git | LICENSE | - |
| os-paths | 4.4.0 | MIT | 否 | 是 | rivy/js.os-paths | LICENSE | - |
| own-keys | 1.0.1 | MIT | 否 | 是 | git+https://github.com/ljharb/own-keys.git | LICENSE | - |
| p-finally | 2.0.1 | MIT | 否 | 是 | sindresorhus/p-finally | license | - |
| p-limit | 3.1.0 | MIT | 否 | 是 | sindresorhus/p-limit | license | - |
| p-limit | 5.0.0 | MIT | 否 | 是 | sindresorhus/p-limit | license | - |
| p-locate | 5.0.0 | MIT | 否 | 是 | sindresorhus/p-locate | license | - |
| pako | 1.0.11 | (MIT AND Zlib) | 否 | 是 | nodeca/pako | LICENSE | - |
| parent-module | 1.0.1 | MIT | 否 | 是 | sindresorhus/parent-module | license | - |
| parse-ms | 2.1.0 | MIT | 否 | 是 | sindresorhus/parse-ms | license | - |
| parse5 | 7.3.0 | MIT | 否 | 是 | git://github.com/inikulin/parse5.git | LICENSE | - |
| path-browserify | 1.0.1 | MIT | 否 | 是 | git://github.com/browserify/path-browserify.git | LICENSE | - |
| path-exists | 4.0.0 | MIT | 否 | 是 | sindresorhus/path-exists | license | - |
| path-is-absolute | 1.0.1 | MIT | 否 | 是 | sindresorhus/path-is-absolute | license | - |
| path-key | 3.1.1 | MIT | 否 | 是 | sindresorhus/path-key | license | - |
| path-key | 4.0.0 | MIT | 否 | 是 | sindresorhus/path-key | license | - |
| path-match | 1.2.4 | MIT | 否 | 是 | pillarjs/path-match | LICENSE | - |
| path-parse | 1.0.7 | MIT | 否 | 是 | https://github.com/jbgutierrez/path-parse.git | LICENSE | - |
| path-to-regexp | 1.9.0 | MIT | 否 | 是 | https://github.com/pillarjs/path-to-regexp.git | LICENSE | - |
| path-to-regexp | 6.1.0 | MIT | 否 | 是 | https://github.com/pillarjs/path-to-regexp.git | LICENSE | - |
| path-to-regexp | 6.2.1 | MIT | 否 | 是 | https://github.com/pillarjs/path-to-regexp.git | LICENSE | - |
| pathe | 1.1.2 | MIT | 否 | 是 | unjs/pathe | LICENSE | - |
| pathe | 2.0.3 | MIT | 否 | 是 | unjs/pathe | LICENSE | - |
| pathval | 1.1.1 | MIT | 否 | 是 | git+ssh://git@github.com/chaijs/pathval.git | LICENSE | - |
| pdfjs-dist | 4.10.38 | Apache-2.0 | 是 | 是 | git+https://github.com/mozilla/pdf.js.git | LICENSE | - |
| pend | 1.2.0 | MIT | 否 | 是 | git://github.com/andrewrk/node-pend.git | LICENSE | - |
| picocolors | 1.0.0 | ISC | 否 | 是 | alexeyraspopov/picocolors | LICENSE | - |
| picocolors | 1.1.1 | ISC | 否 | 是 | alexeyraspopov/picocolors | LICENSE | - |
| picomatch | 2.3.2 | MIT | 否 | 是 | micromatch/picomatch | LICENSE | - |
| picomatch | 4.0.4 | MIT | 否 | 是 | micromatch/picomatch | LICENSE | - |
| pify | 2.3.0 | MIT | 否 | 是 | sindresorhus/pify | license | - |
| pirates | 4.0.7 | MIT | 否 | 是 | https://github.com/danez/pirates.git | LICENSE | - |
| pkg-types | 1.3.1 | MIT | 否 | 是 | unjs/pkg-types | LICENSE | - |
| playwright | 1.60.0 | Apache-2.0 | 否 | 是 | git+https://github.com/microsoft/playwright.git | LICENSE | NOTICE |
| playwright-core | 1.60.0 | Apache-2.0 | 否 | 是 | git+https://github.com/microsoft/playwright.git | LICENSE | NOTICE |
| possible-typed-array-names | 1.1.0 | MIT | 否 | 是 | git+https://github.com/ljharb/possible-typed-array-names.git | LICENSE | - |
| postcss | 8.5.10 | MIT | 是 | 是 | postcss/postcss | LICENSE | - |
| postcss-import | 15.1.0 | MIT | 否 | 是 | https://github.com/postcss/postcss-import.git | LICENSE | - |
| postcss-js | 4.1.0 | MIT | 否 | 是 | postcss/postcss-js | LICENSE | - |
| postcss-load-config | 6.0.1 | MIT | 否 | 是 | postcss/postcss-load-config | LICENSE | - |
| postcss-nested | 6.2.0 | MIT | 否 | 是 | postcss/postcss-nested | LICENSE | - |
| postcss-selector-parser | 6.1.2 | MIT | 否 | 是 | postcss/postcss-selector-parser | - | - |
| postcss-value-parser | 4.2.0 | MIT | 否 | 是 | https://github.com/TrySound/postcss-value-parser.git | LICENSE | - |
| prelude-ls | 1.2.1 | MIT | 否 | 是 | git://github.com/gkz/prelude-ls.git | LICENSE | - |
| pretty-format | 29.7.0 | MIT | 否 | 是 | https://github.com/jestjs/jest.git | LICENSE | - |
| pretty-ms | 7.0.1 | MIT | 否 | 是 | sindresorhus/pretty-ms | license | - |
| process-nextick-args | 2.0.1 | MIT | 否 | 是 | https://github.com/calvinmetcalf/process-nextick-args.git | license.md | - |
| promisepipe | 3.0.0 | MIT | 否 | 是 | https://github.com/epeli/node-promisepipe | LICENSE | - |
| prop-types | 15.8.1 | MIT | 否 | 是 | facebook/prop-types | LICENSE | - |
| psl | 1.15.0 | MIT | 否 | 是 | git@github.com:lupomontero/psl.git | LICENSE | - |
| pump | 3.0.4 | MIT | 否 | 是 | git://github.com/mafintosh/pump.git | LICENSE | - |
| punycode | 2.3.1 | MIT | 否 | 是 | https://github.com/mathiasbynens/punycode.js.git | - | - |
| querystringify | 2.2.0 | MIT | 否 | 是 | https://github.com/unshiftio/querystringify | LICENSE | - |
| queue-microtask | 1.2.3 | MIT | 否 | 是 | git://github.com/feross/queue-microtask.git | LICENSE | - |
| raw-body | 2.4.1 | MIT | 否 | 是 | stream-utils/raw-body | LICENSE | - |
| react | 18.3.1 | MIT | 是 | 是 | https://github.com/facebook/react.git | LICENSE | - |
| react-dom | 18.3.1 | MIT | 是 | 是 | https://github.com/facebook/react.git | LICENSE | - |
| react-is | 16.13.1 | MIT | 否 | 是 | https://github.com/facebook/react.git | LICENSE | - |
| react-is | 18.3.1 | MIT | 否 | 是 | https://github.com/facebook/react.git | LICENSE | - |
| read-cache | 1.0.0 | MIT | 否 | 是 | git+https://github.com/TrySound/read-cache.git | LICENSE | - |
| readable-stream | 2.3.8 | MIT | 否 | 是 | git://github.com/nodejs/readable-stream | LICENSE | - |
| readable-stream | 3.6.2 | MIT | 否 | 是 | git://github.com/nodejs/readable-stream | LICENSE | - |
| readdir-glob | 1.1.3 | Apache-2.0 | 否 | 是 | git://github.com/Yqnn/node-readdir-glob.git | LICENSE | - |
| readdirp | 3.3.0 | MIT | 否 | 是 | git://github.com/paulmillr/readdirp.git | LICENSE | - |
| readdirp | 3.6.0 | MIT | 否 | 是 | git://github.com/paulmillr/readdirp.git | LICENSE | - |
| reflect.getprototypeof | 1.0.10 | MIT | 否 | 是 | git+https://github.com/es-shims/Reflect.getPrototypeOf.git | LICENSE | - |
| regexp.prototype.flags | 1.5.4 | MIT | 否 | 是 | git://github.com/es-shims/RegExp.prototype.flags.git | LICENSE | - |
| require-from-string | 2.0.2 | MIT | 否 | 是 | floatdrop/require-from-string | license | - |
| requires-port | 1.0.0 | MIT | 否 | 是 | https://github.com/unshiftio/requires-port | LICENSE | - |
| resolve | 1.22.12 | MIT | 否 | 是 | ssh://github.com/browserify/resolve.git | LICENSE | - |
| resolve | 2.0.0-next.7 | MIT | 否 | 是 | ssh://github.com/browserify/resolve.git | LICENSE | - |
| resolve-from | 4.0.0 | MIT | 否 | 是 | sindresorhus/resolve-from | license | - |
| resolve-from | 5.0.0 | MIT | 否 | 是 | sindresorhus/resolve-from | license | - |
| resolve-pkg-maps | 1.0.0 | MIT | 否 | 是 | privatenumber/resolve-pkg-maps | LICENSE | - |
| reusify | 1.1.0 | MIT | 否 | 是 | git+https://github.com/mcollina/reusify.git | LICENSE | - |
| rimraf | 2.7.1 | ISC | 否 | 是 | git://github.com/isaacs/rimraf.git | LICENSE | - |
| rimraf | 3.0.2 | ISC | 否 | 是 | git://github.com/isaacs/rimraf.git | LICENSE | - |
| rollup | 4.60.4 | MIT | 否 | 是 | git+https://github.com/rollup/rollup.git | LICENSE.md | - |
| rrweb-cssom | 0.7.1 | MIT | 否 | 是 | rrweb-io/CSSOM | LICENSE.txt | - |
| rrweb-cssom | 0.8.0 | MIT | 否 | 是 | rrweb-io/CSSOM | LICENSE.txt | - |
| run-parallel | 1.2.0 | MIT | 否 | 是 | git://github.com/feross/run-parallel.git | LICENSE | - |
| safe-array-concat | 1.1.4 | MIT | 否 | 是 | git+https://github.com/ljharb/safe-array-concat.git | LICENSE | - |
| safe-buffer | 5.1.2 | MIT | 否 | 是 | git://github.com/feross/safe-buffer.git | LICENSE | - |
| safe-buffer | 5.2.1 | MIT | 否 | 是 | git://github.com/feross/safe-buffer.git | LICENSE | - |
| safe-push-apply | 1.0.0 | MIT | 否 | 是 | git+https://github.com/ljharb/safe-push-apply.git | LICENSE | - |
| safe-regex-test | 1.1.0 | MIT | 否 | 是 | git+https://github.com/ljharb/safe-regex-test.git | LICENSE | - |
| safer-buffer | 2.1.2 | MIT | 否 | 是 | git+https://github.com/ChALkeR/safer-buffer.git | LICENSE | - |
| saxes | 5.0.1 | ISC | 否 | 是 | https://github.com/lddubeau/saxes.git | - | - |
| saxes | 6.0.0 | ISC | 否 | 是 | https://github.com/lddubeau/saxes.git | - | - |
| scheduler | 0.23.2 | MIT | 否 | 是 | https://github.com/facebook/react.git | LICENSE | - |
| semver | 6.3.1 | ISC | 否 | 是 | https://github.com/npm/node-semver.git | LICENSE | - |
| semver | 7.3.5 | ISC | 否 | 是 | https://github.com/npm/node-semver | LICENSE | - |
| semver | 7.8.0 | ISC | 否 | 是 | git+https://github.com/npm/node-semver.git | LICENSE | - |
| set-blocking | 2.0.0 | ISC | 否 | 是 | git+https://github.com/yargs/set-blocking.git | LICENSE.txt | - |
| set-function-length | 1.2.2 | MIT | 否 | 是 | git+https://github.com/ljharb/set-function-length.git | LICENSE | - |
| set-function-name | 2.0.2 | MIT | 否 | 是 | git+https://github.com/ljharb/set-function-name.git | LICENSE | - |
| set-proto | 1.0.0 | MIT | 否 | 是 | git+https://github.com/ljharb/set-proto.git | LICENSE | - |
| setimmediate | 1.0.5 | MIT | 否 | 是 | YuzuJS/setImmediate | LICENSE.txt | - |
| setprototypeof | 1.1.1 | ISC | 否 | 是 | https://github.com/wesleytodd/setprototypeof.git | LICENSE | - |
| sharp | 0.34.5 | Apache-2.0 | 否 | 是 | git://github.com/lovell/sharp.git | LICENSE | - |
| shebang-command | 2.0.0 | MIT | 否 | 是 | kevva/shebang-command | license | - |
| shebang-regex | 3.0.0 | MIT | 否 | 是 | sindresorhus/shebang-regex | license | - |
| side-channel | 1.1.0 | MIT | 否 | 是 | git+https://github.com/ljharb/side-channel.git | LICENSE | - |
| side-channel-list | 1.0.1 | MIT | 否 | 是 | git+https://github.com/ljharb/side-channel-list.git | LICENSE | - |
| side-channel-map | 1.0.1 | MIT | 否 | 是 | git+https://github.com/ljharb/side-channel-map.git | LICENSE | - |
| side-channel-weakmap | 1.0.2 | MIT | 否 | 是 | git+https://github.com/ljharb/side-channel-weakmap.git | LICENSE | - |
| siginfo | 2.0.0 | ISC | 否 | 是 | git+https://github.com/emilbayes/siginfo.git | LICENSE | - |
| signal-exit | 3.0.7 | ISC | 否 | 是 | https://github.com/tapjs/signal-exit.git | LICENSE.txt | - |
| signal-exit | 4.0.2 | ISC | 否 | 是 | https://github.com/tapjs/signal-exit.git | LICENSE.txt | - |
| signal-exit | 4.1.0 | ISC | 否 | 是 | https://github.com/tapjs/signal-exit.git | LICENSE.txt | - |
| source-map-js | 1.2.1 | BSD-3-Clause | 否 | 是 | 7rulnik/source-map-js | LICENSE | - |
| stable-hash | 0.0.5 | MIT | 否 | 是 | https://github.com/shuding/stable-hash | - | - |
| stackback | 0.0.2 | MIT | 否 | 是 | git://github.com/shtylman/node-stackback.git | - | - |
| stat-mode | 0.3.0 | MIT | 否 | 是 | git://github.com/TooTallNate/stat-mode.git | LICENSE | - |
| statuses | 1.5.0 | MIT | 否 | 是 | jshttp/statuses | LICENSE | - |
| std-env | 3.10.0 | MIT | 否 | 是 | unjs/std-env | LICENCE | - |
| stop-iteration-iterator | 1.1.0 | MIT | 否 | 是 | git+https://github.com/ljharb/stop-iteration-iterator.git | LICENSE | - |
| stream-to-array | 2.3.0 | MIT | 否 | 是 | stream-utils/stream-to-array | LICENSE | - |
| stream-to-promise | 2.2.0 | MIT | 否 | 是 | git://github.com/bendrucker/stream-to-promise.git | LICENSE | - |
| string_decoder | 1.1.1 | MIT | 否 | 是 | git://github.com/nodejs/string_decoder.git | LICENSE | - |
| string_decoder | 1.3.0 | MIT | 否 | 是 | git://github.com/nodejs/string_decoder.git | LICENSE | - |
| string-width | 4.2.3 | MIT | 否 | 是 | sindresorhus/string-width | license | - |
| string.prototype.includes | 2.0.1 | MIT | 否 | 是 | https://github.com/mathiasbynens/String.prototype.includes.git | LICENSE | - |
| string.prototype.matchall | 4.0.12 | MIT | 否 | 是 | git+https://github.com/es-shims/String.prototype.matchAll.git | LICENSE | - |
| string.prototype.repeat | 1.0.0 | MIT | 否 | 是 | https://github.com/mathiasbynens/String.prototype.repeat.git | - | - |
| string.prototype.trim | 1.2.10 | MIT | 否 | 是 | git://github.com/es-shims/String.prototype.trim.git | LICENSE | - |
| string.prototype.trimend | 1.0.9 | MIT | 否 | 是 | git://github.com/es-shims/String.prototype.trimEnd.git | LICENSE | - |
| string.prototype.trimstart | 1.0.8 | MIT | 否 | 是 | git://github.com/es-shims/String.prototype.trimStart.git | LICENSE | - |
| strip-ansi | 6.0.1 | MIT | 否 | 是 | chalk/strip-ansi | license | - |
| strip-bom | 3.0.0 | MIT | 否 | 是 | sindresorhus/strip-bom | license | - |
| strip-final-newline | 2.0.0 | MIT | 否 | 是 | sindresorhus/strip-final-newline | license | - |
| strip-final-newline | 3.0.0 | MIT | 否 | 是 | sindresorhus/strip-final-newline | license | - |
| strip-json-comments | 3.1.1 | MIT | 否 | 是 | sindresorhus/strip-json-comments | license | - |
| strip-literal | 2.1.1 | MIT | 否 | 是 | git+https://github.com/antfu/strip-literal.git | LICENSE | - |
| styled-jsx | 5.1.6 | MIT | 否 | 是 | vercel/styled-jsx | license.md | - |
| sucrase | 3.35.1 | MIT | 否 | 是 | https://github.com/alangpierce/sucrase.git | LICENSE | - |
| supports-color | 7.2.0 | MIT | 否 | 是 | chalk/supports-color | license | - |
| supports-preserve-symlinks-flag | 1.0.0 | MIT | 否 | 是 | git+https://github.com/inspect-js/node-supports-preserve-symlinks-flag.git | LICENSE | - |
| symbol-tree | 3.2.4 | MIT | 否 | 是 | https://github.com/jsdom/js-symbol-tree.git | LICENSE | - |
| tailwindcss | 3.4.19 | MIT | 是 | 是 | https://github.com/tailwindlabs/tailwindcss.git#v3 | LICENSE | - |
| tar | 4.4.18 | ISC | 否 | 是 | https://github.com/npm/node-tar.git | LICENSE | - |
| tar | 6.2.1 | ISC | 否 | 是 | https://github.com/isaacs/node-tar.git | LICENSE | - |
| tar-stream | 2.2.0 | MIT | 否 | 是 | git+https://github.com/mafintosh/tar-stream.git | LICENSE | - |
| text-table | 0.2.0 | MIT | 否 | 是 | git://github.com/substack/text-table.git | LICENSE | - |
| thenify | 3.3.1 | MIT | 否 | 是 | thenables/thenify | LICENSE | - |
| thenify-all | 1.6.0 | MIT | 否 | 是 | thenables/thenify-all | LICENSE | - |
| time-span | 4.0.0 | MIT | 否 | 是 | sindresorhus/time-span | license | - |
| tinybench | 2.9.0 | MIT | 否 | 是 | tinylibs/tinybench | LICENSE | - |
| tinyglobby | 0.2.16 | MIT | 否 | 是 | git+https://github.com/SuperchupuDev/tinyglobby.git | LICENSE | - |
| tinypool | 0.8.4 | MIT | 否 | 是 | git+https://github.com/tinylibs/tinypool.git | LICENSE | - |
| tinyspy | 2.2.1 | MIT | 否 | 是 | git+https://github.com/tinylibs/tinyspy.git | LICENCE | - |
| tmp | 0.2.5 | MIT | 否 | 是 | https://github.com/raszi/node-tmp.git | LICENSE | - |
| to-regex-range | 5.0.1 | MIT | 否 | 是 | micromatch/to-regex-range | LICENSE | - |
| toidentifier | 1.0.0 | MIT | 否 | 是 | component/toidentifier | LICENSE | - |
| tough-cookie | 4.1.4 | BSD-3-Clause | 否 | 是 | git://github.com/salesforce/tough-cookie.git | LICENSE | - |
| tr46 | 0.0.3 | MIT | 否 | 是 | git+https://github.com/Sebmaster/tr46.js.git | - | - |
| tr46 | 5.1.1 | MIT | 否 | 是 | https://github.com/jsdom/tr46 | LICENSE.md | - |
| traverse | 0.3.9 | MIT/X11 | 否 | 是 | http://github.com/substack/js-traverse.git | LICENSE | - |
| tree-kill | 1.2.2 | MIT | 否 | 是 | git://github.com/pkrumins/node-tree-kill.git | LICENSE | - |
| ts-api-utils | 2.5.0 | MIT | 否 | 是 | https://github.com/JoshuaKGoldberg/ts-api-utils | LICENSE.md | - |
| ts-interface-checker | 0.1.13 | Apache-2.0 | 否 | 是 | https://github.com/gristlabs/ts-interface-checker | LICENSE | - |
| ts-morph | 12.0.0 | MIT | 否 | 是 | git+https://github.com/dsherret/ts-morph.git | LICENSE | - |
| ts-node | 10.9.1 | MIT | 否 | 是 | git://github.com/TypeStrong/ts-node.git | LICENSE | - |
| ts-toolbelt | 6.15.5 | Apache-2.0 | 否 | 是 | https://github.com/millsp/ts-toolbelt | LICENSE | - |
| tsconfig-paths | 3.15.0 | MIT | 否 | 是 | https://github.com/dividab/tsconfig-paths | LICENSE | - |
| tslib | 2.8.1 | 0BSD | 否 | 是 | https://github.com/Microsoft/tslib.git | LICENSE.txt | - |
| type-check | 0.4.0 | MIT | 否 | 是 | git://github.com/gkz/type-check.git | LICENSE | - |
| type-detect | 4.1.0 | MIT | 否 | 是 | git+ssh://git@github.com/chaijs/type-detect.git | LICENSE | - |
| type-fest | 0.20.2 | (MIT OR CC0-1.0) | 否 | 是 | sindresorhus/type-fest | license | - |
| typed-array-buffer | 1.0.3 | MIT | 否 | 是 | git+https://github.com/inspect-js/typed-array-buffer.git | LICENSE | - |
| typed-array-byte-length | 1.0.3 | MIT | 否 | 是 | git+https://github.com/inspect-js/typed-array-byte-length.git | LICENSE | - |
| typed-array-byte-offset | 1.0.4 | MIT | 否 | 是 | git+https://github.com/inspect-js/typed-array-byte-offset.git | LICENSE | - |
| typed-array-length | 1.0.7 | MIT | 否 | 是 | git+https://github.com/inspect-js/typed-array-length.git | LICENSE | - |
| typescript | 4.9.5 | Apache-2.0 | 是 | 是 | https://github.com/Microsoft/TypeScript.git | LICENSE.txt | - |
| typescript | 5.9.3 | Apache-2.0 | 是 | 是 | https://github.com/microsoft/TypeScript.git | LICENSE.txt | - |
| ufo | 1.6.4 | MIT | 否 | 是 | unjs/ufo | LICENSE | - |
| uid-promise | 1.0.0 | MIT | 否 | 是 | zeit/uid-promise | license.md | - |
| unbox-primitive | 1.1.0 | MIT | 否 | 是 | git+https://github.com/ljharb/unbox-primitive.git | LICENSE | - |
| undici | 5.28.4 | MIT | 否 | 是 | git+https://github.com/nodejs/undici.git | LICENSE | - |
| undici-types | 6.21.0 | MIT | 否 | 是 | git+https://github.com/nodejs/undici.git | LICENSE | - |
| universalify | 0.1.2 | MIT | 否 | 是 | git+https://github.com/RyanZim/universalify.git | LICENSE | - |
| universalify | 0.2.0 | MIT | 否 | 是 | git+https://github.com/RyanZim/universalify.git | LICENSE | - |
| universalify | 2.0.1 | MIT | 否 | 是 | git+https://github.com/RyanZim/universalify.git | LICENSE | - |
| unpipe | 1.0.0 | MIT | 否 | 是 | stream-utils/unpipe | LICENSE | - |
| unrs-resolver | 1.11.1 | MIT | 否 | 是 | git+https://github.com/unrs/unrs-resolver.git | - | - |
| unzipper | 0.10.14 | MIT | 否 | 是 | https://github.com/ZJONSSON/node-unzipper.git | LICENSE | - |
| update-browserslist-db | 1.2.3 | MIT | 否 | 是 | browserslist/update-db | LICENSE | - |
| uri-js | 4.4.1 | BSD-2-Clause | 否 | 是 | http://github.com/garycourt/uri-js | LICENSE | - |
| url-parse | 1.5.10 | MIT | 否 | 是 | https://github.com/unshiftio/url-parse.git | LICENSE | - |
| util-deprecate | 1.0.2 | MIT | 否 | 是 | git://github.com/TooTallNate/util-deprecate.git | LICENSE | - |
| uuid | 11.1.1 | MIT | 否 | 是 | https://github.com/uuidjs/uuid.git | LICENSE.md | - |
| uzip | 0.20201231.0 | MIT | 否 | 是 | - | LICENSE | - |
| v8-compile-cache-lib | 3.0.1 | MIT | 否 | 是 | https://github.com/cspotcode/v8-compile-cache-lib.git | LICENSE | - |
| vercel | 34.4.0 | Apache-2.0 | 是 | 是 | https://github.com/vercel/vercel.git | LICENSE | - |
| vite | 5.4.21 | MIT | 否 | 是 | git+https://github.com/vitejs/vite.git | LICENSE.md | - |
| vite-node | 1.6.1 | MIT | 否 | 是 | git+https://github.com/vitest-dev/vitest.git | LICENSE | - |
| vitest | 1.6.1 | MIT | 是 | 是 | git+https://github.com/vitest-dev/vitest.git | LICENSE.md | - |
| w3c-xmlserializer | 5.0.0 | MIT | 否 | 是 | jsdom/w3c-xmlserializer | LICENSE.md | - |
| web-vitals | 0.2.4 | Apache-2.0 | 否 | 是 | https://github.com/GoogleChrome/web-vitals.git | LICENSE | - |
| webidl-conversions | 3.0.1 | BSD-2-Clause | 否 | 是 | jsdom/webidl-conversions | LICENSE.md | - |
| webidl-conversions | 7.0.0 | BSD-2-Clause | 否 | 是 | jsdom/webidl-conversions | LICENSE.md | - |
| whatwg-encoding | 3.1.1 | MIT | 否 | 是 | jsdom/whatwg-encoding | LICENSE.txt | - |
| whatwg-mimetype | 4.0.0 | MIT | 否 | 是 | jsdom/whatwg-mimetype | LICENSE.txt | - |
| whatwg-url | 14.2.0 | MIT | 否 | 是 | jsdom/whatwg-url | LICENSE.txt | - |
| whatwg-url | 5.0.0 | MIT | 否 | 是 | jsdom/whatwg-url | LICENSE.txt | - |
| which | 2.0.2 | ISC | 否 | 是 | git://github.com/isaacs/node-which.git | LICENSE | - |
| which-boxed-primitive | 1.1.1 | MIT | 否 | 是 | git+https://github.com/inspect-js/which-boxed-primitive.git | LICENSE | - |
| which-builtin-type | 1.2.1 | MIT | 否 | 是 | git+https://github.com/inspect-js/which-builtin-type.git | LICENSE | - |
| which-collection | 1.0.2 | MIT | 否 | 是 | git+https://github.com/inspect-js/which-collection.git | LICENSE | - |
| which-typed-array | 1.1.20 | MIT | 否 | 是 | git://github.com/inspect-js/which-typed-array.git | LICENSE | - |
| why-is-node-running | 2.3.0 | MIT | 否 | 是 | https://github.com/mafintosh/why-is-node-running.git | LICENSE | - |
| wide-align | 1.1.5 | ISC | 否 | 是 | https://github.com/iarna/wide-align | LICENSE | - |
| word-wrap | 1.2.5 | MIT | 否 | 是 | jonschlinkert/word-wrap | LICENSE | - |
| wrappy | 1.0.2 | ISC | 否 | 是 | https://github.com/npm/wrappy | LICENSE | - |
| ws | 8.20.1 | MIT | 否 | 是 | git+https://github.com/websockets/ws.git | LICENSE | - |
| xdg-app-paths | 5.1.0 | MIT | 否 | 是 | rivy/js.xdg-app-paths | license | - |
| xdg-portable | 7.3.0 | MIT | 否 | 是 | rivy/js.xdg-portable | LICENSE | - |
| xml-name-validator | 5.0.0 | Apache-2.0 | 否 | 是 | jsdom/xml-name-validator | LICENSE.txt | - |
| xmlchars | 2.2.0 | MIT | 否 | 是 | https://github.com/lddubeau/xmlchars.git | LICENSE | - |
| yallist | 3.1.1 | ISC | 否 | 是 | git+https://github.com/isaacs/yallist.git | LICENSE | - |
| yallist | 4.0.0 | ISC | 否 | 是 | git+https://github.com/isaacs/yallist.git | LICENSE | - |
| yauzl | 2.10.0 | MIT | 否 | 是 | https://github.com/thejoshwolfe/yauzl.git | LICENSE | - |
| yauzl-clone | 1.0.4 | MIT | 否 | 是 | https://github.com/overlookmotel/yauzl-clone.git | License | - |
| yauzl-promise | 2.1.3 | MIT | 否 | 是 | https://github.com/overlookmotel/yauzl-promise.git | License | - |
| yn | 3.1.1 | MIT | 否 | 是 | sindresorhus/yn | license | - |
| yocto-queue | 0.1.0 | MIT | 否 | 是 | sindresorhus/yocto-queue | license | - |
| yocto-queue | 1.2.2 | MIT | 否 | 是 | sindresorhus/yocto-queue | license | - |
| zip-stream | 4.1.1 | MIT | 否 | 是 | https://github.com/archiverjs/node-zip-stream.git | LICENSE | - |

## Rust / Tauri 依赖 Notices

| crate | 版本 | 许可证 | 仓库/主页 | 来源 | checksum |
| --- | --- | --- | --- | --- | --- |
| adler2 | 2.0.1 | 0BSD OR MIT OR Apache-2.0 | https://github.com/oyvindln/adler2 | registry+https://github.com/rust-lang/crates.io-index | 320119579fcad9c21884f5c4861d16174d0e06250625266f50fe6898340abefa |
| aho-corasick | 1.1.4 | Unlicense OR MIT | https://github.com/BurntSushi/aho-corasick | registry+https://github.com/rust-lang/crates.io-index | ddd31a130427c27518df266943a5308ed92d4b226cc639f5a8f1002816174301 |
| alloc-no-stdlib | 2.0.4 | BSD-3-Clause | https://github.com/dropbox/rust-alloc-no-stdlib | registry+https://github.com/rust-lang/crates.io-index | cc7bb162ec39d46ab1ca8c77bf72e890535becd1751bb45f64c597edb4c8c6b3 |
| alloc-stdlib | 0.2.2 | BSD-3-Clause | https://github.com/dropbox/rust-alloc-no-stdlib | registry+https://github.com/rust-lang/crates.io-index | 94fb8275041c72129eb51b7d0322c29b8387a0386127718b096429201a5d6ece |
| android_system_properties | 0.1.5 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 819e7219dbd41043ac279b19830f2efc897156490d7fd6ea916720117ee66311 |
| anyhow | 1.0.102 | MIT OR Apache-2.0 | https://github.com/dtolnay/anyhow | registry+https://github.com/rust-lang/crates.io-index | 7f202df86484c868dbad7eaa557ef785d5c66295e41b460ef922eca0723b842c |
| atk | 0.15.1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 2c3d816ce6f0e2909a96830d6911c2aff044370b1ef92d7f267b43bae5addedd |
| atk-sys | 0.15.1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 58aeb089fb698e06db8089971c7ee317ab9644bade33383f63631437b03aafb6 |
| autocfg | 1.5.0 | Apache-2.0 OR MIT | https://github.com/cuviper/autocfg | registry+https://github.com/rust-lang/crates.io-index | c08606f8c3cbf4ce6ec8e28fb0014a2c086708fe954eaa885384a6165172e7e8 |
| base64 | 0.13.1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 9e1b586273c5702936fe7b7d6896644d8be71e6314cfe09d3167c95f712589e8 |
| base64 | 0.21.7 | MIT OR Apache-2.0 | https://github.com/marshallpierce/rust-base64 | registry+https://github.com/rust-lang/crates.io-index | 9d297deb1925b89f2ccc13d7635fa0714f12c87adce1c75356b39ca9b7178567 |
| base64 | 0.22.1 | MIT OR Apache-2.0 | https://github.com/marshallpierce/rust-base64 | registry+https://github.com/rust-lang/crates.io-index | 72b3254f16251a8381aa12e40e3c4d2f0199f8c6508fbecb9d91f575e0fbb8c6 |
| base64ct | 1.8.3 | Apache-2.0 OR MIT | https://github.com/RustCrypto/formats | registry+https://github.com/rust-lang/crates.io-index | 2af50177e190e07a26ab74f8b1efbfe2ef87da2116221318cb1c2e82baf7de06 |
| bitflags | 1.3.2 | MIT/Apache-2.0 | https://github.com/bitflags/bitflags | registry+https://github.com/rust-lang/crates.io-index | bef38d45163c2f1dde094a7dfd33ccf595c92905c8f8f4fdc18d06fb1037718a |
| bitflags | 2.11.1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | c4512299f36f043ab09a583e57bceb5a5aab7a73db1805848e8fef3c9e8c78b3 |
| block | 0.1.6 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 0d8c1fef690941d3e7788d328517591fecc684c084084702d6ff1641e993699a |
| block-buffer | 0.10.4 | MIT OR Apache-2.0 | https://github.com/RustCrypto/utils | registry+https://github.com/rust-lang/crates.io-index | 3078c7629b62d3f0439517fa394996acacc5cbc91c5a20d8c658e77abd503a71 |
| brotli | 7.0.0 | BSD-3-Clause AND MIT | https://github.com/dropbox/rust-brotli | registry+https://github.com/rust-lang/crates.io-index | cc97b8f16f944bba54f0433f07e30be199b6dc2bd25937444bbad560bcea29bd |
| brotli-decompressor | 4.0.3 | BSD-3-Clause/MIT | https://github.com/dropbox/rust-brotli-decompressor | registry+https://github.com/rust-lang/crates.io-index | a334ef7c9e23abf0ce748e8cd309037da93e606ad52eb372e4ce327a0dcfbdfd |
| bs58 | 0.5.1 | MIT/Apache-2.0 | https://github.com/Nullus157/bs58-rs | registry+https://github.com/rust-lang/crates.io-index | bf88ba1141d185c399bee5288d850d63b8369520c1eafc32a0430b5b6c287bf4 |
| bstr | 1.12.1 | MIT OR Apache-2.0 | https://github.com/BurntSushi/bstr | registry+https://github.com/rust-lang/crates.io-index | 63044e1ae8e69f3b5a92c736ca6269b8d12fa7efe39bf34ddb06d102cf0e2cab |
| bumpalo | 3.20.2 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 5d20789868f4b01b2f2caec9f5c4e0213b41e3e5702a50157d699ae31ced2fcb |
| bytemuck | 1.25.0 | Zlib OR Apache-2.0 OR MIT | https://github.com/Lokathor/bytemuck | registry+https://github.com/rust-lang/crates.io-index | c8efb64bd706a16a1bdde310ae86b351e4d21550d98d056f22f8a7f7a2183fec |
| byteorder | 1.5.0 | Unlicense OR MIT | https://github.com/BurntSushi/byteorder | registry+https://github.com/rust-lang/crates.io-index | 1fd0f2584146f6f2ef48085050886acf353beff7305ebd1ae69500e27c67f64b |
| bytes | 1.11.1 | MIT | https://github.com/tokio-rs/bytes | registry+https://github.com/rust-lang/crates.io-index | 1e748733b7cbc798e1434b6ac524f0c1ff2ab456fe201501e6497c8417a4fc33 |
| cairo-rs | 0.15.12 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | c76ee391b03d35510d9fa917357c7f1855bd9a6659c95a1b392e33f49b3369bc |
| cairo-sys-rs | 0.15.1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 3c55d429bef56ac9172d25fecb85dc8068307d17acd74b377866b7a1ef25d3c8 |
| cargo_toml | 0.15.3 | Apache-2.0 OR MIT | https://gitlab.com/crates.rs/cargo_toml | registry+https://github.com/rust-lang/crates.io-index | 599aa35200ffff8f04c1925aa1acc92fa2e08874379ef42e210a80e527e60838 |
| cc | 1.2.62 | MIT OR Apache-2.0 | https://github.com/rust-lang/cc-rs | registry+https://github.com/rust-lang/crates.io-index | a1dce859f0832a7d088c4f1119888ab94ef4b5d6795d1ce05afb7fe159d79f98 |
| cesu8 | 1.1.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 6d43a04d8753f35258c91f8ec639f792891f748a1edbd759cf1dcea3382ad83c |
| cfb | 0.7.3 | MIT | https://github.com/mdsteele/rust-cfb | registry+https://github.com/rust-lang/crates.io-index | d38f2da7a0a2c4ccf0065be06397cc26a81f4e528be095826eee9d4adbb8c60f |
| cfg-expr | 0.15.8 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | d067ad48b8650848b989a59a86c6c36a995d02d2bf778d45c3c5d57bc2718f02 |
| cfg-expr | 0.9.1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 3431df59f28accaf4cb4eed4a9acc66bea3f3c3753aa6cdc2f024174ef232af7 |
| cfg-if | 1.0.4 | MIT OR Apache-2.0 | https://github.com/rust-lang/cfg-if | registry+https://github.com/rust-lang/crates.io-index | 9330f8b2ff13f34540b44e946ef35111825727b38d33286ef986142615121801 |
| chrono | 0.4.44 | MIT OR Apache-2.0 | https://github.com/chronotope/chrono | registry+https://github.com/rust-lang/crates.io-index | c673075a2e0e5f4a1dde27ce9dee1ea4558c7ffe648f576438a20ca1d2acc4b0 |
| cocoa | 0.24.1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | f425db7937052c684daec3bd6375c8abe2d146dca4b8b143d6db777c39138f3a |
| cocoa-foundation | 0.1.2 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 8c6234cbb2e4c785b456c0644748b1ac416dd045799740356f8363dfe00c93f7 |
| color_quant | 1.1.0 | MIT | https://github.com/image-rs/color_quant.git | registry+https://github.com/rust-lang/crates.io-index | 3d7b894f5411737b7867f4827955924d7c254fc9f4d91a6aad6b097804b1018b |
| combine | 4.6.7 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | ba5a308b75df32fe02788e748662718f03fde005016435c444eea572398219fd |
| const-oid | 0.9.6 | Apache-2.0 OR MIT | https://github.com/RustCrypto/formats/tree/master/const-oid | registry+https://github.com/rust-lang/crates.io-index | c2459377285ad874054d797f3ccebf984978aa39129f6eafde5cdc8315b612f8 |
| convert_case | 0.4.0 | MIT | https://github.com/rutrum/convert-case | registry+https://github.com/rust-lang/crates.io-index | 6245d59a3e82a7fc217c5828a6692dbc6dfb63a0c8c90495621f7b9d79704a0e |
| core-foundation | 0.9.4 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 91e195e091a93c46f7102ec7818a2aa394e1e1771c3ab4825963fa03e45afb8f |
| core-foundation-sys | 0.8.7 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 773648b94d0e5d620f64f280777445740e61fe701025087ec8b57f45c791888b |
| core-graphics | 0.22.3 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 2581bbab3b8ffc6fcbd550bf46c355135d16e9ff2a6ea032ad6b9bf1d7efe4fb |
| core-graphics-types | 0.1.3 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 45390e6114f68f718cc7a830514a96f903cccd70d02a8f6d9f643ac4ba45afaf |
| cpufeatures | 0.2.17 | MIT OR Apache-2.0 | https://github.com/RustCrypto/utils | registry+https://github.com/rust-lang/crates.io-index | 59ed5838eebb26a2bb2e58f6d5b5316989ae9d08bab10e0e6d103e656d1b0280 |
| crc32fast | 1.5.0 | MIT OR Apache-2.0 | https://github.com/srijs/rust-crc32fast | registry+https://github.com/rust-lang/crates.io-index | 9481c1c90cbf2ac953f07c8d4a58aa3945c425b7185c9154d67a65e4230da511 |
| crossbeam-channel | 0.5.15 | MIT OR Apache-2.0 | https://github.com/crossbeam-rs/crossbeam | registry+https://github.com/rust-lang/crates.io-index | 82b8f8f868b36967f9606790d1903570de9ceaf870a7bf9fbbd3016d636a2cb2 |
| crossbeam-deque | 0.8.6 | MIT OR Apache-2.0 | https://github.com/crossbeam-rs/crossbeam | registry+https://github.com/rust-lang/crates.io-index | 9dd111b7b7f7d55b72c0a6ae361660ee5853c9af73f70c3c2ef6858b950e2e51 |
| crossbeam-epoch | 0.9.18 | MIT OR Apache-2.0 | https://github.com/crossbeam-rs/crossbeam | registry+https://github.com/rust-lang/crates.io-index | 5b82ac4a3c2ca9c3460964f020e1402edd5753411d7737aa39c3714ad1b5420e |
| crossbeam-utils | 0.8.21 | MIT OR Apache-2.0 | https://github.com/crossbeam-rs/crossbeam | registry+https://github.com/rust-lang/crates.io-index | d0a5c400df2834b80a4c3327b3aad3a4c4cd4de0629063962b03235697506a28 |
| crypto-common | 0.1.7 | MIT OR Apache-2.0 | https://github.com/RustCrypto/traits | registry+https://github.com/rust-lang/crates.io-index | 78c8292055d1c1df0cce5d180393dc8cce0abec0a7102adb6c7b1eef6016d60a |
| cssparser | 0.27.2 | MPL-2.0 | https://github.com/servo/rust-cssparser | registry+https://github.com/rust-lang/crates.io-index | 754b69d351cdc2d8ee09ae203db831e005560fc6030da058f86ad60c92a9cb0a |
| cssparser-macros | 0.6.1 | MPL-2.0 | https://github.com/servo/rust-cssparser | registry+https://github.com/rust-lang/crates.io-index | 13b588ba4ac1a99f7f2964d24b3d896ddc6bf847ee3855dbd4366f058cfcd331 |
| ctor | 0.2.9 | Apache-2.0 OR MIT | https://github.com/mmastrac/rust-ctor | registry+https://github.com/rust-lang/crates.io-index | 32a2785755761f3ddc1492979ce1e48d2c00d09311c39e4466429188f3dd6501 |
| curve25519-dalek | 4.1.3 | BSD-3-Clause | https://github.com/dalek-cryptography/curve25519-dalek/tree/main/curve25519-dalek | registry+https://github.com/rust-lang/crates.io-index | 97fb8b7c4503de7d6ae7b42ab72a5a59857b4c937ec27a3d4539dba95b5ab2be |
| curve25519-dalek-derive | 0.1.1 | MIT/Apache-2.0 | https://github.com/dalek-cryptography/curve25519-dalek | registry+https://github.com/rust-lang/crates.io-index | f46882e17999c6cc590af592290432be3bce0428cb0d5f8b6715e4dc7b383eb3 |
| darling | 0.23.0 | MIT | https://github.com/TedDriggs/darling | registry+https://github.com/rust-lang/crates.io-index | 25ae13da2f202d56bd7f91c25fba009e7717a1e4a1cc98a76d844b65ae912e9d |
| darling_core | 0.23.0 | MIT | https://github.com/TedDriggs/darling | registry+https://github.com/rust-lang/crates.io-index | 9865a50f7c335f53564bb694ef660825eb8610e0a53d3e11bf1b0d3df31e03b0 |
| darling_macro | 0.23.0 | MIT | https://github.com/TedDriggs/darling | registry+https://github.com/rust-lang/crates.io-index | ac3984ec7bd6cfa798e62b4a642426a5be0e68f9401cfc2a01e3fa9ea2fcdb8d |
| der | 0.7.10 | Apache-2.0 OR MIT | https://github.com/RustCrypto/formats/tree/master/der | registry+https://github.com/rust-lang/crates.io-index | e7c1832837b905bbfb5101e07cc24c8deddf52f93225eee6ead5f4d63d53ddcb |
| deranged | 0.5.8 | MIT OR Apache-2.0 | https://github.com/jhpratt/deranged | registry+https://github.com/rust-lang/crates.io-index | 7cd812cc2bc1d69d4764bd80df88b4317eaef9e773c75226407d9bc0876b211c |
| derive_more | 0.99.20 | MIT | https://github.com/JelteF/derive_more | registry+https://github.com/rust-lang/crates.io-index | 6edb4b64a43d977b8e99788fe3a04d483834fba1215a7e02caa415b626497f7f |
| digest | 0.10.7 | MIT OR Apache-2.0 | https://github.com/RustCrypto/traits | registry+https://github.com/rust-lang/crates.io-index | 9ed9a281f7bc9b7576e61468ba615a66a5c8cfdff42420a70aa82701a3b1e292 |
| dirs-next | 2.0.0 | MIT OR Apache-2.0 | https://github.com/xdg-rs/dirs | registry+https://github.com/rust-lang/crates.io-index | b98cf8ebf19c3d1b223e151f99a4f9f0690dca41414773390fc824184ac833e1 |
| dirs-sys-next | 0.1.2 | MIT OR Apache-2.0 | https://github.com/xdg-rs/dirs/tree/master/dirs-sys | registry+https://github.com/rust-lang/crates.io-index | 4ebda144c4fe02d1f7ea1a7d9641b6fc6b580adcfa024ae48797ecdeb6825b4d |
| dispatch | 0.2.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | bd0c93bb4b0c6d9b77f4435b0ae98c24d17f1c45b2ff844c6151a07256ca923b |
| displaydoc | 0.2.5 | MIT OR Apache-2.0 | https://github.com/yaahc/displaydoc | registry+https://github.com/rust-lang/crates.io-index | 97369cbbc041bc366949bc74d34658d6cda5621039731c6310521892a3a20ae0 |
| dtoa | 1.0.11 | MIT OR Apache-2.0 | https://github.com/dtolnay/dtoa | registry+https://github.com/rust-lang/crates.io-index | 4c3cf4824e2d5f025c7b531afcb2325364084a16806f6d47fbc1f5fbd9960590 |
| dtoa-short | 0.3.5 | MPL-2.0 | https://github.com/upsuper/dtoa-short | registry+https://github.com/rust-lang/crates.io-index | cd1511a7b6a56299bd043a9c167a6d2bfb37bf84a6dfceaba651168adfb43c87 |
| dunce | 1.0.5 | CC0-1.0 OR MIT-0 OR Apache-2.0 | https://gitlab.com/kornelski/dunce | registry+https://github.com/rust-lang/crates.io-index | 92773504d58c093f6de2459af4af33faa518c13451eb8f2b5698ed3d36e7c813 |
| dyn-clone | 1.0.20 | MIT OR Apache-2.0 | https://github.com/dtolnay/dyn-clone | registry+https://github.com/rust-lang/crates.io-index | d0881ea181b1df73ff77ffaaf9c7544ecc11e82fba9b5f27b262a3c73a332555 |
| ed25519 | 2.2.3 | Apache-2.0 OR MIT | https://github.com/RustCrypto/signatures/tree/master/ed25519 | registry+https://github.com/rust-lang/crates.io-index | 115531babc129696a58c64a4fef0a8bf9e9698629fb97e9e40767d235cfbcd53 |
| ed25519-dalek | 2.2.0 | BSD-3-Clause | https://github.com/dalek-cryptography/curve25519-dalek/tree/main/ed25519-dalek | registry+https://github.com/rust-lang/crates.io-index | 70e796c081cee67dc755e1a36a0a172b897fab85fc3f6bc48307991f64e4eca9 |
| embed_plist | 1.2.2 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 4ef6b89e5b37196644d8796de5268852ff179b44e96276cf4290264843743bb7 |
| embed-resource | 2.5.2 | MIT | https://github.com/nabijaczleweli/rust-embed-resource | registry+https://github.com/rust-lang/crates.io-index | d506610004cfc74a6f5ee7e8c632b355de5eca1f03ee5e5e0ec11b77d4eb3d61 |
| encoding_rs | 0.8.35 | (Apache-2.0 OR MIT) AND BSD-3-Clause | https://github.com/hsivonen/encoding_rs | registry+https://github.com/rust-lang/crates.io-index | 75030f3c4f45dafd7586dd6780965a8c7e8e285a5ecb86713e63a79c5b2766f3 |
| equivalent | 1.0.2 | Apache-2.0 OR MIT | https://github.com/indexmap-rs/equivalent | registry+https://github.com/rust-lang/crates.io-index | 877a4ace8713b0bcf2a4e7eec82529c029f1d0619886d18145fea96c3ffe5c0f |
| errno | 0.3.14 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 39cab71617ae0d63f51a36d69f866391735b51691dbda63cf6f96d042b63efeb |
| fastrand | 2.4.1 | Apache-2.0 OR MIT | https://github.com/smol-rs/fastrand | registry+https://github.com/rust-lang/crates.io-index | 9f1f227452a390804cdb637b74a86990f2a7d7ba4b7d5693aac9b4dd6defd8d6 |
| fdeflate | 0.3.7 | MIT OR Apache-2.0 | https://github.com/image-rs/fdeflate | registry+https://github.com/rust-lang/crates.io-index | 1e6853b52649d4ac5c0bd02320cddc5ba956bdb407c4b75a2c6b75bf51500f8c |
| fiat-crypto | 0.2.9 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 28dea519a9695b9977216879a3ebfddf92f1c08c05d984f8996aecd6ecdc811d |
| field-offset | 0.3.6 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 38e2275cc4e4fc009b0669731a1e5ab7ebf11f469eaede2bab9309a5b4d6057f |
| filetime | 0.2.29 | MIT/Apache-2.0 | https://github.com/alexcrichton/filetime | registry+https://github.com/rust-lang/crates.io-index | 5c287a33c7f0a620c38e641e7f60827713987b3c0f26e8ddc9462cc69cf75759 |
| find-msvc-tools | 0.1.9 | MIT OR Apache-2.0 | https://github.com/rust-lang/cc-rs | registry+https://github.com/rust-lang/crates.io-index | 5baebc0774151f905a1a2cc41989300b1e6fbb29aff0ceffa1064fdd3088d582 |
| flate2 | 1.1.9 | MIT OR Apache-2.0 | https://github.com/rust-lang/flate2-rs | registry+https://github.com/rust-lang/crates.io-index | 843fba2746e448b37e26a819579957415c8cef339bf08564fe8b7ddbd959573c |
| fluent-uri | 0.1.4 | MIT | https://github.com/yescallop/fluent-uri-rs | registry+https://github.com/rust-lang/crates.io-index | 17c704e9dbe1ddd863da1e6ff3567795087b1eb201ce80d8fa81162e1516500d |
| fnv | 1.0.7 | Apache-2.0 / MIT | https://github.com/servo/rust-fnv | registry+https://github.com/rust-lang/crates.io-index | 3f9eec918d3f24069decb9af1554cad7c880e2da24a9afd88aca000531ab82c1 |
| foldhash | 0.1.5 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | d9c4f5dac5e15c24eb999c26181a6ca40b39fe946cbe4c263c7209467bc83af2 |
| foreign-types | 0.3.2 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | f6f339eb8adc052cd2ca78910fda869aefa38d22d5cb648e6485e4d3fc06f3b1 |
| foreign-types-shared | 0.1.1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 00b0228411908ca8685dba7fc2cdd70ec9990a6e753e89b6ac91a84c40fbaf4b |
| form_urlencoded | 1.2.2 | MIT OR Apache-2.0 | https://github.com/servo/rust-url | registry+https://github.com/rust-lang/crates.io-index | cb4cb245038516f5f85277875cdaa4f7d2c9a0fa0468de06ed190163b1581fcf |
| futf | 0.1.5 | MIT / Apache-2.0 | https://github.com/servo/futf | registry+https://github.com/rust-lang/crates.io-index | df420e2e84819663797d1ec6544b13c5be84629e7bb00dc960d6917db2987843 |
| futures-channel | 0.3.32 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 07bbe89c50d7a535e539b8c17bc0b49bdb77747034daa8087407d655f3f7cc1d |
| futures-core | 0.3.32 | MIT OR Apache-2.0 | https://github.com/rust-lang/futures-rs | registry+https://github.com/rust-lang/crates.io-index | 7e3450815272ef58cec6d564423f6e755e25379b217b0bc688e295ba24df6b1d |
| futures-executor | 0.3.32 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | baf29c38818342a3b26b5b923639e7b1f4a61fc5e76102d4b1981c6dc7a7579d |
| futures-io | 0.3.32 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | cecba35d7ad927e23624b22ad55235f2239cfa44fd10428eecbeba6d6a717718 |
| futures-macro | 0.3.32 | MIT OR Apache-2.0 | https://github.com/rust-lang/futures-rs | registry+https://github.com/rust-lang/crates.io-index | e835b70203e41293343137df5c0664546da5745f82ec9b84d40be8336958447b |
| futures-task | 0.3.32 | MIT OR Apache-2.0 | https://github.com/rust-lang/futures-rs | registry+https://github.com/rust-lang/crates.io-index | 037711b3d59c33004d3856fbdc83b99d4ff37a24768fa1be9ce3538a1cde4393 |
| futures-util | 0.3.32 | MIT OR Apache-2.0 | https://github.com/rust-lang/futures-rs | registry+https://github.com/rust-lang/crates.io-index | 389ca41296e6190b48053de0321d02a77f32f8a5d2461dd38762c0593805c6d6 |
| fxhash | 0.2.1 | Apache-2.0/MIT | https://github.com/cbreeden/fxhash | registry+https://github.com/rust-lang/crates.io-index | c31b6d751ae2c7f11320402d34e41349dd1016f8d5d45e48c4312bc8625af50c |
| gdk | 0.15.4 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | a6e05c1f572ab0e1f15be94217f0dc29088c248b14f792a5ff0af0d84bcda9e8 |
| gdk-pixbuf | 0.15.11 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | ad38dd9cc8b099cceecdf41375bb6d481b1b5a7cd5cd603e10a69a9383f8619a |
| gdk-pixbuf-sys | 0.15.10 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 140b2f5378256527150350a8346dbdb08fadc13453a7a2d73aecd5fab3c402a7 |
| gdk-sys | 0.15.1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 32e7a08c1e8f06f4177fb7e51a777b8c1689f743a7bc11ea91d44d2226073a88 |
| gdkwayland-sys | 0.15.3 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | cca49a59ad8cfdf36ef7330fe7bdfbe1d34323220cc16a0de2679ee773aee2c2 |
| gdkx11-sys | 0.15.1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | b4b7f8c7a84b407aa9b143877e267e848ff34106578b64d1e0a24bf550716178 |
| generator | 0.7.5 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 5cc16584ff22b460a382b7feec54b23d2908d858152e5739a120b949293bd74e |
| generic-array | 0.14.7 | MIT | https://github.com/fizyk20/generic-array.git | registry+https://github.com/rust-lang/crates.io-index | 85649ca51fd72272d7821adaf274ad91c288277713d9c18820d8499a7ff69e9a |
| getrandom | 0.1.16 | MIT OR Apache-2.0 | https://github.com/rust-random/getrandom | registry+https://github.com/rust-lang/crates.io-index | 8fc3cb4d91f53b50155bdcfd23f6a4c39ae1969c2ae85982b135750cccaf5fce |
| getrandom | 0.2.17 | MIT OR Apache-2.0 | https://github.com/rust-random/getrandom | registry+https://github.com/rust-lang/crates.io-index | ff2abc00be7fca6ebc474524697ae276ad847ad0a6b3faa4bcb027e9a4614ad0 |
| getrandom | 0.4.2 | MIT OR Apache-2.0 | https://github.com/rust-random/getrandom | registry+https://github.com/rust-lang/crates.io-index | 0de51e6874e94e7bf76d726fc5d13ba782deca734ff60d5bb2fb2607c7406555 |
| gio | 0.15.12 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 68fdbc90312d462781a395f7a16d96a2b379bb6ef8cd6310a2df272771c4283b |
| gio-sys | 0.15.10 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 32157a475271e2c4a023382e9cab31c4584ee30a97da41d3c4e9fdd605abcf8d |
| glib | 0.15.12 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | edb0306fbad0ab5428b0ca674a23893db909a98582969c9b537be4ced78c505d |
| glib-macros | 0.15.13 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 10c6ae9f6fa26f4fb2ac16b528d138d971ead56141de489f8111e259b9df3c4a |
| glib-sys | 0.15.10 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | ef4b192f8e65e9cf76cbf4ea71fa8e3be4a0e18ffe3d68b8da6836974cc5bad4 |
| glob | 0.3.3 | MIT OR Apache-2.0 | https://github.com/rust-lang/glob | registry+https://github.com/rust-lang/crates.io-index | 0cc23270f6e1808e30a928bdc84dea0b9b4136a8bc82338574f23baf47bbd280 |
| globset | 0.4.18 | Unlicense OR MIT | https://github.com/BurntSushi/ripgrep/tree/master/crates/globset | registry+https://github.com/rust-lang/crates.io-index | 52dfc19153a48bde0cbd630453615c8151bce3a5adfac7a0aebfbf0a1e1f57e3 |
| gobject-sys | 0.15.10 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 0d57ce44246becd17153bd035ab4d32cfee096a657fc01f2231c9278378d1e0a |
| gtk | 0.15.5 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 92e3004a2d5d6d8b5057d2b57b3712c9529b62e82c77f25c1fecde1fd5c23bd0 |
| gtk-sys | 0.15.3 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | d5bc2f0587cba247f60246a0ca11fe25fb733eabc3de12d1965fc07efab87c84 |
| gtk3-macros | 0.15.6 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 684c0456c086e8e7e9af73ec5b84e35938df394712054550e81558d21c44ab0d |
| hashbrown | 0.12.3 | MIT OR Apache-2.0 | https://github.com/rust-lang/hashbrown | registry+https://github.com/rust-lang/crates.io-index | 8a9ee70c43aaf417c914396645a0fa852624801b24ebb7ae78fe8272889ac888 |
| hashbrown | 0.15.5 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 9229cfe53dfd69f0609a49f65461bd93001ea1ef889cd5529dd176593f5338a1 |
| hashbrown | 0.17.1 | MIT OR Apache-2.0 | https://github.com/rust-lang/hashbrown | registry+https://github.com/rust-lang/crates.io-index | ed5909b6e89a2db4456e54cd5f673791d7eca6732202bbf2a9cc504fe2f9b84a |
| heck | 0.3.3 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 6d621efb26863f0e9924c6ac577e8275e5e6b77455db64ffa6c65c904e9e132c |
| heck | 0.4.1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 95505c38b4572b2d910cecb0281560f54b440a19336cbbcb27bf6ce6adc6f5a8 |
| heck | 0.5.0 | MIT OR Apache-2.0 | https://github.com/withoutboats/heck | registry+https://github.com/rust-lang/crates.io-index | 2304e00983f87ffb38b55b444b5e3b60a884b5d30c0fca7d82fe33449bbe55ea |
| hex | 0.4.3 | MIT OR Apache-2.0 | https://github.com/KokaKiwi/rust-hex | registry+https://github.com/rust-lang/crates.io-index | 7f24254aa9a54b5c858eaee2f5bccdb46aaf0e486a595ed5fd8f86ba55232a70 |
| hmac | 0.12.1 | MIT OR Apache-2.0 | https://github.com/RustCrypto/MACs | registry+https://github.com/rust-lang/crates.io-index | 6c49c37c09c17a53d937dfbb742eb3a961d65a994e6bcdcf37e7399d0cc8ab5e |
| html5ever | 0.26.0 | MIT OR Apache-2.0 | https://github.com/servo/html5ever | registry+https://github.com/rust-lang/crates.io-index | bea68cab48b8459f17cf1c944c67ddc572d272d9f2b274140f223ecb1da4a3b7 |
| http | 0.2.12 | MIT OR Apache-2.0 | https://github.com/hyperium/http | registry+https://github.com/rust-lang/crates.io-index | 601cbb57e577e2f5ef5be8e7b83f0f63994f25aa94d673e54a92d5c516d101f1 |
| http-range | 0.1.5 | MIT | https://github.com/bancek/rust-http-range.git | registry+https://github.com/rust-lang/crates.io-index | 21dec9db110f5f872ed9699c3ecf50cf16f423502706ba5c72462e28d3157573 |
| iana-time-zone | 0.1.65 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | e31bc9ad994ba00e440a8aa5c9ef0ec67d5cb5e5cb0cc7f8b744a35b389cc470 |
| iana-time-zone-haiku | 0.1.2 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | f31827a206f56af32e590ba56d5d2d085f558508192593743f16b2306495269f |
| ico | 0.4.0 | MIT | https://github.com/mdsteele/rust-ico | registry+https://github.com/rust-lang/crates.io-index | cc50b891e4acf8fe0e71ef88ec43ad82ee07b3810ad09de10f1d01f072ed4b98 |
| icu_collections | 2.2.0 | Unicode-3.0 | https://github.com/unicode-org/icu4x | registry+https://github.com/rust-lang/crates.io-index | 2984d1cd16c883d7935b9e07e44071dca8d917fd52ecc02c04d5fa0b5a3f191c |
| icu_locale_core | 2.2.0 | Unicode-3.0 | https://github.com/unicode-org/icu4x | registry+https://github.com/rust-lang/crates.io-index | 92219b62b3e2b4d88ac5119f8904c10f8f61bf7e95b640d25ba3075e6cac2c29 |
| icu_normalizer | 2.2.0 | Unicode-3.0 | https://github.com/unicode-org/icu4x | registry+https://github.com/rust-lang/crates.io-index | c56e5ee99d6e3d33bd91c5d85458b6005a22140021cc324cea84dd0e72cff3b4 |
| icu_normalizer_data | 2.2.0 | Unicode-3.0 | https://github.com/unicode-org/icu4x | registry+https://github.com/rust-lang/crates.io-index | da3be0ae77ea334f4da67c12f149704f19f81d1adf7c51cf482943e84a2bad38 |
| icu_properties | 2.2.0 | Unicode-3.0 | https://github.com/unicode-org/icu4x | registry+https://github.com/rust-lang/crates.io-index | bee3b67d0ea5c2cca5003417989af8996f8604e34fb9ddf96208a033901e70de |
| icu_properties_data | 2.2.0 | Unicode-3.0 | https://github.com/unicode-org/icu4x | registry+https://github.com/rust-lang/crates.io-index | 8e2bbb201e0c04f7b4b3e14382af113e17ba4f63e2c9d2ee626b720cbce54a14 |
| icu_provider | 2.2.0 | Unicode-3.0 | https://github.com/unicode-org/icu4x | registry+https://github.com/rust-lang/crates.io-index | 139c4cf31c8b5f33d7e199446eff9c1e02decfc2f0eec2c8d71f65befa45b421 |
| id-arena | 2.3.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 3d3067d79b975e8844ca9eb072e16b31c3c1c36928edf9c6789548c524d0d954 |
| ident_case | 1.0.1 | MIT/Apache-2.0 | https://github.com/TedDriggs/ident_case | registry+https://github.com/rust-lang/crates.io-index | b9e0384b61958566e926dc50660321d12159025e767c18e043daf26b70104c39 |
| idna | 1.1.0 | MIT OR Apache-2.0 | https://github.com/servo/rust-url/ | registry+https://github.com/rust-lang/crates.io-index | 3b0875f23caa03898994f6ddc501886a45c7d3d62d04d2d90788d47be1b1e4de |
| idna_adapter | 1.2.2 | Apache-2.0 OR MIT | https://github.com/hsivonen/idna_adapter | registry+https://github.com/rust-lang/crates.io-index | cb68373c0d6620ef8105e855e7745e18b0d00d3bdb07fb532e434244cdb9a714 |
| ignore | 0.4.25 | Unlicense OR MIT | https://github.com/BurntSushi/ripgrep/tree/master/crates/ignore | registry+https://github.com/rust-lang/crates.io-index | d3d782a365a015e0f5c04902246139249abf769125006fbe7649e2ee88169b4a |
| image | 0.24.9 | MIT OR Apache-2.0 | https://github.com/image-rs/image | registry+https://github.com/rust-lang/crates.io-index | 5690139d2f55868e080017335e4b94cb7414274c74f1669c84fb5feba2c9f69d |
| indexmap | 1.9.3 | Apache-2.0 OR MIT | https://github.com/bluss/indexmap | registry+https://github.com/rust-lang/crates.io-index | bd070e393353796e801d209ad339e89596eb4c8d430d18ede6a1cced8fafbd99 |
| indexmap | 2.14.0 | Apache-2.0 OR MIT | https://github.com/indexmap-rs/indexmap | registry+https://github.com/rust-lang/crates.io-index | d466e9454f08e4a911e14806c24e16fba1b4c121d1ea474396f396069cf949d9 |
| infer | 0.13.0 | MIT | https://github.com/bojand/infer | registry+https://github.com/rust-lang/crates.io-index | f551f8c3a39f68f986517db0d1759de85881894fdc7db798bd2a9df9cb04b7fc |
| instant | 0.1.13 | BSD-3-Clause | https://github.com/sebcrozet/instant | registry+https://github.com/rust-lang/crates.io-index | e0242819d153cba4b4b05a5a8f2a7e9bbf97b6055b2a002b395c96b5ff3c0222 |
| itoa | 0.4.8 | MIT OR Apache-2.0 | https://github.com/dtolnay/itoa | registry+https://github.com/rust-lang/crates.io-index | b71991ff56294aa922b450139ee08b3bfc70982c6b2c7562771375cf73542dd4 |
| itoa | 1.0.18 | MIT OR Apache-2.0 | https://github.com/dtolnay/itoa | registry+https://github.com/rust-lang/crates.io-index | 8f42a60cbdf9a97f5d2305f08a87dc4e09308d1276d28c869c684d7777685682 |
| javascriptcore-rs | 0.16.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | bf053e7843f2812ff03ef5afe34bb9c06ffee120385caad4f6b9967fcd37d41c |
| javascriptcore-rs-sys | 0.4.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 905fbb87419c5cde6e3269537e4ea7d46431f3008c5d057e915ef3f115e7793c |
| jni | 0.20.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 039022cdf4d7b1cf548d31f60ae783138e5fd42013f6271049d7df7afadef96c |
| jni-sys | 0.3.1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 41a652e1f9b6e0275df1f15b32661cf0d4b78d4d87ddec5e0c3c20f097433258 |
| jni-sys | 0.4.1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | c6377a88cb3910bee9b0fa88d4f42e1d2da8e79915598f65fb0c7ee14c878af2 |
| jni-sys-macros | 0.4.1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 38c0b942f458fe50cdac086d2f946512305e5631e720728f2a61aabcd47a6264 |
| js-sys | 0.3.98 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 67df7112613f8bfd9150013a0314e196f4800d3201ae742489d999db2f979f08 |
| json-patch | 2.0.0 | MIT/Apache-2.0 | https://github.com/idubrov/json-patch | registry+https://github.com/rust-lang/crates.io-index | 5b1fb8864823fad91877e6caea0baca82e49e8db50f8e5c9f9a453e27d3330fc |
| jsonptr | 0.4.7 | MIT OR Apache-2.0 | https://github.com/chanced/jsonptr | registry+https://github.com/rust-lang/crates.io-index | 1c6e529149475ca0b2820835d3dce8fcc41c6b943ca608d32f35b449255e4627 |
| kuchikiki | 0.8.2 | MIT | https://github.com/brave/kuchikiki | registry+https://github.com/rust-lang/crates.io-index | f29e4755b7b995046f510a7520c42b2fed58b77bd94d5a87a8eb43d2fd126da8 |
| lazy_static | 1.5.0 | MIT OR Apache-2.0 | https://github.com/rust-lang-nursery/lazy-static.rs | registry+https://github.com/rust-lang/crates.io-index | bbd2bcb4c963f2ddae06a2efc7e9f3591312473c50c6685e1f298068316e66fe |
| leb128fmt | 0.1.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 09edd9e8b54e49e587e4f6295a7d29c3ea94d469cb40ab8ca70b288248a81db2 |
| libc | 0.2.186 | MIT OR Apache-2.0 | https://github.com/rust-lang/libc | registry+https://github.com/rust-lang/crates.io-index | 68ab91017fe16c622486840e4c83c9a37afeff978bd239b5293d61ece587de66 |
| libredox | 0.1.16 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | e02f3bb43d335493c96bf3fd3a321600bf6bd07ed34bc64118e9293bdffea46c |
| linux-raw-sys | 0.12.1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 32a66949e030da00e8c7d4434b251670a91556f4144941d37452769c25d58a53 |
| litemap | 0.8.2 | Unicode-3.0 | https://github.com/unicode-org/icu4x | registry+https://github.com/rust-lang/crates.io-index | 92daf443525c4cce67b150400bc2316076100ce0b3686209eb8cf3c31612e6f0 |
| lock_api | 0.4.14 | MIT OR Apache-2.0 | https://github.com/Amanieu/parking_lot | registry+https://github.com/rust-lang/crates.io-index | 224399e74b87b5f3557511d98dff8b14089b3dadafcab6bb93eab67d3aace965 |
| log | 0.4.29 | MIT OR Apache-2.0 | https://github.com/rust-lang/log | registry+https://github.com/rust-lang/crates.io-index | 5e5032e24019045c762d3c0f28f5b6b8bbf38563a65908389bf7978758920897 |
| loom | 0.5.6 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | ff50ecb28bb86013e935fb6683ab1f6d3a20016f123c76fd4c27470076ac30f5 |
| mac | 0.1.1 | MIT/Apache-2.0 | https://github.com/reem/rust-mac.git | registry+https://github.com/rust-lang/crates.io-index | c41e0c4fef86961ac6d6f8a82609f55f31b05e4fce149ac5710e439df7619ba4 |
| malloc_buf | 0.0.6 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 62bb907fe88d54d8d9ce32a3cceab4218ed2f6b7d35617cafe9adf84e43919cb |
| markup5ever | 0.11.0 | MIT OR Apache-2.0 | https://github.com/servo/html5ever | registry+https://github.com/rust-lang/crates.io-index | 7a2629bb1404f3d34c2e921f21fd34ba00b206124c81f65c50b43b6aaefeb016 |
| matchers | 0.2.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | d1525a2a28c7f4fa0fc98bb91ae755d1e2d1505079e05539e35bc876b5d65ae9 |
| matches | 0.1.10 | MIT | https://github.com/SimonSapin/rust-std-candidates | registry+https://github.com/rust-lang/crates.io-index | 2532096657941c2fea9c289d370a250971c689d4f143798ff67113ec042024a5 |
| memchr | 2.8.0 | Unlicense OR MIT | https://github.com/BurntSushi/memchr | registry+https://github.com/rust-lang/crates.io-index | f8ca58f447f06ed17d5fc4043ce1b10dd205e060fb3ce5b979b8ed8e59ff3f79 |
| memoffset | 0.9.1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 488016bfae457b036d996092f6cb448677611ce4449e970ceaf42695203f218a |
| miniz_oxide | 0.8.9 | MIT OR Zlib OR Apache-2.0 | https://github.com/Frommi/miniz_oxide/tree/master/miniz_oxide | registry+https://github.com/rust-lang/crates.io-index | 1fa76a2c86f704bdb222d66965fb3d63269ce38518b83cb0575fca855ebb6316 |
| ndk | 0.6.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 2032c77e030ddee34a6787a64166008da93f6a352b629261d0fee232b8742dd4 |
| ndk-context | 0.1.1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 27b02d87554356db9e9a873add8782d4ea6e3e58ea071a9adb9a2e8ddb884a8b |
| ndk-sys | 0.3.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 6e5a6ae77c8ee183dcbbba6150e2e6b9f3f4196a7666c02a715a95692ec1fa97 |
| new_debug_unreachable | 1.0.6 | MIT | https://github.com/mbrubeck/rust-debug-unreachable | registry+https://github.com/rust-lang/crates.io-index | 650eef8c711430f1a879fdd01d4745a7deea475becfb90269c06775983bbf086 |
| nodrop | 0.1.14 | MIT/Apache-2.0 | https://github.com/bluss/arrayvec | registry+https://github.com/rust-lang/crates.io-index | 72ef4a56884ca558e5ddb05a1d1e7e1bfd9a68d9ed024c21704cc98872dae1bb |
| nu-ansi-term | 0.50.3 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 7957b9740744892f114936ab4a57b3f487491bbeafaf8083688b16841a4240e5 |
| num_enum | 0.5.11 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 1f646caf906c20226733ed5b1374287eb97e3c2a5c227ce668c1f2ce20ae57c9 |
| num_enum_derive | 0.5.11 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | dcbff9bc912032c62bf65ef1d5aea88983b420f4f839db1e9b0c281a25c9c799 |
| num-conv | 0.2.1 | MIT OR Apache-2.0 | https://github.com/jhpratt/num-conv | registry+https://github.com/rust-lang/crates.io-index | c6673768db2d862beb9b39a78fdcb1a69439615d5794a1be50caa9bc92c81967 |
| num-traits | 0.2.19 | MIT OR Apache-2.0 | https://github.com/rust-num/num-traits | registry+https://github.com/rust-lang/crates.io-index | 071dfc062690e90b734c0b2273ce72ad0ffa95f0c74596bc250dcfd960262841 |
| objc | 0.2.7 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 915b1b472bc21c53464d6c8461c9d3af805ba1ef837e1cac254428f4a77177b1 |
| objc_exception | 0.1.2 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | ad970fb455818ad6cba4c122ad012fae53ae8b4795f86378bce65e4f6bab2ca4 |
| objc_id | 0.1.1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | c92d4ddb4bd7b50d730c215ff871754d0da6b2178849f8a2a2ab69712d0c073b |
| objc-foundation | 0.1.1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 1add1b659e36c9607c7aab864a76c7a4c2760cd0cd2e120f3fb8b952c7e22bf9 |
| once_cell | 1.21.4 | MIT OR Apache-2.0 | https://github.com/matklad/once_cell | registry+https://github.com/rust-lang/crates.io-index | 9f7c3e4beb33f85d45ae3e3a1792185706c8e16d043238c593331cc7cd313b50 |
| open | 3.2.0 | MIT | https://github.com/Byron/open-rs | registry+https://github.com/rust-lang/crates.io-index | 2078c0039e6a54a0c42c28faa984e115fb4c2d5bf2208f77d1961002df8576f8 |
| pango | 0.15.10 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 22e4045548659aee5313bde6c582b0d83a627b7904dd20dc2d9ef0895d414e4f |
| pango-sys | 0.15.10 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | d2a00081cde4661982ed91d80ef437c20eacaf6aa1a5962c0279ae194662c3aa |
| parking_lot | 0.12.5 | MIT OR Apache-2.0 | https://github.com/Amanieu/parking_lot | registry+https://github.com/rust-lang/crates.io-index | 93857453250e3077bd71ff98b6a65ea6621a19bb0f559a85248955ac12c45a1a |
| parking_lot_core | 0.9.12 | MIT OR Apache-2.0 | https://github.com/Amanieu/parking_lot | registry+https://github.com/rust-lang/crates.io-index | 2621685985a2ebf1c516881c026032ac7deafcda1a2c9b7850dc81e3dfcb64c1 |
| pathdiff | 0.2.3 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | df94ce210e5bc13cb6651479fa48d14f601d9858cfe0467f43ae157023b938d3 |
| percent-encoding | 2.3.2 | MIT OR Apache-2.0 | https://github.com/servo/rust-url/ | registry+https://github.com/rust-lang/crates.io-index | 9b4f627cb1b25917193a259e49bdad08f671f8d9708acfd5fe0a8c1455d87220 |
| phf | 0.10.1 | MIT | https://github.com/sfackler/rust-phf | registry+https://github.com/rust-lang/crates.io-index | fabbf1ead8a5bcbc20f5f8b939ee3f5b0f6f281b6ad3468b84656b658b455259 |
| phf | 0.11.3 | MIT | https://github.com/rust-phf/rust-phf | registry+https://github.com/rust-lang/crates.io-index | 1fd6780a80ae0c52cc120a26a1a42c1ae51b247a253e4e06113d23d2c2edd078 |
| phf | 0.8.0 | MIT | https://github.com/sfackler/rust-phf | registry+https://github.com/rust-lang/crates.io-index | 3dfb61232e34fcb633f43d12c58f83c1df82962dcdfa565a4e866ffc17dafe12 |
| phf_codegen | 0.10.0 | MIT | https://github.com/sfackler/rust-phf | registry+https://github.com/rust-lang/crates.io-index | 4fb1c3a8bc4dd4e5cfce29b44ffc14bedd2ee294559a294e2a4d4c9e9a6a13cd |
| phf_codegen | 0.8.0 | MIT | https://github.com/sfackler/rust-phf | registry+https://github.com/rust-lang/crates.io-index | cbffee61585b0411840d3ece935cce9cb6321f01c45477d30066498cd5e1a815 |
| phf_generator | 0.10.0 | MIT | https://github.com/sfackler/rust-phf | registry+https://github.com/rust-lang/crates.io-index | 5d5285893bb5eb82e6aaf5d59ee909a06a16737a8970984dd7746ba9283498d6 |
| phf_generator | 0.11.3 | MIT | https://github.com/rust-phf/rust-phf | registry+https://github.com/rust-lang/crates.io-index | 3c80231409c20246a13fddb31776fb942c38553c51e871f8cbd687a4cfb5843d |
| phf_generator | 0.8.0 | MIT | https://github.com/sfackler/rust-phf | registry+https://github.com/rust-lang/crates.io-index | 17367f0cc86f2d25802b2c26ee58a7b23faeccf78a396094c13dced0d0182526 |
| phf_macros | 0.11.3 | MIT | https://github.com/rust-phf/rust-phf | registry+https://github.com/rust-lang/crates.io-index | f84ac04429c13a7ff43785d75ad27569f2951ce0ffd30a3321230db2fc727216 |
| phf_macros | 0.8.0 | MIT | https://github.com/sfackler/rust-phf | registry+https://github.com/rust-lang/crates.io-index | 7f6fde18ff429ffc8fe78e2bf7f8b7a5a5a6e2a8b58bc5a9ac69198bbda9189c |
| phf_shared | 0.10.0 | MIT | https://github.com/sfackler/rust-phf | registry+https://github.com/rust-lang/crates.io-index | b6796ad771acdc0123d2a88dc428b5e38ef24456743ddb1744ed628f9815c096 |
| phf_shared | 0.11.3 | MIT | https://github.com/rust-phf/rust-phf | registry+https://github.com/rust-lang/crates.io-index | 67eabc2ef2a60eb7faa00097bd1ffdb5bd28e62bf39990626a582201b7a754e5 |
| phf_shared | 0.8.0 | MIT | https://github.com/sfackler/rust-phf | registry+https://github.com/rust-lang/crates.io-index | c00cf8b9eafe68dde5e9eaa2cef8ee84a9336a47d566ec55ca16589633b65af7 |
| pin-project-lite | 0.2.17 | Apache-2.0 OR MIT | https://github.com/taiki-e/pin-project-lite | registry+https://github.com/rust-lang/crates.io-index | a89322df9ebe1c1578d689c92318e070967d1042b512afbe49518723f4e6d5cd |
| pkcs8 | 0.10.2 | Apache-2.0 OR MIT | https://github.com/RustCrypto/formats/tree/master/pkcs8 | registry+https://github.com/rust-lang/crates.io-index | f950b2377845cebe5cf8b5165cb3cc1a5e0fa5cfa3e1f7f55707d8fd82e0a7b7 |
| pkg-config | 0.3.33 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 19f132c84eca552bf34cab8ec81f1c1dcc229b811638f9d283dceabe58c5569e |
| plist | 1.9.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 092791278e026273c1b65bbdcfbba3a300f2994c896bd01ab01da613c29c46f1 |
| png | 0.17.16 | MIT OR Apache-2.0 | https://github.com/image-rs/image-png | registry+https://github.com/rust-lang/crates.io-index | 82151a2fc869e011c153adc57cf2789ccb8d9906ce52c0b39a6b5697749d7526 |
| potential_utf | 0.1.5 | Unicode-3.0 | https://github.com/unicode-org/icu4x | registry+https://github.com/rust-lang/crates.io-index | 0103b1cef7ec0cf76490e969665504990193874ea05c85ff9bab8b911d0a0564 |
| powerfmt | 0.2.0 | MIT OR Apache-2.0 | https://github.com/jhpratt/powerfmt | registry+https://github.com/rust-lang/crates.io-index | 439ee305def115ba05938db6eb1644ff94165c5ab5e9420d1c1bcedbba909391 |
| ppv-lite86 | 0.2.21 | MIT OR Apache-2.0 | https://github.com/cryptocorrosion/cryptocorrosion | registry+https://github.com/rust-lang/crates.io-index | 85eae3c4ed2f50dcfe72643da4befc30deadb458a9b590d720cde2f2b1e97da9 |
| precomputed-hash | 0.1.1 | MIT | https://github.com/emilio/precomputed-hash | registry+https://github.com/rust-lang/crates.io-index | 925383efa346730478fb4838dbe9137d2a47675ad789c546d150a6e1dd4ab31c |
| prettyplease | 0.2.37 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 479ca8adacdd7ce8f1fb39ce9ecccbfe93a3f1344b3d0d97f20bc0196208f62b |
| proc-macro-crate | 1.3.1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 7f4c021e1093a56626774e81216a4ce732a735e5bad4868a03f3ed65ca0c3919 |
| proc-macro-error | 1.0.4 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | da25490ff9892aab3fcf7c36f08cfb902dd3e71ca0f9f9517bea02a73a5ce38c |
| proc-macro-error-attr | 1.0.4 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | a1be40180e52ecc98ad80b184934baf3d0d29f979574e439af5a55274b35f869 |
| proc-macro-hack | 0.5.20+deprecated | MIT OR Apache-2.0 | https://github.com/dtolnay/proc-macro-hack | registry+https://github.com/rust-lang/crates.io-index | dc375e1527247fe1a97d8b7156678dfe7c1af2fc075c9a4db3690ecd2a148068 |
| proc-macro2 | 1.0.106 | MIT OR Apache-2.0 | https://github.com/dtolnay/proc-macro2 | registry+https://github.com/rust-lang/crates.io-index | 8fd00f0bb2e90d81d1044c2b32617f68fcb9fa3bb7640c23e9c748e53fb30934 |
| quick-xml | 0.39.4 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | cdcc8dd4e2f670d309a5f0e83fe36dfdc05af317008fea29144da1a2ac858e5e |
| quote | 1.0.45 | MIT OR Apache-2.0 | https://github.com/dtolnay/quote | registry+https://github.com/rust-lang/crates.io-index | 41f2619966050689382d2b44f664f4bc593e129785a36d6ee376ddf37259b924 |
| r-efi | 6.0.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | f8dcc9c7d52a811697d2151c701e0d08956f92b0e24136cf4cf27b57a6a0d9bf |
| rand | 0.7.3 | MIT OR Apache-2.0 | https://github.com/rust-random/rand | registry+https://github.com/rust-lang/crates.io-index | 6a6b1679d49b24bbfe0c803429aa1874472f50d9b363131f0e89fc356b544d03 |
| rand | 0.8.6 | MIT OR Apache-2.0 | https://github.com/rust-random/rand | registry+https://github.com/rust-lang/crates.io-index | 5ca0ecfa931c29007047d1bc58e623ab12e5590e8c7cc53200d5202b69266d8a |
| rand_chacha | 0.2.2 | MIT OR Apache-2.0 | https://github.com/rust-random/rand | registry+https://github.com/rust-lang/crates.io-index | f4c8ed856279c9737206bf725bf36935d8666ead7aa69b52be55af369d193402 |
| rand_chacha | 0.3.1 | MIT OR Apache-2.0 | https://github.com/rust-random/rand | registry+https://github.com/rust-lang/crates.io-index | e6c10a63a0fa32252be49d21e7709d4d4baf8d231c2dbce1eaa8141b9b127d88 |
| rand_core | 0.5.1 | MIT OR Apache-2.0 | https://github.com/rust-random/rand | registry+https://github.com/rust-lang/crates.io-index | 90bde5296fc891b0cef12a6d03ddccc162ce7b2aff54160af9338f8d40df6d19 |
| rand_core | 0.6.4 | MIT OR Apache-2.0 | https://github.com/rust-random/rand | registry+https://github.com/rust-lang/crates.io-index | ec0be4795e2f6a28069bec0b5ff3e2ac9bafc99e6a9a7dc3547996c5c816922c |
| rand_hc | 0.2.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | ca3129af7b92a17112d59ad498c6f81eaf463253766b90396d39ea7a39d6613c |
| rand_pcg | 0.2.1 | MIT OR Apache-2.0 | https://github.com/rust-random/rand | registry+https://github.com/rust-lang/crates.io-index | 16abd0c1b639e9eb4d7c50c0b8100b0d0f849be2349829c740fe8e6eb4816429 |
| raw-window-handle | 0.5.2 | MIT OR Apache-2.0 OR Zlib | https://github.com/rust-windowing/raw-window-handle | registry+https://github.com/rust-lang/crates.io-index | f2ff9a1f06a88b01621b7ae906ef0211290d1c8a168a15542486a8f61c0833b9 |
| redox_syscall | 0.5.18 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | ed2bf2547551a7053d6fdfafda3f938979645c44812fbfcda098faae3f1a362d |
| redox_users | 0.4.6 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | ba009ff324d1fc1b900bd1fdb31564febe58a8ccc8a6fdbb93b543d33b13ca43 |
| ref-cast | 1.0.25 | MIT OR Apache-2.0 | https://github.com/dtolnay/ref-cast | registry+https://github.com/rust-lang/crates.io-index | f354300ae66f76f1c85c5f84693f0ce81d747e2c3f21a45fef496d89c960bf7d |
| ref-cast-impl | 1.0.25 | MIT OR Apache-2.0 | https://github.com/dtolnay/ref-cast | registry+https://github.com/rust-lang/crates.io-index | b7186006dcb21920990093f30e3dea63b7d6e977bf1256be20c3563a5db070da |
| regex | 1.12.3 | MIT OR Apache-2.0 | https://github.com/rust-lang/regex | registry+https://github.com/rust-lang/crates.io-index | e10754a14b9137dd7b1e3e5b0493cc9171fdd105e0ab477f51b72e7f3ac0e276 |
| regex-automata | 0.4.14 | MIT OR Apache-2.0 | https://github.com/rust-lang/regex | registry+https://github.com/rust-lang/crates.io-index | 6e1dd4122fc1595e8162618945476892eefca7b88c52820e74af6262213cae8f |
| regex-syntax | 0.8.10 | MIT OR Apache-2.0 | https://github.com/rust-lang/regex | registry+https://github.com/rust-lang/crates.io-index | dc897dd8d9e8bd1ed8cdad82b5966c3e0ecae09fb1907d58efaa013543185d0a |
| rfd | 0.10.0 | MIT | https://github.com/PolyMeilex/rfd | registry+https://github.com/rust-lang/crates.io-index | 0149778bd99b6959285b0933288206090c50e2327f47a9c463bfdbf45c8823ea |
| rustc_version | 0.4.1 | MIT OR Apache-2.0 | https://github.com/djc/rustc-version-rs | registry+https://github.com/rust-lang/crates.io-index | cfcb3a22ef46e85b45de6ee7e79d063319ebb6594faafcf1c225ea92ab6e9b92 |
| rustix | 1.1.4 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | b6fe4565b9518b83ef4f91bb47ce29620ca828bd32cb7e408f0062e9930ba190 |
| rustversion | 1.0.22 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | b39cdef0fa800fc44525c84ccb54a029961a8215f9619753635a9c0d2538d46d |
| same-file | 1.0.6 | Unlicense/MIT | https://github.com/BurntSushi/same-file | registry+https://github.com/rust-lang/crates.io-index | 93fc1dc3aaa9bfed95e02e6eadabb4baf7e3078b0bd1b4d7b6b0b68378900502 |
| schemars | 0.9.0 | MIT | https://github.com/GREsau/schemars | registry+https://github.com/rust-lang/crates.io-index | 4cd191f9397d57d581cddd31014772520aa448f65ef991055d7f61582c65165f |
| schemars | 1.2.1 | MIT | https://github.com/GREsau/schemars | registry+https://github.com/rust-lang/crates.io-index | a2b42f36aa1cd011945615b92222f6bf73c599a102a300334cd7f8dbeec726cc |
| scoped-tls | 1.0.1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | e1cf6437eb19a8f4a6cc0f7dca544973b0b78843adbfeb3683d1a94a0024a294 |
| scopeguard | 1.2.0 | MIT OR Apache-2.0 | https://github.com/bluss/scopeguard | registry+https://github.com/rust-lang/crates.io-index | 94143f37725109f92c262ed2cf5e59bce7498c01bcc1502d7b9afe439a4e9f49 |
| selectors | 0.22.0 | MPL-2.0 | https://github.com/servo/servo | registry+https://github.com/rust-lang/crates.io-index | df320f1889ac4ba6bc0cdc9c9af7af4bd64bb927bccdf32d81140dc1f9be12fe |
| semver | 1.0.28 | MIT OR Apache-2.0 | https://github.com/dtolnay/semver | registry+https://github.com/rust-lang/crates.io-index | 8a7852d02fc848982e0c167ef163aaff9cd91dc640ba85e263cb1ce46fae51cd |
| serde | 1.0.228 | MIT OR Apache-2.0 | https://github.com/serde-rs/serde | registry+https://github.com/rust-lang/crates.io-index | 9a8e94ea7f378bd32cbbd37198a4a91436180c5bb472411e48b5ec2e2124ae9e |
| serde_core | 1.0.228 | MIT OR Apache-2.0 | https://github.com/serde-rs/serde | registry+https://github.com/rust-lang/crates.io-index | 41d385c7d4ca58e59fc732af25c3983b67ac852c1a25000afe1175de458b67ad |
| serde_derive | 1.0.228 | MIT OR Apache-2.0 | https://github.com/serde-rs/serde | registry+https://github.com/rust-lang/crates.io-index | d540f220d3187173da220f885ab66608367b6574e925011a9353e4badda91d79 |
| serde_json | 1.0.149 | MIT OR Apache-2.0 | https://github.com/serde-rs/json | registry+https://github.com/rust-lang/crates.io-index | 83fc039473c5595ace860d8c4fafa220ff474b3fc6bfdb4293327f1a37e94d86 |
| serde_repr | 0.1.20 | MIT OR Apache-2.0 | https://github.com/dtolnay/serde-repr | registry+https://github.com/rust-lang/crates.io-index | 175ee3e80ae9982737ca543e96133087cbd9a485eecc3bc4de9c1a37b47ea59c |
| serde_spanned | 0.6.9 | MIT OR Apache-2.0 | https://github.com/toml-rs/toml | registry+https://github.com/rust-lang/crates.io-index | bf41e0cfaf7226dca15e8197172c295a782857fcb97fad1808a166870dee75a3 |
| serde_with | 3.20.0 | MIT OR Apache-2.0 | https://github.com/jonasbb/serde_with/ | registry+https://github.com/rust-lang/crates.io-index | e72c1c2cb7b223fafb600a619537a871c2818583d619401b785e7c0b746ccde2 |
| serde_with_macros | 3.20.0 | MIT OR Apache-2.0 | https://github.com/jonasbb/serde_with/ | registry+https://github.com/rust-lang/crates.io-index | b90c488738ecb4fb0262f41f43bc40efc5868d9fb744319ddf5f5317f417bfac |
| serialize-to-javascript | 0.1.2 | MIT OR Apache-2.0 | https://github.com/chippers/serialize-to-javascript | registry+https://github.com/rust-lang/crates.io-index | 04f3666a07a197cdb77cdf306c32be9b7f598d7060d50cfd4d5aa04bfd92f6c5 |
| serialize-to-javascript-impl | 0.1.2 | MIT OR Apache-2.0 | https://github.com/chippers/serialize-to-javascript | registry+https://github.com/rust-lang/crates.io-index | 772ee033c0916d670af7860b6e1ef7d658a4629a6d0b4c8c3e67f09b3765b75d |
| servo_arc | 0.1.1 | MIT/Apache-2.0 | https://github.com/servo/servo | registry+https://github.com/rust-lang/crates.io-index | d98238b800e0d1576d8b6e3de32827c2d74bee68bb97748dcf5071fb53965432 |
| sha2 | 0.10.9 | MIT OR Apache-2.0 | https://github.com/RustCrypto/hashes | registry+https://github.com/rust-lang/crates.io-index | a7507d819769d01a365ab707794a4084392c824f54a7a6a7862f8c3d0892b283 |
| sharded-slab | 0.1.7 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | f40ca3c46823713e0d4209592e8d6e826aa57e928f09752619fc696c499637f6 |
| shlex | 1.3.0 | MIT OR Apache-2.0 | https://github.com/comex/rust-shlex | registry+https://github.com/rust-lang/crates.io-index | 0fda2ff0d084019ba4d7c6f371c95d8fd75ce3524c3cb8fb653a3023f6323e64 |
| signature | 2.2.0 | Apache-2.0 OR MIT | https://github.com/RustCrypto/traits/tree/master/signature | registry+https://github.com/rust-lang/crates.io-index | 77549399552de45a898a580c1b41d445bf730df867cc44e6c0233bbc4b8329de |
| simd-adler32 | 0.3.9 | MIT | https://github.com/mcountryman/simd-adler32 | registry+https://github.com/rust-lang/crates.io-index | 703d5c7ef118737c72f1af64ad2f6f8c5e1921f818cdcb97b8fe6fc69bf66214 |
| siphasher | 0.3.11 | MIT/Apache-2.0 | https://github.com/jedisct1/rust-siphash | registry+https://github.com/rust-lang/crates.io-index | 38b58827f4464d87d377d175e90bf58eb00fd8716ff0a62f80356b5e61555d0d |
| siphasher | 1.0.3 | MIT/Apache-2.0 | https://github.com/jedisct1/rust-siphash | registry+https://github.com/rust-lang/crates.io-index | 8ee5873ec9cce0195efcb7a4e9507a04cd49aec9c83d0389df45b1ef7ba2e649 |
| slab | 0.4.12 | MIT | https://github.com/tokio-rs/slab | registry+https://github.com/rust-lang/crates.io-index | 0c790de23124f9ab44544d7ac05d60440adc586479ce501c1d6d7da3cd8c9cf5 |
| smallvec | 1.15.1 | MIT OR Apache-2.0 | https://github.com/servo/rust-smallvec | registry+https://github.com/rust-lang/crates.io-index | 67b1b7a3b5fe4f1376887184045fcf45c69e92af734b7aaddc05fb777b6fbd03 |
| soup2 | 0.2.1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | b2b4d76501d8ba387cf0fefbe055c3e0a59891d09f0f995ae4e4b16f6b60f3c0 |
| soup2-sys | 0.2.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 009ef427103fcb17f802871647a7fa6c60cbb654b4c4e4c0ac60a31c5f6dc9cf |
| spki | 0.7.3 | Apache-2.0 OR MIT | https://github.com/RustCrypto/formats/tree/master/spki | registry+https://github.com/rust-lang/crates.io-index | d91ed6c858b01f942cd56b37a94b3e0a1798290327d1236e4d9cf4eaca44d29d |
| stable_deref_trait | 1.2.1 | MIT OR Apache-2.0 | https://github.com/storyyeller/stable_deref_trait | registry+https://github.com/rust-lang/crates.io-index | 6ce2be8dc25455e1f91df71bfa12ad37d7af1092ae736f3a6cd0e37bc7810596 |
| state | 0.5.3 | MIT/Apache-2.0 | https://github.com/SergioBenitez/state | registry+https://github.com/rust-lang/crates.io-index | dbe866e1e51e8260c9eed836a042a5e7f6726bb2b411dffeaa712e19c388f23b |
| string_cache | 0.8.9 | MIT OR Apache-2.0 | https://github.com/servo/string-cache | registry+https://github.com/rust-lang/crates.io-index | bf776ba3fa74f83bf4b63c3dcbbf82173db2632ed8452cb2d891d33f459de70f |
| string_cache_codegen | 0.5.4 | MIT OR Apache-2.0 | https://github.com/servo/string-cache | registry+https://github.com/rust-lang/crates.io-index | c711928715f1fe0fe509c53b43e993a9a557babc2d0a3567d0a3006f1ac931a0 |
| strsim | 0.11.1 | MIT | https://github.com/rapidfuzz/strsim-rs | registry+https://github.com/rust-lang/crates.io-index | 7da8b5736845d9f2fcb837ea5d9e2628564b3b043a70948a3f0b778838c5fb4f |
| subtle | 2.6.1 | BSD-3-Clause | https://github.com/dalek-cryptography/subtle | registry+https://github.com/rust-lang/crates.io-index | 13c2bddecc57b384dee18652358fb23172facb8a2c51ccc10d74c157bdea3292 |
| syn | 1.0.109 | MIT OR Apache-2.0 | https://github.com/dtolnay/syn | registry+https://github.com/rust-lang/crates.io-index | 72b64191b275b66ffe2469e8af2c1cfe3bafa67b529ead792a6d0160888b4237 |
| syn | 2.0.117 | MIT OR Apache-2.0 | https://github.com/dtolnay/syn | registry+https://github.com/rust-lang/crates.io-index | e665b8803e7b1d2a727f4023456bbbbe74da67099c585258af0ad9c5013b9b99 |
| synstructure | 0.13.2 | MIT | https://github.com/mystor/synstructure | registry+https://github.com/rust-lang/crates.io-index | 728a70f3dbaf5bab7f0c4b1ac8d7ae5ea60a4b5549c8a5914361c99147a709d2 |
| system-deps | 5.0.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 18db855554db7bd0e73e06cf7ba3df39f97812cb11d3f75e71c39bf45171797e |
| system-deps | 6.2.2 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | a3e535eb8dded36d55ec13eddacd30dec501792ff23a0b1682c38601b8cf2349 |
| tao | 0.16.11 | Apache-2.0 | https://github.com/tauri-apps/tao | registry+https://github.com/rust-lang/crates.io-index | 1bf915e6c7112402f7b88a064cfbd264f851052df07fdc3a2abd3038b0cc434a |
| tao-macros | 0.1.3 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | f4e16beb8b2ac17db28eab8bca40e62dbfbb34c0fcdc6d9826b11b7b5d047dfd |
| tar | 0.4.45 | MIT OR Apache-2.0 | https://github.com/alexcrichton/tar-rs | registry+https://github.com/rust-lang/crates.io-index | 22692a6476a21fa75fdfc11d452fda482af402c008cdbaf3476414e122040973 |
| target-lexicon | 0.12.16 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 61c41af27dd6d1e27b1b16b489db798443478cef1f06a660c96db617ba5de3b1 |
| tauri | 1.8.3 | Apache-2.0 OR MIT | https://github.com/tauri-apps/tauri | registry+https://github.com/rust-lang/crates.io-index | 3ae1f57c291a6ab8e1d2e6b8ad0a35ff769c9925deb8a89de85425ff08762d0c |
| tauri-build | 1.5.6 | Apache-2.0 OR MIT | https://github.com/tauri-apps/tauri/tree/dev/core/tauri-build | registry+https://github.com/rust-lang/crates.io-index | 2db08694eec06f53625cfc6fff3a363e084e5e9a238166d2989996413c346453 |
| tauri-codegen | 1.4.6 | Apache-2.0 OR MIT | https://github.com/tauri-apps/tauri/tree/dev/core/tauri-codegen | registry+https://github.com/rust-lang/crates.io-index | 53438d78c4a037ffe5eafa19e447eea599bedfb10844cb08ec53c2471ac3ac3f |
| tauri-macros | 1.4.7 | Apache-2.0 OR MIT | https://github.com/tauri-apps/tauri | registry+https://github.com/rust-lang/crates.io-index | 233988ac08c1ed3fe794cd65528d48d8f7ed4ab3895ca64cdaa6ad4d00c45c0b |
| tauri-runtime | 0.14.6 | Apache-2.0 OR MIT | https://github.com/tauri-apps/tauri | registry+https://github.com/rust-lang/crates.io-index | 8066855882f00172935e3fa7d945126580c34dcbabab43f5d4f0c2398a67d47b |
| tauri-runtime-wry | 0.14.11 | Apache-2.0 OR MIT | https://github.com/tauri-apps/tauri | registry+https://github.com/rust-lang/crates.io-index | ce361fec1e186705371f1c64ae9dd2a3a6768bc530d0a2d5e75a634bb416ad4d |
| tauri-utils | 1.6.2 | Apache-2.0 OR MIT | https://github.com/tauri-apps/tauri | registry+https://github.com/rust-lang/crates.io-index | c357952645e679de02cd35007190fcbce869b93ffc61b029f33fe02648453774 |
| tauri-winres | 0.1.1 | MIT | https://github.com/tauri-apps/winres | registry+https://github.com/rust-lang/crates.io-index | 5993dc129e544393574288923d1ec447c857f3f644187f4fbf7d9a875fbfc4fb |
| tempfile | 3.27.0 | MIT OR Apache-2.0 | https://github.com/Stebalien/tempfile | registry+https://github.com/rust-lang/crates.io-index | 32497e9a4c7b38532efcdebeef879707aa9f794296a4f0244f6f69e9bc8574bd |
| tendril | 0.4.3 | MIT/Apache-2.0 | https://github.com/servo/tendril | registry+https://github.com/rust-lang/crates.io-index | d24a120c5fc464a3458240ee02c299ebcb9d67b5249c8848b09d639dca8d7bb0 |
| thin-slice | 0.1.1 | MPL-2.0 | https://github.com/heycam/thin-slice | registry+https://github.com/rust-lang/crates.io-index | 8eaa81235c7058867fa8c0e7314f33dcce9c215f535d1913822a2b3f5e289f3c |
| thiserror | 1.0.69 | MIT OR Apache-2.0 | https://github.com/dtolnay/thiserror | registry+https://github.com/rust-lang/crates.io-index | b6aaf5339b578ea85b50e080feb250a3e8ae8cfcdff9a461c9ec2904bc923f52 |
| thiserror-impl | 1.0.69 | MIT OR Apache-2.0 | https://github.com/dtolnay/thiserror | registry+https://github.com/rust-lang/crates.io-index | 4fee6c4efc90059e10f81e6d42c60a18f76588c3d74cb83a0b242a2b6c7504c1 |
| thread_local | 1.1.9 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | f60246a4944f24f6e018aa17cdeffb7818b76356965d03b07d6a9886e8962185 |
| time | 0.3.47 | MIT OR Apache-2.0 | https://github.com/time-rs/time | registry+https://github.com/rust-lang/crates.io-index | 743bd48c283afc0388f9b8827b976905fb217ad9e647fae3a379a9283c4def2c |
| time-core | 0.1.8 | MIT OR Apache-2.0 | https://github.com/time-rs/time | registry+https://github.com/rust-lang/crates.io-index | 7694e1cfe791f8d31026952abf09c69ca6f6fa4e1a1229e18988f06a04a12dca |
| time-macros | 0.2.27 | MIT OR Apache-2.0 | https://github.com/time-rs/time | registry+https://github.com/rust-lang/crates.io-index | 2e70e4c5a0e0a8a4823ad65dfe1a6930e4f4d756dcd9dd7939022b5e8c501215 |
| tinystr | 0.8.3 | Unicode-3.0 | https://github.com/unicode-org/icu4x | registry+https://github.com/rust-lang/crates.io-index | c8323304221c2a851516f22236c5722a72eaa19749016521d6dff0824447d96d |
| tinyvec | 1.11.0 | Zlib OR Apache-2.0 OR MIT | https://github.com/Lokathor/tinyvec | registry+https://github.com/rust-lang/crates.io-index | 3e61e67053d25a4e82c844e8424039d9745781b3fc4f32b8d55ed50f5f667ef3 |
| tinyvec_macros | 0.1.1 | MIT OR Apache-2.0 OR Zlib | https://github.com/Soveu/tinyvec_macros | registry+https://github.com/rust-lang/crates.io-index | 1f3ccbac311fea05f86f61904b462b55fb3df8837a366dfc601a0161d0532f20 |
| tokio | 1.52.3 | MIT | https://github.com/tokio-rs/tokio | registry+https://github.com/rust-lang/crates.io-index | 8fc7f01b389ac15039e4dc9531aa973a135d7a4135281b12d7c1bc79fd57fffe |
| toml | 0.5.11 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | f4f7f0dd8d50a853a531c426359045b1998f04219d88799810762cd4ad314234 |
| toml | 0.7.8 | MIT OR Apache-2.0 | https://github.com/toml-rs/toml | registry+https://github.com/rust-lang/crates.io-index | dd79e69d3b627db300ff956027cc6c3798cef26d22526befdfcd12feeb6d2257 |
| toml | 0.8.23 | MIT OR Apache-2.0 | https://github.com/toml-rs/toml | registry+https://github.com/rust-lang/crates.io-index | dc1beb996b9d83529a9e75c17a1686767d148d70663143c7854d8b4a09ced362 |
| toml_datetime | 0.6.11 | MIT OR Apache-2.0 | https://github.com/toml-rs/toml | registry+https://github.com/rust-lang/crates.io-index | 22cddaf88f4fbc13c51aebbf5f8eceb5c7c5a9da2ac40a13519eb5b0a0e8f11c |
| toml_edit | 0.19.15 | MIT OR Apache-2.0 | https://github.com/toml-rs/toml | registry+https://github.com/rust-lang/crates.io-index | 1b5bb770da30e5cbfde35a2d7b9b8a2c4b8ef89548a7a6aeab5c9a576e3e7421 |
| toml_edit | 0.22.27 | MIT OR Apache-2.0 | https://github.com/toml-rs/toml | registry+https://github.com/rust-lang/crates.io-index | 41fe8c660ae4257887cf66394862d21dbca4a6ddd26f04a3560410406a2f819a |
| toml_write | 0.1.2 | MIT OR Apache-2.0 | https://github.com/toml-rs/toml | registry+https://github.com/rust-lang/crates.io-index | 5d99f8c9a7727884afe522e9bd5edbfc91a3312b36a77b5fb8926e4c31a41801 |
| tracing | 0.1.44 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 63e71662fa4b2a2c3a26f570f037eb95bb1f85397f3cd8076caed2f026a6d100 |
| tracing-attributes | 0.1.31 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 7490cfa5ec963746568740651ac6781f701c9c5ea257c58e057f3ba8cf69e8da |
| tracing-core | 0.1.36 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | db97caf9d906fbde555dd62fa95ddba9eecfd14cb388e4f491a66d74cd5fb79a |
| tracing-log | 0.2.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | ee855f1f400bd0e5c02d150ae5de3840039a3f54b025156404e34c23c03f47c3 |
| tracing-subscriber | 0.3.23 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | cb7f578e5945fb242538965c2d0b04418d38ec25c79d160cd279bf0731c8d319 |
| typenum | 1.20.0 | MIT OR Apache-2.0 | https://github.com/paholg/typenum | registry+https://github.com/rust-lang/crates.io-index | 40ce102ab67701b8526c123c1bab5cbe42d7040ccfd0f64af1a385808d2f43de |
| unicode-ident | 1.0.24 | (MIT OR Apache-2.0) AND Unicode-3.0 | https://github.com/dtolnay/unicode-ident | registry+https://github.com/rust-lang/crates.io-index | e6e4313cd5fcd3dad5cafa179702e2b244f760991f45397d14d4ebf38247da75 |
| unicode-segmentation | 1.13.2 | MIT OR Apache-2.0 | https://github.com/unicode-rs/unicode-segmentation | registry+https://github.com/rust-lang/crates.io-index | 9629274872b2bfaf8d66f5f15725007f635594914870f65218920345aa11aa8c |
| unicode-xid | 0.2.6 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | ebc1c04c71510c7f702b52b7c350734c9ff1295c464a03335b00bb84fc54f853 |
| url | 2.5.8 | MIT OR Apache-2.0 | https://github.com/servo/rust-url | registry+https://github.com/rust-lang/crates.io-index | ff67a8a4397373c3ef660812acab3268222035010ab8680ec4215f38ba3d0eed |
| utf-8 | 0.7.6 | MIT OR Apache-2.0 | https://github.com/SimonSapin/rust-utf8 | registry+https://github.com/rust-lang/crates.io-index | 09cc8ee72d2a9becf2f2febe0205bbed8fc6615b7cb429ad062dc7b7ddd036a9 |
| utf8_iter | 1.0.4 | Apache-2.0 OR MIT | https://github.com/hsivonen/utf8_iter | registry+https://github.com/rust-lang/crates.io-index | b6c140620e7ffbb22c2dee59cafe6084a59b5ffc27a8859a5f0d494b5d52b6be |
| uuid | 1.23.1 | Apache-2.0 OR MIT | https://github.com/uuid-rs/uuid | registry+https://github.com/rust-lang/crates.io-index | ddd74a9687298c6858e9b88ec8935ec45d22e8fd5e6394fa1bd4e99a87789c76 |
| valuable | 0.1.1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | ba73ea9cf16a25df0c8caa16c51acb937d5712a8429db78a3ee29d5dcacd3a65 |
| version_check | 0.9.5 | MIT/Apache-2.0 | https://github.com/SergioBenitez/version_check | registry+https://github.com/rust-lang/crates.io-index | 0b928f33d975fc6ad9f86c8f283853ad26bdd5b10b7f1542aa2fa15e2289105a |
| version-compare | 0.0.11 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 1c18c859eead79d8b95d09e4678566e8d70105c4e7b251f707a03df32442661b |
| version-compare | 0.2.1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 03c2856837ef78f57382f06b2b8563a2f512f7185d732608fd9176cb3b8edf0e |
| vswhom | 0.1.0 | MIT | https://github.com/nabijaczleweli/vswhom.rs | registry+https://github.com/rust-lang/crates.io-index | be979b7f07507105799e854203b470ff7c78a1639e330a58f183b5fea574608b |
| vswhom-sys | 0.1.3 | MIT | https://github.com/nabijaczleweli/vswhom-sys.rs | registry+https://github.com/rust-lang/crates.io-index | fb067e4cbd1ff067d1df46c9194b5de0e98efd2810bbc95c5d5e5f25a3231150 |
| walkdir | 2.5.0 | Unlicense/MIT | https://github.com/BurntSushi/walkdir | registry+https://github.com/rust-lang/crates.io-index | 29790946404f91d9c5d06f9874efddea1dc06c5efe94541a7d6863108e3a5e4b |
| wasi | 0.11.1+wasi-snapshot-preview1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | ccf3ec651a847eb01de73ccad15eb7d99f80485de043efb2f370cd654f4ea44b |
| wasi | 0.9.0+wasi-snapshot-preview1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | cccddf32554fecc6acb585f82a32a72e28b48f8c4c1883ddfeeeaa96f7d8e519 |
| wasip2 | 1.0.3+wasi-0.2.9 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 20064672db26d7cdc89c7798c48a0fdfac8213434a1186e5ef29fd560ae223d6 |
| wasip3 | 0.4.0+wasi-0.3.0-rc-2026-01-06 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 5428f8bf88ea5ddc08faddef2ac4a67e390b88186c703ce6dbd955e1c145aca5 |
| wasm-bindgen | 0.2.121 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 49ace1d07c165b0864824eee619580c4689389afa9dc9ed3a4c75040d82e6790 |
| wasm-bindgen-futures | 0.4.71 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 96492d0d3ffba25305a7dc88720d250b1401d7edca02cc3bcd50633b424673b8 |
| wasm-bindgen-macro | 0.2.121 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 8e68e6f4afd367a562002c05637acb8578ff2dea1943df76afb9e83d177c8578 |
| wasm-bindgen-macro-support | 0.2.121 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | d95a9ec35c64b2a7cb35d3fead40c4238d0940c86d107136999567a4703259f2 |
| wasm-bindgen-shared | 0.2.121 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | c4e0100b01e9f0d03189a92b96772a1fb998639d981193d7dbab487302513441 |
| wasm-encoder | 0.244.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 990065f2fe63003fe337b932cfb5e3b80e0b4d0f5ff650e6985b1048f62c8319 |
| wasm-metadata | 0.244.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | bb0e353e6a2fbdc176932bbaab493762eb1255a7900fe0fea1a2f96c296cc909 |
| wasmparser | 0.244.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 47b807c72e1bac69382b3a6fb3dbe8ea4c0ed87ff5629b8685ae6b9a611028fe |
| web-sys | 0.3.98 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 4b572dff8bcf38bad0fa19729c89bb5748b2b9b1d8be70cf90df697e3a8f32aa |
| webkit2gtk | 0.18.2 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | b8f859735e4a452aeb28c6c56a852967a8a76c8eb1cc32dbf931ad28a13d6370 |
| webkit2gtk-sys | 0.18.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 4d76ca6ecc47aeba01ec61e480139dda143796abcae6f83bcddf50d6b5b1dcf3 |
| webview2-com | 0.19.1 | MIT | https://github.com/wravery/webview2-rs | registry+https://github.com/rust-lang/crates.io-index | b4a769c9f1a64a8734bde70caafac2b96cada12cd4aefa49196b3a386b8b4178 |
| webview2-com-macros | 0.6.0 | MIT | https://github.com/wravery/webview2-rs | registry+https://github.com/rust-lang/crates.io-index | eaebe196c01691db62e9e4ca52c5ef1e4fd837dcae27dae3ada599b5a8fd05ac |
| webview2-com-sys | 0.19.0 | MIT | https://github.com/wravery/webview2-rs | registry+https://github.com/rust-lang/crates.io-index | aac48ef20ddf657755fdcda8dfed2a7b4fc7e4581acce6fe9b88c3d64f29dee7 |
| winapi | 0.3.9 | MIT/Apache-2.0 | https://github.com/retep998/winapi-rs | registry+https://github.com/rust-lang/crates.io-index | 5c839a674fcd7a98952e593242ea400abe93992746761e38641405d28b00f419 |
| winapi-i686-pc-windows-gnu | 0.4.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | ac3b87c63620426dd9b991e5ce0329eff545bccbbb34f3be09ff6fb6ab51b7b6 |
| winapi-util | 0.1.11 | Unlicense OR MIT | https://github.com/BurntSushi/winapi-util | registry+https://github.com/rust-lang/crates.io-index | c2a7b1c03c876122aa43f3020e6c3c3ee5c05081c9a00739faf7503aeba10d22 |
| winapi-x86_64-pc-windows-gnu | 0.4.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 712e227841d057c1ee1cd2fb22fa7e5a5461ae8e48fa2ca79ec42cfc1931183f |
| windows | 0.37.0 | MIT OR Apache-2.0 | https://github.com/microsoft/windows-rs | registry+https://github.com/rust-lang/crates.io-index | 57b543186b344cc61c85b5aab0d2e3adf4e0f99bc076eff9aa5927bcc0b8a647 |
| windows | 0.39.0 | MIT OR Apache-2.0 | https://github.com/microsoft/windows-rs | registry+https://github.com/rust-lang/crates.io-index | f1c4bd0a50ac6020f65184721f758dba47bb9fbc2133df715ec74a237b26794a |
| windows | 0.48.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | e686886bc078bc1b0b600cac0147aadb815089b6e4da64016cbd754b6342700f |
| windows_aarch64_gnullvm | 0.42.2 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 597a5118570b68bc08d8d59125332c54f1ba9d9adeedeef5b99b02ba2b0698f8 |
| windows_aarch64_gnullvm | 0.48.5 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 2b38e32f0abccf9987a4e3079dfb67dcd799fb61361e53e2882c3cbaf0d905d8 |
| windows_aarch64_msvc | 0.37.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 2623277cb2d1c216ba3b578c0f3cf9cdebeddb6e66b1b218bb33596ea7769c3a |
| windows_aarch64_msvc | 0.39.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | ec7711666096bd4096ffa835238905bb33fb87267910e154b18b44eaabb340f2 |
| windows_aarch64_msvc | 0.42.2 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | e08e8864a60f06ef0d0ff4ba04124db8b0fb3be5776a5cd47641e942e58c4d43 |
| windows_aarch64_msvc | 0.48.5 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | dc35310971f3b2dbbf3f0690a219f40e2d9afcf64f9ab7cc1be722937c26b4bc |
| windows_i686_gnu | 0.37.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | d3925fd0b0b804730d44d4b6278c50f9699703ec49bcd628020f46f4ba07d9e1 |
| windows_i686_gnu | 0.39.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 763fc57100a5f7042e3057e7e8d9bdd7860d330070251a73d003563a3bb49e1b |
| windows_i686_gnu | 0.42.2 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | c61d927d8da41da96a81f029489353e68739737d3beca43145c8afec9a31a84f |
| windows_i686_gnu | 0.48.5 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | a75915e7def60c94dcef72200b9a8e58e5091744960da64ec734a6c6e9b3743e |
| windows_i686_msvc | 0.37.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | ce907ac74fe331b524c1298683efbf598bb031bc84d5e274db2083696d07c57c |
| windows_i686_msvc | 0.39.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 7bc7cbfe58828921e10a9f446fcaaf649204dcfe6c1ddd712c5eebae6bda1106 |
| windows_i686_msvc | 0.42.2 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 44d840b6ec649f480a41c8d80f9c65108b92d89345dd94027bfe06ac444d1060 |
| windows_i686_msvc | 0.48.5 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 8f55c233f70c4b27f66c523580f78f1004e8b5a8b659e05a4eb49d4166cca406 |
| windows_x86_64_gnu | 0.37.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 2babfba0828f2e6b32457d5341427dcbb577ceef556273229959ac23a10af33d |
| windows_x86_64_gnu | 0.39.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 6868c165637d653ae1e8dc4d82c25d4f97dd6605eaa8d784b5c6e0ab2a252b65 |
| windows_x86_64_gnu | 0.42.2 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 8de912b8b8feb55c064867cf047dda097f92d51efad5b491dfb98f6bbb70cb36 |
| windows_x86_64_gnu | 0.48.5 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 53d40abd2583d23e4718fddf1ebec84dbff8381c07cae67ff7768bbf19c6718e |
| windows_x86_64_gnullvm | 0.42.2 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 26d41b46a36d453748aedef1486d5c7a85db22e56aff34643984ea85514e94a3 |
| windows_x86_64_gnullvm | 0.48.5 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 0b7b52767868a23d5bab768e390dc5f5c55825b6d30b86c844ff2dc7414044cc |
| windows_x86_64_msvc | 0.37.0 | MIT OR Apache-2.0 | https://github.com/microsoft/windows-rs | registry+https://github.com/rust-lang/crates.io-index | f4dd6dc7df2d84cf7b33822ed5b86318fb1781948e9663bacd047fc9dd52259d |
| windows_x86_64_msvc | 0.39.0 | MIT OR Apache-2.0 | https://github.com/microsoft/windows-rs | registry+https://github.com/rust-lang/crates.io-index | 5e4d40883ae9cae962787ca76ba76390ffa29214667a111db9e0a1ad8377e809 |
| windows_x86_64_msvc | 0.42.2 | MIT OR Apache-2.0 | https://github.com/microsoft/windows-rs | registry+https://github.com/rust-lang/crates.io-index | 9aec5da331524158c6d1a4ac0ab1541149c0b9505fde06423b02f5ef0106b9f0 |
| windows_x86_64_msvc | 0.48.5 | MIT OR Apache-2.0 | https://github.com/microsoft/windows-rs | registry+https://github.com/rust-lang/crates.io-index | ed94fce61571a4006852b7389a063ab983c02eb1bb37b47f8272ce92d06d9538 |
| windows-bindgen | 0.39.0 | MIT OR Apache-2.0 | https://github.com/microsoft/windows-rs | registry+https://github.com/rust-lang/crates.io-index | 68003dbd0e38abc0fb85b939240f4bce37c43a5981d3df37ccbaaa981b47cb41 |
| windows-core | 0.62.2 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | b8e83a14d34d0623b51dce9581199302a221863196a1dde71a7663a4c2be9deb |
| windows-implement | 0.39.0 | MIT OR Apache-2.0 | https://github.com/microsoft/windows-rs | registry+https://github.com/rust-lang/crates.io-index | ba01f98f509cb5dc05f4e5fc95e535f78260f15fea8fe1a8abdd08f774f1cee7 |
| windows-implement | 0.60.2 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 053e2e040ab57b9dc951b72c264860db7eb3b0200ba345b4e4c3b14f67855ddf |
| windows-interface | 0.59.3 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 3f316c4a2570ba26bbec722032c4099d8c8bc095efccdc15688708623367e358 |
| windows-link | 0.2.1 | MIT OR Apache-2.0 | https://github.com/microsoft/windows-rs | registry+https://github.com/rust-lang/crates.io-index | f0805222e57f7521d6a62e36fa9163bc891acd422f971defe97d64e70d0a4fe5 |
| windows-metadata | 0.39.0 | MIT OR Apache-2.0 | https://github.com/microsoft/windows-rs | registry+https://github.com/rust-lang/crates.io-index | 9ee5e275231f07c6e240d14f34e1b635bf1faa1c76c57cfd59a5cdb9848e4278 |
| windows-result | 0.4.1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 7781fa89eaf60850ac3d2da7af8e5242a5ea78d1a11c49bf2910bb5a73853eb5 |
| windows-strings | 0.5.1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 7837d08f69c77cf6b07689544538e017c1bfcf57e34b4c0ff58e6c2cd3b37091 |
| windows-sys | 0.42.0 | MIT OR Apache-2.0 | https://github.com/microsoft/windows-rs | registry+https://github.com/rust-lang/crates.io-index | 5a3e1820f08b8513f676f7ab6c1f99ff312fb97b553d30ff4dd86f9f15728aa7 |
| windows-sys | 0.48.0 | MIT OR Apache-2.0 | https://github.com/microsoft/windows-rs | registry+https://github.com/rust-lang/crates.io-index | 677d2418bec65e3338edb076e806bc1ec15693c5d0104683f2efe857f61056a9 |
| windows-sys | 0.61.2 | MIT OR Apache-2.0 | https://github.com/microsoft/windows-rs | registry+https://github.com/rust-lang/crates.io-index | ae137229bcbd6cdf0f7b80a31df61766145077ddf49416a728b02cb3921ff3fc |
| windows-targets | 0.48.5 | MIT OR Apache-2.0 | https://github.com/microsoft/windows-rs | registry+https://github.com/rust-lang/crates.io-index | 9a2fa6e2155d7247be68c096456083145c183cbbbc2764150dda45a87197940c |
| windows-tokens | 0.39.0 | MIT OR Apache-2.0 | https://github.com/microsoft/windows-rs | registry+https://github.com/rust-lang/crates.io-index | f838de2fe15fe6bac988e74b798f26499a8b21a9d97edec321e79b28d1d7f597 |
| windows-version | 0.1.7 | MIT OR Apache-2.0 | https://github.com/microsoft/windows-rs | registry+https://github.com/rust-lang/crates.io-index | e4060a1da109b9d0326b7262c8e12c84df67cc0dbc9e33cf49e01ccc2eb63631 |
| winnow | 0.5.40 | MIT | https://github.com/winnow-rs/winnow | registry+https://github.com/rust-lang/crates.io-index | f593a95398737aeed53e489c785df13f3618e41dbcd6718c6addbf1395aa6876 |
| winnow | 0.7.15 | MIT | https://github.com/winnow-rs/winnow | registry+https://github.com/rust-lang/crates.io-index | df79d97927682d2fd8adb29682d1140b343be4ac0f08fd68b7765d9c059d3945 |
| winreg | 0.52.0 | MIT | https://github.com/gentoo90/winreg-rs | registry+https://github.com/rust-lang/crates.io-index | a277a57398d4bfa075df44f501a17cfdf8542d224f0d36095a2adc7aee4ef0a5 |
| wit-bindgen | 0.51.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | d7249219f66ced02969388cf2bb044a09756a083d0fab1e566056b04d9fbcaa5 |
| wit-bindgen | 0.57.1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 1ebf944e87a7c253233ad6766e082e3cd714b5d03812acc24c318f549614536e |
| wit-bindgen-core | 0.51.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | ea61de684c3ea68cb082b7a88508a8b27fcc8b797d738bfc99a82facf1d752dc |
| wit-bindgen-rust | 0.51.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | b7c566e0f4b284dd6561c786d9cb0142da491f46a9fbed79ea69cdad5db17f21 |
| wit-bindgen-rust-macro | 0.51.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 0c0f9bfd77e6a48eccf51359e3ae77140a7f50b1e2ebfe62422d8afdaffab17a |
| wit-component | 0.244.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 9d66ea20e9553b30172b5e831994e35fbde2d165325bec84fc43dbf6f4eb9cb2 |
| wit-parser | 0.244.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | ecc8ac4bc1dc3381b7f59c34f00b67e18f910c2c0f50015669dde7def656a736 |
| writeable | 0.6.3 | Unicode-3.0 | https://github.com/unicode-org/icu4x | registry+https://github.com/rust-lang/crates.io-index | 1ffae5123b2d3fc086436f8834ae3ab053a283cfac8fe0a0b8eaae044768a4c4 |
| wry | 0.24.12 | Apache-2.0 OR MIT | https://github.com/tauri-apps/wry | registry+https://github.com/rust-lang/crates.io-index | 4a2a144c3ab5e83e04724bc8e67cea552ffae413185fda459fafdae173fd985d |
| x11 | 2.21.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 502da5464ccd04011667b11c435cb992822c2c0dbde1770c988480d312a0db2e |
| x11-dl | 2.21.0 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 38735924fedd5314a6e548792904ed8c6de6636285cb9fec04d5b1db85c1516f |
| xattr | 1.6.1 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 32e45ad4206f6d2479085147f02bc2ef834ac85886624a23575ae137c8aa8156 |
| yoke | 0.8.2 | Unicode-3.0 | https://github.com/unicode-org/icu4x | registry+https://github.com/rust-lang/crates.io-index | abe8c5fda708d9ca3df187cae8bfb9ceda00dd96231bed36e445a1a48e66f9ca |
| yoke-derive | 0.8.2 | Unicode-3.0 | https://github.com/unicode-org/icu4x | registry+https://github.com/rust-lang/crates.io-index | de844c262c8848816172cef550288e7dc6c7b7814b4ee56b3e1553f275f1858e |
| zerocopy | 0.8.48 | BSD-2-Clause OR Apache-2.0 OR MIT | https://github.com/google/zerocopy | registry+https://github.com/rust-lang/crates.io-index | eed437bf9d6692032087e337407a86f04cd8d6a16a37199ed57949d415bd68e9 |
| zerocopy-derive | 0.8.48 | 未在本地 Cargo manifest 中声明 | - | registry+https://github.com/rust-lang/crates.io-index | 70e3cd084b1788766f53af483dd21f93881ff30d7320490ec3ef7526d203bad4 |
| zerofrom | 0.1.8 | Unicode-3.0 | https://github.com/unicode-org/icu4x | registry+https://github.com/rust-lang/crates.io-index | 0ec05a11813ea801ff6d75110ad09cd0824ddba17dfe17128ea0d5f68e6c5272 |
| zerofrom-derive | 0.1.7 | Unicode-3.0 | https://github.com/unicode-org/icu4x | registry+https://github.com/rust-lang/crates.io-index | 11532158c46691caf0f2593ea8358fed6bbf68a0315e80aae9bd41fbade684a1 |
| zeroize | 1.8.2 | Apache-2.0 OR MIT | https://github.com/RustCrypto/utils | registry+https://github.com/rust-lang/crates.io-index | b97154e67e32c85465826e8bcc1c59429aaaf107c1e4a9e53c8d8ccd5eff88d0 |
| zerotrie | 0.2.4 | Unicode-3.0 | https://github.com/unicode-org/icu4x | registry+https://github.com/rust-lang/crates.io-index | 0f9152d31db0792fa83f70fb2f83148effb5c1f5b8c7686c3459e361d9bc20bf |
| zerovec | 0.11.6 | Unicode-3.0 | https://github.com/unicode-org/icu4x | registry+https://github.com/rust-lang/crates.io-index | 90f911cbc359ab6af17377d242225f4d75119aec87ea711a880987b18cd7b239 |
| zerovec-derive | 0.11.3 | Unicode-3.0 | https://github.com/unicode-org/icu4x | registry+https://github.com/rust-lang/crates.io-index | 625dc425cab0dca6dc3c3319506e6593dcb08a9f387ea3b284dbd52a92c40555 |
| zmij | 1.0.21 | MIT | https://github.com/dtolnay/zmij | registry+https://github.com/rust-lang/crates.io-index | b8848ee67ecc8aedbaf3e4122217aff892639231befc6a1b58d29fff4c2cabaa |

## 保留方式建议

1. 在线版：在网站 `/licenses` 页面展示本 Notices 摘要和完整依赖表。
2. 离线版：在程序的“开源许可证”页面展示同一份 Notices，并随安装包或安装目录保留 `THIRD_PARTY_NOTICES.md`。
3. 发布包：保留项目根目录 `LICENSE`、`THIRD_PARTY_NOTICES.md`、`docs/licenses.md` 和 `docs/third-party-notices.md`。
4. 如果更新依赖、重新打包离线版或替换 WASM/PDF/FFmpeg 静态资源，请重新运行 `pnpm generate:notices`。

