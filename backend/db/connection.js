const { Pool } = require('pg');
require('dotenv').config();

// Crear pool de conexiones PostgreSQL (Render Database)
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 10, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Función para verificar la conexión
async function verificarConexion() {
  try {
    const client = await pool.connect();
    console.log('✓ Conexión a PostgreSQL establecida correctamente');
    client.release();
    return true;
  } catch (error) {
    console.error('✗ Error al conectar a PostgreSQL:', error.message);
    return false;
  }
}

module.exports = { pool, verificarConexion };
