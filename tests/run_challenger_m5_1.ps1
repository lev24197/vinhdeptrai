# PowerShell Runner for Milestone 5 Challenger Stress Test Suite
$ErrorActionPreference = "Stop"

$chromePath = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
if (-not (Test-Path $chromePath)) {
    $chromePath = 'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe'
}
if (-not (Test-Path $chromePath)) {
    $chromePath = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
}
if (-not (Test-Path $chromePath)) {
    $chromePath = 'C:\Program Files\Microsoft\Edge\Application\msedge.exe'
}

$htmlPath = (Resolve-Path "tests/challenger_m5_1_stress.html").Path
$fileUrl = "file:///" + $htmlPath.Replace("\", "/")
$tempDir = Join-Path $env:TEMP ("chrome_stress_m5_" + [Guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

$outputFile = Join-Path $env:TEMP "stress_m5_out.html"

try {
    Write-Host "`n====================================================" -ForegroundColor Cyan
    Write-Host "   CHALLENGER M5_1 EMPIRICAL ADVERSARIAL STRESS SUITE" -ForegroundColor Yellow
    Write-Host "====================================================" -ForegroundColor Cyan
    $proc = Start-Process -FilePath $chromePath -ArgumentList `
        "--headless=new", `
        "--disable-gpu", `
        "--no-sandbox", `
        "--allow-file-access-from-files", `
        "--disable-web-security", `
        "--user-data-dir=`"$tempDir`"", `
        "--virtual-time-budget=15000", `
        "--dump-dom", `
        "`"$fileUrl`"" `
        -NoNewWindow -Wait -PassThru -RedirectStandardOutput $outputFile

    if (Test-Path $outputFile) {
        $rawDom = Get-Content -Raw -Encoding UTF8 $outputFile
        $jsonMatch = [regex]::Match($rawDom, '<div id="results-json"[^>]*>(.*?)</div>')
        if ($jsonMatch.Success -and $jsonMatch.Groups[1].Value.Trim() -ne "") {
            $jsonStr = $jsonMatch.Groups[1].Value
            $result = $jsonStr | ConvertFrom-Json
            Write-Host "`nTest Execution Summary:" -ForegroundColor White
            Write-Host "  Total Tests:  $($result.total)" -ForegroundColor White
            Write-Host "  Passed Tests: $($result.passed)" -ForegroundColor Green
            Write-Host "  Failed Tests: $($result.failed)" -ForegroundColor $(if ($result.failed -eq 0) { "Green" } else { "Red" })
            Write-Host "  Duration:     $($result.duration) ms" -ForegroundColor DarkGray
            Write-Host "----------------------------------------------------"

            $currentSuite = ""
            foreach ($t in $result.results) {
                if ($t.suite -ne $currentSuite) {
                    $currentSuite = $t.suite
                    Write-Host "`n[$currentSuite]" -ForegroundColor Cyan
                }
                if ($t.status -eq 'PASS') {
                    Write-Host "  [PASS] $($t.desc)" -ForegroundColor Green
                } else {
                    Write-Host "  [FAIL] $($t.desc)" -ForegroundColor Red
                    Write-Host "         Error: $($t.error)" -ForegroundColor Yellow
                }
            }

            Write-Host "`n====================================================" -ForegroundColor Cyan
            if ($result.failed -eq 0) {
                Write-Host "  ALL $($result.total) CHALLENGER STRESS TESTS PASSED! (EXIT 0)  " -ForegroundColor Green
                Write-Host "====================================================`n" -ForegroundColor Cyan
                exit 0
            } else {
                Write-Host "  $($result.failed) OF $($result.total) CHALLENGER STRESS TESTS FAILED! (EXIT 1)  " -ForegroundColor Red
                Write-Host "====================================================`n" -ForegroundColor Cyan
                exit 1
            }
        } else {
            Write-Host "Failed to parse test results JSON from DOM. Raw DOM length: $($rawDom.Length)" -ForegroundColor Red
            exit 2
        }
    } else {
        Write-Host "Output file not found at $outputFile" -ForegroundColor Red
        exit 3
    }
} finally {
    if (Test-Path $tempDir) {
        Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
    }
    if (Test-Path $outputFile) {
        Remove-Item -Force $outputFile -ErrorAction SilentlyContinue
    }
}
