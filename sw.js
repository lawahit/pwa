//asignar nombre a la cache
const CACHE_NAME = 'v1_cache_LuisAntonioDeJesusAngelesMuthe';

//ficheros a cachear en la aplicacion
var urlsToCache = [
  './',
  './css/styles.css',
  './notifications.js',
  './admin.js',
  './img/favicon.png',
  './img/1.jpg',
  './img/2.jpg',
  './img/3.jpg',
  './img/4.jpg',
  './img/5.jpg',
  './img/6.jpg',
  './img/facebook.png', // Agregué ./ para consistencia
  './img/instagram.png', // Agregué ./ para consistencia
  './img/twitter.png', // Agregué ./ para consistencia
  './img/favicon-1024.png',
  './img/favicon-512.png',
  './img/favicon-384.png',
  './img/favicon-256.png',
  './img/favicon-128.png',
  './img/favicon-96.png',
  './img/favicon-64.png',
  './img/favicon-32.png',
  './img/favicon-16.png',
];

// Evento install
// Instalación del Service Worker y guarda en cache los recursos estáticos
self.addEventListener('install', e => {
  e.waitUntil(
    // 1. Abre o crea una caché con el nombre definido
    caches.open(CACHE_NAME)
      .then(cache => {
        // 2. Agrega todos los archivos de 'urlsToCache' a la caché
        return cache.addAll(urlsToCache)
          .then(() => {
            // 3. Activa inmediatamente el Service Worker
            self.skipWaiting();
          });
      })
      .catch(err => {
        // Manejo de errores si la caché falla
        console.log('No se ha registrado:', err);
      }) // Aquí cerramos el catch correctamente
  ); // Y aquí cerramos el waitUntil
});

//Evento activate
// Que la app funcione sin conexión
self.addEventListener('activate', e => {
	const cacheWhitelist =[CACHE_NAME];

	e.waitUntil(
		caches.keys()
			.then(cacheNames => {
				return Promise.all(
					cacheNames.map(cacheName => {

						if(cacheWhitelist.indexOf(cacheName) === -1){
							// Borrar elementos que no se necesitan
							return caches.delete(cacheName);
						}

					})
				);
			})
		.then(() => {
			//Activar cache
			self.clients.claim();
		})
	);
});

//Evento fetch
self.addEventListener('fetch', e => {

	e.respondWith(
		caches.match(e.request)
		.then(res =>{
			if(res){
				return res;
			}
			return fetch(e.request);
		})
	);
});

//Evento push
// Maneja las notificaciones push recibidas
self.addEventListener('push', e => {
	let data = { title: 'Notificación', body: 'Nuevo contenido disponible', url: './' };
	
	if (e.data) {
		try {
			data = e.data.json();
		} catch (error) {
			console.error('Error al parsear datos push:', error);
		}
	}
	
	const options = {
		body: data.body,
		icon: './img/favicon-192.png',
		badge: './img/favicon-96.png',
		data: {
			url: data.url || './'
		}
	};
	
	e.waitUntil(
		self.registration.showNotification(data.title, options)
	);
});

//Evento notificationclick
// Maneja los clics en las notificaciones
self.addEventListener('notificationclick', e => {
	e.notification.close();
	
	const urlToOpen = e.notification.data.url || './';
	
	e.waitUntil(
		clients.matchAll({ type: 'window', includeUncontrolled: true })
			.then(windowClients => {
				// Buscar si ya hay una ventana abierta con la PWA
				for (let i = 0; i < windowClients.length; i++) {
					const client = windowClients[i];
					if (client.url === urlToOpen && 'focus' in client) {
						return client.focus();
					}
				}
				// Si no hay ventana abierta, abrir una nueva
				if (clients.openWindow) {
					return clients.openWindow(urlToOpen);
				}
			})
	);
});