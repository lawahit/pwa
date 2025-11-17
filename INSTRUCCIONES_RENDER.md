# 🚀 Instrucciones para Desplegar en Render

## Variables de Entorno que debes configurar en Render

Ve a tu Web Service en Render Dashboard → **Environment** y agrega estas variables:

### 1. Base de Datos (Ya las tienes)
```
DB_HOST=dpg-d4d5g7fdiees73cdaqtg-a.oregon-postgres.render.com
DB_PORT=5432
DB_USER=pwa_5x3k_user
DB_PASSWORD=U2jTYOG0HDl36r1sTmJuHF8Gui3ljIYD
DB_NAME=pwa_5x3k
DB_SSL=true
```

### 2. VAPID Keys (Ya las tienes)
```
PUBLIC_VAPID_KEY=BGXQ6RzQspcnuaRZphHbz9PU8dgK5ZpceuIBK-_TUmnCUDQl1NAIGvBLNr_fveZUlNVC_bkFVPz7FtiHNSESkYk
PRIVATE_VAPID_KEY=rRMbZviRk0KKAgED1OPAyVNyJq1KyIH1vJiZ9oLHp1U
VAPID_EMAIL=mailto:langelesmuthe@gmail.com
```

### 3. Node Environment
```
NODE_ENV=production
```

## Configuración del Web Service en Render

Si aún no has creado el Web Service, usa esta configuración:

```
Name: pwa-contenedores
Region: Oregon (US West)
Branch: main
Root Directory: (dejar vacío)
Runtime: Node
Build Command: npm install --prefix backend
Start Command: node backend/server.js
Plan: Free
```

## Pasos para Desplegar

### 1. Subir cambios a GitHub
```bash
git add .
git commit -m "Configurado para Render con variables correctas"
git push origin main
```

### 2. Verificar en Render
- Render detectará automáticamente el push
- Iniciará el build
- Espera 2-3 minutos

### 3. Inicializar la Base de Datos (Solo la primera vez)

Conéctate a tu base de datos y ejecuta el schema:

```bash
# Opción 1: Desde tu máquina (si tienes psql instalado)
psql postgres://pwa_5x3k_user:U2jTYOG0HDl36r1sTmJuHF8Gui3ljIYD@dpg-d4d5g7fdiees73cdaqtg-a.oregon-postgres.render.com/pwa_5x3k
```

Luego ejecuta:
```sql
-- Copiar y pegar el contenido de backend/db/schema.sql
```

O usa el script de inicialización desde Render Shell:
1. Ve a tu Web Service en Render
2. Clic en **Shell** (en el menú superior)
3. Ejecuta: `npm run init-db`

### 4. Verificar que funciona

Abre tu URL de Render (ejemplo: https://pwa-contenedores.onrender.com)

Deberías ver:
- ✅ La página principal carga
- ✅ Los recursos se muestran en la sección "Recursos Educativos"
- ✅ Puedes crear, editar y eliminar recursos

## 🐛 Si algo no funciona

### Ver los logs
1. Ve a tu Web Service en Render
2. Clic en **Logs**
3. Busca errores en rojo

### Errores comunes

**"Cannot connect to database"**
- Verifica que todas las variables DB_* estén correctas
- Asegúrate que DB_SSL=true (sin comillas)

**"Relation 'recursos' does not exist"**
- Necesitas ejecutar el schema.sql en la base de datos
- Usa el paso 3 de arriba

**"Failed to fetch"**
- El servidor no está corriendo
- Revisa los logs para ver el error específico

## 📝 Notas Importantes

1. **No subas el archivo .env a GitHub** - Ya está en .gitignore
2. **Las variables de entorno se configuran en Render Dashboard** - No en el código
3. **El plan gratuito se "duerme" después de 15 minutos** - La primera petición tardará ~30 segundos
4. **La base de datos gratuita expira en 90 días** - Puedes renovarla gratis desde el dashboard

## ✅ Checklist Final

- [ ] Variables de entorno configuradas en Render
- [ ] Código subido a GitHub
- [ ] Build exitoso en Render
- [ ] Schema ejecutado en la base de datos
- [ ] Aplicación funciona en la URL de Render
- [ ] Puedes crear y ver recursos
