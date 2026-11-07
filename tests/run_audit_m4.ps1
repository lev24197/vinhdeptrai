$ErrorActionPreference = "Stop"

$chromePath = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
if (-not (Test-Path $chromePath)) {
    $chromePath = 'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe'
}

$htmlPath = (Resolve-Path "tests/audit_m4_forensic.html").Path
$fileUrl = "file:///" + $htmlPath.Replace("\", "/")
$tempDir = Join-Path $env:TEMP ("chrome_forensic_m4_" + [Guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
$outputFile = Join-Path $env:TEMP "audit_m4_out.html"

try {
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
        $dom = Get-Content -Raw -Encoding UTF8 $outputFile
        $m = [regex]::Match($dom, '<div id="forensic-results-json"[^>]*>(.*?)</div>')
        if ($m.Success -and $m.Groups[1].Value.Trim() -ne "") {
            $json = $m.Groups[1].Value | ConvertFrom-Json
            Write-Host "`nForensic Audit Results:" -ForegroundColor Cyan
            Write-Host "Total: $($json.total), Passed: $($json.passed), Failed: $($json.failed)" -ForegroundColor Yellow
            foreach ($r in $json.results) {
                if ($r.status -eq 'PASS') {
                    Write-Host "  [PASS] $($r.name)" -ForegroundColor Green
                } else {
                    Write-Host "  [FAIL] $($r.name) -> $($r.error)" -ForegroundColor Red
                }
            }
            if ($json.failed -eq 0) { exit 0 } else { exit 1 }
        } else {
            Write-Host "No results json found in DOM output" -ForegroundColor Red
            exit 2
        }
    } else {
        Write-Host "Output file not found" -ForegroundColor Red
        exit 3
    }
} finally {
    Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
    Remove-Item -Force $outputFile -ErrorAction SilentlyContinue
}
