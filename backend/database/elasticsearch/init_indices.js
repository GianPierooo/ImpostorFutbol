/**
 * Script para inicializar índices de Elasticsearch
 * Ejecutar: node database/elasticsearch/init_indices.js
 */

const { client, createIndex } = require('../../config/elasticsearch');

async function initIndices() {
  console.log('🚀 Inicializando índices de Elasticsearch...\n');

  // Índice de partidas públicas
  const gamesMapping = {
    properties: {
      room_code: { type: 'keyword' },
      host_id: { type: 'keyword' },
      host_name: { 
        type: 'text',
        fields: {
          keyword: { type: 'keyword' },
        },
      },
      status: { type: 'keyword' },
      player_count: { type: 'integer' },
      max_players: { type: 'integer' },
      created_at: { type: 'date' },
      last_activity: { type: 'date' },
    },
  };

  // Índice de usuarios
  const usersMapping = {
    properties: {
      user_id: { type: 'keyword' },
      username: { 
        type: 'text',
        fields: {
          keyword: { type: 'keyword' },
        },
      },
      rating: { type: 'integer' },
      games_played: { type: 'integer' },
      games_won: { type: 'integer' },
      win_rate: { type: 'float' },
      last_active: { type: 'date' },
    },
  };

  // Índice de rankings
  const rankingsMapping = {
    properties: {
      user_id: { type: 'keyword' },
      username: { type: 'text' },
      rating: { type: 'integer' },
      position: { type: 'integer' },
      updated_at: { type: 'date' },
    },
  };

  try {
    await createIndex('games', gamesMapping);
    await createIndex('users', usersMapping);
    await createIndex('rankings', rankingsMapping);

    console.log('\n✅ Todos los índices inicializados correctamente');
  } catch (error) {
    console.error('\n❌ Error inicializando índices:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initIndices()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { initIndices };

