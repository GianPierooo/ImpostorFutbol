# Script para generar APK de versión y copiarlo a la carpeta versiones
param(
    [string]$version = ""
)

# Si no se especifica versión, detectar la última y sugerir la siguiente
if ($version -eq "") {
    $versiones = Get-ChildItem -Path "versiones" -Filter "impostor-futbol-v*.apk" | Sort-Object Name -Descending
    
    if ($versiones.Count -eq 0) {
        $version = "1.0"
        Write-Host "No se encontraron versiones anteriores. Usando v1.0" -ForegroundColor Yellow
    } else {
        $ultimaVersion = $versiones[0].Name
        # Extraer número de versión (ej: "impostor-futbol-v1.4.apk" -> "1.4")
        if ($ultimaVersion -match "v(\d+)\.(\d+)") {
            $major = [int]$matches[1]
            $minor = [int]$matches[2]
            $minor++
            $version = "$major.$minor"
            Write-Host "Última versión encontrada: $ultimaVersion" -ForegroundColor Cyan
            Write-Host "Generando versión: v$version" -ForegroundColor Green
        } else {
            $version = "1.5"
            Write-Host "No se pudo detectar la versión. Usando v$version" -ForegroundColor Yellow
        }
    }
}

$nombreArchivo = "impostor-futbol-v$version.apk"
$rutaDestino = "versiones\$nombreArchivo"
$rutaOrigen = "android\app\build\outputs\apk\release\app-release.apk"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Generando APK versión $version" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Verificar y crear carpeta assets si no existe
$assetsDir = "android\app\src\main\assets"
if (-not (Test-Path $assetsDir)) {
    Write-Host "[0/4] Creando carpeta assets..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $assetsDir -Force | Out-Null
    Write-Host "✅ Carpeta assets creada" -ForegroundColor Green
}

# Paso 1: Generar bundle
Write-Host "[1/4] Generando bundle de JavaScript..." -ForegroundColor Yellow
npm run build:bundle:android
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al generar bundle" -ForegroundColor Red
    exit 1
}

# Paso 2: Limpiar y compilar APK
Write-Host "[2/4] Compilando APK de release..." -ForegroundColor Yellow
cd android
.\gradlew.bat clean
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al limpiar proyecto" -ForegroundColor Red
    cd ..
    exit 1
}

.\gradlew.bat assembleRelease
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al compilar APK" -ForegroundColor Red
    cd ..
    exit 1
}
cd ..

# Paso 3: Verificar que existe el APK
if (-not (Test-Path $rutaOrigen)) {
    Write-Host "Error: No se encontró el APK en $rutaOrigen" -ForegroundColor Red
    exit 1
}

# Paso 4: Crear carpeta versiones si no existe
if (-not (Test-Path "versiones")) {
    New-Item -ItemType Directory -Path "versiones" | Out-Null
    Write-Host "[3/4] Carpeta 'versiones' creada" -ForegroundColor Green
}

# Paso 5: Copiar APK a carpeta versiones
Write-Host "[4/4] Copiando APK a versiones\$nombreArchivo..." -ForegroundColor Yellow
Copy-Item -Path $rutaOrigen -Destination $rutaDestino -Force

if (Test-Path $rutaDestino) {
    $tamano = (Get-Item $rutaDestino).Length / 1MB
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "✅ APK generado exitosamente!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Versión: v$version" -ForegroundColor White
    Write-Host "Archivo: $rutaDestino" -ForegroundColor White
    Write-Host "Tamaño: $([math]::Round($tamano, 2)) MB" -ForegroundColor White
    Write-Host "========================================`n" -ForegroundColor Green
} else {
    Write-Host "Error al copiar el APK" -ForegroundColor Red
    exit 1
}

