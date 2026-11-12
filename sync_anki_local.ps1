<#
.SYNOPSIS
  Tự động trích xuất thống kê học tập Anki cho bộ bài "Thử thách mỗi ngày 100 từ vựng" và đẩy lên GitHub.
.DESCRIPTION
  Đọc trực tiếp cơ sở dữ liệu collection.anki2 ở chế độ an toàn, bóc tách 14 biểu đồ và đẩy anki_stats.json lên GitHub Pages.
#>

param(
  [string]$AnkiDbPath = "$env:APPDATA\Anki2\User 1\collection.anki2"
)

$ErrorActionPreference = "Stop"
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "   ANKI STATS AUTO-SYNC: THỬ THÁCH MỖI NGÀY 100 TỪ VỰNG                        " -ForegroundColor Yellow
Write-Host "================================================================================" -ForegroundColor Cyan

if (!(Test-Path $AnkiDbPath)) {
  Write-Host "Lỗi: Không tìm thấy tệp cơ sở dữ liệu Anki tại: $AnkiDbPath" -ForegroundColor Red
  exit 1
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$scratchDir = Join-Path $scriptDir "temp_anki_sync"
$inspectorDir = "C:\Users\vinh\.gemini\antigravity\brain\3f6e7247-f8e2-443d-bba4-02e65ad52616\scratch\anki_inspector"

try {
  Write-Host "[1/3] Sao chép an toàn dữ liệu Anki sang thư mục tạm..." -ForegroundColor Green
  New-Item -ItemType Directory -Force -Path $scratchDir | Out-Null
  Copy-Item -Path "$AnkiDbPath*" -Destination $scratchDir -Force

  Write-Host "[2/3] Chạy bộ bóc tách 14 chỉ số & biểu đồ..." -ForegroundColor Green
  Push-Location $inspectorDir
  dotnet run --no-build -c Release
  Pop-Location

  Write-Host "[3/3] Đẩy dữ liệu thống kê mới lên GitHub Pages..." -ForegroundColor Green
  Push-Location $scriptDir
  git add data/anki_stats.json
  $status = git status --porcelain data/anki_stats.json
  if (![string]::IsNullOrWhiteSpace($status)) {
    $nowStr = Get-Date -Format "yyyy-MM-dd HH:mm"
    git commit -m "chore(stats): update Anki study statistics ($nowStr)"
    git push origin main
    Write-Host "`n✓ ĐỒNG BỘ THÀNH CÔNG! Dữ liệu Anki mới đã có mặt trên web GitHub Pages." -ForegroundColor Green
  } else {
    Write-Host "`n✓ Dữ liệu Anki không có thay đổi mới so với bản trên GitHub." -ForegroundColor Yellow
  }
  Pop-Location
}
finally {
  if (Test-Path $scratchDir) {
    Remove-Item -Recurse -Force $scratchDir -ErrorAction SilentlyContinue
  }
}
