@echo off
echo Stopping servers on ports 3000 and 5000...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000" ^| findstr "LISTENING"') do (
    echo Stopping backend server (PID: %%a)...
    taskkill /PID %%a /F >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo Stopping frontend server (PID: %%a)...
    taskkill /PID %%a /F >nul 2>&1
)

echo Done!
pause






