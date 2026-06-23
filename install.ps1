$ErrorActionPreference = "Stop"

$Url = "https://github.com/loveawayss/JustReleases/releases/download/justhub-v1/JustHub_Setup.exe"
$OutFile = Join-Path $env:TEMP "JustHub_Setup.exe"

Write-Host "Baixando JustHub..." -ForegroundColor Cyan

try {
    Invoke-WebRequest -Uri $Url -OutFile $OutFile -UseBasicParsing
} catch {
    Write-Host "Falha ao baixar o JustHub." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

if (!(Test-Path $OutFile)) {
    Write-Host "Falha: instalador nao foi baixado." -ForegroundColor Red
    exit 1
}

$Size = (Get-Item $OutFile).Length

if ($Size -lt 1000000) {
    Write-Host "Falha: arquivo baixado parece invalido. Tamanho: $Size bytes" -ForegroundColor Red
    exit 1
}

Write-Host "Abrindo instalador do JustHub..." -ForegroundColor Green
Start-Process -FilePath $OutFile
