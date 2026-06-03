@echo off
setlocal
pushd "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Please install Node.js first.
  pause
  exit /b 1
)

node keygen.mjs
echo.
echo Keep keys\private_key.pem offline. Do not copy it into the website or installer.
pause
