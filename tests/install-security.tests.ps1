$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$installerScript = Join-Path $repoRoot "install.ps1"
$tokens = $null
$errors = $null
$ast = [System.Management.Automation.Language.Parser]::ParseFile(
    $installerScript,
    [ref]$tokens,
    [ref]$errors
)
if ($errors.Count -ne 0) {
    throw "install.ps1 possui erro de sintaxe."
}

$functions = $ast.FindAll(
    {
        param($node)
        $node -is [System.Management.Automation.Language.FunctionDefinitionAst]
    },
    $true
)
foreach ($function in $functions) {
    Invoke-Expression $function.Extent.Text
}

function Assert-Rejected {
    param(
        [Parameter(Mandatory = $true)][scriptblock]$Action,
        [Parameter(Mandatory = $true)][string]$Case
    )

    try {
        & $Action | Out-Null
    }
    catch {
        return
    }
    throw "Entrada insegura aceita: $Case"
}

$validUri = (
    "https://github.com/loveawayss/JustReleases/releases/download/" +
    "justhub-v0.1.89/JustHUBInstaller.exe"
)
$resolved = Assert-InstallerUri $validUri "0.1.89"
if ($resolved.AbsoluteUri -ne $validUri) {
    throw "A URL oficial foi alterada durante a validação."
}

Assert-Rejected -Action {
    Assert-InstallerUri (
        $validUri.Replace("github.com/", "github.com.example/")
    )
} -Case "host semelhante"
Assert-Rejected -Action {
    Assert-InstallerUri ($validUri + "?download=1") "0.1.89"
} -Case "query string"
Assert-Rejected -Action {
    Assert-InstallerUri (
        $validUri.Replace("justhub-v0.1.89", "justhub-v9.9.9")
    )
} -Case "tag divergente"
Assert-Rejected -Action {
    Assert-InstallerUri (
        $validUri.Replace("/download/", "/download%2F")
    ) "0.1.89"
} -Case "separador codificado"
Assert-Rejected -Action {
    Assert-InstallerUri (
        $validUri.Replace("JustHUBInstaller.exe", "../payload.exe")
    )
} -Case "caminho divergente"
Assert-Rejected -Action {
    $manifest = [pscustomobject]@{
        version = "0.1.89"
        notes = @("ok")
        downloadUrl = $validUri
        sha256 = ("a" * 64)
        arguments = @("/unsafe")
    }
    Assert-ExactProperties $manifest @(
        "version",
        "notes",
        "downloadUrl",
        "sha256"
    )
} -Case "argumentos remotos"

Write-Output "PowerShell installer security tests passed."
