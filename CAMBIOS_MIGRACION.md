# 📋 Resumen de Cambios - Migración a PostgreSQL/Supabase

## Archivos Modificados

### 1. `backend/package.json`
**Cambios en dependencias:**
```diff
- "mysql2": "^3.15.3"
+ "pg": "^8.11.3"
+ "@supabase/supabase-js": "^2.39.0"
```

**Nuevo script:**
```json
"init-db": "node db/init.js"
```

### 2. `backend/db/connection.js`
**Antes (MySQL):**
```javascript
const mysql = require('mysql2/promise');
const pool = mysql.createPool({ ... });
```

**Ahora (PostgreSQL):**
```javascript
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const pool = new Pool({ ... });
const supabase = createClient(...);
```

### 3. `backend/db/schema.sql`
**Cambios principales:**
- `AUTO_INCREMENT` → `SERIAL`
- `ENUM('...')` → Tipo `categoria_tipo` separado
- Sintaxis PostgreSQL para `CREATE TYPE`
- `CREATE INDEX IF NOT EXISTS`

### 4. `backend/db/init.js`
**Cambios:**
- Usa `pg` en lugar de `mysql2`
- Sintaxis de queries PostgreSQL
- `result.rows` en lugar de `[rows]`
- Manejo de errores PostgreSQL (códigos diferentes)

### 5. `backend/routes/recursos.js`
**Cambios en queries:**
```diff
- const [rows] = await pool.query('SELECT * FROM recursos WHERE id = ?', [id]);
+ const result = await pool.query('SELECT * FROM recursos WHERE id = $1', [id]);
+ const rows = result.rows;
```

**INSERT con RETURNING:**
```diff
- const [result] = await pool.query('INSERT INTO recursos (...) VALUES (?, ?, ?, ?)', [...]);
- const [rows] = await pool.query('SELECT * FROM recursos WHERE id = ?', [result.insertId]);
+ const result = await pool.query('INSERT INTO recursos (...) VALUES ($1, $2, $3, $4) RETURNING *', [...]);
+ const nuevoRecurso = result.rows[0];
```

**Códigos de error PostgreSQL:**
```diff
- error.code === 'ER_DUP_ENTRY'
+ error.code === '23505'  // unique violation

- error.code === 'ER_NO_SUCH_TABLE'
+ error.code === '42P01'  // undefined table

- error.code === 'ER_BAD_NULL_ERROR'
+ error.code === '23502'  // not null violation
```

### 6. `backend/routes/suscripciones.js`
**UPSERT (ON DUPLICATE KEY):**
```diff
- ON DUPLICATE KEY UPDATE p256dh = VALUES(p256dh), auth = VALUES(auth)
+ ON CONFLICT (endpoint) DO UPDATE SET p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth
```

**Resultado:**
```diff
- id: result.insertId || result.affectedRows
+ id: result.rows[0].id
```

### 7. `backend/services/pushService.js`
**Acceso a resultados:**
```diff
- const [suscripciones] = await pool.query('SELECT ...');
- if (suscripciones.length === 0) { ... }
+ const result = await pool.query('SELECT ...');
+ if (result.rows.length === 0) { ... }
```

**Conteo de filas afectadas:**
```diff
- if (result.affectedRows > 0) { ... }
+ if (result.rowCount > 0) { ... }
```

### 8. `backend/.env`
**Nuevas variables:**
```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...

# PostgreSQL
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=...
DB_NAME=postgres
DB_SSL=true
```

### 9. `README.md`
**Actualizaciones:**
- Requisitos: MySQL → Supabase
- Instrucciones de configuración de Supabase
- Pasos para obtener credenciales
- Tecnologías: mysql2 → pg + @supabase/supabase-js

## Archivos Nuevos

### 1. `backend/.env.example`
Plantilla con todas las variables de entorno necesarias

### 2. `MIGRACION_SUPABASE.md`
Guía completa de migración con:
- Tabla de diferencias MySQL vs PostgreSQL
- Pasos detallados
- Solución de problemas
- Ventajas de Supabase

### 3. `CONFIGURACION_RAPIDA_SUPABASE.md`
Guía rápida paso a paso (10 minutos) para configurar Supabase

### 4. `CAMBIOS_MIGRACION.md`
Este archivo - resumen de todos los cambios

## Diferencias Clave MySQL vs PostgreSQL

| Aspecto | MySQL | PostgreSQL |
|---------|-------|------------|
| **Placeholders** | `?` | `$1, $2, $3...` |
| **Resultado** | `[rows, fields]` | `{ rows, fields, ... }` |
| **Auto-increment** | `AUTO_INCREMENT` | `SERIAL` |
| **INSERT + SELECT** | 2 queries | 1 query con `RETURNING *` |
| **UPSERT** | `ON DUPLICATE KEY UPDATE` | `ON CONFLICT ... DO UPDATE` |
| **Filas afectadas** | `result.affectedRows` | `result.rowCount` |
| **ID insertado** | `result.insertId` | `result.rows[0].id` |
| **ENUM** | Inline | Tipo separado |
| **Códigos error** | `ER_*` | Códigos numéricos |

## Comandos para Migrar

```bash
# 1. Instalar nuevas dependencias
cd backend
npm uninstall mysql2
npm install pg @supabase/supabase-js

# 2. Configurar .env con credenciales de Supabase

# 3. Inicializar base de datos
npm run init-db

# 4. Iniciar servidor
npm start
```

## Verificación

✅ Sin errores de sintaxis en todos los archivos
✅ Queries parametrizadas correctamente ($1, $2, etc.)
✅ Manejo de errores PostgreSQL
✅ RETURNING * para INSERT/UPDATE
✅ ON CONFLICT para UPSERT
✅ result.rows en lugar de [rows]
✅ result.rowCount en lugar de affectedRows

## Próximos Pasos

1. **Configurar Supabase** siguiendo `CONFIGURACION_RAPIDA_SUPABASE.md`
2. **Ejecutar `npm install`** para instalar las nuevas dependencias
3. **Actualizar `.env`** con las credenciales de Supabase
4. **Ejecutar `npm run init-db`** para crear las tablas
5. **Iniciar el servidor** con `npm start`
6. **Verificar** que todo funcione correctamente

## Compatibilidad

- ✅ Node.js 16+
- ✅ PostgreSQL 12+ (Supabase usa PostgreSQL 15)
- ✅ Todas las funcionalidades existentes mantienen su comportamiento
- ✅ API REST sin cambios (mismos endpoints)
- ✅ Frontend sin cambios necesarios
