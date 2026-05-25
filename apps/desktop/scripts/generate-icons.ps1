param(
  [Parameter(Mandatory = $true)]
  [string]$SourceImage,
  [string]$OutputDir = "$PSScriptRoot\..\src-tauri\icons"
)

Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"

$resolvedSource = [System.IO.Path]::GetFullPath($SourceImage)
$resolvedOutput = [System.IO.Path]::GetFullPath($OutputDir)
[System.IO.Directory]::CreateDirectory($resolvedOutput) | Out-Null

function Save-ResizedPng {
  param(
    [System.Drawing.Image]$Source,
    [int]$Size,
    [string]$Path
  )

  $bitmap = New-Object System.Drawing.Bitmap $Size, $Size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.DrawImage($Source, 0, 0, $Size, $Size)
  $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}

function Write-IcoFromPngs {
  param(
    [string[]]$PngPaths,
    [string]$IcoPath
  )

  $entries = @()
  foreach ($path in $PngPaths) {
    $bytes = [System.IO.File]::ReadAllBytes($path)
    $image = [System.Drawing.Image]::FromFile($path)
    $entries += [pscustomobject]@{
      Width = [int]$image.Width
      Height = [int]$image.Height
      Bytes = $bytes
    }
    $image.Dispose()
  }

  $stream = New-Object System.IO.MemoryStream
  $writer = New-Object System.IO.BinaryWriter $stream
  $writer.Write([UInt16]0)
  $writer.Write([UInt16]1)
  $writer.Write([UInt16]$entries.Count)

  $offset = 6 + (16 * $entries.Count)
  foreach ($entry in $entries) {
    $widthByte = if ($entry.Width -ge 256) { 0 } else { $entry.Width }
    $heightByte = if ($entry.Height -ge 256) { 0 } else { $entry.Height }
    $writer.Write([byte]$widthByte)
    $writer.Write([byte]$heightByte)
    $writer.Write([byte]0)
    $writer.Write([byte]0)
    $writer.Write([UInt16]1)
    $writer.Write([UInt16]32)
    $writer.Write([UInt32]$entry.Bytes.Length)
    $writer.Write([UInt32]$offset)
    $offset += $entry.Bytes.Length
  }

  foreach ($entry in $entries) {
    $writer.Write($entry.Bytes)
  }

  [System.IO.File]::WriteAllBytes($IcoPath, $stream.ToArray())
  $writer.Dispose()
  $stream.Dispose()
}

$image = [System.Drawing.Image]::FromFile($resolvedSource)
$tempDir = Join-Path $resolvedOutput ".ico-temp"
[System.IO.Directory]::CreateDirectory($tempDir) | Out-Null

$icoPngs = @()
foreach ($size in @(16, 32, 48, 64, 128, 256)) {
  $path = Join-Path $tempDir "icon-$size.png"
  Save-ResizedPng -Source $image -Size $size -Path $path
  $icoPngs += $path
}

Save-ResizedPng -Source $image -Size 32 -Path (Join-Path $resolvedOutput "32x32.png")
Save-ResizedPng -Source $image -Size 128 -Path (Join-Path $resolvedOutput "128x128.png")
Save-ResizedPng -Source $image -Size 256 -Path (Join-Path $resolvedOutput "128x128@2x.png")
Save-ResizedPng -Source $image -Size 512 -Path (Join-Path $resolvedOutput "icon.png")
Write-IcoFromPngs -PngPaths $icoPngs -IcoPath (Join-Path $resolvedOutput "icon.ico")

$image.Dispose()
Remove-Item -LiteralPath $tempDir -Recurse -Force
Write-Host "Generated Tauri icons from $resolvedSource"
