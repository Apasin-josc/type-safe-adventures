# Daily check-in: appends a line to log.md, commits it, and pushes.
# Usage: .\batch\checkin.ps1 ["optional note"]

param([string]$Note = "check-in")

$ErrorActionPreference = "Stop"
$repo = Split-Path -Parent $PSScriptRoot
$log = Join-Path $PSScriptRoot "log.md"
$stamp = Get-Date -Format "yyyy-MM-dd HH:mm"

Add-Content -Path $log -Value "- $stamp - $Note" -Encoding utf8

git -C $repo add "batch/log.md"
git -C $repo commit -m "daily check-in: $stamp"
git -C $repo push

Write-Host "Listo, cajita verde para hoy ($stamp)" -ForegroundColor Green
