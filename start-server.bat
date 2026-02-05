@echo off
echo 🚀 POKRETANJE CENTRALNOG SERVERA
echo ==================================

REM Pronađi IP adresu
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set SERVER_IP=%%a
    goto :found
)
:found
set SERVER_IP=%SERVER_IP:~1%

echo 📍 IP adresa servera: %SERVER_IP%
echo.

REM Ažuriraj docker-compose.yml
powershell -Command "(gc docker-compose.yml) -replace 'VITE_API_BASE_URL:.*', 'VITE_API_BASE_URL: http://%SERVER_IP%:5000' | Out-File -encoding ASCII docker-compose.yml"

REM Zaustavi stare kontejnere
echo 🧹 Čišćenje starih kontejnera...
docker-compose down -v

REM Pokreni servise
echo 🚀 Pokretanje servisa...
docker-compose up --build -d

REM Čekaj
echo ⏳ Čekanje servisa...
timeout /t 15 /nobreak

REM Kreiraj korisnike
echo 👥 Kreiranje test korisnika...
docker exec learning_platform_backend python init_admin.py

echo.
echo ✅ SERVER JE POKRENUT!
echo ==================================
echo 📍 IP ADRESA SERVERA: %SERVER_IP%
echo.
echo 🌐 PRISTUP SA DRUGIH LAPTOPOVA:
echo.
echo    http://%SERVER_IP%:5173
echo.
echo 📋 TEST NALOZI:
echo    Admin:    admin@test.com    / test1234
echo    Profesor: profesor@test.com / test1234
echo    Student:  student@test.com  / test1234
echo.
echo 🔗 API Endpoint: http://%SERVER_IP%:5000/api
echo ==================================
echo.

docker ps

pause