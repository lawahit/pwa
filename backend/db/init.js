/**
 * Script de inicialización de base de datos PostgreSQL
 * Ejecuta el schema.sql y opcionalmente agrega datos de ejemplo
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function inicializarBaseDatos() {
  let pool;
  
  try {
    console.log('🔄 Conectando a PostgreSQL...');
    
    // Crear pool de conexiones
    pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'postgres',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    });
    
    const client = await pool.connect();
    console.log('✅ Conexión establecida');
    
    // Leer y ejecutar schema.sql
    console.log('🔄 Ejecutando schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await client.query(schema);
    console.log('✅ Tablas creadas correctamente');
    
    // Insertar datos de ejemplo
    console.log('🔄 Insertando datos de ejemplo...');
    
    const datosEjemplo = [
      {
        titulo: 'Introducción a Docker',
        descripcion: 'Aprende los conceptos básicos de Docker y cómo crear tu primer contenedor',
        categoria: 'Docker',
        url: 'https://www.youtube.com/watch?v=example1'
      },
      {
        titulo: 'Docker Compose para principiantes',
        descripcion: 'Guía completa sobre cómo usar Docker Compose para orquestar múltiples contenedores',
        categoria: 'Docker Compose',
        url: 'https://www.youtube.com/watch?v=example2'
      },
      {
        titulo: 'Kubernetes: Conceptos fundamentales',
        descripcion: 'Introducción a Kubernetes, pods, deployments y services',
        categoria: 'Kubernetes',
        url: 'https://www.youtube.com/watch?v=example3'
      },
      {
        titulo: 'Dockerfile: Mejores prácticas',
        descripcion: 'Aprende a escribir Dockerfiles eficientes y seguros',
        categoria: 'Docker',
        url: 'https://www.youtube.com/watch?v=example4'
      },
      {
        titulo: 'Despliegue de aplicaciones con Kubernetes',
        descripcion: 'Cómo desplegar y escalar aplicaciones en un cluster de Kubernetes',
        categoria: 'Kubernetes',
        url: 'https://www.youtube.com/watch?v=example5'
      }
    ];
    
    // Insertar cada recurso (ON CONFLICT para evitar duplicados)
    for (const recurso of datosEjemplo) {
      await client.query(
        `INSERT INTO recursos (titulo, descripcion, categoria, url) 
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [recurso.titulo, recurso.descripcion, recurso.categoria, recurso.url]
      );
    }
    
    console.log('✅ Datos de ejemplo insertados');
    
    // Verificar datos
    const recursos = await client.query('SELECT COUNT(*) as total FROM recursos');
    const suscripciones = await client.query('SELECT COUNT(*) as total FROM suscripciones');
    
    console.log('\n📊 Estado de la base de datos:');
    console.log(`   - Recursos: ${recursos.rows[0].total}`);
    console.log(`   - Suscripciones: ${suscripciones.rows[0].total}`);
    
    console.log('\n✨ ¡Inicialización completada exitosamente!');
    console.log('   Puedes iniciar el servidor con: npm start\n');
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error durante la inicialización:', error.message);
    
    if (error.code === '28P01') {
      console.error('\n💡 Verifica las credenciales de PostgreSQL en el archivo .env');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Asegúrate de que PostgreSQL esté accesible');
    } else if (error.code === '3D000') {
      console.error('\n💡 La base de datos especificada no existe');
    }
    
    console.error('\nDetalles del error:', error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Ejecutar script
inicializarBaseDatos();
