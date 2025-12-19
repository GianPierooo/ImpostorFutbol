# Comandos de Diagnóstico para la VM

## 1. Verificar estado de PM2
```bash
pm2 list
pm2 logs --lines 50
```

## 2. Verificar Redis
```bash
redis-cli ping
```

## 3. Verificar si el servidor está escuchando
```bash
netstat -tuln | grep 3000
# O en algunas distribuciones:
ss -tuln | grep 3000
```

## 4. Probar health check desde la VM
```bash
curl http://localhost:3000/api/health
curl http://127.0.0.1:3000/api/health
curl http://0.0.0.0:3000/api/health
```

## 5. Probar desde fuera (si tienes acceso SSH)
```bash
curl http://163.192.223.30:3000/api/health
```

## 6. Verificar logs del servidor
```bash
pm2 logs --lines 100
# O si no está en PM2:
tail -f /ruta/al/log/del/servidor
```

## 7. Reiniciar el servidor si es necesario
```bash
pm2 restart all
# O si no está en PM2:
cd /ruta/al/backend
node server.js
```

## 8. Verificar firewall
```bash
# Ubuntu/Debian
sudo ufw status
sudo ufw allow 3000/tcp

# CentOS/RHEL
sudo firewall-cmd --list-ports
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

## 9. Verificar procesos Node.js
```bash
ps aux | grep node
```

## 10. Verificar variables de entorno
```bash
cd /ruta/al/backend
cat .env
```


