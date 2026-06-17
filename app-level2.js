document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('mapCanvas');
    const ctx = canvas.getContext('2d');

    const btnMap = document.getElementById('btnDrawMap');
    const btnMarker = document.getElementById('btnDrawMarker');
    const btnShapes = document.getElementById('btnDrawShapes');
    const nextBtn = document.getElementById('nextLevelBtn');
    const feedback = document.getElementById('feedback');
    const lat = localStorage.getItem('userLat');
    const lon = localStorage.getItem('userLon');

    const userCoords = {
        lat: lat ? parseFloat(lat) : 19.4326,
        lon: lon ? parseFloat(lon) : -99.1332
    };

    let mapDrawn = false;
    let markerDrawn = false;

    btnMap.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#dc3545';
        ctx.lineWidth = 2;
   
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 4; j++) {
                ctx.strokeRect(20 + (i * 100), 20 + (j * 100), 70, 70);
            }
        }

        btnMap.classList.remove('btn-outline-danger');
        btnMap.classList.add('btn-success');
        btnMap.textContent = "Mapa base cargado exitosamente";
        btnMap.disabled = true;

        mapDrawn = true;
        btnMarker.disabled = false;
        feedback.innerText = "Mapa base cargado. Buscando señal GPS...";
        checkRequirements();
    });

    btnMarker.addEventListener('click', () => {
        if (!mapDrawn) return;


        const x = Math.abs(userCoords.lon % 1) * canvas.width;
        const y = Math.abs(userCoords.lat % 1) * canvas.height;

        ctx.fillStyle = '#198754'; 
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#198754";
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; 

        btnMarker.classList.remove('btn-outline-danger');
        btnMarker.classList.add('btn-success');
        btnMarker.textContent = "Posición marcada exitosamente";
        btnMarker.disabled = true;

        markerDrawn = true;
        btnShapes.disabled = false;
        feedback.innerText = "Usuario localizado. Coordenadas: " + mockCoords.lat + ", " + mockCoords.lon;
        checkRequirements();
    });

    btnShapes.addEventListener('click', () => {
        ctx.strokeStyle = '#ffc107'; 
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(200, 150);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = '#0dcaf0'; 
        ctx.beginPath();
        ctx.arc(400, 250, 40, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(220, 53, 69, 0.2)';
        ctx.fillRect(450, 50, 80, 120);
        ctx.strokeRect(450, 50, 80, 120);

        btnShapes.classList.remove('btn-outline-danger');
        btnShapes.classList.add('btn-success');
        btnShapes.textContent = "✓ Estructuras identificadas";
        btnShapes.disabled = true;

        shapesDrawn = true;
        checkRequirements();
        feedback.innerText = "Estructuras de la ciudad identificadas.";
    });

    function checkRequirements() {
        if (mapDrawn && markerDrawn) {
            nextBtn.classList.remove('d-none');
            feedback.classList.remove('text-danger');
            feedback.classList.add('text-success', 'border-success');
            feedback.innerText = "Mapa reconstruido. Acceso al Nivel 3 autorizado.";
        }
    }

    nextBtn.addEventListener('click', () => {
        alert("Sistemas de mapeo sincronizados. Avanzando al Nivel 3...");
    });
});