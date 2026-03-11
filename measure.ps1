$src = (Get-ChildItem -Path src -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
$pub = (Get-ChildItem -Path public -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
$dist = 0
if (Test-Path dist) { $dist = (Get-ChildItem -Path dist -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum }
Write-Host "=== POIDS DE L'APPLICATION ==="
Write-Host "SRC (code source):  $([math]::Round($src/1MB, 2)) Mo"
Write-Host "PUBLIC (assets):    $([math]::Round($pub/1MB, 2)) Mo"
Write-Host "NODE_MODULES:       $([math]::Round(624, 0)) Mo (approx)"
Write-Host ""
if ($dist -gt 0) {
    Write-Host "=== BUILD DE PRODUCTION (dist/) ==="
    Write-Host "TOTAL BUILD: $([math]::Round($dist/1MB, 2)) Mo"
    Write-Host ""
    Write-Host "--- Top 20 fichiers les plus lourds ---"
    Get-ChildItem -Path dist -Recurse -File | Sort-Object Length -Descending | Select-Object -First 20 | ForEach-Object {
        $sizeKB = [math]::Round($_.Length/1KB, 1)
        Write-Host "  $($sizeKB.ToString().PadLeft(10)) KB  $($_.Name)"
    }
} else {
    Write-Host "(pas de dossier dist - build non effectue)"
}
Write-Host ""
Write-Host "--- Top 15 fichiers SRC les plus lourds ---"
Get-ChildItem -Path src -Recurse -File | Sort-Object Length -Descending | Select-Object -First 15 | ForEach-Object {
    $sizeKB = [math]::Round($_.Length/1KB, 1)
    $rel = $_.FullName.Replace((Get-Location).Path + "\", "")
    Write-Host "  $($sizeKB.ToString().PadLeft(10)) KB  $rel"
}
