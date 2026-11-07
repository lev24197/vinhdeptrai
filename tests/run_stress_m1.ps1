# PowerShell Runner for Challenger M1 Stress Test Suite
$ErrorActionPreference = "Stop"

$chromePath = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
if (-not (Test-Path $chromePath)) {
    $chromePath = 'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe'
}
if (-not (Test-Path $chromePath)) {
    $chromePath = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
}

$htmlPath = (Resolve-Path "tests/run_stress_m1.html").Path
$fileUrl = "file:///" + $htmlPath.Replace("\", "/")
$tempDir = Join-Path $env:TEMP ("chrome_stress_" + [Guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

$outputFile = Join-Path $env:TEMP "stress_m1_out.html"

try {
    Write-Host "Executing Challenger M1 Headless Test..."
    $proc = Start-Process -FilePath $chromePath -ArgumentList `
        "--headless=new", `
        "--disable-gpu", `
        "--no-sandbox", `
        "--allow-file-access-from-files", `
        "--disable-web-security", `
        "--user-data-dir=`"$tempDir`"", `
        "--virtual-time-budget=8000", `
        "--dump-dom", `
        "`"$fileUrl`"" `
        -NoNewWindow -Wait -PassThru -RedirectStandardOutput $outputFile

    if (Test-Path $outputFile) {
        $rawDom = Get-Content -Raw -Encoding UTF8 $outputFile
        $jsonMatch = [regex]::Match($rawDom, '<div id="results-json"[^>]*>(.*?)</div>')
        if ($jsonMatch.Success -and $jsonMatch.Groups[1].Value.Trim() -ne "") {
            $jsonStr = $jsonMatch.Groups[1].Value
            $result = $jsonStr | ConvertFrom-Json
            Write-Host "===================================================="
            Write-Host "CHALLENGER M1 STRESS TEST RESULTS"
            Write-Host "===================================================="
            Write-Host "Total Tests:  $($result.total)"
            Write-Host "Passed Tests: $($result.passed)"
            Write-Host "Failed Tests: $($result.failed)"
            Write-Host "Duration:     $($result.durationMs) ms"
            Write-Host "----------------------------------------------------"
            foreach ($t in $result.results) {
                if ($t.status -eq 'PASS') {
                    Write-Host " [PASS] $($t.suite) :: $($t.desc)" -ForegroundColor Green
                } else {
                    Write-Host " [FAIL] $($t.suite) :: $($t.desc) -> $($t.error)" -ForegroundColor Red
                }
            }
            Write-Host "===================================================="
            if ($result.failed -eq 0) {
                Write-Host "ALL EMPIRICAL CHALLENGES PASSED!" -ForegroundColor Cyan
                exit 0
            } else {
                Write-Host "FAILURES DETECTED!" -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "Could not find results-json in DOM output." -ForegroundColor Yellow
            $statusMatch = [regex]::Match($rawDom, '<div id="status"[^>]*>(.*?)</div>')
            if ($statusMatch.Success) {
                Write-Host "Status: $($statusMatch.Groups[1].Value)"
            }
            $outMatch = [regex]::Match($rawDom, '<pre id="output"[^>]*>(.*?)</pre>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
            if ($outMatch.Success) {
                Write-Host "Output: $($outMatch.Groups[1].Value)"
            }
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
