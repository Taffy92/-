# Offline Pro Promo Video Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a HyperFrames promotional video that primarily promotes the Windows offline professional edition of 万能格式转换器 while also showing the online site as a lightweight entry point.

**Architecture:** Create an isolated HyperFrames project under `docs/marketing/hyperframes/offline-pro-promo/`. Keep the video composition, audio generation, copy, and render output separate from the web and desktop product code. Generate original background music locally to avoid copyright risk, use HyperFrames TTS or a documented fallback for Chinese voiceover, and verify the composition with HyperFrames checks.

**Tech Stack:** HyperFrames HTML composition, GSAP timeline, Node.js scripts for generated WAV background music, HyperFrames CLI for lint/validate/inspect/preview/render.

---

## File Structure

- Create: `docs/marketing/hyperframes/offline-pro-promo/DESIGN.md`
  - Defines the visual identity, palette, typography, motion rules, and anti-patterns.
- Create: `docs/marketing/hyperframes/offline-pro-promo/script.md`
  - Stores timing, voiceover, subtitles, and shot notes.
- Create: `docs/marketing/hyperframes/offline-pro-promo/scripts/generate-bgm.mjs`
  - Generates an original 48-second low-volume electronic WAV loop.
- Create: `docs/marketing/hyperframes/offline-pro-promo/index.html`
  - Main HyperFrames composition, 1920x1080, 48 seconds, with scene transitions, subtitles, visual UI mockups, and audio tracks.
- Create: `docs/marketing/hyperframes/offline-pro-promo/assets/bgm.wav`
  - Generated original background music.
- Create if TTS succeeds: `docs/marketing/hyperframes/offline-pro-promo/assets/voiceover.wav`
  - Generated Chinese voiceover.
- Create during render if supported: `docs/marketing/hyperframes/offline-pro-promo/renders/offline-pro-promo.mp4`
  - Standard review render.

### Task 1: Scaffold Video Project And Design Assets

**Files:**
- Create: `docs/marketing/hyperframes/offline-pro-promo/DESIGN.md`
- Create: `docs/marketing/hyperframes/offline-pro-promo/script.md`
- Create: `docs/marketing/hyperframes/offline-pro-promo/scripts/generate-bgm.mjs`

- [ ] **Step 1: Create project directories**

Run:

```powershell
New-Item -ItemType Directory -Force -Path `
  'docs\marketing\hyperframes\offline-pro-promo', `
  'docs\marketing\hyperframes\offline-pro-promo\assets', `
  'docs\marketing\hyperframes\offline-pro-promo\scripts', `
  'docs\marketing\hyperframes\offline-pro-promo\renders' | Out-Null
```

Expected: directories exist.

- [ ] **Step 2: Write `DESIGN.md`**

Create `docs/marketing/hyperframes/offline-pro-promo/DESIGN.md` with:

```markdown
# Offline Pro Promo Visual Identity

## Style Prompt

产品 Pro 矩阵：黑色产品发布片质感，克制、可信、清晰。画面以真实软件工作台、文件卡片、线框矩阵和局部蓝/青绿发光为主。在线版只短暂作为入口出现，Windows 离线专业版是主角。

## Colors

- Canvas black: `#000000`
- Panel black: `#111112`
- Deep input gray: `#1c1c1e`
- Primary text: `#f5f5f7`
- Secondary text: `#a1a1a6`
- Brand blue: `#2997ff`
- Privacy green: `#30d5c8`

## Typography

- Primary: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif`
- Use 60px+ for scene headlines, 28px+ for subtitles, and 20px+ for small labels.
- Keep CTA, subtitles, and logo inside the center vertical-safe area.

## Motion

- Use smooth reveal/wipe transitions between scenes.
- Animate every scene element in with varied `power3.out`, `expo.out`, and `back.out` eases.
- Use finite ambient pulse repeats only.
- Keep UI and text legible during motion.

## What NOT to Do

- Do not make the online website the hero.
- Do not use loud social-media poster styling.
- Do not use big full-screen dark linear gradients.
- Do not claim cloud upload, login, membership, or unsupported format counts.
- Do not use third-party copyrighted music.
```

- [ ] **Step 3: Write `script.md`**

Create `docs/marketing/hyperframes/offline-pro-promo/script.md` with:

```markdown
# Offline Pro Promo Script

Duration target: 48 seconds
Format: 1920x1080, safe for later 9:16 crop

## 00-06s

Voiceover: 图片太大传不上去，PDF 想转图片，视频格式打不开，只想从视频里提取音频。

Subtitle: 日常办公的格式问题，不该卡住你。

Shot: File cards for image, PDF, video, and audio stack into the center.

## 06-12s

Voiceover: 临时处理，可以直接打开万能格式转换器在线版。

Subtitle: 在线版：打开网站，快速处理单个文件。

Shot: `gszhmrx.cn` and a compact online workbench surface appear briefly.

## 12-21s

Voiceover: 但如果是公司资料、客户文件、大文件，或者一批文件要处理，更适合 Windows 离线专业版。

Subtitle: 主推：Windows 离线专业版。

Shot: Offline Pro title and desktop workbench frame push into view.

## 21-31s

Voiceover: 安装后直接进入本地工作台，选择工具，批量导入，图片、PDF、Word、Excel、音频和视频都能排进任务。

Subtitle: 批量导入 · 平铺预览 · 本地处理。

Shot: Sidebar tools, tiled previews, task queue, and control panel light up.

## 31-39s

Voiceover: 结果保存到独立文件夹，多页文档按同名子文件夹输出，不用再把结果压成一个包。

Subtitle: 独立结果文件夹，多页文档清楚归档。

Shot: Output folder opens, page files flow into named subfolders.

## 39-48s

Voiceover: 文件尽量在本机处理，不上传服务器，不调用云端转换 API。访问 gszhmrx.cn，也可以下载离线专业版试用。

Subtitle: gszhmrx.cn · 下载 Windows 离线专业版。

Shot: Privacy shield, logo, website, and download CTA settle in the safe area.
```

- [ ] **Step 4: Write the BGM generator script**

Create `docs/marketing/hyperframes/offline-pro-promo/scripts/generate-bgm.mjs` with:

```javascript
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const output = resolve(__dirname, "../assets/bgm.wav");

const sampleRate = 44100;
const durationSeconds = 48;
const totalSamples = sampleRate * durationSeconds;
const channels = 2;
const bitsPerSample = 16;
const dataSize = totalSamples * channels * (bitsPerSample / 8);
const buffer = Buffer.alloc(44 + dataSize);

function writeString(offset, value) {
  buffer.write(value, offset, value.length, "ascii");
}

writeString(0, "RIFF");
buffer.writeUInt32LE(36 + dataSize, 4);
writeString(8, "WAVE");
writeString(12, "fmt ");
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(channels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * channels * (bitsPerSample / 8), 28);
buffer.writeUInt16LE(channels * (bitsPerSample / 8), 32);
buffer.writeUInt16LE(bitsPerSample, 34);
writeString(36, "data");
buffer.writeUInt32LE(dataSize, 40);

function envelope(t) {
  const fadeIn = Math.min(1, t / 2.5);
  const fadeOut = Math.min(1, (durationSeconds - t) / 3);
  return Math.max(0, Math.min(fadeIn, fadeOut));
}

function pulse(t, beatHz) {
  const phase = (t * beatHz) % 1;
  return phase < 0.09 ? Math.exp(-phase * 22) : 0;
}

for (let i = 0; i < totalSamples; i += 1) {
  const t = i / sampleRate;
  const env = envelope(t);
  const pad =
    Math.sin(2 * Math.PI * 110 * t) * 0.16 +
    Math.sin(2 * Math.PI * 164.81 * t) * 0.10 +
    Math.sin(2 * Math.PI * 220 * t) * 0.08;
  const shimmer =
    Math.sin(2 * Math.PI * 440 * t + Math.sin(2 * Math.PI * 0.07 * t) * 0.8) * 0.035 +
    Math.sin(2 * Math.PI * 660 * t) * 0.018;
  const kick = Math.sin(2 * Math.PI * 58 * t) * pulse(t, 1.5) * 0.22;
  const tick = Math.sin(2 * Math.PI * 1320 * t) * pulse(t + 0.18, 3) * 0.025;
  const value = Math.max(-1, Math.min(1, (pad + shimmer + kick + tick) * env * 0.34));
  const left = Math.round(value * 32767);
  const right = Math.round((value * 0.92 + shimmer * 0.04) * 32767);
  const offset = 44 + i * channels * 2;
  buffer.writeInt16LE(left, offset);
  buffer.writeInt16LE(right, offset + 2);
}

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, buffer);
console.log(`Generated ${output}`);
```

- [ ] **Step 5: Generate BGM**

Run:

```powershell
node docs\marketing\hyperframes\offline-pro-promo\scripts\generate-bgm.mjs
```

Expected: `Generated ...\assets\bgm.wav`.

- [ ] **Step 6: Commit scaffold**

Run:

```powershell
git add -- docs/marketing/hyperframes/offline-pro-promo/DESIGN.md docs/marketing/hyperframes/offline-pro-promo/script.md docs/marketing/hyperframes/offline-pro-promo/scripts/generate-bgm.mjs docs/marketing/hyperframes/offline-pro-promo/assets/bgm.wav
git commit -m "docs: scaffold offline pro promo video"
```

Expected: commit succeeds and only these new files are included.

### Task 2: Generate Voiceover

**Files:**
- Create if command succeeds: `docs/marketing/hyperframes/offline-pro-promo/assets/voiceover.wav`
- Modify if TTS fails: `docs/marketing/hyperframes/offline-pro-promo/script.md`

- [ ] **Step 1: Try HyperFrames TTS**

Run from `docs/marketing/hyperframes/offline-pro-promo`:

```powershell
npx hyperframes tts "图片太大传不上去，PDF 想转图片，视频格式打不开，只想从视频里提取音频。临时处理，可以直接打开万能格式转换器在线版。但如果是公司资料、客户文件、大文件，或者一批文件要处理，更适合 Windows 离线专业版。安装后直接进入本地工作台，选择工具，批量导入，图片、PDF、Word、Excel、音频和视频都能排进任务。结果保存到独立文件夹，多页文档按同名子文件夹输出，不用再把结果压成一个包。文件尽量在本机处理，不上传服务器，不调用云端转换 API。访问 gszhmrx.cn，也可以下载离线专业版试用。" --output assets/voiceover.wav
```

Expected: `assets/voiceover.wav` exists.

- [ ] **Step 2: If TTS fails, document fallback**

If the command fails, append this section to `script.md`:

```markdown
## Voiceover Fallback

HyperFrames TTS did not generate `assets/voiceover.wav` in this environment. The composition still includes timed subtitles and original BGM. Replace `assets/voiceover.wav` with a human-recorded Chinese voiceover using the script above, then enable the voiceover audio track in `index.html`.
```

- [ ] **Step 3: Commit voiceover state**

If `voiceover.wav` exists:

```powershell
git add -- docs/marketing/hyperframes/offline-pro-promo/assets/voiceover.wav
git commit -m "docs: add promo video voiceover"
```

If TTS failed:

```powershell
git add -- docs/marketing/hyperframes/offline-pro-promo/script.md
git commit -m "docs: document promo voiceover fallback"
```

Expected: commit succeeds.

### Task 3: Build HyperFrames Composition

**Files:**
- Create: `docs/marketing/hyperframes/offline-pro-promo/index.html`

- [ ] **Step 1: Create `index.html`**

Create `docs/marketing/hyperframes/offline-pro-promo/index.html`. The implementation must:

- Use one top-level `<div data-composition-id="offline-pro-promo" data-width="1920" data-height="1080">`.
- Include `<audio id="bgm" data-start="0" data-duration="48" data-track-index="1" src="assets/bgm.wav" data-volume="0.28"></audio>`.
- Include `<audio id="voiceover" ...>` only if `assets/voiceover.wav` exists.
- Include six scene clips with non-overlapping `data-track-index="0"` timings:
  - `scene-1`: start `0`, duration `6`
  - `scene-2`: start `6`, duration `6`
  - `scene-3`: start `12`, duration `9`
  - `scene-4`: start `21`, duration `10`
  - `scene-5`: start `31`, duration `8`
  - `scene-6`: start `39`, duration `9`
- Add entrance animations for every scene's headline, subtitle, visual blocks, and CTA.
- Add transition bars between scenes at approximately `5.55`, `11.55`, `20.55`, `30.55`, and `38.55`.
- Register `window.__timelines["offline-pro-promo"] = tl`.

Use the following scene text exactly:

```javascript
const subtitles = [
  "日常办公的格式问题，不该卡住你。",
  "在线版：打开网站，快速处理单个文件。",
  "主推：Windows 离线专业版。",
  "批量导入 · 平铺预览 · 本地处理。",
  "独立结果文件夹，多页文档清楚归档。",
  "gszhmrx.cn · 下载 Windows 离线专业版。"
];
```

- [ ] **Step 2: Commit composition source**

Run:

```powershell
git add -- docs/marketing/hyperframes/offline-pro-promo/index.html
git commit -m "docs: build offline pro promo composition"
```

Expected: commit succeeds.

### Task 4: Verify And Render

**Files:**
- Create if supported: `docs/marketing/hyperframes/offline-pro-promo/renders/offline-pro-promo.mp4`
- Modify only after a failed HyperFrames check: `docs/marketing/hyperframes/offline-pro-promo/index.html`

- [ ] **Step 1: Run HyperFrames lint**

Run from `docs/marketing/hyperframes/offline-pro-promo`:

```powershell
npx hyperframes lint
```

Expected: exit code 0. If it fails, fix `index.html`, rerun, and only continue when it exits 0.

- [ ] **Step 2: Run HyperFrames validate**

Run:

```powershell
npx hyperframes validate
```

Expected: exit code 0. If contrast warnings or errors appear, adjust colors or layout and rerun.

- [ ] **Step 3: Run HyperFrames inspect**

Run:

```powershell
npx hyperframes inspect
```

Expected: exit code 0. If overflow appears, fix sizing, padding, or safe-area layout and rerun.

- [ ] **Step 4: Start preview server**

Run:

```powershell
npx hyperframes preview --port 3017
```

Expected: preview server starts. Share `http://localhost:3017/#project/offline-pro-promo` with the user. If the command blocks, keep the server running until final response.

- [ ] **Step 5: Render review MP4 if preview and checks pass**

Run:

```powershell
npx hyperframes render --output renders/offline-pro-promo.mp4 --quality standard
```

Expected: `renders/offline-pro-promo.mp4` exists. If render fails after lint/validate/inspect pass, document the render failure and still hand over the preview project.

- [ ] **Step 6: Commit verified source and render**

If render succeeds:

```powershell
git add -- docs/marketing/hyperframes/offline-pro-promo/index.html docs/marketing/hyperframes/offline-pro-promo/renders/offline-pro-promo.mp4
git commit -m "docs: render offline pro promo video"
```

If render fails but source checks pass:

```powershell
git add -- docs/marketing/hyperframes/offline-pro-promo/index.html
git commit -m "docs: verify offline pro promo composition"
```

Expected: commit succeeds without staging unrelated files.

## Self-Review

- Spec coverage: Tasks cover the independent video project, visual identity, script, original BGM, Chinese voiceover attempt, subtitles, HyperFrames composition, verification, preview, and render.
- Ambiguity scan: No task uses open-ended entries; every command and expected outcome is explicit.
- Type consistency: File paths are consistent under `docs/marketing/hyperframes/offline-pro-promo/`, and clip IDs/timings are consistent with the approved 48-second storyboard.
