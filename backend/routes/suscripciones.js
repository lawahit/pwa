const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');
const { enviarNotificacionATodos } = require('../services/pushService');

/**
 * POST /api/suscripciones
 * Registrar nueva suscripción push
 */
router.post('/', async (req, res) => {
  try {
    const { endpoint, keys } = req.body;

    // Validar datos requeridos
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({
        error: 'Datos de suscripción incompletos',
        detalles: 'Se requiere endpoint, p256dh y auth'
      });
    }

    // Validar formato de endpoint (debe ser una URL válida)
    try {
      new URL(endpoint);
    } catch (e) {
      return res.status(400).json({
        error: 'Endpoint inválido',
        detalles: 'El endpoint debe ser una URL válida'
      });
    }

    // Insertar suscripción en la base de datos
    // El constraint UNIQUE en endpoint previene duplicados automáticamente
    // Si ya existe, actualizamos las claves (por si cambiaron)
    const result = await pool.query(
      `INSERT INTO suscripciones (endpoint, p256dh, auth) 
       VALUES ($1, $2, $3)
       ON CONFLICT (endpoint) 
       DO UPDATE SET 
         p256dh = EXCLUDED.p256dh, 
         auth = EXCLUDED.auth
       RETURNING id`,
      [endpoint, keys.p256dh, keys.auth]
    );

    console.log('✓ Suscripción registrada:', endpoint.substring(0, 50) + '...');

    res.status(201).json({
      success: true,
      message: 'Suscripción registrada correctamente',
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('✗ Error al registrar suscripción:', error.message);
    
    // Manejar errores específicos de base de datos PostgreSQL
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        error: 'No se pudo conectar a la base de datos',
        detalles: 'El servicio de base de datos no está disponible'
      });
    }
    
    if (error.code === '42P01') {
      return res.status(500).json({
        error: 'Tabla de suscripciones no encontrada',
        detalles: 'La base de datos no está configurada correctamente'
      });
    }
    
    if (error.code === '28P01') {
      return res.status(503).json({
        error: 'Error de autenticación con la base de datos',
        detalles: 'Credenciales incorrectas'
      });
    }
    
    res.status(500).json({
      error: 'Error al registrar suscripción',
      detalles: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/notificar
 * Enviar notificación manual a todas las suscripciones
 */
router.post('/notificar', async (req, res) => {
  try {
    const { title, body, url } = req.body;

    // Validar datos requeridos
    if (!title || !body) {
      return res.status(400).json({
        error: 'Datos de notificación incompletos',
        detalles: 'Se requiere title y body'
      });
    }

    // Validar longitud de campos
    if (title.length > 100) {
      return res.status(400).json({
        error: 'Título demasiado largo',
        detalles: 'El título no puede exceder 100 caracteres'
      });
    }

    if (body.length > 300) {
      return res.status(400).json({
        error: 'Cuerpo demasiado largo',
        detalles: 'El cuerpo no puede exceder 300 caracteres'
      });
    }

    // Validar URL si se proporciona
    if (url) {
      try {
        new URL(url);
      } catch (e) {
        return res.status(400).json({
          error: 'URL inválida',
          detalles: 'La URL proporcionada no es válida'
        });
      }
    }

    // Construir payload de notificación
    const payload = {
      title,
      body,
      url: url || '/',
      icon: '/img/favicon-192.png',
      badge: '/img/favicon-96.png'
    };

    // Enviar notificación a todas las suscripciones
    const resultado = await enviarNotificacionATodos(payload);

    console.log(`✓ Notificación enviada: ${resultado.enviadas}/${resultado.total}`);

    res.json({
      success: true,
      message: 'Notificación enviada',
      total: resultado.total,
      enviadas: resultado.enviadas,
      fallidas: resultado.fallidas
    });
  } catch (error) {
    console.error('✗ Error al enviar notificación:', error.message);
    
    res.status(500).json({
      error: 'Error al enviar notificación',
      detalles: 'Error interno del servidor'
    });
  }
});

module.exports = router;
