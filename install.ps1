# Instalador/atualizador remoto do JustHub para Windows.
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$installerUrl = "https://github.com/loveawayss/JustReleases/releases/download/justhub-v0.1.87/JustHUBInstaller.exe"
$expectedSha256 = "bd254c2f5c0060dc2712ef9b437f545d6bf4f2a00634727c76b5c069e05feb2c"
$tempPath = Join-Path $env:TEMP "JustHUBInstaller.exe"

Write-Host "Baixando a versao mais recente do JustHub..." -ForegroundColor Cyan

try {
    Invoke-WebRequest -Uri $installerUrl -OutFile $tempPath -UseBasicParsing
    if (-not (Test-Path -LiteralPath $tempPath)) { throw "Falha ao salvar o instalador temporario." }
    $actualSha256 = (Get-FileHash -LiteralPath $tempPath -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actualSha256 -ne $expectedSha256) { throw "Hash SHA-256 inesperado para o instalador." }
    Write-Host "Instalando/atualizando silenciosamente..." -ForegroundColor Green
    $process = Start-Process -FilePath $tempPath -ArgumentList "/S" -PassThru -Wait
    if ($process.ExitCode -ne 0) { throw "O instalador terminou com o codigo $($process.ExitCode)." }
    Remove-Item -LiteralPath $tempPath -ErrorAction SilentlyContinue
    Write-Host "JustHub instalado e atualizado com sucesso!" -ForegroundColor Green
} catch {
    Remove-Item -LiteralPath $tempPath -ErrorAction SilentlyContinue
    Write-Host "Erro ao baixar ou instalar o JustHub: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
