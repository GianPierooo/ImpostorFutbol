# 🐘 Guía de Instalación - PostgreSQL (Fase 2)

## 📋 Pasos para Instalar PostgreSQL en la VM

### Paso 1: Conectar a la VM

```bash
ssh ubuntu@163.192.223.30
```

### Paso 2: Instalar PostgreSQL

```bash
# Actualizar paquetes
sudo apt update

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Verificar instalación
sudo systemctl status postgresql
```

### Paso 3: Crear Base de Datos

```bash
# Acceder como usuario postgres
sudo -u postgres psql

# Dentro de psql, ejecutar:
CREATE DATABASE impostor_futbol;

# (Opcional) Crear usuario específico
CREATE USER impostor_user WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE impostor_futbol TO impostor_user;

# Salir de psql
\q
```

### Paso 4: Ejecutar Migraciones

```bash
# Ir al directorio del proyecto
cd ~/ImpostorFutbol/backend

# Ejecutar migraciones
sudo -u postgres psql -d impostor_futbol -f database/migrations/001_create_tables.sql
```

### Paso 5: Configurar Variables de Entorno

```bash
# Editar .env
nano backend/.env

# Agregar:
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=impostor_futbol
POSTGRES_USER=postgres
POSTGRES_PASSWORD=
```

### Paso 6: Instalar Dependencias

```bash
cd ~/ImpostorFutbol/backend
npm install
```

### Paso 7: Probar Conexión

```bash
# Iniciar servidor
npm start

# Deberías ver:
# ✅ PostgreSQL conectado correctamente
```

## ✅ Verificación

### Verificar que PostgreSQL está corriendo:
```bash
sudo systemctl status postgresql
```

### Verificar tablas creadas:
```bash
sudo -u postgres psql -d impostor_futbol -c "\dt"
```

### Verificar conexión desde Node.js:
```bash
cd ~/ImpostorFutbol/backend
node -e "require('./config/postgres').testConnection()"
```

## 🚨 Solución de Problemas

### Error: "password authentication failed"
```bash
# Editar configuración de autenticación
sudo nano /etc/postgresql/*/main/pg_hba.conf

# Cambiar línea:
# local   all             all                                     peer
# Por:
# local   all             all                                     md5

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

### Error: "database does not exist"
```bash
# Crear base de datos
sudo -u postgres psql -c "CREATE DATABASE impostor_futbol;"
```

### Error: "relation does not exist"
```bash
# Ejecutar migraciones
cd ~/ImpostorFutbol/backend
sudo -u postgres psql -d impostor_futbol -f database/migrations/001_create_tables.sql
```

## 📝 Notas

- Por defecto, PostgreSQL escucha en `localhost:5432`
- El usuario `postgres` es el superusuario por defecto
- Si creas un usuario específico, asegúrate de darle permisos adecuados
- Las tablas se crean automáticamente con índices para mejor performance

