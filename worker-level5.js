self.addEventListener('message', (ev) => {
    const msg = ev.data;
    if (!msg || msg.action !== 'process') return;
    const data = msg.data;
    const total = data.length;

    let sumT = 0;
    let sumH = 0;
    let sumP = 0;
    let validCount = 0;
    const temps = [];
    const press = [];

    const chunk = 5000;
    for (let i = 0; i < total; i += chunk) {
        const end = Math.min(i + chunk, total);
        for (let j = i; j < end; j++) {
            const rec = data[j];
            if (rec.temperature < 0 || rec.humidity < 0 || rec.pressure < 0) continue;
            sumT += rec.temperature;
            sumH += rec.humidity;
            sumP += rec.pressure;
            validCount++;
            temps.push(rec.temperature);
            press.push(rec.pressure);
        }
        const progress = Math.floor(((end) / total) * 100);
        self.postMessage({ type: 'progress', progress: progress });
    }

    const avgT = validCount ? sumT / validCount : 0;
    const avgH = validCount ? sumH / validCount : 0;
    const avgP = validCount ? sumP / validCount : 0;

    temps.sort((a, b) => b - a);
    press.sort((a, b) => b - a);

    const topTemperatures = temps.slice(0, 10);
    const topPressures = press.slice(0, 10);

    const result = {
        validCount: validCount,
        avgTemperature: avgT,
        avgHumidity: avgH,
        avgPressure: avgP,
        topTemperatures: topTemperatures,
        topPressures: topPressures
    };

    self.postMessage({ type: 'result', result: result });
});
