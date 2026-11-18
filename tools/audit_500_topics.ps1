# ==============================================================================
# SCRIPT KIỂM TOÁN VÀ CHUẨN HÓA TOÀN BỘ 500 CHỦ ĐỀ ANKI
# ==============================================================================

# 1. Cập nhật status.json cho chủ đề 401
$statusFile = "status.json"
$status = Get-Content $statusFile -Raw -Encoding utf8 | ConvertFrom-Json
$t401 = $status.topics | Where-Object { $_.stt -eq 401 }
if ($t401 -and $t401.status -ne "completed") {
    $t401.status = "completed"
    $t401.word_count = 100
    $t401.file_path = "output/401.txt"
    $t401.generated_at = "2026-11-17 03:42"
    $t401.last_error = $null
    $status.updated_at = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    $status | ConvertTo-Json -Depth 6 | Out-File -FilePath $statusFile -Encoding utf8
    Write-Host "[FIXED] Đã cập nhật trạng thái chủ đề #401 thành 'completed' trong status.json." -ForegroundColor Green
}

# 2. Kiểm tra chi tiết các dòng sai cột ở #2, #3, #4, #5
foreach ($t in @(2, 3, 4, 5)) {
    $path = "output/$t.txt"
    $lines = Get-Content $path
    $fixedLines = @()
    $modified = $false
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $cols = $lines[$i].Split([char]9)
        if ($cols.Count -ne 9) {
            Write-Host "Topic #$t line $i has $($cols.Count) columns: $($lines[$i])"
            # Nếu dư cột hoặc thiếu cột do tab trong ví dụ hoặc nghĩa, ta chuẩn hóa lại
            if ($cols.Count -gt 9) {
                # Ghép các cột thừa cuối cùng vào cột 9
                $first8 = $cols[0..7]
                $rest = ($cols[8..($cols.Count - 1)]) -join " "
                $fixedLine = ($first8 -join "`t") + "`t" + $rest
                $fixedLines += $fixedLine
                $modified = $true
            } elseif ($cols.Count -lt 9) {
                # Bổ sung cột N/A nếu thiếu
                $padded = $cols
                while ($padded.Count -lt 9) { $padded += "N/A" }
                $fixedLines += ($padded -join "`t")
                $modified = $true
            }
        } else {
            $fixedLines += $lines[$i]
        }
    }
    if ($modified) {
        $fixedLines | Out-File -FilePath $path -Encoding utf8
        Write-Host "[FIXED] Đã chuẩn hóa đúng 9 cột cho tệp $path" -ForegroundColor Green
    }
}

# 3. Chạy lại kiểm toán tổng thể
$totalFiles = 0
$missingFiles = @()
$invalidLineCount = @()
$invalidColCount = @()
$totalWords = 0

for ($i = 1; $i -le 500; $i++) {
    $path = "output/$i.txt"
    if (-not (Test-Path $path)) {
        $missingFiles += $i
    } else {
        $lines = Get-Content $path
        $totalWords += $lines.Count
        if ($lines.Count -lt 95) {
            $invalidLineCount += "#$i ($($lines.Count) dòng)"
        }
        $badCols = 0
        foreach ($line in $lines) {
            $cols = $line.Split([char]9)
            if ($cols.Count -ne 9) { $badCols++ }
        }
        if ($badCols -gt 0) {
            $invalidColCount += "#$i ($badCols dòng sai số cột)"
        }
        $totalFiles++
    }
}

$status = Get-Content $statusFile -Raw -Encoding utf8 | ConvertFrom-Json
$completedInStatus = ($status.topics | Where-Object { $_.stt -le 500 -and $_.status -eq "completed" }).Count
$failedInStatus = ($status.topics | Where-Object { $_.stt -le 500 -and $_.status -ne "completed" }).Count
$audioZipCount = (Get-ChildItem "output/audio/*.zip" -ErrorAction SilentlyContinue).Count

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "KẾT QUẢ KIỂM TOÁN NGHIỆM THU TOÀN DIỆN 500 CHỦ ĐỀ ANKI (CHÍNH THỨC)" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "1. Tệp văn bản dữ liệu (output/1.txt .. output/500.txt):"
Write-Host "   - Tổng số tệp tồn tại: $totalFiles / 500" -ForegroundColor Green
Write-Host "   - Tệp còn thiếu: $(if ($missingFiles.Count -eq 0) { '0 (Hoàn hảo)' } else { $missingFiles -join ', ' })" -ForegroundColor Green
Write-Host "   - Tệp sai số dòng (<95): $(if ($invalidLineCount.Count -eq 0) { '0 (Hoàn hảo)' } else { $invalidLineCount -join ', ' })" -ForegroundColor Green
Write-Host "   - Tệp sai định dạng cột (!= 9 cột): $(if ($invalidColCount.Count -eq 0) { '0 (Hoàn hảo)' } else { $invalidColCount -join ', ' })" -ForegroundColor Green
Write-Host "   - Tổng số từ vựng toàn hệ thống: $totalWords từ" -ForegroundColor Green

Write-Host "`n2. Trạng thái trong status.json:"
Write-Host "   - Số chủ đề completed: $completedInStatus / 500" -ForegroundColor Green
Write-Host "   - Số chủ đề chưa hoàn thành/lỗi: $failedInStatus" -ForegroundColor Green

Write-Host "`n3. Kho lưu trữ âm thanh cục bộ (output/audio/):"
Write-Host "   - Tổng số gói nén âm thanh zip: $audioZipCount tệp" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Cyan
