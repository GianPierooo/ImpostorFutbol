# Base de Datos PostgreSQL - Impostor Fútbol

## 📋 Instalación en la VM

### Paso 1: Instalar PostgreSQL

```bash
# Actualizar paquetes
sudo apt update

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Iniciar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar instalación
sudo -u postgres psql -c "SELECT version();"
```

### Paso 2: Configurar Base de Datos

```bash
# Acceder como usuario postgres
sudo -u postgres psql

# Crear base de datos
CREATE DATABASE impostor_futbol;

# (Opcional) Crear usuario específico
CREATE USER impostor_user WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE impostor_futbol TO impostor_user;

# Salir
\q
```

### Paso 3: Ejecutar Migraciones

```bash
# Ir al directorio del backend
cd ~/ImpostorFutbol/backend

# Conectar a la base de datos y ejecutar migraciones
sudo -u postgres psql -d impostor_futbol -f database/migrations/001_create_tables.sql
```

O manualmente:

```bash
# Acceder a la base de datos
sudo -u postgres psql -d impostor_futbol

# Ejecutar el contenido de 001_create_tables.sql
\i database/migrations/001_create_tables.sql

# Verificar tablas creadas
\dt

# Salir
\q
```

### Paso 4: Configurar Variables de Entorno

Editar `backend/.env`:

```env
# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=impostor_futbol
POSTGRES_USER=postgres
POSTGRES_PASSWORD=tu_password_si_creaste_usuario
```

Si usas el usuario `postgres` por defecto, puedes dejar `POSTGRES_PASSWORD` vacío.

### Paso 5: Instalar Dependencias

```bash
cd ~/ImpostorFutbol/backend
npm install
```

### Paso 6: Probar Conexión

```bash
# Iniciar el servidor
npm start

# Deberías ver:
# ✅ PostgreSQL conectado correctamente
```

## 📊 Estructura de Tablas

### `users`
- Almacena información de usuarios
- Campos: id, username, email, avatar, rating, estadísticas

### `game_history`
- Almacena partidas completadas
- Campos: id, room_code, secret_word, impostor_id, winner, etc.

### `participations`
- Almacena participaciones de usuarios en partidas
- Relación: game_history ↔ users

### `pistas_history`
- Almacena todas las pistas dadas en cada partida
- Relación: game_history ↔ users

### `votes_history`
- Almacena todos los votos en cada partida
- Relación: game_history ↔ users

## 🔧 Comandos Útiles

```bash
# Conectar a PostgreSQL
sudo -u postgres psql -d impostor_futbol

# Ver todas las tablas
\dt

# Ver estructura de una tabla
\d users

# Ver datos de una tabla
SELECT * FROM users;

# Salir
\q

# Backup de la base de datos
sudo -u postgres pg_dump impostor_futbol > backup.sql

# Restaurar backup
sudo -u postgres psql -d impostor_futbol < backup.sql
```

## 🚨 Troubleshooting

### Error: "password authentication failed"
- Verifica que el usuario y contraseña en `.env` sean correctos
- Si usas usuario `postgres`, puede que necesites configurar autenticación en `/etc/postgresql/*/main/pg_hba.conf`

### Error: "database does not exist"
- Asegúrate de haber creado la base de datos: `CREATE DATABASE impostor_futbol;`

### Error: "relation does not exist"
- Ejecuta las migraciones: `sudo -u postgres psql -d impostor_futbol -f database/migrations/001_create_tables.sql`

