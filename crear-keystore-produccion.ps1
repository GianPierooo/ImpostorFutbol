# Script para crear keystore de producción para Google Play
# ⚠️ IMPORTANTE: Guarda bien las contraseñas y el archivo keystore. Si lo pierdes, no podrás actualizar tu app.

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Creando Keystore de Producción" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Yellow
Write-Host "   - Guarda este keystore en un lugar SEGURO (nube, respaldo, etc.)" -ForegroundColor Yellow
Write-Host "   - Si pierdes el keystore NO podrás actualizar tu app en Google Play" -ForegroundColor Yellow
Write-Host "   - Anota las contraseñas que uses en un lugar seguro" -ForegroundColor Yellow
Write-Host ""

$keyStorePath = "android\app\release.keystore"
$keyAlias = "impostor-futbol-key"
$validityYears = 10000

Write-Host "Configuración:" -ForegroundColor White
Write-Host "  - Alias: $keyAlias" -ForegroundColor Gray
Write-Host "  - Archivo: $keyStorePath" -ForegroundColor Gray
Write-Host "  - Validez: $validityYears años" -ForegroundColor Gray
Write-Host ""

# Solicitar contraseña para el keystore
$keystorePassword = Read-Host "Ingresa una contraseña SEGURA para el keystore (mínimo 6 caracteres)" -AsSecureString
$keystorePasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($keystorePassword))

if ($keystorePasswordPlain.Length -lt 6) {
    Write-Host "Error: La contraseña debe tener al menos 6 caracteres" -ForegroundColor Red
    exit 1
}

# Confirmar contraseña
$keystorePasswordConfirm = Read-Host "Confirma la contraseña del keystore" -AsSecureString
$keystorePasswordConfirmPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($keystorePasswordConfirm))

if ($keystorePasswordPlain -ne $keystorePasswordConfirmPlain) {
    Write-Host "Error: Las contraseñas no coinciden" -ForegroundColor Red
    exit 1
}

# Solicitar contraseña para la clave (puede ser la misma o diferente)
Write-Host ""
$keyPassword = Read-Host "Ingresa contraseña para la clave (puede ser la misma) [Enter para usar la misma]" -AsSecureString
$keyPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($keyPassword))

if ([string]::IsNullOrWhiteSpace($keyPasswordPlain)) {
    $keyPasswordPlain = $keystorePasswordPlain
}

# Verificar si ya existe el keystore
if (Test-Path $keyStorePath) {
    Write-Host ""
    Write-Host "⚠️  ADVERTENCIA: Ya existe un keystore en $keyStorePath" -ForegroundColor Yellow
    $overwrite = Read-Host "¿Deseas sobrescribirlo? (SI/NO)"
    if ($overwrite -ne "SI" -and $overwrite -ne "si" -and $overwrite -ne "Si") {
        Write-Host "Operación cancelada" -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "Creando keystore..." -ForegroundColor Yellow

# Crear el keystore usando keytool
$keytoolCommand = "keytool -genkeypair -v -storetype PKCS12 -keystore `"$keyStorePath`" -alias $keyAlias -keyalg RSA -keysize 2048 -validity $($validityYears * 365) -storepass `"$keystorePasswordPlain`" -keypass `"$keyPasswordPlain`""

# Información del certificado (puedes personalizar estos valores)
$dname = "CN=Impostor Futbol, OU=Development, O=Impostor Futbol, L=City, ST=State, C=ES"

try {
    # Ejecutar keytool
    $process = Start-Process -FilePath "keytool" -ArgumentList "-genkeypair", "-v", "-storetype", "PKCS12", "-keystore", "`"$keyStorePath`"", "-alias", "$keyAlias", "-keyalg", "RSA", "-keysize", "2048", "-validity", "$($validityYears * 365)", "-storepass", "`"$keystorePasswordPlain`"", "-keypass", "`"$keyPasswordPlain`"", "-dname", "`"$dname`"" -Wait -NoNewWindow -PassThru
    
    if ($process.ExitCode -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "✅ Keystore creado exitosamente!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 INFORMACIÓN IMPORTANTE (GUARDA ESTO):" -ForegroundColor Cyan
        Write-Host "   Archivo: $keyStorePath" -ForegroundColor White
        Write-Host "   Alias: $keyAlias" -ForegroundColor White
        Write-Host "   Contraseña keystore: [La que ingresaste]" -ForegroundColor White
        Write-Host "   Contraseña clave: [La que ingresaste]" -ForegroundColor White
        Write-Host ""
        
        # Crear archivo keystore.properties
        $keystorePropertiesPath = "android\keystore.properties"
        $createProps = Read-Host "¿Deseas crear el archivo keystore.properties automáticamente? (S/N)"
        
        if ($createProps -eq "S" -or $createProps -eq "s" -or $createProps -eq "SI" -or $createProps -eq "si") {
            $propsContent = @"
storeFile=release.keystore
storePassword=$keystorePasswordPlain
keyAlias=$keyAlias
keyPassword=$keyPasswordPlain
"@
            $propsContent | Out-File -FilePath $keystorePropertiesPath -Encoding UTF8 -NoNewline
            Write-Host ""
            Write-Host "✅ Archivo keystore.properties creado en: $keystorePropertiesPath" -ForegroundColor Green
            Write-Host "⚠️  Este archivo NO se sube al repositorio (está en .gitignore)" -ForegroundColor Yellow
        } else {
            Write-Host ""
            Write-Host "⚠️  PRÓXIMOS PASOS MANUALES:" -ForegroundColor Yellow
            Write-Host "   1. Crea el archivo: android\keystore.properties" -ForegroundColor White
            Write-Host "   2. Agrega este contenido:" -ForegroundColor White
            Write-Host ""
            Write-Host "   storeFile=release.keystore" -ForegroundColor Gray
            Write-Host "   storePassword=$keystorePasswordPlain" -ForegroundColor Gray
            Write-Host "   keyAlias=$keyAlias" -ForegroundColor Gray
            Write-Host "   keyPassword=$keyPasswordPlain" -ForegroundColor Gray
            Write-Host ""
            Write-Host "   (NOTA: storeFile es relativo a android/app/)" -ForegroundColor DarkGray
            Write-Host ""
        }
        
        Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Yellow
        Write-Host "   1. Guarda el archivo $keyStorePath en un lugar SEGURO (nube, respaldo)" -ForegroundColor White
        Write-Host "   2. Guarda las contraseñas en un gestor de contraseñas" -ForegroundColor White
        Write-Host "   3. Si pierdes el keystore NO podrás actualizar tu app en Google Play" -ForegroundColor Red
        Write-Host ""
    } else {
        Write-Host "Error al crear el keystore. Código de salida: $($process.ExitCode)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error: No se pudo ejecutar keytool. Asegúrate de tener JDK instalado." -ForegroundColor Red
    Write-Host "Mensaje: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

