# ==============================================================================
# Milestone 2 Adversarial Stress Test Runner - Challenger 2
# File: run_test_challenger2.ps1
# ==============================================================================

[CmdletBinding()]
param(
  [string]$BrowserPath = "",
  [int]$TimeoutSeconds = 10
)

$ErrorActionPreference = "Stop"

function Find-ChromiumBrowser {
  if ($BrowserPath -and (Test-Path $BrowserPath)) {
    return (Resolve-Path $BrowserPath).Path
  }
  $candidates = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "$env:LOCALAPPDATA\Microsoft\Edge\Application\msedge.exe"
  )
  foreach ($c in $candidates) {
    if (Test-Path $c) { return (Resolve-Path $c).Path }
  }
  throw "No compatible Chromium browser found."
}

$browser = Find-ChromiumBrowser
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (!$scriptDir) { $scriptDir = (Get-Location).Path }

$testHtmlPath = Join-Path $scriptDir "tests\test_m2_adversarial_challenger2.html"
$testUrl = "file:///" + (Resolve-Path $testHtmlPath).Path.Replace('\', '/')
$tempDir = Join-Path $env:TEMP ("anki_m2_challenger2_" + [System.Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

try {
  $domDumpFile = Join-Path $tempDir "dom_dump.txt"
  $virtualBudgetMs = $TimeoutSeconds * 1000
  $cmdArgs = "--headless=new --disable-web-security --allow-file-access-from-files --user-data-dir=`"$tempDir`" --virtual-time-budget=$virtualBudgetMs --dump-dom `"$testUrl`""

  cmd /c "`"$browser`" $cmdArgs > `"$domDumpFile`" 2>&1"
  $dom = Get-Content $domDumpFile -Raw -Encoding utf8

  if ($dom -match '(?s)id="test-output-json"[^>]*>(.*?)</script>') {
    $results = $matches[1] | ConvertFrom-Json
    Write-Host "`n========================================================" -ForegroundColor Cyan
    Write-Host " MILESTONE 2 EMPIRICAL ADVERSARIAL STRESS TEST RESULTS" -ForegroundColor Yellow
    Write-Host "========================================================" -ForegroundColor Cyan
    Write-Host " Total Tests:  $($results.total)" -ForegroundColor White
    Write-Host " Passed Tests: $($results.passed)" -ForegroundColor Green
    Write-Host " Failed Tests: $($results.failed)" -ForegroundColor $(if ($results.failed -eq 0) { "Green" } else { "Red" })
    Write-Host "--------------------------------------------------------" -ForegroundColor DarkGray

    foreach ($t in $results.tests) {
      if ($t.passed) {
        Write-Host " [PASS] $($t.name)" -ForegroundColor Green
      } else {
        Write-Host " [FAIL] $($t.name) - $($t.error)" -ForegroundColor Red
      }
    }
    Write-Host "========================================================`n" -ForegroundColor Cyan

    if ($results.failed -gt 0) { exit 1 } else { exit 0 }
  } else {
    Write-Host "Failed to extract test output from DOM." -ForegroundColor Red
    Write-Host "Raw output snippet:" -ForegroundColor Yellow
    Write-Host ($dom.Substring(0, [Math]::Min(500, $dom.Length)))
    exit 1
  }
} finally {
  Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
}
