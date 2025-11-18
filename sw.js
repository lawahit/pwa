//asignar nombre a la cache
const CACHE_NAME = 'v2_cache_LuisAntonioDeJesusAngelesMuthe';
const OFFLINE_QUEUE = 'offline-queue-v1';

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

//Evento fetch - Mejorado con soporte offline
self.addEventListener('fetch', e => {
	const { request } = e;
	const url = new URL(request.url);

	// Si es una petición a la API
	if (url.pathname.startsWith('/api/')) {
		e.respondWith(
			fetch(request)
				.then(response => {
					// Si la respuesta es exitosa, cachear los GET
					if (response.ok && request.method === 'GET') {
						const responseClone = response.clone();
						caches.open(CACHE_NAME).then(cache => {
							cache.put(request, responseClone);
						});
					}
					return response;
				})
				.catch(async error => {
					// Si no hay conexión
					console.log('Sin conexión, intentando desde caché o cola offline');

					// Si es POST/PUT/DELETE, guardar en cola offline
					if (request.method !== 'GET') {
						await guardarEnColaOffline(request);
						
						// Mostrar notificación local
						await self.registration.showNotification('Guardado sin conexión', {
							body: 'Tu recurso se guardó localmente y se sincronizará cuando vuelva la conexión',
							icon: './img/favicon-192.png',
							badge: './img/favicon-96.png',
							tag: 'offline-save'
						});

						// Retornar respuesta simulada
						return new Response(JSON.stringify({ 
							success: true, 
							offline: true,
							message: 'Guardado localmente, se sincronizará cuando vuelva la conexión'
						}), {
							status: 202,
							headers: { 'Content-Type': 'application/json' }
						});
					}

					// Si es GET, intentar desde caché
					const cachedResponse = await caches.match(request);
					if (cachedResponse) {
						return cachedResponse;
					}

					// Si no hay caché, retornar error
					return new Response(JSON.stringify({ 
						error: 'Sin conexión y sin datos en caché' 
					}), {
						status: 503,
						headers: { 'Content-Type': 'application/json' }
					});
				})
		);
	} else {
		// Para archivos estáticos, usar estrategia Cache First
		e.respondWith(
			caches.match(request)
				.then(res => {
					if (res) {
						return res;
					}
					return fetch(request).then(response => {
						// Cachear la respuesta
						if (response.ok) {
							const responseClone = response.clone();
							caches.open(CACHE_NAME).then(cache => {
								cache.put(request, responseClone);
							});
						}
						return response;
					});
				})
		);
	}
});

// Función para guardar peticiones en cola offline
async function guardarEnColaOffline(request) {
	const requestData = {
		url: request.url,
		method: request.method,
		headers: {},
		body: null,
		timestamp: Date.now()
	};

	// Copiar headers
	for (let [key, value] of request.headers.entries()) {
		requestData.headers[key] = value;
	}

	// Copiar body si existe
	if (request.method !== 'GET' && request.method !== 'HEAD') {
		try {
			requestData.body = await request.clone().text();
		} catch (e) {
			console.error('Error al leer body:', e);
		}
	}

	// Guardar en IndexedDB
	const db = await abrirDB();
	const tx = db.transaction('offline-queue', 'readwrite');
	const store = tx.objectStore('offline-queue');
	await store.add(requestData);
	
	console.log('Petición guardada en cola offline:', requestData);
}

// Abrir IndexedDB para cola offline
function abrirDB() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open('offline-db', 1);
		
		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);
		
		request.onupgradeneeded = (e) => {
			const db = e.target.result;
			if (!db.objectStoreNames.contains('offline-queue')) {
				db.createObjectStore('offline-queue', { keyPath: 'timestamp' });
			}
		};
	});
}

// Sincronizar cola offline cuando vuelva la conexión
async function sincronizarColaOffline() {
	try {
		const db = await abrirDB();
		const tx = db.transaction('offline-queue', 'readonly');
		const store = tx.objectStore('offline-queue');
		const peticiones = await store.getAll();

		if (peticiones.length === 0) {
			console.log('No hay peticiones pendientes de sincronizar');
			return;
		}

		console.log(`Sincronizando ${peticiones.length} peticiones pendientes...`);

		let sincronizadas = 0;
		let fallidas = 0;

		for (const peticion of peticiones) {
			try {
				const response = await fetch(peticion.url, {
					method: peticion.method,
					headers: peticion.headers,
					body: peticion.body
				});

				if (response.ok) {
					// Eliminar de la cola
					const txDelete = db.transaction('offline-queue', 'readwrite');
					const storeDelete = txDelete.objectStore('offline-queue');
					await storeDelete.delete(peticion.timestamp);
					sincronizadas++;
				} else {
					fallidas++;
				}
			} catch (error) {
				console.error('Error al sincronizar petición:', error);
				fallidas++;
			}
		}

		// Mostrar notificación de sincronización
		if (sincronizadas > 0) {
			await self.registration.showNotification('Sincronización completada', {
				body: `${sincronizadas} recurso(s) sincronizado(s) con el servidor`,
				icon: './img/favicon-192.png',
				badge: './img/favicon-96.png',
				tag: 'sync-complete'
			});
		}

		console.log(`Sincronización completada: ${sincronizadas} exitosas, ${fallidas} fallidas`);
	} catch (error) {
		console.error('Error al sincronizar cola offline:', error);
	}
}

// Evento sync - Se ejecuta cuando vuelve la conexión
self.addEventListener('sync', e => {
	console.log('Evento sync detectado:', e.tag);
	
	if (e.tag === 'sync-offline-queue') {
		e.waitUntil(sincronizarColaOffline());
	}
});

// Detectar cuando vuelve la conexión
self.addEventListener('message', e => {
	if (e.data && e.data.type === 'ONLINE') {
		console.log('Conexión restaurada, sincronizando...');
		sincronizarColaOffline();
	}
	
	if (e.data && e.data.type === 'OFFLINE') {
		console.log('Conexión perdida');
		// Programar notificación de recordatorio
		setTimeout(() => {
			self.registration.showNotification('¡Te extrañamos!', {
				body: 'Recuerda volver a la PWA cuando tengas conexión para sincronizar tus recursos',
				icon: './img/favicon-192.png',
				badge: './img/favicon-96.png',
				tag: 'reminder',
				requireInteraction: false
			});
		}, 60000); // 1 minuto después de perder conexión
	}
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