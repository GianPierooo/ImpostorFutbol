-- Migración 001: Crear tablas principales
-- Base de datos: impostor_futbol

-- Habilitar extensión para UUID (compatible con PostgreSQL 9.4+)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    avatar VARCHAR(500),
    rating INTEGER DEFAULT 1000 NOT NULL,
    games_played INTEGER DEFAULT 0 NOT NULL,
    games_won INTEGER DEFAULT 0 NOT NULL,
    games_lost INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabla de historial de partidas
CREATE TABLE IF NOT EXISTS game_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_code VARCHAR(10) NOT NULL,
    secret_word VARCHAR(100) NOT NULL,
    impostor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    winner VARCHAR(20) NOT NULL CHECK (winner IN ('group', 'impostor')),
    total_rounds INTEGER NOT NULL,
    total_players INTEGER NOT NULL,
    started_at TIMESTAMP NOT NULL,
    finished_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabla de participaciones
CREATE TABLE IF NOT EXISTS participations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES game_history(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('impostor', 'normal')),
    voted_for UUID REFERENCES users(id) ON DELETE SET NULL,
    won BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(game_id, user_id)
);

-- Tabla de historial de pistas
CREATE TABLE IF NOT EXISTS pistas_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES game_history(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    round INTEGER NOT NULL,
    turn INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabla de historial de votos
CREATE TABLE IF NOT EXISTS votes_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES game_history(id) ON DELETE CASCADE NOT NULL,
    voter_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    target_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(game_id, voter_id)
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_rating ON users(rating DESC);
CREATE INDEX IF NOT EXISTS idx_game_history_room_code ON game_history(room_code);
CREATE INDEX IF NOT EXISTS idx_game_history_finished_at ON game_history(finished_at DESC);
CREATE INDEX IF NOT EXISTS idx_participations_game_id ON participations(game_id);
CREATE INDEX IF NOT EXISTS idx_participations_user_id ON participations(user_id);
CREATE INDEX IF NOT EXISTS idx_pistas_history_game_id ON pistas_history(game_id);
CREATE INDEX IF NOT EXISTS idx_votes_history_game_id ON votes_history(game_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en users
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

