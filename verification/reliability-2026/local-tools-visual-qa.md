# LocalToolsClient visual QA

## Scope and invariant

Task 9 is an architecture-only extraction. It preserves every local tool ID, accepted input, output name, conversion path, desktop folder layout, privacy boundary, license check, and visible online/desktop product shell. No CSS was changed.

## Environment

- Date: 2026-08-08
- Runtime: Node 20.20.2, pnpm 9.15.4
- Browser: Playwright Chromium
- State: empty image-format-conversion task

## Visual evidence

| Surface | Viewport | Baseline / final screenshot | SHA-256 | Result |
| --- | ---: | --- | --- | --- |
| Online | 1440x900 | `output/playwright/task9/{baseline,final}-online-1440x900.png` | `2A6B2AD937D4C35ECFBE95DB91BF89E8DDF63FB4E71D354D04711A1262986357` | Pixel-identical |
| Online | 390x844 | `output/playwright/task9/{baseline,final}-online-390x844.png` | `2A6EA73FBDB0DF9C9878D4B7ED7B449C481732FD18D75EF569AFA909B1074F5E` | Pixel-identical |
| Desktop | 1280x820 | `output/playwright/task9/{baseline,final}-desktop-1280x820.png` | `26E3D30056204AAD40340F80BE8C61773A72C2DF28567183C8D4A1A6C5975806` | Pixel-identical |
| Desktop | 1120x720 | `output/playwright/task9/{baseline,final}-desktop-1120x720.png` | `D599BF0A1599CA6A0E194A5C7A10CD1CB6EDC25ED216C4BEF0EA36941C492675` | Pixel-identical |

All baseline and final runs reported no horizontal overflow and zero browser console errors or warnings.

## Verification

- Focused local-tools suite: 6 files, 39 tests passed.
- Full web suite: 35 files, 172 tests passed.
- Privacy boundary: 11 tests passed.
- Network boundary: 4 tests passed.
- Rust desktop suite: 6 tests passed.
- `npm run build:web`: passed with TypeScript checking.
- `node scripts/run-pnpm.cjs --filter web build:desktop`: passed with TypeScript checking.

## Result

Accepted. The controller, preview grid, output views, and parameter controls are separated from the route shell with no observable visual or boundary change.
