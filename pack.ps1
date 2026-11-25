# Gera dist/strava-heatmap-josm-<versão>.zip para enviar à Chrome Web Store.
# Usa ZipArchive direto para garantir caminhos com "/" (o Compress-Archive do
# Windows PowerShell 5 grava "\", o que a Web Store pode rejeitar).
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem

$version = (Get-Content manifest.json -Raw | ConvertFrom-Json).version
$files = @("manifest.json", "popup.html", "popup.js") + (Get-ChildItem icons -File | ForEach-Object { "icons/$($_.Name)" })

New-Item -ItemType Directory -Force dist | Out-Null
$zip = Join-Path $PSScriptRoot "dist/strava-heatmap-josm-$version.zip"
if (Test-Path $zip) { Remove-Item $zip }

$archive = [System.IO.Compression.ZipFile]::Open($zip, "Create")
try {
  foreach ($f in $files) {
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, (Join-Path $PSScriptRoot $f), $f) | Out-Null
  }
} finally {
  $archive.Dispose()
}
Write-Host "Gerado: dist/strava-heatmap-josm-$version.zip"
