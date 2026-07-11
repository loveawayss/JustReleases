# Script de Instalação/Atualização Remota do JustHub para o Cliente Final
# Funciona em qualquer Windows, mesmo recém-formatado (não precisa de Node.js, Rust ou Git)

# Forçar codificação UTF-8 no console para acentos
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# URL direta do executável instalador no GitHub
$installerUrl = "https://raw.githubusercontent.com/loveawayss/JustHubRelease/main/releases/justhub-setup.exe"
$tempPath = "$env:TEMP\justhub-setup.exe"

Write-Host "📥 Baixando a versão mais recente do JustHub..." -ForegroundColor Cyan

try {
    # Baixar o instalador direto do link
    Invoke-WebRequest -Uri $installerUrl -OutFile $tempPath -UseBasicParsing
    
    if (Test-Path $tempPath) {
        Write-Host "🚀 Instalando/Atualizando silenciosamente..." -ForegroundColor Green
        # Executa o instalador em segundo plano com o argumento /S (Silent)
        $process = Start-Process -FilePath $tempPath -ArgumentList "/S" -PassThru -Wait
        
        # Remover instalador temporário
        Remove-Item $tempPath -ErrorAction SilentlyContinue
        
        Write-Host "✅ JustHub instalado e atualizado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro: Falha ao salvar o instalador temporário." -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erro ao baixar o JustHub. Verifique sua conexão com a internet." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
}
