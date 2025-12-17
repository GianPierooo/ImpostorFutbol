/**
 * Configuración de conexión a Elasticsearch
 */

const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();

// Construir configuración de conexión
const elasticConfig = {
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
};

// Agregar autenticación si está configurada
if (process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD) {
  elasticConfig.auth = {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD,
  };
}

const client = new Client(elasticConfig);

// Función para probar la conexión
async function testConnection() {
  try {
    const response = await client.ping();
    if (response) {
      const info = await client.info();
      console.log('✅ Elasticsearch conectado correctamente');
      console.log('📦 Versión:', info.version.number);
      console.log('🏷️  Cluster:', info.cluster_name);
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Error conectando a Elasticsearch:', error.message);
    return false;
  }
}

// Función para verificar si un índice existe
async function indexExists(indexName) {
  try {
    const response = await client.indices.exists({ index: indexName });
    return response;
  } catch (error) {
    return false;
  }
}

// Función para crear índice con mapping
async function createIndex(indexName, mapping) {
  try {
    const exists = await indexExists(indexName);
    if (exists) {
      console.log(`ℹ️  Índice ${indexName} ya existe`);
      return true;
    }

    await client.indices.create({
      index: indexName,
      body: {
        mappings: mapping,
      },
    });

    console.log(`✅ Índice ${indexName} creado correctamente`);
    return true;
  } catch (error) {
    console.error(`❌ Error creando índice ${indexName}:`, error.message);
    return false;
  }
}

module.exports = {
  client,
  testConnection,
  indexExists,
  createIndex,
};

