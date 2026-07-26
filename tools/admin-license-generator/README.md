# Admin License Generator

Administrator-only tooling for the offline desktop license. Private keys,
customer records, secret configuration, and generated `.mrx` files must never
enter the public website, customer installer, or Git.

## Private Web Admin

The production admin is available on desktop and mobile at:

```text
https://gszhmrx.cn/admin/license/
```

It issues the same offline license format as this local tool. Existing licenses
remain valid after the CloudBase-to-EdgeOne migration because the desktop app
verifies them locally.

## Generate Keys

```powershell
node tools/admin-license-generator/keygen.mjs
```

Copy the raw public key into `PUBLIC_KEY_RAW_B64` in
`apps/desktop/src-tauri/src/license.rs`. Keep `keys/private_key.pem` offline.

## Prepare EdgeOne Secrets

```powershell
powershell -ExecutionPolicy Bypass -File tools\admin-license-generator\setup-edgeone-admin.ps1
```

The hidden prompt accepts any non-empty password, including six digits. The
tool verifies that the private key matches the desktop public key and writes
four environment values to the ignored
`.tmp/edgeone-admin-secrets.env` file. It never prints their values.

Keep an offline backup of the record encryption key. Losing it makes stored
license history and encrypted backups unreadable.

## Emergency Local Issuing

```powershell
node tools/admin-license-generator/main.mjs --machine XXXX-XXXX-XXXX-XXXX --days 30 --customer "Customer"
```

Or issue from an exported activation request:

```powershell
node tools/admin-license-generator/main.mjs --request activation_request.mrx --days 365 --customer "Customer"
```

Outputs are the terminal activation code, `out/license.mrx`, and the local
`license_records.json`. All are ignored local admin artifacts.
