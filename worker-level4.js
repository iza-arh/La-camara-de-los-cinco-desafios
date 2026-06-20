self.addEventListener('message', (evento) => {
    const registros = evento.data;

    if (!Array.isArray(registros) || registros.length === 0) {
        self.postMessage({
            tipo: 'error',
            mensaje: 'No se recibieron lecturas válidas para procesar.'
        });
        return;
    }

    const TAMANO_BLOQUE = 1000;
    let indice = 0;
    let sumaTemperatura = 0;
    let sumaHumedad = 0;
    let temperaturaMaxima = -Infinity;
    let temperaturaMinima = Infinity;
    let humedadMaxima = -Infinity;
    let humedadMinima = Infinity;

    function procesarBloque() {
        const limite = Math.min(indice + TAMANO_BLOQUE, registros.length);

        for (; indice < limite; indice += 1) {
            const registro = registros[indice];
            sumaTemperatura += registro.temperatura;
            sumaHumedad += registro.humedad;
            temperaturaMaxima = Math.max(temperaturaMaxima, registro.temperatura);
            temperaturaMinima = Math.min(temperaturaMinima, registro.temperatura);
            humedadMaxima = Math.max(humedadMaxima, registro.humedad);
            humedadMinima = Math.min(humedadMinima, registro.humedad);
        }

        const porcentaje = Math.round((indice / registros.length) * 100);
        self.postMessage({ tipo: 'progreso', porcentaje });

        if (indice < registros.length) {
            setTimeout(procesarBloque, 25);
            return;
        }

        self.postMessage({
            tipo: 'resultado',
            estadisticas: {
                temperatura: {
                    promedio: sumaTemperatura / registros.length,
                    maximo: temperaturaMaxima,
                    minimo: temperaturaMinima
                },
                humedad: {
                    promedio: sumaHumedad / registros.length,
                    maximo: humedadMaxima,
                    minimo: humedadMinima
                }
            }
        });
    }

    procesarBloque();
});
