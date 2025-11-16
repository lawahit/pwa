// Clave pública VAPID del servidor
const PUBLIC_VAPID_KEY = 'BJyT6QMQmcNuqz6Yuh4FnwkUJcx4Qdt_ZiWm94hSXXHZNjcXALagmZ50mdJUpyPXcETQD_xnO-5lP_wUFsU6vhg';

/**
 * Convierte una clave VAPID en formato base64 a Uint8Array
 * @param {string} base64String - Clave VAPID en formato base64
 * @returns {Uint8Array} - Clave convertida a Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Solicita permisos de notificación al usuario
 * @returns {Promise<string>} - Estado del permiso ('granted', 'denied', 'default')
 */
async function solicitarPermisoNotificaciones() {
  if (!('Notification' in window)) {
    console.warn('Este navegador no soporta notificaciones');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    console.log('Permisos de notificación ya otorgados');
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

/**
 * Suscribe al usuario a notificaciones push
 * @returns {Promise<PushSubscription|null>} - Objeto de suscripción o null si falla
 */
async function suscribirseAPush() {
  try {
    // Verificar que el Service Worker esté registrado
    const registration = await navigator.serviceWorker.ready;

    // Verificar si ya existe una suscripción
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      console.log('Ya existe una suscripción activa');
      return subscription;
    }

    // Crear nueva suscripción
    const applicationServerKey = urlBase64ToUint8Array(PUBLIC_VAPID_KEY);
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    });

    console.log('Suscripción creada:', subscription);

    // Enviar suscripción al backend
    await enviarSuscripcionAlServidor(subscription);

    return subscription;
  } catch (error) {
    console.error('Error al suscribirse a push:', error);
    return null;
  }
}

/**
 * Envía la suscripción al servidor backend
 * @param {PushSubscription} subscription - Objeto de suscripción
 * @returns {Promise<boolean>} - true si se envió correctamente, false si falló
 */
async function enviarSuscripcionAlServidor(subscription) {
  try {
    const response = await fetch('http://localhost:3000/api/suscripciones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    });

    if (!response.ok) {
      throw new Error(`Error al enviar suscripción: ${response.status}`);
    }

    const data = await response.json();
    console.log('Suscripción enviada al servidor:', data);
    return true;
  } catch (error) {
    console.error('Error al enviar suscripción al servidor:', error);
    return false;
  }
}

/**
 * Inicializa el sistema de notificaciones
 * Solicita permisos y suscribe al usuario si acepta
 */
async function inicializarNotificaciones() {
  try {
    // Solicitar permisos
    const permission = await solicitarPermisoNotificaciones();

    if (permission === 'granted') {
      console.log('Permiso de notificaciones otorgado');
      // Suscribirse a push
      await suscribirseAPush();
    } else if (permission === 'denied') {
      console.log('Permiso de notificaciones denegado');
    } else {
      console.log('Permiso de notificaciones no otorgado');
    }
  } catch (error) {
    console.error('Error al inicializar notificaciones:', error);
  }
}
