// admin.js - Lógica CRUD para gestión de recursos educativos

// Detectar si estamos en producción o desarrollo
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// Estado de la aplicación
let modoEdicion = false;
let recursoEditandoId = null;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    cargarRecursos();
    inicializarEventos();
});

// Inicializar event listeners
function inicializarEventos() {
    const btnNuevo = document.getElementById('btn-nuevo-recurso');
    const btnCancelar = document.getElementById('btn-cancelar');
    const formRecurso = document.getElementById('form-recurso');

    if (btnNuevo) {
        btnNuevo.addEventListener('click', mostrarFormularioCreacion);
    }

    if (btnCancelar) {
        btnCancelar.addEventListener('click', cancelarFormulario);
    }

    if (formRecurso) {
        formRecurso.addEventListener('submit', guardarRecurso);
    }
}

// Cargar y renderizar lista de recursos
async function cargarRecursos() {
    const listaContainer = document.getElementById('lista-recursos');
    
    try {
        listaContainer.innerHTML = '<p class="cargando">Cargando recursos...</p>';
        
        const response = await fetch(`${API_URL}/recursos`);
        
        if (!response.ok) {
            throw new Error('Error al cargar recursos');
        }
        
        const recursos = await response.json();
        renderizarRecursos(recursos);
        
    } catch (error) {
        console.error('Error:', error);
        listaContainer.innerHTML = '<p class="mensaje-error">Error al cargar los recursos. Por favor, verifica que el servidor esté funcionando.</p>';
    }
}

// Renderizar lista de recursos
function renderizarRecursos(recursos) {
    const listaContainer = document.getElementById('lista-recursos');
    
    if (recursos.length === 0) {
        listaContainer.innerHTML = '<p class="cargando">No hay recursos disponibles. Crea uno nuevo.</p>';
        return;
    }
    
    let html = '';
    
    recursos.forEach(recurso => {
        const fecha = new Date(recurso.fecha_creacion).toLocaleDateString('es-ES');
        
        html += `
            <div class="recurso-card" data-id="${recurso.id}">
                <h3>${escapeHtml(recurso.titulo)}</h3>
                <span class="categoria">${escapeHtml(recurso.categoria)}</span>
                <p>${escapeHtml(recurso.descripcion)}</p>
                <p class="url"><strong>URL:</strong> <a href="${escapeHtml(recurso.url)}" target="_blank">${escapeHtml(recurso.url)}</a></p>
                <p class="fecha">Creado: ${fecha}</p>
                <div class="acciones">
                    <button class="btn btn-edit" onclick="editarRecurso(${recurso.id})">Editar</button>
                    <button class="btn btn-danger" onclick="eliminarRecurso(${recurso.id})">Eliminar</button>
                </div>
            </div>
        `;
    });
    
    listaContainer.innerHTML = html;
}

// Mostrar formulario de creación
function mostrarFormularioCreacion() {
    modoEdicion = false;
    recursoEditandoId = null;
    
    document.getElementById('formulario-titulo').textContent = 'Crear Nuevo Recurso';
    document.getElementById('formulario-recurso').classList.remove('formulario-oculto');
    limpiarFormulario();
    
    // Scroll al formulario
    document.getElementById('formulario-recurso').scrollIntoView({ behavior: 'smooth' });
}

// Editar recurso existente
async function editarRecurso(id) {
    try {
        const response = await fetch(`${API_URL}/recursos/${id}`);
        
        if (!response.ok) {
            throw new Error('Error al cargar el recurso');
        }
        
        const recurso = await response.json();
        
        modoEdicion = true;
        recursoEditandoId = id;
        
        document.getElementById('formulario-titulo').textContent = 'Editar Recurso';
        document.getElementById('recurso-id').value = recurso.id;
        document.getElementById('recurso-titulo').value = recurso.titulo;
        document.getElementById('recurso-descripcion').value = recurso.descripcion;
        document.getElementById('recurso-categoria').value = recurso.categoria;
        document.getElementById('recurso-url').value = recurso.url;
        
        document.getElementById('formulario-recurso').classList.remove('formulario-oculto');
        
        // Scroll al formulario
        document.getElementById('formulario-recurso').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al cargar el recurso para editar', 'error');
    }
}

// Guardar recurso (crear o actualizar)
async function guardarRecurso(event) {
    event.preventDefault();
    
    const datos = {
        titulo: document.getElementById('recurso-titulo').value.trim(),
        descripcion: document.getElementById('recurso-descripcion').value.trim(),
        categoria: document.getElementById('recurso-categoria').value,
        url: document.getElementById('recurso-url').value.trim()
    };
    
    // Validación básica
    if (!datos.titulo || !datos.descripcion || !datos.categoria || !datos.url) {
        mostrarMensaje('Por favor, completa todos los campos', 'error');
        return;
    }
    
    try {
        let response;
        
        if (modoEdicion) {
            // Actualizar recurso existente
            response = await fetch(`${API_URL}/recursos/${recursoEditandoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });
        } else {
            // Crear nuevo recurso
            response = await fetch(`${API_URL}/recursos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });
        }
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al guardar el recurso');
        }
        
        const mensaje = modoEdicion ? 'Recurso actualizado exitosamente' : 'Recurso creado exitosamente';
        mostrarMensaje(mensaje, 'exito');
        
        cancelarFormulario();
        cargarRecursos();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje(error.message || 'Error al guardar el recurso', 'error');
    }
}

// Eliminar recurso
async function eliminarRecurso(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este recurso?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/recursos/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar el recurso');
        }
        
        mostrarMensaje('Recurso eliminado exitosamente', 'exito');
        cargarRecursos();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al eliminar el recurso', 'error');
    }
}

// Cancelar y ocultar formulario
function cancelarFormulario() {
    document.getElementById('formulario-recurso').classList.add('formulario-oculto');
    limpiarFormulario();
    modoEdicion = false;
    recursoEditandoId = null;
}

// Limpiar formulario
function limpiarFormulario() {
    document.getElementById('form-recurso').reset();
    document.getElementById('recurso-id').value = '';
}

// Mostrar mensaje de estado
function mostrarMensaje(texto, tipo) {
    const mensajeDiv = document.getElementById('mensaje-estado');
    
    mensajeDiv.textContent = texto;
    mensajeDiv.className = tipo === 'exito' ? 'mensaje-exito' : 'mensaje-error';
    mensajeDiv.classList.remove('mensaje-oculto');
    
    // Ocultar mensaje después de 5 segundos
    setTimeout(() => {
        mensajeDiv.classList.add('mensaje-oculto');
    }, 5000);
}

// Función auxiliar para escapar HTML y prevenir XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
