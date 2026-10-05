@echo off
rem Wrapper so you can run "batch\checkin" from cmd/PowerShell or double-click it.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0checkin.ps1" %*
