# Solución al Error 429 (Too Many Requests)

## Problema
El servidor está respondiendo pero bloqueando peticiones con error 429 debido al rate limiting.

## Soluciones

### Opción 1: Aumentar el límite de rate limiting (YA HECHO)
Ya aumenté el límite de 100 a 1000 requests por 15 minutos en `backend/server.js`.

### Opción 2: Reiniciar el servidor en la VM
Después de hacer los cambios, necesitas reiniciar el servidor:

```bash
# En la VM, ejecuta:
cd /ruta/al/backend
pm2 restart all
# O si no está en PM2:
pm2 start server.js --name impostor-backend
```

### Opción 3: Limpiar el rate limiting (si es necesario)
Si el rate limiting está bloqueando tu IP, puedes:

1. Esperar 15 minutos para que se resetee
2. O reiniciar Redis (que almacena los contadores):
```bash
redis-cli FLUSHALL
```

### Opción 4: Deshabilitar temporalmente el rate limiting
Si necesitas probar sin rate limiting, comenta estas líneas en `backend/server.js`:

```javascript
// app.use('/api/', limiter);
```

Luego reinicia el servidor.

## Verificación
Después de reiniciar, prueba desde la VM:

```bash
curl http://localhost:3000/api/health
```

Deberías recibir:
```json
{"status":"ok","timestamp":"...","service":"impostor-futbol-backend"}
```


