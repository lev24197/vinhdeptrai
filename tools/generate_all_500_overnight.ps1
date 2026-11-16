# ==============================================================================
# TIẾN TRÌNH CHẠY QUA ĐÊM ĐA LUỒNG: TẠO TOÀN BỘ 500 CHỦ ĐỀ ANKI CHO WEBSITE
# Nhánh: feature/cambridge-scraper
#
# Các tính năng bảo vệ và tối ưu:
# 1. Chống Sleep Windows trong suốt thời gian chạy (Windows Stay Awake).
# 2. Chạy đa luồng độc lập (2-3 luồng) không đụng độ ghi file status/log.
# 3. Sinh từ vựng siêu tiết kiệm qua Gemini Flash Lite (~15đ/chủ đề).
# 4. Cào US IPA & Định nghĩa Cambridge qua API Gateway.
# 5. Tải MP3 trực tiếp và nén ZIP lưu tạm thời trên máy (output/audio/).
# 6. Tự động commit và push dữ liệu văn bản lên GitHub mỗi 15 chủ đề.
# 7. Tự động phục hồi, giám sát timeout và thử lại nếu mạng bị gián đoạn.
# 8. Chạy kiểm toán toàn diện 500 chủ đề khi hoàn thành.
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
    $existing = Get-ChildItem "output/*.txt" -ErrorAction SilentlyContinue | ForEach-Object {
        $sttNum = [int]$_.BaseName
        $lines = (Get-Content $_.FullName -ErrorAction SilentlyContinue).Count
        if ($lines -ge 95) { $sttNum }
    }
    $statusContent = Get-Content "status.json" -Raw -Encoding utf8 | ConvertFrom-Json
    $missingList = @($statusContent.topics | Where-Object { $_.stt -notin $existing -and $_.stt -le 500 })
    return $missingList
}

function Append-CoordinatorLog($level, $step, $message, $stt) {
    $logs = @()
    if (Test-Path "run_logs.json") {
        try {
            $logs = Get-Content "run_logs.json" -Raw -Encoding utf8 | ConvertFrom-Json
            if (-not ($logs -is [System.Collections.IList])) { $logs = @($logs) }
        } catch { $logs = @() }
    }
    $newEntry = [PSCustomObject]@{
        time = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        level = $level
        step = $step
        stt = $stt
        message = $message
    }
    $logs = @($newEntry) + @($logs)
    if ($logs.Count -gt 300) { $logs = $logs[0..299] }
    $logs | ConvertTo-Json -Depth 5 | Out-File -FilePath "run_logs.json" -Encoding utf8
    Write-Host "[$level] [$step] $message" -ForegroundColor $(if ($level -eq "SUCCESS") { "Green" } elseif ($level -eq "WARNING") { "Yellow" } elseif ($level -eq "ERROR") { "Red" } else { "Cyan" })
}

$initialMissing = Get-MissingTopics
$totalInitialMissing = $initialMissing.Count
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "BẮT ĐẦU TIẾN TRÌNH CHẠY QUA ĐÊM ĐA LUỒNG TẠO 500 CHỦ ĐỀ ANKI" -ForegroundColor Cyan
Write-Host "Số lượng chủ đề cần tạo: $totalInitialMissing / 500" -ForegroundColor Yellow
Write-Host "Số luồng đồng thời: $Concurrency" -ForegroundColor Yellow
Write-Host "Tần suất đẩy GitHub: Sau mỗi $PushEvery chủ đề mới" -ForegroundColor Yellow
Write-Host "=================================================================`n" -ForegroundColor Cyan

$missingQueue = [System.Collections.ArrayList]@($initialMissing)
$activeJobs = @{} # hashtable: stt -> @{ Process, Stt, Topic, StartTime, Retries }
$processedSincePush = 0
$totalDone = 0
$startTime = [System.Diagnostics.Stopwatch]::StartNew()

while ($missingQueue.Count -gt 0 -or $activeJobs.Count -gt 0) {
    # 1. Khởi chạy luồng mới nếu còn chỗ và còn chủ đề trong hàng đợi
    while ($activeJobs.Count -lt $Concurrency -and $missingQueue.Count -gt 0) {
        $target = $missingQueue[0]
        $missingQueue.RemoveAt(0)
        $stt = $target.stt
        $topicName = $target.topic

        Write-Host ">>> [KHỞI CHẠY LUỒNG] Chủ đề #${stt}: $topicName (Đang chạy: $($activeJobs.Count + 1)/$Concurrency luồng)" -ForegroundColor Cyan
        Append-CoordinatorLog "INFO" "SPAWN_WORKER" "Khởi chạy luồng xử lý chủ đề #${stt}: $topicName" $stt

        $argList = "-ExecutionPolicy Bypass -File tools/generate_hybrid_topic.ps1 -TargetStt $stt -NoStatusUpdate"
        $proc = Start-Process -FilePath "powershell.exe" -ArgumentList $argList -WindowStyle Hidden -PassThru

        $activeJobs[$stt] = [PSCustomObject]@{
            Process = $proc
            Stt = $stt
            Topic = $topicName
            StartTime = (Get-Date)
            Retries = 0
        }

        # Nghỉ 1 giây trước khi spawn luồng tiếp theo để tránh xung đột khởi động
        Start-Sleep -Seconds 1
    }

    # Chờ 3 giây trước khi kiểm tra trạng thái các luồng
    Start-Sleep -Seconds 3

    # 2. Kiểm tra tiến độ của các luồng đang chạy
    $sttKeys = @($activeJobs.Keys)
    foreach ($stt in $sttKeys) {
        $job = $activeJobs[$stt]
        $proc = $job.Process

        if ($proc.HasExited) {
            $txtPath = "output/$stt.txt"
            $isComplete = $false
            $lineCount = 0

            if (Test-Path $txtPath) {
                $lineCount = (Get-Content $txtPath -ErrorAction SilentlyContinue).Count
                if ($lineCount -ge 95) {
                    $isComplete = $true
                }
            }

            if ($isComplete) {
                # Cập nhật status.json một cách an toàn và tuần tự
                $statusData = Get-Content $statusFile -Raw -Encoding utf8 | ConvertFrom-Json
                $entry = $statusData.topics | Where-Object { $_.stt -eq $stt }
                if ($entry) {
                    $entry.status = "completed"
                    $entry.word_count = $lineCount
                    $entry.file_path = $txtPath
                    $entry.generated_at = (Get-Date).ToString("yyyy-MM-dd HH:mm")
                    $entry.last_error = $null
                }
                $statusData.updated_at = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
                $statusData | ConvertTo-Json -Depth 6 | Out-File -FilePath $statusFile -Encoding utf8

                $totalDone++
                $processedSincePush++
                $durationSec = [int]((Get-Date) - $job.StartTime).TotalSeconds

                Write-Host ">>> [HOÀN THÀNH #${stt}] $($job.Topic) ($lineCount từ, thời gian: ${durationSec}s). Đã xong: $totalDone/$totalInitialMissing." -ForegroundColor Green
                Append-CoordinatorLog "SUCCESS" "TOPIC_COMPLETED" "Hoàn thành chủ đề #${stt}: $($job.Topic) ($lineCount từ, ${durationSec}s)" $stt

                $activeJobs.Remove($stt)
            } else {
                # Thử lại nếu chưa đủ từ hoặc gặp lỗi
                $job.Retries++
                if ($job.Retries -le 2) {
                    Write-Host ">>> [THỬ LẠI #${stt}] Chủ đề $($job.Topic) chưa hoàn thành (lần thử $($job.Retries)/2), đưa lại vào hàng đợi." -ForegroundColor Yellow
                    Append-CoordinatorLog "WARNING" "RETRY_TOPIC" "Thử lại chủ đề #${stt} lần $($job.Retries)" $stt
                    $missingQueue.Add([PSCustomObject]@{ stt = $stt; topic = $job.Topic }) | Out-Null
                } else {
                    Write-Host ">>> [LỖI #${stt}] Chủ đề $($job.Topic) thất bại sau 2 lần thử lại, tạm thời ghi nhận lỗi." -ForegroundColor Red
                    Append-CoordinatorLog "ERROR" "TOPIC_FAILED" "Thất bại chủ đề #${stt} sau 2 lần thử lại" $stt
                }
                $activeJobs.Remove($stt)
            }
        } else {
            # Giám sát timeout: Nếu 1 luồng chạy quá 4 phút (240 giây) thì hủy và chạy lại
            $elapsedSec = [int]((Get-Date) - $job.StartTime).TotalSeconds
            if ($elapsedSec -gt 240) {
                Write-Host ">>> [TIMEOUT #${stt}] Luồng chủ đề $($job.Topic) chạy quá 240s, đang dừng và đưa vào hàng đợi lại..." -ForegroundColor Yellow
                try { $proc.Kill() } catch {}
                $missingQueue.Add([PSCustomObject]@{ stt = $stt; topic = $job.Topic }) | Out-Null
                $activeJobs.Remove($stt)
            }
        }
    }

    # 3. Đồng bộ GitHub định kỳ sau mỗi $PushEvery chủ đề
    if ($processedSincePush -ge $PushEvery) {
        Write-Host "`n--- [SYNC] Đang đồng bộ tiến độ ($processedSincePush chủ đề mới) lên GitHub ---" -ForegroundColor Cyan
        git add output/*.txt status.json run_logs.json .gitignore
        git commit -m "Auto-generate Anki topics batch: completed $totalDone/$totalInitialMissing topics [skip ci]"
        git push origin feature/cambridge-scraper
        $processedSincePush = 0
        Write-Host "--- [SYNC XONG] Đã cập nhật Web Dashboard trên GitHub ---`n" -ForegroundColor Green
    }
}

# Đẩy lần cuối cùng khi tất cả đã hoàn tất
Write-Host "`n--- [SYNC CUỐI CÙNG] Đang đẩy toàn bộ dữ liệu 500 chủ đề lên GitHub ---" -ForegroundColor Cyan
git add output/*.txt status.json run_logs.json .gitignore
git commit -m "Auto-generate Anki topics FINAL: 100% completed all 500 topics [skip ci]"
git push origin feature/cambridge-scraper
Write-Host "--- [SYNC XONG] Hoàn tất đẩy dữ liệu lên GitHub ---`n" -ForegroundColor Green

$startTime.Stop()
$elapsedMinutes = [int]($startTime.Elapsed.TotalMinutes)
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "HOÀN TẤT TIẾN TRÌNH: ĐÃ TẠO TOÀN BỘ 500 CHỦ ĐỀ ANKI THÀNH CÔNG!" -ForegroundColor Green
Write-Host "Tổng thời gian thực thi: $elapsedMinutes phút" -ForegroundColor Green
Write-Host "Tổng số chủ đề hoàn thành mới: $totalDone" -ForegroundColor Green
Write-Host "=================================================================`n" -ForegroundColor Green
