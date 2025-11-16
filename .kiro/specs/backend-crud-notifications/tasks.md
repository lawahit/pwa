# Plan de Implementación

- [x] 1. Configurar estructura del proyecto backend





  - Crear directorio `backend/` con subdirectorios `routes/`, `services/`, `db/`
  - Inicializar proyecto Node.js con `npm init`
  - Instalar dependencias: express, mysql2, web-push, cors, dotenv
  - Crear archivo `.env` con variables de configuración
  - Crear archivo `.gitignore` para excluir `node_modules/` y `.env`
  - _Requirements: 3.2, 4.2_

- [x] 2. Implementar conexión a base de datos MySQL






  - [x] 2.1 Crear archivo `db/schema.sql` con definición de tablas

    - Escribir script SQL para tabla `recursos` con columnas: id, titulo, descripcion, categoria, url, fecha_creacion
    - Escribir script SQL para tabla `suscripciones` con columnas: id, endpoint, p256dh, auth, fecha_registro
    - Agregar índices apropiados (idx_categoria en recursos, unique en endpoint)
    - _Requirements: 4.1, 4.4_
  
  - [x] 2.2 Crear módulo de conexión `db/connection.js`


    - Implementar pool de conexiones MySQL usando mysql2/promise
    - Configurar parámetros de conexión desde variables de entorno
    - Exportar pool para uso en otros módulos
    - _Requirements: 4.2, 4.3_

- [x] 3. Implementar API REST para recursos





  - [x] 3.1 Crear rutas CRUD en `routes/recursos.js`


    - Implementar GET /api/recursos para listar todos los recursos
    - Implementar GET /api/recursos/:id para obtener un recurso específico
    - Implementar POST /api/recursos para crear nuevo recurso
    - Implementar PUT /api/recursos/:id para actualizar recurso
    - Implementar DELETE /api/recursos/:id para eliminar recurso
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 1.3_
  
  - [x] 3.2 Agregar validación de datos en endpoints

    - Validar campos requeridos (titulo, descripcion, categoria, url)
    - Validar tipos de datos y longitudes máximas
    - Validar que categoria sea uno de los valores permitidos
    - Retornar errores 400 con mensajes descriptivos
    - _Requirements: 3.5, 3.6_
  

  - [x] 3.3 Implementar consultas SQL parametrizadas





    - Escribir queries SELECT, INSERT, UPDATE, DELETE con placeholders
    - Usar prepared statements para prevenir SQL injection
    - Manejar errores de base de datos apropiadamente
    - _Requirements: 4.5_

- [-] 4. Implementar sistema de notificaciones push


  - [x] 4.1 Generar y configurar claves VAPID


    - Ejecutar comando para generar claves VAPID
    - Agregar claves PUBLIC_VAPID_KEY y PRIVATE_VAPID_KEY al archivo .env
    - Documentar claves en README para referencia
    - _Requirements: 6.3_
  
  - [x] 4.2 Crear servicio de notificaciones `services/pushService.js`


    - Configurar web-push con claves VAPID y email de contacto
    - Implementar función para enviar notificación a una suscripción
    - Implementar función para enviar notificación a todas las suscripciones
    - Manejar errores 410 (suscripción expirada) y eliminar de BD
    - _Requirements: 6.3, 6.4, 6.5_
  
  - [x] 4.3 Crear rutas de suscripciones en `routes/suscripciones.js`






    - Implementar POST /api/suscripciones para registrar nueva suscripción
    - Almacenar endpoint, p256dh y auth en tabla suscripciones
    - Implementar POST /api/notificar para enviar notificación manual
    - Prevenir duplicados usando constraint UNIQUE en endpoint
    - _Requirements: 6.1, 6.2_
  
  - [x] 4.4 Integrar notificaciones automáticas al crear recursos





    - Modificar POST /api/recursos para enviar notificación después de crear
    - Construir payload con título, descripción y URL del nuevo recurso
    - Enviar notificación a todas las suscripciones activas
    - _Requirements: 2.3_

- [x] 5. Crear servidor Express principal





  - [x] 5.1 Implementar `server.js` con configuración básica


    - Inicializar aplicación Express
    - Configurar middlewares: cors, express.json(), express.static()
    - Montar rutas /api/recursos y /api/suscripciones
    - Implementar middleware de manejo de errores global
    - Iniciar servidor en puerto configurado
    - _Requirements: 3.6_
  

  - [x] 5.2 Configurar servicio de archivos estáticos

    - Servir archivos del frontend desde directorio raíz del proyecto
    - Configurar rutas para que el backend sirva la PWA
    - _Requirements: 5.1_

- [x] 6. Extender Service Worker para notificaciones push




  - [x] 6.1 Agregar evento 'push' en `sw.js`


    - Escuchar evento push y extraer datos JSON
    - Mostrar notificación usando registration.showNotification()
    - Configurar opciones: title, body, icon, badge, data
    - _Requirements: 2.5_
  
  - [x] 6.2 Agregar evento 'notificationclick' en `sw.js`


    - Cerrar notificación al hacer clic
    - Abrir o enfocar ventana de la PWA en la URL especificada
    - Navegar a la sección correspondiente del recurso
    - _Requirements: 2.4_
  
  - [x] 6.3 Actualizar lista de archivos a cachear


    - Agregar nuevos archivos JavaScript (notifications.js, admin.js) a urlsToCache
    - Mantener estrategia de cache existente
    - _Requirements: 2.5_

- [x] 7. Crear módulo de gestión de notificaciones en frontend





  - [x] 7.1 Crear archivo `notifications.js`

    - Implementar función para solicitar permisos de notificación
    - Implementar función para convertir clave VAPID de base64 a Uint8Array
    - Implementar función para suscribirse a push usando PushManager
    - Enviar objeto de suscripción al endpoint POST /api/suscripciones
    - _Requirements: 2.1, 2.2_
  
  - [x] 7.2 Integrar solicitud de permisos en `main.js`


    - Llamar función de solicitud de permisos después de registrar Service Worker
    - Manejar casos de permiso denegado o error
    - _Requirements: 2.1_

- [x] 8. Crear interfaz de administración CRUD




  - [x] 8.1 Agregar nueva sección "Recursos" en `index.html`


    - Crear sección HTML con id "recursos-admin" después de la sección de videos
    - Agregar contenedor para lista de recursos
    - Crear formulario con campos: titulo, descripcion, categoria (select), url
    - Agregar botones: "Guardar", "Cancelar", "Nuevo Recurso"
    - Aplicar estilos CSS consistentes con el diseño existente
    - _Requirements: 1.1, 1.2, 5.4_
  
  - [x] 8.2 Crear archivo `admin.js` con lógica CRUD


    - Implementar función para cargar y renderizar lista de recursos
    - Implementar función para mostrar formulario de creación/edición
    - Implementar función para enviar datos del formulario (POST o PUT)
    - Implementar función para eliminar recurso con confirmación
    - Implementar función para limpiar y resetear formulario
    - Manejar errores y mostrar mensajes al usuario
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 8.3 Agregar enlace "Recursos" al menú de navegación


    - Modificar elemento #menu en index.html para incluir enlace a #recursos-admin
    - Verificar que el scroll suave funcione con la nueva sección
    - _Requirements: 5.1, 5.2, 5.5_

- [x] 9. Actualizar estilos CSS para nueva sección




  - [x] 9.1 Agregar estilos para sección de recursos en `styles.css`


    - Crear estilos para lista de recursos (cards o tabla)
    - Estilizar formulario de creación/edición
    - Agregar estilos para botones de acción (editar, eliminar)
    - Asegurar diseño responsive para dispositivos móviles
    - _Requirements: 5.4_

- [x] 10. Crear documentación y scripts de inicialización






  - [x] 10.1 Crear archivo README.md con instrucciones

    - Documentar requisitos previos (Node.js, MySQL)
    - Incluir pasos de instalación y configuración
    - Documentar cómo generar claves VAPID
    - Incluir comandos para iniciar backend y crear base de datos
    - _Requirements: Todos_
  

  - [x] 10.2 Crear script de inicialización de base de datos

    - Crear archivo `db/init.js` que ejecute schema.sql
    - Agregar datos de ejemplo para pruebas (opcional)
    - _Requirements: 4.1_

- [ ] 11. Realizar pruebas de integración
  - [ ] 11.1 Probar flujo completo de CRUD
    - Crear recurso desde interfaz y verificar en base de datos
    - Editar recurso y verificar actualización
    - Eliminar recurso y verificar eliminación
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ] 11.2 Probar sistema de notificaciones push
    - Suscribirse a notificaciones desde navegador
    - Crear nuevo recurso y verificar recepción de notificación
    - Hacer clic en notificación y verificar navegación
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 11.3 Probar funcionamiento en diferentes navegadores
    - Verificar en Chrome, Firefox, Edge
    - Probar en dispositivos móviles
    - _Requirements: Todos_
