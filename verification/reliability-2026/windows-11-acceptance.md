# Windows 11 clean-VM acceptance

## Status

**BLOCKED — not executed.** This is not a passing acceptance record.

## Environment audit

- Audit date: 2026-08-09.
- No Windows 11 environment is available on the current host.
- Hyper-V is available, but it has 0 registered virtual machines.
- Windows Sandbox is disabled; VirtualBox, VMware and QEMU launch tools are unavailable.

No qualifying clean Windows 11 VM could therefore be started in this environment. No username, machine code, activation code, license file, IP address or VM image was recorded.

## Required flow

| Required check | Result |
| --- | --- |
| Record Windows version and existing WebView2 state | Not executed |
| Download the release ZIP from the production site | Not executed |
| Verify ZIP SHA256 `191767A4402244E58EAE44DA4AFBC516EF7458C83B014C7EB7A21158C1CD87EC` | Not executed on VM |
| Disconnect networking; extract ZIP and install MSI | Not executed |
| Start the three-day trial | Not executed |
| Convert real image, PDF, Word, Excel, audio and video fixtures | Not executed |
| Run the nine-file batch and inspect independent/multi-page folders | Not executed |
| Verify cancel, corrupt-file and unwritable-output errors | Not executed |
| Test activation code and `license.mrx` import without recording secrets | Not executed |
| Restart and verify license persistence | Not executed |
| Confirm no user-file upload while offline and after reconnecting | Not executed |

## Non-VM evidence available

The Node 20 / pnpm 9.15.4 unified release gate passed 11/11 stages, including real Office and media automation, local ZIP/MSI/part SHA256 verification, privacy checks and critical-test skip scanning. That evidence reduces risk but does not satisfy the clean-VM requirement.

## Unblock condition

Provision a clean Windows 11 x64 VM with no project development dependencies, record whether WebView2 already exists, restore a pre-install snapshot, follow the v2.0.0 section of `MANUAL_CLEAN_VM_TEST_GUIDE.md`, and replace every “Not executed” entry with timestamped, redacted evidence. Until then this acceptance remains blocked.
