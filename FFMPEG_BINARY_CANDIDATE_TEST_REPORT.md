# FFMPEG_BINARY_CANDIDATE_TEST_REPORT

生成时间：2026-05-24

本报告记录隔离候选 FFmpeg 二进制的本地可执行验证。候选文件只放在 `verification/ffmpeg-binary-candidates/`，没有放入正式安装包，没有放入 `apps/web/public`，没有放入 `apps/web/out`。

## 1. 候选来源

来源：

`BtbN FFmpeg-Builds latest n7.1 win64 lgpl shared 7.1`

下载地址：

`https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-n7.1-latest-win64-lgpl-shared-7.1.zip`

隔离目录：

`verification/ffmpeg-binary-candidates/BtbN-ffmpeg-n7.1-win64-lgpl-shared-7.1/`

## 2. 二进制文件

`ffmpeg.exe`：

`verification/ffmpeg-binary-candidates/BtbN-ffmpeg-n7.1-win64-lgpl-shared-7.1/extracted/ffmpeg-n7.1-latest-win64-lgpl-shared-7.1/bin/ffmpeg.exe`

SHA256：

`F098AA44CEABDF4AA17B206E8BFD5B1259BFC234ADDCF18F3D647512D0918798`

`ffprobe.exe`：

`verification/ffmpeg-binary-candidates/BtbN-ffmpeg-n7.1-win64-lgpl-shared-7.1/extracted/ffmpeg-n7.1-latest-win64-lgpl-shared-7.1/bin/ffprobe.exe`

SHA256：

`9CD5D66824EDD9DE1C048A1AB03DF90A03D71EA7FB8FCDCF9DC4A47BBC0683A7`

ZIP SHA256：

`233E3C0D1E73C4BC2915DA553AA211BEAB75AA902F074CF6A7D6BADE6846F2CC`

## 3. 版本和许可证输出

`ffmpeg -version`：

`ffmpeg version n7.1.4-6-g181cfa1008-20260523`

`ffmpeg -L` 声明：

GNU Lesser General Public License version 3 or later.

完整输出保存在：

1. `verification/ffmpeg-binary-candidates/BtbN-ffmpeg-n7.1-win64-lgpl-shared-7.1/ffmpeg-version.txt`
2. `verification/ffmpeg-binary-candidates/BtbN-ffmpeg-n7.1-win64-lgpl-shared-7.1/ffprobe-version.txt`
3. `verification/ffmpeg-binary-candidates/BtbN-ffmpeg-n7.1-win64-lgpl-shared-7.1/ffmpeg-license.txt`

## 4. 构建参数检查

完整构建参数保存在：

`verification/ffmpeg-binary-candidates/BtbN-ffmpeg-n7.1-win64-lgpl-shared-7.1/ffmpeg-buildconf.txt`

关键结论：

1. `--enable-gpl`：未发现。
2. `--enable-nonfree`：未发现。
3. `--enable-libx264`：未发现。
4. `--enable-libx265`：未发现。
5. `--disable-libx264`：存在。
6. `--disable-libx265`：存在。
7. `--enable-libmp3lame`：存在。
8. `--enable-libopus`：存在。
9. `--enable-libvpx`：存在。
10. `--enable-libopenh264`：存在。
11. `--enable-libfdk-aac`：未发现。
12. `--disable-libfdk-aac`：存在。

## 5. 编码器检查

`ffmpeg -encoders` 关键结果：

1. `libopenh264`：存在。
2. `libvpx`：存在。
3. `libvpx-vp9`：存在。
4. `aac`：存在。
5. `aac_mf`：存在。
6. `flac`：存在。
7. `libmp3lame`：存在。
8. `libopus`：存在。

完整输出保存在：

`verification/ffmpeg-binary-candidates/BtbN-ffmpeg-n7.1-win64-lgpl-shared-7.1/ffmpeg-encoder-check.txt`

## 6. 本地转换验证

验证脚本：

`verification/ffmpeg-binary-candidates/run-candidate-test.mjs`

验证结果文件：

`verification/ffmpeg-binary-candidates/BtbN-ffmpeg-n7.1-win64-lgpl-shared-7.1/candidate-test-results.json`

结果：

1. `ffmpeg.exe -version`：通过。
2. `ffmpeg.exe -buildconf`：通过。
3. `ffprobe.exe -version`：通过。
4. 生成 WAV 测试文件：通过。
5. WAV 转 FLAC：通过。
6. 生成小 MP4 测试文件：通过。
7. MP4 转 WebM：通过。
8. 中文路径测试：通过。
9. 带空格路径测试：通过。
10. D 盘路径测试：通过。
11. 外部网络请求：0。

JSON 关键结果：

```json
{
  "wavToFlac": true,
  "spacedPath": true,
  "mp4ToWebm": true,
  "chinesePath": true,
  "dDrivePath": true,
  "externalRequests": 0
}
```

## 7. 是否可以进入下一步

技术上可以进入下一轮 `SIDECAR_FFMPEG_EXPERIMENT_FLAG_ROUND`，但只能作为离线专业版内部实验开关候选。

进入正式发布包前仍必须：

1. 复核 BtbN 构建项目和下载链路。
2. 复核 LGPL v3 or later 对本软件商业发布的影响。
3. 复核所有第三方库许可证。
4. 复核 `libmp3lame`、`libopenh264`、AAC、平台专利和地区要求。
5. 在干净 Windows 10/11 VM 中验证。
6. 明确是否接受 LGPL v3 or later，而不是 LGPL v2.1。
