# Bundled LibreOffice component

The offline Windows application bundles LibreOffice for local Word/Excel to PDF rasterization. The runtime never downloads or uploads user files.

- Version: 26.2.5
- Platform: Windows x86-64
- Source: https://download.documentfoundation.org/libreoffice/stable/26.2.5/win/x86_64/LibreOffice_26.2.5_Win_x86-64.msi
- License: MPL-2.0 / LGPL-3.0-or-later
- Runtime dependency: Microsoft Visual C++ v14 Runtime 14.51.36247.0 (x64), application-local deployment
- Runtime source: https://aka.ms/vc14/vc_redist.x64.exe
- Runtime license: https://aka.ms/VCRedistLicense

The binary tree is prepared locally before a desktop build by running npm run prepare:libreoffice. The installer is not committed to the public repository.
