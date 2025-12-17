-- Script para crear usuario PostgreSQL con contraseña
-- Ejecutar como usuario postgres desde cualquier base de datos
-- Ejemplo: sudo -u postgres psql -f backend/database/create_user.sql

-- Crear usuario con contraseña (si no existe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'impostor_user') THEN
    CREATE USER impostor_user WITH PASSWORD 'impostor_futbol_2024';
  END IF;
END
$$;

-- Dar permisos en la base de datos
GRANT ALL PRIVILEGES ON DATABASE impostor_futbol TO impostor_user;

