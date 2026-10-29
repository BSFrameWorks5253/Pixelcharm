@echo off
title Pixelcharm — Desktop Studio
cd /d "%~dp0"
echo ====================================================
echo Launching Pixelcharm Studio...
echo ====================================================
if not exist "dist\index.html" (
    echo Building Pixelcharm application assets...
    call npm run build
)
call npx electron dist-electron/main.js
