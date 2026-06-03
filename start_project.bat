@echo off
setlocal
title FarmDirect Launcher
color 0A

echo.
echo  ==========================================
echo    🌱  FarmDirect — Local Dev Launcher
echo  ==========================================
echo.

:: ── Check Node.js ──────────────────────────────
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)

:: ── Check .env exists ──────────────────────────
if not exist "backend\.env" (
    echo  [WARN]  backend\.env not found!
    echo          Copy backend\.env.example to backend\.env and fill in your DB credentials.
    echo.
    pause
    exit /b 1
)

:: ── Start Backend ──────────────────────────────
echo  [1/2] Starting Backend  ^(port 5000^)...
start "FarmDirect — Backend" cmd /k "cd /d %~dp0backend && npm run dev"

:: Give backend 3 seconds to connect to MySQL
echo  [wait] Waiting for backend to connect to MySQL...
timeout /t 3 /nobreak >nul

:: ── Start Frontend ─────────────────────────────
echo  [2/2] Starting Frontend ^(port 3000^)...
start "FarmDirect — Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

:: Give frontend 4 seconds to start Vite
timeout /t 4 /nobreak >nul

:: ── Open browser ───────────────────────────────
echo  [done] Opening http://localhost:3000 ...
start "" http://localhost:3000

echo.
echo  ==========================================
echo    Frontend  →  http://localhost:3000
echo    Backend   →  http://localhost:5000
echo  ==========================================
echo.
echo  Close the Backend and Frontend windows to stop the servers.
echo  Press any key to close this launcher...
pause >nul
