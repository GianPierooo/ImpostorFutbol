# Script para generar íconos de la app en diferentes tamaños
# Requiere la imagen original en assets/images/logo-ball-hat.png

$ErrorActionPreference = "Stop"

Write-Host "Generando íconos de la app..." -ForegroundColor Green

# Verificar que existe la imagen original
$sourceImage = "assets/images/logo-ball-hat.png"
if (-not (Test-Path $sourceImage)) {
    Write-Host "ERROR: No se encuentra la imagen $sourceImage" -ForegroundColor Red
    exit 1
}

# Tamaños para cada resolución
$sizes = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

# Cargar System.Drawing
Add-Type -AssemblyName System.Drawing

try {
    # Cargar la imagen original
    $originalImage = [System.Drawing.Image]::FromFile((Resolve-Path $sourceImage).Path)
    
    foreach ($folder in $sizes.Keys) {
        $size = $sizes[$folder]
        $folderPath = "android/app/src/main/res/$folder"
        
        # Crear carpeta si no existe
        if (-not (Test-Path $folderPath)) {
            New-Item -ItemType Directory -Path $folderPath -Force | Out-Null
        }
        
        Write-Host "Generando ícono $size x $size para $folder..." -ForegroundColor Yellow
        
        # Crear nueva imagen redimensionada
        $newImage = New-Object System.Drawing.Bitmap($size, $size)
        $graphics = [System.Drawing.Graphics]::FromImage($newImage)
        
        # Configurar alta calidad
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        
        # Dibujar la imagen redimensionada
        $graphics.DrawImage($originalImage, 0, 0, $size, $size)
        
        # Guardar como ic_launcher.png
        $icLauncherPath = Join-Path $folderPath "ic_launcher.png"
        $newImage.Save($icLauncherPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # Guardar como ic_launcher_round.png (mismo archivo, Android lo maneja)
        $icLauncherRoundPath = Join-Path $folderPath "ic_launcher_round.png"
        $newImage.Save($icLauncherRoundPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # Liberar recursos
        $graphics.Dispose()
        $newImage.Dispose()
        
        Write-Host "  ✓ Generado: $icLauncherPath" -ForegroundColor Green
        Write-Host "  ✓ Generado: $icLauncherRoundPath" -ForegroundColor Green
    }
    
    # Liberar imagen original
    $originalImage.Dispose()
    
    Write-Host "`n¡Íconos generados exitosamente!" -ForegroundColor Green
    Write-Host "Los íconos están listos en las carpetas mipmap-*" -ForegroundColor Cyan
    
} catch {
    Write-Host "ERROR al generar íconos: $_" -ForegroundColor Red
    Write-Host "Asegúrate de que la imagen sea un PNG válido" -ForegroundColor Yellow
    exit 1
}

