document.addEventListener('DOMContentLoaded', () => {

    const pasoNivel2 = localStorage.getItem('nivel2superado');

    if (pasoNivel2 !== 'true') {
        alert('Acceso Denegado. Debes completar el Nivel 2 antes de acceder a la cámara.');
        window.location.href = 'nivel2.html';
        return;
    }

    // Seleccionamos los elementos del DOM
    const video = document.getElementById('video-camara');
    const btnIniciar = document.getElementById('btnIniciar');
    const btnCapturar = document.getElementById('btnCapturar');
    const btnEnviar = document.getElementById('btnEnviar');
    const canvasFoto = document.getElementById('canvasFoto');
    const ctxFoto = canvasFoto.getContext('2d');
    const imgResultado = document.getElementById('img-resultado');
    const panelEstado = document.getElementById('panelEstado');

    // --- EVENTO 1: ENCENDER CÁMARA ---
    btnIniciar.addEventListener('click', async () => {
        try {
            // Actualizamos el panel a "Procesando"
            panelEstado.className = "alert alert-dark text-warning border-warning fw-bold";
            panelEstado.innerText = "Estado: Solicitando permisos de cámara...";

            const stream = await navigator.mediaDevices.getUserMedia({ video: true});
            video.srcObject = stream;

            // Actualizamos el panel a "Éxito" para este paso
            panelEstado.className = "alert alert-dark text-info border-info fw-bold";
            panelEstado.innerText = "Estado: Cámara en línea. Proceda a capturar la evidencia.";

            btnCapturar.disabled = false;
            btnIniciar.classList.replace('btn-primary', 'btn-secondary');
        } catch (error) {
            // Manejo de errores visual sin alertas
            panelEstado.className = "alert alert-danger fw-bold";
            
            if (error.name === 'NotAllowedError') {
                panelEstado.innerText = 'Error: Permiso denegado. Debes permitir el acceso a la cámara en tu navegador.';
            } else {
                panelEstado.innerText = `Error inesperado: ${error.message}`;
            }
        }
    });

    // --- EVENTO 2: TOMAR LA FOTO ---
    btnCapturar.addEventListener('click', () => {
        canvasFoto.width = video.videoWidth;
        canvasFoto.height = video.videoHeight;
        ctxFoto.drawImage(video, 0, 0, canvasFoto.width, canvasFoto.height);

        const fotoBase64 = canvasFoto.toDataURL('image/jpeg');
        localStorage.setItem('evidenciaExplorador', fotoBase64);

        imgResultado.src = fotoBase64;
        imgResultado.classList.remove('d-none');

        // Actualizamos el panel indicando el siguiente paso
        panelEstado.className = "alert alert-dark text-success border-success fw-bold";
        panelEstado.innerText = "Estado: Evidencia capturada Y enviada.";

        btnEnviar.classList.remove('d-none');
    });

    // --- EVENTO 3: ENVIAR Y AVANZAR ---
    btnEnviar.addEventListener('click', () => {
        
        // Ponemos el panel en verde total de éxito
        panelEstado.className = "alert alert-success fw-bold";
        panelEstado.innerText = "Estado: Exito. Abriendo portal al Nivel 4...";

        localStorage.setItem('nivel3Superado', 'true');

        setTimeout(() => {
            window.location.href = 'nivel4.html';
        }, 1500); 
    });
});