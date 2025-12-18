# 🎵 Configuración de Efectos de Sonido

## ⚠️ IMPORTANTE: Error de Linking

Si ves el error "The package 'react-native-sound' doesn't seem to be linked", sigue estos pasos:

### Solución Rápida (Reconstruir la App)

1. **Detén el Metro bundler** (Ctrl+C en la terminal donde corre)

2. **Limpia el proyecto Android:**
   ```bash
   cd android
   .\gradlew clean
   cd ..
   ```

3. **Reconstruye la app:**
   ```bash
   npx react-native run-android
   ```

   O si estás usando iOS:
   ```bash
   cd ios
   pod install
   cd ..
   npx react-native run-ios
   ```

### Si el problema persiste:

El servicio de sonido está configurado para funcionar **sin sonidos** si el módulo no está disponible. La app funcionará normalmente, solo sin efectos de sonido.

Para habilitar los sonidos completamente, necesitas:
1. Asegurarte de que `react-native-sound` esté en `package.json`
2. Reconstruir completamente la app (no solo recargar)
3. Verificar que los archivos de sonido estén en las ubicaciones correctas

---

## ✅ Lo que está implementado

1. **Librería instalada**: `react-native-sound`
2. **Servicio de sonido**: `src/services/soundService.ts`
3. **Integración en componentes**:
   - `AnimatedButton` - Sonido al hacer click
   - `AppNavigator` - Sonido en transiciones
   - `RoleAssignment` - Sonido al revelar rol y flip de tarjeta
   - `Voting` - Sonido al votar

## 📦 Instalación de Archivos de Sonido

### Para Android

1. Crea la carpeta si no existe: `android/app/src/main/res/raw/`
2. Copia los archivos MP3 a esa carpeta
3. **IMPORTANTE**: Renombra los archivos **SIN extensión**:
   - `tap.mp3` → `tap`
   - `success.mp3` → `success`
   - `error.mp3` → `error`
   - `flip.mp3` → `flip`
   - `transition.mp3` → `transition`
   - `vote.mp3` → `vote`
   - `reveal.mp3` → `reveal`
   - `button_click.mp3` → `button_click`

### Para iOS

1. Abre el proyecto en Xcode: `ios/ImpostorFutbol.xcworkspace`
2. Arrastra los archivos MP3 a la carpeta del proyecto
3. Asegúrate de que estén marcados como "Copy items if needed"
4. Verifica que estén en "Target Membership"

## 🎨 Dónde conseguir sonidos

- **Pixabay**: https://pixabay.com/es/sound-effects/
- **Freesound**: https://freesound.org/
- **Zapsplat**: https://www.zapsplat.com/

## 🔧 Configuración del Servicio

El servicio está configurado para:
- Cargar sonidos automáticamente al iniciar la app
- Manejar errores silenciosamente (la app funciona sin sonidos)
- Permitir habilitar/deshabilitar sonidos
- Limpiar recursos al desmontar

## 📝 Uso en el código

```typescript
import { soundService, SoundType } from '../services';

// Reproducir un sonido
soundService.play(SoundType.TAP);

// Habilitar/deshabilitar sonidos
soundService.setEnabled(false);
```

## ⚠️ Nota Importante

Si no agregas los archivos de sonido, la aplicación funcionará normalmente pero sin efectos de sonido. El servicio maneja silenciosamente la ausencia de archivos.

## 🚀 Próximos pasos

1. Agregar los archivos de sonido según las instrucciones arriba
2. Probar en dispositivo (los sonidos no funcionan en emulador a veces)
3. Ajustar volúmenes en `src/services/soundService.ts` si es necesario

