# Instalador/atualizador remoto do Just HUB para Windows.
[CmdletBinding()]
param(
    [switch]$ValidateOnly
)

Set-StrictMode -Version Latest
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

$manifestUri = [Uri]::new(
    "https://raw.githubusercontent.com/loveawayss/JustReleases/main/update_info.json"
)
$maximumManifestBytes = 64KB
$maximumInstallerBytes = 256MB
$temporaryRoot = $null

function Save-BoundedDownload {
    param(
        [Parameter(Mandatory = $true)][Uri]$Uri,
        [Parameter(Mandatory = $true)][string]$Destination,
        [Parameter(Mandatory = $true)][long]$MaximumBytes
    )

    Add-Type -AssemblyName System.Net.Http
    $handler = [System.Net.Http.HttpClientHandler]::new()
    $handler.AllowAutoRedirect = $true
    $handler.MaxAutomaticRedirections = 5
    $client = [System.Net.Http.HttpClient]::new($handler)
    $client.Timeout = [TimeSpan]::FromMinutes(3)
    $response = $null
    $inputStream = $null
    $outputStream = $null

    try {
        $response = $client.GetAsync(
            $Uri,
            [System.Net.Http.HttpCompletionOption]::ResponseHeadersRead
        ).GetAwaiter().GetResult()
        $null = $response.EnsureSuccessStatusCode()

        $finalUri = $response.RequestMessage.RequestUri
        $trustedFinalHost = (
            $finalUri.DnsSafeHost -eq "github.com" -or
            $finalUri.DnsSafeHost -eq "raw.githubusercontent.com" -or
            $finalUri.DnsSafeHost.EndsWith(
                ".githubusercontent.com",
                [StringComparison]::OrdinalIgnoreCase
            )
        )
        if ($finalUri.Scheme -ne "https" -or -not $trustedFinalHost) {
            throw "O download foi redirecionado para uma origem não confiável."
        }

        $declaredLength = $response.Content.Headers.ContentLength
        if ($null -ne $declaredLength -and $declaredLength -gt $MaximumBytes) {
            throw "O arquivo remoto excede o tamanho permitido."
        }

        $inputStream = $response.Content.ReadAsStreamAsync().GetAwaiter().GetResult()
        $outputStream = [System.IO.FileStream]::new(
            $Destination,
            [System.IO.FileMode]::CreateNew,
            [System.IO.FileAccess]::Write,
            [System.IO.FileShare]::None,
            81920,
            [System.IO.FileOptions]::WriteThrough
        )
        $buffer = [byte[]]::new(81920)
        [long]$totalBytes = 0

        while (($bytesRead = $inputStream.Read($buffer, 0, $buffer.Length)) -gt 0) {
            $totalBytes += $bytesRead
            if ($totalBytes -gt $MaximumBytes) {
                throw "O arquivo remoto excede o tamanho permitido."
            }
            $outputStream.Write($buffer, 0, $bytesRead)
        }
        $outputStream.Flush($true)
        if ($totalBytes -eq 0) {
            throw "O servidor retornou um arquivo vazio."
        }
    }
    finally {
        if ($null -ne $outputStream) { $outputStream.Dispose() }
        if ($null -ne $inputStream) { $inputStream.Dispose() }
        if ($null -ne $response) { $response.Dispose() }
        $client.Dispose()
        $handler.Dispose()
    }
}

function Assert-ExactProperties {
    param(
        [Parameter(Mandatory = $true)][object]$Value,
        [Parameter(Mandatory = $true)][string[]]$Expected
    )

    $actualProperties = @($Value.PSObject.Properties.Name | Sort-Object)
    $expectedProperties = @($Expected | Sort-Object)
    $difference = Compare-Object $actualProperties $expectedProperties
    if ($null -ne $difference) {
        throw "O manifesto possui campos ausentes ou não permitidos."
    }
}

function Assert-InstallerUri {
    param(
        [Parameter(Mandatory = $true)][string]$Value,
        [Parameter(Mandatory = $true)][string]$Version
    )

    $uri = $null
    if (-not [Uri]::TryCreate($Value, [UriKind]::Absolute, [ref]$uri)) {
        throw "A URL do instalador é inválida."
    }
    if (
        $uri.Scheme -ne "https" -or
        $uri.DnsSafeHost -ne "github.com" -or
        -not $uri.IsDefaultPort -or
        $uri.UserInfo -or
        $uri.Query -or
        $uri.Fragment
    ) {
        throw "A origem do instalador não é permitida."
    }

    $expectedPath = (
        "/loveawayss/JustReleases/releases/download/" +
        "justhub-v$Version/JustHUBInstaller.exe"
    )
    if ($uri.AbsolutePath -cne $expectedPath) {
        throw "A URL não corresponde à versão e ao instalador esperados."
    }
    return $uri
}

try {
    $temporaryBase = [System.IO.Path]::GetFullPath(
        [System.IO.Path]::GetTempPath()
    )
    $temporaryRoot = Join-Path (
        $temporaryBase
    ) ("JustHUB-" + [Guid]::NewGuid().ToString("N"))
    [System.IO.Directory]::CreateDirectory($temporaryRoot) | Out-Null
    if (
        ((Get-Item -LiteralPath $temporaryRoot).Attributes -band
            [System.IO.FileAttributes]::ReparsePoint) -ne 0
    ) {
        throw "A pasta temporária não é segura."
    }

    $manifestPath = Join-Path $temporaryRoot "update_info.json"
    $installerPath = Join-Path $temporaryRoot "JustHUBInstaller.exe"

    Write-Host "Consultando a versão mais recente do Just HUB..." -ForegroundColor Cyan
    Save-BoundedDownload $manifestUri $manifestPath $maximumManifestBytes
    $updateInfo = Get-Content -Raw -LiteralPath $manifestPath |
        ConvertFrom-Json

    Assert-ExactProperties $updateInfo @(
        "version",
        "notes",
        "downloadUrl",
        "sha256"
    )
    if ($updateInfo.version -notmatch "^\d+\.\d+\.\d+$") {
        throw "A versão informada pelo manifesto é inválida."
    }
    if (
        $updateInfo.sha256 -isnot [string] -or
        $updateInfo.sha256 -notmatch "^[a-fA-F0-9]{64}$"
    ) {
        throw "O SHA-256 informado pelo manifesto é inválido."
    }
    if (
        $updateInfo.notes -isnot [System.Array] -or
        $updateInfo.notes.Count -eq 0
    ) {
        throw "As notas da versão são inválidas."
    }

    $version = [string]$updateInfo.version
    $expectedSha256 = ([string]$updateInfo.sha256).ToLowerInvariant()
    $installerUri = Assert-InstallerUri ([string]$updateInfo.downloadUrl) $version

    if ($ValidateOnly) {
        Write-Host "Manifesto do Just HUB validado com sucesso." -ForegroundColor Green
        return
    }

    Write-Host "Baixando o Just HUB..." -ForegroundColor Cyan
    Save-BoundedDownload $installerUri $installerPath $maximumInstallerBytes

    $actualSha256 = (
        Get-FileHash -LiteralPath $installerPath -Algorithm SHA256
    ).Hash.ToLowerInvariant()
    if ($actualSha256 -ne $expectedSha256) {
        throw "Hash SHA-256 inconsistente para o instalador."
    }

    Write-Host "Instalando ou atualizando..." -ForegroundColor Green
    $startParameters = @{
        FilePath = $installerPath
        ArgumentList = @("/S")
        PassThru = $true
        Wait = $true
    }
    $process = Start-Process @startParameters
    if ($process.ExitCode -ne 0) {
        throw "O instalador terminou com o código $($process.ExitCode)."
    }

    Write-Host "Just HUB instalado com sucesso." -ForegroundColor Green
}
catch {
    Write-Host (
        "Erro ao baixar ou instalar o Just HUB: " +
        $_.Exception.Message
    ) -ForegroundColor Red
    exit 1
}
finally {
    if ($null -ne $temporaryRoot) {
        $resolvedRoot = [System.IO.Path]::GetFullPath($temporaryRoot)
        $resolvedBase = [System.IO.Path]::GetFullPath(
            [System.IO.Path]::GetTempPath()
        )
        $safeName = [System.IO.Path]::GetFileName($resolvedRoot) -match (
            "^JustHUB-[a-f0-9]{32}$"
        )
        if (
            $safeName -and
            $resolvedRoot.StartsWith(
                $resolvedBase,
                [StringComparison]::OrdinalIgnoreCase
            ) -and
            (Test-Path -LiteralPath $resolvedRoot)
        ) {
            Remove-Item -LiteralPath $resolvedRoot -Recurse -Force
        }
    }
}
