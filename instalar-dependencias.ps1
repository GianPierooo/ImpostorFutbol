# Script de Instalación Automática - Impostor Fútbol
# Ejecutar como Administrador

Write-Host "🔧 Instalando dependencias para Impostor Fútbol..." -ForegroundColor Cyan
Write-Host ""

# Verificar si se ejecuta como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  Este script necesita ejecutarse como Administrador" -ForegroundColor Yellow
    Write-Host "   Click derecho en PowerShell > Ejecutar como administrador" -ForegroundColor Yellow
    exit 1
}

# 1. Verificar Node.js
Write-Host "📦 Verificando Node.js..." -ForegroundColor Green
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "   ✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ Node.js no encontrado. Instálalo desde: https://nodejs.org/" -ForegroundColor Red
}

# 2. Verificar npm
Write-Host "📦 Verificando npm..." -ForegroundColor Green
$npmVersion = npm --version 2>$null
if ($npmVersion) {
    Write-Host "   ✅ npm instalado: v$npmVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ npm no encontrado" -ForegroundColor Red
}

# 3. Verificar Java
Write-Host "☕ Verificando Java JDK..." -ForegroundColor Green
$javaVersion = java -version 2>&1 | Select-Object -First 1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Java instalado: $javaVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ Java JDK no encontrado" -ForegroundColor Red
    Write-Host "   📥 Instalando Java JDK 17..." -ForegroundColor Yellow
    
    # Verificar si Chocolatey está instalado
    $chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue
    if ($chocoInstalled) {
        Write-Host "   Usando Chocolatey para instalar Java..." -ForegroundColor Yellow
        choco install openjdk17 -y
    } else {
        Write-Host "   ⚠️  Chocolatey no está instalado" -ForegroundColor Yellow
        Write-Host "   📥 Descarga Java JDK 17 manualmente desde:" -ForegroundColor Yellow
        Write-Host "      https://adoptium.net/temurin/releases/" -ForegroundColor Cyan
        Write-Host "   Selecciona: Version 17, Windows, x64, JDK" -ForegroundColor Yellow
    }
}

# 4. Verificar Android SDK
Write-Host "📱 Verificando Android SDK..." -ForegroundColor Green
$androidSdkPath = "$env:LOCALAPPDATA\Android\Sdk"
if (Test-Path $androidSdkPath) {
    Write-Host "   ✅ Android SDK encontrado en: $androidSdkPath" -ForegroundColor Green
} else {
    Write-Host "   ❌ Android SDK no encontrado" -ForegroundColor Red
    Write-Host "   📥 Instala Android Studio desde: https://developer.android.com/studio" -ForegroundColor Yellow
}

# 5. Verificar Android Studio
Write-Host "🛠️  Verificando Android Studio..." -ForegroundColor Green
$studioPaths = @(
    "C:\Program Files\Android\Android Studio\bin\studio64.exe",
    "C:\Program Files (x86)\Android\Android Studio\bin\studio64.exe",
    "$env:LOCALAPPDATA\Programs\Android Studio\bin\studio64.exe"
)
$studioFound = $false
foreach ($path in $studioPaths) {
    if (Test-Path $path) {
        Write-Host "   ✅ Android Studio encontrado: $path" -ForegroundColor Green
        $studioFound = $true
        break
    }
}
if (-not $studioFound) {
    Write-Host "   ❌ Android Studio no encontrado" -ForegroundColor Red
    Write-Host "   📥 Instala Android Studio desde: https://developer.android.com/studio" -ForegroundColor Yellow
}

# 6. Verificar variables de entorno
Write-Host "🔧 Verificando variables de entorno..." -ForegroundColor Green
if ($env:ANDROID_HOME) {
    Write-Host "   ✅ ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  ANDROID_HOME no configurada" -ForegroundColor Yellow
    Write-Host "   Configúrala manualmente en Variables de entorno del sistema" -ForegroundColor Yellow
}

if ($env:JAVA_HOME) {
    Write-Host "   ✅ JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  JAVA_HOME no configurada" -ForegroundColor Yellow
    Write-Host "   Configúrala manualmente en Variables de entorno del sistema" -ForegroundColor Yellow
}

# 7. Instalar dependencias del proyecto
Write-Host ""
Write-Host "📦 Instalando dependencias del proyecto..." -ForegroundColor Cyan
$projectPath = Get-Location
if (Test-Path "$projectPath\package.json") {
    Write-Host "   Instalando npm packages..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Dependencias instaladas correctamente" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Error al instalar dependencias" -ForegroundColor Red
    }
} else {
    Write-Host "   ⚠️  No se encontró package.json en el directorio actual" -ForegroundColor Yellow
    Write-Host "   Navega al directorio del proyecto primero" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Verificación completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Completa las instalaciones faltantes (ver INSTALACION_COMPLETA.md)" -ForegroundColor White
Write-Host "   2. Configura variables de entorno si es necesario" -ForegroundColor White
Write-Host "   3. Reinicia la terminal después de instalar Java" -ForegroundColor White
Write-Host "   4. Ejecuta: npm start" -ForegroundColor White
Write-Host "   5. En otra terminal: npm run android" -ForegroundColor White

