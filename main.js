if ('serviceWorker' in navigator) {
    console.log('Puedes usar los service workers en este navegador');

    navigator.serviceWorker.register('./sw.js')
        .then(res => {
            console.log('service worker registrado', res);
            
            // Inicializar notificaciones después de registrar el Service Worker
            if (typeof inicializarNotificaciones === 'function') {
                inicializarNotificaciones()
                    .then(() => console.log('Sistema de notificaciones inicializado'))
                    .catch(err => console.error('Error al inicializar notificaciones:', err));
            }
        })
        .catch(err => console.log('service worker no registrado', err));
} else {
    console.log('No puedes usar los service workers en este navegador');
}

// scroll  suavizado
$(document).ready(function () {

    $("#menu a").click(function (e) {
        e.preventDefault();

        $("html, body").animate({
            scrollTop: $($(this).attr('href')).offset().top
        });
        return false;
    });
});