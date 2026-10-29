let planta;
let turno = obtenerTurno();
const loader = document.getElementById('loaderDiv');
var VistaMolinos;

//Variables de Titulos
let VolumenMolienda = 0;
let KgHoraReal = 0;
let HorasDiferencia = 0;

//variables graficos
let MolinoLINEAS = [];
let MolinoVOLUMEN = [];
let KgHoraObjetivoMolino = [];
let KgHoraRealMolino = [];

//Paleta corporativa (misma que el resto del rediseño)
const COLOR_MOL = {
    primario: '#0058A1',
    objetivo: '#94a3b8',
    verde: '#2e7d32',
    texto: '#22303f',
    muted: '#6b7a8c'
};

//Nos aseguramos de que el switch se setee correctamente de acuerdo a la vista cargada
localStorage.setItem('VistaMolinosActiva', '1');

//funcion principal
$(document).ready(async () => {
    //verificamos si el switch debe o no estar activado
    var VistaMolinos = localStorage.getItem('VistaMolinosActiva');
    $("#SwitchMolino").prop("checked", VistaMolinos === '1');

    //pintamos turno y fecha y traemos los datos
    pintarFechaMolinos();
    cargarDashboardMolinos();
})

// ── Utilidades ───────────────────────────────────────────────
function formatearMolinos(valor, decimales) {
    const n = parseFloat(valor);
    if (!isFinite(n)) return '--';
    return n.toLocaleString('en-US', {
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales
    });
}

function mostrarLoaderMolinos(visible) {
    if (loader) loader.style.display = visible ? 'flex' : 'none';
}

function mostrarVacioMolinos(visible) {
    const vacio = document.getElementById('molEmpty');
    if (!vacio) return;
    vacio.classList.toggle('is-hidden', !visible);
}


function fechaHoyMolinos() {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function pintarFechaMolinos() {
    const etiqueta = document.getElementById('molFecha');
    if (!etiqueta) return;
    const hoy = new Date();
    const day = String(hoy.getDate()).padStart(2, '0');
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    etiqueta.innerText = `${day}/${month}/${hoy.getFullYear()}`;
}

function destruirGraficaMolinos(id) {
    const contenedor = document.getElementById(id);
    if (!contenedor) return;
    const existente = (Highcharts.charts || []).find(function (chart) {
        return chart && chart.renderTo === contenedor;
    });
    if (existente) existente.destroy();
}

// ── Carga / recarga del dashboard ────────────────────────────
function cargarDashboardMolinos() {
    turno = obtenerTurno();
    const etiquetaTurno = document.getElementById('labelTurno');
    if (etiquetaTurno) etiquetaTurno.innerText = turno;

    pintarFechaMolinos();

    //obtenemos la planta
    localStorage.planta == '335' ? planta = '2' : planta = '1';

    const fechaHoy = fechaHoyMolinos();

    //reseteamos los acumulados para que el refresh no sume dos veces
    MolinoLINEAS = [];
    MolinoVOLUMEN = [];
    KgHoraObjetivoMolino = [];
    KgHoraRealMolino = [];
    VolumenMolienda = 0;
    KgHoraReal = 0;
    HorasDiferencia = 0;

    $("#volumenMolinos").text('--');
    $("#KgHoraMolino").text('--');
    mostrarVacioMolinos(false);

    ObtenerDatosMolinos(planta, turno, fechaHoy, fechaHoy);
}

//obtenemos los datos de los titulos y graficos, posterior se dibujan los datos
function ObtenerDatosMolinos(planta, turno, FechaInicioDashboard, FechaFinDashboard) {

    mostrarLoaderMolinos(true);

    //armamos los datos que enviaremos al controler
    let data = {
        "Planta": planta,
        "Turno": turno,
        "FechaInicio": FechaInicioDashboard,
        "FechaFin": FechaFinDashboard
    }

    fetch("/Molinos/DatosDashboard", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify(data)
    }).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            return response.json().then((errorData) => {
                // Si la respuesta no es 200,
                return Promise.reject(errorData.message || "Error en la solicitud dentro del controlador");
            });
        }
    }).then((jsonData) => {
        // revisamos que los datos devueltos sean válidos
        const DataJson = JSON.parse(jsonData.data)
        const DashboardData = DataJson.dashboardData || [];

        for (let i = 0; i < DashboardData.length; i++) {

            //lenamos los datos de los graficos
            MolinoLINEAS.push(DashboardData[i].molino);
            MolinoVOLUMEN.push(Number(DashboardData[i].pesoTot) || 0);
            KgHoraObjetivoMolino.push(Number(DashboardData[i].kgHoraObjetivo) || 0);
            KgHoraRealMolino.push(Number(DashboardData[i].kGxHora) || 0);

            //sumamos los volumenes para obtener el total para el titulo
            VolumenMolienda += Number(DashboardData[i].pesoTot) || 0;
            HorasDiferencia = Number(DashboardData[i].horasDif) || 0;
        }

        //evitamos divisiones entre cero o valores no numericos
        KgHoraReal = HorasDiferencia > 0 ? VolumenMolienda / HorasDiferencia : 0;

        //Si no hay datos: se muestran las tarjetas vacias con el aviso
        if (DashboardData.length == 0) {
            $("#volumenMolinos").text('--');
            $("#KgHoraMolino").text('--');
            mostrarVacioMolinos(true);
            CrearGraficos();
            return;
        }

        //llenamos la cabecera (titulos) [con formato de separacion con "coma" para los miles y "punto" con 2 decimales]
        $("#volumenMolinos").text(formatearMolinos(VolumenMolienda, 2));
        $("#KgHoraMolino").text(formatearMolinos(KgHoraReal, 2));
        mostrarVacioMolinos(false);

        //dibujamos los graficos ya que tenemos los datos
        CrearGraficos();

        if (typeof swiperPPVC !== 'undefined' && swiperPPVC) swiperPPVC.update();
    }).catch((error) => {
        console.error("Error en la solicitud ObtenerDatosMolinos:", error);
        $("#volumenMolinos").text('--');
        $("#KgHoraMolino").text('--');
        mostrarVacioMolinos(true);
        mostrarLoaderMolinos(false);
        iziToast.error({
            position: "topRight",
            title: `NO SE ENCONTRARON DATOS`,
            message: `<p>Motivo: ${error}</p>`,
        });
    });

}

function obtenerTurno() {
    var horaInicio = new Date();
    horaInicio.setHours(5, 45, 1);
    var horaFin = new Date();
    horaFin.setHours(17, 45, 0);

    // Obtener la hora actual
    var horaActual = new Date();

    // Establecer los segundos a cero en la hora actual
    horaActual.setSeconds(0);

    // Comparar si la hora actual está dentro del rango de horas
    if (horaActual >= horaInicio && horaActual <= horaFin) {
        return 1
    } else {
        return 2
    }
}

//Tema claro para sobrescribir el tema oscuro global de Highcharts
function aplicarTemaMolinos() {
    Highcharts.setOptions({
        lang: {
            noData: 'Sin información para el turno actual'
        },
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
                color: COLOR_MOL.primario,
                fontSize: '13px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
            }
        },
        subtitle: { style: { color: COLOR_MOL.muted } },
        xAxis: {
            lineColor: '#e2e8f0',
            tickColor: '#e2e8f0',
            labels: { style: { color: COLOR_MOL.texto, fontSize: '12px' } },
            title: { style: { color: COLOR_MOL.muted, fontSize: '11px', fontWeight: '600' } }
        },
        yAxis: {
            gridLineColor: '#eef2f7',
            lineColor: '#e2e8f0',
            tickColor: '#e2e8f0',
            labels: { style: { color: COLOR_MOL.texto, fontSize: '12px' } },
            title: { style: { color: COLOR_MOL.muted, fontSize: '11px', fontWeight: '600' } }
        },
        legend: {
            itemStyle: { color: '#4a5568', fontWeight: '600', fontSize: '12px' },
            itemHoverStyle: { color: COLOR_MOL.texto }
        },
        tooltip: {
            backgroundColor: '#ffffff',
            borderColor: '#dbe3ec',
            borderRadius: 8,
            style: { color: COLOR_MOL.texto, fontSize: '12px' }
        },
        plotOptions: {
            series: {
                animation: { duration: 500 },
                states: { hover: { lineWidthPlus: 0 } }
            }
        },
        credits: { enabled: false }
    });
}

function CrearGraficos() {
    aplicarTemaMolinos();

    //--Grafica De Volumenes Molinos
    destruirGraficaMolinos('VolumenesMolino');

    Highcharts.chart('VolumenesMolino', {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Volumen por molino (kg)'
        },
        xAxis: {
            categories: MolinoLINEAS,
            title: {
                text: 'Molinos'
            }
        },
        yAxis: [{
            min: 0,
            allowDecimals: true, // Permitir decimales
            title: {
                text: 'Volumen en kg'
            }
        }],
        legend: {
            shadow: false
        },
        tooltip: {
            shared: true,
            formatter: function () {
                var index = this.point.index;
                return '<b>' + MolinoLINEAS[index] + '</b>: ' +
                    formatearMolinos(this.y, 2) + ' kg';
            }
        },
        plotOptions: {
            column: {
                grouping: false,
                borderWidth: 0,
                borderRadius: 4,
                color: COLOR_MOL.primario
            }
        },
        series: [{
            name: 'Volumen',
            color: COLOR_MOL.primario,
            data: MolinoVOLUMEN,
            pointPadding: 0,
            pointPlacement: 0
        }]
    });

    //--Grafica De Kg/Hora Molinos
    destruirGraficaMolinos('KgHoraMoloinos');

    Highcharts.chart('KgHoraMoloinos', {
        chart: {
            type: 'spline'
        },
        title: {
            text: 'Kg / hora por molino'
        },
        xAxis: {
            categories: MolinoLINEAS,
            title: {
                text: 'Molinos'
            }
        },
        yAxis: {
            title: {
                text: 'Kg / hora'
            },
            labels: {
                format: '{value}'
            }
        },
        tooltip: {
            crosshairs: true,
            shared: true,
            valueSuffix: ' kg/h'
        },
        plotOptions: {
            spline: {
                marker: {
                    radius: 4,
                    lineColor: '#ffffff',
                    lineWidth: 1
                }
            }
        },
        series: [{
            name: 'kg/hr Objetivo',
            color: COLOR_MOL.objetivo,
            marker: {
                symbol: 'circle'
            },
            data: KgHoraObjetivoMolino
        }, {
            name: 'kg/hr Real',
            color: COLOR_MOL.verde,
            marker: {
                symbol: 'circle'
            },
            data: KgHoraRealMolino
        }]
    });

    mostrarLoaderMolinos(false);
}

//SWIPERS
//iniciamos el Swiper
const swiperPPVC = new Swiper('#swiperMolinos', {
    // Navigation arrows
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    // And if we need scrollbar
    scrollbar: {
        el: '.swiper-scrollbar',
    },

    // Optional parameters
    direction: 'horizontal',
    loop: true,

    // If we need pagination
    pagination: {
        el: '.swiper-pagination',
    },
    autoplay: {
        delay: 5000, // tiempo de espera entre cada transición en milisegundos
        disableOnInteraction: false, // si el usuario interactúa con el swiper, detener la reproducción automática
    },
});


//activamos y desactivamos el autoplay dependiendo la posicion del mouse
var swiperContainer = document.querySelector('.swiper-wrapper');
swiperContainer.addEventListener('mouseover', function () {
    swiperPPVC.autoplay.stop();
});
swiperContainer.addEventListener('mouseout', function () {
    swiperPPVC.autoplay.start();
});

//------------ACTIONS
//btn cambiar a pvc
$(document).on("click", "#SwitchMolino", function () {
    if (this.checked) {
        console.log('El switch está encendido, la vista es de molinos');

    } else {
        console.log('El switch está apagado la vista es de pvc');
        //guardamos en la variable de localstorage y nos vamos a la vista de molinos despues de 1 segundo
        localStorage.setItem('VistaMolinosActiva', '0');
        //Cambiamos el valor de VistaMolinosActiva para cambiar de vista y layout
        var valor = "0";
        $.ajax({
            url: '../Login/CambiarVistaMolinos',
            type: 'POST',
            data: { valor: valor },
            success: function (response) {
                if (response.success) {
                    //console.log('VistaMolinosActiva actualizada con éxito en sesión');
                    if (valor === "0") {
                        //console.log("El valor de la variable cambio a 0")
                        // Redirigimos después de 1 segundo
                        setTimeout(function () {
                            window.location.replace("../Inicio/Index")
                        }, 1000);
                    } else {
                        //console.log("El valor de la variable NO CAMBIO");
                    }
                }
            },
            error: function (xhr, status, error) {
                console.error("Error al actualizar VistaMolinosActiva:", error);
            }
        });
    }
});
