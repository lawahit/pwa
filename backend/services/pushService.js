const webpush = require('web-push');
const { pool } = require('../db/connection');
require('dotenv').config();

// Configurar web-push con claves VAPID
webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:admin@pwa-contenedores.com',
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
);

/**
 * Enviar notificación push a una suscripción específica
 * @param {Object} subscription - Objeto de suscripción con endpoint, keys
 * @param {Object} payload - Datos de la notificación (title, body, url, etc.)
 * @returns {Promise<boolean>} - true si se envió correctamente
 */
async function enviarNotificacion(subscription, payload) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    console.log('✓ Notificación enviada correctamente');
    return true;
  } catch (error) {
    console.error('✗ Error al enviar notificación:', error.message);
    
    // Si la suscripción expiró (error 410), eliminarla de la base de datos
    if (error.statusCode === 410) {
      console.log('Suscripción expirada, eliminando de la base de datos...');
      await eliminarSuscripcion(subscription.endpoint);
    }
    
    return false;
  }
}

/**
 * Enviar notificación push a todas las suscripciones activas
 * @param {Object} payload - Datos de la notificación (title, body, url, etc.)
 * @returns {Promise<Object>} - Objeto con estadísticas de envío
 */
async function enviarNotificacionATodos(payload) {
  try {
    // Obtener todas las suscripciones de la base de datos
    const result = await pool.query(
      'SELECT id, endpoint, p256dh, auth FROM suscripciones'
    );

    if (result.rows.length === 0) {
      console.log('No hay suscripciones activas');
      return { total: 0, enviadas: 0, fallidas: 0 };
    }

    console.log(`Enviando notificación a ${result.rows.length} suscripciones...`);

    let enviadas = 0;
    let fallidas = 0;

    // Enviar notificación a cada suscripción
    const promesas = result.rows.map(async (sub) => {
      const subscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };

      const exito = await enviarNotificacion(subscription, payload);
      if (exito) {
        enviadas++;
      } else {
        fallidas++;
      }
    });

    await Promise.all(promesas);

    console.log(`✓ Notificaciones enviadas: ${enviadas}, Fallidas: ${fallidas}`);

    return {
      total: result.rows.length,
      enviadas,
      fallidas
    };
  } catch (error) {
    console.error('✗ Error al enviar notificaciones:', error.message);
    throw error;
  }
}

/**
 * Eliminar suscripción expirada de la base de datos
 * @param {string} endpoint - Endpoint de la suscripción a eliminar
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
async function eliminarSuscripcion(endpoint) {
  try {
    const result = await pool.query(
      'DELETE FROM suscripciones WHERE endpoint = $1',
      [endpoint]
    );

    if (result.rowCount > 0) {
      console.log('✓ Suscripción eliminada de la base de datos');
      return true;
    } else {
      console.log('Suscripción no encontrada en la base de datos');
      return false;
    }
  } catch (error) {
    console.error('✗ Error al eliminar suscripción:', error.message);
    return false;
  }
}

module.exports = {
  enviarNotificacion,
  enviarNotificacionATodos,
  eliminarSuscripcion
};
