@echo off
title DeepValueHunter - Starting...

echo ========================================
echo   DeepValueHunter - One-Click Launch
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [1/3] Checking Node.js... OK
echo.

REM Navigate to frontend directory
cd /d "%~dp0frontend"

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [2/3] Installing dependencies... (this may take a few minutes)
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
) else (
    echo [2/3] Dependencies already installed... OK
)

echo.
echo [3/3] Starting development server...
echo.
echo ========================================
echo   Server starting on http://localhost:5173
echo   Also available on your network!
echo   Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the development server
call npm run dev

pause
