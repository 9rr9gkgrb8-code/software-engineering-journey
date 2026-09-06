[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$PidFile = Join-Path $PSScriptRoot ".forge-beta.pids.json"
if (-not (Test-Path $PidFile)) {
    Write-Host "Forge beta is not recorded as running."
    exit 0
}

$Processes = Get-Content $PidFile -Raw | ConvertFrom-Json
foreach ($processId in @($Processes.web_pid, $Processes.runtime_pid)) {
    if ($processId -and (Get-Process -Id $processId -ErrorAction SilentlyContinue)) {
        & taskkill.exe /PID $processId /T /F | Out-Null
    }
}
Remove-Item $PidFile -Force
Write-Host "Forge family beta stopped. Local progress and beta secrets were preserved."
