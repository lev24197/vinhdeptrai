# ==============================================================================
# Thu nghiem Pipeline Lai: 
# 1. Danh sach tu + nghia + dong nghia + 2 vi du (Mo phong output tu Gemini sieu tiet kiem)
# 2. Cao US IPA, Dinh nghia & URL MP3 tu Cambridge
# 3. Tai truc tiep file MP3 ve thu muc local
# 4. Dong goi thanh dinh dang 9 cot (Cot 8 = Tu dong nghia)
# ==============================================================================

$sampleItems = @(
    @{
        w = "sweater"
        vi = "áo len"
        syn = "pullover, jumper"
        ex1 = "She wore a warm wool sweater."
        ex2 = "I bought a blue sweater for winter."
    },
    @{
        w = "watering can"
        vi = "bình tưới nước"
        syn = "sprinkler, water pot"
        ex1 = "He filled the watering can at the tap."
        ex2 = "Use a watering can with a fine rose for seedlings."
    },
    @{
        w = "trellis"
        vi = "giàn leo"
        syn = "lattice, arbor"
        ex1 = "Roses climbed up the wooden trellis."
        ex2 = "We built a trellis for the climbing beans."
    }
)

function Make-Cloze($word) {
    $parts = $word.Trim().Split(" ")
    $clozed = foreach ($p in $parts) {
        if ($p.Length -le 2) { $p }
        else { $p[0] + ("_" * ($p.Length - 2)) + $p[-1] }
    }
    return $clozed -join " "
}

$outputDir = "output/test_sample"
$audioDir = "$outputDir/audio"
if (-not (Test-Path $audioDir)) {
    New-Item -ItemType Directory -Force -Path $audioDir | Out-Null
}

$tsvLines = @()

foreach ($item in $sampleItems) {
    $w = $item.w.Trim().ToLower()
    $cloze = Make-Cloze $w
    $cleanWord = ($w -replace '\s+', '_')
    $sound = "[sound:$cleanWord.mp3]"
    $slug = ($w -replace '\s+', '-')
    
    Write-Host "Dang xu ly tu: '$w'..." -ForegroundColor Cyan
    
    # 1. Tra cuu Cambridge API de lay US IPA, Dinh nghia & URL MP3
    $ipa = ""
    $def = ""
    $mp3Url = ""
    
    try {
        $cambridge = Invoke-RestMethod -Uri "https://dictionary-api.eliaschen.dev/api/dictionary/en/$slug" -Method Get -TimeoutSec 5 -ErrorAction Stop
        
        # Lay US IPA & MP3
        foreach ($p in $cambridge.pronunciation) {
            if ($p.lang -eq "us") {
                if (-not $ipa -and $p.pron) { $ipa = $p.pron }
                if (-not $mp3Url -and $p.url) { $mp3Url = $p.url }
            }
        }
        # Neu chua co US thi lay UK
        if (-not $ipa -and $cambridge.pronunciation.Count -gt 0) {
            $ipa = $cambridge.pronunciation[0].pron
            $mp3Url = $cambridge.pronunciation[0].url
        }
        
        # Lay Definition
        if ($cambridge.definition -and $cambridge.definition.Count -gt 0) {
            $def = $cambridge.definition[0].text.Trim()
        }
    } catch {
        Write-Host "  [Notice] Cambridge khong co entry truc tiep cho '$w', dung dinh nghia du phong" -ForegroundColor Yellow
    }
    
    if (-not $ipa) { $ipa = "/$w/" }
    if (-not $def) { $def = "A specific type of $w used in everyday life." }
    
    # 2. Tai file MP3 ve may
    $mp3File = "$audioDir/$cleanWord.mp3"
    if ($mp3Url) {
        try {
            # Thu tai truc tiep tu Cambridge CDN hoac Wayback CDN
            $canonUrl = $mp3Url.Replace("dictionary.cambridge.org/us/media/", "dictionary.cambridge.org/media/")
            $downloadUrl = "https://web.archive.org/web/2id_/$canonUrl"
            Invoke-WebRequest -Uri $downloadUrl -OutFile $mp3File -UserAgent "Mozilla/5.0" -TimeoutSec 8 -ErrorAction Stop
            Write-Host "  [OK] Da tai MP3 tu Cambridge ($cleanWord.mp3)" -ForegroundColor Green
        } catch {
            Write-Host "  [Warn] Khong tai duoc MP3 tu URL ${mp3Url} - $_" -ForegroundColor DarkYellow
        }
    } else {
        Write-Host "  [Warn] Khong tim thay URL MP3 cho '$w'" -ForegroundColor DarkYellow
    }
    
    # 3. Ghep dong 9 cot (Cot 8 la Tu dong nghia)
    $examples = "1. $($item.ex1)  2. $($item.ex2)"
    $line = "$w`t$cloze`t$ipa`t$sound`t$def`t$($item.vi)`t$($item.vi)`t$($item.syn)`t$examples"
    $tsvLines += $line
}

# Ghi file TSV
$tsvPath = "$outputDir/sample_9col.txt"
$tsvLines | Out-File -FilePath $tsvPath -Encoding utf8
Write-Host "`nDa tao thanh cong file 9 cot mau tai: $tsvPath" -ForegroundColor Green
Get-Content $tsvPath
