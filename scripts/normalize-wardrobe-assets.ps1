param(
  [string]$SourceRoot = "public/little-jetter/catalog/source/tokyo",
  [string]$OutputRoot = "public/little-jetter/catalog/tokyo"
)

Add-Type -AssemblyName System.Drawing

$CanvasWidth = 600
$CanvasHeight = 900
$Slots = @{
  top = [System.Drawing.Rectangle]::new(145, 315, 310, 175)
  bottom = [System.Drawing.Rectangle]::new(170, 465, 260, 305)
  outerwear = [System.Drawing.Rectangle]::new(130, 300, 340, 275)
  shoes = [System.Drawing.Rectangle]::new(170, 710, 260, 105)
  accessory = [System.Drawing.Rectangle]::new(275, 330, 190, 270)
  hair = [System.Drawing.Rectangle]::new(190, 70, 220, 245)
}

$Assets = @(
  @{ Source = 'stripe-coral.png'; Output = 'stripe/coral.png'; Slot = 'top' },
  @{ Source = 'stripe-blue.png'; Output = 'stripe/blue.png'; Slot = 'top' },
  @{ Source = 'stripe-violet.png'; Output = 'stripe/violet.png'; Slot = 'top' },
  @{ Source = 'stripe-teal.png'; Output = 'stripe/teal.png'; Slot = 'top' },
  @{ Source = 'travel-jeans.png'; Output = 'travel-jeans/default.png'; Slot = 'bottom' },
  @{ Source = 'raincoat.png'; Output = 'rain/default.png'; Slot = 'outerwear' },
  @{ Source = 'red-sneakers.png'; Output = 'sneakers/default.png'; Slot = 'shoes' },
  @{ Source = 'crossbody.png'; Output = 'crossbody/default.png'; Slot = 'accessory' }
)

function Test-ChromaPixel([System.Drawing.Color]$Pixel) {
  return $Pixel.G -gt 170 -and ($Pixel.G - $Pixel.R) -gt 65 -and ($Pixel.G - $Pixel.B) -gt 55
}

foreach ($Asset in $Assets) {
  $SourcePath = Join-Path $SourceRoot $Asset.Source
  $TargetPath = Join-Path $OutputRoot $Asset.Output
  $TargetDirectory = Split-Path -Parent $TargetPath
  New-Item -ItemType Directory -Force $TargetDirectory | Out-Null

  $Source = [System.Drawing.Bitmap]::FromFile((Resolve-Path $SourcePath))
  $MinX = $Source.Width
  $MinY = $Source.Height
  $MaxX = -1
  $MaxY = -1

  $ScanStep = 6
  for ($Y = 0; $Y -lt $Source.Height; $Y += $ScanStep) {
    for ($X = 0; $X -lt $Source.Width; $X += $ScanStep) {
      $Pixel = $Source.GetPixel($X, $Y)
      if (-not (Test-ChromaPixel $Pixel)) {
        if ($X -lt $MinX) { $MinX = $X }
        if ($Y -lt $MinY) { $MinY = $Y }
        if ($X -gt $MaxX) { $MaxX = $X }
        if ($Y -gt $MaxY) { $MaxY = $Y }
      }
    }
  }

  $Bounds = [System.Drawing.Rectangle]::new($MinX, $MinY, $MaxX - $MinX + 1, $MaxY - $MinY + 1)
  $Slot = $Slots[$Asset.Slot]
  $Scale = [Math]::Min($Slot.Width / $Bounds.Width, $Slot.Height / $Bounds.Height)
  $DrawWidth = [int]($Bounds.Width * $Scale)
  $DrawHeight = [int]($Bounds.Height * $Scale)
  $DrawX = [int]($Slot.X + (($Slot.Width - $DrawWidth) / 2))
  $DrawY = [int]($Slot.Y + (($Slot.Height - $DrawHeight) / 2))

  $Canvas = New-Object System.Drawing.Bitmap $CanvasWidth, $CanvasHeight, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $Graphics = [System.Drawing.Graphics]::FromImage($Canvas)
  $Graphics.Clear([System.Drawing.Color]::Transparent)
  $Graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
  $Graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $ImageAttributes = New-Object System.Drawing.Imaging.ImageAttributes
  $ImageAttributes.SetColorKey([System.Drawing.Color]::FromArgb(0, 150, 0), [System.Drawing.Color]::FromArgb(145, 255, 145))
  $Graphics.DrawImage($Source, [System.Drawing.Rectangle]::new($DrawX, $DrawY, $DrawWidth, $DrawHeight), $Bounds.X, $Bounds.Y, $Bounds.Width, $Bounds.Height, [System.Drawing.GraphicsUnit]::Pixel, $ImageAttributes)
  $Canvas.Save($TargetPath, [System.Drawing.Imaging.ImageFormat]::Png)

  $Graphics.Dispose()
  $Canvas.Dispose()
  $Source.Dispose()
  Write-Output "Normalized $($Asset.Source) -> $TargetPath"
}
  $ImageAttributes.Dispose()
