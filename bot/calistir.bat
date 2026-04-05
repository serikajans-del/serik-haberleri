@echo off
cd /d "C:\Users\MONSTER\Desktop\yapayzeka\serik-haberleri\bot"

REM Gizli anahtarları .env.bat dosyasından yükle
if exist .env.bat call .env.bat

node auto-haber.mjs
