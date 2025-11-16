# ✅ Checklist de Migración a Supabase

Usa este checklist para asegurarte de completar todos los pasos correctamente.

## 📝 Antes de Empezar

- [ ] Tengo Node.js v16 o superior instalado
- [ ] Tengo una cuenta de correo para crear cuenta en Supabase
- [ ] He guardado una copia de seguridad de mi proyecto actual

## 🎯 Configuración de Supabase

### Crear Proyecto
- [ ] Creé cuenta en https://app.supabase.com
- [ ] Creé un nuevo proyecto llamado `pwa-contenedores`
- [ ] Guardé la contraseña de la base de datos en un lugar seguro
- [ ] Esperé a que el proyecto termine de crearse (2-3 minutos)

### Obtener Credenciales
- [ ] Fui a Settings > API
- [ ] Copié el **Project URL**
- [ ] Copié la **anon public key**
- [ ] Copié la **service_role key**
- [ ] Fui a Settings > Database
- [ ] Copié el **Host** (db.xxxxx.supabase.co)

## 💻 Configuración Local

### Instalar Dependencias
- [ ] Abrí terminal en la carpeta del proyecto
- [ ] Ejecuté: `cd backend`
- [ ] Ejecuté: `npm install`
- [ ] No hubo errores en la instalación

### Configurar Variables de Entorno
- [ ] Abrí el archivo `backend/.env`
- [ ] Actualicé `SUPABASE_URL` con mi Project URL
- [ ] Actualicé `SUPABASE_ANON_KEY` con mi anon public key
- [ ] Actualicé `SUPABASE_SERVICE_KEY` con mi service_role key
- [ ] Actualicé `DB_HOST` con mi Host de Supabase
- [ ] Actualicé `DB_PASSWORD` con la contraseña que creé
- [ ] Verifiqué que `DB_SSL=true`
- [ ] Guardé el archivo

### Inicializar Base de Datos
- [ ] Ejecuté: `npm run init-db`
- [ ] Vi el mensaje: "✅ Conexión establecida"
- [ ] Vi el mensaje: "✅ Tablas creadas correctamente"
- [ ] Vi el mensaje: "✅ Datos de ejemplo insertados"
- [ ] Vi: "Recursos: 5" y "Suscripciones: 0"

## 🚀 Verificación

### Iniciar Servidor
- [ ] Ejecuté: `npm start`
- [ ] Vi: "✓ Conexión a PostgreSQL establecida correctamente"
- [ ] Vi: "✓ Servidor Express iniciado en puerto 3000"
- [ ] No hay errores en la consola

### Probar API
- [ ] Abrí http://localhost:3000 en el navegador
- [ ] La página carga correctamente
- [ ] Puedo ver los recursos de ejemplo
- [ ] Puedo crear un nuevo recurso
- [ ] Puedo editar un recurso
- [ ] Puedo eliminar un recurso

### Verificar en Supabase Dashboard
- [ ] Fui a Table Editor en mi dashboard de Supabase
- [ ] Veo la tabla `recursos` con 5 registros
- [ ] Veo la tabla `suscripciones` (vacía)
- [ ] Los datos coinciden con lo que veo en la aplicación

## 🔔 Probar Notificaciones Push

### Configurar Notificaciones
- [ ] Abrí la aplicación en el navegador
- [ ] Hice clic en "Activar Notificaciones"
- [ ] Acepté los permisos de notificaciones
- [ ] Vi el mensaje de confirmación

### Probar Envío
- [ ] Creé un nuevo recurso desde el panel de administración
- [ ] Recibí una notificación push
- [ ] La notificación muestra el título y descripción correctos

## 📊 Verificación Final

- [ ] Todas las funcionalidades CRUD funcionan
- [ ] Las notificaciones push funcionan
- [ ] No hay errores en la consola del navegador
- [ ] No hay errores en la consola del servidor
- [ ] Los datos se guardan correctamente en Supabase

## 🎉 ¡Migración Completada!

Si marcaste todas las casillas, ¡felicitaciones! Tu aplicación ahora está usando Supabase.

## 📝 Notas Adicionales

**Anota aquí cualquier problema que encontraste y cómo lo resolviste:**

```
Problema 1:
Solución:

Problema 2:
Solución:
```

## 🆘 Si Algo Salió Mal

### No puedo conectar a Supabase
1. Verifica que copiaste bien todas las credenciales
2. Asegúrate de que `DB_SSL=true`
3. Verifica tu conexión a internet
4. Revisa la guía: `CONFIGURACION_RAPIDA_SUPABASE.md`

### Las tablas no se crearon
1. Ejecuta de nuevo: `npm run init-db`
2. O crea las tablas manualmente desde SQL Editor en Supabase
3. Copia el contenido de `backend/db/schema.sql`

### Error "password authentication failed"
1. Verifica la contraseña en `DB_PASSWORD`
2. Asegúrate de no tener espacios extra
3. Intenta resetear la contraseña desde Supabase Dashboard

### Necesito ayuda
- Revisa: `MIGRACION_SUPABASE.md` (guía completa)
- Revisa: `CONFIGURACION_RAPIDA_SUPABASE.md` (guía rápida)
- Revisa: `CAMBIOS_MIGRACION.md` (detalles técnicos)

---

**Fecha de migración**: _______________
**Tiempo total**: _______________
**Estado**: ⬜ En progreso | ⬜ Completado | ⬜ Con problemas
