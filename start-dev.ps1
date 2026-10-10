#Requires -Version 5.1
param([switch]$Check, [switch]$Migrate)
$ErrorActionPreference = 'Stop'
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw 'Node.js 22.12+ is required. Install it and reopen the terminal.'
}
$options = @()
if ($Check) { $options += '--check' }
if ($Migrate) { $options += '--migrate' }
& node (Join-Path $PSScriptRoot 'scripts/start-dev.mjs') @options
exit $LASTEXITCODE
