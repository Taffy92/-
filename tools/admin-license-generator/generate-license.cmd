@echo off
setlocal
pushd "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Please install Node.js first.
  pause
  exit /b 1
)

if not exist "keys\private_key.pem" (
  echo Missing keys\private_key.pem.
  echo Run keygen.cmd first, then replace the desktop public key before a real release.
  pause
  exit /b 1
)

set /p MACHINE=Machine ID:
if "%MACHINE%"=="" (
  echo Machine ID is required.
  pause
  exit /b 1
)

set /p DAYS=License days [365]:
if "%DAYS%"=="" set DAYS=365

set /p CUSTOMER=Customer name:

node main.mjs --machine "%MACHINE%" --days "%DAYS%" --customer "%CUSTOMER%"
echo.
echo License code is printed above. license.mrx is in the out directory.
pause
