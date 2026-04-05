@echo off
title Serik Haber Botu - Daemon
cd /d "C:\Users\MONSTER\Desktop\yapayzeka\serik-haberleri\bot"

REM Gizli anahtarları .env.bat dosyasından yükle
if exist .env.bat call .env.bat

node auto-haber.mjs --daemon
