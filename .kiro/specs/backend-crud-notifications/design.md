# Documento de Diseño

## Overview

Este diseño extiende la PWA existente con un backend Node.js/Express, base de datos MySQL, y sistema de notificaciones push. La arquitectura sigue un patrón cliente-servidor con API REST, manteniendo la funcionalidad offline de la PWA mediante Service Workers.

## Arquitectura

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────┐
│         PWA Frontend (Cliente)          │
│  ┌──────────────────────────────────┐   │
│  │  index.html + Nueva Sección CRUD │   │
│  │  main.js (lógica de UI)          │   │
│  │  Service Worker (sw.js)          │   │
│  └──────────────────────────────────┘   │
└─────────────────┬───────────────────────┘
                  │ HTTP/HTTPS
                  │ (Fetch API)
┌─────────────────▼───────────────────────┐
│      Backend Node.js + Express          │
│  ┌──────────────────────────────────┐   │
│  │  API REST Endpoints              │   │
│  │  - /api/recursos (CRUD)          │   │
│  │  - /api/suscripciones            │   │
│  │  - /api/notificar                │   │
│  │  Servicio de Notificaciones Push │   │
│  └──────────────────────────────────┘   │
└─────────────────┬───────────────────────┘
                  │ MySQL Driver
┌─────────────────▼───────────────────────┐
│         Base de Datos MySQL             │
│  ┌──────────────────────────────────┐   │
│  │  Tabla: recursos                 │   │
│  │  Tabla: suscripciones            │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Stack Tecnológico

**Frontend:**
- HTML5, CSS3, JavaScript (ES6+)
- Service Worker API
- Push API
- Fetch API

**Backend:**
- Node.js (v16+)
- Express.js (framework web)
- mysql2 (driver MySQL)
- web-push (librería para notificaciones push)
- cors (middleware para CORS)
- body-parser (parsing de JSON)

**Base de Datos:**
- MySQL 8.0+

## Components and Interfaces

### 1. Frontend Components

#### 1.1 Nueva Sección Admin (admin.html o sección en index.html)

**Responsabilidades:**
- Mostrar lista de recursos educativos
- Formulario para crear/editar recursos
- Botones de acción (editar, eliminar)
- Solicitar permisos de notificaciones

**Interfaz con Backend:**
```javascript
// GET todos los recursos
fetch('/api/recursos')
  .then(res => res.json())
  .then(data => renderRecursos(data));

// POST nuevo recurso
fetch('/api/recursos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(recurso)
});

// PUT actualizar recurso
fetch(`/api/recursos/${id}`, {
  method: 'PUT',
  body: JSON.stringify(recurso)
});

// DELETE eliminar recurso
fetch(`/api/recursos/${id}`, { method: 'DELETE' });
```

#### 1.2 Service Worker Extendido (sw.js)

**Nuevas Responsabilidades:**
- Manejar eventos push
- Mostrar notificaciones
- Gestionar clics en notificaciones
- Registrar suscripciones push

**Eventos:**
```javascript
// Evento push
self.addEventListener('push', event => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: './img/favicon-192.png',
    badge: './img/favicon-96.png',
    data: { url: data.url }
  });
});

// Evento notificationclick
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
```

#### 1.3 Módulo de Notificaciones (notifications.js)

**Responsabilidades:**
- Solicitar permisos
- Suscribirse a push
- Enviar suscripción al backend

```javascript
async function suscribirseAPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
  });
  
  await fetch('/api/suscripciones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription)
  });
}
```

### 2. Backend Components

#### 2.1 Servidor Express (server.js)

**Responsabilidades:**
- Inicializar servidor HTTP
- Configurar middlewares (CORS, body-parser)
- Montar rutas
- Conectar a base de datos
- Manejo de errores global

**Estructura:**
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rutas
app.use('/api/recursos', recursosRoutes);
app.use('/api/suscripciones', suscripcionesRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
```

#### 2.2 Rutas de Recursos (routes/recursos.js)

**Endpoints:**

| Método | Ruta | Descripción | Request Body | Response |
|--------|------|-------------|--------------|----------|
| GET | /api/recursos | Obtener todos los recursos | - | Array de recursos |
| GET | /api/recursos/:id | Obtener un recurso | - | Objeto recurso |
| POST | /api/recursos | Crear recurso | { titulo, descripcion, categoria, url } | Recurso creado |
| PUT | /api/recursos/:id | Actualizar recurso | { titulo, descripcion, categoria, url } | Recurso actualizado |
| DELETE | /api/recursos/:id | Eliminar recurso | - | { message: 'Eliminado' } |

**Validaciones:**
- titulo: string, requerido, max 200 caracteres
- descripcion: string, requerido, max 1000 caracteres
- categoria: enum ['Docker', 'Kubernetes', 'Docker Compose'], requerido
- url: string, formato URL válido, requerido

#### 2.3 Rutas de Suscripciones (routes/suscripciones.js)

**Endpoints:**

| Método | Ruta | Descripción | Request Body | Response |
|--------|------|-------------|--------------|----------|
| POST | /api/suscripciones | Registrar suscripción | Objeto subscription | { success: true } |
| POST | /api/notificar | Enviar notificación a todos | { title, body, url } | { enviadas: N } |

#### 2.4 Servicio de Base de Datos (db/connection.js)

**Responsabilidades:**
- Crear pool de conexiones MySQL
- Exportar funciones de consulta
- Manejo de errores de conexión

```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pwa_contenedores',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
```

#### 2.5 Servicio de Notificaciones Push (services/pushService.js)

**Responsabilidades:**
- Configurar web-push con claves VAPID
- Enviar notificaciones a suscripciones
- Limpiar suscripciones inválidas

```javascript
const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:tu-email@ejemplo.com',
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
);

async function enviarNotificacion(subscription, payload) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (error) {
    if (error.statusCode === 410) {
      // Suscripción expirada, eliminar de BD
      await eliminarSuscripcion(subscription.endpoint);
    }
    throw error;
  }
}
```

## Data Models

### Tabla: recursos

```sql
CREATE TABLE recursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT NOT NULL,
  categoria ENUM('Docker', 'Kubernetes', 'Docker Compose') NOT NULL,
  url VARCHAR(500) NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_categoria (categoria)
);
```

### Tabla: suscripciones

```sql
CREATE TABLE suscripciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  endpoint VARCHAR(500) NOT NULL UNIQUE,
  p256dh VARCHAR(200) NOT NULL,
  auth VARCHAR(200) NOT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Modelo de Datos en JavaScript

```javascript
// Recurso
{
  id: number,
  titulo: string,
  descripcion: string,
  categoria: 'Docker' | 'Kubernetes' | 'Docker Compose',
  url: string,
  fecha_creacion: Date
}

// Suscripción
{
  id: number,
  endpoint: string,
  p256dh: string,
  auth: string,
  fecha_registro: Date
}
```

## Error Handling

### Frontend

**Estrategia:**
- Try-catch en todas las llamadas fetch
- Mostrar mensajes de error al usuario mediante alertas o elementos DOM
- Fallback a caché cuando el backend no esté disponible

```javascript
async function obtenerRecursos() {
  try {
    const response = await fetch('/api/recursos');
    if (!response.ok) throw new Error('Error al obtener recursos');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    mostrarError('No se pudieron cargar los recursos. Intenta más tarde.');
    return [];
  }
}
```

### Backend

**Códigos de Estado HTTP:**
- 200: Operación exitosa
- 201: Recurso creado
- 400: Datos inválidos
- 404: Recurso no encontrado
- 500: Error interno del servidor

**Middleware de Errores:**
```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({ error: 'Recurso duplicado' });
  }
  
  res.status(500).json({ error: 'Error interno del servidor' });
});
```

### Base de Datos

**Manejo de Errores:**
- Reintentos automáticos en conexión
- Logging de errores SQL
- Transacciones para operaciones críticas

## Testing Strategy

### Frontend Testing

**Pruebas Manuales:**
1. Verificar que el formulario CRUD funcione correctamente
2. Probar permisos de notificaciones en diferentes navegadores
3. Validar que las notificaciones se muestren correctamente
4. Verificar funcionamiento offline

**Pruebas de Integración:**
- Probar flujo completo: crear recurso → recibir notificación
- Verificar que el Service Worker maneje correctamente los eventos push

### Backend Testing

**Pruebas de Endpoints:**
```javascript
// Ejemplo con herramientas como Postman o curl
// GET /api/recursos
curl http://localhost:3000/api/recursos

// POST /api/recursos
curl -X POST http://localhost:3000/api/recursos \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Test","descripcion":"Desc","categoria":"Docker","url":"http://test.com"}'
```

**Pruebas de Base de Datos:**
- Verificar que las tablas se creen correctamente
- Probar consultas SQL directamente
- Validar integridad referencial

### Testing de Notificaciones Push

**Pasos:**
1. Generar claves VAPID
2. Suscribirse desde el frontend
3. Enviar notificación de prueba desde backend
4. Verificar recepción en navegador

## Configuración y Variables de Entorno

**Archivo .env (backend):**
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=pwa_contenedores
PUBLIC_VAPID_KEY=tu_clave_publica
PRIVATE_VAPID_KEY=tu_clave_privada
```

**Generación de Claves VAPID:**
```bash
npx web-push generate-vapid-keys
```

## Estructura de Directorios

```
proyecto/
├── frontend/
│   ├── index.html
│   ├── main.js
│   ├── notifications.js (nuevo)
│   ├── admin.js (nuevo)
│   ├── sw.js (modificado)
│   ├── styles.css
│   ├── manifest.json
│   └── img/
├── backend/
│   ├── server.js
│   ├── .env
│   ├── package.json
│   ├── routes/
│   │   ├── recursos.js
│   │   └── suscripciones.js
│   ├── services/
│   │   └── pushService.js
│   └── db/
│       ├── connection.js
│       └── schema.sql
└── README.md
```

## Consideraciones de Seguridad

1. **Validación de Datos:** Validar todos los inputs en backend
2. **SQL Injection:** Usar consultas parametrizadas
3. **CORS:** Configurar orígenes permitidos
4. **HTTPS:** Requerido para Service Workers y Push API en producción
5. **Variables de Entorno:** No commitear claves en repositorio
6. **Rate Limiting:** Implementar límites de peticiones (opcional)

## Decisiones de Diseño

1. **MySQL vs MongoDB:** Se eligió MySQL por la estructura relacional clara de los datos
2. **Monolito vs Microservicios:** Monolito por simplicidad y tamaño del proyecto
3. **REST vs GraphQL:** REST por familiaridad y simplicidad
4. **Sección separada vs modal:** Nueva sección HTML para mejor organización
5. **Notificaciones automáticas:** Se envían al crear recursos para mantener usuarios informados
