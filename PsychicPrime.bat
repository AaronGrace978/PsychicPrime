@echo off
setlocal EnableExtensions
title PsychicPrime — The Sanctuary

cd /d "%~dp0"

echo.
echo  ═══════════════════════════════════════════════════
echo   PsychicPrime — Enter the Sanctuary
echo   Soli Deo Gloria.
echo  ═══════════════════════════════════════════════════
echo.

where npm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] npm not found. Install Node.js from https://nodejs.org/
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo [INFO] First run — installing dependencies...
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
  )
  echo.
)

echo [INFO] Opening the desktop Sanctuary...
echo.
call npm run desktop
set EXITCODE=%ERRORLEVEL%

if %EXITCODE% neq 0 (
  echo.
  echo [ERROR] PsychicPrime exited with code %EXITCODE%.
  pause
)

exit /b %EXITCODE%
