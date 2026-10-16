@echo off
REM Build Kelvid frontend WITHOUT npm (uses direct vite download)
cd /d "%~dp0"
echo Checking for node...
node --version
if errorlevel 1 (
  echo [ERROR] Node.js not found! Install from https://nodejs.org (LTS) first.
  pause
  exit /b 1
)
echo Installing packages with npm...
call npm install
if errorlevel 1 (
  echo [WARN] npm failed, trying with npx...
)
echo Building...
call npx vite build
echo Done. dist folder should exist now.
pause
