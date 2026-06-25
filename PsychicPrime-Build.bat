@echo off
setlocal EnableExtensions
title PsychicPrime — Production Build

cd /d "%~dp0"

echo.
echo  PsychicPrime — building production desktop app...
echo.

where npm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] npm not found. Install Node.js from https://nodejs.org/
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo [INFO] Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
  )
)

call npm run desktop:build
set EXITCODE=%ERRORLEVEL%

if %EXITCODE% equ 0 (
  echo.
  echo [OK] Build complete. Check src-tauri\target\release\bundle\
) else (
  echo.
  echo [ERROR] Build failed with code %EXITCODE%.
)

pause
exit /b %EXITCODE%
