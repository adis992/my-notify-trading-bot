@echo off

echo Provjeravam pokrenute procese...

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