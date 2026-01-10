# Script para generar Android App Bundle (AAB) para Google Play Store
# Con targetSdkVersion 35 (Android 15)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Generando AAB para Play Store" -ForegroundColor Cyan
Write-Host "Target SDK: 35 (Android 15)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Limpiar builds anteriores
Write-Host "[1/4] Limpiando builds anteriores..." -ForegroundColor Yellow
cd android
.\gradlew.bat clean
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al limpiar el proyecto" -ForegroundColor Red
    cd ..
    exit 1
}
cd ..

# Paso 2: Generar bundle de JavaScript
Write-Host ""
Write-Host "[2/4] Generando bundle de JavaScript..." -ForegroundColor Yellow
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al generar el bundle" -ForegroundColor Red
    exit 1
}

# Paso 3: Generar AAB
Write-Host ""
Write-Host "[3/4] Generando Android App Bundle (AAB)..." -ForegroundColor Yellow
cd android
.\gradlew.bat bundleRelease
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al generar el AAB" -ForegroundColor Red
    cd ..
    exit 1
}
cd ..

# Paso 4: Copiar AAB a carpeta versiones
Write-Host ""
Write-Host "[4/4] Copiando AAB a carpeta versiones..." -ForegroundColor Yellow

# Crear carpeta versiones si no existe
if (!(Test-Path -Path "versiones")) {
    New-Item -ItemType Directory -Path "versiones" | Out-Null
}

# Leer versión del build.gradle
$buildGradle = Get-Content "android\app\build.gradle"
$versionName = ($buildGradle | Select-String 'versionName "(.+)"').Matches.Groups[1].Value
$versionCode = ($buildGradle | Select-String 'versionCode (\d+)').Matches.Groups[1].Value

$sourcePath = "android\app\build\outputs\bundle\release\app-release.aab"
$destPath = "versiones\impostor-futbol-v$versionName-code$versionCode.aab"

if (Test-Path $sourcePath) {
    Copy-Item $sourcePath $destPath -Force
    
    $fileSize = (Get-Item $destPath).Length / 1MB
    $fileSizeFormatted = "{0:N2}" -f $fileSize
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ AAB generado exitosamente!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Versión: v$versionName (code: $versionCode)" -ForegroundColor White
    Write-Host "Target SDK: 35 (Android 15)" -ForegroundColor White
    Write-Host "Archivo: $destPath" -ForegroundColor White
    Write-Host "Tamaño: $fileSizeFormatted MB" -ForegroundColor White
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📦 Archivo listo para subir a Google Play Console" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "Error: No se encontró el AAB generado" -ForegroundColor Red
    exit 1
}

