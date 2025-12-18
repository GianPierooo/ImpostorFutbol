# 🎵 Archivos de Sonido

Esta carpeta contiene los archivos de audio para los efectos de sonido de la aplicación.

## 📁 Estructura de Archivos

Los siguientes archivos de sonido deben estar en esta carpeta:

- `tap.mp3` - Sonido para toques/taps generales
- `success.mp3` - Sonido para acciones exitosas
- `error.mp3` - Sonido para errores
- `flip.mp3` - Sonido para animación de flip de tarjeta
- `transition.mp3` - Sonido para transiciones entre pantallas
- `vote.mp3` - Sonido para votaciones
- `reveal.mp3` - Sonido para revelación de roles
- `button_click.mp3` - Sonido para clicks de botones

## 📥 Cómo Agregar los Archivos

### Opción 1: Descargar desde Internet

Puedes descargar efectos de sonido gratuitos desde:
- [Pixabay](https://pixabay.com/es/sound-effects/) - Efectos de sonido gratuitos
- [Freesound](https://freesound.org/) - Biblioteca de sonidos gratuitos
- [Zapsplat](https://www.zapsplat.com/) - Efectos de sonido profesionales gratuitos

### Opción 2: Crear tus propios sonidos

Puedes crear sonidos simples usando herramientas como:
- Audacity (gratis)
- GarageBand (Mac)
- Online Audio Editor

## 📋 Especificaciones Recomendadas

- **Formato**: MP3 (compatible con React Native)
- **Duración**: 0.1 - 1 segundo (sonidos cortos)
- **Calidad**: 44.1 kHz, 128 kbps (suficiente para efectos)
- **Volumen**: Normalizado (evitar sonidos muy altos o muy bajos)

## 🔧 Configuración en React Native

Los archivos deben estar en:
- **Android**: `android/app/src/main/res/raw/` (sin extensión en el nombre)
- **iOS**: Agregar a Xcode como recursos del bundle

Para React Native, los archivos se cargan desde el bundle principal usando `Sound.MAIN_BUNDLE`.

## ⚙️ Configuración Manual (si es necesario)

Si los sonidos no se cargan automáticamente, puedes necesitar:

1. **Android**: Agregar los archivos a `android/app/src/main/res/raw/`
2. **iOS**: Agregar los archivos al proyecto en Xcode

## 🎨 Sugerencias de Sonidos

- **tap.mp3**: Sonido suave y corto (0.1-0.2s) tipo "click"
- **success.mp3**: Sonido positivo y alegre (0.3-0.5s)
- **error.mp3**: Sonido de advertencia (0.2-0.3s)
- **flip.mp3**: Sonido de papel o tarjeta volteándose (0.3-0.5s)
- **transition.mp3**: Sonido suave de deslizamiento (0.2-0.4s)
- **vote.mp3**: Sonido de confirmación (0.2-0.3s)
- **reveal.mp3**: Sonido dramático de revelación (0.4-0.6s)
- **button_click.mp3**: Sonido de click de botón (0.1-0.2s)

## 📝 Nota

Si no agregas los archivos de sonido, la aplicación funcionará normalmente pero sin efectos de sonido. El servicio de sonido manejará silenciosamente la ausencia de archivos.

