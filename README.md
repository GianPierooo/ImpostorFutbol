# 🎮 Impostor Fútbol - Documentación Completa del Proyecto

Aplicación móvil de juego social tipo "Among Us" con temática de fútbol, con modo local y modo online multijugador.

**Última Actualización**: 17 de Diciembre 2024  
**Versión Actual**: v1.2  
**Estado General**: ✅ **FUNCIONAL** - Modo local y online operativos

---

## 📊 Estado Actual del Proyecto

### ✅ Lo que ESTÁ FUNCIONANDO

#### Modo Local
- ✅ Crear partida local con múltiples jugadores
- ✅ Asignación automática de roles (impostor/normal)
- ✅ Sistema de rondas con pistas
- ✅ Fase de discusión
- ✅ Sistema de votación
- ✅ Resultados y detección de ganador
- ✅ Navegación completa entre fases

#### Modo Online
- ✅ Crear sala online con código único
- ✅ Unirse a sala con código
- ✅ Sincronización en tiempo real con WebSocket
- ✅ Gestión de jugadores (unirse/salir)
- ✅ Transferencia automática de host si el host sale
- ✅ Iniciar partida online
- ✅ Sincronización de pistas en tiempo real
- ✅ Sincronización de votos en tiempo real
- ✅ Cambio de fases sincronizado
- ✅ Guardado automático de historial en PostgreSQL
- ✅ Sistema de usuarios y ratings
- ✅ Rankings globales
- ✅ Búsqueda de partidas y jugadores (Elasticsearch)

#### Backend
- ✅ API REST completa
- ✅ WebSocket con Socket.io
- ✅ Redis para partidas activas
- ✅ PostgreSQL para historial y usuarios
- ✅ Elasticsearch para búsquedas
- ✅ Health checks de todos los servicios
- ✅ Manejo de errores y desconexiones
- ✅ Validaciones de entrada

#### Frontend
- ✅ Interfaz completa para modo local
- ✅ Interfaz completa para modo online
- ✅ Navegación automática según fase del juego
- ✅ Detección automática de modo (local/online)
- ✅ Manejo de errores de red
- ✅ Sincronización de estado en tiempo real

#### Infraestructura
- ✅ VM Oracle Cloud configurada (163.192.223.30)
- ✅ Backend corriendo en PM2
- ✅ Redis instalado y funcionando
- ✅ PostgreSQL instalado y funcionando
- ✅ Elasticsearch instalado y funcionando
- ✅ Firewall configurado
- ✅ APK generado y probado (v1.2)

---

## 🚧 Lo que FALTA o está PENDIENTE

### Funcionalidades No Implementadas

#### Frontend
- ❌ **Pantalla de perfil de usuario** - Ver estadísticas personales
- ❌ **Pantalla de historial de partidas** - Ver partidas jugadas
- ❌ **Pantalla de rankings** - Ver clasificación global
- ❌ **Pantalla de búsqueda** - Buscar partidas públicas y jugadores
- ❌ **Sistema de autenticación** - Login/registro de usuarios
- ❌ **Notificaciones push** - Alertas de nuevas partidas
- ❌ **Chat en tiempo real** - Comunicación durante el juego
- ❌ **Modo torneo** - Competencias organizadas
- ❌ **Logros y badges** - Sistema de recompensas
- ❌ **Configuración de perfil** - Avatar, nombre, etc.

#### Backend
- ❌ **Autenticación JWT** - Sistema de tokens
- ❌ **Rate limiting avanzado** - Protección contra abuso
- ❌ **Validación de sesiones** - Control de sesiones activas
- ❌ **Sistema de reportes** - Reportar jugadores
- ❌ **Moderación automática** - Filtros de contenido
- ❌ **Sistema de amigos** - Agregar amigos
- ❌ **Invitations** - Invitar amigos a partidas

#### Mejoras Técnicas
- ❌ **HTTPS/SSL** - Seguridad en producción
- ❌ **Tests automatizados** - Unit tests y integration tests
- ❌ **Logging estructurado** - Sistema de logs profesional
- ❌ **Monitoreo** - Métricas y alertas
- ❌ **Backup automático** - Respaldo de bases de datos
- ❌ **CI/CD** - Pipeline de despliegue automático

#### Optimizaciones
- ❌ **Caché de consultas** - Optimizar búsquedas frecuentes
- ❌ **Compresión de datos** - Reducir tráfico WebSocket
- ❌ **Lazy loading** - Cargar datos bajo demanda
- ❌ **Offline mode** - Funcionalidad sin conexión

---

## 📈 Progreso del Proyecto

### Fases Completadas

#### ✅ Fase 1: Redis + Backend Básico (COMPLETADA)
- [x] Instalación y configuración de Redis
- [x] Backend Node.js con Express
- [x] WebSocket con Socket.io
- [x] API REST básica
- [x] Gestión de salas en Redis
- [x] Sincronización en tiempo real
- [x] Frontend básico para modo online

#### ✅ Fase 2: PostgreSQL (COMPLETADA)
- [x] Instalación y configuración de PostgreSQL
- [x] Migraciones de base de datos
- [x] Servicios de historial
- [x] Servicios de usuarios
- [x] Sistema de ratings
- [x] Guardado automático de partidas
- [x] API de historial y usuarios

#### ✅ Fase 3: Elasticsearch (COMPLETADA)
- [x] Instalación y configuración de Elasticsearch
- [x] Creación de índices
- [x] Servicios de búsqueda
- [x] Indexación automática
- [x] API de búsqueda
- [x] Integración con Redis y PostgreSQL

### Correcciones Recientes (v1.2)

- ✅ Corregida alineación del botón X en lista de jugadores
- ✅ Ocultado botón X en modo online (no aplicable)
- ✅ Mejorada sincronización cuando jugadores salen de la sala
- ✅ Backend ahora envía estado actualizado cuando alguien sale
- ✅ Corrección de error "El juego ya ha comenzado" al iniciar partida
- ✅ Reset automático de estado de sala si no hay juego en curso
- ✅ Mejor manejo de errores de red con opción de verificar conexión
- ✅ Servidor configurado para escuchar en 0.0.0.0 (conexiones externas)

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React Native** 0.74.5 - Framework móvil
- **TypeScript** - Tipado estático
- **React Navigation** 6.x - Navegación
- **Socket.io Client** 4.5.4 - WebSocket para tiempo real
- **Axios** 1.6.0 - Cliente HTTP

### Backend
- **Node.js** 20.x - Runtime JavaScript
- **Express** 4.18.2 - Framework web
- **Socket.io** 4.5.4 - WebSocket server
- **Redis** 4.6.10 - Base de datos en memoria
- **PostgreSQL** (pg 8.11.3) - Base de datos relacional
- **Elasticsearch** (@elastic/elasticsearch 8.11.0) - Motor de búsqueda

### Infraestructura
- **Oracle Cloud VM** - Servidor (163.192.223.30)
- **PM2** - Gestor de procesos Node.js
- **UFW** - Firewall
- **Ubuntu** - Sistema operativo

---

## 🏗️ Arquitectura del Sistema

### Flujo de Datos

```
Frontend (React Native)
    ↓ HTTP/WebSocket
Backend (Node.js + Express)
    ↓
    ├─→ Redis (Partidas activas, estado en tiempo real)
    ├─→ PostgreSQL (Historial, usuarios, estadísticas)
    └─→ Elasticsearch (Búsqueda de partidas y jugadores)
```

### Componentes Principales

#### Backend
- **Redis**: Almacena partidas activas, jugadores, pistas, votos
- **PostgreSQL**: Almacena historial de partidas, usuarios, ratings
- **Elasticsearch**: Índices para búsqueda de partidas públicas y jugadores

#### Frontend
- **GameContext**: Maneja estado del juego local
- **OnlineGameContext**: Maneja estado del juego online, sincroniza con backend
- **Hooks**: `useGameMode`, `useOnlineNavigation` para gestión automática

---

## 📁 Estructura del Proyecto

```
ImpostorFutbol/
├── src/                          # Frontend React Native
│   ├── screens/                  # Pantallas de la app
│   │   ├── Home/                 # Pantalla principal
│   │   ├── OnlineLobby/          # Crear/unirse a partida online
│   │   ├── OnlineRoom/           # Sala de espera online
│   │   ├── RoleAssignment/      # Asignación de roles
│   │   ├── Round/                # Ronda de pistas
│   │   ├── Discussion/           # Discusión
│   │   ├── Voting/               # Votación
│   │   └── Results/              # Resultados
│   ├── contexts/                 # Contextos React
│   │   ├── GameContext.tsx       # Estado juego local
│   │   └── OnlineGameContext.tsx # Estado juego online
│   ├── services/                 # Servicios API
│   │   ├── api.ts               # Cliente REST
│   │   └── socket.ts            # Cliente WebSocket
│   ├── hooks/                    # Custom hooks
│   │   ├── useGameMode.ts       # Detector modo local/online
│   │   └── useOnlineNavigation.ts # Navegación automática
│   └── config/
│       └── api.ts               # Configuración API (IP VM)
│
├── backend/                      # Backend Node.js
│   ├── config/                   # Configuraciones
│   │   ├── redis.js             # Config Redis
│   │   ├── postgres.js          # Config PostgreSQL
│   │   ├── elasticsearch.js     # Config Elasticsearch
│   │   └── constants.js         # Constantes
│   ├── routes/                   # Rutas API
│   │   ├── health.js            # Health checks
│   │   ├── rooms.js             # API salas
│   │   ├── games.js             # API juegos
│   │   ├── users.js             # API usuarios
│   │   ├── history.js            # API historial
│   │   ├── rankings.js          # API rankings
│   │   └── search.js             # API búsqueda
│   ├── services/                 # Lógica de negocio
│   │   ├── redisService.js      # Operaciones Redis
│   │   ├── postgresService.js   # Operaciones PostgreSQL
│   │   ├── elasticsearchService.js # Operaciones Elasticsearch
│   │   ├── roomService.js       # Lógica salas
│   │   ├── gameService.js       # Lógica juegos
│   │   ├── userService.js       # Lógica usuarios
│   │   ├── historyService.js    # Lógica historial
│   │   ├── ratingService.js     # Lógica ratings
│   │   └── searchService.js     # Lógica búsqueda
│   ├── database/                 # Scripts base de datos
│   │   ├── migrations/          # Migraciones SQL
│   │   └── elasticsearch/       # Scripts índices ES
│   └── server.js                 # Servidor principal
│
├── versiones/                    # APKs compilados
│   ├── impostor-futbol-v1.0.apk
│   ├── impostor-futbol-v1.1.apk
│   └── impostor-futbol-v1.2.apk
│
└── README.md                     # Este archivo
```

---

## 🔌 Endpoints API

### Health Checks
- `GET /api/health` - Health check básico
- `GET /api/health/redis` - Estado de Redis
- `GET /api/health/postgres` - Estado de PostgreSQL
- `GET /api/health/elasticsearch` - Estado de Elasticsearch
- `GET /api/health/full` - Health check completo

### Salas
- `POST /api/rooms` - Crear sala
- `GET /api/rooms/:code` - Obtener sala
- `POST /api/rooms/:code/join` - Unirse a sala
- `POST /api/rooms/:code/leave` - Salir de sala

### Juegos
- `POST /api/games/:code/start` - Iniciar juego
- `GET /api/games/:code/state` - Estado del juego
- `POST /api/games/:code/pista` - Agregar pista
- `POST /api/games/:code/vote` - Agregar voto
- `POST /api/games/:code/phase` - Cambiar fase
- `POST /api/games/:code/finish` - Finalizar y guardar partida
- `GET /api/games/:code/role/:playerId` - Obtener rol
- `GET /api/games/:code/voting-results` - Resultados votación

### Usuarios
- `POST /api/users` - Crear/obtener usuario
- `GET /api/users/:id` - Obtener usuario
- `GET /api/users/:id/stats` - Estadísticas usuario
- `PUT /api/users/:id` - Actualizar perfil
- `GET /api/users/:id/games` - Partidas del usuario

### Historial
- `GET /api/games/history` - Historial de partidas
- `GET /api/games/history/:id` - Detalle de partida

### Rankings
- `GET /api/rankings` - Rankings globales
- `GET /api/rankings/user/:id` - Posición de usuario

### Búsqueda
- `GET /api/search/games` - Buscar partidas públicas
- `GET /api/search/players` - Buscar jugadores

---

## 🗄️ Base de Datos

### PostgreSQL - Tablas

#### `users`
- `id` (UUID) - Identificador único
- `username` (VARCHAR) - Nombre de usuario único
- `email` (VARCHAR) - Email opcional
- `avatar` (VARCHAR) - URL de avatar
- `rating` (INTEGER) - Rating del jugador (inicia en 1000)
- `games_played` (INTEGER) - Partidas jugadas
- `games_won` (INTEGER) - Partidas ganadas
- `games_lost` (INTEGER) - Partidas perdidas
- `created_at` (TIMESTAMP) - Fecha de creación
- `updated_at` (TIMESTAMP) - Última actualización

#### `game_history`
- `id` (UUID) - Identificador único
- `room_code` (VARCHAR) - Código de la sala
- `secret_word` (VARCHAR) - Palabra secreta
- `impostor_id` (UUID) - ID del impostor
- `winner` (VARCHAR) - Ganador ('group' o 'impostor')
- `total_rounds` (INTEGER) - Rondas totales
- `total_players` (INTEGER) - Jugadores totales
- `started_at` (TIMESTAMP) - Inicio de partida
- `finished_at` (TIMESTAMP) - Fin de partida

#### `participations`
- `id` (UUID) - Identificador único
- `game_id` (UUID) - Referencia a game_history
- `user_id` (UUID) - Referencia a users
- `role` (VARCHAR) - Rol ('impostor' o 'normal')
- `voted_for` (UUID) - Usuario por el que votó
- `won` (BOOLEAN) - Si ganó la partida

#### `pistas_history`
- `id` (UUID) - Identificador único
- `game_id` (UUID) - Referencia a game_history
- `user_id` (UUID) - Referencia a users
- `text` (TEXT) - Texto de la pista
- `round` (INTEGER) - Ronda
- `turn` (INTEGER) - Turno

#### `votes_history`
- `id` (UUID) - Identificador único
- `game_id` (UUID) - Referencia a game_history
- `voter_id` (UUID) - Usuario que vota
- `target_id` (UUID) - Usuario votado

### Redis - Estructuras

- `room:{code}` - Hash con información de sala
- `players:{code}` - Set de IDs de jugadores
- `player:{code}:{id}` - Hash con info del jugador
- `game:{code}` - Hash con estado del juego
- `roles:{code}` - Hash con roles asignados
- `pistas:{code}` - Lista de pistas
- `votes:{code}` - Hash de votos (voterId -> targetId)

### Elasticsearch - Índices

#### `games`
- `room_code` - Código de la sala
- `host_id` - ID del host
- `host_name` - Nombre del host
- `status` - Estado de la partida
- `rounds` - Número de rondas
- `player_count` - Cantidad de jugadores
- `created_at` - Fecha de creación
- `last_activity` - Última actividad

#### `users`
- `user_id` - ID del usuario
- `username` - Nombre de usuario
- `rating` - Rating actual
- `games_played` - Partidas jugadas
- `games_won` - Partidas ganadas
- `win_rate` - Tasa de victorias
- `last_active` - Última actividad

#### `rankings`
- `user_id` - ID del usuario
- `username` - Nombre de usuario
- `rating` - Rating actual
- `position` - Posición en ranking
- `updated_at` - Fecha de actualización

---

## 🚀 Configuración y Despliegue

### VM Oracle Cloud
- **IP**: `163.192.223.30`
- **Puerto Backend**: `3000`
- **Puerto PostgreSQL**: `5432` (solo local)
- **Puerto Elasticsearch**: `9200` (solo local)
- **Sistema**: Ubuntu
- **Gestor de procesos**: PM2

### Variables de Entorno (backend/.env)

```env
# Servidor
NODE_ENV=development
PORT=3000

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=impostor_futbol
POSTGRES_USER=postgres
POSTGRES_PASSWORD=

# Elasticsearch
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_USERNAME=
ELASTICSEARCH_PASSWORD=

# CORS
CORS_ORIGIN=*

# Room Configuration
ROOM_CODE_LENGTH=6
ROOM_EXPIRY_SECONDS=3600
MAX_PLAYERS_PER_ROOM=10
MIN_PLAYERS_TO_START=3
```

### Frontend (src/config/api.ts)

```typescript
const VM_IP = '163.192.223.30';

export const API_CONFIG = {
  BASE_URL: `http://${VM_IP}:3000/api`,
  SOCKET_URL: `http://${VM_IP}:3000`,
};
```

---

## 🔧 Comandos Útiles

### En la VM

```bash
# Verificar servicios
curl http://163.192.223.30:3000/api/health/full

# Ver estado PM2
pm2 status
pm2 logs impostor-backend

# Reiniciar backend
pm2 restart impostor-backend --update-env

# Ver tablas PostgreSQL
sudo -u postgres psql -d impostor_futbol -c "\dt"

# Ver índices Elasticsearch
curl http://localhost:9200/_cat/indices?v

# Ver logs del backend
pm2 logs impostor-backend --lines 50
```

### Desarrollo Local

```bash
# Instalar dependencias
npm install
cd backend && npm install

# Iniciar backend (desarrollo)
cd backend && npm run dev

# Iniciar frontend
npm start

# Ejecutar en Android
npm run android
```

### Generación de APK

```bash
# Generar bundle de JavaScript
npm run build:bundle:android

# Generar APK de debug
npm run build:apk:debug

# Generar APK de release (producción)
npm run build:apk:release
```

**Ubicación del APK generado:**
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`

**Nota**: Los APKs de versiones anteriores se encuentran en la carpeta `versiones/`.

---

## 📦 Versiones del APK

Las versiones compiladas del APK se encuentran en la carpeta `versiones/`:

- **v1.0** (16/12/2024): Versión inicial con modo online básico
- **v1.1** (16/12/2024): Correcciones de red y permisos Android
  - Agregado `usesCleartextTraffic` para permitir HTTP
  - Mejor manejo de errores de red
- **v1.2** (17/12/2024): Correcciones de UI y sincronización
  - Botón X corregido en lista de jugadores
  - Mejor sincronización cuando jugadores salen
  - Corrección de error "El juego ya ha comenzado"
  - Mejor manejo de errores de red

**Para instalar**: Transferir el APK al dispositivo Android y permitir instalación desde fuentes desconocidas.

---

## 📊 Conexión a Base de Datos (DBeaver)

### Configuración PostgreSQL

```
Host: 163.192.223.30
Puerto: 5432
Base de datos: impostor_futbol
Usuario: postgres
Contraseña: (vacía)
```

**Nota**: Para conectar desde DBeaver, PostgreSQL debe estar configurado para aceptar conexiones remotas.

---

## ✅ Checklist de Verificación

### Infraestructura
- [x] Redis instalado y funcionando
- [x] PostgreSQL instalado y funcionando
- [x] Elasticsearch instalado y funcionando
- [x] Backend corriendo en PM2
- [x] Firewall configurado (puertos 3000, 5432, 9200)
- [x] Servidor escuchando en 0.0.0.0

### Backend
- [x] API REST completa
- [x] WebSocket funcionando
- [x] Health checks implementados
- [x] Validaciones de entrada
- [x] Manejo de errores
- [x] Guardado de historial
- [x] Sistema de ratings
- [x] Búsqueda con Elasticsearch

### Frontend
- [x] Modo local funcional
- [x] Modo online funcional
- [x] Navegación automática
- [x] Sincronización en tiempo real
- [x] Manejo de errores de red
- [x] UI completa para todas las fases
- [x] APK generado y probado

### Base de Datos
- [x] Tablas PostgreSQL creadas
- [x] Índices Elasticsearch creados
- [x] Migraciones ejecutadas
- [x] Conexión desde DBeaver funcionando

---

## 📝 Notas Importantes

### Seguridad
Las configuraciones actuales son para **desarrollo**. Para producción, implementar:
- Autenticación de usuarios (JWT)
- HTTPS/SSL
- Restricciones de IP en PostgreSQL
- Contraseñas seguras
- Rate limiting avanzado
- Validación de sesiones

### Escalabilidad
El sistema está diseñado para escalar horizontalmente:
- Redis puede usar cluster
- PostgreSQL puede usar réplicas
- Elasticsearch puede usar cluster
- Backend puede usar load balancer

### Limitaciones Actuales
- No hay autenticación de usuarios (cualquiera puede usar cualquier nombre)
- No hay validación de sesiones (no se puede expulsar usuarios)
- No hay moderación de contenido
- No hay límite de partidas simultáneas por usuario
- No hay sistema de reportes

---

## 🎯 Próximos Pasos Sugeridos

### Prioridad Alta
1. **Sistema de autenticación** - Login/registro con JWT
2. **Pantallas de perfil** - Ver estadísticas personales
3. **Pantalla de historial** - Ver partidas jugadas
4. **Pantalla de rankings** - Ver clasificación global

### Prioridad Media
5. **Pantalla de búsqueda** - Buscar partidas y jugadores
6. **Sistema de amigos** - Agregar y jugar con amigos
7. **Notificaciones push** - Alertas de nuevas partidas
8. **Chat en tiempo real** - Comunicación durante el juego

### Prioridad Baja
9. **Modo torneo** - Competencias organizadas
10. **Logros y badges** - Sistema de recompensas
11. **Configuración de perfil** - Avatar, nombre, etc.
12. **Tests automatizados** - Unit tests y integration tests

---

## 🐛 Problemas Conocidos

### Resueltos
- ✅ Botón X desalineado en lista de jugadores
- ✅ Jugadores no se eliminaban al salir
- ✅ Error "El juego ya ha comenzado" al iniciar
- ✅ Servidor no aceptaba conexiones externas
- ✅ Errores de red sin información útil

### Pendientes
- ⚠️ No hay validación de sesiones (usuarios pueden usar nombres duplicados)
- ⚠️ No hay expulsión de jugadores inactivos
- ⚠️ No hay límite de tiempo para acciones
- ⚠️ No hay recuperación automática de conexión perdida

---

## 📞 Información de Contacto y Soporte

**Repositorio**: GitHub  
**VM**: Oracle Cloud (163.192.223.30)  
**Estado**: En desarrollo activo

---

**Desarrollado con ❤️ para jugar con amigos**

---

## 📋 Resumen Ejecutivo

### ¿Qué tenemos?
- ✅ Aplicación móvil funcional (Android)
- ✅ Backend completo con 3 bases de datos
- ✅ Modo local y online operativos
- ✅ Sistema de historial y rankings
- ✅ Búsqueda avanzada
- ✅ APK compilado y probado

### ¿Qué falta?
- ❌ Autenticación de usuarios
- ❌ Pantallas de perfil y estadísticas
- ❌ Sistema de amigos
- ❌ Notificaciones
- ❌ Chat en tiempo real
- ❌ Tests automatizados

### ¿En qué estamos?
- 🔄 Mejoras de UI/UX
- 🔄 Optimizaciones de rendimiento
- 🔄 Corrección de bugs menores
- 🔄 Preparación para producción

### ¿Qué sigue?
1. Implementar autenticación
2. Agregar pantallas de perfil
3. Sistema de amigos
4. Optimizaciones y tests

---

**Última revisión**: 17 de Diciembre 2024
