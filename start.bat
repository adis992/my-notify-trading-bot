@echo off

echo Provjeravam pokrenute procese...

REM Napravi backup folder ako ne postoji
if not exist "backups" mkdir backups

REM Backup logova i trade historije sa trenutnim datumom
set timestamp=%date:~-4%-%date:~3,2%-%date:~0,2%_%time:~0,2%-%time:~3,2%
if exist "backend\logs.json" copy "backend\logs.json" "backups\logs_%timestamp%.json"
if exist "backend\tradeHistory.json" copy "backend\tradeHistory.json" "backups\tradeHistory_%timestamp%.json"

REM Zaustavi postojece procese ako su pokrenuti
taskkill /F /IM "node.exe" >nul 2>&1
echo Zaustavljeni su prethodni procesi ako su postojali.

echo Provjeravam i instaliram potrebne pakete...

REM Provjeri i instaliraj backend dependencies
cd backend
if not exist "node_modules\" (
    echo Instaliram backend pakete...
    call npm install
)

REM Provjeri i instaliraj frontend dependencies
cd ..\frontend
if not exist "node_modules\" (
    echo Instaliram frontend pakete...
    call npm install
)

echo Pokrecem servere...

REM Pokreni backend
cd ..\backend
start "Backend Server" cmd /k "npm start"

REM Pokreni frontend
cd ..\frontend
start "Frontend Server" cmd /k "npm start"

echo Serveri su pokrenuti! Backend i Frontend se pokrecu...

:check_services
timeout /t 30 /nobreak
curl -s http://localhost:4000/health >nul 2>&1
if errorlevel 1 (
    echo Backend nije dostupan! Restartujem...
    taskkill /F /IM "node.exe" >nul 2>&1
    cd backend
    start "Backend Server" cmd /k "npm start"
)
curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo Frontend nije dostupan! Restartujem...
    taskkill /F /IM "node.exe" >nul 2>&1
    cd frontend
    start "Frontend Server" cmd /k "npm start"
)
goto check_services