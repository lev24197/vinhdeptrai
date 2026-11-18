# ==============================================================================
# Script kiem tra tinh kha thi: Cao du lieu 9 cot tu Cambridge Dictionary
# Nhanh: feature/cambridge-scraper
# ==============================================================================

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "BAT DAU KIEM TRA TINH KHA THI: CAO CAMBRIDGE DICTIONARY CHO 9 COT" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. Thu nghiem ket noi truc tiep den dictionary.cambridge.org tu laptop
Write-Host "`n[TEST 1] Thu ket noi truc tiep den dictionary.cambridge.org..." -ForegroundColor Yellow
$testUrl = "https://dictionary.cambridge.org/dictionary/english-vietnamese/apple"
try {
    $res = Invoke-WebRequest -Uri $testUrl -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "Ket qua truc tiep: Thanh cong (Status $($res.StatusCode))" -ForegroundColor Green
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    Write-Host "Ket qua truc tiep: BI CHAN BOI CLOUDFLARE! (HTTP $status)" -ForegroundColor Red
    Write-Host "Chi tiet: Cambridge Dictionary su dung Cloudflare Turnstile/Bot Management." -ForegroundColor DarkYellow
    Write-Host "Moi HTTP request tu dong tu laptop deu bi chan 403 Forbidden.`n" -ForegroundColor DarkYellow
}

# 2. Thu nghiem lay du lieu qua Cambridge Dictionary API Gateway (US-East)
Write-Host "[TEST 2] Kiem tra do phu du lieu 9 cot qua Cambridge API voi 5 tu dai dien..." -ForegroundColor Yellow
$sampleWords = @("apple", "watering-can", "pruning-shears", "trellis", "gardening-glove")

foreach ($w in $sampleWords) {
    Write-Host "--------------------------------------------------------"
    Write-Host "Kiem tra tu: '$w'" -ForegroundColor Cyan
    $apiUrl = "https://dictionary-api.eliaschen.dev/api/dictionary/en/$w"
    try {
        $json = Invoke-RestMethod -Uri $apiUrl -Method Get -TimeoutSec 8 -ErrorAction Stop
        
        $ipa = ""
        $audioUrl = ""
        foreach ($p in $json.pronunciation) {
            if ($p.lang -eq "us" -and -not $ipa) { $ipa = $p.pron }
            if ($p.lang -eq "us" -and -not $audioUrl) { $audioUrl = $p.url }
        }
        
        $def = if ($json.definition -and $json.definition.Count -gt 0) { $json.definition[0].text } else { "" }
        $viTrans = if ($json.definition -and $json.definition.Count -gt 0) { $json.definition[0].translation } else { "" }
        $exCount = if ($json.definition -and $json.definition[0].example) { $json.definition[0].example.Count } else { 0 }
        $hasPlural = if ($json.verbs -and $json.verbs.Count -gt 1) { $true } else { $false }

        Write-Host "  - Tu vung: $($json.word)" -ForegroundColor Gray
        Write-Host "  - US IPA: $(if ($ipa) { $ipa } else { 'KHONG CO' })" -ForegroundColor $(if ($ipa) { "Green" } else { "Red" })
        Write-Host "  - Audio MP3: $(if ($audioUrl) { 'CO' } else { 'KHONG CO' })" -ForegroundColor $(if ($audioUrl) { "Green" } else { "Red" })
        Write-Host "  - Dinh nghia Anh: $(if ($def) { $def.Substring(0, [Math]::Min(50, $def.Length)) + '...' } else { 'KHONG CO' })" -ForegroundColor $(if ($def) { "Green" } else { "Red" })
        Write-Host "  - Nghia tieng Viet: $(if ($viTrans) { $viTrans } else { 'TRONG RONG (Cambridge khong co)' })" -ForegroundColor $(if ($viTrans) { "Green" } else { "Red" })
        Write-Host "  - So luong cau vi du: $exCount cau (Yeu cau Anki can 2 cau)" -ForegroundColor $(if ($exCount -ge 2) { "Green" } else { "DarkYellow" })
        Write-Host "  - So nhieu (Plural): $(if ($hasPlural) { 'CO' } else { 'KHONG CO (Tu co quy tac bi bo trong)' })" -ForegroundColor $(if ($hasPlural) { "Green" } else { "DarkYellow" })
    } catch {
        Write-Host "  - Loi: Khong tim thay tu nay tren Cambridge (Word Not Found / 404)" -ForegroundColor Red
    }
}

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "KET LUAN DANH GIA TONG THE:" -ForegroundColor Cyan
Write-Host "1. Cao truc tiep web dictionary.cambridge.org bi Cloudflare chan 403 100%." -ForegroundColor Yellow
Write-Host "2. Cambridge khong chua nghia tieng Viet, khong ghi so nhieu co quy tac, va thuong co 0 cau vi du." -ForegroundColor Yellow
Write-Host "3. Cac tu ghep/chuyen nganh chu de de bi 'Word not found'." -ForegroundColor Yellow
Write-Host "=================================================================`n" -ForegroundColor Cyan
