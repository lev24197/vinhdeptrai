# PowerShell Runner for Milestone 5 Quests, Achievements, Biomes & Monster Sprites Test Suite
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

$htmlPath = (Resolve-Path "tests/test_milestone5_quests.html").Path
$fileUrl = "file:///" + $htmlPath.Replace("\", "/")
$tempDir = Join-Path $env:TEMP ("chrome_test_m5_" + [Guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

$outputFile = Join-Path $env:TEMP "test_m5_out.html"

try {
    Write-Host "`n====================================================" -ForegroundColor Cyan
    Write-Host "   MILESTONE 5 QUESTS & SPRITES TEST HARNESS       " -ForegroundColor Yellow
    Write-Host "====================================================" -ForegroundColor Cyan
    $proc = Start-Process -FilePath $chromePath -ArgumentList `
        "--headless=new", `
        "--disable-gpu", `
        "--no-sandbox", `
        "--allow-file-access-from-files", `
        "--disable-web-security", `
        "--user-data-dir=`"$tempDir`"", `
        "--virtual-time-budget=10000", `
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
                    Write-Host "  [FAIL] $($t.desc) -> $($t.error)" -ForegroundColor Red
                }
            }

            Write-Host "`n====================================================" -ForegroundColor Cyan
            if ($result.failed -eq 0) {
                Write-Host "  ALL $($result.total) MILESTONE 5 TESTS PASSED! (EXIT 0)  " -ForegroundColor Green
                Write-Host "====================================================`n" -ForegroundColor Cyan
                exit 0
            } else {
                Write-Host "  FAILURES DETECTED: $($result.failed) TESTS FAILED! (EXIT 1)   " -ForegroundColor Red
                Write-Host "====================================================`n" -ForegroundColor Cyan
                exit 1
            }
        } else {
            Write-Host "Could not find results-json in DOM output." -ForegroundColor Red
            exit 2
        }
    } else {
        Write-Host "Output file was not generated." -ForegroundColor Red
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
