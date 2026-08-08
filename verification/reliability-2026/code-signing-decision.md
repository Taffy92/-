# Windows code-signing decision

## Decision

Status: **unsigned release retained** on 2026-08-09.

No usable OV/EV code-signing certificate was available in this release environment. The project must not invent a thumbprint or treat an unsigned package as signed, so the current release remains on the documented unsigned branch.

## Evidence

- `Cert:\CurrentUser\My`: no certificate with a private key and Code Signing EKU.
- `Cert:\LocalMachine\My`: no certificate with a private key and Code Signing EKU.
- Release MSI Authenticode status: `NotSigned`.
- `apps/desktop/src-tauri/tauri.conf.json`: `certificateThumbprint` remains `null`; `timestampUrl` remains empty.
- `apps/web/src/config/downloads.ts`: `windowsCodeSigned` remains `false`.
- The download page continues to show the unsigned SmartScreen warning and the release ZIP SHA256.

No certificate material, password, customer record, activation code, machine code, or license file was recorded during this check.

## Risk and ownership

Risk: Windows SmartScreen can warn or block an unfamiliar unsigned installer, and users cannot verify a Windows publisher identity from Authenticode. Published SHA256 values detect file changes but do not replace code signing.

Owner: project release owner.

Next review: **2026-09-09 or before the next public release, whichever comes first**. Reassessment must confirm the legal certificate holder, protected signing machine, HTTPS timestamp service, and secret-handling procedure before changing Tauri configuration.

## Activation condition for the signed branch

Only switch to the signed branch after a real certificate is available. The resulting MSI must report Authenticode `Valid`, include a trusted timestamp, match the intended publisher, and be followed by regenerated ZIP, SHA256, EdgeOne parts, download metadata, and a complete `npm run verify:release` pass.
