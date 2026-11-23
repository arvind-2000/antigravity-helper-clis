@echo off
setlocal enabledelayedexpansion

title Flutter Agent Kit Installer

echo ======================================================
echo          Flutter Agent Kit - Setup and Installation
echo ======================================================
echo.

:: 1. Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in PATH!
    echo Please install Node.js 22 or higher from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo [INFO] Detected Node.js: %NODE_VER%

:: 2. Check for npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not found in PATH!
    echo Please ensure npm is installed and added to PATH.
    echo.
    pause
    exit /b 1
)

echo.
echo [1/4] Installing project dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
)

echo.
echo [2/4] Building TypeScript CLI package...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] TypeScript build failed.
    pause
    exit /b 1
)

echo.
echo [3/4] Registering 'flutter-agent' command globally...
call npm link
if %errorlevel% neq 0 (
    echo [ERROR] npm link failed.
    pause
    exit /b 1
)

echo.
echo [4/4] Setting up global Antigravity instructions...
echo Installing GEMINI.md into %%USERPROFILE%%\.gemini\GEMINI.md...
call node ./dist/bin/flutter-agent.js global install

echo.
echo ======================================================
echo   SUCCESS! Flutter Agent Kit is installed globally.
echo ======================================================
echo.
echo You can now open any command prompt or PowerShell and run:
echo   flutter-agent --help
echo   flutter-agent init
echo   flutter-agent doctor
echo   flutter-agent list
echo.

pause
