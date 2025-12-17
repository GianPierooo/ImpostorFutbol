# 🔐 Configurar Usuario PostgreSQL con Contraseña

## Paso 1: Crear Base de Datos

```bash
# Crear base de datos
sudo -u postgres psql -c "CREATE DATABASE impostor_futbol;"
```

## Paso 2: Crear Usuario

```bash
# Crear usuario con contraseña
cd ~/ImpostorFutbol/backend
sudo -u postgres psql -f database/create_user.sql
```

O manualmente:

```bash
sudo -u postgres psql -c "CREATE USER impostor_user WITH PASSWORD 'impostor_futbol_2024';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE impostor_futbol TO impostor_user;"
```

## Paso 3: Dar Permisos en el Esquema

```bash
# Conectar a la base de datos y dar permisos
sudo -u postgres psql -d impostor_futbol -f database/setup_user.sql
```

O manualmente:

```bash
sudo -u postgres psql -d impostor_futbol

# Dentro de psql:
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO impostor_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO impostor_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO impostor_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO impostor_user;

\q
```

## Paso 3: Ejecutar Migraciones

```bash
cd ~/ImpostorFutbol/backend
sudo -u postgres psql -d impostor_futbol -f database/migrations/001_create_tables.sql
```

## Paso 4: Actualizar .env

```bash
cd ~/ImpostorFutbol/backend
nano .env
```

Cambiar estas líneas:

```env
# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=impostor_futbol
POSTGRES_USER=impostor_user
POSTGRES_PASSWORD=impostor_futbol_2024
```

## Paso 5: Reiniciar PM2

```bash
# Reiniciar con nuevas variables de entorno
pm2 restart impostor-backend --update-env

# Ver logs
pm2 logs impostor-backend --lines 10
```

## ✅ Verificar

Deberías ver:
```
✅ PostgreSQL conectado correctamente
📅 Fecha del servidor: ...
```

## 🔒 Cambiar Contraseña (Opcional)

Si quieres usar una contraseña diferente:

```bash
sudo -u postgres psql

# Cambiar contraseña
ALTER USER impostor_user WITH PASSWORD 'tu_nueva_contraseña_segura';

# Actualizar .env con la nueva contraseña
# Reiniciar PM2 con --update-env
```

## 🚨 Si hay problemas de autenticación

Editar configuración de autenticación:

```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

Cambiar línea:
```
local   all             all                                     peer
```

Por:
```
local   all             all                                     md5
```

Reiniciar PostgreSQL:
```bash
sudo systemctl restart postgresql
```

