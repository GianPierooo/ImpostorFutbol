/**
 * Modelo de Sala
 */

class Room {
  constructor(data) {
    this.code = data.code;
    this.hostId = data.hostId;
    this.status = data.status || 'lobby';
    this.config = data.config || { rounds: 3 };
    this.createdAt = data.createdAt || Date.now();
    this.lastActivity = data.lastActivity || Date.now();
  }

  /**
   * Convierte el modelo a objeto plano
   * @returns {object}
   */
  toJSON() {
    return {
      code: this.code,
      hostId: this.hostId,
      status: this.status,
      config: this.config,
      createdAt: this.createdAt,
      lastActivity: this.lastActivity,
    };
  }

  /**
   * Actualiza la última actividad
   */
  updateActivity() {
    this.lastActivity = Date.now();
  }
}

module.exports = Room;

