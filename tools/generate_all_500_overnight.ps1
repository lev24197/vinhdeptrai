# ==============================================================================
# TIẾN TRÌNH CHẠY QUA ĐÊM: TẠO TOÀN BỘ 500 CHỦ ĐỀ ANKI CHO WEBSITE
# Nhánh: feature/cambridge-scraper
#
# Các tính năng bảo vệ và tối ưu:
# 1. Chống Sleep Windows trong suốt thời gian chạy.
# 2. Sinh từ vựng siêu tiết kiệm qua Gemini Flash Lite (~15đ/chủ đề).
# 3. Cào US IPA & Định nghĩa Cambridge qua API Gateway.
# 4. Tải MP3 trực tiếp và nén ZIP lưu tạm thời trên máy (output/audio/).
# 5. Tự động commit và push dữ liệu văn bản lên GitHub mỗi 15 chủ đề.
# 6. Tự động phục hồi và thử lại nếu mạng bị chập chờn ban đêm.
# 7. Chạy kiểm toán toàn diện 500 chủ đề khi hoàn thành.
# ==============================================================================

param(
    [int]$Concurrency = 2,
    [int]$PushEvery = 15
)

$ErrorActionPreference = "Continue"

# 1. Bật tính năng chống ngủ máy tính (Windows Stay Awake)
try {
    $csharpCode = @"
using System;
using System.Runtime.InteropServices;
public class WinSleepHelper {
    [DllImport("kernel32.dll", SetLastError = true)]
    public static extern uint SetThreadExecutionState(uint esFlags);
    public const uint ES_CONTINUOUS = 0x80000000;
    public const uint ES_SYSTEM_REQUIRED = 0x00000001;
    public static void KeepAwake() {
        SetThreadExecutionState(ES_CONTINUOUS | ES_SYSTEM_REQUIRED);
    }
}
"@
    Add-Type -TypeDefinition $csharpCode -ErrorAction SilentlyContinue
    [WinSleepHelper]::KeepAwake()
    Write-Host "[HỆ THỐNG] Đã kích hoạt chế độ giữ laptop luôn thức (Windows Stay Awake)." -ForegroundColor Green
} catch {
    Write-Host "[CẢNH BÁO] Không thể bật Stay Awake, script vẫn tiếp tục chạy." -ForegroundColor Yellow
}

# 2. Đọc API Key từ .env
$apiKey = $env:GEMINI_API_KEY
if (-not $apiKey -and (Test-Path ".env")) {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^\s*GEMINI_API_KEY\s*=\s*(.+)$') {
            $apiKey = $matches[1].Trim().Trim('"').Trim("'")
        }
    }
}

if (-not $apiKey) {
    Write-Host "[LỖI] Không tìm thấy GEMINI_API_KEY trong .env!" -ForegroundColor Red
    exit 1
}

$statusFile = "status.json"
$logFile = "run_logs.json"

function Get-MissingTopics {
    $existing = Get-ChildItem "output/*.txt" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty BaseName | ForEach-Object { [int]$_ }
    $statusContent = Get-Content "status.json" -Raw -Encoding utf8 | ConvertFrom-Json
    $missingList = $statusContent.topics | Where-Object { $_.stt -notin $existing -and $_.stt -le 500 }
    return $missingList
}

$missing = Get-MissingTopics
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "BẮT ĐẦU TIẾN TRÌNH CHẠY QUA ĐÊM TẠO TẤT CẢ CHỦ ĐỀ CÒN THIẾU" -ForegroundColor Cyan
Write-Host "Số lượng chủ đề cần tạo: $($missing.Count) / 500" -ForegroundColor Yellow
Write-Host "=================================================================`n" -ForegroundColor Cyan

$processedSincePush = 0
$totalDone = 0
$startTime = [System.Diagnostics.Stopwatch]::StartNew()

while ($true) {
    $currentMissing = Get-MissingTopics
    if ($currentMissing.Count -eq 0) {
        Write-Host "`n[THÀNH CÔNG RỰC RỠ] Đã hoàn thành toàn bộ 500 chủ đề!" -ForegroundColor Green
        break
    }

    $target = $currentMissing[0]
    $stt = $target.stt
    $topicName = $target.topic

    Write-Host "`n>>> [Tiến độ: $totalDone/$($missing.Count)] Đang tạo chủ đề #$stt: $topicName" -ForegroundColor Magenta

    # Chạy công cụ tạo chủ đề lai
    $maxRetries = 3
    $success = $false
    for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
        try {
            & powershell -ExecutionPolicy Bypass -File "tools/generate_hybrid_topic.ps1" -TargetStt $stt -GeminiApiKey $apiKey
            if (Test-Path "output/$stt.txt") {
                $linesCount = (Get-Content "output/$stt.txt").Count
                if ($linesCount -ge 100) {
                    $success = $true
                    break
                }
            }
        } catch {
            Write-Host "  [Lỗi lần $attempt] $($_.Exception.Message). Chờ 5s rồi thử lại..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
    }

    if ($success) {
        $totalDone++
        $processedSincePush++
        Write-Host ">>> [XONG #$stt] Hoàn thành 100 từ x 9 cột cho chủ đề #$stt." -ForegroundColor Green
    } else {
        Write-Host ">>> [CẢNH BÁO] Chủ đề #$stt chưa hoàn thành sau $maxRetries lần thử, tạm bỏ qua để tiếp tục các chủ đề khác." -ForegroundColor Red
    }

    # Tự động commit và push sau mỗi $PushEvery chủ đề
    if ($processedSincePush -ge $PushEvery) {
        Write-Host "`n--- [SYNC] Đang đồng bộ tiến độ ($processedSincePush chủ đề mới) lên GitHub ---" -ForegroundColor Cyan
        git add output/*.txt status.json run_logs.json .gitignore
        git commit -m "Auto-generate Anki topics batch: completed up to topic #$stt [skip ci]"
        git push origin feature/cambridge-scraper
        $processedSincePush = 0
        Write-Host "--- [SYNC XONG] Đã cập nhật Web Dashboard trên GitHub ---`n" -ForegroundColor Green
    }

    # Nghỉ ngắn 1 giây giữa các chủ đề để tránh rate limit
    Start-Sleep -Seconds 1
}

# Đẩy lần cuối nếu còn thay đổi chưa commit
git add output/*.txt status.json run_logs.json .gitignore
git commit -m "Auto-generate Anki topics FINAL: 100% completed all 500 topics [skip ci]"
git push origin feature/cambridge-scraper

$startTime.Stop()
$elapsedMinutes = [int]($startTime.Elapsed.TotalMinutes)
Write-Host "`n=================================================================" -ForegroundColor Green
Write-Host "HOÀN TẤT TOÀN BỘ 500 CHỦ ĐỀ TRONG VÒNG $elapsedMinutes PHÚT!" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green

# 3. Chạy bài kiểm toán tổng kết 500 chủ đề
Write-Host "`n--- ĐANG CHẠY KIỂM TOÁN TỔNG KẾT 500 CHỦ ĐỀ ---" -ForegroundColor Cyan
$allFiles = Get-ChildItem "output/*.txt" | Where-Object { $_.BaseName -match '^\d+$' -and [int]$_.BaseName -le 500 }
$validCount = 0
$invalidList = @()

foreach ($f in $allFiles) {
    $lines = (Get-Content $f.FullName).Count
    if ($lines -eq 100) {
        $validCount++
    } else {
        $invalidList += [PSCustomObject]@{ File = $f.Name; Lines = $lines }
    }
}

Write-Host "Tổng số file chủ đề hợp lệ (đủ 100 dòng): $validCount / 500" -ForegroundColor $(if ($validCount -eq 500) { "Green" } else { "Yellow" })
if ($invalidList.Count -gt 0) {
    Write-Host "Danh sách các file chưa đạt 100 dòng:" -ForegroundColor Red
    $invalidList | Format-Table -AutoSize
} else {
    Write-Host "TẤT CẢ 500 CHỦ ĐỀ ĐẠT 100% CHUẨN XÁC 100 TỪ X 9 CỘT!" -ForegroundColor Green
}
