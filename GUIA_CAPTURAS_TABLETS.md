# 📸 Guía para Capturas de Pantalla en Tablets - Google Play Store

## Requisitos de Google Play Store

Google Play Store requiere capturas de pantalla para tablets en los siguientes tamaños:

- **Tablet 7 pulgadas**: Mínimo 1200 x 1920 px (portrait) o 1920 x 1200 px (landscape)
- **Tablet 10 pulgadas**: Mínimo 1600 x 2560 px (portrait) o 2560 x 1600 px (landscape)

**Nota**: Google Play recomienda usar formato **portrait (vertical)** para capturas de tablets.

---

## 📱 Paso 1: Crear AVD para Tablet 7 pulgadas

### 1.1. Abrir Android Virtual Device Manager

1. Abre **Android Studio**
2. Ve a **Tools** → **Device Manager** (o haz clic en el ícono de Device Manager en la barra de herramientas)
3. Haz clic en **Create Device** (o el botón **+**)

### 1.2. Seleccionar Hardware (⚠️ AQUÍ se define la resolución)

En la ventana **Select Hardware**:

1. En la categoría **Tablet**, selecciona **"Pixel Tablet"** (RECOMENDADO)
   - Pixel Tablet tiene resolución 2560 x 1600 px, perfecta para Google Play
   - Si no está disponible, puedes usar **"7.0" WSVGA (Tablet)"** pero necesitarás recortar/escalar después
2. Haz clic en **Next**

**⚠️ IMPORTANTE**: La resolución del dispositivo se define aquí. Si eliges "7.0" WSVGA (Tablet)", tendrá 1024 x 600 px (no es suficiente). Mejor usa "Pixel Tablet" que tiene resolución mayor.

### 1.3. Seleccionar Imagen del Sistema

1. Selecciona una imagen del sistema (recomendado: **API 33** o superior)
   - Si no está descargada, haz clic en **Download** junto a la imagen
2. Haz clic en **Next**

### 1.4. Configurar AVD (CRÍTICO - Configurar Tamaño Correcto)

En la ventana **AVD Configuration** (la que estás viendo ahora):

**⚠️ IMPORTANTE**: La resolución del dispositivo se define cuando seleccionas el hardware en el paso anterior. En esta ventana solo puedes configurar la orientación y otros ajustes avanzados.

1. **AVD Name**: `Tablet_7_inch`
2. **Startup orientation**: **Portrait** (vertical) - ⚠️ **Cambia esto a Portrait**
3. Haz clic en **Finish**

**Nota sobre la resolución**: 
- El preset "7" WSVGA (Tablet)" que seleccionaste tiene resolución **1024 x 600 px** (landscape)
- Para Google Play necesitas mínimo **1200 x 1920 px** (portrait)
- **Solución práctica**: Android Studio no permite cambiar la resolución fácilmente después de seleccionar el hardware. Tienes dos opciones:

#### Opción A: Usar Pixel Tablet (RECOMENDADO - Más fácil)

1. Vuelve al paso anterior (Previous)
2. En lugar de "7" WSVGA (Tablet)", selecciona **"Pixel Tablet"** de la lista
3. Pixel Tablet tiene una resolución mayor (2560 x 1600) que funciona bien para Google Play
4. En AVD Configuration, asegúrate de que **Startup orientation** sea **Portrait**
5. Haz clic en **Finish**

#### Opción B: Usar el preset actual y recortar/escalar capturas

Si prefieres usar "7" WSVGA (Tablet)":
1. Configura **Startup orientation: Portrait**
2. Haz clic en **Finish**
3. Ejecuta la app y toma capturas
4. Después, usa un editor de imágenes para escalar/recortar las capturas a 1200 x 1920 px

**💡 Recomendación**: Usa **Opción A (Pixel Tablet)** para facilitar el proceso.

---

## 📱 Paso 2: Crear AVD para Tablet 10 pulgadas

Repite los pasos anteriores, pero con estas configuraciones:

### 2.1. Seleccionar Hardware

- Categoría: **Tablet**
- Modelo: **"Pixel Tablet"** (RECOMENDADO - mismo dispositivo que para 7")
  - Pixel Tablet tiene 2560 x 1600 px, suficiente para Google Play
  - Alternativa: **"10.1" WXGA (Tablet)"** (1280 x 800, necesitarás escalar)

### 2.2. Configurar AVD

1. **AVD Name**: `Tablet_10_inch`
2. **Startup orientation**: **Portrait** (vertical) ⚠️ **Cambia esto a Portrait**
3. Haz clic en **Finish**

**Nota**: Puedes usar el mismo "Pixel Tablet" para ambas configuraciones (7" y 10") ya que tiene resolución suficiente. Solo cambia el nombre del AVD para diferenciarlos.

---

## 🚀 Paso 3: Ejecutar la App en los Emuladores

### 3.1. Iniciar el Emulador de 7 pulgadas

1. En **Device Manager**, selecciona `Tablet_7_inch`
2. Haz clic en el botón de **Play** (▶️)
3. Espera a que el emulador inicie completamente

### 3.2. Ejecutar la App

1. Asegúrate de que el emulador está seleccionado como dispositivo de destino
2. Desde la raíz del proyecto, ejecuta:
   ```powershell
   npm start
   ```
   (En otra terminal o espera a que termine)

3. En otra terminal (o después de que Metro esté corriendo):
   ```powershell
   npm run android
   ```

   O desde Android Studio:
   - Haz clic en **Run** → **Run 'app'**
   - O presiona `Shift + F10`

### 3.3. Navegar a las Pantallas que Quieres Capturar

Navega por la app hasta las pantallas que quieres capturar. Recomendado para Google Play:

1. **Pantalla Intro** - Logo de la app
2. **Pantalla Home** - Menú principal
3. **Pantalla Lobby/OnlineLobby** - Crear partida
4. **Pantalla OnlineRoom** - Sala de espera (si aplica)
5. **Pantalla RoleAssignment** - Asignación de roles
6. **Pantalla Round** - Ronda de pistas
7. **Pantalla Discussion** - Discusión
8. **Pantalla Voting** - Votación
9. **Pantalla Results** - Resultados

---

## 📸 Paso 4: Tomar Capturas de Pantalla

### Opción A: Desde el Emulador (Recomendado)

1. En el emulador, presiona **Ctrl + S** (o busca el botón de captura en la barra lateral del emulador)
2. O ve a los **3 puntos** (⋮) en la barra lateral → **Screenshot**
3. Las capturas se guardan automáticamente

**Ubicación de las capturas**:
- Windows: `C:\Users\[TU_USUARIO]\AppData\Local\Android\Sdk\avd\[NOMBRE_AVD].avd\`
- O en la carpeta de descargas configurada en Android Studio

### Opción B: Herramienta de Captura de Windows

1. Presiona **Windows + Shift + S** para abrir la herramienta de recorte
2. Selecciona el área del emulador
3. Guarda la imagen

### Opción C: Desde Android Studio

1. En la barra lateral del emulador, haz clic en **Camera** (ícono de cámara)
2. Se abrirá una ventana con la captura
3. Haz clic en **Save** para guardar

---

## ✂️ Paso 5: Editar y Optimizar Capturas

### 5.1. Verificar Dimensiones

Asegúrate de que las capturas tienen las dimensiones correctas:

- **Tablet 7"**: 1200 x 1920 px (o más grande)
- **Tablet 10"**: 1600 x 2560 px (o más grande)

### 5.2. Recortar si es Necesario

Si las capturas son más grandes, puedes recortarlas a las dimensiones exactas usando:

- **Paint** (Windows)
- **GIMP** (gratis)
- **Photoshop** (si tienes)
- **Online tools**: photopea.com, canva.com

### 5.3. Formato de Archivo

- **Formato**: PNG (recomendado) o JPG
- **Calidad**: Alta resolución
- **Tamaño**: Máximo 8 MB por imagen (límite de Google Play)

---

## 📋 Paso 6: Checklist de Capturas Necesarias

### Para Tablet 7 pulgadas (1200 x 1920 px):

- [ ] Captura 1: Pantalla Intro/Logo
- [ ] Captura 2: Pantalla Home
- [ ] Captura 3: Pantalla Lobby/OnlineLobby
- [ ] Captura 4: Pantalla OnlineRoom (si aplica)
- [ ] Captura 5: Pantalla RoleAssignment
- [ ] Captura 6: Pantalla Round
- [ ] Captura 7: Pantalla Discussion
- [ ] Captura 8: Pantalla Voting/Results

### Para Tablet 10 pulgadas (1600 x 2560 px):

- [ ] Captura 1: Pantalla Intro/Logo
- [ ] Captura 2: Pantalla Home
- [ ] Captura 3: Pantalla Lobby/OnlineLobby
- [ ] Captura 4: Pantalla OnlineRoom (si aplica)
- [ ] Captura 5: Pantalla RoleAssignment
- [ ] Captura 6: Pantalla Round
- [ ] Captura 7: Pantalla Discussion
- [ ] Captura 8: Pantalla Voting/Results

**Nota**: Google Play requiere **mínimo 2 capturas**, pero recomienda **8 capturas** para mejor presentación.

---

## 🎯 Configuración Rápida Recomendada (Método Simplificado)

### ⚡ Método Más Fácil: Usar Pixel Tablet para Ambos

Google Play acepta capturas que tengan **al menos** las dimensiones mínimas. Pixel Tablet tiene 2560 x 1600 px, que es suficiente para ambos requisitos.

### Para Tablet 7" y 10":

1. **Device Manager** → **Create Device** → Selecciona **"Pixel Tablet"**
2. Selecciona imagen del sistema (API 33+) → **Next**
3. En **AVD Configuration**:
   - **AVD Name**: `Tablet_7_inch` (para el primero)
   - **Startup orientation**: **Portrait** ⚠️ **Importante**
   - Haz clic en **Finish**
4. Repite para el segundo:
   - **Create Device** → **"Pixel Tablet"** (mismo hardware)
   - **AVD Name**: `Tablet_10_inch`
   - **Startup orientation**: **Portrait**
   - **Finish**

**Ventajas**:
- Pixel Tablet tiene resolución 2560 x 1600 px (suficiente para ambos requisitos)
- No necesitas cambiar configuraciones avanzadas
- Las capturas serán más grandes que el mínimo, puedes recortarlas si quieres

**Después de tomar capturas**: Si quieres las dimensiones exactas (1200x1920 o 1600x2560), usa un editor de imágenes para recortar/escalar.

---

## ⚠️ Problemas Comunes

### Error: "No se puede iniciar el emulador"

**Solución**: 
- Verifica que **HAXM** o **Hyper-V** está habilitado
- En Windows, habilita **Virtualization** en BIOS
- Verifica que tienes suficiente RAM disponible

### Error: "La app no se ve bien en el emulador"

**Solución**:
- Asegúrate de que la app está diseñada para tablets (responsive)
- React Native debería adaptarse automáticamente, pero verifica los estilos

### Las capturas son muy pequeñas

**Solución**:
- Asegúrate de que la resolución del AVD es correcta (1200x1920 o 1600x2560)
- No reduzcas el zoom del emulador
- Usa la herramienta de captura del emulador (Ctrl+S) en lugar de captura de pantalla de Windows

---

## 📝 Notas Adicionales

1. **Orientación**: Google Play recomienda usar **portrait (vertical)** para capturas de tablets
2. **Barras del sistema**: Las capturas deben incluir la barra de estado y navegación de Android (esto es normal)
3. **Contenido**: Asegúrate de que las capturas muestran contenido realista y atractivo
4. **Consistencia**: Usa el mismo estilo de contenido en todas las capturas
5. **Orden**: Las capturas deben seguir el flujo lógico de la app (de inicio a fin)

---

## 🔄 Pasos Rápidos Resumidos

1. ✅ Abrir Android Studio → Device Manager
2. ✅ Create Device → Seleccionar Tablet 7" → Configurar 1200x1920 → Finish
3. ✅ Create Device → Seleccionar Tablet 10" → Configurar 1600x2560 → Finish
4. ✅ Iniciar emulador 7" → Ejecutar app (`npm run android`)
5. ✅ Navegar por pantallas → Capturar (Ctrl+S)
6. ✅ Repetir con emulador 10"
7. ✅ Verificar dimensiones → Recortar si es necesario
8. ✅ Guardar con nombres descriptivos

---

**Última actualización**: Enero 2025  
**Versión del proyecto**: 1.6

