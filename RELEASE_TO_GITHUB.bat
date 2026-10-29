@echo off
title Pixelcharm — Release Setup EXE to GitHub
cd /d "%~dp0"
echo ====================================================
echo Publishing Pixelcharm Setup EXE Release to GitHub...
echo Target Repo: https://github.com/BSFrameworks5253/Pixelcharm
echo ====================================================
call node scripts/publish-to-github.mjs
pause
