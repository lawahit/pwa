# 🚀 Configuración de Netlify - Guía Completa

## ✅ Archivos Creados

Ya tienes todo listo:
- ✅ `netlify.toml` - Configuración de Netlify
- ✅ `netlify/functions/recursos.js` - API de recursos
- ✅ `netlify/functions/suscripciones.js` - API de suscripciones
- ✅ `netlify/functions/package.json` - Dependencias de las funciones

## 📋 Pasos para Desplegar en Netlify

### 1. Subir Código a GitHub (2 minutos)

```bash
# Asegúrate de estar en la raíz del proyecto
git add .
git commit -m "Configurado para Netlify con funciones serverless"
git push origin main
```

### 2. Configurar en Netlify Dashboard (5 minutos)

1. **Ir a Netlify**: https://app.netlify.com
2. **Crear cuenta** o iniciar sesión
3. **Clic en "Add new site" > "Import an existing project"**
4. **Conectar con GitHub**:
   - Autoriza Netlify
   - Selecciona tu repositorio

5. **Configuración del sitio**:
   ```
   Branch to deploy: main
   Build command: cd netlify/functions && npm install
   Publish directory: .
   Functions directory: netlify/functions
   ```

6. **NO DESPLEGAR TODAVÍA** - Primero configura las variables de entorno

### 3. Configurar Variables de Entorno (3 minutos)

En Netlify Dashboard, ve a:
**Site settings > Environment variables > Add a variable**

Agrega TODAS estas variables (copia desde tu `backend/.env`):

```
SUPABASE_URL = https://xxxxx.supabase.co
SUPABASE_ANON_KEY = tu_clave_anon
SUPABASE_SERVICE_KEY = tu_clave_service
DB_HOST = db.xxxxx.supabase.co
DB_PORT = 5432
DB_USER = postgres
DB_PASSWORD = tu_password_supabase
DB_NAME = postgres
DB_SSL = true
PUBLIC_VAPID_KEY = BJyT6QMQmcNuqz6Yuh4FnwkUJcx4Qdt_ZiWm94hSXXHZNjcXALagmZ50mdJUpyPXcETQD_xnO-5lP_wUFsU6vhg
PRIVATE_VAPID_KEY = 44QntEs3rBlKKZ2UXqxtrM1NbXzAJ77RH8wLZzCh-Ec
VAPID_EMAIL = mailto:tu-email@ejemplo.com
```

**⚠️ IMPORTANTE**: Asegúrate de copiar EXACTAMENTE los valores de tu `.env`

### 4. Desplegar (2 minutos)

1. Vuelve a **Deploys**
2. Clic en **"Trigger deploy" > "Deploy site"**
3. Espera 2-3 minutos mientras Netlify:
   - Clona tu repositorio
   - Instala dependencias
   - Crea las funciones serverless
   - Despliega el sitio

### 5. Verificar el Despliegue (2 minutos)

1. **Abre la URL** que te dio Netlify (ejemplo: `https://tu-sitio.netlify.app`)
2. **Verifica que carga** la página principal
3. **Prueba crear un recurso**:
   - Ve a la sección de administración
   - Crea un nuevo recurso
   - Verifica que se guarde en Supabase

4. **Verifica en Supabase**:
   - Ve a tu dashboard de Supabase
   - Table Editor > recursos
   - Deberías ver el nuevo recurso

---

## 🔍 Verificar que Todo Funciona

### Prueba 1: Listar Recursos
```bash
curl https://tu-sitio.netlify.app/api/recursos
```

Deberías ver un array JSON con los recursos.

### Prueba 2: Crear Recurso
```bash
curl -X POST https://tu-sitio.netlify.app/api/recursos \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Test desde Netlify",
    "descripcion": "Probando la API",
    "categoria": "Docker",
    "url": "https://example.com"
  }'
```

Deberías recibir el recurso creado con su ID.

### Prueba 3: Verificar en Supabase
1. Ve a Supabase Dashboard
2. Table Editor > recursos
3. Deberías ver "Test desde Netlify"

---

## 🐛 Solución de Problemas

### Problema 1: "Function not found"

**Causa**: Las funciones no se desplegaron correctamente.

**Solución**:
1. Ve a **Functions** en Netlify Dashboard
2. Deberías ver `recursos` y `suscripciones`
3. Si no aparecen:
   - Verifica que `netlify/functions/` existe en tu repo
   - Verifica que `netlify.toml` está en la raíz
   - Redespliega: **Deploys > Trigger deploy > Clear cache and deploy**

### Problema 2: "Cannot connect to database"

**Causa**: Variables de entorno mal configuradas.

**Solución**:
1. Ve a **Site settings > Environment variables**
2. Verifica que TODAS las variables estén configuradas
3. Especialmente verifica:
   - `DB_HOST` = `db.xxxxx.supabase.co` (sin https://)
   - `DB_SSL` = `true` (exactamente así)
   - `DB_PASSWORD` = tu contraseña correcta
4. Después de cambiar variables: **Deploys > Trigger deploy**

### Problema 3: "No se guardan los datos"

**Causa**: Error en la conexión o en las queries.

**Solución**:
1. Ve a **Functions** en Netlify Dashboard
2. Clic en la función `recursos`
3. Ve a **Function log** (últimas ejecuciones)
4. Busca errores en rojo
5. Los errores comunes:
   - `password authentication failed` → Verifica `DB_PASSWORD`
   - `relation "recursos" does not exist` → Ejecuta `npm run init-db` localmente
   - `SSL required` → Verifica que `DB_SSL=true`

### Problema 4: "CORS error"

**Causa**: Las funciones ya tienen CORS configurado, pero puede haber caché.

**Solución**:
1. Limpia caché del navegador
2. Abre en modo incógnito
3. Si persiste, verifica que las funciones tengan los headers CORS (ya los tienen)

### Problema 5: "Build failed"

**Causa**: Error al instalar dependencias.

**Solución**:
1. Ve a **Deploys > [último deploy] > Deploy log**
2. Busca el error específico
3. Común: `npm install` falló
4. Verifica que `netlify/functions/package.json` existe
5. Redespliega con caché limpio

---

## 📊 Ver Logs en Tiempo Real

### Logs de Funciones:
1. Ve a **Functions** en Netlify Dashboard
2. Clic en `recursos` o `suscripciones`
3. Ve a **Function log**
4. Aquí verás cada llamada a la API y sus errores

### Logs de Build:
1. Ve a **Deploys**
2. Clic en el último deploy
3. Ve a **Deploy log**
4. Aquí verás el proceso de construcción

---

## ✅ Checklist de Verificación

Marca cada item cuando lo completes:

- [ ] Código subido a GitHub con las funciones de Netlify
- [ ] Sitio creado en Netlify
- [ ] Variables de entorno configuradas (TODAS)
- [ ] Despliegue completado sin errores
- [ ] Página principal carga correctamente
- [ ] Puedo ver la lista de recursos
- [ ] Puedo crear un nuevo recurso
- [ ] El recurso aparece en Supabase
- [ ] Puedo editar un recurso
- [ ] Puedo eliminar un recurso
- [ ] Las notificaciones push funcionan

---

## 🎯 Diferencias con el Backend Local

| Aspecto | Local (Express) | Netlify (Functions) |
|---------|----------------|---------------------|
| **Servidor** | Express corriendo 24/7 | Funciones serverless (se activan por petición) |
| **Rutas** | `/api/recursos` | `/.netlify/functions/recursos` (redirigido a `/api/recursos`) |
| **Escalabilidad** | Limitada | Automática |
| **Costo** | Requiere servidor | Gratis hasta 125k peticiones/mes |
| **Cold start** | No | Sí (~1-2 segundos primera vez) |

---

## 💰 Límites del Plan Gratuito de Netlify

- ✅ 100 GB de ancho de banda/mes
- ✅ 125,000 peticiones a funciones/mes
- ✅ 300 minutos de build/mes
- ✅ Suficiente para desarrollo y proyectos pequeños

---

## 🚀 Próximos Pasos

Una vez que todo funcione:

1. **Configura dominio personalizado** (opcional)
   - Site settings > Domain management
   - Add custom domain

2. **Habilita HTTPS** (automático en Netlify)
   - Ya está habilitado por defecto

3. **Configura notificaciones de deploy**
   - Site settings > Build & deploy > Deploy notifications

4. **Monitorea el uso**
   - Ve a **Analytics** para ver estadísticas

---

## 📝 Comandos Útiles

### Probar funciones localmente (opcional):
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Iniciar servidor local
netlify dev

# Esto iniciará tu sitio en http://localhost:8888
# Las funciones estarán en http://localhost:8888/api/recursos
```

### Desplegar desde CLI:
```bash
netlify deploy --prod
```

---

## 🎉 ¡Listo!

Si completaste todos los pasos, tu aplicación ahora está:
- ✅ Desplegada en Netlify
- ✅ Conectada a Supabase
- ✅ Funcionando con funciones serverless
- ✅ Accesible desde cualquier lugar
- ✅ Con HTTPS automático

**URL de tu app**: `https://tu-sitio.netlify.app`

¿Tienes algún error? Revisa la sección de "Solución de Problemas" arriba.
