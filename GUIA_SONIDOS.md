# 🎵 Guía Completa: Cómo Habilitar Efectos de Sonido

## 📋 ¿Qué significa "Reconstruir la App"?

**Reconstruir** = Recompilar el código nativo (Android/iOS) e instalar la app nuevamente en tu dispositivo.

### Diferencia entre Recargar y Reconstruir:

- **Recargar (Reload)**: Solo actualiza el código JavaScript. Presiona `R` en el Metro bundler o agita el dispositivo.
- **Reconstruir**: Compila todo el código nativo + JavaScript y genera un nuevo APK/IPA.

### ¿Cuándo necesitas reconstruir?

Cuando instalas un módulo **nativo** (que usa código de Android/iOS), como:
- `react-native-sound` ✅ (nuestro caso)
- `react-native-camera`
- `react-native-maps`
- Cualquier módulo que requiera código nativo

---

## 🔧 Paso 1: Reconstruir la App (Vincular el Módulo)

### Para Android:

1. **Detén el Metro bundler** si está corriendo (Ctrl+C)

2. **Limpia el proyecto:**
   ```bash
   cd android
   .\gradlew clean
   cd ..
   ```

3. **Reconstruye e instala la app:**
   ```bash
   npx react-native run-android
   ```
   
   Esto hará:
   - Compilar el código nativo de Android
   - Vincular `react-native-sound` automáticamente
   - Generar un nuevo APK
   - Instalarlo en tu dispositivo/emulador

### ⏱️ Tiempo estimado: 2-5 minutos

---

## 🎵 Paso 2: Agregar Archivos de Sonido

Los sonidos NO se escuchan porque **faltan los archivos MP3** en la app.

### 2.1 Descargar Archivos de Sonido

Puedes descargar efectos de sonido gratuitos desde:

- **Pixabay**: https://pixabay.com/es/sound-effects/
  - Busca: "button click", "card flip", "success", "error", etc.
- **Freesound**: https://freesound.org/
- **Zapsplat**: https://www.zapsplat.com/

### 2.2 Archivos Necesarios

Necesitas estos 8 archivos (pueden ser muy cortos, 0.1-0.5 segundos):

1. `tap.mp3` - Sonido de toque/click suave
2. `success.mp3` - Sonido de éxito/éxito
3. `error.mp3` - Sonido de error/advertencia
4. `flip.mp3` - Sonido de tarjeta volteándose
5. `transition.mp3` - Sonido de transición entre pantallas
6. `vote.mp3` - Sonido de voto/confirmación
7. `reveal.mp3` - Sonido dramático de revelación
8. `button_click.mp3` - Sonido de click de botón

### 2.3 Agregar Archivos a Android

1. **Crea la carpeta** (si no existe):
   ```
   android/app/src/main/res/raw/
   ```

2. **Copia los archivos MP3** a esa carpeta

3. **IMPORTANTE**: Renombra los archivos **SIN extensión**:
   - `tap.mp3` → `tap` (sin .mp3)
   - `success.mp3` → `success`
   - `error.mp3` → `error`
   - `flip.mp3` → `flip`
   - `transition.mp3` → `transition`
   - `vote.mp3` → `vote`
   - `reveal.mp3` → `reveal`
   - `button_click.mp3` → `button_click`

### 2.4 Estructura Final

```
android/app/src/main/res/
  └── raw/
      ├── tap
      ├── success
      ├── error
      ├── flip
      ├── transition
      ├── vote
      ├── reveal
      └── button_click
```

---

## ✅ Paso 3: Verificar que Funciona

1. **Reconstruye la app nuevamente** (para incluir los archivos de sonido):
   ```bash
   npx react-native run-android
   ```

2. **Prueba la app**:
   - Presiona botones → Deberías escuchar sonidos
   - Navega entre pantallas → Sonido de transición
   - Revela un rol → Sonido de flip/revelación
   - Vota → Sonido de voto

---

## 🐛 Solución de Problemas

### "No se escuchan sonidos"

1. ✅ Verifica que reconstruiste la app después de agregar los archivos
2. ✅ Verifica que los archivos están en `android/app/src/main/res/raw/`
3. ✅ Verifica que los archivos NO tienen extensión `.mp3`
4. ✅ Verifica que el volumen del dispositivo está activado
5. ✅ Prueba en un dispositivo real (los emuladores a veces no reproducen sonido)

### "Sigue apareciendo el error de linking"

1. Asegúrate de que `react-native-sound` está en `package.json`
2. Limpia completamente:
   ```bash
   cd android
   .\gradlew clean
   cd ..
   rm -rf node_modules
   npm install
   npx react-native run-android
   ```

---

## 📝 Resumen

**Para que los sonidos funcionen necesitas:**

1. ✅ Reconstruir la app (vincular el módulo nativo)
2. ✅ Agregar archivos de sonido MP3 a `android/app/src/main/res/raw/`
3. ✅ Renombrar archivos sin extensión
4. ✅ Reconstruir nuevamente para incluir los archivos

**Sin estos pasos, la app funcionará pero sin sonidos.**

