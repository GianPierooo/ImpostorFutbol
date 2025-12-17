/**
 * Configuración de conexión a PostgreSQL
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'impostor_futbol',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Manejar errores de conexión
pool.on('error', (err, client) => {
  console.error('⚠️ Error en cliente PostgreSQL:', err.message);
  // No hacer exit para que el servidor pueda seguir funcionando sin PostgreSQL
});

// Función para probar la conexión
async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL conectado correctamente');
    console.log('📅 Fecha del servidor:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection,
};

