# Bundled LibreOffice component

The offline Windows application bundles LibreOffice for local Word/Excel to PDF rasterization. The runtime never downloads or uploads user files.

- Version: 26.2.5
- Platform: Windows x86-64
- Source: https://download.documentfoundation.org/libreoffice/stable/26.2.5/win/x86_64/LibreOffice_26.2.5_Win_x86-64.msi
- License: MPL-2.0 / LGPL-3.0-or-later

The binary tree is prepared locally before a desktop build by:

```powershell
npm run prepare:libreoffice
```

The installer is not committed to the public repository. A build fails if the bundled runtime is missing or has the wrong version.
