# Third-party libraries inside candidate FFmpeg sidecar

Candidate: BtbN FFmpeg-Builds latest n7.1 win64 lgpl shared 7.1.

Initial command checks found:
- `ffmpeg -L`: GNU LGPL v3 or later.
- `--enable-gpl`: not found.
- `--enable-nonfree`: not found.
- `--enable-libx264`: not found.
- `--enable-libx265`: not found.
- `--enable-libmp3lame`: present.
- `--enable-libopus`: present.
- `--enable-libvpx`: present.
- `--enable-libopenh264`: present.
- `--disable-libfdk-aac`: present.

Risk notes:
- `libmp3lame`, `libopenh264`, AAC / M4A and platform patent terms must be manually reviewed before commercial release.
- This file is not legal advice.
