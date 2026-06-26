$ErrorActionPreference = "Stop"

Push-Location $PSScriptRoot
try {
  if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git was not found."
    Write-Host "Install Git for Windows, then run this script again: https://git-scm.com/download/win"
    exit 1
  }

  Write-Host "Checking GitHub remote..."
  $remote = git remote get-url origin
  Write-Host "Remote: $remote"

  Write-Host "Pushing to GitHub. If a login window opens, approve it with your GitHub account."
  git push -u origin main

  Write-Host ""
  Write-Host "Done. Check the repository:"
  Write-Host "https://github.com/barunvul/varunvul"
}
finally {
  Pop-Location
}
