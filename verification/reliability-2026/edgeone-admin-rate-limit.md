# EdgeOne license-admin rate-limit verification

## Status

Blocked on production EdgeOne configuration and deployment. The application-layer same-origin hardening is complete, but the required production 401/429 sequence has not been demonstrated.

## Application evidence

- Protected issuance, record listing, license-file download, backup, and session requests enforce same-origin access.
- `authorize` performs the shared same-origin check before session authorization.
- No process-local `Map` or other in-memory production rate limiter was added.
- `edgeOneLicenseAuth`, `edgeOneLicenseApi`, and `edgeOneLicenseRecords`: 19 tests passed on 2026-08-09.

## Required EdgeOne rule

Apply the same domain-level Web Protection rule to `gszhmrx.cn` and `www.gszhmrx.cn`:

| Setting | Required value |
| --- | --- |
| Method | `POST` |
| Path | `/api/admin/license/session` |
| Counting dimension | Client IP |
| Counting window | 15 minutes |
| Threshold | 5 requests |
| Action duration | 15 minutes |
| Action | Custom response, HTTP 429 |

## Production probe

At `2026-08-08T16:15:32Z` through `2026-08-08T16:15:33Z`, six same-origin requests with a fixed invalid probe value were submitted from one test network. All six returned HTTP 404 from `edgeone-pages`; no password, Cookie, authorization material, or IP address was recorded.

This result means the production function route was unavailable at the tested deployment, so neither the expected first-five HTTP 401 responses nor the sixth HTTP 429 response could be verified.

## External blocker

- EdgeOne CLI 1.6.17 is installed but not authenticated in this environment.
- The installed CLI exposes Makers/Pages deployment commands and no domain Web Protection rule-management command.
- A console operator with access to both production domains must create the rule and deploy the license-admin function route.

After configuration, repeat the six-attempt test, record the non-secret EdgeOne rule ID and status codes, wait for the 15-minute window to expire, verify recovery, and confirm a second network is unaffected. Until then this gate remains **blocked**.
