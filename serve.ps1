param(
  [int]$Port = 5173
)

$Root = [System.IO.Path]::GetFullPath($PSScriptRoot)
$RootWithSlash = $Root.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
$Listener = [System.Net.HttpListener]::new()
$Listener.Prefixes.Add("http://127.0.0.1:$Port/")
$Listener.Start()

Write-Host "Serving 변액보험 매니저 Pro at http://127.0.0.1:$Port/"

function Get-ContentType($Path) {
  switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    ".html" { "text/html; charset=utf-8" }
    ".css" { "text/css; charset=utf-8" }
    ".js" { "text/javascript; charset=utf-8" }
    ".json" { "application/json; charset=utf-8" }
    ".svg" { "image/svg+xml" }
    ".png" { "image/png" }
    ".jpg" { "image/jpeg" }
    ".jpeg" { "image/jpeg" }
    default { "application/octet-stream" }
  }
}

try {
  while ($Listener.IsListening) {
    $Context = $Listener.GetContext()
    $RequestPath = [Uri]::UnescapeDataString($Context.Request.Url.AbsolutePath.TrimStart("/"))
    if ([string]::IsNullOrWhiteSpace($RequestPath)) {
      $RequestPath = "index.html"
    }

    $FullPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($Root, $RequestPath))

    if (-not $FullPath.StartsWith($RootWithSlash, [System.StringComparison]::OrdinalIgnoreCase)) {
      $Context.Response.StatusCode = 403
      $Context.Response.Close()
      continue
    }

    if (-not (Test-Path -LiteralPath $FullPath -PathType Leaf)) {
      $Context.Response.StatusCode = 404
      $Context.Response.Close()
      continue
    }

    $Bytes = [System.IO.File]::ReadAllBytes($FullPath)
    $Context.Response.ContentType = Get-ContentType $FullPath
    $Context.Response.ContentLength64 = $Bytes.Length
    $Context.Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
    $Context.Response.OutputStream.Close()
  }
}
finally {
  if ($Listener.IsListening) {
    $Listener.Stop()
  }
  $Listener.Close()
}
