$ErrorActionPreference = "Stop"

$Node = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if (-not (Test-Path -LiteralPath $Node)) {
  $Node = "node"
}

Push-Location $PSScriptRoot
try {
  & $Node .\server.mjs
}
finally {
  Pop-Location
}
