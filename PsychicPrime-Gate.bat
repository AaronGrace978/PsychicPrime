@echo off
REM PsychicPrime — open The Gate (phone / LAN Sanctuary proxy)
cd /d "%~dp0"
call npm run gate:build
pause
