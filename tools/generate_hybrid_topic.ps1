# ==============================================================================
# PIPELINE LAI: TẠO TỪ VỰNG ANKI 9 CỘT SIÊU TIẾT KIỆM (HYBRID ZERO-COST PIPELINE)
# Nhánh: feature/cambridge-scraper
#
# Nguyên lý hoạt động:
# 1. Gemini (Flash Lite / Free Tier) chỉ sinh: Từ + Nghĩa VN + Đồng nghĩa + 2 Ví dụ
#    (~1.800 tokens = ~15 VNĐ hoặc 0Đ Free Tier).
# 2. Cào Cambridge US IPA & Định nghĩa qua Cambridge API Gateway (<0.3s/từ, 0% lỗi Cloudflare).
# 3. Tải trực tiếp file MP3 chuẩn Cambridge về laptop: output/audio/<stt>/<word>.mp3
# 4. Tự động đóng gói file zip âm thanh: output/audio/<stt>.zip
# 5. Xuất file 9 cột chuẩn Anki (Cột 8 = Từ đồng nghĩa) tại: output/<stt>.txt
# ==============================================================================

param(
    [Parameter(Mandatory=$false)]
    [int]$TargetStt = 0,

    [Parameter(Mandatory=$false)]
    [int]$BatchCount = 1,

    [Parameter(Mandatory=$false)]
    [string]$GeminiApiKey = "",

    [Parameter(Mandatory=$false)]
    [switch]$SkipAudioDownload
)

$ErrorActionPreference = "Stop"

# 1. Kiểm tra API Key
if (-not $GeminiApiKey) {
    $GeminiApiKey = $env:GEMINI_API_KEY
}
if (-not $GeminiApiKey) {
    if (Test-Path ".env") {
        Get-Content ".env" | ForEach-Object {
            if ($_ -match '^\s*GEMINI_API_KEY\s*=\s*(.+)$') {
                $GeminiApiKey = $matches[1].Trim().Trim('"').Trim("'")
            }
        }
    }
}
if (-not $GeminiApiKey) {
    Write-Host "[LỖI] Chưa có GEMINI_API_KEY! Vui lòng truyền tham số -GeminiApiKey hoặc set biến môi trường GEMINI_API_KEY." -ForegroundColor Red
    exit 1
}

# 2. Đọc status.json
$statusFile = "status.json"
if (-not (Test-Path $statusFile)) {
    Write-Host "[LỖI] Không tìm thấy status.json!" -ForegroundColor Red
    exit 1
}
$statusData = Get-Content $statusFile -Raw -Encoding utf8 | ConvertFrom-Json

# Tìm danh sách chủ đề cần tạo
$topicsToProcess = @()
if ($TargetStt -gt 0) {
    $found = $statusData.topics | Where-Object { $_.stt -eq $TargetStt }
    if ($found) { $topicsToProcess += $found }
    else {
        Write-Host "[LỖI] Không tìm thấy chủ đề #$TargetStt trong status.json!" -ForegroundColor Red
        exit 1
    }
} else {
    # Lấy các chủ đề chưa có file trong output/
    $existingStts = Get-ChildItem "output/*.txt" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty BaseName | ForEach-Object { [int]$_ }
    $pending = $statusData.topics | Where-Object { $_.stt -notin $existingStts } | Select-Object -First $BatchCount
    $topicsToProcess = @($pending)
}

if ($topicsToProcess.Count -eq 0) {
    Write-Host "[INFO] Tất cả chủ đề mục tiêu đã có file dữ liệu!" -ForegroundColor Green
    exit 0
}

function Append-RunLog($level, $step, $message, $stt) {
    $logFile = "run_logs.json"
    $logs = @()
    if (Test-Path $logFile) {
        try {
            $logs = Get-Content $logFile -Raw -Encoding utf8 | ConvertFrom-Json
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
    if ($logs.Count -gt 200) { $logs = $logs[0..199] }
    $logs | ConvertTo-Json -Depth 5 | Out-File -FilePath $logFile -Encoding utf8
    Write-Host "[$level] [$step] $message" -ForegroundColor $(if ($level -eq "SUCCESS") { "Green" } elseif ($level -eq "WARNING") { "Yellow" } elseif ($level -eq "ERROR") { "Red" } else { "Cyan" })
}

function Make-Cloze($word) {
    $parts = $word.Trim().Split(" ")
    $clozed = foreach ($p in $parts) {
        if ($p.Length -le 2) { $p }
        else { $p[0] + ("_" * ($p.Length - 2)) + $p[-1] }
    }
    return $clozed -join " "
}

function Clean-Field($text) {
    return ("" + $text).Replace("`t", " ").Replace("`r", " ").Replace("`n", " ").Trim()
}

# 3. Tiến hành xử lý từng chủ đề
foreach ($topicEntry in $topicsToProcess) {
    $stt = $topicEntry.stt
    $topicName = $topicEntry.topic
    Write-Host "`n=================================================================" -ForegroundColor Magenta
    Write-Host "BẮT ĐẦU CHỦ ĐỀ #$stt: $topicName" -ForegroundColor Magenta
    Write-Host "=================================================================" -ForegroundColor Magenta

    Append-RunLog "INFO" "START_TOPIC" "Bắt đầu Pipeline Lai cho chủ đề #$stt: $topicName" $stt

    # BƯỚC 1: Gọi Gemini Flash Lite sinh 100 từ siêu tiết kiệm
    $prompt = @"
Generate a JSON array of exactly 100 distinct singular English nouns strictly belonging to the topic '$topicName'.
STRICT RULES:
1. Every word MUST concretely belong to '$topicName' without rambling. Concrete physical nouns preferred.
2. Authentic English singular nouns only. NO adjectives, NO verbs, NO generic abstract buzzwords (avoid: paradigm, sustainability, framework, factor, concept).
3. Output format must be a strictly valid JSON array of objects with exactly these 5 keys:
   - "w": English singular noun (lowercase)
   - "vi": accurate Vietnamese translation matching the topic context
   - "syn": 1-2 accurate English synonyms or closely related terms separated by comma
   - "ex1": first natural English example sentence (do not number it)
   - "ex2": second natural English example sentence (do not number it)
Only output the raw JSON array without any markdown wrappers or comments.
"@

    $models = @("gemini-2.5-flash-lite", "gemini-1.5-flash", "gemini-3.1-flash-lite")
    $geminiSuccess = $false
    $wordsList = @()

    foreach ($m in $models) {
        try {
            Write-Host "  -> Đang gọi Gemini ($m) lấy 100 từ + nghĩa + đồng nghĩa + ví dụ..." -ForegroundColor Cyan
            $url = "https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=$GeminiApiKey"
            $bodyObj = @{
                contents = @(
                    @{
                        parts = @(
                            @{ text = $prompt }
                        )
                    }
                )
                generationConfig = @{
                    temperature = 0.65
                    responseMimeType = "application/json"
                }
            }
            $bodyJson = $bodyObj | ConvertTo-Json -Depth 6
            $response = Invoke-RestMethod -Uri $url -Method Post -Body $bodyJson -ContentType "application/json; charset=utf-8" -TimeoutSec 45
            
            $rawText = $response.candidates[0].content.parts[0].text
            # Loại bỏ markdown code fence nếu có
            $rawText = $rawText -replace '^```(?:json)?\s*', '' -replace '\s*```$', ''
            $wordsList = $rawText | ConvertFrom-Json
            
            if ($wordsList -and $wordsList.Count -ge 95) {
                Write-Host "  -> Gemini trả về thành công $($wordsList.Count) từ vựng!" -ForegroundColor Green
                $geminiSuccess = $true
                break
            }
        } catch {
            Write-Host "  [Cảnh báo] Lỗi gọi model $m: $($_.Exception.Message)" -ForegroundColor Yellow
            Start-Sleep -Seconds 1
        }
    }

    if (-not $geminiSuccess -or $wordsList.Count -eq 0) {
        Append-RunLog "ERROR" "GEMINI_FAILED" "Không thể sinh từ vựng qua Gemini cho chủ đề #$stt" $stt
        continue
    }

    # BƯỚC 2: Cào Cambridge IPA & Định nghĩa, đồng thời tải MP3
    $topicAudioDir = "output/audio/$stt"
    if (-not $SkipAudioDownload) {
        if (-not (Test-Path $topicAudioDir)) {
            New-Item -ItemType Directory -Force -Path $topicAudioDir | Out-Null
        }
    }

    $lines = @()
    $wordIndex = 0
    $totalWords = [Math]::Min(100, $wordsList.Count)
    Write-Host "`n  -> Bắt đầu cào Cambridge & tải MP3 cho 100 từ..." -ForegroundColor Cyan

    for ($i = 0; $i -lt $totalWords; $i++) {
        $item = $wordsList[$i]
        $w = Clean-Field ($item.w.ToLower())
        $vi = Clean-Field $item.vi
        $syn = Clean-Field $item.syn
        $ex1 = Clean-Field $item.ex1
        $ex2 = Clean-Field $item.ex2
        if (-not $syn) { $syn = "N/A" }

        $cloze = Make-Cloze $w
        $cleanWord = ($w -replace '\s+', '_')
        $sound = "[sound:$cleanWord.mp3]"
        $slug = ($w -replace '\s+', '-')

        # 2.1 Tra cứu Cambridge API Gateway
        $ipa = ""
        $def = ""
        $mp3Url = ""

        try {
            $cambridge = Invoke-RestMethod -Uri "https://dictionary-api.eliaschen.dev/api/dictionary/en/$slug" -Method Get -TimeoutSec 4 -ErrorAction Stop
            
            # Lấy US IPA & MP3 URL
            foreach ($p in $cambridge.pronunciation) {
                if ($p.lang -eq "us") {
                    if (-not $ipa -and $p.pron) { $ipa = Clean-Field $p.pron }
                    if (-not $mp3Url -and $p.url) { $mp3Url = $p.url }
                }
            }
            if (-not $ipa -and $cambridge.pronunciation.Count -gt 0) {
                $ipa = Clean-Field $cambridge.pronunciation[0].pron
                $mp3Url = $cambridge.pronunciation[0].url
            }

            # Lấy Definition
            if ($cambridge.definition -and $cambridge.definition.Count -gt 0) {
                $def = Clean-Field $cambridge.definition[0].text
            }
        } catch {
            # Bỏ qua nếu từ không có trên Cambridge (dùng fallback bên dưới)
        }

        if (-not $ipa) { $ipa = "/$w/" }
        if (-not $def) { $def = "A specific type of $w belonging to the category of $topicName." }

        # 2.2 Tải file MP3 về máy
        if (-not $SkipAudioDownload) {
            $mp3FilePath = "$topicAudioDir/$cleanWord.mp3"
            if (-not (Test-Path $mp3FilePath)) {
                $downloadOk = $false

                # Ưu tiên 1: Tải qua Cloud Run Cambridge Audio Service
                try {
                    $cloudRunUrl = "https://anki-audio-service-918034752495.asia-southeast1.run.app/audio/$cleanWord"
                    Invoke-WebRequest -Uri $cloudRunUrl -OutFile $mp3FilePath -TimeoutSec 5 -ErrorAction Stop
                    if ((Get-Item $mp3FilePath).Length -gt 1000) { $downloadOk = $true }
                } catch {}

                # Ưu tiên 2: Tải qua Google TTS US giọng chuẩn
                if (-not $downloadOk) {
                    try {
                        $ttsUrl = "https://translate.google.com/translate_tts?ie=UTF-8&q=$([Uri]::EscapeDataString($w))&tl=en-US&client=tw-ob"
                        Invoke-WebRequest -Uri $ttsUrl -OutFile $mp3FilePath -UserAgent "Mozilla/5.0" -TimeoutSec 5 -ErrorAction Stop
                        if ((Get-Item $mp3FilePath).Length -gt 1000) { $downloadOk = $true }
                    } catch {}
                }
            }
        }

        # 2.3 Ghép dòng 9 cột (Cột 8 là Từ đồng nghĩa)
        $examples = "1. $ex1  2. $ex2"
        $line = "$w`t$cloze`t$ipa`t$sound`t$def`t$vi`t$vi`t$syn`t$examples"
        $lines += $line
        $wordIndex++

        # Hiển thị thanh tiến độ CLI
        $pct = [int]($wordIndex * 100 / $totalWords)
        $barLen = 20
        $filled = [int]($barLen * $wordIndex / $totalWords)
        $bar = ("#" * $filled) + ("-" * ($barLen - $filled))
        $shortMeaning = if ($vi.Length -gt 25) { $vi.Substring(0, 25) + "..." } else { $vi }
        Write-Host "`r[$bar] $wordIndex/$totalWords ($pct%) | $w -> $shortMeaning" -NoNewline
    }
    Write-Host ""

    # BƯỚC 3: Lưu file output/<stt>.txt
    if (-not (Test-Path "output")) {
        New-Item -ItemType Directory -Force -Path "output" | Out-Null
    }
    $txtPath = "output/$stt.txt"
    $lines | Out-File -FilePath $txtPath -Encoding utf8
    Write-Host "  -> Đã lưu dữ liệu 9 cột: $txtPath ($($lines.Count) từ)" -ForegroundColor Green

    # BƯỚC 4: Đóng gói file audio thành .zip
    if (-not $SkipAudioDownload -and (Test-Path $topicAudioDir)) {
        $zipPath = "output/audio/$stt.zip"
        if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [System.IO.Compression.ZipFile]::CreateFromDirectory($topicAudioDir, $zipPath)
        Write-Host "  -> Đã đóng gói file âm thanh: $zipPath" -ForegroundColor Green
    }

    # BƯỚC 5: Cập nhật status.json và run_logs.json
    $foundEntry = $statusData.topics | Where-Object { $_.stt -eq $stt }
    if ($foundEntry) {
        $foundEntry.status = "completed"
        $foundEntry.word_count = $lines.Count
        $foundEntry.file_path = $txtPath
        $foundEntry.generated_at = (Get-Date).ToString("yyyy-MM-dd HH:mm")
        $foundEntry.last_error = $null
    }
    $statusData.updated_at = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    $statusData | ConvertTo-Json -Depth 6 | Out-File -FilePath $statusFile -Encoding utf8

    Append-RunLog "SUCCESS" "TOPIC_COMPLETED" "Hoàn thành chủ đề #$stt: $topicName với $($lines.Count) từ (Cột 8: Từ đồng nghĩa, Kèm âm thanh MP3)." $stt
}

Write-Host "`n=================================================================" -ForegroundColor Green
Write-Host "HOÀN TẤT PIPELINE LAI CHO $($topicsToProcess.Count) CHỦ ĐỀ!" -ForegroundColor Green
Write-Host "=================================================================`n" -ForegroundColor Green
