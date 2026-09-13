@echo off
setlocal
title Balatro Private - Launcher
cd /d "%~dp0"

echo ==========================================
echo   Balatro Private - Windows Launcher
echo ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js was not found.
    echo Trying to install Node.js LTS automatically...
    echo.

    where winget >nul 2>nul
    if errorlevel 1 (
        echo ERROR: winget is not available on this PC.
        echo Please take a screenshot of this window and send it to ChatGPT.
        echo.
        pause
        goto :eof
    )

    winget install --id OpenJS.NodeJS.LTS -e --accept-package-agreements --accept-source-agreements

    set "PATH=C:\Program Files\nodejs;%PATH%"

    where node >nul 2>nul
    if errorlevel 1 (
        echo.
        echo Node.js installation may have finished, but Windows has not refreshed PATH yet.
        echo Close this window, then double-click RUN_GAME_Windows.bat again.
        echo.
        pause
        goto :eof
    )
)

echo Node.js detected:
node --version
echo.

where npm >nul 2>nul
if errorlevel 1 (
    set "PATH=C:\Program Files\nodejs;%PATH%"
)

where npm >nul 2>nul
if errorlevel 1 (
    echo ERROR: npm was not found.
    echo Close this window and run this launcher again.
    echo.
    pause
    goto :eof
)

echo npm detected:
call npm --version
echo.

if not exist "node_modules\.bin\vite.cmd" (
    echo First launch: installing game components...
    echo This can take a few minutes.
    echo.
    call npm ci
    if errorlevel 1 (
        echo.
        echo ERROR: npm install failed.
        echo Please take a screenshot of this window and send it to ChatGPT.
        echo.
        pause
        goto :eof
    )
)

echo.
echo Starting the game...
echo The browser should open automatically.
echo IMPORTANT: keep this black window open while playing.
echo To stop the game later, close this window.
echo.

call npm run dev -- --host 127.0.0.1 --port 5173 --open

echo.
echo The game server stopped.
echo If there is an error above, take a screenshot and send it to ChatGPT.
echo.
pause
