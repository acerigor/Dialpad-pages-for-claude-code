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

REM Open the browser a couple seconds after the server boots
start "" cmd /c "timeout /t 2 >nul & start http://localhost:%PORT%/%PAGE%"

REM Node.js is the most reliable here (ships its own runtime, no downloads).
where node >nul 2>nul
if %errorlevel%==0 (
  node "%~dp0serve.js"
  echo.
  echo   Server stopped. Press any key to close.
  pause
  goto end
)

REM Fall back to a REAL Python via the "py" launcher only. The bare "python"
REM command on Windows is often a Microsoft Store stub that does NOT serve.
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 -m http.server %PORT%
  goto end
)

echo.
echo   ERROR: Node.js was not found on your PATH.
echo   Install it from https://nodejs.org/ then run this file again.
echo   (Alternatively install Python from https://www.python.org/ and
echo    tick "Add Python to PATH".)
echo.
pause

:end
