/**
 * Servicio para operaciones con Elasticsearch
 * Wrapper sobre el cliente de Elasticsearch
 */

const { client } = require('../config/elasticsearch');

class ElasticsearchService {
  /**
   * Indexar un documento
   * @param {string} index - Nombre del índice
   * @param {string} id - ID del documento
   * @param {object} document - Documento a indexar
   * @returns {Promise<object>}
   */
  async index(index, id, document) {
    try {
      const response = await client.index({
        index,
        id,
        document,
      });
      return response;
    } catch (error) {
      console.error(`Error indexing document in ${index}:`, error.message);
      throw error;
    }
  }

  /**
   * Actualizar un documento
   * @param {string} index - Nombre del índice
   * @param {string} id - ID del documento
   * @param {object} document - Documento a actualizar
   * @returns {Promise<object>}
   */
  async update(index, id, document) {
    try {
      const response = await client.update({
        index,
        id,
        doc: document,
      });
      return response;
    } catch (error) {
      console.error(`Error updating document in ${index}:`, error.message);
      throw error;
    }
  }

  /**
   * Eliminar un documento
   * @param {string} index - Nombre del índice
   * @param {string} id - ID del documento
   * @returns {Promise<object>}
   */
  async delete(index, id) {
    try {
      const response = await client.delete({
        index,
        id,
      });
      return response;
    } catch (error) {
      console.error(`Error deleting document from ${index}:`, error.message);
      throw error;
    }
  }

  /**
   * Buscar documentos
   * @param {string} index - Nombre del índice
   * @param {object} query - Query de búsqueda
   * @param {number} size - Tamaño de resultados
   * @param {number} from - Offset
   * @returns {Promise<object>}
   */
  async search(index, query, size = 10, from = 0) {
    try {
      const response = await client.search({
        index,
        body: {
          query,
          size,
          from,
        },
      });
      return response;
    } catch (error) {
      console.error(`Error searching in ${index}:`, error.message);
      throw error;
    }
  }

  /**
   * Obtener un documento por ID
   * @param {string} index - Nombre del índice
   * @param {string} id - ID del documento
   * @returns {Promise<object|null>}
   */
  async get(index, id) {
    try {
      const response = await client.get({
        index,
        id,
      });
      return response._source;
    } catch (error) {
      if (error.statusCode === 404) {
        return null;
      }
      console.error(`Error getting document from ${index}:`, error.message);
      throw error;
    }
  }
}

module.exports = new ElasticsearchService();

