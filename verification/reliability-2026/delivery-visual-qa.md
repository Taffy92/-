# Download, trial, and activation visual QA

## Scope and success criteria

Task 11 clarifies the existing offline-delivery path without adding accounts, payment, online activation, cloud conversion, or new permissions. Success requires one clear download action, visible Windows/version/size/trial facts, secondary SHA256 details, an honest unsigned SmartScreen warning, non-blocking trial status, usable locked-state activation, responsive layouts, and no browser console errors.

No Logo, advertisement placement, conversion behavior, file output, network boundary, Tauri permission, or global CSS rule was changed.

## Visual evidence

| State | Viewport | Baseline | Final |
| --- | ---: | --- | --- |
| Download page | 1440x900 | `D:\万能格式转换器项目\output\playwright\task11\baseline-download-1440x900.png`<br>`A17EFFA046FEA5A341418DD94DF1C8B652B9415F630EE63B917159473C8773B9` | `D:\万能格式转换器项目\output\playwright\task11\final-download-1440x900.png`<br>`397DC6E8895838AC41DEAB4AF4B2A0ADFD875B6E45FB1543AE1AC6362AE29A0A` |
| Download page | 375x812 | `D:\万能格式转换器项目\output\playwright\task11\baseline-download-375x812.png`<br>`AD260568F3D895ED1E3AC37BF924086B1B17E2E04AE11005A8646C519450DCEA` | `D:\万能格式转换器项目\output\playwright\task11\final-download-375x812.png`<br>`3CBE4A5E355292F21FEA050F1A7834BA367B9825CD9C987BFCA1CA2FCDEF49B9` |
| Desktop trial workbench | 1280x820 | `D:\万能格式转换器项目\output\playwright\task11\baseline-desktop-trial-1280x820.png`<br>`FA0E4C6524418EF7F83CCC1B06E32BF26576C484EE3C6B25BC69E3BFD86B27B3` | `D:\万能格式转换器项目\output\playwright\task11\final-desktop-trial-1280x820.png`<br>`86E757DA672AD48BCE296B0BB79DDAF7005D2822BFFD65603A306AFF1F898349` |
| Desktop trial-expired gate | 1120x720 | `D:\万能格式转换器项目\output\playwright\task11\baseline-desktop-locked-1120x720.png`<br>`A6579CF1C285C7B32E84AF30C16E1397BBCBA06D4B0A5B64A5395DCA407DD987` | `D:\万能格式转换器项目\output\playwright\task11\final-desktop-locked-1120x720.png`<br>`779CF3B67F5E82A6C8A88F6D8C041132A53BA39BDD5F6DAF0D7AB6871077512A` |

All final states reported no horizontal overflow and zero browser console errors or warnings. Desktop states used a static Desktop build with a fixed, non-secret Tauri test response and the reserved fixture machine code `TEST-TEST-TEST-TEST`; no real activation material was captured.

## Reviewed differences

- The download page now presents one primary ZIP action in the hero instead of repeating equivalent download cards.
- Version, file size, Windows support, and the three-day trial remain visible in the first task area.
- SHA256 and part-download mechanics moved into an accessible disclosure below the primary action.
- The unsigned package warning explicitly names Microsoft Defender SmartScreen and the verification step.
- The Desktop workbench changes only `试用中` to the calculated remaining-day label.
- The expired gate adds the no-restart return-path explanation while retaining machine-code copy, activation-code input, and `license.mrx` import at the minimum window size.

No P0, P1, or P2 visual or usability issue remains in the reviewed states.

## Verification

- Focused license/privacy suite: 3 files, 28 tests passed.
- Full web suite: 36 files, 182 tests passed.
- Online Playwright suite: 13 tests passed.
- Desktop Playwright suite: 5 tests passed, including trial-day visibility and same-task activation return.
- Privacy boundary: 11 tests passed.
- Network boundary: 4 tests passed.
- `npm run build:web`: passed under Node 20.20.2.
- `node scripts/run-pnpm.cjs --filter web build:desktop`: passed under Node 20.20.2.

## Result

Accepted. The delivery path is clearer and more honest about unsigned installation risk, while the existing local-only trial and activation model remains unchanged.
