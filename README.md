# ⚽ Impostor Fútbol

Aplicación móvil tipo party game basada en la dinámica del "impostor futbolero" popularizada por creadores como Davoo Xeneize y La Cobra.

## 📊 Estado Actual del Proyecto

### ✅ Completado

#### Fase 1: Setup Base
- ✅ Estructura de carpetas modular
- ✅ Tema global minimalista (colores, tipografía, espaciado)
- ✅ Componentes base reutilizables (Button, Typography, Layout)
- ✅ Navegación completa entre pantallas (React Navigation)
- ✅ 6 pantallas con layout básico

#### Fase 2: Lobby y Gestión de Jugadores
- ✅ Input para añadir jugadores con validación
- ✅ Lista de jugadores con avatares (iniciales)
- ✅ Configuración de partida (rondas: 1-3, tiempo opcional)
- ✅ Validaciones (mínimo 3, máximo 10 jugadores)
- ✅ Hook personalizado `useLobby` para gestión de estado

#### Fase 3: Asignación de Roles
- ✅ Mazo de palabras secretas (90+ palabras: jugadores y equipos)
- ✅ Lógica de asignación de roles aleatorios
- ✅ Context de estado del juego (GameContext)
- ✅ Pantalla de asignación individual (uno por uno)
- ✅ Visualización diferenciada para impostor vs normal

### 🎯 Pendiente

#### Fase 4: Ronda de Pistas
- [ ] Control de turnos
- [ ] Interfaz de ronda
- [ ] Historial de pistas

#### Fase 5: Sistema de Votación
- [ ] Lógica de votación
- [ ] Pantalla de votación
- [ ] Conteo de votos

#### Fase 6: Resultados
- [ ] Pantalla de resultados
- [ ] Mostrar ganador
- [ ] Opción de nueva partida

## 🛠️ Stack Técnico

- **React Native**: 0.74.5
- **React**: 18.2.0
- **TypeScript**: 5.3.3
- **React Navigation**: 6.1.9 (native-stack: 6.9.17)
- **React Native Gesture Handler**: ~2.18.0
- **React Native Safe Area Context**: ~4.10.5
- **React Native Screens**: ~3.31.1

### Configuración Android

- **compileSdkVersion**: 34
- **targetSdkVersion**: 34
- **minSdkVersion**: 23
- **buildToolsVersion**: 34.0.0
- **Android Gradle Plugin**: 8.1.1
- **Gradle**: 8.3
- **Kotlin**: 1.9.0
- **Java JDK**: 17

## 🚀 Instalación en Nueva Computadora

### Prerrequisitos

1. **Node.js** 18+ (recomendado 22+)
   - Descargar desde: https://nodejs.org/
   - Verificar: `node --version`

2. **Java JDK 17**
   - Descargar desde: https://adoptium.net/
   - Configurar variable de entorno `JAVA_HOME`

3. **Android Studio**
   - Descargar desde: https://developer.android.com/studio
   - Instalar SDK Platform 34 (Android 14.0)
   - Instalar Build Tools 34.0.0
   - Configurar variable de entorno `ANDROID_HOME`

4. **Git**
   - Descargar desde: https://git-scm.com/

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/TU_USUARIO/impostor-futbol.git
   cd impostor-futbol
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar Android**
   - Verificar que `android/local.properties` tenga la ruta correcta del SDK:
     ```
     sdk.dir=C:\\Users\\TU_USUARIO\\AppData\\Local\\Android\\Sdk
     ```
   - Ajustar la ruta según tu sistema

4. **Crear/Iniciar Emulador**
   - Abrir Android Studio
   - Tools > Device Manager
   - Crear o iniciar un emulador con API 34

5. **Verificar conexión del emulador**
   ```bash
   adb devices
   ```
   Debe mostrar el emulador como `device`

6. **Ejecutar la aplicación**
   ```bash
   npm run android
   ```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Button/         # Botón con variantes
│   ├── Typography/     # Sistema de tipografía
│   ├── Layout/         # Contenedores de pantalla
│   ├── PlayerInput/    # Input para añadir jugadores
│   ├── PlayerList/     # Lista de jugadores
│   └── GameConfig/     # Configuración de partida
├── screens/            # Pantallas de la aplicación
│   ├── Home/           # Pantalla inicial ✅
│   ├── Lobby/          # Gestión de jugadores ✅
│   ├── RoleAssignment/ # Asignación de roles ✅
│   ├── Round/          # Ronda de pistas (pendiente)
│   ├── Voting/         # Votación (pendiente)
│   └── Results/        # Resultados (pendiente)
├── navigation/         # React Navigation
├── theme/             # Tema global (colores, tipografía, espaciado)
├── game/              # Lógica del juego
│   ├── GameContext.tsx    # Context API para estado global
│   ├── gameLogic.ts       # Lógica de asignación de roles
│   └── secretWords.ts     # Mazo de palabras secretas
├── hooks/             # Custom hooks
│   └── useLobby.ts    # Hook para gestión de jugadores
└── types/             # Tipos TypeScript globales
```

## 🎨 Diseño

- **Estilo**: Minimalista, limpio, moderno
- **Colores**: Blanco/negro + acento cyan (#00d4ff)
- **Tipografía**: Clara y grande para máxima legibilidad
- **Espaciado**: Generoso para claridad visual
- **UX**: Flujo intuitivo, botones grandes, textos cortos

## 📱 Flujo de Navegación

```
Home → Lobby → RoleAssignment → Round → Voting → Results → Home
```

## 🔧 Comandos Útiles

```bash
# Ejecutar en Android
npm run android

# Iniciar Metro Bundler
npm start

# Limpiar caché de Android
cd android
.\gradlew.bat clean
cd ..

# Limpiar todo y reinstalar
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

## ⚠️ Problemas Conocidos y Soluciones

### Error: "BaseReactPackage not found"
**Solución**: Actualizado a React Native 0.74.5 con versiones compatibles de librerías.

### Error: "minSdkVersion 21 cannot be smaller than version 23"
**Solución**: Actualizado minSdkVersion a 23 en `android/build.gradle`.

### Error: CMake build failed para x86_64
**Solución**: Limitadas arquitecturas a `armeabi-v7a` y `arm64-v8a` en `android/app/build.gradle`.

### Error: "flipper-integration not found"
**Solución**: Removida dependencia de Flipper (no disponible en RN 0.74).

## 📝 Notas de Desarrollo

- Desarrollo incremental con versiones jugables
- Prioridad en UX intuitiva y diseño minimalista
- Código limpio y bien documentado
- TypeScript para type safety

## 🎯 Próximos Pasos

1. **Implementar Fase 4**: Ronda de Pistas
   - Control de turnos
   - Interfaz de ronda
   - Historial de pistas

2. **Implementar Fase 5**: Sistema de Votación
   - Lógica de votación
   - Pantalla de votación

3. **Implementar Fase 6**: Resultados
   - Pantalla de resultados
   - Opción de nueva partida

## 📄 Licencia

Este proyecto es de código abierto y está disponible públicamente.

## 👤 Autor

Desarrollado como proyecto personal de aprendizaje.

---

**Última actualización**: Diciembre 2024
**Versión**: 0.1.0

