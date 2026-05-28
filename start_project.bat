@echo off
setlocal
echo ===================================================
echo   FarmDirect - Direct Marketing System
echo ===================================================
echo.

:: Checking for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    pause
    exit /b
)

echo [1/2] Starting Backend Server (Port 5000)...
start "FarmDirect Backend" cmd /c "cd backend && npm start"

echo [2/2] Starting Frontend Server (Port 3000)...
start "FarmDirect Frontend" cmd /c "cd frontend && npm run dev"

echo.
echo ---------------------------------------------------
echo FarmDirect servers are booting up!
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo ---------------------------------------------------
echo.
echo Press any key to exit this launcher window...
pause >nul
