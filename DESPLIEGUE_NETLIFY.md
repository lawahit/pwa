# 🚀 Guía de Despliegue en Netlify

## ⚠️ Importante: Limitaciones

Netlify está diseñado principalmente para sitios estáticos. Tu proyecto tiene un backend Express que necesita adaptación.

## 🎯 Opciones de Despliegue

### Opción 1: Netlify (Solo Frontend) + Backend Externo ⭐ RECOMENDADO

**Frontend en Netlify:**
- Archivos estáticos (HTML, CSS, JS)
- PWA con Service Worker
- Gratis y rápido

**Backend en otro servicio:**
- Render.com (Gratis)
- Railway.app (Gratis)
- Fly.io (Gratis)
- Heroku (De pago)

### Opción 2: Todo en Render.com ⭐ MÁS FÁCIL

Render puede alojar tanto frontend como backend juntos.

### Opción 3: Netlify Functions (Serverless)

Convertir el backend Express a funciones serverless (requiere más trabajo).

---

## 📋 Opción 1: Frontend en Netlify + Backend en Render

### Paso 1: Desplegar Backend en Render

1. **Crear cuenta en Render**: https://render.com
2. **Crear nuevo Web Service**:
   - Conecta tu repositorio de GitHub
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Environment: Node
   - Plan: Free

3. **Configurar Variables de Entorno** en Render:
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=tu_clave
   SUPABASE_SERVICE_KEY=tu_clave
   DB_HOST=db.xxxxx.supabase.co
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=tu_password
   DB_NAME=postgres
   DB_SSL=true
   PUBLIC_VAPID_KEY=tu_clave
   PRIVATE_VAPID_KEY=tu_clave
   VAPID_EMAIL=mailto:tu-email@ejemplo.com
   PORT=3000
   ```

4. **Copiar la URL** del backend (ejemplo: `https://tu-app.onrender.com`)

### Paso 2: Actualizar Frontend

Actualiza las URLs de la API en tus archivos JavaScript:

**En `main.js`, `admin.js`, `notifications.js`:**
```javascript
// Cambiar de:
const API_URL = 'http://localhost:3000/api';

// A:
const API_URL = 'https://tu-app.onrender.com/api';
```

### Paso 3: Desplegar Frontend en Netlify

1. **Crear cuenta en Netlify**: https://netlify.com
2. **Nuevo sitio desde Git**:
   - Conecta tu repositorio
   - Build command: (dejar vacío)
   - Publish directory: `.` (raíz del proyecto)
3. **Deploy**

---

## 📋 Opción 2: Todo en Render (MÁS FÁCIL)

### Paso 1: Preparar el Proyecto

Crear archivo `render.yaml` en la raíz:

```yaml
services:
  - type: web
    name: pwa-contenedores
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: SUPABASE_URL
        value: https://xxxxx.supabase.co
      - key: SUPABASE_ANON_KEY
        sync: false
      - key: SUPABASE_SERVICE_KEY
        sync: false
      - key: DB_HOST
        value: db.xxxxx.supabase.co
      - key: DB_PORT
        value: 5432
      - key: DB_USER
        value: postgres
      - key: DB_PASSWORD
        sync: false
      - key: DB_NAME
        value: postgres
      - key: DB_SSL
        value: true
      - key: PUBLIC_VAPID_KEY
        sync: false
      - key: PRIVATE_VAPID_KEY
        sync: false
      - key: VAPID_EMAIL
        value: mailto:tu-email@ejemplo.com
```

### Paso 2: Desplegar

1. Ve a https://render.com
2. Nuevo Web Service
3. Conecta tu repositorio
4. Render detectará automáticamente la configuración
5. Deploy

**Ventaja**: El backend ya sirve el frontend automáticamente.

---

## 📋 Opción 3: Netlify Functions (Avanzado)

Requiere convertir cada ruta Express a una función serverless.

**Estructura necesaria:**
```
netlify/
  functions/
    recursos.js
    suscripciones.js
```

**Ejemplo de función:**
```javascript
// netlify/functions/recursos.js
const { Pool } = require('pg');

exports.handler = async (event, context) => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  if (event.httpMethod === 'GET') {
    const result = await pool.query('SELECT * FROM recursos');
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows)
    };
  }
  
  // ... más lógica
};
```

---

## ✅ Recomendación Final

### Para Principiantes:
**Opción 2: Todo en Render** → Más fácil, todo en un lugar

### Para Mejor Performance:
**Opción 1: Netlify + Render** → Frontend rápido en Netlify, backend en Render

### Para Aprender Serverless:
**Opción 3: Netlify Functions** → Más complejo pero escalable

---

## 🔧 Configuración Adicional en Supabase

Antes de desplegar, verifica en Supabase:

### 1. Configurar CORS (si es necesario)

En Supabase Dashboard:
- Ve a **Settings > API**
- Verifica que tu dominio esté permitido

### 2. Row Level Security (RLS)

Si quieres seguridad adicional:
- Ve a **Authentication > Policies**
- Configura políticas de acceso

### 3. Verificar Conexiones

- Ve a **Settings > Database**
- Verifica que "Connection pooling" esté habilitado
- Usa "Transaction" mode para mejor rendimiento

---

## 📝 Checklist Pre-Despliegue

- [ ] Base de datos en Supabase funcionando
- [ ] Tablas creadas con datos de ejemplo
- [ ] Variables de entorno documentadas
- [ ] Decidido dónde desplegar backend
- [ ] URLs de API actualizadas en frontend
- [ ] Archivo `.gitignore` incluye `.env`
- [ ] Repositorio en GitHub actualizado

---

## 🆘 Problemas Comunes

### "Cannot connect to database"
- Verifica que `DB_SSL=true` en producción
- Verifica las credenciales de Supabase

### "CORS error"
- Configura CORS en el backend para permitir tu dominio de Netlify
- En `backend/server.js`, actualiza:
```javascript
app.use(cors({
  origin: ['https://tu-sitio.netlify.app', 'http://localhost:3000']
}));
```

### "Function timeout"
- Render Free tier tiene límite de 15 minutos de inactividad
- El servicio se "duerme" y tarda en despertar
- Considera usar un servicio de "keep-alive"

---

## 🎉 Próximos Pasos

1. **Decide qué opción usar** (recomiendo Opción 2: Render)
2. **Sigue la guía** de la opción elegida
3. **Configura variables de entorno**
4. **Despliega y prueba**

¿Necesitas ayuda con alguna opción específica?
