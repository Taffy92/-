# EdgeOne license-admin rate-limit verification

## Status

Passed on 2026-08-09 with the documented EdgeOne Makers plan limits. The production login route is rate-limited and non-canonical host bypasses are closed.

## Production configuration

- EdgeOne rule name: `license-admin-login`
- EdgeOne rule ID: `2181144935`
- Protected domain: `gszhmrx.cn`
- Match: request path equals `/api/admin/license/session`
- Counting dimension: client IP
- Counting window: 10 seconds
- Threshold: more than 5 requests
- Action: block for 30 seconds
- Observed block status: HTTP 567

The Makers plan exposes one precise rate-limit rule, a maximum 10-second counting window, a maximum 30-second action duration, and only the block action. It does not expose the originally planned 15-minute windows or a custom HTTP 429 response.

## Canonical-host enforcement

- `www.gszhmrx.cn/admin/license/` returns HTTP 308 to `https://gszhmrx.cn/admin/license/`.
- `www.gszhmrx.cn/api/admin/license/*` returns HTTP 403 before reaching the Cloud Function.
- The EdgeOne preset deployment domain requires platform authorization and returned HTTP 401.
- The Cloud Function accepts state-changing production requests only when the Origin is `https://gszhmrx.cn`.
- No process-local in-memory rate limiter was added.

## Production verification

After production deployment `dpdfgftr2uov` on 2026-08-09:

1. Six invalid same-origin login requests were sent from one test network in 2.25 seconds.
2. Requests 1 through 5 returned HTTP 401.
3. Request 6 returned EdgeOne HTTP 567.
4. After 35 seconds, the same request returned HTTP 401 again, confirming recovery.
5. The `www` API returned HTTP 403 and the `www` admin page redirected to the canonical host.
6. A redirected browser visit rendered the login page with no console or page errors.

The probes used fixed non-secret invalid values. No production password, Cookie, authorization material, customer record, license data, or complete client IP was recorded.

## Regression evidence

- Node 20 unit/integration tests: 190 passed.
- Privacy tests: 11 passed.
- Network guard tests: 4 passed.
- Playwright browser checks: 15 passed, 5 offline-only cases skipped by their existing environment gate.
- EdgeOne production build and deployment succeeded.
