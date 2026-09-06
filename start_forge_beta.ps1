[CmdletBinding()]
param(
    [switch]$SkipTests,
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$Root = $PSScriptRoot
$Web = Join-Path $Root "web"
$SecretFile = Join-Path $Root ".forge-beta.env.json"
$PidFile = Join-Path $Root ".forge-beta.pids.json"
$RuntimeLog = Join-Path $Root ".forge-beta-runtime.log"
$RuntimeErrorLog = Join-Path $Root ".forge-beta-runtime-error.log"
$WebLog = Join-Path $Root ".forge-beta-web.log"
$WebErrorLog = Join-Path $Root ".forge-beta-web-error.log"

function New-ForgeSecret {
    $bytes = New-Object byte[] 32
    $generator = [Security.Cryptography.RandomNumberGenerator]::Create()
    try { $generator.GetBytes($bytes) } finally { $generator.Dispose() }
    return [Convert]::ToBase64String($bytes).TrimEnd("=").Replace("+", "-").Replace("/", "_")
}

function Require-Command([string]$Name) {
    $command = Get-Command $Name -ErrorAction SilentlyContinue
    if (-not $command) { throw "Required command '$Name' was not found in PATH." }
    return $command.Source
}

if (Test-Path $PidFile) {
    throw "Forge beta may already be running. Run .\stop_forge_beta.ps1 first."
}

$Python = Require-Command "python"
$Npm = Require-Command "npm.cmd"

if (Test-Path $SecretFile) {
    $Secrets = Get-Content $SecretFile -Raw | ConvertFrom-Json
    if (-not $Secrets.family_key -or -not $Secrets.runtime_key) { throw "The beta secret file is invalid. Delete it and run this launcher again." }
} else {
    $Secrets = [ordered]@{ family_key = New-ForgeSecret; runtime_key = New-ForgeSecret }
    $Secrets | ConvertTo-Json | Set-Content -Path $SecretFile -Encoding UTF8
}

$env:FORGE_FAMILY_KEY = $Secrets.family_key
$env:FORGE_RUNTIME_KEY = $Secrets.runtime_key
$env:FORGE_RUNTIME_URL = "http://127.0.0.1:8780"

if (-not $SkipTests) {
    Push-Location $Root
    try { & $Python -m unittest -q; if ($LASTEXITCODE -ne 0) { throw "Python tests failed." } }
    finally { Pop-Location }
    Push-Location $Web
    try {
        if (-not (Test-Path (Join-Path $Web "node_modules"))) { & $Npm ci; if ($LASTEXITCODE -ne 0) { throw "npm install failed." } }
        & $Npm test; if ($LASTEXITCODE -ne 0) { throw "Web tests failed." }
    } finally { Pop-Location }
}

$Runtime = Start-Process -FilePath $Python -ArgumentList "forge_runtime_http.py" -WorkingDirectory $Root -RedirectStandardOutput $RuntimeLog -RedirectStandardError $RuntimeErrorLog -PassThru
try {
    $healthy = $false
    foreach ($attempt in 1..20) {
        try { $health = Invoke-RestMethod -Uri "http://127.0.0.1:8780/health" -TimeoutSec 1; if ($health.protocol_version -eq "forge-runtime-v1") { $healthy = $true; break } }
        catch { Start-Sleep -Milliseconds 250 }
    }
    if (-not $healthy) { throw "Forge runtime did not become healthy. Check $RuntimeLog" }

    $WebProcess = Start-Process -FilePath $Npm -ArgumentList "run", "dev:network" -WorkingDirectory $Web -RedirectStandardOutput $WebLog -RedirectStandardError $WebErrorLog -PassThru
    [ordered]@{ runtime_pid = $Runtime.Id; web_pid = $WebProcess.Id } | ConvertTo-Json | Set-Content -Path $PidFile -Encoding UTF8

    $address = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } | Select-Object -First 1 -ExpandProperty IPAddress
    Write-Host ""
    Write-Host "Forge family beta is starting." -ForegroundColor Green
    Write-Host "This PC: http://localhost:3000"
    if ($address) { Write-Host "Family devices: http://${address}:3000" }
    Write-Host "Family access code: $($Secrets.family_key)" -ForegroundColor Yellow
    Write-Host "Keep the runtime key private. Use .\stop_forge_beta.ps1 when testing ends."
    if (-not $NoBrowser) { Start-Sleep -Seconds 2; Start-Process "http://localhost:3000" }
} catch {
    if ($Runtime -and -not $Runtime.HasExited) { Stop-Process -Id $Runtime.Id -Force }
    throw
}
