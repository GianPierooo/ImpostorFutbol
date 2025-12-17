# 🔍 Guía de Instalación - Elasticsearch (Fase 3)

## 📋 Pasos para Instalar Elasticsearch en la VM

### Paso 1: Conectar a la VM

```bash
ssh ubuntu@163.192.223.30
```

### Paso 2: Instalar Java (Requisito de Elasticsearch)

```bash
# Actualizar paquetes
sudo apt update

# Instalar Java 17 (requerido por Elasticsearch 8.x)
sudo apt install openjdk-17-jdk -y

# Verificar instalación
java -version
```

### Paso 3: Instalar Elasticsearch

```bash
# Agregar clave GPG de Elasticsearch
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -

# Agregar repositorio
echo "deb https://artifacts.elastic.co/packages/8.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-8.x.list

# Actualizar e instalar
sudo apt update
sudo apt install elasticsearch -y
```

### Paso 4: Configurar Elasticsearch

```bash
# Editar configuración
sudo nano /etc/elasticsearch/elasticsearch.yml
```

Cambiar estas líneas:

```yaml
# Network
network.host: 0.0.0.0
http.port: 9200

# Discovery
discovery.type: single-node
```

### Paso 5: Iniciar Elasticsearch

```bash
# Iniciar servicio
sudo systemctl start elasticsearch
sudo systemctl enable elasticsearch

# Verificar estado
sudo systemctl status elasticsearch
```

### Paso 6: Configurar Firewall

```bash
# Abrir puerto 9200 (Elasticsearch HTTP)
sudo ufw allow 9200/tcp

# Verificar
sudo ufw status
```

### Paso 7: Verificar Instalación

```bash
# Probar conexión
curl http://localhost:9200

# Deberías ver información de Elasticsearch en JSON
```

### Paso 8: Configurar Variables de Entorno

```bash
cd ~/ImpostorFutbol/backend
nano .env
```

Agregar:

```env
# Elasticsearch
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_USERNAME=
ELASTICSEARCH_PASSWORD=
```

### Paso 9: Instalar Dependencias y Reiniciar

```bash
cd ~/ImpostorFutbol/backend
npm install
pm2 restart impostor-backend --update-env
pm2 logs impostor-backend --lines 20
```

### Paso 10: Inicializar Índices

```bash
cd ~/ImpostorFutbol/backend
node database/elasticsearch/init_indices.js
```

## ✅ Verificación

### Verificar que Elasticsearch está corriendo:
```bash
sudo systemctl status elasticsearch
curl http://localhost:9200
```

### Verificar índices creados:
```bash
curl http://localhost:9200/_cat/indices?v
```

### Verificar desde el backend:
```bash
curl http://163.192.223.30:3000/api/health/elasticsearch
```

## 🚨 Solución de Problemas

### Error: "Java not found"
```bash
sudo apt install openjdk-17-jdk -y
```

### Error: "Failed to bind to port 9200"
```bash
# Ver qué está usando el puerto
sudo lsof -i :9200

# O verificar configuración
sudo nano /etc/elasticsearch/elasticsearch.yml
```

### Error: "Connection refused"
```bash
# Verificar que Elasticsearch está corriendo
sudo systemctl status elasticsearch

# Ver logs
sudo journalctl -u elasticsearch -n 50
```

### Error: "Authentication required"
Si Elasticsearch tiene seguridad habilitada, necesitas configurar usuario y contraseña en `.env`:
```env
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=tu_password
```

## 📝 Notas

- Elasticsearch 8.x requiere Java 17+
- Por defecto, Elasticsearch escucha en `localhost:9200`
- Los índices se crean automáticamente al iniciar el servidor
- Si Elasticsearch no está disponible, el servidor funciona en modo degradado (sin búsqueda)

## 🔒 Seguridad (Opcional)

Si quieres habilitar seguridad en Elasticsearch:

```bash
# Generar contraseñas
sudo /usr/share/elasticsearch/bin/elasticsearch-setup-passwords auto

# Guardar las contraseñas y configurarlas en .env
```

