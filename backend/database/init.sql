-- Script de inicialización de la base de datos
-- Ejecutar como usuario postgres
-- NOTA: Este script debe ejecutarse paso a paso manualmente

-- Paso 1: Crear base de datos (ejecutar desde psql como postgres)
-- CREATE DATABASE impostor_futbol;

-- Paso 2: Crear usuario (opcional)
-- CREATE USER impostor_user WITH PASSWORD 'tu_password_seguro';
-- GRANT ALL PRIVILEGES ON DATABASE impostor_futbol TO impostor_user;

-- Paso 3: Conectar a la base de datos y ejecutar migraciones
-- Desde la terminal:
-- sudo -u postgres psql -d impostor_futbol -f database/migrations/001_create_tables.sql

-- O desde psql:
-- \c impostor_futbol
-- \i /ruta/completa/a/database/migrations/001_create_tables.sql

