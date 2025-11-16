require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Importar rutas
const recursosRoutes = require('./routes/recursos');
const suscripcionesRoutes = require('./routes/suscripciones');

// Inicializar aplicación Express
const app = express();

// Configurar middlewares
app.use(cors()); // Habilitar CORS para todas las rutas
app.use(express.json()); // Parser de JSON para request body
app.use(express.urlencoded({ extended: true })); // Parser de URL-encoded data

// Servir archivos estáticos del frontend desde el directorio raíz del proyecto
// Esto permite que el backend sirva la PWA
const frontendPath = path.join(__dirname, '..');
app.use(express.static(frontendPath));

// Montar rutas de la API
app.use('/api/recursos', recursosRoutes);
app.use('/api/suscripciones', suscripcionesRoutes);

// Ruta raíz de la API para verificar que el servidor está funcionando
app.get('/api', (req, res) => {
  res.json({
    message: 'API de PWA Contenedores',
    version: '1.0.0',
    endpoints: {
      recursos: '/api/recursos',
      suscripciones: '/api/suscripciones'
    }
  });
});

// Middleware de manejo de errores global
// Este debe ser el último middleware
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.stack);
  
  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      detalles: err.message
    });
  }
  
  // Error de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'JSON inválido',
      detalles: 'El cuerpo de la petición no es un JSON válido'
    });
  }
  
  // Error de base de datos duplicado
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      error: 'Recurso duplicado',
      detalles: 'Ya existe un recurso con estos datos'
    });
  }
  
  // Error genérico
  res.status(err.status || 500).json({
    error: 'Error interno del servidor',
    detalles: process.env.NODE_ENV === 'development' ? err.message : 'Ha ocurrido un error'
  });
});

// Middleware para rutas no encontradas (404)
app.use((req, res) => {
  // Si la ruta comienza con /api, retornar error JSON
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      error: 'Ruta no encontrada',
      detalles: `La ruta ${req.path} no existe`
    });
  }
  
  // Para otras rutas, servir index.html (SPA routing)
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Iniciar servidor en el puerto configurado
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`✓ Servidor Express iniciado en puerto ${PORT}`);
  console.log(`✓ API disponible en: http://localhost:${PORT}/api`);
  console.log(`✓ Frontend disponible en: http://localhost:${PORT}`);
  console.log('='.repeat(50));
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', promise, 'razón:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Excepción no capturada:', error);
  process.exit(1);
});
