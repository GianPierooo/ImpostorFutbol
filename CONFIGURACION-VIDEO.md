# 🎬 Guía de Configuración del Video Introductorio

## 📍 Ubicación del Archivo
El archivo a editar es: `src/screens/Intro/Intro.tsx`

## 🔧 Configuración de Dimensiones

En el archivo `Intro.tsx`, encontrarás estas constantes cerca de la línea 29-31:

```typescript
const VIDEO_WIDTH: number | string = screenWidth; // AJUSTA ESTE VALOR
const VIDEO_HEIGHT: number | string = screenHeight; // AJUSTA ESTE VALOR
const VIDEO_RESIZE_MODE: 'cover' | 'contain' | 'stretch' = 'cover'; // AJUSTA ESTE VALOR
```

### Opciones para VIDEO_WIDTH y VIDEO_HEIGHT:

#### 1. **Usar dimensiones de la pantalla** (por defecto)
```typescript
const VIDEO_WIDTH = screenWidth;
const VIDEO_HEIGHT = screenHeight;
```

#### 2. **Usar dimensiones fijas en píxeles**
```typescript
const VIDEO_WIDTH = 1920;  // Ancho fijo de 1920px
const VIDEO_HEIGHT = 1080; // Alto fijo de 1080px
```

#### 3. **Multiplicar las dimensiones de la pantalla**
```typescript
const VIDEO_WIDTH = screenWidth * 1.1;  // 10% más grande que la pantalla
const VIDEO_HEIGHT = screenHeight * 1.1;
```

#### 4. **Usar porcentajes** (puede no funcionar bien con position absolute)
```typescript
const VIDEO_WIDTH = '100%';
const VIDEO_HEIGHT = '100%';
```

### Opciones para VIDEO_RESIZE_MODE:

#### 1. **'cover'** (Recomendado para pantalla completa)
- El video cubre toda la pantalla
- Puede recortar partes del video si la relación de aspecto no coincide
- **Úsalo si:** Quieres que el video llene toda la pantalla sin espacios

#### 2. **'contain'** (Recomendado si no quieres recortes)
- El video se ajusta completamente sin recortar
- Puede dejar espacios negros si la relación de aspecto no coincide
- **Úsalo si:** Quieres ver todo el video sin recortes

#### 3. **'stretch'** (Puede deformar el video)
- El video se estira para llenar toda la pantalla
- Puede deformar el video si la relación de aspecto no coincide
- **Úsalo si:** No te importa que el video se deforme

## 🎯 Ejemplos de Configuración Común

### Para video 16:9 (1920x1080) en pantalla completa:
```typescript
const VIDEO_WIDTH = screenWidth;
const VIDEO_HEIGHT = screenHeight;
const VIDEO_RESIZE_MODE = 'cover';
```

### Para video que se ajuste sin recortes:
```typescript
const VIDEO_WIDTH = screenWidth;
const VIDEO_HEIGHT = screenHeight;
const VIDEO_RESIZE_MODE = 'contain';
```

### Para video con dimensiones específicas:
```typescript
const VIDEO_WIDTH = 1920;
const VIDEO_HEIGHT = 1080;
const VIDEO_RESIZE_MODE = 'cover';
```

## 🔍 Cómo Saber las Dimensiones de tu Video

1. Abre el video en un reproductor de video
2. Busca las propiedades del archivo (clic derecho > Propiedades)
3. Busca "Resolución" o "Dimensiones"
4. Verás algo como: 1920x1080 (ancho x alto)

## ⚠️ Notas Importantes

- Si el video se ve cortado o recortado, prueba cambiar `VIDEO_RESIZE_MODE` a `'contain'`
- Si el video se ve muy pequeño, aumenta `VIDEO_WIDTH` y `VIDEO_HEIGHT` multiplicando por un factor (ej: `screenWidth * 1.2`)
- Si el video se ve deformado, asegúrate de que las dimensiones mantengan la relación de aspecto del video original
- Después de cambiar los valores, reinicia la app completamente (cierra y vuelve a abrir)

## 🐛 Solución de Problemas

### El video no cubre toda la pantalla:
- Aumenta `VIDEO_WIDTH` y `VIDEO_HEIGHT` (ej: `screenWidth * 1.1`)
- Cambia `VIDEO_RESIZE_MODE` a `'cover'`

### El video se ve recortado:
- Cambia `VIDEO_RESIZE_MODE` a `'contain'`
- O ajusta `VIDEO_WIDTH` y `VIDEO_HEIGHT` para que coincidan con la relación de aspecto del video

### El video se ve deformado:
- Asegúrate de que `VIDEO_WIDTH / VIDEO_HEIGHT` sea igual a la relación de aspecto del video
- Por ejemplo, si tu video es 16:9 (1920x1080), usa: `VIDEO_WIDTH = screenWidth` y `VIDEO_HEIGHT = screenWidth * (9/16)`

