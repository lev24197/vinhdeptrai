# Run Milestone 1 Stress Harness via Headless Chrome
$ErrorActionPreference = "Stop"

$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (!(Test-Path $chromePath)) {
  $chromePath = "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (!$scriptDir) { $scriptDir = (Get-Location).Path }

$htmlPath = Join-Path $scriptDir "m1_stress_harness.html"
$fileUrl = "file:///" + (Resolve-Path $htmlPath).Path.Replace("\", "/")

$outputHtml = Join-Path $scriptDir "m1_stress_output.html"

Write-Host "Executing Milestone 1 Stress Harness in Headless Chrome..." -ForegroundColor Cyan
Write-Host "Target: $fileUrl" -ForegroundColor DarkGray

$proc = Start-Process -FilePath $chromePath `
  -ArgumentList "--headless=new", "--disable-gpu", "--no-sandbox", "--allow-file-access-from-files", "--virtual-time-budget=5000", "--dump-dom", "$fileUrl" `
  -NoNewWindow -Wait -RedirectStandardOutput $outputHtml -PassThru

if (Test-Path $outputHtml) {
  $raw = Get-Content -Raw $outputHtml
  # Extract pre content
  if ($raw -match '<pre id="output">([\s\S]*?)</pre>') {
    Write-Host ""
    Write-Host "=================== STRESS HARNESS OUTPUT ===================" -ForegroundColor Yellow
    Write-Host $matches[1] -ForegroundColor White
    Write-Host "=============================================================" -ForegroundColor Yellow
  } else {
    Write-Host "Could not find pre output block in DOM dump." -ForegroundColor Red
  }
} else {
  Write-Host "Output file not generated." -ForegroundColor Red
}
