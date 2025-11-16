# PWA Contenedores - Backend con Notificaciones Push

## Descripción

Aplicación web progresiva (PWA) sobre contenedores Docker, Kubernetes y Docker Compose, con backend Node.js, base de datos MySQL y sistema de notificaciones push.

## Requisitos Previos

- Node.js v16 o superior
- Cuenta de Supabase (gratuita): https://supabase.com
- npm o yarn

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd pwa-contenedores
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 3. Configurar Supabase

**Paso 1: Crear proyecto en Supabase**

1. Ve a https://app.supabase.com
2. Crea una nueva cuenta o inicia sesión
3. Crea un nuevo proyecto:
   - **Organization**: Selecciona o crea una organización
   - **Project name**: `pwa-contenedores` (o el nombre que prefieras)
   - **Database password**: Crea una contraseña segura y guárdala
   - **Region**: Selecciona la región más cercana a tus usuarios

**Paso 2: Obtener credenciales de Supabase**

Una vez creado el proyecto, ve a **Settings > API** y copia:
- **Project URL** (ejemplo: `https://abcdefgh.supabase.co`)
- **anon/public key** (clave pública)
- **service_role key** (clave de servicio - mantenla secreta)

Ve a **Settings > Database** y copia:
- **Host** (ejemplo: `db.abcdefgh.supabase.co`)
- **Database password** (la que creaste al crear el proyecto)

**Paso 3: Configurar variables de entorno**

Actualiza el archivo `backend/.env` con tus credenciales de Supabase:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_clave_publica
SUPABASE_SERVICE_KEY=tu_clave_servicio

DB_HOST=db.tu-proyecto.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password_de_supabase
DB_NAME=postgres
DB_SSL=true
```

**Paso 4: Inicializar base de datos**

Ejecuta el script de inicialización para crear las tablas y datos de ejemplo:

```bash
cd backend
npm run init-db
```

Este script creará automáticamente las tablas y datos de ejemplo en tu base de datos Supabase.

**Alternativa: Usar el SQL Editor de Supabase**

También puedes ejecutar el schema manualmente:
1. Ve a **SQL Editor** en tu dashboard de Supabase
2. Copia el contenido de `backend/db/schema.sql`
3. Pégalo en el editor y ejecuta

### 4. Generar claves VAPID para notificaciones push

El archivo `backend/.env` ya contiene claves VAPID de ejemplo. Para producción, genera nuevas claves:

```bash
cd backend
npx web-push generate-vapid-keys
```

Este comando generará dos claves:
- **Public Key**: Se usa en el frontend (notifications.js)
- **Private Key**: Se usa en el backend (solo en .env)

Actualiza las siguientes variables en `backend/.env`:

```
PUBLIC_VAPID_KEY=<tu_clave_publica>
PRIVATE_VAPID_KEY=<tu_clave_privada>
VAPID_EMAIL=mailto:<tu-email@ejemplo.com>
```

También actualiza la clave pública en `notifications.js`:

```javascript
const PUBLIC_VAPID_KEY = '<tu_clave_publica>';
```

**Claves VAPID actuales (solo para desarrollo):**
- Public Key: `BJyT6QMQmcNuqz6Yuh4FnwkUJcx4Qdt_ZiWm94hSXXHZNjcXALagmZ50mdJUpyPXcETQD_xnO-5lP_wUFsU6vhg`
- Private Key: `44QntEs3rBlKKZ2UXqxtrM1NbXzAJ77RH8wLZzCh-Ec`

> **⚠️ Importante:** Estas claves son para desarrollo. En producción, genera nuevas claves y manténlas seguras. Nunca compartas la clave privada.

## Iniciar la Aplicación

### Opción 1: Backend con Frontend integrado (Recomendado)

El servidor Express sirve automáticamente los archivos del frontend:

```bash
cd backend
npm start
```

O en modo desarrollo:

```bash
cd backend
npm run dev
```

El servidor estará disponible en `http://localhost:3000`
- Frontend: `http://localhost:3000`
- API: `http://localhost:3000/api`

### Opción 2: Frontend independiente

Si prefieres ejecutar el frontend por separado:

```bash
# Terminal 1: Iniciar backend
cd backend
npm start

# Terminal 2: Servir frontend
npx http-server -p 8080
```

## API Endpoints

### Recursos

- `GET /api/recursos` - Obtener todos los recursos
- `GET /api/recursos/:id` - Obtener un recurso específico
- `POST /api/recursos` - Crear nuevo recurso
- `PUT /api/recursos/:id` - Actualizar recurso
- `DELETE /api/recursos/:id` - Eliminar recurso

### Notificaciones Push

- `POST /api/suscripciones` - Registrar suscripción push
- `POST /api/notificar` - Enviar notificación manual a todos los suscriptores

## Estructura del Proyecto

```
proyecto/
├── index.html              # Frontend principal
├── main.js                 # Lógica de UI
├── admin.js                # Gestión CRUD
├── notifications.js        # Gestión de notificaciones push
├── sw.js                   # Service Worker
├── styles.css              # Estilos
├── manifest.json           # Manifiesto PWA
├── img/                    # Imágenes y iconos
└── backend/
    ├── server.js           # Servidor Express
    ├── .env                # Variables de entorno
    ├── package.json        # Dependencias
    ├── routes/
    │   ├── recursos.js     # Rutas CRUD
    │   └── suscripciones.js # Rutas de notificaciones
    ├── services/
    │   └── pushService.js  # Servicio de notificaciones
    └── db/
        ├── connection.js   # Conexión MySQL
        └── schema.sql      # Esquema de base de datos
```

## Características

- ✅ CRUD completo de recursos educativos
- ✅ Notificaciones push automáticas al crear recursos
- ✅ Funcionamiento offline con Service Worker
- ✅ Diseño responsive
- ✅ Base de datos MySQL
- ✅ API REST con Express

## Tecnologías

**Frontend:**
- HTML5, CSS3, JavaScript ES6+
- Service Worker API
- Push API
- Fetch API

**Backend:**
- Node.js
- Express.js
- PostgreSQL (Supabase)
- @supabase/supabase-js
- pg (node-postgres)
- web-push
- cors
- dotenv

## Seguridad

- Consultas SQL parametrizadas para prevenir inyección SQL
- Validación de datos en backend
- CORS configurado
- Variables de entorno para datos sensibles
- HTTPS requerido en producción para Service Workers

## Licencia

ISC
