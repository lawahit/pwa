const { Pool } = require('pg');
const webpush = require('web-push');

// Crear pool de conexiones PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Configurar web-push
webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:admin@pwa-contenedores.com',
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
);

// Headers CORS
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event, context) => {
  // Manejar OPTIONS para CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const path = event.path.replace('/.netlify/functions/suscripciones', '');
    const method = event.httpMethod;

    // POST /api/suscripciones - Registrar suscripción
    if (method === 'POST' && !path.includes('notificar')) {
      const data = JSON.parse(event.body);
      const { endpoint, keys } = data;

      // Validar datos
      if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Datos de suscripción incompletos',
            detalles: 'Se requiere endpoint, p256dh y auth'
          })
        };
      }

      // Validar formato de endpoint
      try {
        new URL(endpoint);
      } catch (e) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Endpoint inválido',
            detalles: 'El endpoint debe ser una URL válida'
          })
        };
      }

      // Insertar o actualizar suscripción
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

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Suscripción registrada correctamente',
          id: result.rows[0].id
        })
      };
    }

    // POST /api/suscripciones/notificar - Enviar notificación
    if (method === 'POST' && path.includes('notificar')) {
      const data = JSON.parse(event.body);
      const { title, body, url } = data;

      // Validar datos
      if (!title || !body) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Datos de notificación incompletos',
            detalles: 'Se requiere title y body'
          })
        };
      }

      if (title.length > 100) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Título demasiado largo',
            detalles: 'El título no puede exceder 100 caracteres'
          })
        };
      }

      if (body.length > 300) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Cuerpo demasiado largo',
            detalles: 'El cuerpo no puede exceder 300 caracteres'
          })
        };
      }

      // Validar URL si se proporciona
      if (url) {
        try {
          new URL(url);
        } catch (e) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              error: 'URL inválida',
              detalles: 'La URL proporcionada no es válida'
            })
          };
        }
      }

      // Obtener todas las suscripciones
      const result = await pool.query(
        'SELECT id, endpoint, p256dh, auth FROM suscripciones'
      );

      if (result.rows.length === 0) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'No hay suscripciones activas',
            total: 0,
            enviadas: 0,
            fallidas: 0
          })
        };
      }

      // Construir payload
      const payload = {
        title,
        body,
        url: url || '/',
        icon: '/img/favicon-192.png',
        badge: '/img/favicon-96.png'
      };

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

        try {
          await webpush.sendNotification(subscription, JSON.stringify(payload));
          enviadas++;
        } catch (error) {
          fallidas++;
          // Si la suscripción expiró (410), eliminarla
          if (error.statusCode === 410) {
            await pool.query(
              'DELETE FROM suscripciones WHERE endpoint = $1',
              [sub.endpoint]
            );
          }
        }
      });

      await Promise.all(promesas);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Notificación enviada',
          total: result.rows.length,
          enviadas,
          fallidas
        })
      };
    }

    // Método no permitido
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido' })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Error interno del servidor',
        detalles: error.message 
      })
    };
  }
};
