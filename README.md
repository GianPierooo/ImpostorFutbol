# 🎮 Impostor Fútbol - Modo Online

Aplicación móvil de juego social tipo "Among Us" con temática de fútbol, con modo local y modo online multijugador.

---

## 📊 Estado del Proyecto

**Estado General**: ✅ **COMPLETADO** - Todas las fases implementadas y funcionando

**Última Actualización**: 17 de Diciembre 2024

**Versión Actual**: v1.2

### Fases Completadas

- ✅ **Fase 1**: Redis + Backend Básico (Partidas en tiempo real)
- ✅ **Fase 2**: PostgreSQL (Historial y usuarios)
- ✅ **Fase 3**: Elasticsearch (Búsqueda avanzada)

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React Native** - Framework móvil
- **TypeScript** - Tipado estático
- **React Navigation** - Navegación
- **Socket.io Client** - WebSocket para tiempo real
- **Axios** - Cliente HTTP

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Socket.io** - WebSocket server
- **Redis** - Base de datos en memoria (partidas activas)
- **PostgreSQL** - Base de datos relacional (historial, usuarios)
- **Elasticsearch** - Motor de búsqueda (búsquedas avanzadas)

### Infraestructura
- **Oracle Cloud VM** - Servidor (163.192.223.30)
- **PM2** - Gestor de procesos Node.js
- **UFW** - Firewall

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
└── README.md                     # Este archivo
```

---

## 🔌 Endpoints API

### Health Checks
- `GET /api/health` - Health check básico
- `GET /api/health/full` - Health check completo (Redis, PostgreSQL, Elasticsearch)

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
- Información de usuarios, ratings, estadísticas

#### `game_history`
- Partidas completadas con resultados

#### `participations`
- Participaciones de usuarios en partidas

#### `pistas_history`
- Historial de todas las pistas dadas

#### `votes_history`
- Historial de todos los votos

### Redis - Estructuras

- `room:{code}` - Información de sala
- `players:{code}` - Set de jugadores
- `player:{code}:{id}` - Info de jugador
- `game:{code}` - Estado del juego
- `roles:{code}` - Roles asignados
- `pistas:{code}` - Lista de pistas
- `votes:{code}` - Hash de votos

### Elasticsearch - Índices

- `games` - Partidas públicas (búsqueda)
- `users` - Usuarios (búsqueda)
- `rankings` - Rankings globales

---

## 🚀 Configuración y Despliegue

### VM Oracle Cloud
- **IP**: `163.192.223.30`
- **Puerto Backend**: `3000`
- **Puerto PostgreSQL**: `5432` (solo local)
- **Puerto Elasticsearch**: `9200` (solo local)

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

## 📱 Funcionalidades

### Modo Local
- ✅ Crear partida local
- ✅ Asignar roles
- ✅ Jugar con amigos en el mismo dispositivo

### Modo Online
- ✅ Crear sala online
- ✅ Unirse a sala con código
- ✅ Partidas multijugador en tiempo real
- ✅ Sincronización de pistas y votos
- ✅ Guardado automático de historial
- ✅ Sistema de usuarios y ratings
- ✅ Rankings globales
- ✅ Búsqueda de partidas y jugadores

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
```

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar backend (desarrollo)
cd backend && npm run dev

# Iniciar frontend
npm start
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

**Nota**: Para conectar desde DBeaver, PostgreSQL debe estar configurado para aceptar conexiones remotas (ver configuración en VM).

---

## ✅ Checklist de Verificación

- [x] Redis instalado y funcionando
- [x] PostgreSQL instalado y funcionando
- [x] Elasticsearch instalado y funcionando
- [x] Backend corriendo en PM2
- [x] Firewall configurado (puertos 3000, 5432, 9200)
- [x] Frontend configurado con IP de VM
- [x] Health checks funcionando
- [x] Base de datos conectada desde DBeaver

---

## 📝 Notas Importantes

- **Seguridad**: Las configuraciones actuales son para desarrollo. Para producción, implementar:
  - Autenticación de usuarios
  - HTTPS/SSL
  - Restricciones de IP en PostgreSQL
  - Contraseñas seguras
  - Rate limiting

- **Escalabilidad**: El sistema está diseñado para escalar horizontalmente:
  - Redis puede usar cluster
  - PostgreSQL puede usar réplicas
  - Elasticsearch puede usar cluster
  - Backend puede usar load balancer

---

## 🐛 Correcciones Recientes (v1.2)

- ✅ Corregida alineación del botón X en lista de jugadores
- ✅ Ocultado botón X en modo online (no aplicable)
- ✅ Mejorada sincronización cuando jugadores salen de la sala
- ✅ Backend ahora envía estado actualizado cuando alguien sale
- ✅ Corrección de error "El juego ya ha comenzado" al iniciar partida
- ✅ Reset automático de estado de sala si no hay juego en curso
- ✅ Mejor manejo de errores de red con opción de verificar conexión

---

## 🎯 Próximos Pasos (Opcional)

- [ ] Sistema de autenticación de usuarios
- [ ] Pantallas de perfil y estadísticas en frontend
- [ ] Notificaciones push
- [ ] Chat en tiempo real
- [ ] Modo torneo
- [ ] Logros y badges

---

**Desarrollado con ❤️ para jugar con amigos**
