$ErrorActionPreference = "Stop"

$toolDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$nodePath = if ($nodeCommand) { $nodeCommand.Source } else { $null }

function Test-Node20([string]$candidate) {
    if (-not $candidate -or -not (Test-Path -LiteralPath $candidate)) {
        return $false
    }
    try {
        return (& $candidate -p "process.versions.node.split('.')[0]" 2>$null) -eq "20"
    } catch {
        return $false
    }
}

if (-not (Test-Node20 $nodePath)) {
    $cachedNodes = Get-ChildItem `
        -Path (Join-Path $env:LOCALAPPDATA "npm-cache\_npx") `
        -Filter "node.exe" `
        -Recurse `
        -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -like "*\node_modules\node\bin\node.exe" } |
        Sort-Object LastWriteTime -Descending

    $nodePath = $cachedNodes |
        Where-Object { Test-Node20 $_.FullName } |
        Select-Object -First 1 -ExpandProperty FullName
}

if (-not (Test-Node20 $nodePath)) {
    throw "Node.js 20 was not found. Install the project-required Node.js 20 LTS first."
}

$securePassword = Read-Host "Enter the license admin password (input is hidden)" -AsSecureString
$passwordPointer = [IntPtr]::Zero
$plainPassword = $null

try {
    $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
    if ([string]::IsNullOrEmpty($plainPassword)) {
        throw "The admin password cannot be empty."
    }

    $env:UFC_EDGEONE_ADMIN_PASSWORD = $plainPassword
    & $nodePath (Join-Path $toolDir "setup-edgeone-admin.mjs")
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create the EdgeOne admin secret configuration."
    }
} finally {
    Remove-Item Env:UFC_EDGEONE_ADMIN_PASSWORD -ErrorAction SilentlyContinue
    $plainPassword = $null
    if ($passwordPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    }
    if ($securePassword) {
        $securePassword.Dispose()
    }
}
