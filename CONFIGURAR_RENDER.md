# 🚀 Guía Completa de Despliegue en Render

## Requisitos

- Cuenta en [Render](https://render.com) (gratis)
- Repositorio en GitHub
- 15 minutos

## Paso 1: Crear Base de Datos PostgreSQL (5 min)

### 1.1 Crear la Base de Datos

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Clic en **New +** → **PostgreSQL**
3. Configuración:
   ```
   Name: pwa-contenedores-db
   Database: pwa_contenedores
   User: (se genera automáticamente)
   Region: Oregon (US West)
   PostgreSQL Version: 16
   Plan: Free
   ```
4. Clic en **Create Database**
5. Espera 2-3 minutos mientras se crea

### 1.2 Guardar Credenciales

Una vez creada, verás dos URLs de conexión:

- **Internal Database URL**: Para conectar desde tu Web Service en Render
  ```
  postgres://usuario:password@dpg-xxxxx/pwa_contenedores
  ```

- **External Database URL**: Para conectar desde tu máquina local
  ```
  postgres://usuario:password@dpg-xxxxx.oregon-postgres.render.com/pwa_contenedores
  ```

**Guarda ambas URLs**, las necesitarás después.

### 1.3 Inicializar el Schema

Tienes dos opciones:

**Opción A: Desde tu máquina local (recomendado)**

```bash
# Instalar PostgreSQL client si no lo tienes
# Windows (con Chocolatey):
choco install postgresql

# macOS (con Homebrew):
brew install postgresql

# Linux (Ubuntu/Debian):
sudo apt-get install postgresql-client

# Conectar usando la External Database URL
psql postgres://usuario:password@dpg-xxxxx.oregon-postgres.render.com/pwa_contenedores

# Ejecutar el schema
\i backend/db/schema.sql

# Verificar que se crearon las tablas
\dt

# Salir
\q
```

**Opción B: Desde Render Dashboard**

1. Ve a tu base de datos en Render Dashboard
2. Clic en **Connect** → **External Connection**
3. Usa cualquier cliente SQL (DBeaver, pgAdmin, etc.)
4. Copia y pega el contenido de `backend/db/schema.sql`
5. Ejecuta el script

## Paso 2: Subir Código a GitHub (2 min)

```bash
# Asegúrate de estar en la raíz del proyecto
git add .
git commit -m "Configurado para Render"
git push origin main
```

## Paso 3: Crear Web Service (3 min)

### 3.1 Crear el Servicio

1. En Render Dashboard, clic en **New +** → **Web Service**
2. Clic en **Connect a repository**
3. Autoriza Render en GitHub (si es la primera vez)
4. Selecciona tu repositorio

### 3.2 Configurar el Servicio

```
Name: pwa-contenedores
Region: Oregon (US West)
Branch: main
Root Directory: (dejar vacío)
Runtime: Node
Build Command: cd backend && npm install
Start Command: cd backend && node server.js
Plan: Free
```

**NO hagas clic en "Create Web Service" todavía**. Primero configura las variables de entorno.

## Paso 4: Configurar Variables de Entorno (3 min)

En la sección **Environment**, agrega estas variables:

### 4.1 Variables de Base de Datos

Usa la **Internal Database URL** que guardaste antes. Desglósala en partes:

```
Internal URL: postgres://usuario:password@dpg-xxxxx/pwa_contenedores
                       ↓        ↓         ↓           ↓
                    DB_USER  DB_PASSWORD DB_HOST   DB_NAME
```

Agrega cada variable:

```bash
DB_HOST=dpg-xxxxx
DB_PORT=5432
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=pwa_contenedores
DB_SSL=true
```

### 4.2 Variables de VAPID (Notificaciones Push)

Genera las claves VAPID:

```bash
# Desde tu máquina local
cd backend
npx web-push generate-vapid-keys
```

Esto generará algo como:

```
Public Key: BKxT6QMQmcNuqz6Yuh4FnwkUJcx4Qdt_ZiWm94hSXXHZNjcXALagmZ50mdJUpyPXcETQD_xnO-5lP_wUFsU6vhg
Private Key: 44QntEs3rBlKKZ2UXqxtrM1NbXzAJ77RH8wLZzCh-Ec
```

Agrega las variables:

```bash
PUBLIC_VAPID_KEY=tu_clave_publica
PRIVATE_VAPID_KEY=tu_clave_privada
VAPID_EMAIL=mailto:tu-email@ejemplo.com
```

### 4.3 Variables de Node

```bash
NODE_ENV=production
```

## Paso 5: Desplegar (2 min)

1. Clic en **Create Web Service**
2. Render automáticamente:
   - Clonará tu repositorio
   - Ejecutará `cd backend && npm install`
   - Iniciará el servidor con `cd backend && node server.js`
3. Espera 2-3 minutos
4. Tu app estará en: `https://tu-app.onrender.com`

## Paso 6: Verificar (2 min)

### 6.1 Verificar la Aplicación

1. Abre `https://tu-app.onrender.com`
2. Deberías ver la página principal
3. Verifica que no hay errores en la consola (F12)

### 6.2 Verificar la API

```bash
# Listar recursos
curl https://tu-app.onrender.com/api/recursos

# Debería devolver un array JSON (vacío o con datos)
```

### 6.3 Verificar la Base de Datos

1. Crea un recurso desde el panel de administración
2. Verifica que se guardó:
   ```bash
   # Conectar a la base de datos
   psql postgres://usuario:password@dpg-xxxxx.oregon-postgres.render.com/pwa_contenedores
   
   # Ver recursos
   SELECT * FROM recursos;
   
   # Salir
   \q
   ```

## 🐛 Solución de Problemas

### Error: "Build failed"

**Causa**: Error al instalar dependencias.

**Solución**:
1. Ve a **Logs** en Render Dashboard
2. Busca el error específico
3. Verifica que `backend/package-lock.json` existe en tu repositorio
4. Intenta: **Manual Deploy** → **Clear build cache & deploy**

### Error: "Application failed to respond"

**Causa**: El servidor no inicia correctamente.

**Solución**:
1. Ve a **Logs** en Render Dashboard
2. Busca errores en rojo
3. Errores comunes:
   - `Cannot find module`: Falta una dependencia
   - `ECONNREFUSED`: No puede conectar a la base de datos
   - `Port already in use`: No debería pasar en Render

### Error: "Cannot connect to database"

**Causa**: Variables de entorno incorrectas.

**Solución**:
1. Ve a **Environment** en Render Dashboard
2. Verifica cada variable:
   - `DB_HOST` debe ser solo el host (sin `postgres://`)
   - `DB_PORT` debe ser `5432`
   - `DB_USER` debe coincidir con la Internal URL
   - `DB_PASSWORD` debe coincidir con la Internal URL
   - `DB_NAME` debe ser `pwa_contenedores`
   - `DB_SSL` debe ser `true` (sin comillas)
3. Después de cambiar variables: **Manual Deploy** → **Deploy latest commit**

### Error: "relation 'recursos' does not exist"

**Causa**: No se ejecutó el schema de la base de datos.

**Solución**:
1. Conecta a la base de datos:
   ```bash
   psql postgres://usuario:password@dpg-xxxxx.oregon-postgres.render.com/pwa_contenedores
   ```
2. Ejecuta el schema:
   ```sql
   \i backend/db/schema.sql
   ```
3. Verifica:
   ```sql
   \dt
   ```

### La app se "duerme" después de inactividad

**Causa**: Es normal en el plan gratuito de Render.

**Comportamiento**:
- El servicio se "duerme" después de 15 minutos de inactividad
- La primera petición tarda ~30 segundos en "despertar"
- Las siguientes peticiones son normales

**Solución**:
- Para desarrollo: Es aceptable
- Para producción: Considera el plan pagado ($7/mes)

## 📊 Monitoreo

### Ver Logs en Tiempo Real

1. Ve a tu Web Service en Render Dashboard
2. Clic en **Logs**
3. Verás cada petición y error en tiempo real

### Ver Métricas

1. Ve a tu Web Service en Render Dashboard
2. Clic en **Metrics**
3. Verás:
   - Uso de CPU
   - Uso de memoria
   - Ancho de banda
   - Tiempo de respuesta

### Ver Estado de la Base de Datos

1. Ve a tu PostgreSQL en Render Dashboard
2. Clic en **Metrics**
3. Verás:
   - Conexiones activas
   - Uso de disco
   - Queries por segundo

## 🔄 Auto-Deploy

Render automáticamente redespliega cuando haces push a `main`:

```bash
# Hacer cambios
git add .
git commit -m "Actualización"
git push origin main

# Render detecta el push y redespliega automáticamente
```

Para desactivar auto-deploy:
1. Ve a **Settings** en tu Web Service
2. Desactiva **Auto-Deploy**

## 🌐 Dominio Personalizado (Opcional)

1. Ve a **Settings** → **Custom Domain**
2. Clic en **Add Custom Domain**
3. Ingresa tu dominio: `tuapp.com`
4. Configura los DNS según las instrucciones
5. Espera a que se verifique (puede tardar hasta 24 horas)
6. Render automáticamente configura HTTPS

## 💰 Límites del Plan Gratuito

- ✅ 750 horas/mes de tiempo de ejecución
- ✅ 100 GB de ancho de banda/mes
- ✅ 1 GB de RAM
- ✅ 0.5 CPU
- ⚠️ Se "duerme" después de 15 minutos de inactividad
- ⚠️ Base de datos expira después de 90 días (se puede renovar gratis)

## 🎉 ¡Listo!

Tu aplicación está desplegada en: `https://tu-app.onrender.com`

**Próximos pasos**:
- Comparte la URL con usuarios
- Monitorea los logs
- Considera el plan pagado si necesitas disponibilidad 24/7
