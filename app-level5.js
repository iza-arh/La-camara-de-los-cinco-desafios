document.addEventListener('DOMContentLoaded', () => {
    const prev1 = localStorage.getItem('nivel4Superado');
    const prev2 = localStorage.getItem('nivel4superado');
    if (prev1 !== 'true' && prev2 !== 'true') {
        alert('Acceso Denegado. Completa el Nivel 4 primero.');
        window.location.href = 'nivel3.html';
        return;
    }

    const btnGenerar = document.getElementById('btnGenerar');
    const progressBar = document.getElementById('progressBar');
    const panel = document.getElementById('panel');
    const resultCard = document.getElementById('resultCard');
    const statsList = document.getElementById('statsList');
    const btnDownload = document.getElementById('btnDownload');
    const btnFinalizar = document.getElementById('btnFinalizar');

    let worker = null;
    let lastBlobUrl = null;

    btnGenerar.addEventListener('click', async () => {
        btnGenerar.disabled = true;
        panel.className = 'alert alert-dark text-warning border-warning fw-bold';
        panel.innerText = 'Estado: Generando 250000 registros...';

        const total = 250000;
        const data = new Array(total);
        for (let i = 0; i < total; i++) {
            const makeNeg = Math.random() < 0.01;
            const temp = makeNeg ? -Math.random() * 30 : (Math.random() * 70 - 10);
            const hum = makeNeg ? -Math.random() * 20 : (Math.random() * 100);
            const pres = makeNeg ? -Math.random() * 50 : (900 + Math.random() * 200);
            data[i] = { id: i, temperature: Number(temp.toFixed(2)), humidity: Number(hum.toFixed(2)), pressure: Number(pres.toFixed(2)) };
        }

        panel.className = 'alert alert-dark text-info border-info fw-bold';
        panel.innerText = 'Estado: Datos generados. Enviando al Worker...';

        worker = new Worker('worker-level5.js');

        worker.addEventListener('message', (ev) => {
            const msg = ev.data;
            if (msg.type === 'progress') {
                const pct = msg.progress;
                progressBar.style.width = pct + '%';
                progressBar.innerText = pct + '%';
            }
            if (msg.type === 'result') {
                progressBar.style.width = '100%';
                progressBar.innerText = '100%';
                panel.className = 'alert alert-success fw-bold';
                panel.innerText = 'Estado: Procesamiento completo.';
                displayResults(msg.result);
                worker.terminate();
                worker = null;
            }
        });

        worker.postMessage({ action: 'process', data: data });
    });

    function displayResults(res) {
        statsList.innerHTML = '';
        const li1 = document.createElement('li');
        li1.className = 'list-group-item';
        li1.innerText = 'Registros validos procesados: ' + res.validCount;
        statsList.appendChild(li1);

        const li2 = document.createElement('li');
        li2.className = 'list-group-item';
        li2.innerText = 'Promedio temperatura: ' + res.avgTemperature.toFixed(2);
        statsList.appendChild(li2);

        const li3 = document.createElement('li');
        li3.className = 'list-group-item';
        li3.innerText = 'Promedio humedad: ' + res.avgHumidity.toFixed(2);
        statsList.appendChild(li3);

        const li4 = document.createElement('li');
        li4.className = 'list-group-item';
        li4.innerText = 'Promedio presion: ' + res.avgPressure.toFixed(2);
        statsList.appendChild(li4);

        const li5 = document.createElement('li');
        li5.className = 'list-group-item';
        li5.innerText = 'Top 10 temperaturas: ' + res.topTemperatures.map(v => v.toFixed(2)).join(', ');
        statsList.appendChild(li5);

        const li6 = document.createElement('li');
        li6.className = 'list-group-item';
        li6.innerText = 'Top 10 presiones: ' + res.topPressures.map(v => v.toFixed(2)).join(', ');
        statsList.appendChild(li6);

        resultCard.classList.remove('d-none');

        const payload = { summary: res };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        if (lastBlobUrl) URL.revokeObjectURL(lastBlobUrl);
        lastBlobUrl = URL.createObjectURL(blob);
        btnDownload.onclick = () => {
            const a = document.createElement('a');
            a.href = lastBlobUrl;
            a.download = 'nivel5_resultados.json';
            a.click();
        };

        btnFinalizar.onclick = () => {
            localStorage.setItem('nivel5Superado', 'true');
            panel.className = 'alert alert-success fw-bold';
            panel.innerText = 'Estado: Nivel 5 superado.';
            setTimeout(() => { window.location.href = 'index.html'; }, 1000);
        };
    }
});
