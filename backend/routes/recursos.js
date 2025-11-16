const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');
const { enviarNotificacionATodos } = require('../services/pushService');

// Función para manejar errores de base de datos PostgreSQL
function manejarErrorDB(error, res, operacion) {
  console.error(`Error en ${operacion}:`, error);
  
  // Error de conexión
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return res.status(503).json({ 
      error: 'No se pudo conectar a la base de datos',
      detalles: 'El servicio de base de datos no está disponible'
    });
  }
  
  // Error de autenticación
  if (error.code === '28P01') {
    return res.status(503).json({ 
      error: 'Error de autenticación con la base de datos',
      detalles: 'Credenciales incorrectas'
    });
  }
  
  // Error de sintaxis SQL
  if (error.code === '42601') {
    return res.status(500).json({ 
      error: 'Error en la consulta SQL',
      detalles: 'Error interno del servidor'
    });
  }
  
  // Error de tabla no existe
  if (error.code === '42P01') {
    return res.status(500).json({ 
      error: 'Tabla de base de datos no encontrada',
      detalles: 'La base de datos no está configurada correctamente'
    });
  }
  
  // Error de entrada duplicada (unique violation)
  if (error.code === '23505') {
    return res.status(400).json({ 
      error: 'Recurso duplicado',
      detalles: 'Ya existe un recurso con estos datos'
    });
  }
  
  // Error de violación de constraint NOT NULL
  if (error.code === '23502') {
    return res.status(400).json({ 
      error: 'Datos incompletos',
      detalles: 'Faltan campos requeridos en la base de datos'
    });
  }
  
  // Error de tipo de dato inválido
  if (error.code === '22P02' || error.code === '23514') {
    return res.status(400).json({ 
      error: 'Datos inválidos',
      detalles: 'El tipo de dato proporcionado no es válido'
    });
  }
  
  // Error genérico
  return res.status(500).json({ 
    error: `Error al ${operacion}`,
    detalles: 'Error interno del servidor'
  });
}

// Función de validación de datos
function validarRecurso(data, esActualizacion = false) {
  const errores = [];
  
  // Validar titulo
  if (!esActualizacion || data.titulo !== undefined) {
    if (!data.titulo || typeof data.titulo !== 'string') {
      errores.push('El campo "titulo" es requerido y debe ser texto');
    } else if (data.titulo.length > 200) {
      errores.push('El campo "titulo" no puede exceder 200 caracteres');
    }
  }
  
  // Validar descripcion
  if (!esActualizacion || data.descripcion !== undefined) {
    if (!data.descripcion || typeof data.descripcion !== 'string') {
      errores.push('El campo "descripcion" es requerido y debe ser texto');
    } else if (data.descripcion.length > 1000) {
      errores.push('El campo "descripcion" no puede exceder 1000 caracteres');
    }
  }
  
  // Validar categoria
  const categoriasValidas = ['Docker', 'Kubernetes', 'Docker Compose'];
  if (!esActualizacion || data.categoria !== undefined) {
    if (!data.categoria) {
      errores.push('El campo "categoria" es requerido');
    } else if (!categoriasValidas.includes(data.categoria)) {
      errores.push(`El campo "categoria" debe ser uno de: ${categoriasValidas.join(', ')}`);
    }
  }
  
  // Validar url
  if (!esActualizacion || data.url !== undefined) {
    if (!data.url || typeof data.url !== 'string') {
      errores.push('El campo "url" es requerido y debe ser texto');
    } else {
      // Validación básica de formato URL
      try {
        new URL(data.url);
      } catch (e) {
        errores.push('El campo "url" debe ser una URL válida');
      }
    }
  }
  
  return errores;
}

// GET /api/recursos - Listar todos los recursos
router.get('/', async (req, res) => {
  try {
    // Consulta parametrizada (sin parámetros en este caso, pero preparada para filtros futuros)
    const result = await pool.query(
      'SELECT * FROM recursos ORDER BY fecha_creacion DESC'
    );
    res.json(result.rows);
  } catch (error) {
    return manejarErrorDB(error, res, 'obtener recursos');
  }
});

// GET /api/recursos/:id - Obtener un recurso específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Consulta parametrizada con placeholder ($1) para prevenir SQL injection
    const result = await pool.query(
      'SELECT * FROM recursos WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recurso no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    return manejarErrorDB(error, res, 'obtener recurso');
  }
});

// POST /api/recursos - Crear nuevo recurso
router.post('/', async (req, res) => {
  try {
    const { titulo, descripcion, categoria, url } = req.body;
    
    // Validar datos
    const errores = validarRecurso(req.body);
    if (errores.length > 0) {
      return res.status(400).json({ error: 'Datos inválidos', detalles: errores });
    }
    
    // INSERT con consulta parametrizada usando placeholders ($1, $2, etc.)
    // RETURNING * devuelve el registro insertado (característica de PostgreSQL)
    const result = await pool.query(
      'INSERT INTO recursos (titulo, descripcion, categoria, url) VALUES ($1, $2, $3, $4) RETURNING *',
      [titulo, descripcion, categoria, url]
    );
    
    const nuevoRecurso = result.rows[0];
    
    // Enviar notificación push a todas las suscripciones activas
    try {
      const payload = {
        title: `Nuevo recurso: ${nuevoRecurso.titulo}`,
        body: nuevoRecurso.descripcion,
        url: nuevoRecurso.url,
        icon: '/img/favicon-192.png',
        badge: '/img/favicon-96.png',
        data: {
          recursoId: nuevoRecurso.id,
          categoria: nuevoRecurso.categoria
        }
      };
      
      await enviarNotificacionATodos(payload);
      console.log('✓ Notificaciones enviadas para el nuevo recurso');
    } catch (notifError) {
      // No fallar la creación del recurso si las notificaciones fallan
      console.error('✗ Error al enviar notificaciones:', notifError.message);
    }
    
    res.status(201).json(nuevoRecurso);
  } catch (error) {
    return manejarErrorDB(error, res, 'crear recurso');
  }
});

// PUT /api/recursos/:id - Actualizar recurso
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, categoria, url } = req.body;
    
    // Validar datos
    const errores = validarRecurso(req.body, true);
    if (errores.length > 0) {
      return res.status(400).json({ error: 'Datos inválidos', detalles: errores });
    }
    
    // SELECT parametrizado para verificar existencia
    const existing = await pool.query(
      'SELECT * FROM recursos WHERE id = $1',
      [id]
    );
    
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Recurso no encontrado' });
    }
    
    // UPDATE con consulta parametrizada usando placeholders ($1, $2, etc.)
    // RETURNING * devuelve el registro actualizado
    const result = await pool.query(
      'UPDATE recursos SET titulo = $1, descripcion = $2, categoria = $3, url = $4 WHERE id = $5 RETURNING *',
      [titulo, descripcion, categoria, url, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    return manejarErrorDB(error, res, 'actualizar recurso');
  }
});

// DELETE /api/recursos/:id - Eliminar recurso
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // SELECT parametrizado para verificar existencia
    const existing = await pool.query(
      'SELECT * FROM recursos WHERE id = $1',
      [id]
    );
    
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Recurso no encontrado' });
    }
    
    // DELETE con consulta parametrizada usando placeholder ($1)
    // Esto previene SQL injection al escapar el valor del id
    await pool.query(
      'DELETE FROM recursos WHERE id = $1',
      [id]
    );
    
    res.json({ message: 'Recurso eliminado exitosamente' });
  } catch (error) {
    return manejarErrorDB(error, res, 'eliminar recurso');
  }
});

module.exports = router;
