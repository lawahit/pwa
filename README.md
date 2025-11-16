# PWA Contenedores

Aplicación web progresiva (PWA) sobre contenedores Docker, Kubernetes y Docker Compose, con backend Node.js + Express, base de datos PostgreSQL y notificaciones push.

## 🚀 Despliegue en Render

### 1. Crear Base de Datos PostgreSQL en Render

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Clic en **New +** → **PostgreSQL**
3. Configuración:
   - **Name**: `pwa-contenedores-db`
   - **Database**: `pwa_contenedores`
   - **User**: (se genera automáticamente)
   - **Region**: Oregon (US West)
   - **Plan**: Free
4. Clic en **Create Database**
5. Espera 2-3 minutos a que se cree
6. Guarda las credenciales (las necesitarás después):
   - **Internal Database URL** (para conectar desde el Web Service)
   - **External Database URL** (para conectar desde tu máquina local)

### 2. Inicializar la Base de Datos

Desde tu máquina local, conecta a la base de datos y ejecuta el schema:

```bash
# Instalar psql si no lo tienes (Windows con Chocolatey)
choco install postgresql

# Conectar a la base de datos (usa la External Database URL)
psql postgres://usuario:password@host/database

# Ejecutar el schema
\i backend/db/schema.sql

# Salir
\q
```

O copia el contenido de `backend/db/schema.sql` y ejecútalo en el **SQL Editor** de Render Dashboard.

### 3. Crear Web Service en Render

1. En Render Dashboard, clic en **New +** → **Web Service**
2. Conecta tu repositorio de GitHub
3. Configuración:
   - **Name**: `pwa-contenedores`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: (dejar vacío)
   - **Runtime**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node server.js`
   - **Plan**: Free

### 4. Configurar Variables de Entorno

En la sección **Environment**, agrega estas variables:

```bash
# Database (usa la Internal Database URL de tu PostgreSQL)
DB_HOST=dpg-xxxxx.oregon-postgres.render.com
DB_PORT=5432
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=pwa_contenedores
DB_SSL=true

# VAPID Keys (genera con: npx web-push generate-vapid-keys)
PUBLIC_VAPID_KEY=tu_clave_publica
PRIVATE_VAPID_KEY=tu_clave_privada
VAPID_EMAIL=mailto:tu-email@ejemplo.com

# Node
NODE_ENV=production
```

### 5. Desplegar

1. Clic en **Create Web Service**
2. Espera 2-3 minutos
3. Tu app estará en: `https://tu-app.onrender.com`

## 💻 Desarrollo Local

### Instalación

```bash
# Instalar dependencias
cd backend
npm install

# Configurar variables de entorno
# Edita backend/.env con tus credenciales de Render Database

# Inicializar base de datos (si no lo hiciste antes)
npm run init-db

# Iniciar servidor
npm start
```

La aplicación estará en: http://localhost:3000

### Variables de Entorno Locales

Crea `backend/.env`:

```bash
PORT=3000

# Database (usa la External Database URL de Render)
DB_HOST=dpg-xxxxx.oregon-postgres.render.com
DB_PORT=5432
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=pwa_contenedores
DB_SSL=true

# VAPID Keys
PUBLIC_VAPID_KEY=tu_clave_publica
PRIVATE_VAPID_KEY=tu_clave_privada
VAPID_EMAIL=mailto:tu-email@ejemplo.com
```

## 📁 Estructura

```
pwa-contenedores/
├── index.html              # Frontend
├── main.js                 # Lógica principal
├── admin.js                # Panel admin
├── notifications.js        # Push notifications
├── sw.js                   # Service Worker
├── styles.css              # Estilos
├── manifest.json           # PWA manifest
├── render.yaml             # Config Render
├── package.json            # Scripts
└── backend/
    ├── server.js           # Servidor Express
    ├── routes/             # Rutas API
    ├── services/           # Servicios
    └── db/                 # Base de datos
        ├── connection.js   # Conexión PostgreSQL
        ├── init.js         # Script inicialización
        └── schema.sql      # Schema de la BD
```

## 🔧 API Endpoints

- `GET /api/recursos` - Listar recursos
- `GET /api/recursos/:id` - Obtener recurso
- `POST /api/recursos` - Crear recurso
- `PUT /api/recursos/:id` - Actualizar recurso
- `DELETE /api/recursos/:id` - Eliminar recurso
- `POST /api/suscripciones` - Registrar suscripción push
- `POST /api/notificar` - Enviar notificación

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (PWA)
- **Backend**: Node.js + Express
- **Base de datos**: PostgreSQL (Render)
- **Despliegue**: Render
- **Notificaciones**: Web Push API

## 📝 Licencia

ISC
