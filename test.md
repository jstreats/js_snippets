@echo off
setlocal

:: Prompt the user to enter a port number
set /p port=Enter the port number: 

:: Find the process ID (PID) associated with the port
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%port%') do (
    set pid=%%a
)

:: Check if a PID was found
if defined pid (
    echo Process ID %pid% is using port %port%.
    
    :: Ask for confirmation to terminate the process
    set /p confirm=Do you want to terminate this process? (y/n): 
    if /i "%confirm%"=="y" (
        :: Terminate the process
        taskkill /PID %pid% /F
        if %errorlevel%==0 (
            echo Process terminated successfully.
        ) else (
            echo Failed to terminate the process.
        )
    ) else (
        echo Operation cancelled.
    )
) else (
    echo No process found using port %port%.
)

endlocal
pause
