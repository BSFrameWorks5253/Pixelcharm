@echo off
title Pixelcharm Desktop — Dev Mode
cd /d "%~dp0"
echo ====================================================
echo Starting Pixelcharm in Desktop Development Mode (Port 5185)...
echo ====================================================
call npm run dev
pause
