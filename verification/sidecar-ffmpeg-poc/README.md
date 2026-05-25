# Sidecar FFmpeg POC verification

This directory contains proof-of-concept checks for the future Windows offline Pro sidecar FFmpeg path.

Current expected state:

- `ffmpeg.exe` is not bundled yet.
- `ffprobe.exe` is not bundled yet.
- The script should report `sidecar_missing`, not fail the project.
- Existing online and offline media conversion still uses FFmpeg WASM.

Run from the repository root:

```powershell
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' --filter web exec node '..\..\verification\sidecar-ffmpeg-poc\sidecar-poc.mjs'
```

Optional sample generation:

```powershell
& 'D:\万能格式转换器项目\.pnpm-home\pnpm.CMD' --config.store-dir='D:\万能格式转换器项目\.pnpm-home\store\v3' --filter web exec node '..\..\verification\sidecar-ffmpeg-poc\sample-generation.mjs'
```

Do not place unknown or unlicensed FFmpeg binaries in the project. Before adding a real binary, confirm its source, license, redistribution terms, build configuration, and SHA256.
