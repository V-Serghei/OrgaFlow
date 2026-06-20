@echo off

rem Prefer user-level .NET install
if exist "%USERPROFILE%\.dotnet\dotnet.exe" (
    set "PATH=%USERPROFILE%\.dotnet;%PATH%"
    set "DOTNET_ROOT=%USERPROFILE%\.dotnet"
)

for %%G in (
    "C:\Program Files\Git\bin\bash.exe"
    "C:\Program Files\Git\usr\bin\bash.exe"
    "%LOCALAPPDATA%\Programs\Git\bin\bash.exe"
) do (
    if exist %%G (
        %%G "%~dp0stop-local.sh"
        exit /b %ERRORLEVEL%
    )
)
echo ERROR: Git Bash not found. Install Git for Windows: https://git-scm.com/download/win
exit /b 1
