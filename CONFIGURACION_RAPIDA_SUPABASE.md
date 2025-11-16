# ⚡ Configuración Rápida de Supabase

## Paso 1: Crear Proyecto en Supabase (5 minutos)

1. **Ir a Supabase**: https://app.supabase.com
2. **Crear cuenta** o iniciar sesión
3. **Clic en "New Project"**
4. **Completar el formulario**:
   ```
   Organization: [Selecciona o crea una]
   Project name: pwa-contenedores
   Database Password: [CREA UNA CONTRASEÑA SEGURA Y GUÁRDALA]
   Region: South America (São Paulo) o la más cercana
   ```
5. **Clic en "Create new project"**
6. **Espera 2-3 minutos** mientras Supabase crea tu proyecto

## Paso 2: Copiar Credenciales (2 minutos)

### A. Credenciales de API

1. Ve a **Settings** (⚙️ en el menú izquierdo)
2. Clic en **API**
3. Copia estos valores:

```
Project URL: https://xxxxx.supabase.co
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### B. Credenciales de Base de Datos

1. Ve a **Settings** > **Database**
2. Busca la sección **Connection string**
3. Copia el **Host**:

```
Host: db.xxxxx.supabase.co
```

## Paso 3: Configurar .env (1 minuto)

Abre `backend/.env` y reemplaza estos valores:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co          # ← Pega tu Project URL
SUPABASE_ANON_KEY=eyJhbGc...                    # ← Pega tu anon public
SUPABASE_SERVICE_KEY=eyJhbGc...                 # ← Pega tu service_role

# PostgreSQL Database Configuration
DB_HOST=db.xxxxx.supabase.co                    # ← Pega tu Host
DB_PORT=5432                                     # ← Dejar como está
DB_USER=postgres                                 # ← Dejar como está
DB_PASSWORD=tu_password_aqui                     # ← Pega la contraseña que creaste
DB_NAME=postgres                                 # ← Dejar como está
DB_SSL=true                                      # ← Dejar como está
```

## Paso 4: Instalar Dependencias (1 minuto)

```bash
cd backend
npm install
```

## Paso 5: Inicializar Base de Datos (30 segundos)

```bash
npm run init-db
```

Deberías ver:
```
✅ Conexión establecida
✅ Tablas creadas correctamente
✅ Datos de ejemplo insertados
📊 Estado de la base de datos:
   - Recursos: 5
   - Suscripciones: 0
✨ ¡Inicialización completada exitosamente!
```

## Paso 6: Iniciar Servidor (10 segundos)

```bash
npm start
```

Deberías ver:
```
✓ Conexión a PostgreSQL establecida correctamente
✓ Servidor Express iniciado en puerto 3000
```

## Paso 7: Verificar en Supabase Dashboard (1 minuto)

1. Ve a **Table Editor** en tu dashboard de Supabase
2. Deberías ver 2 tablas:
   - **recursos** (con 5 registros de ejemplo)
   - **suscripciones** (vacía)

## ✅ ¡Listo!

Tu aplicación ahora está conectada a Supabase. Abre http://localhost:3000 en tu navegador.

---

## 🆘 ¿Problemas?

### "password authentication failed"
- Verifica que copiaste bien la contraseña en `DB_PASSWORD`
- Asegúrate de no tener espacios extra

### "ECONNREFUSED"
- Verifica que el `DB_HOST` sea correcto
- Asegúrate de tener `DB_SSL=true`

### "relation does not exist"
- Ejecuta de nuevo: `npm run init-db`

---

## 📝 Valores de Ejemplo

Si necesitas referencia, así se ve un `.env` configurado:

```env
SUPABASE_URL=https://abcdefghijk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODAwMDAwMDAsImV4cCI6MTk5NTU3NjAwMH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4MDAwMDAwMCwiZXhwIjoxOTk1NTc2MDAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

DB_HOST=db.abcdefghijk.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=MiPasswordSeguro123!
DB_NAME=postgres
DB_SSL=true
```

**Nota**: Los valores `xxxxx` y `abcdefghijk` serán únicos para tu proyecto.
