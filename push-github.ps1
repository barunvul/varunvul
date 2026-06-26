$ErrorActionPreference = "Stop"

Push-Location $PSScriptRoot
try {
  $gitCommand = Get-Command git -ErrorAction SilentlyContinue
  if (-not $gitCommand -and (Test-Path "C:\Program Files\Git\cmd\git.exe")) {
    $gitCommand = Get-Item "C:\Program Files\Git\cmd\git.exe"
  }

  if (-not $gitCommand) {
    Write-Host "Git was not found."
    Write-Host "Install Git for Windows, then run this script again: https://git-scm.com/download/win"
    exit 1
  }

  Write-Host "Checking GitHub remote..."
  $git = $gitCommand.Source
  $remote = & $git remote get-url origin
  Write-Host "Remote: $remote"

  Write-Host "Latest local commit:"
  & $git log --oneline -1

  Write-Host "Pushing to GitHub. If a login window opens, approve it with your GitHub account."
  & $git push -u origin main

  Write-Host ""
  Write-Host "Done. Check the repository:"
  Write-Host "https://github.com/barunvul/varunvul"
}
finally {
  Pop-Location
}
