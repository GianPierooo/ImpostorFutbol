-- Script para dar permisos al usuario en el esquema público
-- Ejecutar DESPUÉS de crear el usuario y conectado a la base de datos impostor_futbol
-- Ejemplo: sudo -u postgres psql -d impostor_futbol -f database/database/setup_user.sql

-- Dar permisos en el esquema público
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO impostor_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO impostor_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO impostor_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO impostor_user;

