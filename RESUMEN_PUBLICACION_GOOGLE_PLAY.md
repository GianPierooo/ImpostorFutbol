# 📋 Resumen: Pasos para Publicar en Google Play

## ✅ Lo que YA tienes configurado:

1. ✅ **API 35** - Ya está configurado correctamente
2. ✅ **Script para generar AAB** - `generar-aab-release.ps1`
3. ✅ **Versión** - versionCode 5, versionName "1.5"
4. ✅ **Configuración de signing** - Lista en build.gradle (solo falta crear el keystore)

---

## 🎯 Lo que debes hacer AHORA (en orden):

### 1️⃣ Crear Keystore de Producción (5 minutos)

```powershell
.\crear-keystore-produccion.ps1
```

**¿Qué hace este script?**
- Crea el archivo `android/app/release.keystore`
- Te pide contraseñas (anótalas en un lugar seguro)
- Opcionalmente crea `android/keystore.properties`

**⚠️ IMPORTANTE**: 
- Guarda el keystore en un lugar seguro (nube, respaldo externo)
- Si lo pierdes, NO podrás actualizar tu app nunca más
- Anota las contraseñas en un gestor de contraseñas

---

### 2️⃣ Configurar keystore.properties (si no se creó automáticamente)

Si el script no creó el archivo automáticamente:

1. Copia el ejemplo:
   ```powershell
   Copy-Item android\keystore.properties.example android\keystore.properties
   ```

2. Edita `android/keystore.properties` y completa:
   ```properties
   storeFile=release.keystore
   storePassword=TU_CONTRASEÑA_KEYSTORE
   keyAlias=impostor-futbol-key
   keyPassword=TU_CONTRASEÑA_KEY
   ```

---

### 3️⃣ Generar el AAB (2-5 minutos)

```powershell
.\generar-aab-release.ps1
```

El archivo se generará en: `versiones/impostor-futbol-v1.5-code5.aab`

**Verifica que está firmado correctamente**:
```powershell
jarsigner -verify -verbose -certs versiones\impostor-futbol-v1.5-code5.aab
```

Debes ver: `jar verified.`

---

### 4️⃣ Preparar Material para Google Play Console

**Necesitarás:**
- ✅ **Capturas de pantalla** (mínimo 2):
  - Formato: 16:9 o 9:16
  - Resolución: Al menos 320px de altura
  - Recomendado: 8 capturas mostrando diferentes pantallas
  
- ✅ **Ícono de la app**:
  - Tamaño: 512x512 px
  - Formato: PNG (sin transparencia)
  - Ubicación actual: `android/app/src/main/res/mipmap-*/ic_launcher.png`

- ✅ **Imagen destacada** (opcional pero recomendado):
  - Tamaño: 1024x500 px
  - Formato: PNG o JPG

- ✅ **Descripción**:
  - Corta: Máximo 80 caracteres
  - Completa: Máximo 4000 caracteres
  
- ✅ **Política de privacidad**:
  - URL pública accesible
  - **REQUERIDO** porque tu app usa Internet
  
  **Opción rápida**: Crea un archivo HTML simple y súbelo a GitHub Pages:
  1. Crea repositorio: `tu-usuario.github.io`
  2. Crea carpeta: `politica-privacidad`
  3. Crea `index.html` con tu política
  4. URL será: `https://tu-usuario.github.io/politica-privacidad`

---

### 5️⃣ Crear cuenta en Google Play Console

1. Ve a: https://play.google.com/console
2. Crea cuenta de desarrollador (cuesta **$25 USD** - pago único)
3. Completa perfil de desarrollador

---

### 6️⃣ Subir la app

1. **Crear aplicación**:
   - Nombre: "Impostor Fútbol"
   - Tipo: Aplicación
   - Gratuita

2. **Completar información de la tienda**:
   - Descripción corta y completa
   - Capturas de pantalla
   - Ícono
   - Política de privacidad (URL)

3. **Subir AAB**:
   - Ve a "Producción" > "Crear nueva versión"
   - Sube el archivo `.aab`
   - Agrega notas de la versión (ej: "Versión inicial")

4. **Enviar para revisión**

---

## ⚠️ Problemas Potenciales y Soluciones

### Problema: "usesCleartextTraffic no permitido"

Tu app usa HTTP (no HTTPS) porque tu servidor está en `http://163.192.223.30:3000`.

**Solución temporal**: Ya tienes `android:usesCleartextTraffic="true"` en el AndroidManifest, pero Google puede rechazarlo.

**Solución definitiva**: Configurar HTTPS en tu servidor (recomendado para producción).

**Solución alternativa**: Crear network security config que permita solo tu servidor:
1. Crear `android/app/src/main/res/xml/network_security_config.xml`
2. Permitir solo tu IP específica

### Problema: "El AAB no está firmado"

**Solución**: Verifica que:
- ✅ `android/keystore.properties` existe
- ✅ Tiene las credenciales correctas
- ✅ `android/app/release.keystore` existe

---

## 📊 Checklist Final

Antes de subir, verifica:

- [ ] ✅ Keystore de producción creado
- [ ] ✅ keystore.properties configurado
- [ ] ✅ AAB generado y verificado con `jarsigner`
- [ ] ✅ API 35 configurado (targetSdkVersion = 35)
- [ ] ✅ Capturas de pantalla preparadas (mínimo 2)
- [ ] ✅ Ícono de 512x512 px
- [ ] ✅ Descripción escrita
- [ ] ✅ Política de privacidad publicada (URL)
- [ ] ✅ Cuenta de Google Play Console creada
- [ ] ✅ Versión actualizada (versionCode mayor que 5 si ya subiste antes)

---

## 🚀 Comandos Rápidos de Referencia

```powershell
# 1. Crear keystore
.\crear-keystore-produccion.ps1

# 2. Generar AAB
.\generar-aab-release.ps1

# 3. Verificar firma del AAB
jarsigner -verify -verbose -certs versiones\impostor-futbol-v1.5-code5.aab

# 4. Ver versión actual
Get-Content android\app\build.gradle | Select-String "versionCode|versionName"
```

---

## 📝 Para Futuras Actualizaciones

1. **Incrementa versionCode** en `android/app/build.gradle`:
   ```gradle
   versionCode 6  // Siempre mayor
   versionName "1.6"
   ```

2. **Genera nuevo AAB**:
   ```powershell
   .\generar-aab-release.ps1
   ```

3. **Sube a Google Play Console**

**⚠️ NUNCA cambies el keystore** - usa siempre el mismo `release.keystore` para todas las actualizaciones.

---

## 📞 Ayuda

Si tienes problemas:
1. Revisa `GUIA_GOOGLE_PLAY.md` (guía completa)
2. Verifica que todos los pasos del checklist están completos
3. Consulta: https://developer.android.com/studio/publish

---

**Tiempo estimado total**: 1-2 horas (incluyendo preparar capturas y descripción)

**Costo**: $25 USD (pago único a Google)

