document.addEventListener('DOMContentLoaded', () => {
    const requestLocationBtn = document.getElementById('requestLocationBtn');
    const nextLevelBtn = document.getElementById('nextLevelBtn');
    const statusMessage = document.getElementById('statusMessage');
    const locationData = document.getElementById('locationData');
    const latDisplay = document.getElementById('latDisplay');
    const lonDisplay = document.getElementById('lonDisplay');

    requestLocationBtn.addEventListener('click', () => {

        if (!navigator.geolocation) {
            showError("Tu navegador no soporta la API de Geolocalización. Sistema incompatible.");
            return;
        }

        statusMessage.innerHTML = '<div class="alert alert-warning">Estableciendo conexión satelital... Por favor, permite el acceso si el navegador te lo solicita.</div>';

        navigator.geolocation.getCurrentPosition(
            handleSuccess,
            handleError,
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    });

    function handleSuccess(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        latDisplay.textContent = lat.toFixed(6);
        lonDisplay.textContent = lon.toFixed(6);

        statusMessage.innerHTML = '<div class="alert alert-success">Triangulación exitosa. Sistemas en línea.</div>';
        locationData.classList.remove('d-none');

        requestLocationBtn.classList.add('d-none'); 
        nextLevelBtn.classList.remove('d-none');    
    }

    function handleError(error) {
        let errorMessage = "Error desconocido de geolocalización.";

        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = "<strong>Permiso Denegado:</strong> El protocolo de seguridad requiere que autorices la ubicación para poder continuar.";
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = "<strong>Ubicación no disponible:</strong> No se pudo establecer contacto con los satélites o la red.";
                break;
            case error.TIMEOUT:
                errorMessage = "<strong>Tiempo de espera agotado:</strong> La solicitud tardó demasiado. Intenta nuevamente.";
                break;
        }

        showError(errorMessage);
    }

    function showError(message) {
        statusMessage.innerHTML = `<div class="alert alert-danger">${message}</div>`;
        locationData.classList.add('d-none');
        nextLevelBtn.classList.add('d-none');
    }

    nextLevelBtn.addEventListener('click', () => {
        localStorage.setItem('userLat', latDisplay.textContent);
        localStorage.setItem('userLon', lonDisplay.textContent);

        window.location.href = "nivel2.html";
    });
});