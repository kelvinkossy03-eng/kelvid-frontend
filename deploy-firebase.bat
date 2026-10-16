@echo off
REM Kelvid frontend: install + build + deploy to Firebase (double-click)
cd /d "%~dp0"
echo === Step 1: install ===
call npm install
if errorlevel 1 (echo INSTALL FAILED & pause & exit /b 1)
echo === Step 2: build ===
call npm run build
if errorlevel 1 (echo BUILD FAILED & pause & exit /b 1)
echo === Step 3: deploy ===
call firebase deploy --only hosting
pause
