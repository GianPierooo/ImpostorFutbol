# 📱 Guía Completa para Publicar en Google Play Store

## ✅ Estado Actual del Proyecto

### Lo que YA está configurado:
- ✅ **API 35** (targetSdkVersion = 35, compileSdkVersion = 35)
- ✅ Script para generar AAB: `generar-aab-release.ps1`
- ✅ Versión configurada: versionCode 5, versionName "1.5"
- ✅ Hermes habilitado
- ✅ Arquitecturas: armeabi-v7a, arm64-v8a

### Lo que FALTA hacer:

## 🔐 Paso 1: Crear Keystore de Producción

**⚠️ CRÍTICO**: Google Play NO acepta apps firmadas con el keystore de debug. Debes crear uno de producción.

### Opción A: Usar el script automatizado (RECOMENDADO)

1. Ejecuta el script desde PowerShell:
```powershell
.\crear-keystore-produccion.ps1
```

2. El script te pedirá:
   - Contraseña para el keystore (guárdala bien)
   - Contraseña para la clave (puede ser la misma)
   - Información del certificado

3. El keystore se creará en: `android/app/release.keystore`

### Opción B: Crear manualmente

Ejecuta este comando en la carpeta `android/app`:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore -alias impostor-futbol-key -keyalg RSA -keysize 2048 -validity 10000
```

**Importante**: Anota las contraseñas que uses. Las necesitarás más adelante.

---

## 📝 Paso 2: Configurar Credenciales

### Crear archivo keystore.properties

1. Copia el archivo de ejemplo:
```powershell
Copy-Item android\keystore.properties.example android\keystore.properties
```

2. Edita `android/keystore.properties` con tus credenciales:
```properties
storeFile=release.keystore
storePassword=TU_CONTRASEÑA_KEYSTORE
keyAlias=impostor-futbol-key
keyPassword=TU_CONTRASEÑA_KEY
```

**⚠️ IMPORTANTE**: 
- `keystore.properties` NO se sube al repositorio (está en .gitignore)
- Guarda este archivo en un lugar seguro
- Si trabajas en equipo, comparte las credenciales de forma segura (no por email plano)

---

## 🏗️ Paso 3: Verificar Configuración

El `build.gradle` ya está configurado para:
- Leer `keystore.properties` si existe
- Usar el keystore de producción para release
- Fallback a debug keystore solo si no existe configuración (NO válido para Play Store)

**Verifica que**:
- ✅ El archivo `android/keystore.properties` existe
- ✅ Contiene las credenciales correctas
- ✅ El archivo `android/app/release.keystore` existe

---

## 📦 Paso 4: Generar Android App Bundle (AAB)

Google Play requiere **AAB** (Android App Bundle), NO APK.

### Opción A: Usar el script automatizado (RECOMENDADO)

**⚠️ IMPORTANTE**: El script está en la **raíz del proyecto**, NO en la carpeta `android`.

Desde la raíz del proyecto (donde está el archivo `package.json`), ejecuta:
```powershell
.\generar-aab-release.ps1
```

El script automáticamente:
1. Limpia builds anteriores
2. Genera el bundle de JavaScript
3. Genera el AAB firmado
4. Copia el AAB a `versiones/impostor-futbol-v1.6-code6.aab` (con la versión actual)

### Opción B: Pasos manuales

Si prefieres ejecutar los comandos manualmente (o si el script no funciona):

**1. Desde la raíz del proyecto, limpia builds anteriores:**
```powershell
cd android
.\gradlew.bat clean
cd ..
```

**2. Genera el bundle de JavaScript:**
```powershell
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
```

**3. Genera el AAB:**
```powershell
cd android
.\gradlew.bat bundleRelease
cd ..
```

**4. El AAB estará en:**
- `android/app/build/outputs/bundle/release/app-release.aab`

**5. (Opcional) Copia el AAB a la carpeta versiones:**
```powershell
# Asegúrate de estar en la raíz del proyecto
$versionName = "1.6"  # Cambia según tu versión
$versionCode = "6"    # Cambia según tu versionCode
Copy-Item "android\app\build\outputs\bundle\release\app-release.aab" "versiones\impostor-futbol-v$versionName-code$versionCode.aab"
```

### Verificar que el AAB esté firmado correctamente

Después de generar el AAB, verifica que esté firmado:
```powershell
jarsigner -verify -verbose -certs android\app\build\outputs\bundle\release\app-release.aab
```

Deberías ver: `jar verified.`

---

## 📋 Paso 5: Requisitos Adicionales para Google Play

### 5.1. Ícono de la App

Verifica que tienes:
- ✅ `android/app/src/main/res/mipmap-*/ic_launcher.png` (varios tamaños)
- ✅ `android/app/src/main/res/mipmap-*/ic_launcher_round.png` (varios tamaños)

### 5.2. Nombre de la App

Verifica en `android/app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">Impostor Fútbol</string>
```

### 5.3. Permisos

Verifica en `AndroidManifest.xml` que solo tengas los permisos necesarios:
- ✅ `INTERNET` (necesario para modo online)
- ✅ `VIBRATE` (necesario para feedback háptico)

### 5.4. Política de Privacidad

**⚠️ IMPORTANTE**: Google Play requiere una Política de Privacidad si tu app:
- Recopila datos personales
- Usa Internet
- Accede a información del dispositivo

Como tu app usa Internet y tiene modo online, **NECESITAS** crear una política de privacidad.

**Crea una página web simple** con tu política y guarda la URL. Ejemplo:
- GitHub Pages (gratis): Crea un repositorio `tu-usuario.github.io/politica-privacidad`
- O cualquier hosting (puede ser un archivo HTML simple)

**Contenido mínimo necesario**:
- Qué datos recopilas (nombres de usuario, partidas jugadas)
- Cómo los usas
- Si compartes datos con terceros
- Cómo contactar para dudas

---

## 🚀 Paso 6: Subir a Google Play Console

### 6.1. Crear cuenta de desarrollador

1. Ve a: https://play.google.com/console
2. Crea una cuenta de desarrollador (cuesta **$25 USD única vez**)
3. Completa el perfil de desarrollador

### 6.2. Crear nueva aplicación

1. En Google Play Console, haz clic en "Crear aplicación"
2. Completa:
   - **Nombre de la app**: Impostor Fútbol
   - **Idioma predeterminado**: Español (o el que prefieras)
   - **Tipo**: Aplicación
   - **Gratuita o de pago**: Gratuita

### 6.3. Configurar información de la tienda

Necesitarás:
- **Descripción corta** (80 caracteres máximo)
- **Descripción completa** (4000 caracteres máximo)
- **Capturas de pantalla** (mínimo 2, recomendado 8):
  - Teléfono: 16:9 o 9:16
  - Tablet (opcional): 16:9 o 9:16
- **Ícono de la app** (512x512 px, PNG sin transparencia)
- **Imagen destacada** (1024x500 px)
- **Política de privacidad**: URL de tu política
- **Categoría**: Juegos > Casual o Social

### 6.4. Subir AAB

1. Ve a "Producción" > "Crear nueva versión"
2. Sube el archivo `.aab` que generaste
3. Completa las notas de la versión (qué hay de nuevo)
4. Revisa y envía para revisión

---

## ⚠️ Problemas Comunes y Soluciones

### Error: "El AAB no está firmado"

**Solución**: Verifica que `keystore.properties` existe y tiene las credenciales correctas.

### Error: "targetSdkVersion debe ser 33 o superior"

**Solución**: Ya está en 35, pero verifica:
```bash
# En android/build.gradle debe ser:
targetSdkVersion = 35
```

### Error: "usesCleartextTraffic no permitido"

**Solución**: Tu app usa HTTP (no HTTPS) porque el backend está en `163.192.223.30`. Google Play puede rechazar esto. Opciones:
- **Opción 1**: Configurar HTTPS en tu servidor (recomendado)
- **Opción 2**: Agregar excepción de seguridad (menos seguro):
  - Crea `android/app/src/main/res/xml/network_security_config.xml`
  - Configura excepciones específicas

### Error: "Nombre de paquete ya existe"

**Solución**: Cambia `applicationId` en `build.gradle`:
```gradle
applicationId "com.tudominio.impostorfutbol"
```

### Error: "Debes subir un APK o un Android App Bundle para esta app"

Este error puede ocurrir por varias razones:

**Solución**:
1. **Verifica que el AAB se subió correctamente**: Asegúrate de que el archivo `.aab` se subió completamente y que tiene un tamaño razonable (generalmente > 5 MB)
2. **Verifica la firma**: El AAB debe estar firmado correctamente. Verifica con:
   ```powershell
   jarsigner -verify -verbose -certs android\app\build\outputs\bundle\release\app-release.aab
   ```
   Debe mostrar `jar verified.`
3. **Regenera el AAB**: Ejecuta el script nuevamente:
   ```powershell
   .\generar-aab-release.ps1
   ```
4. **Aumenta el versionCode**: Si ya subiste una versión, incrementa el `versionCode` en `android/app/build.gradle`:
   ```gradle
   versionCode 6  // Debe ser mayor que la versión anterior
   ```

### Error: "No puedes lanzar esta versión debido a que no permite que ningún usuario existente actualice los nuevos paquetes de aplicaciones agregados"

Este error ocurre cuando hay problemas con la configuración de arquitecturas (ABI splits) o cambios en las arquitecturas soportadas.

**Solución**:
1. **Ya está corregido en el build.gradle**: El archivo `android/app/build.gradle` ahora tiene la configuración correcta de `bundle` splits
2. **Regenera el AAB con la nueva configuración**:
   ```powershell
   .\generar-aab-release.ps1
   ```
3. **Si es la primera versión de la app**: En Google Play Console, elimina la versión actual (si la hay) y sube el nuevo AAB
4. **Verifica las arquitecturas**: Asegúrate de que las arquitecturas en `abiFilters` coincidan con versiones anteriores (si las hay):
   ```gradle
   abiFilters "armeabi-v7a", "arm64-v8a"
   ```

### Error: "Esta versión no agrega ni quita ningún paquete de aplicaciones"

Este error puede aparecer junto con el anterior y generalmente indica un problema con la configuración de splits.

**Solución**:
1. **Usa la configuración actualizada**: El `build.gradle` ya tiene la configuración correcta con `bundle { abi { enableSplit = false } }`
2. **Regenera el AAB**:
   ```powershell
   .\generar-aab-release.ps1
   ```
3. **Asegúrate de que el versionCode aumentó**: Si es una actualización, el `versionCode` debe ser mayor:
   ```gradle
   versionCode 6  // Incrementa desde 5
   versionName "1.6"  // Opcional: actualiza también la versión visible
   ```
4. **Si persiste el problema**: Elimina la versión actual en Google Play Console y sube el AAB nuevamente (esto solo aplica si aún no hay usuarios con la app instalada)

**⚠️ IMPORTANTE**: Si ya tienes usuarios con la app instalada, NO elimines la versión. En su lugar, asegúrate de que el nuevo AAB tenga el mismo `applicationId` y las mismas arquitecturas que la versión anterior.

---

## 📊 Checklist Final Antes de Publicar

- [ ] ✅ Keystore de producción creado y guardado en lugar seguro
- [ ] ✅ `keystore.properties` configurado correctamente
- [ ] ✅ AAB generado y verificado
- [ ] ✅ API 35 configurado (targetSdkVersion = 35)
- [ ] ✅ Versión actualizada (versionCode y versionName)
- [ ] ✅ Íconos y recursos gráficos listos
- [ ] ✅ Política de privacidad creada y publicada
- [ ] ✅ Capturas de pantalla preparadas
- [ ] ✅ Descripción de la app escrita
- [ ] ✅ Cuenta de desarrollador de Google Play creada
- [ ] ✅ AAB subido a Google Play Console

---

## 🔄 Actualizaciones Futuras

Cada vez que quieras actualizar la app:

1. **Incrementa versionCode** en `android/app/build.gradle`:
   ```gradle
   versionCode 6  // Siempre mayor que la anterior
   versionName "1.6"  // Versión visible para usuarios
   ```

2. **Genera nuevo AAB**:
   ```powershell
   .\generar-aab-release.ps1
   ```

3. **Sube el nuevo AAB** en Google Play Console

**⚠️ IMPORTANTE**: 
- **NUNCA** pierdas el `release.keystore`
- **SIEMPRE** usa el mismo keystore para todas las actualizaciones
- Si pierdes el keystore, **NO podrás actualizar** tu app (tendrás que crear una nueva)

---

## 📞 Soporte

Si tienes problemas:
1. Verifica que todos los pasos anteriores están completos
2. Revisa los logs de compilación
3. Verifica que las credenciales del keystore son correctas
4. Consulta la documentación oficial: https://developer.android.com/studio/publish

---

**Última actualización**: Enero 2025
**Versión del proyecto**: 1.5 (API 35)

