/**
 * Servicio para operaciones con PostgreSQL
 * Wrapper sobre el pool de conexiones
 */

const { pool } = require('../config/postgres');

class PostgresService {
  /**
   * Ejecuta una query
   * @param {string} text - Query SQL
   * @param {array} params - Parámetros de la query
   * @returns {Promise<object>}
   */
  async query(text, params) {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Error executing query', { text, error: error.message });
      throw error;
    }
  }

  /**
   * Obtiene un cliente del pool para transacciones
   * @returns {Promise<object>}
   */
  async getClient() {
    return await pool.connect();
  }

  /**
   * Inicia una transacción
   * @param {function} callback - Función que ejecuta las queries
   * @returns {Promise<any>}
   */
  async transaction(callback) {
    return new Promise(async (resolve, reject) => {
      const client = await this.getClient();
      try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        resolve(result);
      } catch (error) {
        await client.query('ROLLBACK');
        reject(error);
      } finally {
        client.release();
      }
    });
  }
}

module.exports = new PostgresService();

