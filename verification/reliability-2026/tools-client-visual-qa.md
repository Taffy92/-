# ToolsClient visual QA

## Scope and invariant

Task 8 is an architecture-only extraction. It must not change conversion behavior, output naming, permissions, license checks, advertising, the Logo, or the visible online/desktop product shells. The target is the current reviewed interface, not a visual redesign.

## Baseline environment

- Date: 2026-08-08
- Runtime: Node 20.20.2, pnpm 9.15.4
- Browser: Playwright Chromium
- Online build: `npm run build:web`
- Desktop build: `pnpm --filter web build:desktop`
- State: empty task, image crop online; video conversion desktop

## Baseline evidence

Generated screenshots are intentionally ignored by Git and remain local verification evidence:

| Surface | Viewport | Screenshot |
| --- | ---: | --- |
| Online | 1440×900 | `D:\万能格式转换器项目\verification\reliability-2026\baseline-online-1440x900.png` |
| Online | 390×844 | `D:\万能格式转换器项目\verification\reliability-2026\baseline-online-390x844.png` |
| Desktop | 1280×820 | `D:\万能格式转换器项目\verification\reliability-2026\baseline-desktop-1280x820.png` |
| Desktop | 1120×720 | `D:\万能格式转换器项目\verification\reliability-2026\baseline-desktop-1120x720.png` |

All four runs reported zero browser console errors and zero warnings.

## Reviewed target

- Preserve the existing online header, mobile menu, local-processing message, tool workspace, parameter panel, and bottom result actions.
- Preserve the desktop command bar, category navigation, independent task canvas, inspector, output directory, diagnostics disclosure, and status bar.
- Preserve the desktop absence of online header, footer, and advertisement containers.
- Keep existing typography, spacing, colors, borders, radii, shadows, control dimensions, icons, status language, and responsive/window behavior.
- Do not add tokens or visual components during the responsibility extraction.

## Acceptance gates

- Capture final screenshots at the same four viewports and states.
- Compare baseline and final screenshots for unintended layout or styling drift.
- Check horizontal overflow, clipped controls, long Chinese copy, and minimum-window visibility.
- Confirm desktop multi-file preview, output directory, batch folder, document child-folder, authorization, and no-ad boundaries through existing tests and E2E.
- Run console checks, TypeScript, privacy/network tests, affected conversion tests, and the full Node 20 test suite.

## Current result

Task 8 accepted. No P0, P1, or P2 visual issue was found.

## Final evidence

Final screenshots are stored under the Playwright artifact directory required by the browser-verification workflow:

| Surface | Viewport | Final screenshot | SHA-256 result |
| --- | ---: | --- | --- |
| Online | 1440×900 | `D:\万能格式转换器项目\output\playwright\task8\final-online-1440x900.png` | Exact baseline match |
| Online | 390×844 | `D:\万能格式转换器项目\output\playwright\task8\final-online-390x844.png` | Exact baseline match |
| Desktop | 1280×820 | `D:\万能格式转换器项目\output\playwright\task8\final-desktop-1280x820.png` | Exact baseline match |
| Desktop | 1120×720 | `D:\万能格式转换器项目\output\playwright\task8\final-desktop-1120x720.png` | Exact baseline match |

All four baseline/final pairs have identical SHA-256 hashes. Each viewport also reported no horizontal overflow and zero browser console errors or warnings.

## Verification result

- Focused architecture, offline P0, privacy, license, output, media, and batch tests: 52 passed.
- Full web suite: 34 files, 169 tests passed, zero skipped or failed.
- Privacy gate: 11 passed.
- Network guard: 4 passed.
- Rust desktop tests: 6 passed.
- Online production build: passed under Node 20.20.2 and pnpm 9.15.4.
- Desktop release build: passed and produced the MSI bundle.
- No CSS, layout, advertising, permission, license, conversion, naming, or output-folder behavior was changed by the extraction.
