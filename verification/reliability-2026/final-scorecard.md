# Final release scorecard

## Conclusion

**未完成（NOT COMPLETE）— 2026-08-09.**

The automated release gate is green, but mandatory production rate-limit and clean Windows 10/11 VM evidence is unavailable. A partial pass must not be presented as final release acceptance.

## Scorecard

| Area | Requirement | Evidence | Status |
| --- | --- | --- | --- |
| Real samples | Image, PDF, Word, Excel, audio and video paths execute on real fixtures | Unified gate: 37 test files / 187 tests; Office stage 12 tests; no critical skips | Automated pass |
| Expected failures | Invalid/corrupt inputs and guarded output behavior are verified | Conversion, batch, output and privacy suites passed | Automated pass; VM pass pending |
| Release gate | Node 20 / pnpm 9.15.4 fixed 11-stage gate | `npm run verify:release`: PASS 11/11 | Pass |
| Download integrity | ZIP, embedded MSI, EdgeOne parts, version, size and SHA256 agree | ZIP SHA256 `191767A4402244E58EAE44DA4AFBC516EF7458C83B014C7EB7A21158C1CD87EC`; artifact stage passed | Local pass; production VM download pending |
| Batch output | Nine-file batch, independent result folder and multi-page subfolders | Automated batch/output tests passed | Automated pass; VM pass pending |
| Trial and activation | Three-day trial, machine-code flow, code/file activation and restart persistence | UI and Rust automation passed; no clean-VM execution | Partial / mandatory VM check blocked |
| Windows 10 | Clean x64 VM offline install and full flow | No qualifying VM; see `windows-10-acceptance.md` | Blocked |
| Windows 11 | Clean x64 VM offline install and full flow | No qualifying VM; see `windows-11-acceptance.md` | Blocked |
| Browser console/network | No user-file upload; browser network regression clean | `check:network:browser`: 15 passed, 5 Desktop-only specs skipped by the web-static run; Desktop suite passed separately in Task 11 | Pass |
| Privacy | Files and conversion results remain local | Privacy 11/11 and network 4/4 passed inside unified gate | Pass |
| License-admin abuse control | Same-origin APIs and sixth invalid login returns 429 | Same-origin app tests pass; production route probe returned 404 and EdgeOne rule is not verified | Blocked |
| Code signing | Real non-secret decision and authentic package state | No usable cert; MSI `NotSigned`; unsigned warning and SHA256 retained | Decision complete; risk accepted |

## Blocking conditions

1. Configure/deploy the EdgeOne production license-admin route and domain rate-limit rule, then demonstrate HTTP 401 for attempts 1–5 and HTTP 429 for attempt 6 from one network, recovery after the window, and isolation from a second network.
2. Execute and pass the complete redacted workflow on clean Windows 10 x64 and Windows 11 x64 virtual machines.

The scorecard can change to “完成” only after both blockers have evidence and all mandatory VM rows pass. Automated host tests, screenshots, or an unsigned-risk decision cannot substitute for those conditions.
