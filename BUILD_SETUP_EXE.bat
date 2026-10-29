@echo off
title Pixelcharm — Build Setup EXE
cd /d "%~dp0"
echo ====================================================
echo Building Pixelcharm Windows Setup EXE Installer...
echo ====================================================
call npm run build:win
if %errorlevel% neq 0 (
    echo [ERROR] Build failed.
    pause
    exit /b %errorlevel%
)
echo.
echo ====================================================
echo  Setup EXE built successfully!
echo  Location: %~dp0release\Pixelcharm_Setup_1.0.0.exe
echo ====================================================
explorer "%~dp0release"
pause
