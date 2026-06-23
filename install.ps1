$ErrorActionPreference = "Stop"

$Url = "https://github.com/loveawayss/JustReleases/releases/download/justhub-v1/JustHub.exe"
$OutFile = Join-Path $env:TEMP "JustHub.exe"

Write-Host "Baixando JustHub..." -ForegroundColor Cyan

Invoke-WebRequest -Uri $Url -OutFile $OutFile -UseBasicParsing

if (!(Test-Path $OutFile)) {
    Write-Host "Falha: o instalador nao foi baixado." -ForegroundColor Red
    exit 1
}

$Size = (Get-Item $OutFile).Length

if ($Size -lt 1000000) {
    Write-Host "Falha: o arquivo baixado parece invalido ($Size bytes)." -ForegroundColor Red
    exit 1
}

Write-Host "Abrindo instalador do JustHub..." -ForegroundColor Green
Start-Process -FilePath $OutFile
