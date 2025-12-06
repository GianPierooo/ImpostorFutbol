# Script para crear estructura Android básica
# Este script crea la estructura mínima necesaria para React Native

Write-Host "🔧 Creando estructura Android..." -ForegroundColor Cyan

$androidDir = "android"
$sdkPath = "$env:LOCALAPPDATA\Android\Sdk"

# Crear estructura de directorios
New-Item -ItemType Directory -Force -Path "$androidDir\app\src\main\java\com\impostorfutbol" | Out-Null
New-Item -ItemType Directory -Force -Path "$androidDir\app\src\main\res\values" | Out-Null
New-Item -ItemType Directory -Force -Path "$androidDir\app\src\main\res\mipmap-hdpi" | Out-Null
New-Item -ItemType Directory -Force -Path "$androidDir\app\src\main\res\mipmap-mdpi" | Out-Null
New-Item -ItemType Directory -Force -Path "$androidDir\app\src\main\res\mipmap-xhdpi" | Out-Null
New-Item -ItemType Directory -Force -Path "$androidDir\app\src\main\res\mipmap-xxhdpi" | Out-Null
New-Item -ItemType Directory -Force -Path "$androidDir\app\src\main\res\mipmap-xxxhdpi" | Out-Null
New-Item -ItemType Directory -Force -Path "$androidDir\gradle\wrapper" | Out-Null

Write-Host "✅ Estructura de directorios creada" -ForegroundColor Green

# Crear local.properties
$localProperties = "sdk.dir=$sdkPath"
$localProperties | Out-File -FilePath "$androidDir\local.properties" -Encoding utf8
Write-Host "✅ local.properties creado" -ForegroundColor Green

Write-Host ""
Write-Host "⚠️  IMPORTANTE: Este script solo crea la estructura básica." -ForegroundColor Yellow
Write-Host "Para un proyecto completo, necesitas:" -ForegroundColor Yellow
Write-Host "1. Copiar la carpeta android/ de un proyecto React Native 0.73 funcionando" -ForegroundColor White
Write-Host "2. O usar: npx react-native init NuevoProyecto y copiar android/ desde ahí" -ForegroundColor White
Write-Host ""
Write-Host "💡 Alternativa más fácil: Usa Expo Go para probar rápidamente" -ForegroundColor Cyan

