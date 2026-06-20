document.addEventListener('DOMContentLoaded', () => {
    const TOTAL_REGISTROS = 20000;
    const pasoNivel3 = localStorage.getItem('nivel3Superado');

    if (pasoNivel3 !== 'true') {
        alert('Acceso denegado. Debes completar el Nivel 3 antes de ingresar al núcleo.');
        window.location.href = 'nivel3.html';
        return;
    }

    const btnGenerar = document.getElementById('btnGenerar');
    const btnProcesar = document.getElementById('btnProcesar');
    const panelEstado = document.getElementById('panelEstado');
    const totalTemperatura = document.getElementById('totalTemperatura');
    const totalHumedad = document.getElementById('totalHumedad');
    const muestraDatos = document.getElementById('muestraDatos');
    const tablaMuestra = document.getElementById('tablaMuestra');
    const zonaProgreso = document.getElementById('zonaProgreso');
    const barraProgreso = document.getElementById('barraProgreso');
    const porcentajeProgreso = document.getElementById('porcentajeProgreso');
    const btnProbarInterfaz = document.getElementById('btnProbarInterfaz');
    const contadorInteracciones = document.getElementById('contadorInteracciones');
    const resultados = document.getElementById('resultados');
    const btnSiguienteNivel = document.getElementById('btnSiguienteNivel');
    const ayudaSiguienteNivel = document.getElementById('ayudaSiguienteNivel');

    let datosSensores = [];
    let worker = null;
    let interacciones = 0;

    btnGenerar.addEventListener('click', () => {
        datosSensores = generarDatosSensores(TOTAL_REGISTROS);

        totalTemperatura.textContent = `${datosSensores.length.toLocaleString('es-SV')} lecturas`;
        totalHumedad.textContent = `${datosSensores.length.toLocaleString('es-SV')} lecturas`;
        mostrarMuestra(datosSensores.slice(0, 5));

        panelEstado.className = 'alert alert-success fw-bold';
        panelEstado.textContent = `Estado: ${TOTAL_REGISTROS.toLocaleString('es-SV')} registros generados correctamente.`;

        btnGenerar.textContent = 'Regenerar datos de sensores';
        btnProcesar.disabled = false;
        resultados.classList.add('d-none');
        btnSiguienteNivel.disabled = true;
        ayudaSiguienteNivel.textContent = 'Procesa los datos para desbloquear el Nivel 5.';
        actualizarProgreso(0);
    });

    btnProcesar.addEventListener('click', () => {
        if (datosSensores.length !== TOTAL_REGISTROS) {
            mostrarError('Primero debes generar los 20,000 registros de los sensores.');
            return;
        }

        iniciarProcesamiento();
    });

    btnProbarInterfaz.addEventListener('click', () => {
        interacciones += 1;
        contadorInteracciones.textContent = interacciones;
    });

    btnSiguienteNivel.addEventListener('click', () => {
        localStorage.setItem('nivel4Superado', 'true');
        window.location.href = 'nivel5.html';
    });

    function generarDatosSensores(cantidad) {
        return Array.from({ length: cantidad }, (_, indice) => ({
            id: indice + 1,
            temperatura: numeroAleatorio(15, 40),
            humedad: numeroAleatorio(30, 90)
        }));
    }

    function numeroAleatorio(minimo, maximo) {
        return Number((Math.random() * (maximo - minimo) + minimo).toFixed(2));
    }

    function mostrarMuestra(registros) {
        tablaMuestra.replaceChildren();

        registros.forEach((registro) => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <th scope="row">${registro.id}</th>
                <td>${registro.temperatura.toFixed(2)} °C</td>
                <td>${registro.humedad.toFixed(2)}%</td>
            `;
            tablaMuestra.appendChild(fila);
        });

        muestraDatos.classList.remove('d-none');
    }

    function iniciarProcesamiento() {
        if (worker) {
            worker.terminate();
        }

        worker = new Worker('worker-level4.js');
        interacciones = 0;
        contadorInteracciones.textContent = '0';
        actualizarProgreso(0);

        zonaProgreso.classList.remove('d-none');
        resultados.classList.add('d-none');
        btnGenerar.disabled = true;
        btnProcesar.disabled = true;
        btnProbarInterfaz.disabled = false;
        btnSiguienteNivel.disabled = true;
        panelEstado.className = 'alert alert-dark text-warning border-warning fw-bold';
        panelEstado.textContent = 'Estado: el Web Worker está procesando las lecturas.';

        worker.addEventListener('message', manejarMensajeWorker);
        worker.addEventListener('error', () => {
            mostrarError('El Web Worker no pudo completar el procesamiento. Intenta nuevamente.');
            restaurarControles();
            worker.terminate();
            worker = null;
        });

        worker.postMessage(datosSensores);
    }

    function manejarMensajeWorker(evento) {
        const mensaje = evento.data;

        if (mensaje.tipo === 'progreso') {
            actualizarProgreso(mensaje.porcentaje);
            return;
        }

        if (mensaje.tipo === 'resultado') {
            actualizarProgreso(100);
            mostrarEstadisticas(mensaje.estadisticas);
            restaurarControles();
            worker.terminate();
            worker = null;
        }

        if (mensaje.tipo === 'error') {
            mostrarError(mensaje.mensaje);
            restaurarControles();
            worker.terminate();
            worker = null;
        }
    }

    function actualizarProgreso(porcentaje) {
        barraProgreso.style.width = `${porcentaje}%`;
        barraProgreso.parentElement.setAttribute('aria-valuenow', porcentaje);
        porcentajeProgreso.textContent = `${porcentaje}%`;
    }

    function mostrarEstadisticas(estadisticas) {
        document.getElementById('temperaturaPromedio').textContent = `${estadisticas.temperatura.promedio.toFixed(2)} °C`;
        document.getElementById('temperaturaMaxima').textContent = `${estadisticas.temperatura.maximo.toFixed(2)} °C`;
        document.getElementById('temperaturaMinima').textContent = `${estadisticas.temperatura.minimo.toFixed(2)} °C`;
        document.getElementById('humedadPromedio').textContent = `${estadisticas.humedad.promedio.toFixed(2)}%`;
        document.getElementById('humedadMaxima').textContent = `${estadisticas.humedad.maximo.toFixed(2)}%`;
        document.getElementById('humedadMinima').textContent = `${estadisticas.humedad.minimo.toFixed(2)}%`;

        resultados.classList.remove('d-none');
        btnSiguienteNivel.disabled = false;
        btnProbarInterfaz.disabled = true;
        ayudaSiguienteNivel.textContent = 'Nivel 4 superado. El acceso al Nivel 5 está autorizado.';
        panelEstado.className = 'alert alert-success fw-bold';
        panelEstado.textContent = 'Estado: procesamiento finalizado. Estadísticas completas disponibles.';
    }

    function restaurarControles() {
        btnGenerar.disabled = false;
        btnProcesar.disabled = false;
    }

    function mostrarError(mensaje) {
        btnProbarInterfaz.disabled = true;
        panelEstado.className = 'alert alert-danger fw-bold';
        panelEstado.textContent = `Error: ${mensaje}`;
    }
});
