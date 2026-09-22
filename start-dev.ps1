#Requires -Version 5.1
<#
  SpecHub dev indító: Postgres (Docker) + .NET backend + Vite frontend.
  Használat:  .\start-dev.ps1
  Leállítás:  a két új ablakot csukd be, majd: docker compose stop
#>
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

function Require-Command($name) {
  Write-Host "  ellenőrzés: $name ... " -NoNewline
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    Write-Host 'HIÁNYZIK' -ForegroundColor Red
    throw "'$name' nem található a PATH-ban. Telepítsd, majd próbáld újra."
  }
  Write-Host 'OK' -ForegroundColor Green
}

Write-Host '[1/5] Előfeltételek ellenőrzése...' -ForegroundColor Cyan
Require-Command docker
Require-Command dotnet
Require-Command npm

Write-Host '[2/5] .env fájlok ellenőrzése...' -ForegroundColor Cyan
if (-not (Test-Path .env)) {
  Write-Host '  .env hiányzik, másolom .env.example-ból'
  Copy-Item .env.example .env
} else { Write-Host '  .env OK' -ForegroundColor Green }
if (-not (Test-Path frontend\.env)) {
  Write-Host '  frontend\.env hiányzik, másolom .env.example-ból'
  Copy-Item frontend\.env.example frontend\.env
} else { Write-Host '  frontend\.env OK' -ForegroundColor Green }

Write-Host '[3/5] Postgres indítása (Docker, localhost:5432)...' -ForegroundColor Cyan
docker compose up -d db
if ($LASTEXITCODE -ne 0) { throw 'A `docker compose up -d db` hibával leállt.' }

Write-Host '[4/5] Várakozás a Postgres-re (healthcheck, max 60 mp)...' -ForegroundColor Cyan
$status = ''
$deadline = (Get-Date).AddSeconds(60)
$attempt = 0
do {
  Start-Sleep 2
  $attempt++
  $status = docker inspect --format '{{.State.Health.Status}}' spechub-db 2>$null
  Write-Host "  próba $attempt : status=$status"
} while ($status -ne 'healthy' -and (Get-Date) -lt $deadline)
if ($status -ne 'healthy') { throw 'A Postgres nem lett healthy 60 mp alatt.' }
Write-Host '  Postgres: healthy (localhost:5432)' -ForegroundColor Green

Write-Host '[5/5] Backend + frontend indítása külön ablakokban...' -ForegroundColor Cyan
if (-not (Test-Path frontend\node_modules)) {
  Write-Host '  frontend\node_modules hiányzik, npm install...'
  npm install --prefix frontend
  if ($LASTEXITCODE -ne 0) { throw 'Az `npm install` hibával leállt.' }
} else { Write-Host '  frontend\node_modules OK' -ForegroundColor Green }

Write-Host '  Backend indítása új ablakban -> http://localhost:5117'
Start-Process powershell -ArgumentList '-NoExit','-Command',"cd '$PSScriptRoot'; dotnet run --project backend\SpecHub.Api"
Write-Host '  Frontend indítása új ablakban -> http://localhost:5173'
Start-Process powershell -ArgumentList '-NoExit','-Command',"cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host ''
Write-Host '============================================' -ForegroundColor Green
Write-Host ' Minden elindult:' -ForegroundColor Green
Write-Host '  Postgres : localhost:5432 (db=spechub)' -ForegroundColor Green
Write-Host '  Backend  : http://localhost:5117' -ForegroundColor Green
Write-Host '             http://localhost:5117/api/health' -ForegroundColor Green
Write-Host '             http://localhost:5117/openapi/v1.json' -ForegroundColor Green
Write-Host '             http://localhost:5117/swagger' -ForegroundColor Green
Write-Host '  Frontend : http://localhost:5173' -ForegroundColor Green
Write-Host '============================================' -ForegroundColor Green
Write-Host 'Leállítás: csukd be a két új ablakot, majd: docker compose stop'
