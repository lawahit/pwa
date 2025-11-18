# Cambios a Realizar

## 1. index.html - Agregar contenedor para indicador

Buscar:
```html
    <div id="slider">
        <div class="container">
            <h2>CONTENEDORES</h2>
        </div>
    </div>
```

Reemplazar con:
```html
    <div id="slider">
        <div class="container">
            <h2>CONTENEDORES</h2>
            <div id="indicador-conexion-container"></div>
        </div>
    </div>
```

## 2. admin.js - Cambiar función mostrarEstadoConexion

Buscar la función `mostrarEstadoConexion()` completa y reemplazarla con:

```javascript
// Mostrar estado de conexión en la interfaz
function mostrarEstadoConexion() {
    // Buscar el contenedor en el slider
    let container = document.getElementById('indicador-conexion-container');
    if (!container) {
        // Si no existe el contenedor en el slider, crearlo temporalmente
        const slider = document.getElementById('slider');
        if (slider) {
            const sliderContainer = slider.querySelector('.container');
            if (sliderContainer) {
                container = document.createElement('div');
                container.id = 'indicador-conexion-container';
                sliderContainer.appendChild(container);
            }
        }
    }
    
    // Crear indicador si no existe
    let indicador = document.getElementById('indicador-conexion');
    if (!indicador && container) {
        indicador = document.createElement('div');
        indicador.id = 'indicador-conexion';
        container.appendChild(indicador);
    }
    
    if (indicador) {
        if (estaOnline) {
            indicador.textContent = '🟢 En línea';
            indicador.className = 'conexion-online';
        } else {
            indicador.textContent = '🔴 Sin conexión';
            indicador.className = 'conexion-offline';
        }
    }
}
```

## 3. styles.css - Agregar estilos

Agregar DESPUÉS de la sección `/*Slider*/`:

```css
/* Indicador de conexión */
#indicador-conexion-container {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
}

#indicador-conexion {
    padding: 10px 20px;
    border-radius: 25px;
    font-weight: bold;
    font-size: 14px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    transition: all 0.3s ease;
    text-align: center;
}

.conexion-online {
    background: #4CAF50;
    color: white;
}

.conexion-offline {
    background: #f44336;
    color: white;
}
```

Modificar la sección `/*Slider*/`:

```css
/*Slider*/
#slider {
    height: 300px;
    background: #332bc7;
    position: relative;
}

#slider h2 {
    font-size: 40px;
    text-align: center;
    color: white;
    line-height: 290px;
    text-shadow: 0px 0px 6px black;
}
```

Modificar la sección `/*Cabecera*/`:

```css
/*Cabecera*/
#main-header {
    background: black;
    min-height: 100px;
    padding: 10px 0;
}

#logo {
    width: 63%;
    float: left;
    padding: 10px 0;
}

#logo h1 {
    font-weight: bold;
    font-size: 25px;
    color: white;
    line-height: 1.4;
    word-wrap: break-word;
}
```

Modificar la sección `/*Maquetado de servicios*/`:

```css
/*Maquetado de servicios*/
.subheader {
    font-size: 34px;
    color: #333;
    text-align: center;
    margin-top: 40px;
    margin-bottom: 30px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(251, 49, 78, 0.3);
}

#services .container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-start;
}

#services .subheader {
    width: 100%;
}

.service {
    width: 30%;
    text-align: center;
    margin: 20px 1.5%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.video {
    width: 33%;
    text-align: center;
    float: left;
    margin-top: 20px;
    margin-bottom: 20px;
}

.service img {
    height: 48px;
    margin-bottom: 20px;
}

.service h3 {
    margin-bottom: 10px;
    text-align: center;
}

.service p {
    color: #444;
    text-align: center;
    display: block;
    width: 90%;
    margin: 0px auto;
}

.video p {
    color: #444;
    text-align: justify;
    display: block;
    width: 85%;
    margin: 0px auto;
}
```

Modificar media queries:

```css
@media (max-width: 999px) {
    #logo {
        width: 90%;
        float: none;
        margin: 0px auto;
        text-align: center;
    }

    #logo h1 {
        font-size: 20px;
        line-height: 1.3;
    }

    #menu {
        float: none;
        margin: 0px auto;
        width: 100%;
    }

    #slider {
        overflow: hidden;
        height: 180px;
    }

    #slider h2 {
        font-size: 30px;
        line-height: 30px;
        margin-top: 40px;
    }

    #indicador-conexion-container {
        bottom: 10px;
    }

    #indicador-conexion {
        font-size: 12px;
        padding: 8px 15px;
    }
}

@media (max-width: 700px) {
    #logo h1 {
        font-size: 18px;
    }

    #services .container {
        display: block;
    }

    .service {
        width: 85%;
        float: none;
        margin: 20px auto;
        text-align: center;
    }

    .service p {
        text-align: center;
        width: 100%;
    }

    .service img {
        margin-bottom: 10px;
    }

    .video {
        width: 85%;
        float: none;
        margin: 20px auto;
    }

    .video p {
        margin-top: 20px;
    }

    .video iframe {
        width: 100%;
        height: 230px;
    }

    #formulario-recurso {
        padding: 20px;
    }

    .recurso-card {
        padding: 15px;
    }

    .recurso-card .acciones {
        text-align: center;
        margin-top: 10px;
    }

    .btn-edit, .btn-danger {
        display: inline-block;
        margin: 5px;
    }
}

@media (max-width: 460px){
    #logo h1 {
        font-size: 16px;
        padding: 5px;
    }

    #slider {
        height: 160px;
    }

    #slider h2 {
        font-size: 22px;
        line-height: 28px;
        margin-top: 40px;
    }

    #indicador-conexion {
        font-size: 11px;
        padding: 6px 12px;
    }
}

@media (max-width: 377px) {
    #logo h1 {
        font-size: 14px;
    }

    #menu {
        width: 100%;
        text-align: center;
    }

    #menu ul li {
        margin-left: 4%;
        margin-right: 4%;
    }

    #slider {
        height: 150px;
    }

    #slider h2 {
        font-size: 20px;
        margin-top: 35px;
    }

    .service, .video {
        width: 95%;
    }

    .video iframe {
        width: 100%;
        height: 180px;
    }
}

@media (max-width: 345px) {
    #main-header {
        min-height: auto;
        padding: 15px 0;
    }

    #logo h1 {
        font-size: 13px;
        line-height: 1.2;
    }

    #menu ul li {
        float: none;
        margin: 5px 0;
    }

    #slider {
        height: 140px;
    }

    #slider h2 {
        font-size: 18px;
        margin-top: 30px;
    }
}
```

## 4. sw.js - Corregir sincronización

Reemplazar la función `guardarEnColaOffline`:

```javascript
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
	try {
		const db = await abrirDB();
		const tx = db.transaction('offline-queue', 'readwrite');
		const store = tx.objectStore('offline-queue');
		store.add(requestData);
		
		// Esperar a que la transacción se complete
		await new Promise((resolve, reject) => {
			tx.oncomplete = () => {
				console.log('Petición guardada en cola offline:', requestData);
				resolve();
			};
			tx.onerror = () => reject(tx.error);
		});
	} catch (error) {
		console.error('Error al guardar en cola offline:', error);
	}
}
```

Reemplazar la función `sincronizarColaOffline`:

```javascript
// Sincronizar cola offline cuando vuelva la conexión
async function sincronizarColaOffline() {
	try {
		const db = await abrirDB();
		
		// Leer peticiones pendientes
		const tx = db.transaction('offline-queue', 'readonly');
		const store = tx.objectStore('offline-queue');
		
		const peticiones = await new Promise((resolve, reject) => {
			const request = store.getAll();
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});

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
					storeDelete.delete(peticion.timestamp);
					
					await new Promise((resolve, reject) => {
						txDelete.oncomplete = resolve;
						txDelete.onerror = () => reject(txDelete.error);
					});
					
					sincronizadas++;
					console.log('Petición sincronizada:', peticion.url);
				} else {
					fallidas++;
					console.log('Petición falló:', peticion.url, response.status);
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
```
