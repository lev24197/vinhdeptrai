# Runner for responsive audit
param(
  [int]$TimeoutSeconds = 20
)

$candidates = @(
  "C:\Program Files\Google\Chrome\Application\chrome.exe",
  "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
  "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
  "$env:LOCALAPPDATA\Microsoft\Edge\Application\msedge.exe"
)

$browser = $null
foreach ($c in $candidates) {
  if (Test-Path $c) { $browser = $c; break }
}

if (!$browser) { throw "Chromium not found" }

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (!$scriptDir) { $scriptDir = (Get-Location).Path }
$testHtml = Join-Path $scriptDir "tests\audit_responsive.html"
$testUrl = "file:///" + (Resolve-Path $testHtml).Path.Replace('\', '/')

$tempDir = Join-Path $env:TEMP ("anki_resp_audit_" + [System.Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

try {
  $domDumpFile = Join-Path $tempDir "dom_dump.txt"
  $stderrFile = Join-Path $tempDir "stderr.log"
  $argList = @(
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-web-security",
    "--allow-file-access-from-files",
    "--user-data-dir=$tempDir",
    "--virtual-time-budget=20000",
    "--dump-dom",
    $testUrl
  )

  $proc = Start-Process -FilePath $browser -ArgumentList $argList -NoNewWindow -Wait -PassThru -RedirectStandardOutput $domDumpFile -RedirectStandardError $stderrFile
  $dom = Get-Content $domDumpFile -Raw -Encoding utf8
  if ($dom -match '(?s)id="audit-results-json"[^>]*>(.*?)</script>') {
    $jsonRaw = $matches[1]
    Write-Host $jsonRaw
  } else {
    Write-Host "No audit JSON found in DOM"
    Write-Host $dom
  }
} finally {
  Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
}
