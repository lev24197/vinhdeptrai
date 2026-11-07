# ==============================================================================
# The Anki Dictionary & RPG Arena - Automated Headless Verification Runner
# File: run_verification.ps1
# ==============================================================================

[CmdletBinding()]
param(
  [string]$BrowserPath = "",
  [int]$TimeoutSeconds = 12
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "   ANKI RPG GAMIFICATION - PROGRAMMATIC VERIFICATION RUNNER (HEADLESS AUDIT)     " -ForegroundColor Yellow
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Locate Chromium Browser (Chrome or Edge)
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
    if (Test-Path $c) {
      return (Resolve-Path $c).Path
    }
  }

  throw "No compatible Chromium browser found (Chrome or Edge). Please supply -BrowserPath."
}

$browser = Find-ChromiumBrowser
Write-Host " Using Chromium Browser: " -ForegroundColor DarkGray -NoNewline
Write-Host "$browser" -ForegroundColor White

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (!$scriptDir) { $scriptDir = (Get-Location).Path }

$testHtmlPath = Join-Path $scriptDir "tests\run_verification.html"
if (!(Test-Path $testHtmlPath)) {
  throw "Verification test harness not found at: $testHtmlPath"
}
$testUrl = "file:///" + (Resolve-Path $testHtmlPath).Path.Replace('\', '/')

# Create isolated temporary user profile directory to avoid process singleton lock collisions
$tempDir = Join-Path $env:TEMP ("anki_verification_session_" + [System.Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

$exitCode = 0

try {
  Write-Host "`n🚀 Executing Programmatic Verification Test Suite in Headless Chromium..." -ForegroundColor Cyan
  $domDumpFile = Join-Path $tempDir "dom_dump.txt"
  $stderrFile = Join-Path $tempDir "chrome_stderr.log"

  $virtualBudgetMs = if ($TimeoutSeconds -gt 0) { [Math]::Max(10000, $TimeoutSeconds * 1000) } else { 10000 }
  $argList = @(
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-background-networking",
    "--disable-component-update",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-web-security",
    "--allow-file-access-from-files",
    "--user-data-dir=$tempDir",
    "--virtual-time-budget=$virtualBudgetMs",
    "--dump-dom",
    $testUrl
  )

  $proc = Start-Process -FilePath $browser -ArgumentList $argList -NoNewWindow -Wait -PassThru -RedirectStandardOutput $domDumpFile -RedirectStandardError $stderrFile

  if (!(Test-Path $domDumpFile) -or (Get-Item $domDumpFile).Length -eq 0) {
    throw "Headless browser produced empty output. Check permissions or browser installation."
  }

  $dom = Get-Content $domDumpFile -Raw -Encoding utf8

  # Extract JSON test results
  if ($dom -match '(?s)id="test-output-json"[^>]*>(.*?)</script>') {
    $jsonRaw = $matches[1]
    $results = $jsonRaw | ConvertFrom-Json

    Write-Host "`n--------------------------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host " TEST EXECUTION SUMMARY" -ForegroundColor Yellow
    Write-Host "--------------------------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host " Total Tests:  " -NoNewline; Write-Host "$($results.total)" -ForegroundColor White
    Write-Host " Passed Tests: " -NoNewline; Write-Host "$($results.passed)" -ForegroundColor Green
    
    $failedColor = if ($results.failed -eq 0) { "Green" } else { "Red" }
    Write-Host " Failed Tests: " -NoNewline; Write-Host "$($results.failed)" -ForegroundColor $failedColor
    Write-Host " Pass Rate:    " -NoNewline; Write-Host "$($results.passRate)" -ForegroundColor $failedColor
    Write-Host " Duration:     " -NoNewline; Write-Host "$($results.durationMs) ms" -ForegroundColor DarkGray
    Write-Host "--------------------------------------------------------------------------------`n" -ForegroundColor DarkGray

    # Print breakdown per suite
    foreach ($suiteKey in $results.suites.PSObject.Properties.Name) {
      $s = $results.suites.$suiteKey
      $suiteColor = if ($s.failed -eq 0) { "Green" } else { "Red" }
      $suiteMark = if ($s.failed -eq 0) { "[PASS]" } else { "[FAIL]" }

      Write-Host " $suiteMark $suiteKey ($($s.passed)/$($s.total) passed)" -ForegroundColor $suiteColor
      foreach ($test in $s.tests) {
        if ($test.passed) {
          Write-Host "     + $($test.name) ($($test.durationMs)ms)" -ForegroundColor DarkGreen
        } else {
          Write-Host "     - $($test.name) ($($test.durationMs)ms)" -ForegroundColor Red
          Write-Host "         Error: $($test.error)" -ForegroundColor DarkRed
        }
      }
    }

    if ($results.failed -gt 0) {
      $exitCode = 1
    }
  } else {
    Write-Host "❌ Failed to extract test results from browser DOM dump." -ForegroundColor Red
    $exitCode = 1
  }

  # Check Frame Audit for Console Zero-Exception status
  Write-Host "`n🚀 Browser Console Zero-Exception Audit Status..." -ForegroundColor Cyan
  if ($dom -match 'id="frame-audit-results"[^>]*>(.*?)</div>') {
    $auditRaw = $matches[1].Trim()
    if ([string]::IsNullOrWhiteSpace($auditRaw)) {
      Write-Host "   ❌ [frame-audit-results] is EMPTY! Dynamic frame audit failed to execute." -ForegroundColor Red
      $exitCode = 1
    } else {
      try {
        $auditData = $auditRaw | ConvertFrom-Json
        $bLoaded = [bool]($auditData.battle -and $auditData.battle.loaded)
        $iLoaded = [bool]($auditData.index -and $auditData.index.loaded)
        $bCount = if ($auditData.battle -and ($null -ne $auditData.battle.errors)) { [int]$auditData.battle.errors.Count } else { -1 }
        $iCount = if ($auditData.index -and ($null -ne $auditData.index.errors)) { [int]$auditData.index.errors.Count } else { -1 }
        $bErrors = if ($auditData.battle) { @($auditData.battle.errors) } else { @() }
        $iErrors = if ($auditData.index) { @($auditData.index.errors) } else { @() }

        Write-Host "   • [battle.html]: " -NoNewline
        if ($bLoaded -and $bCount -eq 0) {
          Write-Host "0 uncaught exceptions (Loaded: $bLoaded) [PASS]" -ForegroundColor Green
        } else {
          Write-Host "$bCount uncaught exceptions (Loaded: $bLoaded) [FAIL]" -ForegroundColor Red
          if ($bErrors -and $bErrors.Count -gt 0) {
            foreach ($err in $bErrors) {
              Write-Host "       ! $($err.message) ($($err.filename):$($err.lineno))" -ForegroundColor DarkRed
            }
          }
          $exitCode = 1
        }

        Write-Host "   • [index.html]:  " -NoNewline
        if ($iLoaded -and $iCount -eq 0) {
          Write-Host "0 uncaught exceptions (Loaded: $iLoaded) [PASS]" -ForegroundColor Green
        } else {
          Write-Host "$iCount uncaught exceptions (Loaded: $iLoaded) [FAIL]" -ForegroundColor Red
          if ($iErrors -and $iErrors.Count -gt 0) {
            foreach ($err in $iErrors) {
              Write-Host "       ! $($err.message) ($($err.filename):$($err.lineno))" -ForegroundColor DarkRed
            }
          }
          $exitCode = 1
        }
      } catch {
        Write-Host "   ❌ Failed to parse JSON from frame-audit-results: $_" -ForegroundColor Red
        $exitCode = 1
      }
    }
  } else {
    Write-Host "   ❌ [frame-audit-results] node NOT found in DOM dump!" -ForegroundColor Red
    $exitCode = 1
  }

  # Inspect browser stderr for fatal JavaScript errors
  if (Test-Path $stderrFile) {
    $stderrContent = Get-Content $stderrFile -Raw -Encoding utf8
    if ($stderrContent) {
      $fatalMatches = [regex]::Matches($stderrContent, '(?i)(uncaught\s+(?:referenceerror|typeerror|syntaxerror|error):[^\r\n]*)')
      if ($fatalMatches.Count -gt 0) {
        Write-Host "`n⚠️ Detected uncaught runtime exceptions in browser stderr stream:" -ForegroundColor Red
        foreach ($fm in $fatalMatches) {
          Write-Host "   ! $($fm.Value)" -ForegroundColor DarkRed
        }
        $exitCode = 1
      }
    }
  }

} finally {
  # Clean up temporary profile session
  Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
}

Write-Host "`n================================================================================" -ForegroundColor Cyan
if ($exitCode -eq 0) {
  Write-Host "  ALL VERIFICATION TESTS AND AUDITS PASSED WITH ZERO FAILURES! (EXIT 0)         " -ForegroundColor Green
} else {
  Write-Host "  VERIFICATION SUITE FAILED! (EXIT 1)                                           " -ForegroundColor Red
}
Write-Host "================================================================================`n" -ForegroundColor Cyan

exit $exitCode
