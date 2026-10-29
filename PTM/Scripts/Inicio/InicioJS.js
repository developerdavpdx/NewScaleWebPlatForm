/* ==================================================================
   Dashboard (Inicio)
   - Mantiene los ids, funciones y el carrusel original.
   - Separa la carga de PPVC de la de INY: si INY falla, PPVC
     igual se pinta.
   - Los errores se avisan con iziToast y el loader siempre se apaga.
   ================================================================== */

// ── Estado ───────────────────────────────────────────────────
let planta;
let turno;
let SobrepesoObjActual;
let ScrapObjActual;
let cargando = false;

const loader = document.getElementById('loaderDiv');

// Datos PPVC
let PPVCLINEAS = [];
let PPVCVOLUMEN = [];
let NombresSkuPPVC = [];
let SobrepesoObjetivoPPVC = [];
let SobrePesoGrafPPVC = [];
let ScrapKGPPVC = [];
let ScrapPorcentPPVC = [];
let ScrapObjetivoPPVC = [];
let EficienciaGrafPPVC = [];

// Datos INY
let INYLINEAS = [];
let INYVOLUMEN = [];
let NombresSkuINY = [];
let SobrepesoObjetivoINY = [];
let SobrePesoGrafINY = [];
let ScrapKGINY = [];
let ScrapPorcentINY = [];
let ScrapObjetivoINY = [];
let EficienciaGrafINY = [];

// Totales PPVC
let VolumenPPVC = 0;
let SobrePesoPPVC = 0;
let EficienciaPPVC = 0;
let ScrapPtPPVC = 0;
let PesoEstandarPPVC = 0;
let kgPproductoPPVC = 0;
let sumScrapKgPPVC = 0;

// Totales INY
let VolumenINY = 0;
let SobrePesoINY = 0;
let EficienciaINY = 0;
let ScrapPtINY = 0;
let PesoEstandarINY = 0;
let kgPproductoINY = 0;
let sumScrapKgINY = 0;

// Objetivos vigentes
let objetivoSobrepesoPPVC = 0;
let objetivoScrapPPVC = 0;
let objetivoSobrepesoINY = 0;
let objetivoScrapINY = 0;

// ── Constantes de presentacion ───────────────────────────────
const COLOR = {
    primario: '#0058A1',
    objetivo: '#94a3b8',
    verde: '#2e7d32',
    rojo: '#b4433f',
    ambar: '#b26a00',
    texto: '#22303f',
    muted: '#6b7a8c'
};

const REFRESCO_MS = 5 * 60 * 1000; // 5 minutos

// ── Utilidades ───────────────────────────────────────────────
function num(valor) {
    const n = parseFloat(valor);
    return isNaN(n) ? 0 : n;
}

function mostrarLoader(visible) {
    if (loader) {
        loader.style.display = visible ? 'flex' : 'none';
    }
}

function aviso(titulo, mensaje) {
    if (typeof iziToast === 'undefined') {
        console.warn(titulo + ': ' + mensaje);
        return;
    }
    iziToast.warning({
        position: 'topRight',
        title: titulo,
        message: `<p>${mensaje}</p>`,
        color: 'blue'
    });
}

function marcarActualizado() {
    const el = document.getElementById('labelActualizado');
    if (!el) return;
    const hora = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    el.innerText = 'Actualizado ' + hora;
}

function etiquetaPlanta(valor) {
    return valor === '2' ? 'Planta 2' : 'Planta 1';
}

// ── Turno ────────────────────────────────────────────────────
function obtenerTurno() {
    const horaInicio = new Date();
    horaInicio.setHours(4, 30, 0);
    const horaFin = new Date();
    horaFin.setHours(16, 30, 0);

    const horaActual = new Date();
    horaActual.setSeconds(0);

    if (horaActual >= horaInicio && horaActual <= horaFin) {
        return 1;
    }
    return 2;
}

// ── Arranque ─────────────────────────────────────────────────
turno = obtenerTurno();
if (document.getElementById('labelTurno')) {
    document.getElementById('labelTurno').innerText = turno;
}

$(function () {
    iniciarSwipers();
    cargarDashboard();
    setInterval(function () {
        if (!document.hidden) {
            cargarDashboard({ silencioso: true });
        }
    }, REFRESCO_MS);
});

// ── Carga principal ──────────────────────────────────────────
async function cargarDashboard(opciones) {
    if (cargando) return;
    cargando = true;

    const silencioso = !!(opciones && opciones.silencioso);
    if (!silencioso) mostrarLoader(true);

    localStorage.planta == '335' ? planta = '2' : planta = '1';

    const etiqueta = document.getElementById('labelPlanta');
    if (etiqueta) etiqueta.innerText = etiquetaPlanta(planta);

    aplicarVisibilidadProceso(planta);
    reiniciarDatos();

    const tareas = [
        ObtenerDatosPPVC(planta),
        ObtenerDatosGraficasPPVC(planta, turno)
    ];

    if (planta === '2') {
        tareas.push(ObtenerDatosINY(planta));
        tareas.push(ObtenerDatosGraficasINY(planta, turno));
    }

    const resultados = await Promise.allSettled(tareas);
    const fallidas = resultados.filter(r => r.status === 'rejected').length;

    try {
        CrearGraficos();
    } catch (error) {
        console.error(error);
        aviso('Dashboard', 'No se pudieron dibujar las gráficas.');
    }

    actualizarResumen();
    marcarActualizado();
    mostrarLoader(false);

    if (fallidas === resultados.length) {
        aviso('Dashboard', 'No se pudo obtener la información del turno.');
    } else if (fallidas > 0 && !silencioso) {
        aviso('Dashboard', 'Algunos indicadores no se pudieron actualizar.');
    }

    cargando = false;
}

function aplicarVisibilidadProceso(plantaActual) {
    const bloquesINY = ['DivObjetivosINY', 'DivTitulosINY', 'swiperINY', 'TitleIny'];

    bloquesINY.forEach(function (id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.display = plantaActual === '1' ? 'none' : '';
    });
}

function reiniciarDatos() {
    PPVCLINEAS = []; PPVCVOLUMEN = []; NombresSkuPPVC = [];
    SobrepesoObjetivoPPVC = []; SobrePesoGrafPPVC = [];
    ScrapKGPPVC = []; ScrapPorcentPPVC = []; ScrapObjetivoPPVC = [];
    EficienciaGrafPPVC = [];

    INYLINEAS = []; INYVOLUMEN = []; NombresSkuINY = [];
    SobrepesoObjetivoINY = []; SobrePesoGrafINY = [];
    ScrapKGINY = []; ScrapPorcentINY = []; ScrapObjetivoINY = [];
    EficienciaGrafINY = [];

    VolumenPPVC = 0; SobrePesoPPVC = 0; EficienciaPPVC = 0; ScrapPtPPVC = 0;
    PesoEstandarPPVC = 0; kgPproductoPPVC = 0; sumScrapKgPPVC = 0;

    VolumenINY = 0; SobrePesoINY = 0; EficienciaINY = 0; ScrapPtINY = 0;
    PesoEstandarINY = 0; kgPproductoINY = 0; sumScrapKgINY = 0;

    objetivoSobrepesoPPVC = 0; objetivoScrapPPVC = 0;
    objetivoSobrepesoINY = 0; objetivoScrapINY = 0;
}

// ── KPIs ─────────────────────────────────────────────────────
function ObtenerDatosPPVC(plantaActual) {
    const data = { planta: plantaActual, proceso: 'PPVC' };

    return fetch('/ProductoTerminado/GetAllPtPvc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify(data)
    })
        .then(function (response) {
            return response.ok ? response.json() : Promise.reject(response);
        })
        .then(function (jsonData) {
            if (jsonData.status != 200) {
                throw new Error(jsonData.response || 'Respuesta inválida');
            }

            const pvcJson = JSON.parse(jsonData.data);
            const productos = pvcJson.reportesProdTerm || [];

            productos.forEach(function (item) {
                VolumenPPVC += num(item.pesoTotal);
                sumScrapKgPPVC += num(item.scrapTotal);
                PesoEstandarPPVC += num(item.pUnitEstandar) * num(item.numTubos);
                kgPproductoPPVC += num(item.kgPproducto) * num(item.horasTrabajo);
            });

            SobrePesoPPVC = (VolumenPPVC > 0 && PesoEstandarPPVC > 0)
                ? ((VolumenPPVC / PesoEstandarPPVC) - 1) * 100
                : 0;

            EficienciaPPVC = kgPproductoPPVC > 0
                ? (VolumenPPVC / kgPproductoPPVC) * 100
                : 0;

            ScrapPtPPVC = (sumScrapKgPPVC + VolumenPPVC) > 0
                ? (sumScrapKgPPVC / (sumScrapKgPPVC + VolumenPPVC)) * 100
                : 0;

            pintarKpis('PPVC');
        })
        .catch(function (error) {
            console.error('KPIs PPVC', error);
            throw error;
        });
}

function ObtenerDatosINY(plantaActual) {
    const data = { planta: plantaActual, proceso: 'INY' };

    return fetch('/ProductoTerminado/GetAllPtPvc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify(data)
    })
        .then(function (response) {
            return response.ok ? response.json() : Promise.reject(response);
        })
        .then(function (jsonData) {
            if (jsonData.status != 200) {
                throw new Error(jsonData.response || 'Respuesta inválida');
            }

            const inyJson = JSON.parse(jsonData.data);
            const productos = inyJson.reportesProdTerm || [];

            productos.forEach(function (item) {
                VolumenINY += num(item.pesoTotal);
                sumScrapKgINY += num(item.scrapTotal);
                PesoEstandarINY += num(item.pUnitEstandar) * num(item.numTubos);
                kgPproductoINY += num(item.kgPproducto) * num(item.horasTrabajo);
            });

            SobrePesoINY = (VolumenINY > 0 && PesoEstandarINY > 0)
                ? ((VolumenINY / PesoEstandarINY) - 1) * 100
                : 0;

            EficienciaINY = kgPproductoINY > 0
                ? (VolumenINY / kgPproductoINY) * 100
                : 0;

            ScrapPtINY = (sumScrapKgINY + VolumenINY) > 0
                ? (sumScrapKgINY / (sumScrapKgINY + VolumenINY)) * 100
                : 0;

            pintarKpis('INY');
        })
        .catch(function (error) {
            console.error('KPIs INY', error);
            throw error;
        });
}

function pintarKpis(proceso) {
    const esINY = proceso === 'INY';
    const sufijo = esINY ? 'INY' : '';

    const volumen = esINY ? VolumenINY : VolumenPPVC;
    const sobrepeso = esINY ? SobrePesoINY : SobrePesoPPVC;
    const eficiencia = esINY ? EficienciaINY : EficienciaPPVC;
    const scrap = esINY ? ScrapPtINY : ScrapPtPPVC;

    texto(`#volumenInfo${sufijo}`, volumen.toFixed(2));
    texto(`#infoSobrePeso${sufijo}`, sobrepeso.toFixed(2) + ' %');
    texto(`#eficicienciaInfo${sufijo}`, eficiencia.toFixed(2) + ' %');
    texto(`#scrapInfo${sufijo}`, scrap.toFixed(2) + ' %');
}

function texto(selector, valor) {
    const el = document.querySelector(selector);
    if (el) el.innerText = valor;
}

// ── Datos de las graficas ────────────────────────────────────
function ObtenerDatosGraficasPPVC(plantaActual, turnoActual) {
    const data = { planta: plantaActual, turno: turnoActual, proceso: 'PPVC' };

    return fetch('/Inicio/GetDataGraph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify(data)
    })
        .then(function (response) {
            return response.ok ? response.json() : Promise.reject(response);
        })
        .then(function (jsonData) {
            if (jsonData.status != 200) {
                throw new Error(jsonData.response || 'Respuesta inválida');
            }

            const json = JSON.parse(jsonData.data);
            const filas = json.kpiSdatosVolumenes || [];

            filas.forEach(function (fila) {
                PPVCLINEAS.push(fila.linea);
                PPVCVOLUMEN.push(num(fila.volumen));
                NombresSkuPPVC.push(fila.codigos);
                SobrepesoObjetivoPPVC.push(num(fila.sobrepesoObjetivo));
                SobrePesoGrafPPVC.push(num(fila.sobrepeso));
                EficienciaGrafPPVC.push(num(fila.eficiencia));
                ScrapKGPPVC.push(num(fila.scrapKG));
                ScrapPorcentPPVC.push(num(fila.scrapPorcent));
                ScrapObjetivoPPVC.push(num(fila.scrapObjetivo));

                SobrepesoObjActual = fila.sobrepesoObjetivo;
                ScrapObjActual = fila.scrapObjetivo;
                objetivoSobrepesoPPVC = num(fila.sobrepesoObjetivo);
                objetivoScrapPPVC = num(fila.scrapObjetivo);
            });

            valorInput('#SobrepesoObj', SobrepesoObjActual);
            valorInput('#ScrapObj', ScrapObjActual);
        })
        .catch(function (error) {
            console.error('Gráficas PPVC', error);
            throw error;
        });
}

function ObtenerDatosGraficasINY(plantaActual, turnoActual) {
    const data = { planta: plantaActual, turno: turnoActual, proceso: 'INY' };

    return fetch('/Inicio/GetDataGraph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify(data)
    })
        .then(function (response) {
            return response.ok ? response.json() : Promise.reject(response);
        })
        .then(function (jsonData) {
            if (jsonData.status != 200) {
                throw new Error(jsonData.response || 'Respuesta inválida');
            }

            const json = JSON.parse(jsonData.data);
            const filas = json.kpiSdatosVolumenes || [];

            filas.forEach(function (fila) {
                INYLINEAS.push(fila.linea);
                INYVOLUMEN.push(num(fila.volumen));
                NombresSkuINY.push(fila.codigos);
                SobrepesoObjetivoINY.push(num(fila.sobrepesoObjetivo));
                SobrePesoGrafINY.push(num(fila.sobrepeso));
                EficienciaGrafINY.push(num(fila.eficiencia));
                ScrapKGINY.push(num(fila.scrapKG));
                ScrapPorcentINY.push(num(fila.scrapPorcent));
                ScrapObjetivoINY.push(num(fila.scrapObjetivo));

                SobrepesoObjActual = fila.sobrepesoObjetivo;
                ScrapObjActual = fila.scrapObjetivo;
                objetivoSobrepesoINY = num(fila.sobrepesoObjetivo);
                objetivoScrapINY = num(fila.scrapObjetivo);
            });

            valorInput('#SobrepesoObjINY', SobrepesoObjActual);
            valorInput('#ScrapObjINY', ScrapObjActual);
        })
        .catch(function (error) {
            console.error('Gráficas INY', error);
            throw error;
        });
}

function valorInput(selector, valor) {
    const el = document.querySelector(selector);
    if (el && valor !== undefined && valor !== null && valor !== '') {
        el.value = valor;
    }
}

// ── Resumen de la pantalla ───────────────────────────────────
function actualizarResumen() {
    const lineasPPVC = PPVCLINEAS.filter(function (_, i) {
        return PPVCVOLUMEN[i] > 0 || ScrapKGPPVC[i] > 0;
    }).length;

    const lineasINY = INYLINEAS.filter(function (_, i) {
        return INYVOLUMEN[i] > 0 || ScrapKGINY[i] > 0;
    }).length;

    texto('#ppvcLineas', lineasPPVC);
    texto('#inyLineas', lineasINY);

    alternarVacio('#emptyPPVC', VolumenPPVC === 0 && sumScrapKgPPVC === 0);
    alternarVacio('#emptyINY', VolumenINY === 0 && sumScrapKgINY === 0);

    pintarBadges();
}

function alternarVacio(selector, vacio) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.classList.toggle('is-hidden', !vacio);
}

function pintarBadges() {
    const hayPPVC = VolumenPPVC > 0 || sumScrapKgPPVC > 0;
    const hayINY = VolumenINY > 0 || sumScrapKgINY > 0;

    badgeObjetivo('#badgeSobrePeso', SobrePesoPPVC, objetivoSobrepesoPPVC, true, hayPPVC);
    badgeObjetivo('#badgeScrap', ScrapPtPPVC, objetivoScrapPPVC, true, hayPPVC);
    badgeObjetivo('#badgeSobrePesoINY', SobrePesoINY, objetivoSobrepesoINY, true, hayINY);
    badgeObjetivo('#badgeScrapINY', ScrapPtINY, objetivoScrapINY, true, hayINY);
}

function badgeObjetivo(selector, real, objetivo, menorEsMejor, hayDatos) {
    const el = document.querySelector(selector);
    if (!el) return;

    // Sin producción no tiene sentido comparar contra el objetivo.
    if (!hayDatos || !objetivo || objetivo <= 0) {
        el.className = 'inicio-badge is-hidden';
        el.innerText = '';
        return;
    }

    const cumple = menorEsMejor ? real <= objetivo : real >= objetivo;
    el.className = 'inicio-badge ' + (cumple ? 'inicio-badge-ok' : 'inicio-badge-alert');
    el.innerHTML = '<i class="fa ' + (cumple ? 'fa-check' : 'fa-exclamation-triangle') + '" aria-hidden="true"></i>'
        + (cumple ? 'Dentro del objetivo' : 'Fuera del objetivo');
}

// ── Graficas ─────────────────────────────────────────────────
function CrearGraficos() {
    if (typeof Highcharts === 'undefined') {
        aviso('Dashboard', 'No se cargó la librería de gráficas.');
        return;
    }

    aplicarTema();

    if (PPVCLINEAS.length > 0) {
        dibujarVolumen('VolumenesPPVC', PPVCLINEAS, PPVCVOLUMEN, NombresSkuPPVC);
        dibujarSobrepeso('SobrepesoPPVC', PPVCLINEAS, SobrepesoObjetivoPPVC, SobrePesoGrafPPVC);
        dibujarEficiencia('EficienciaPPVC', PPVCLINEAS, EficienciaGrafPPVC, NombresSkuPPVC);
        dibujarScrap('ScrapPPVC', PPVCLINEAS, ScrapKGPPVC, ScrapObjetivoPPVC, ScrapPorcentPPVC);
    }

    // Las gráficas de INY solo se crean cuando el proceso está visible.
    if (planta === '2' && INYLINEAS.length > 0) {
        dibujarVolumen('VolumenesINY', INYLINEAS, INYVOLUMEN, NombresSkuINY);
        dibujarSobrepeso('SobrepesoIny', INYLINEAS, SobrepesoObjetivoINY, SobrePesoGrafINY);
        dibujarEficiencia('EficienciaIny', INYLINEAS, EficienciaGrafINY, NombresSkuINY);
        dibujarScrap('ScrapIny', INYLINEAS, ScrapKGINY, ScrapObjetivoINY, ScrapPorcentINY);
    }

    mostrarLoader(false);
}

function aplicarTema() {
    Highcharts.setOptions({
        chart: {
            backgroundColor: 'transparent',
            style: { fontFamily: "'Nunito', sans-serif" },
            spacing: [12, 14, 14, 14]
        },
        title: {
            align: 'left',
            x: 4,
            y: 18,
            style: {
                color: COLOR.primario,
                fontSize: '14px',
                fontWeight: '700'
            }
        },
        credits: { enabled: false },
        exporting: { enabled: false },
        legend: {
            itemStyle: { color: '#4a5568', fontWeight: '600', fontSize: '12px' },
            itemHoverStyle: { color: COLOR.primario }
        },
        xAxis: {
            lineColor: '#e2e8f0',
            tickColor: '#e2e8f0',
            labels: { style: { color: COLOR.muted, fontSize: '11px' } },
            title: { style: { color: COLOR.muted, fontSize: '11px', fontWeight: '600' } }
        },
        yAxis: {
            gridLineColor: '#eef2f7',
            lineWidth: 0,
            labels: { style: { color: COLOR.muted, fontSize: '11px' } },
            title: { style: { color: COLOR.muted, fontSize: '11px', fontWeight: '600' } }
        },
        tooltip: {
            backgroundColor: '#ffffff',
            borderColor: '#dbe3ec',
            borderRadius: 8,
            shadow: true,
            style: { color: COLOR.texto, fontSize: '12px' }
        },
        plotOptions: {
            series: {
                animation: { duration: 500 },
                states: { hover: { lineWidthPlus: 0 } }
            }
        }
    });
}

function destruirGrafica(id) {
    const contenedor = document.getElementById(id);
    if (!contenedor) return;

    const existente = (Highcharts.charts || []).find(function (chart) {
        return chart && chart.renderTo === contenedor;
    });

    if (existente) {
        existente.destroy();
    }
}

function dibujarVolumen(id, lineas, volumen, codigos) {
    destruirGrafica(id);

    Highcharts.chart(id, {
        chart: { type: 'column' },
        title: { text: 'Volumen por línea (kg)' },
        xAxis: {
            categories: lineas,
            crosshair: true,
            title: { text: null }
        },
        yAxis: {
            min: 0,
            title: { text: 'Kilogramos' }
        },
        legend: { enabled: false },
        tooltip: {
            formatter: function () {
                const codigo = codigos[this.point.index] || '';
                return '<b>' + codigo + '</b><br/>Línea ' + this.x + ': <b>'
                    + Highcharts.numberFormat(this.y, 2) + ' kg</b>';
            }
        },
        plotOptions: {
            column: {
                borderWidth: 0,
                borderRadius: 6,
                maxPointWidth: 46,
                color: COLOR.primario
            }
        },
        series: [{
            name: 'Volumen',
            data: volumen
        }]
    });
}

function dibujarSobrepeso(id, lineas, objetivo, real) {
    destruirGrafica(id);

    Highcharts.chart(id, {
        chart: { type: 'line' },
        title: { text: 'Sobrepeso por línea (%)' },
        xAxis: {
            categories: lineas,
            title: { text: null }
        },
        yAxis: {
            title: { text: 'Porcentaje' },
            labels: { format: '{value}%' }
        },
        tooltip: {
            shared: true,
            valueSuffix: ' %'
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        return Highcharts.numberFormat(this.y, 2) + ' %';
                    },
                    style: {
                        color: '#4a5568',
                        fontSize: '10px',
                        fontWeight: '600',
                        textOutline: 'none'
                    }
                }
            }
        },
        series: [{
            name: 'Objetivo',
            data: objetivo,
            color: COLOR.objetivo,
            dashStyle: 'ShortDash',
            lineWidth: 2,
            marker: { enabled: false }
        }, {
            name: 'Real',
            data: real,
            color: COLOR.primario,
            lineWidth: 3,
            marker: { radius: 4, symbol: 'circle' }
        }]
    });
}

function dibujarEficiencia(id, lineas, datos, codigos) {
    destruirGrafica(id);

    Highcharts.chart(id, {
        chart: { type: 'bar' },
        title: { text: 'Eficiencia por línea (%)' },
        xAxis: {
            categories: lineas,
            title: { text: null }
        },
        yAxis: {
            min: 0,
            title: { text: 'Porcentaje' },
            labels: { format: '{value}%' }
        },
        legend: { enabled: false },
        tooltip: {
            formatter: function () {
                const codigo = codigos[this.point.index] || '';
                return '<b>' + codigo + '</b><br/>Línea ' + this.point.category + ': <b>'
                    + Highcharts.numberFormat(this.x, 2) + ' %</b>';
            }
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                color: COLOR.verde,
                maxPointWidth: 30,
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        return Highcharts.numberFormat(this.x, 2) + ' %';
                    },
                    style: {
                        color: '#4a5568',
                        fontSize: '10px',
                        fontWeight: '600',
                        textOutline: 'none'
                    }
                }
            }
        },
        series: [{
            name: 'Eficiencia',
            data: datos
        }]
    });
}

function dibujarScrap(id, lineas, kg, objetivo, porcentaje) {
    destruirGrafica(id);

    Highcharts.chart(id, {
        chart: { zooming: { type: 'xy' } },
        title: { text: 'Scrap por línea' },
        xAxis: [{
            categories: lineas,
            crosshair: true,
            title: { text: null }
        }],
        yAxis: [{ // Porcentaje
            opposite: true,
            min: 0,
            title: { text: 'Scrap (%)' },
            labels: { format: '{value}%' }
        }, { // Kilogramos
            gridLineWidth: 0,
            min: 0,
            title: { text: 'Scrap (kg)' },
            labels: { format: '{value} kg' }
        }, { // Objetivo
            gridLineWidth: 0,
            opposite: true,
            min: 0,
            title: { text: 'Objetivo (%)' },
            labels: { format: '{value} %' }
        }],
        tooltip: { shared: true },
        legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'top',
            y: 4
        },
        series: [{
            name: 'Scrap (kg)',
            type: 'column',
            yAxis: 1,
            data: kg,
            color: COLOR.ambar,
            borderRadius: 4,
            maxPointWidth: 40,
            tooltip: { valueSuffix: ' kg' }
        }, {
            name: 'Scrap objetivo',
            type: 'spline',
            yAxis: 2,
            data: objetivo,
            color: COLOR.objetivo,
            dashStyle: 'ShortDot',
            lineWidth: 2,
            marker: { enabled: false },
            tooltip: { valueSuffix: ' %' }
        }, {
            name: 'Scrap (%)',
            type: 'spline',
            yAxis: 0,
            data: porcentaje,
            color: COLOR.rojo,
            lineWidth: 3,
            marker: { radius: 4, symbol: 'circle' },
            tooltip: { valueSuffix: ' %' }
        }],
        responsive: {
            rules: [{
                condition: { maxWidth: 560 },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom',
                        y: 0
                    },
                    yAxis: [{}, {}, { visible: false }]
                }
            }]
        }
    });
}

// ── Objetivos ────────────────────────────────────────────────
function ActualizarObjetivosData(plantaActual, proceso, sobrepesoObj, scrapObj) {
    const data = {
        planta: plantaActual,
        proceso: proceso,
        Sobrepeso: sobrepesoObj,
        Scrap: scrapObj
    };

    mostrarLoader(true);

    fetch('/Inicio/ActualizaObj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify(data)
    })
        .then(function (response) {
            return response.ok ? response.json() : Promise.reject(response);
        })
        .then(function (jsonData) {
            if (jsonData.status != 200) {
                throw new Error(jsonData.response || 'Respuesta inválida');
            }

            iziToast.success({
                position: 'topRight',
                title: 'Sobrepeso y scrap objetivos',
                message: '<p>Objetivos actualizados</p>'
            });

            // Recargamos los datos sin refrescar toda la página.
            mostrarLoader(false);
            cargarDashboard({ silencioso: true });
        })
        .catch(function (error) {
            console.error(error);
            mostrarLoader(false);
            aviso('Objetivos', 'No se actualizaron los datos correctamente.');
        });
}

$(document).on('click', '#BtnUpdateObjPPVC', function () {
    const sobrepeso = $('#SobrepesoObj').val();
    const scrap = $('#ScrapObj').val();

    if (sobrepeso === '' || scrap === '') {
        aviso('Datos incompletos', 'Asegúrate de que el sobrepeso y el scrap objetivo no estén vacíos.');
        return;
    }

    ActualizarObjetivosData(planta, 'PPVC', sobrepeso, scrap);
});

$(document).on('click', '#BtnUpdateObjINY', function () {
    const sobrepeso = $('#SobrepesoObjINY').val();
    const scrap = $('#ScrapObjINY').val();

    if (sobrepeso === '' || scrap === '') {
        aviso('Datos incompletos', 'Asegúrate de que el sobrepeso y el scrap objetivo no estén vacíos.');
        return;
    }

    ActualizarObjetivosData(planta, 'INY', sobrepeso, scrap);
});

// Limitamos los inputs a números con máximo 3 decimales.
$(document).ready(function () {
    $('#SobrepesoObj, #ScrapObj, #SobrepesoObjINY, #ScrapObjINY').on('input', function () {
        const valor = $(this).val();
        if (!/^\d*\.?\d{0,3}$/.test(valor)) {
            $(this).val(valor.slice(0, -1));
        }
    });
});

// ── Carrusel ─────────────────────────────────────────────────
let swiperPPVC;
let swiperINY;

function iniciarSwipers() {
    if (typeof Swiper === 'undefined') return;

    swiperPPVC = new Swiper('#swiperPPVC', {
        navigation: {
            nextEl: '#swiperPPVC .swiper-button-next',
            prevEl: '#swiperPPVC .swiper-button-prev'
        },
        scrollbar: {
            el: '#swiperPPVC .swiper-scrollbar'
        },
        direction: 'horizontal',
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false
        }
    });

    swiperINY = new Swiper('#swiperINY', {
        navigation: {
            nextEl: '#swiperINY .swiper-button-next',
            prevEl: '#swiperINY .swiper-button-prev'
        },
        scrollbar: {
            el: '#swiperINY .swiper-scrollbar'
        },
        direction: 'horizontal',
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false
        }
    });

    // Pausamos el autoplay al pasar el mouse sobre cada carrusel.
    [swiperPPVC, swiperINY].forEach(function (swiper, i) {
        const el = document.getElementById(i === 0 ? 'swiperPPVC' : 'swiperINY');
        if (!el || !swiper) return;

        el.addEventListener('mouseover', function () {
            swiper.autoplay.stop();
        });
        el.addEventListener('mouseout', function () {
            swiper.autoplay.start();
        });
    });
}
