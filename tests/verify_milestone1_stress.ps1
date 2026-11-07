# Standalone PowerShell AST & Data Integrity Verifier for Dungeon Data 100
$ErrorActionPreference = "Stop"

Write-Host "Reading js/dungeon_data_100.js..."
$raw = Get-Content -Raw -Encoding UTF8 "js/dungeon_data_100.js"
$match = [regex]::Match($raw, '(?s)^(\/\/.*?window\.DUNGEON_DATA_100\s*=\s*)(.*?)(;\s*\/\*\*.*)$')
if (-not $match.Success) {
    Write-Host "Failed to extract DUNGEON_DATA_100 JSON object!" -ForegroundColor Red
    exit 1
}

$data = $match.Groups[2].Value | ConvertFrom-Json
$validElements = @('fire', 'water', 'nature', 'lightning', 'holy', 'dark', 'cyber', 'cosmic')

$dungeonCount = 0
$bossCount = 0
$minionCount = 0
$errors = @()

1..100 | ForEach-Object {
    $stt = $_
    $key = "$stt"
    $d = $data.$key

    if (-not $d) {
        $errors += "Missing dungeon key $key"
        return
    }

    $dungeonCount++

    # Element
    if ($validElements -notcontains $d.element) {
        $errors += "Dungeon $key invalid element: $($d.element)"
    }

    # Stats
    if ($d.exp -le 0 -or $d.gold -le 0) {
        $errors += "Dungeon $key non-positive exp/gold: exp=$($d.exp), gold=$($d.gold)"
    }

    # Boss
    $b = $d.boss
    if (-not $b) {
        $errors += "Dungeon $key missing boss"
    } else {
        $bossCount++
        if ($validElements -notcontains $b.element) {
            $errors += "Dungeon $key boss invalid element: $($b.element)"
        }
        if ($b.baseHp -le 0 -or $b.atk -le 0 -or $b.def -lt 0 -or $b.exp -le 0 -or $b.gold -le 0) {
            $errors += "Dungeon $key boss invalid stats: HP=$($b.baseHp), ATK=$($b.atk), DEF=$($b.def), EXP=$($b.exp), Gold=$($b.gold)"
        }
        if (-not $b.roars -or $b.roars.Count -eq 0) {
            $errors += "Dungeon $key boss missing roars"
        }
    }

    # Minions
    if (-not $d.minions -or $d.minions.Count -eq 0) {
        $errors += "Dungeon $key missing minions"
    } else {
        $d.minions | ForEach-Object {
            $minionCount++
            if ($_.hp -le 0 -or $_.atk -le 0 -or $_.def -lt 0) {
                $errors += "Dungeon $key minion invalid stats: $($_.name)"
            }
        }
    }
}

Write-Host "================================================="
Write-Host "POWERSHELL AST & DATA INTEGRITY SUMMARY"
Write-Host "================================================="
Write-Host "Dungeons Verified: $dungeonCount / 100"
Write-Host "Bosses Verified:   $bossCount / 100"
Write-Host "Minions Verified:  $minionCount / 300"
Write-Host "Errors Detected:   $($errors.Count)"
Write-Host "================================================="

if ($errors.Count -eq 0) {
    Write-Host "All 100 Dungeons & Bosses Data Structures are 100% Valid!" -ForegroundColor Green
    exit 0
} else {
    $errors | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
    exit 1
}
