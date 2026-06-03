# Admin License Generator

This tool is for the administrator only. Do not put this directory, private
keys, generated licenses, or `license_records.json` into the customer installer
or the public website.

## Generate Keys

```powershell
node tools/admin-license-generator/keygen.mjs
```

Copy the printed raw public key into `PUBLIC_KEY_RAW_B64` in:

```text
apps/desktop/src-tauri/src/license.rs
```

The private key stays in `tools/admin-license-generator/keys/private_key.pem`.

## Generate A License

```powershell
node tools/admin-license-generator/main.mjs --machine XXXX-XXXX-XXXX-XXXX --days 30 --customer "Customer"
```

Or use an exported activation request:

```powershell
node tools/admin-license-generator/main.mjs --request activation_request.mrx --days 365 --customer "Customer"
```

Outputs:

- License code printed in the terminal.
- `tools/admin-license-generator/out/license.mrx`.
- A local `license_records.json` record.

## Production Rule

Before a real release, generate a production key pair, update the desktop public
key, rebuild the desktop installer, and keep `private_key.pem` offline.

Generated keys, records, output files, and `.mrx` files are local admin artifacts
and must not be copied into `apps/web/out` or the customer installer.
