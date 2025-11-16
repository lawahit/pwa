# Guía de Migración a Supabase y PostgreSQL

Esta guía te ayudará a migrar tu aplicación de MySQL local a Supabase (PostgreSQL en la nube).

## 📋 Resumen de Cambios

### Dependencias
- ❌ Removido: `mysql2`
- ✅ Agregado: `pg` (node-postgres)
- ✅ Agregado: `@supabase/supabase-js`

### Base de Datos
- **Antes**: MySQL local
- **Ahora**: PostgreSQL en Supabase

### Principales Diferencias SQL

| Característica | MySQL | PostgreSQL |
|---------------|-------|------------|
| Auto-incremento | `AUTO_INCREMENT` | `SERIAL` |
| Placeholders | `?` | `$1, $2, $3...` |
| Resultado de query | `[rows, fields]` | `{ rows, fields }` |
| INSERT con retorno | Requiere SELECT adicional | `RETURNING *` |
| UPSERT | `ON DUPLICATE KEY UPDATE` | `ON CONFLICT ... DO UPDATE` |
| ENUM | Inline en CREATE TABLE | Tipo separado |
| Conteo de filas afectadas | `result.affectedRows` | `result.rowCount` |
| ID insertado | `result.insertId` | `result.rows[0].id` con RETURNING |

## 🚀 Pasos de Migración

### 1. Crear Cuenta y Proyecto en Supabase

1. Ve a https://supabase.com y crea una cuenta
2. Crea un nuevo proyecto:
   - Nombre del proyecto: `pwa-contenedores`
   - Database password: **Guarda esta contraseña de forma segura**
   - Región: Selecciona la más cercana a tus usuarios

### 2. Obtener Credenciales

Una vez creado el proyecto:

**API Credentials** (Settings > API):
- Project URL: `https://xxxxx.supabase.co`
- anon public key: `eyJhbGc...`
- service_role key: `eyJhbGc...` (¡Mantenla secreta!)

**Database Credentials** (Settings > Database):
- Host: `db.xxxxx.supabase.co`
- Port: `5432`
- Database name: `postgres`
- User: `postgres`
- Password: La que creaste al inicio

### 3. Actualizar Dependencias

```bash
cd backend
npm uninstall mysql2
npm install pg @supabase/supabase-js
```

### 4. Configurar Variables de Entorno

Actualiza `backend/.env`:

```env
# Server Configuration
PORT=3000

# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...

# PostgreSQL Database Configuration
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password_aqui
DB_NAME=postgres
DB_SSL=true

# VAPID Keys (mantén las existentes o genera nuevas)
PUBLIC_VAPID_KEY=tu_clave_publica
PRIVATE_VAPID_KEY=tu_clave_privada
VAPID_EMAIL=mailto:tu-email@ejemplo.com
```

### 5. Inicializar Base de Datos

**Opción A: Usando el script de inicialización**

```bash
cd backend
npm run init-db
```

**Opción B: Manualmente desde Supabase Dashboard**

1. Ve a **SQL Editor** en tu dashboard de Supabase
2. Copia el contenido de `backend/db/schema.sql`
3. Pégalo y ejecuta
4. Opcionalmente, inserta datos de ejemplo manualmente

### 6. Verificar Conexión

Inicia el servidor:

```bash
cd backend
npm start
```

Deberías ver:
```
✓ Conexión a PostgreSQL establecida correctamente
✓ Servidor Express iniciado en puerto 3000
```

### 7. Probar la API

```bash
# Listar recursos
curl http://localhost:3000/api/recursos

# Crear un recurso
curl -X POST http://localhost:3000/api/recursos \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Test Docker",
    "descripcion": "Recurso de prueba",
    "categoria": "Docker",
    "url": "https://example.com"
  }'
```

## 🔍 Verificación en Supabase Dashboard

1. Ve a **Table Editor** en tu dashboard
2. Deberías ver las tablas:
   - `recursos`
   - `suscripciones`
3. Verifica que los datos de ejemplo estén presentes

## 🎯 Ventajas de Supabase

✅ **Hosting gratuito** hasta 500MB de base de datos
✅ **Backups automáticos** diarios
✅ **SSL/TLS** incluido por defecto
✅ **Dashboard visual** para gestionar datos
✅ **API REST automática** (opcional)
✅ **Autenticación integrada** (para futuras mejoras)
✅ **Storage de archivos** (para futuras mejoras)
✅ **Realtime subscriptions** (para futuras mejoras)

## 🚨 Solución de Problemas

### Error: "password authentication failed"
- Verifica que la contraseña en `.env` sea correcta
- Asegúrate de no tener espacios extra en el archivo `.env`

### Error: "ECONNREFUSED"
- Verifica que el host sea correcto: `db.xxxxx.supabase.co`
- Asegúrate de tener conexión a internet
- Verifica que `DB_SSL=true` esté configurado

### Error: "relation does not exist"
- Ejecuta el script de inicialización: `npm run init-db`
- O ejecuta el schema manualmente desde el SQL Editor

### Error: "invalid input syntax for type"
- Verifica que los valores de categoría sean exactamente: `Docker`, `Kubernetes`, o `Docker Compose`
- PostgreSQL es case-sensitive en los ENUMs

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [PostgreSQL vs MySQL](https://supabase.com/docs/guides/database/postgres-vs-mysql)
- [Node-postgres (pg) Documentation](https://node-postgres.com/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

## 🔄 Rollback (Volver a MySQL)

Si necesitas volver a MySQL:

1. Restaura los archivos desde el commit anterior
2. Reinstala mysql2: `npm install mysql2`
3. Restaura el archivo `.env` original
4. Inicia MySQL localmente
5. Ejecuta el schema de MySQL

## 🎉 ¡Listo!

Tu aplicación ahora está usando Supabase y PostgreSQL. Puedes desplegar el backend en Netlify Functions o cualquier otro servicio de hosting.
