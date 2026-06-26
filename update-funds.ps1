$ErrorActionPreference = "Stop"

$Python = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if (-not (Test-Path -LiteralPath $Python)) {
  $Python = "python"
}

Push-Location $PSScriptRoot
try {
  & $Python .\scripts\update_funds.py
}
finally {
  Pop-Location
}
