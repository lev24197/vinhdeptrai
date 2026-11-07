# PowerShell Runner for Challenger M6_2 Empirical Adversarial Suite
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

$htmlPath = (Resolve-Path "tests/challenger_m6_2_empirical.html").Path
$fileUrl = "file:///" + $htmlPath.Replace("\", "/")
$tempDir = Join-Path $env:TEMP ("chrome_test_m6_2_" + [Guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

$outputFile = Join-Path $env:TEMP "test_m6_2_out.html"

try {
    Write-Host "`n====================================================" -ForegroundColor Magenta
    Write-Host "   CHALLENGER M6_2 EMPIRICAL ADVERSARIAL HARNESS    " -ForegroundColor Yellow
    Write-Host "====================================================" -ForegroundColor Magenta
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
                    Write-Host "  [FAIL] $($t.desc) -> $($t.error)" -ForegroundColor Red
                }
            }

            Write-Host "`n====================================================" -ForegroundColor Magenta
            if ($result.failed -eq 0) {
                Write-Host "  ALL $($result.total) EMPIRICAL TESTS PASSED! (EXIT 0)  " -ForegroundColor Green
                Write-Host "====================================================`n" -ForegroundColor Magenta
                exit 0
            } else {
                Write-Host "  $($result.failed) TESTS FAILED! (EXIT 1)              " -ForegroundColor Red
                Write-Host "====================================================`n" -ForegroundColor Magenta
                exit 1
            }
        } else {
            Write-Host "Failed to extract JSON results from output HTML." -ForegroundColor Red
            Get-Content $outputFile | Select-Object -First 30
            exit 1
        }
    } else {
        Write-Host "Output file was not created by Chrome." -ForegroundColor Red
        exit 1
    }
} finally {
    if (Test-Path $tempDir) {
        Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path $outputFile) {
        Remove-Item -Path $outputFile -Force -ErrorAction SilentlyContinue
    }
}
