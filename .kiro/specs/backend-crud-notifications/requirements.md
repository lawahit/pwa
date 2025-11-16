# Documento de Requisitos

## Introducción

Este documento define los requisitos para extender la PWA existente sobre contenedores con un backend Node.js, base de datos SQL, sistema de notificaciones push y una nueva sección administrativa con funcionalidad CRUD para gestionar recursos educativos sobre contenedores.

## Glosario

- **Sistema PWA**: La aplicación web progresiva existente que muestra información sobre Docker, Kubernetes y Docker Compose
- **Backend API**: Servidor Node.js con Express que proporciona endpoints REST para operaciones CRUD
- **Base de Datos SQL**: Sistema de gestión de base de datos MySQL que almacena recursos educativos
- **Servicio de Notificaciones**: Componente que gestiona el envío de notificaciones push a usuarios suscritos
- **Sección Admin**: Nueva página en la PWA para gestionar recursos mediante operaciones CRUD
- **Recurso Educativo**: Entidad que contiene título, descripción, categoría (Docker/Kubernetes/Docker Compose), URL de video/imagen y fecha de creación
- **Service Worker**: Componente que gestiona las notificaciones push y el funcionamiento offline

## Requisitos

### Requisito 1

**User Story:** Como administrador del sitio, quiero gestionar recursos educativos mediante un CRUD, para mantener actualizado el contenido sobre contenedores

#### Acceptance Criteria

1. WHEN el administrador accede a la Sección Admin, THE Sistema PWA SHALL mostrar una lista de todos los Recursos Educativos existentes
2. WHEN el administrador hace clic en "Agregar Nuevo", THE Sistema PWA SHALL mostrar un formulario con campos para título, descripción, categoría, y URL
3. WHEN el administrador envía el formulario de creación, THE Backend API SHALL validar los datos y almacenar el nuevo Recurso Educativo en la Base de Datos SQL
4. WHEN el administrador selecciona editar un Recurso Educativo, THE Sistema PWA SHALL cargar los datos actuales en un formulario editable
5. WHEN el administrador confirma la eliminación de un Recurso Educativo, THE Backend API SHALL remover el registro de la Base de Datos SQL

### Requisito 2

**User Story:** Como usuario de la PWA, quiero recibir notificaciones push sobre nuevos recursos, para estar informado de contenido actualizado

#### Acceptance Criteria

1. WHEN el usuario visita el Sistema PWA por primera vez, THE Sistema PWA SHALL solicitar permiso para enviar notificaciones push
2. WHEN el usuario otorga permiso de notificaciones, THE Service Worker SHALL registrar la suscripción en el Backend API
3. WHEN se crea un nuevo Recurso Educativo, THE Servicio de Notificaciones SHALL enviar una notificación push a todos los usuarios suscritos
4. WHEN el usuario hace clic en una notificación, THE Sistema PWA SHALL abrir y navegar a la sección correspondiente del recurso
5. WHILE el Service Worker está activo, THE Sistema PWA SHALL mantener la capacidad de recibir notificaciones incluso cuando la aplicación esté cerrada

### Requisito 3

**User Story:** Como desarrollador del sistema, quiero un backend Node.js con Express, para proporcionar una API REST que gestione los datos

#### Acceptance Criteria

1. THE Backend API SHALL exponer un endpoint GET /api/recursos que retorne todos los Recursos Educativos
2. THE Backend API SHALL exponer un endpoint POST /api/recursos que cree un nuevo Recurso Educativo
3. THE Backend API SHALL exponer un endpoint PUT /api/recursos/:id que actualice un Recurso Educativo existente
4. THE Backend API SHALL exponer un endpoint DELETE /api/recursos/:id que elimine un Recurso Educativo
5. THE Backend API SHALL validar que todos los campos requeridos estén presentes antes de realizar operaciones de escritura
6. THE Backend API SHALL retornar códigos de estado HTTP apropiados (200, 201, 400, 404, 500)

### Requisito 4

**User Story:** Como desarrollador del sistema, quiero una base de datos MySQL, para almacenar de forma persistente los recursos educativos

#### Acceptance Criteria

1. THE Base de Datos SQL SHALL contener una tabla "recursos" con columnas: id, titulo, descripcion, categoria, url, fecha_creacion
2. THE Backend API SHALL establecer conexión con la Base de Datos SQL al iniciar
3. WHEN la conexión a la Base de Datos SQL falla, THE Backend API SHALL registrar el error y reintentar la conexión
4. THE Base de Datos SQL SHALL utilizar AUTO_INCREMENT para generar identificadores únicos de Recursos Educativos
5. THE Backend API SHALL ejecutar consultas SQL parametrizadas para prevenir inyección SQL

### Requisito 5

**User Story:** Como usuario de la PWA, quiero acceder a la nueva sección de recursos desde el menú principal, para explorar el contenido gestionado

#### Acceptance Criteria

1. THE Sistema PWA SHALL agregar un enlace "Recursos" en el menú de navegación principal
2. WHEN el usuario hace clic en "Recursos", THE Sistema PWA SHALL navegar a la Sección Admin
3. THE Sistema PWA SHALL mostrar los Recursos Educativos organizados por categoría (Docker, Kubernetes, Docker Compose)
4. THE Sistema PWA SHALL mantener el diseño responsive existente en la nueva sección
5. THE Sistema PWA SHALL aplicar scroll suave al navegar a la sección de recursos

### Requisito 6

**User Story:** Como administrador del sistema, quiero que el backend gestione las suscripciones push, para poder enviar notificaciones a los usuarios

#### Acceptance Criteria

1. THE Backend API SHALL exponer un endpoint POST /api/suscripciones que almacene nuevas suscripciones push
2. THE Backend API SHALL almacenar el endpoint, las claves p256dh y auth de cada suscripción
3. THE Servicio de Notificaciones SHALL utilizar las claves VAPID para autenticar el envío de notificaciones
4. WHEN se envía una notificación, THE Servicio de Notificaciones SHALL iterar sobre todas las suscripciones activas
5. IF una suscripción falla con error 410, THEN THE Backend API SHALL eliminar la suscripción inválida de la base de datos
