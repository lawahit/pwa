# 🔔 Cómo Probar las Notificaciones Push

## ¿Cómo funcionan las notificaciones en tu PWA?

Tu aplicación tiene un sistema completo de notificaciones push que funciona así:

1. **El usuario visita tu PWA** → Se le pide permiso para notificaciones
2. **Si acepta** → Se crea una suscripción y se guarda en la base de datos
3. **Cuando creas un nuevo recurso** → Se envía automáticamente una notificación a todos los usuarios suscritos
4. **El usuario recibe la notificación** → Puede hacer clic para abrir la PWA

## Paso 1: Suscribirse a las notificaciones

### En tu computadora (Chrome/Edge):

1. Abre tu PWA: https://pwa-1inp.onrender.com
2. Deberías ver un popup pidiendo permiso para notificaciones
3. Haz clic en **Permitir**
4. Abre la consola del navegador (F12) → pestaña **Console**
5. Deberías ver mensajes como:
   ```
   ✓ Permiso de notificaciones otorgado
   ✓ Suscripción creada
   ✓ Suscripción enviada al servidor
   ```

### Si no aparece el popup:

Ejecuta esto en la consola del navegador:

```javascript
inicializarNotificaciones()
```

### Verificar que te suscribiste:

1. Abre DevTools (F12)
2. Ve a **Application** → **Service Workers**
3. Deberías ver el Service Worker activo
4. Ve a **Application** → **Push Messaging**
5. Deberías ver tu suscripción

## Paso 2: Probar enviando una notificación

### Opción A: Crear un nuevo recurso (Automático)

1. Ve a la sección **Recursos Educativos** en tu PWA
2. Haz clic en **Nuevo Recurso**
3. Llena el formulario:
   ```
   Título: Prueba de Notificación
   Descripción: Esta es una prueba del sistema de notificaciones push
   Categoría: Docker
   URL: https://www.youtube.com/watch?v=ejemplo
   ```
4. Haz clic en **Guardar**
5. **¡Deberías recibir una notificación!** 🎉

### Opción B: Enviar notificación manual desde el servidor

Si tienes acceso al Shell de Render:

1. Ve a tu Web Service en Render Dashboard
2. Clic en **Shell**
3. Ejecuta:

```javascript
node -e "
const { enviarNotificacionATodos } = require('./backend/services/pushService');
const payload = {
  title: 'Prueba de Notificación',
  body: 'Esta es una notificación de prueba desde el servidor',
  url: 'https://pwa-1inp.onrender.com',
  icon: '/img/favicon-192.png',
  badge: '/img/favicon-96.png'
};
enviarNotificacionATodos(payload).then(result => {
  console.log('Resultado:', result);
  process.exit(0);
});
"
```

### Opción C: Crear un endpoint de prueba (Recomendado)

Voy a crear un endpoint especial para que puedas probar las notificaciones fácilmente.

## Paso 3: Verificar las suscripciones en la base de datos

Conéctate a tu base de datos:

```bash
psql postgres://pwa_5x3k_user:U2jTYOG0HDl36r1sTmJuHF8Gui3ljIYD@dpg-d4d5g7fdiees73cdaqtg-a.oregon-postgres.render.com/pwa_5x3k
```

Ver todas las suscripciones:

```sql
SELECT id, endpoint, fecha_registro FROM suscripciones;
```

Contar suscripciones:

```sql
SELECT COUNT(*) FROM suscripciones;
```

## 🐛 Solución de Problemas

### No aparece el popup de permisos

**Causa**: Ya denegaste los permisos antes.

**Solución**:
1. Haz clic en el **candado** o **ícono de información** en la barra de direcciones
2. Busca **Notificaciones**
3. Cambia a **Permitir**
4. Recarga la página
5. Ejecuta en la consola: `inicializarNotificaciones()`

### Error: "Push subscription has expired"

**Causa**: La suscripción expiró (normal después de cierto tiempo).

**Solución**:
1. Abre DevTools (F12)
2. Ve a **Application** → **Service Workers**
3. Haz clic en **Unregister**
4. Recarga la página
5. Acepta los permisos de nuevo

### No recibo notificaciones

**Checklist**:
- [ ] ¿Diste permiso para notificaciones?
- [ ] ¿El Service Worker está activo? (Application → Service Workers)
- [ ] ¿Hay suscripciones en la base de datos? (consulta SQL arriba)
- [ ] ¿Las variables VAPID están correctas en Render?
- [ ] ¿Estás en HTTPS? (Render usa HTTPS automáticamente)

### Las notificaciones no aparecen en el escritorio

**Windows**:
1. Ve a **Configuración** → **Sistema** → **Notificaciones**
2. Asegúrate que las notificaciones estén activadas
3. Busca tu navegador (Chrome/Edge) y activa las notificaciones

**Mac**:
1. Ve a **Preferencias del Sistema** → **Notificaciones**
2. Busca tu navegador
3. Activa las notificaciones

## 📱 Probar en móvil

### Android (Chrome):

1. Abre https://pwa-1inp.onrender.com en Chrome
2. Acepta el permiso de notificaciones
3. Crea un nuevo recurso desde otro dispositivo
4. Deberías recibir la notificación en tu móvil

### iOS (Safari):

⚠️ **Nota**: Safari en iOS tiene soporte limitado para notificaciones push en PWAs. Funciona mejor en iOS 16.4+

1. Abre https://pwa-1inp.onrender.com en Safari
2. Toca el botón **Compartir**
3. Selecciona **Agregar a pantalla de inicio**
4. Abre la PWA desde la pantalla de inicio
5. Acepta los permisos de notificaciones

## 🎯 Casos de Uso

### 1. Notificar cuando se agrega un nuevo recurso
✅ **Ya implementado** - Se envía automáticamente al crear un recurso

### 2. Notificar actualizaciones de la PWA
Puedes agregar esto en el Service Worker cuando detecte una nueva versión

### 3. Notificar recordatorios
Puedes crear un cron job que envíe notificaciones periódicas

## 📊 Monitorear notificaciones

Ver logs en Render:
1. Ve a tu Web Service
2. Clic en **Logs**
3. Busca mensajes como:
   ```
   ✓ Notificaciones enviadas: 5, Fallidas: 0
   ```

## 🔐 Seguridad

- ✅ Las claves VAPID están en variables de entorno (no en el código)
- ✅ Las suscripciones se almacenan de forma segura en PostgreSQL
- ✅ Las notificaciones solo se envían a usuarios que dieron permiso
- ✅ Las suscripciones expiradas se eliminan automáticamente

## 📝 Notas Importantes

1. **Las notificaciones solo funcionan en HTTPS** - Render usa HTTPS automáticamente ✅
2. **El usuario debe dar permiso explícito** - No puedes forzar las notificaciones
3. **Las notificaciones pueden no llegar si el navegador está cerrado** - Depende del sistema operativo
4. **En el plan gratuito de Render**, si el servidor se "duerme", las notificaciones no se enviarán hasta que se "despierte"
