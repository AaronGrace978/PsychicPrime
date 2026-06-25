@echo off
setlocal EnableExtensions
title PsychicPrime — Web Dev

cd /d "%~dp0"

echo.
echo  PsychicPrime — browser dev mode (http://localhost:1420)
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

call npm run dev
pause
