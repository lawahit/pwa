const { Pool } = require('pg');

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

// Headers CORS
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

// Función para validar recurso
function validarRecurso(data, esActualizacion = false) {
  const errores = [];
  const categoriasValidas = ['Docker', 'Kubernetes', 'Docker Compose'];
  
  if (!esActualizacion || data.titulo !== undefined) {
    if (!data.titulo || typeof data.titulo !== 'string') {
      errores.push('El campo "titulo" es requerido y debe ser texto');
    } else if (data.titulo.length > 200) {
      errores.push('El campo "titulo" no puede exceder 200 caracteres');
    }
  }
  
  if (!esActualizacion || data.descripcion !== undefined) {
    if (!data.descripcion || typeof data.descripcion !== 'string') {
      errores.push('El campo "descripcion" es requerido y debe ser texto');
    } else if (data.descripcion.length > 1000) {
      errores.push('El campo "descripcion" no puede exceder 1000 caracteres');
    }
  }
  
  if (!esActualizacion || data.categoria !== undefined) {
    if (!data.categoria) {
      errores.push('El campo "categoria" es requerido');
    } else if (!categoriasValidas.includes(data.categoria)) {
      errores.push(`El campo "categoria" debe ser uno de: ${categoriasValidas.join(', ')}`);
    }
  }
  
  if (!esActualizacion || data.url !== undefined) {
    if (!data.url || typeof data.url !== 'string') {
      errores.push('El campo "url" es requerido y debe ser texto');
    } else {
      try {
        new URL(data.url);
      } catch (e) {
        errores.push('El campo "url" debe ser una URL válida');
      }
    }
  }
  
  return errores;
}

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
    const path = event.path.replace('/.netlify/functions/recursos', '');
    const method = event.httpMethod;

    // GET /api/recursos - Listar todos
    if (method === 'GET' && !path) {
      const result = await pool.query(
        'SELECT * FROM recursos ORDER BY fecha_creacion DESC'
      );
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.rows)
      };
    }

    // GET /api/recursos/:id - Obtener uno
    if (method === 'GET' && path) {
      const id = path.replace('/', '');
      const result = await pool.query(
        'SELECT * FROM recursos WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Recurso no encontrado' })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.rows[0])
      };
    }

    // POST /api/recursos - Crear nuevo
    if (method === 'POST') {
      const data = JSON.parse(event.body);
      
      // Validar datos
      const errores = validarRecurso(data);
      if (errores.length > 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Datos inválidos', detalles: errores })
        };
      }
      
      const { titulo, descripcion, categoria, url } = data;
      
      const result = await pool.query(
        'INSERT INTO recursos (titulo, descripcion, categoria, url) VALUES ($1, $2, $3, $4) RETURNING *',
        [titulo, descripcion, categoria, url]
      );
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(result.rows[0])
      };
    }

    // PUT /api/recursos/:id - Actualizar
    if (method === 'PUT' && path) {
      const id = path.replace('/', '');
      const data = JSON.parse(event.body);
      
      // Validar datos
      const errores = validarRecurso(data, true);
      if (errores.length > 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Datos inválidos', detalles: errores })
        };
      }
      
      const { titulo, descripcion, categoria, url } = data;
      
      // Verificar existencia
      const existing = await pool.query(
        'SELECT * FROM recursos WHERE id = $1',
        [id]
      );
      
      if (existing.rows.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Recurso no encontrado' })
        };
      }
      
      const result = await pool.query(
        'UPDATE recursos SET titulo = $1, descripcion = $2, categoria = $3, url = $4 WHERE id = $5 RETURNING *',
        [titulo, descripcion, categoria, url, id]
      );
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.rows[0])
      };
    }

    // DELETE /api/recursos/:id - Eliminar
    if (method === 'DELETE' && path) {
      const id = path.replace('/', '');
      
      // Verificar existencia
      const existing = await pool.query(
        'SELECT * FROM recursos WHERE id = $1',
        [id]
      );
      
      if (existing.rows.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Recurso no encontrado' })
        };
      }
      
      await pool.query(
        'DELETE FROM recursos WHERE id = $1',
        [id]
      );
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Recurso eliminado exitosamente' })
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
