# 🛠️ Comandos Útiles - Supabase y PostgreSQL

## 📦 Instalación y Configuración

```bash
# Instalar dependencias
cd backend
npm install

# Inicializar base de datos
npm run init-db

# Iniciar servidor
npm start

# Modo desarrollo (si lo configuras)
npm run dev
```

## 🔍 Verificación de Conexión

### Probar conexión a Supabase
```bash
# Desde la carpeta backend
node -e "const {pool} = require('./db/connection'); pool.query('SELECT NOW()').then(r => console.log('✓ Conectado:', r.rows[0])).catch(e => console.error('✗ Error:', e.message)).finally(() => process.exit())"
```

### Ver versión de PostgreSQL
```bash
node -e "const {pool} = require('./db/connection'); pool.query('SELECT version()').then(r => console.log(r.rows[0].version)).finally(() => process.exit())"
```

## 📊 Consultas Útiles

### Contar recursos
```bash
node -e "const {pool} = require('./db/connection'); pool.query('SELECT COUNT(*) FROM recursos').then(r => console.log('Recursos:', r.rows[0].count)).finally(() => process.exit())"
```

### Contar suscripciones
```bash
node -e "const {pool} = require('./db/connection'); pool.query('SELECT COUNT(*) FROM suscripciones').then(r => console.log('Suscripciones:', r.rows[0].count)).finally(() => process.exit())"
```

### Listar todos los recursos
```bash
node -e "const {pool} = require('./db/connection'); pool.query('SELECT id, titulo, categoria FROM recursos').then(r => console.table(r.rows)).finally(() => process.exit())"
```

## 🧹 Limpieza de Datos

### Eliminar todos los recursos (¡CUIDADO!)
```bash
node -e "const {pool} = require('./db/connection'); pool.query('DELETE FROM recursos').then(r => console.log('Eliminados:', r.rowCount)).finally(() => process.exit())"
```

### Eliminar todas las suscripciones
```bash
node -e "const {pool} = require('./db/connection'); pool.query('DELETE FROM suscripciones').then(r => console.log('Eliminadas:', r.rowCount)).finally(() => process.exit())"
```

### Reiniciar secuencias (IDs)
```bash
node -e "const {pool} = require('./db/connection'); pool.query('ALTER SEQUENCE recursos_id_seq RESTART WITH 1; ALTER SEQUENCE suscripciones_id_seq RESTART WITH 1;').then(() => console.log('✓ Secuencias reiniciadas')).finally(() => process.exit())"
```

## 🔄 Reinicialización Completa

### Eliminar y recrear todo
```bash
# Desde la carpeta backend
node -e "const {pool} = require('./db/connection'); const fs = require('fs'); const schema = fs.readFileSync('./db/schema.sql', 'utf8'); pool.query('DROP TABLE IF EXISTS recursos, suscripciones CASCADE; DROP TYPE IF EXISTS categoria_tipo CASCADE;').then(() => pool.query(schema)).then(() => console.log('✓ Base de datos reinicializada')).finally(() => process.exit())"

# Luego reinsertar datos de ejemplo
npm run init-db
```

## 🧪 Pruebas de API

### Listar recursos
```bash
curl http://localhost:3000/api/recursos
```

### Obtener un recurso específico
```bash
curl http://localhost:3000/api/recursos/1
```

### Crear un recurso
```bash
curl -X POST http://localhost:3000/api/recursos \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Test Docker",
    "descripcion": "Recurso de prueba",
    "categoria": "Docker",
    "url": "https://example.com"
  }'
```

### Actualizar un recurso
```bash
curl -X PUT http://localhost:3000/api/recursos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Docker Actualizado",
    "descripcion": "Descripción actualizada",
    "categoria": "Docker",
    "url": "https://example.com/updated"
  }'
```

### Eliminar un recurso
```bash
curl -X DELETE http://localhost:3000/api/recursos/1
```

### Registrar suscripción push (ejemplo)
```bash
curl -X POST http://localhost:3000/api/suscripciones \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://fcm.googleapis.com/fcm/send/example",
    "keys": {
      "p256dh": "example_p256dh_key",
      "auth": "example_auth_key"
    }
  }'
```

### Enviar notificación manual
```bash
curl -X POST http://localhost:3000/api/suscripciones/notificar \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Prueba de Notificación",
    "body": "Este es un mensaje de prueba",
    "url": "/"
  }'
```

## 🔐 Generar Nuevas Claves VAPID

```bash
cd backend
npx web-push generate-vapid-keys
```

Luego actualiza las claves en:
1. `backend/.env` (PUBLIC_VAPID_KEY y PRIVATE_VAPID_KEY)
2. `notifications.js` (PUBLIC_VAPID_KEY)

## 📝 Logs y Debugging

### Ver logs del servidor en tiempo real
```bash
npm start | tee server.log
```

### Ver solo errores
```bash
npm start 2>&1 | grep -i error
```

### Modo verbose (si lo configuras)
```bash
DEBUG=* npm start
```

## 🗄️ Backup y Restore

### Backup de datos (desde Supabase Dashboard)
1. Ve a Database > Backups
2. Clic en "Create backup"
3. Espera a que se complete

### Export de datos a JSON
```bash
node -e "const {pool} = require('./db/connection'); pool.query('SELECT * FROM recursos').then(r => require('fs').writeFileSync('backup-recursos.json', JSON.stringify(r.rows, null, 2))).then(() => console.log('✓ Backup creado: backup-recursos.json')).finally(() => process.exit())"
```

### Import de datos desde JSON
```bash
node -e "const {pool} = require('./db/connection'); const data = require('./backup-recursos.json'); Promise.all(data.map(r => pool.query('INSERT INTO recursos (titulo, descripcion, categoria, url) VALUES ($1, $2, $3, $4)', [r.titulo, r.descripcion, r.categoria, r.url]))).then(() => console.log('✓ Datos importados')).finally(() => process.exit())"
```

## 🔍 Inspección de Base de Datos

### Ver estructura de tabla recursos
```bash
node -e "const {pool} = require('./db/connection'); pool.query(\"SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'recursos'\").then(r => console.table(r.rows)).finally(() => process.exit())"
```

### Ver índices
```bash
node -e "const {pool} = require('./db/connection'); pool.query(\"SELECT indexname, indexdef FROM pg_indexes WHERE tablename IN ('recursos', 'suscripciones')\").then(r => console.table(r.rows)).finally(() => process.exit())"
```

### Ver tamaño de las tablas
```bash
node -e "const {pool} = require('./db/connection'); pool.query(\"SELECT tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size FROM pg_tables WHERE schemaname = 'public'\").then(r => console.table(r.rows)).finally(() => process.exit())"
```

## 🚀 Despliegue

### Variables de entorno para producción
```bash
# Asegúrate de configurar estas variables en tu servicio de hosting
PORT=3000
NODE_ENV=production
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=...
DB_NAME=postgres
DB_SSL=true
PUBLIC_VAPID_KEY=...
PRIVATE_VAPID_KEY=...
VAPID_EMAIL=mailto:...
```

## 🆘 Troubleshooting

### Verificar variables de entorno
```bash
node -e "require('dotenv').config(); console.log('DB_HOST:', process.env.DB_HOST); console.log('DB_USER:', process.env.DB_USER); console.log('DB_NAME:', process.env.DB_NAME); console.log('DB_SSL:', process.env.DB_SSL);"
```

### Test de conexión completo
```bash
node -e "const {pool} = require('./db/connection'); async function test() { try { const client = await pool.connect(); console.log('✓ Conexión exitosa'); const res = await client.query('SELECT NOW(), version()'); console.log('Hora del servidor:', res.rows[0].now); console.log('Versión:', res.rows[0].version.split(' ')[0]); client.release(); } catch(e) { console.error('✗ Error:', e.message); } finally { await pool.end(); }} test();"
```

### Limpiar node_modules y reinstalar
```bash
rm -rf node_modules package-lock.json
npm install
```

---

**Tip**: Guarda este archivo para referencia rápida. Puedes copiar y pegar los comandos directamente en tu terminal.
