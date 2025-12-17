# 📋 Guía de Instalación en VM de Oracle Cloud

## Paso 1: Preparar la VM

### 1.1 Crear VM en Oracle Cloud
1. Accede a Oracle Cloud Console
2. Crea una nueva instancia compute
3. Selecciona:
   - **Shape**: ARM Ampere (4 OCPU, 24 GB RAM) - Always Free
   - **OS**: Ubuntu 22.04 LTS
   - **SSH Key**: Genera o sube tu clave SSH

### 1.2 Conectar a la VM
```bash
ssh ubuntu@TU_IP_VM
```

## Paso 2: Instalar Node.js

```bash
# Actualizar sistema
sudo apt update
sudo apt upgrade -y

# Instalar Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version  # Debe ser v18.x o superior
npm --version
```

## Paso 3: Instalar Redis

```bash
# Instalar Redis
sudo apt install redis-server -y

# Configurar Redis
sudo nano /etc/redis/redis.conf

# Cambiar estas líneas:
# bind 127.0.0.1 → bind 0.0.0.0  (si quieres acceso externo)
# requirepass → descomentar y poner contraseña (opcional)

# Iniciar Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verificar que funciona
redis-cli ping
# Debe responder: PONG
```

## Paso 4: Configurar Firewall

```bash
# Instalar UFW si no está
sudo apt install ufw -y

# Permitir SSH
sudo ufw allow 22/tcp

# Permitir puerto del backend
sudo ufw allow 3000/tcp

# Activar firewall
sudo ufw enable

# Ver estado
sudo ufw status
```

## Paso 5: Subir el Backend

### Opción A: Desde tu máquina local
```bash
# En tu máquina local, comprimir el backend
cd /ruta/al/proyecto
tar -czf backend.tar.gz backend/

# Subir a la VM
scp backend.tar.gz ubuntu@TU_IP_VM:~/

# En la VM, descomprimir
ssh ubuntu@TU_IP_VM
tar -xzf backend.tar.gz
cd backend
```

### Opción B: Clonar desde Git (si tienes repo)
```bash
# En la VM
git clone TU_REPO_URL
cd impostor-futbol/backend
```

## Paso 6: Instalar Dependencias del Backend

```bash
cd backend
npm install
```

## Paso 7: Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar configuración
nano .env
```

Configurar `.env`:
```env
NODE_ENV=production
PORT=3000

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

CORS_ORIGIN=*

ROOM_CODE_LENGTH=6
ROOM_EXPIRY_SECONDS=3600
MAX_PLAYERS_PER_ROOM=10
MIN_PLAYERS_TO_START=3
```

## Paso 8: Probar el Backend

```bash
# Iniciar en modo desarrollo
npm run dev

# O iniciar directamente
node server.js
```

Deberías ver:
```
🚀 Servidor iniciado en puerto 3000
📡 WebSocket disponible en ws://localhost:3000
🌐 API disponible en http://localhost:3000
```

## Paso 9: Instalar PM2 (Producción)

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar backend con PM2
cd backend
pm2 start server.js --name impostor-backend

# Guardar configuración
pm2 save

# Configurar para iniciar al arrancar
pm2 startup
# Ejecutar el comando que te muestre

# Ver logs
pm2 logs impostor-backend

# Ver estado
pm2 status
```

## Paso 10: Configurar Nginx (Opcional, para producción)

```bash
# Instalar Nginx
sudo apt install nginx -y

# Crear configuración
sudo nano /etc/nginx/sites-available/impostor-backend
```

Contenido:
```nginx
server {
    listen 80;
    server_name TU_DOMINIO_O_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activar sitio
sudo ln -s /etc/nginx/sites-available/impostor-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Paso 11: Verificar que Todo Funciona

### Desde tu máquina local:
```bash
# Health check
curl http://TU_IP_VM:3000/api/health

# Debe responder:
# {"status":"ok","timestamp":"...","service":"impostor-futbol-backend"}
```

## 🔧 Comandos Útiles

```bash
# Ver logs de PM2
pm2 logs impostor-backend

# Reiniciar backend
pm2 restart impostor-backend

# Detener backend
pm2 stop impostor-backend

# Ver estado de Redis
redis-cli ping

# Ver salas activas en Redis
redis-cli KEYS "room:*"

# Limpiar Redis (cuidado!)
redis-cli FLUSHALL
```

## 🐛 Troubleshooting

### Backend no inicia
- Verificar que Redis está corriendo: `redis-cli ping`
- Verificar que el puerto 3000 no está en uso: `sudo lsof -i :3000`
- Ver logs: `pm2 logs impostor-backend`

### No puedo conectar desde fuera
- Verificar firewall: `sudo ufw status`
- Verificar que el puerto está abierto en Oracle Cloud Security Lists
- Verificar que el backend está escuchando en 0.0.0.0, no solo localhost

### Redis no responde
- Reiniciar Redis: `sudo systemctl restart redis-server`
- Ver logs: `sudo journalctl -u redis-server`

## ✅ Checklist Final

- [ ] Node.js instalado y funcionando
- [ ] Redis instalado y funcionando
- [ ] Backend instalado y corriendo
- [ ] PM2 configurado
- [ ] Firewall configurado
- [ ] Health check responde correctamente
- [ ] Puedo acceder desde fuera de la VM

## 📝 Nota sobre IP Pública

Si tu VM tiene IP pública dinámica, considera:
1. Usar un dominio (ej: impostorfutbol.com)
2. Configurar DNS dinámico
3. O usar la IP directamente en la app móvil

