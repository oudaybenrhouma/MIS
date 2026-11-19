param(
  [Parameter(Mandatory=$true)][string]$ManifestFile,
  [string]$OutputDirectory = 'public/catalog',
  [int]$MaxDimension = 700,
  [long]$JpegQuality = 78,
  [switch]$Prune
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$manifest = Get-Content -LiteralPath $ManifestFile -Raw -Encoding UTF8 | ConvertFrom-Json
$outputPath = [IO.Path]::GetFullPath($OutputDirectory)
New-Item -ItemType Directory -Force -Path $outputPath | Out-Null
$expected = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
$processed = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
$encoder = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$parameters = [Drawing.Imaging.EncoderParameters]::new(1)
$parameters.Param[0] = [Drawing.Imaging.EncoderParameter]::new([Drawing.Imaging.Encoder]::Quality, $JpegQuality)
$converted = 0
$webpCopied = 0
$failed = 0

foreach ($item in $manifest) {
  $target = Join-Path $outputPath $item.filename
  [void]$expected.Add($item.filename)
  if (-not $processed.Add($target)) { continue }
  if (Test-Path -LiteralPath $target -PathType Leaf) { continue }
  try {
    if ([IO.Path]::GetExtension($item.source) -ieq '.webp') {
      Copy-Item -LiteralPath $item.source -Destination $target -Force
      $webpCopied++
      continue
    }

    $image = [Drawing.Image]::FromFile($item.source)
    $scale = [Math]::Min(1, $MaxDimension / [Math]::Max($image.Width, $image.Height))
    $width = [int][Math]::Max(1, [Math]::Round($image.Width * $scale))
    $height = [int][Math]::Max(1, [Math]::Round($image.Height * $scale))
    $bitmap = [Drawing.Bitmap]::new($width, $height)
    $graphics = [Drawing.Graphics]::FromImage($bitmap)
    $graphics.Clear([Drawing.Color]::White)
    $graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.DrawImage($image, 0, 0, $width, $height)
    $image.Dispose()
    $bitmap.Save($target, $encoder, $parameters)
    $graphics.Dispose()
    $bitmap.Dispose()
    $converted++
    if (($converted + $webpCopied) % 500 -eq 0) { Write-Output "Optimized $($converted + $webpCopied) / $($manifest.Count) product photos" }
  } catch {
    $failed++
    Write-Warning "Skipped image '$($item.source)': $($_.Exception.Message)"
  }
}

if ($Prune) {
  foreach ($file in Get-ChildItem -LiteralPath $outputPath -File) {
    if (-not $expected.Contains($file.Name)) { Remove-Item -LiteralPath $file.FullName -Force }
  }
}
Write-Output "Finished: $converted optimized JPEGs, $webpCopied WebP files copied, $failed failures."
