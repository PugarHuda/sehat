# Builds a portable Sehat desktop app (Windows x64) without electron-forge's
# zip extractor, which stalls on this host. It reuses the already-extracted
# Electron runtime in node_modules/electron/dist and the QVAC worker bundle
# produced by `electron-forge package` (qvac/), assembling them with robocopy.
#
#   powershell -ExecutionPolicy Bypass -File scripts/make-portable.ps1
#
# Output: out/Sehat-win32-x64/Sehat.exe  (+ out/Sehat-win32-x64.zip)
$ErrorActionPreference = "Stop"
$proj = Split-Path -Parent $PSScriptRoot
$out  = Join-Path $proj "out\Sehat-win32-x64"
$app  = Join-Path $out "resources\app"
$dist = Join-Path $proj "node_modules\electron\dist"

if (-not (Test-Path $dist)) { throw "node_modules/electron/dist not found - run npm install first." }
if (-not (Test-Path (Join-Path $proj "qvac\worker.bundle.js"))) {
  throw "qvac/ bundle missing - run 'npm run package' (or electron-forge package) first."
}

Write-Host "Cleaning $out ..."
if (Test-Path $out) { cmd /c rmdir /s /q "`"$out`"" }
New-Item -ItemType Directory -Force -Path $app | Out-Null

# 1) Electron runtime -> out/  (robocopy: /E recurse, /NFL/NDL quiet)
Write-Host "Copying Electron runtime..."
robocopy "$dist" "$out" /E /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy electron dist failed ($LASTEXITCODE)" }

# Our app is the real app: drop Electron's default app so ours is loaded.
Remove-Item (Join-Path $out "resources\default_app.asar") -Force -ErrorAction SilentlyContinue
Rename-Item (Join-Path $out "electron.exe") "Sehat.exe"

# 2) App source -> resources/app  (only what the app needs at runtime)
Write-Host "Copying app source..."
foreach ($d in @("src","public","electron","qvac")) {
  robocopy (Join-Path $proj $d) (Join-Path $app $d) /E /NFL /NDL /NJH /NJS /NP | Out-Null
  if ($LASTEXITCODE -ge 8) { throw "robocopy $d failed ($LASTEXITCODE)" }
}
# data: ship sample docs only; records are created per-install at runtime.
robocopy (Join-Path $proj "data\sample") (Join-Path $app "data\sample") /E /NFL /NDL /NJH /NJS /NP | Out-Null
Copy-Item (Join-Path $proj "package.json") (Join-Path $app "package.json") -Force

# 3) node_modules -> resources/app  (exclude the runtime dup + dev/build tooling)
Write-Host "Copying node_modules (this is the big step)..."
$nmSrc = Join-Path $proj "node_modules"
$nmDst = Join-Path $app "node_modules"
$xd = @(
  (Join-Path $nmSrc "electron"),
  (Join-Path $nmSrc "@electron-forge"),
  (Join-Path $nmSrc "@electron"),
  (Join-Path $nmSrc "@qvac\transcription-parakeet"),
  (Join-Path $nmSrc "@qvac\vla-ggml"),
  (Join-Path $nmSrc "@qvac\diffusion-cpp"),
  (Join-Path $nmSrc "@qvac\bci-whispercpp"),
  (Join-Path $nmSrc "@qvac\classification-ggml")
)
robocopy "$nmSrc" "$nmDst" /E /NFL /NDL /NJH /NJS /NP /XD @xd | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy node_modules failed ($LASTEXITCODE)" }

# Prune mobile (android/ios) prebuilds to save space.
Get-ChildItem $nmDst -Recurse -Directory -Filter "prebuilds" -ErrorAction SilentlyContinue | ForEach-Object {
  Get-ChildItem $_.FullName -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -like "android-*" -or $_.Name -like "ios-*" } |
    ForEach-Object { Remove-Item $_.FullName -Recurse -Force -ErrorAction SilentlyContinue }
}

$size = (Get-ChildItem $out -Recurse -File | Measure-Object Length -Sum).Sum / 1MB
Write-Host ("Assembled: {0:N0} MB at {1}" -f $size, $out)

# 4) zip it
$zip = Join-Path $proj "out\Sehat-win32-x64.zip"
Write-Host "Zipping -> $zip ..."
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path "$out\*" -DestinationPath $zip -CompressionLevel Optimal
$zsz = (Get-Item $zip).Length / 1MB
Write-Host ("DONE. Sehat.exe ready; zip {0:N0} MB" -f $zsz)
