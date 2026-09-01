@echo off
REM ============================================================
REM  CoreConnect - local static server launcher
REM  Double-click this file to serve the pages and open them in
REM  your browser. Keep this window open; close it (or Ctrl+C)
REM  to stop the server.
REM ============================================================
title CoreConnect Server
cd /d "%~dp0"

set "PORT=8123"
set "PAGE=coreconnect_dashboard_v41/coreconnect_dashboard_v41.html"

echo.
echo   CoreConnect is starting at http://localhost:%PORT%/
echo   Opening %PAGE% ...
echo   (Keep this window open. Close it or press Ctrl+C to stop.)
echo.

REM Check Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo.
  echo   ERROR: Node.js was not found on your PATH.
  echo   Install it from https://nodejs.org/ then run this file again.
  echo.
  pause
  exit /b 1
)

REM Check node_modules exists
if not exist "%~dp0node_modules" (
  echo   Installing dependencies...
  echo.
  npm install
  if %errorlevel% neq 0 (
    echo.
    echo   ERROR: npm install failed. Check the error above.
    echo.
    pause
    exit /b 1
  )
  echo.
)

REM Open the browser a couple seconds after the server boots
start "" cmd /c "timeout /t 2 >nul & start http://localhost:%PORT%/%PAGE%"

REM Start the server
node "%~dp0serve.js"

echo.
echo   Server stopped. Press any key to close this window.
echo.
pause
