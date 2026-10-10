Add-Type -AssemblyName System.Drawing
$inPath = Join-Path $PSScriptRoot "..\public\logo.jpeg"
$outPng = Join-Path $PSScriptRoot "..\public\logo.png"
$outIco = Join-Path $PSScriptRoot "..\public\favicon.ico"
$outFavPng = Join-Path $PSScriptRoot "..\public\favicon.png"

$bmp = [System.Drawing.Bitmap]::FromFile($inPath)
$bmp.Save($outPng, [System.Drawing.Imaging.ImageFormat]::Png)

$iconBmp = New-Object System.Drawing.Bitmap($bmp, 64, 64)
$iconBmp.Save($outFavPng, [System.Drawing.Imaging.ImageFormat]::Png)

$hIcon = $iconBmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = New-Object System.IO.FileStream($outIco, [System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()

Write-Host "Icons generated successfully!"
