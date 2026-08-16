# Instalador/atualizador remoto do JustHub para Windows.
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$installerUrl = "https://github.com/loveawayss/JustReleases/releases/latest/download/JustHubInstaller.exe"
$expectedSha256 = "cc5838b1b36e772beebf5fef8a61082d9e7844e88b8a3963999fef9491caa735"
$tempPath = Join-Path $env:TEMP "JustHubInstaller.exe"

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
