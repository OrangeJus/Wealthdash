@echo off
title WealthDash Launcher
color 0A
echo ====================================================================
echo               🏦 WELATHDASH LOCAL DASHBOARD LAUNCHER 🏦
echo ====================================================================
echo.
echo [*] Menyalakan Backend API Server (Port 3001)...
start /b cmd /c "npm run dev:api"

:: Tunggu 3 detik agar database & backend siap
timeout /t 3 /nobreak >nul

echo [*] Menyalakan Frontend Web Server (Port 5173)...
start /b cmd /c "npm run dev:web"

:: Tunggu 2 detik agar Vite siap melakukan bundling
timeout /t 2 /nobreak >nul

echo [*] Membuka browser secara otomatis ke http://localhost:5173...
start http://localhost:5173

echo.
echo ====================================================================
echo  ✅ WealthDash berhasil dijalankan!
echo  JANGAN TUTUP jendela terminal ini agar aplikasi tetap berjalan.
echo  Untuk menghentikan aplikasi, Anda cukup menutup jendela ini.
echo ====================================================================
echo.

:: Menjaga jendela CMD tetap aktif agar proses background tidak mati
cmd /k
