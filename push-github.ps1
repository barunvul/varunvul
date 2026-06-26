$ErrorActionPreference = "Stop"

Push-Location $PSScriptRoot
try {
  git push -u origin main
}
finally {
  Pop-Location
}
