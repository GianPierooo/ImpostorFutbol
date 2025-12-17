# Backend - Impostor Fútbol

Backend API para el modo online de Impostor Fútbol.

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+ instalado
- Redis instalado y corriendo
- Acceso a una VM de Oracle Cloud (o servidor con Redis)

### Pasos

1. **Instalar dependencias**
   ```bash
   cd backend
   npm install
   ```

2. **Configurar variables de entorno**
   ```bash
   cp env.example .env
   ```
   
   Editar `.env` con tus configuraciones:
   ```env
   PORT=3000
   REDIS_HOST=localhost
   REDIS_PORT=6379
   CORS_ORIGIN=*
   ```

3. **Iniciar Redis** (si está en local)
   ```bash
   redis-server
   ```

4. **Iniciar el servidor**
   ```bash
   # Desarrollo (con nodemon)
   npm run dev
   
   # Producción
   npm start
   ```

## 📡 Endpoints API

### Health Check
- `GET /api/health` - Health check básico
- `GET /api/health/redis` - Health check con Redis

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
- `GET /api/games/:code/role/:playerId` - Obtener rol
- `GET /api/games/:code/voting-results` - Resultados de votación

## 🔌 WebSocket Events

### Cliente → Servidor
- `join_room` - Unirse a sala
- `leave_room` - Salir de sala
- `start_game` - Iniciar juego
- `add_pista` - Agregar pista
- `add_vote` - Agregar voto
- `change_phase` - Cambiar fase

### Servidor → Cliente
- `room_updated` - Sala actualizada
- `player_joined` - Jugador se unió
- `player_left` - Jugador salió
- `game_state_changed` - Estado del juego cambió
- `pista_added` - Pista agregada
- `vote_added` - Voto agregado
- `phase_changed` - Fase cambió
- `error` - Error ocurrido

## 🏗️ Estructura

```
backend/
├── config/          # Configuraciones
├── models/          # Modelos de datos
├── routes/          # Rutas API
├── services/        # Lógica de negocio
├── utils/           # Utilidades
├── websocket/       # Handlers WebSocket
└── server.js        # Servidor principal
```

## 🔧 Configuración en VM

### Instalar Redis
```bash
sudo apt update
sudo apt install redis-server -y
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### Abrir puertos
```bash
# Puerto 3000 (API)
sudo ufw allow 3000/tcp

# Puerto 6379 (Redis) - solo si es necesario desde fuera
sudo ufw allow 6379/tcp
```

### Usar PM2 para producción
```bash
npm install -g pm2
pm2 start server.js --name impostor-backend
pm2 save
pm2 startup
```

## 📝 Notas

- El backend usa Redis para almacenar partidas activas
- Las salas expiran después de 1 hora de inactividad (configurable)
- Máximo 10 jugadores por sala (configurable)
- Mínimo 3 jugadores para iniciar (configurable)

