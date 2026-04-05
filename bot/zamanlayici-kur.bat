@echo off
echo Gorev Zamanlayicisi kuruluyor...

schtasks /create /tn "SerikHaberBot" /tr "C:\Users\MONSTER\Desktop\yapayzeka\serik-haberleri\bot\daemon-gizli.vbs" /sc onstart /ru SYSTEM /f

echo.
echo Bilgisayar her acildiginda bot otomatik baslar.
echo.
echo Simdi de hemen baslatalim...
wscript "C:\Users\MONSTER\Desktop\yapayzeka\serik-haberleri\bot\daemon-gizli.vbs"
echo.
echo TAMAMLANDI!
pause
