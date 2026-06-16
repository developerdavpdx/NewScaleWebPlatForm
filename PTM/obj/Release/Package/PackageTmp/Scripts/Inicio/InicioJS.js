//Variables de Graficas PPVC
//variables para la grafica de volumenes
let PPVCLINEAS = [];
let PPVCVOLUMEN = [];
let NombresSkuPPVC = []; //aqui guardamos los nombres de los codigos
//variables para la grafica de sobrepeso
let SobrepesoObjetivoPPVC = [];
let SobrePesoGrafPPVC = [];
//variables para la grafica de scrap
let ScrapKGPPVC = [];
let ScrapPorcentPPVC = [];
let ScrapObjetivoPPVC = [];
//variables para la grafica de eficiencia
let EficienciaGrafPPVC = [];

//Variables de Graficas INY
//variables para la grafica de volumenes
let INYLINEAS = [];
let INYVOLUMEN = [];
let NombresSkuINY = []; //aqui guardamos los nombres de los codigos
//variables para la grafica de sobrepeso
let SobrepesoObjetivoINY = [];
let SobrePesoGrafINY = [];
//variables para la grafica de scrap
let ScrapKGINY = [];
let ScrapPorcentINY = [];
let ScrapObjetivoINY = [];
//variables para la grafica de eficiencia
let EficienciaGrafINY = [];

let planta;
let turno;
let SobrepesoObjActual;
let ScrapObjActual;
const loader = document.getElementById('loaderDiv')

//Variables de Titulos PPVC
let VolumenPPVC = 0;
let SobrePesoPPVC = 0;
let EficienciaPPVC = 0;
let ScrapPtPPVC = 0
let PesoEstandarPPVC = 0;
let kgPproductoPPVC = 0;
let sumScrapKgPPVC = 0;
//Variables de Titulos INY
let VolumenINY = 0;
let SobrePesoINY = 0;
let EficienciaINY = 0;
let ScrapPtINY = 0
let PesoEstandarINY = 0;
let kgPproductoINY = 0;
let sumScrapKgINY = 0;


//imprimimos el turno correspondiente al inicio
turno = obtenerTurno();
document.getElementById("labelTurno").innerText = turno;

//funcion principal
$(function () {
    loader.style.display = "flex"
    // obtenemos la planta
    localStorage.planta == '335' ? planta = '2' : planta = '1';
    //referenciamos los contenedores de inyeccion y ppvc que mostraremos o no de acuerdo a la planta (planta 1 no mostrara INY)
    const divObjINY = document.getElementById('DivObjetivosINY'); //div objetivos
    const divTitulosINY = document.getElementById('DivTitulosINY') //div Titulos
    const divSwiperINY = document.getElementById('swiperINY') //div Swiper (graficas)
    const divTitleIny = document.getElementById('TitleIny') //div Swiper (graficas)
    //mostramos u ocultamos de acuerdo a la planta
    if (planta === '1') {
        divObjINY.setAttribute("style", "display: none !important;");  // Oculta el div de INY objetivos
        divTitulosINY.setAttribute("style", "display: none !important;");  // Oculta el div de INY objetivos
        divSwiperINY.setAttribute("style", "display: none !important;");  // Oculta el div de INY objetivos
        divTitleIny.setAttribute("style", "display: none !important;");  // Oculta el div de INY Titulo container
    }

    // obtenemos los datos de los titulos
     ObtenerDatosPPVC(planta);
     ObtenerDatosINY(planta);
    // obtenemos los datos de los graficos
    ObtenerDatosGraficasPPVC(planta, turno);
    
});

function ObtenerDatosPPVC(planta) {

    //obtenemos los datos de los titulos para PPVC
    let data = {
        "planta": planta,
        "proceso": "PPVC"
    }
    fetch("/ProductoTerminado/GetAllPtPvc", {       //obtenerProductosTerminados
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        if (jsonData.status = 200) {
            let pvcJson = JSON.parse(jsonData.data)
            let productotermPvc = pvcJson.reportesProdTerm

            for (x = 0; x < productotermPvc.length; x++) {

                VolumenPPVC += productotermPvc[x].pesoTotal;
                sumScrapKgPPVC += productotermPvc[x].scrapTotal;
                PesoEstandarPPVC = PesoEstandarPPVC + (productotermPvc[x].pUnitEstandar * productotermPvc[x].numTubos)   //<<--- calculo del peso total estandar
                kgPproductoPPVC += (productotermPvc[x].kgPproducto * productotermPvc[x].horasTrabajo);
            }

            //calculamos el sobrepeso
            SobrePesoPPVC = (VolumenPPVC === 0 && PesoEstandarPPVC === 0) ? 0 : ((VolumenPPVC / PesoEstandarPPVC) - 1) * 100;
            //calculamos la eficiencia
            EficienciaPPVC = (VolumenPPVC === 0 && kgPproductoPPVC === 0) ? 0 : (VolumenPPVC / kgPproductoPPVC) * 100;
            //Calculamos el scrap porcentual
            ScrapPtPPVC = (sumScrapKgPPVC === 0 && VolumenPPVC === 0) ? 0 : (sumScrapKgPPVC / (sumScrapKgPPVC + VolumenPPVC)) * 100;

            //llenamos la cabecera
            $("#volumenInfo").text(`${VolumenPPVC.toFixed(2)}`);
            $("#infoSobrePeso").text(`${SobrePesoPPVC.toFixed(2)} %`);
            $("#eficicienciaInfo").text(`${EficienciaPPVC.toFixed(2)} %`);
            $("#scrapInfo").text(`${ScrapPtPPVC.toFixed(2)} %`);

        }
    }).catch((error) => {
        console.log(error.toString())
    })

}

function ObtenerDatosINY(planta) {

    //obtenemos los datos de los titulos para INY
    let data = {
        "planta": planta,
        "proceso": "INY"
    }
    fetch("/ProductoTerminado/GetAllPtPvc", {       //obtenerProductosTerminados
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        if (jsonData.status = 200) {
            let pvcJson = JSON.parse(jsonData.data)
            let productotermIny = pvcJson.reportesProdTerm

            for (x = 0; x < productotermIny.length; x++) {

                VolumenINY += productotermIny[x].pesoTotal;
                sumScrapKgINY += productotermIny[x].scrapTotal;
                PesoEstandarINY = PesoEstandarINY + (productotermIny[x].pUnitEstandar * productotermIny[x].numTubos)   //<<--- calculo del peso total estandar
                kgPproductoINY += (productotermIny[x].kgPproducto * productotermIny[x].horasTrabajo);
            }

            //calculamos el sobrepeso
            //SobrePesoINY = ((VolumenINY / PesoEstandarINY) - 1) * 100;
            SobrePesoINY = (VolumenINY === 0 && PesoEstandarINY === 0) ? 0 : ((VolumenINY / PesoEstandarINY) - 1) * 100;
            //calculamos la eficiencia
            //EficienciaINY = (VolumenINY / kgPproductoINY) * 100;
            EficienciaINY = (VolumenINY === 0 && kgPproductoINY === 0) ? 0 : (VolumenINY / kgPproductoINY) * 100;
            //Calculamos el scrap porcentual
            //ScrapPtINY = (sumScrapKgINY / (sumScrapKgINY + VolumenINY)) * 100;
            ScrapPtINY = (sumScrapKgINY === 0 && VolumenINY === 0) ? 0 : (sumScrapKgINY / (sumScrapKgINY + VolumenINY)) * 100;

            //llenamos la cabecera
            $("#volumenInfoINY").text(`${VolumenINY.toFixed(2)}`);
            $("#infoSobrePesoINY").text(`${SobrePesoINY.toFixed(2)} %`);
            $("#eficicienciaInfoINY").text(`${EficienciaINY.toFixed(2)} %`);
            $("#scrapInfoINY").text(`${ScrapPtINY.toFixed(2)} %`);

        }
    }).catch((error) => {
        console.log(error.toString())
    })
}

//obtenemos el turno de acuerdo a la hora actual
function obtenerTurno() {
            var horaInicio = new Date();
            horaInicio.setHours(4, 30, 0);
            var horaFin = new Date();
            horaFin.setHours(16, 30, 0);

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

function CrearGraficos() {
    //GRAFICAS PPVC
    //--Grafica De Volumenes PPVC
    Highcharts.setOptions({
        colors: ['#6c757d', '#adb5bd'],
    });

    Highcharts.chart('VolumenesPPVC', {
        chart: {
            type: 'column'
        },
        title: {
            text: 'VOLUMEN POR LINEA (KG)'
        },
        xAxis: {
            categories: PPVCLINEAS,
            title: {
                text: 'Lineas',
                style: {
                    fontSize: '15px'
                }
            }

        },
        yAxis: [{
            min: 0,
            allowDecimals: true, // Permitir decimales
            title: {
                text: 'Volumne en kg',
                style: {
                    fontSize: '15px'
                }
            }
        }],
        legend: {
            shadow: false
        },
        tooltip: {
            shared: true,
            formatter: function () {
                var index = this.point.index;
                return '<b>' + NombresSkuPPVC[index] + '</b>: ' + this.y + ' kg';
            }
        },
        plotOptions: {
            column: {
                grouping: false,
                shadow: true,
                borderWidth: 0
            }
        },
        series: [{
            name: 'Volumen',
            data: PPVCVOLUMEN,
            pointPadding: 0,
            pointPlacement: 0
        }]
    });

    //--Grafica De Sobrepeso PPVC
    Highcharts.setOptions({
        colors: ['#d66249', '#4981d6'],
    });

    Highcharts.chart('SobrepesoPPVC', {
        chart: {
            type: 'line'
        },
        title: {
            text: 'SOBREPESO POR LINEA (%)'
        },
        xAxis: {
            categories: PPVCLINEAS,
            title: {
                text: 'Lineas',
                style: {
                    fontSize: '15px'
                }
            }
        },
        yAxis: {
            title: {
                text: '%'
            }
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: false
            }
        },
        series: [{
            name: 'Sobrepeso Objetivo',
            data: SobrepesoObjetivoPPVC
        }, {
            name: 'Sobrepeso Real',
            data: SobrePesoGrafPPVC
        }]
    });

    //--Grafica De Eficiencia PPVC
    Highcharts.chart('EficienciaPPVC', {
        chart: {
            type: 'bar'
        },
        title: {
            text: 'EFICIENCIA POR LINEA (%)'
        },
        xAxis: {
            categories: PPVCLINEAS,
            title: {
                text: 'Lineas',
                style: {
                    fontSize: '15px'
                }
            },
            gridLineWidth: 1,
            lineWidth: 0
        },
        yAxis: {
            min: 0,
            title: {
                text: '',
                align: 'high'
            },
            labels: {
                overflow: 'justify'
            },
            gridLineWidth: 0
        },
        tooltip: {
            formatter: function () {
                var index = this.point.index;
                return '<b>' + NombresSkuPPVC[index] + '</b>: ' + this.y + ' %';
            }
        },
        plotOptions: {
            bar: {
                borderRadius: '50%',
                dataLabels: {
                    enabled: true
                },
                groupPadding: 0.1
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            x: -10,
            y: 20,
            floating: true,
            borderWidth: 1,
            backgroundColor:
                Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF',
            shadow: true
        },
        credits: {
            enabled: false
        },
        series: [{
            name: '% Eficiencia real',
            data: EficienciaGrafPPVC
        }]
    });
    //--Grafica De Scrap PPVC
    Highcharts.setOptions({
        colors: ['#6c757d', '#d66249', '#4981d6'],
    });
    Highcharts.chart('ScrapPPVC', {
        chart: {
            zooming: {
                type: 'xy'
            }
        },
        title: {
            text: 'SCRAP POR LINEA',
            align: 'left'
        },
        xAxis: [{
            categories: PPVCLINEAS,
            crosshair: true,
            title: {
                text: 'Lineas',
                style: {
                    fontSize: '15px'
                }
            }
        }],
        yAxis: [{ // Primary yAxis
            labels: {
                format: '{value}%',
                style: {
                    color: Highcharts.getOptions().colors[2]
                }
            },
            title: {
                text: 'Scrap (%)',
                style: {
                    color: Highcharts.getOptions().colors[2]
                }
            },
            opposite: true

        }, { // Secondary yAxis
            gridLineWidth: 0,
            title: {
                text: 'Scrap (Kg)',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            labels: {
                format: '{value} Kg',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            }

        }, { // Tertiary yAxis
            gridLineWidth: 0,
            title: {
                text: 'Scrap Objetivo',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            },
            labels: {
                format: '{value} %',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            },
            opposite: true
        }],
        tooltip: {
            shared: true
        },
        legend: {
            layout: 'vertical',
            align: 'left',
            x: 80,
            verticalAlign: 'top',
            y: 55,
            floating: true,
            backgroundColor:
                Highcharts.defaultOptions.legend.backgroundColor || // theme
                'rgba(255,255,255,0.25)'
        },
        series: [{
            name: 'Scrap (Kg)',
            type: 'column',
            yAxis: 1,
            data: ScrapKGPPVC,
            tooltip: {
                valueSuffix: ' Kg'
            }

        }, {
            name: 'Scrap Objetivo',
            type: 'spline',
            yAxis: 2,
            data: ScrapObjetivoPPVC,
            marker: {
                enabled: false
            },
            dashStyle: 'shortdot',
            tooltip: {
                valueSuffix: ' %'
            }

        }, {
            name: 'Scrap (%)',
            type: 'spline',
            data: ScrapPorcentPPVC,
            tooltip: {
                valueSuffix: ' %'
            }
        }],
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        floating: false,
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom',
                        x: 0,
                        y: 0
                    },
                    yAxis: [{
                        labels: {
                            align: 'right',
                            x: 0,
                            y: -6
                        },
                        showLastLabel: false
                    }, {
                        labels: {
                            align: 'left',
                            x: 0,
                            y: -6
                        },
                        showLastLabel: false
                    }, {
                        visible: false
                    }]
                }
            }]
        }
    });

    //GRAFICAS INYECCION
    //--Grafica De Volumenes INY
    Highcharts.setOptions({
        colors: ['#6c757d', '#adb5bd'],
    });

    Highcharts.chart('VolumenesINY', {
        chart: {
            type: 'column'
        },
        title: {
            text: 'VOLUMEN POR LINEA (KG)'
        },
        xAxis: {
            categories: INYLINEAS,
            title: {
                text: 'Lineas',
                style: {
                    fontSize: '15px'
                }
            }

        },
        yAxis: [{
            min: 0,
            allowDecimals: true, // Permitir decimales
            title: {
                text: 'Volumne en kg',
                style: {
                    fontSize: '15px'
                }
            }
        }],
        legend: {
            shadow: false
        },
        tooltip: {
            shared: true,
            formatter: function () {
                var index = this.point.index;
                return '<b>' + NombresSkuINY[index] + '</b>: ' + this.y + ' kg';
            }
        },
        plotOptions: {
            column: {
                grouping: false,
                shadow: true,
                borderWidth: 0
            }
        },
        series: [{
            name: 'Volumen',
            data: INYVOLUMEN,
            pointPadding: 0,
            pointPlacement: 0
        }]
    });
    //--Grafica De Sobrepeso INY
    Highcharts.setOptions({
        colors: ['#d66249', '#4981d6'],
    });

    Highcharts.chart('SobrepesoIny', {
        chart: {
            type: 'line'
        },
        title: {
            text: 'SOBREPESO POR LINEA (%)'
        },
        xAxis: {
            categories: INYLINEAS,
            title: {
                text: 'Lineas',
                style: {
                    fontSize: '15px'
                }
            }
        },
        yAxis: {
            title: {
                text: '%'
            }
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: false
            }
        },
        series: [{
            name: 'Sobrepeso Objetivo',
            data: SobrepesoObjetivoINY
        }, {
            name: 'Sobrepeso Real',
            data: SobrePesoGrafINY
        }]
    });

    //--Grafica De Eficiencia INY
    Highcharts.chart('EficienciaIny', {
        chart: {
            type: 'bar'
        },
        title: {
            text: 'EFICIENCIA POR LINEA (%)'
        },
        xAxis: {
            categories: INYLINEAS,
            title: {
                text: 'Lineas',
                style: {
                    fontSize: '15px'
                }
            },
            gridLineWidth: 1,
            lineWidth: 0
        },
        yAxis: {
            min: 0,
            title: {
                text: '',
                align: 'high'
            },
            labels: {
                overflow: 'justify'
            },
            gridLineWidth: 0
        },
        tooltip: {
            formatter: function () {
                var index = this.point.index;
                return '<b>' + NombresSkuINY[index] + '</b>: ' + this.y + ' %';
            }
        },
        plotOptions: {
            bar: {
                borderRadius: '50%',
                dataLabels: {
                    enabled: true
                },
                groupPadding: 0.1
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            x: -10,
            y: 20,
            floating: true,
            borderWidth: 1,
            backgroundColor:
                Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF',
            shadow: true
        },
        credits: {
            enabled: false
        },
        series: [{
            name: '% Eficiencia real',
            data: EficienciaGrafINY
        }]
    });
    //--Grafica De Scrap PPVC
    Highcharts.chart('ScrapIny', {
        chart: {
            zooming: {
                type: 'xy'
            }
        },
        title: {
            text: 'SCRAP POR LINEA'
        },
        xAxis: [{
            categories: INYLINEAS,
            crosshair: true
        }],
        yAxis: [{ // Primary yAxis
            labels: {
                format: '{value}%',
                style: {
                    color: Highcharts.getOptions().colors[2]
                }
            },
            title: {
                text: 'Scrap (%)',
                style: {
                    color: Highcharts.getOptions().colors[2]
                }
            },
            opposite: true

        }, { // Secondary yAxis
            gridLineWidth: 0,
            title: {
                text: 'Scrap (Kg)',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            labels: {
                format: '{value} Kg',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            }

        }, { // Tertiary yAxis
            gridLineWidth: 0,
            title: {
                text: 'Scrap Objetivo',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            },
            labels: {
                format: '{value} %',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            },
            opposite: true
        }],
        tooltip: {
            shared: true
        },
        legend: {
            layout: 'vertical',
            align: 'left',
            x: 80,
            verticalAlign: 'top',
            y: 55,
            floating: true,
            backgroundColor:
                Highcharts.defaultOptions.legend.backgroundColor || // theme
                'rgba(255,255,255,0.25)'
        },
        series: [{
            name: 'Scrap (Kg)',
            type: 'column',
            yAxis: 1,
            data: ScrapKGINY,
            tooltip: {
                valueSuffix: ' Kg'
            }

        }, {
            name: 'Scrap Objetivo',
            type: 'spline',
            yAxis: 2,
            data: ScrapObjetivoINY,
            marker: {
                enabled: false
            },
            dashStyle: 'shortdot',
            tooltip: {
                valueSuffix: ' %'
            }

        }, {
            name: 'Scrap (%)',
            type: 'spline',
            data: ScrapPorcentINY,
            tooltip: {
                valueSuffix: ' %'
            }
        }],
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        floating: false,
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom',
                        x: 0,
                        y: 0
                    },
                    yAxis: [{
                        labels: {
                            align: 'right',
                            x: 0,
                            y: -6
                        },
                        showLastLabel: false
                    }, {
                        labels: {
                            align: 'left',
                            x: 0,
                            y: -6
                        },
                        showLastLabel: false
                    }, {
                        visible: false
                    }]
                }
            }]
        }
    });

    //desactivamos el loader al terminar de cargar toda la info
    loader.style.display = "none"

}

//OBTENEMOS LOS DATOS PARA LAS GRAFICAS
function ObtenerDatosGraficasPPVC(planta, turno) {
    let data = {
        "planta": planta,
        "turno": turno,
        "proceso": "PPVC"
    }
     fetch("/Inicio/GetDataGraph", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        if (jsonData.status == 200) {
            let pvcVolumenJson = JSON.parse(jsonData.data)
            let KPISdatosVolumenesPvc = pvcVolumenJson.kpiSdatosVolumenes

            //asiganmos los valores a las variables
            for (x = 0; x < KPISdatosVolumenesPvc.length; x++) {
                //lineas
                PPVCLINEAS.push(KPISdatosVolumenesPvc[x].linea)
                // Asegurarse de que volumen es un número puro y no un array
                let volumen = parseFloat(KPISdatosVolumenesPvc[x].volumen);
                PPVCVOLUMEN.push(volumen);
                //Codigos
                NombresSkuPPVC.push(KPISdatosVolumenesPvc[x].codigos)
                //Sobrepeso Objetivo
                SobrepesoObjetivoPPVC.push(KPISdatosVolumenesPvc[x].sobrepesoObjetivo)
                //Sobrepeso
                SobrePesoGrafPPVC.push(KPISdatosVolumenesPvc[x].sobrepeso)
                //Eficiencia
                EficienciaGrafPPVC.push(KPISdatosVolumenesPvc[x].eficiencia)
                //Scrap Kg
                ScrapKGPPVC.push(KPISdatosVolumenesPvc[x].scrapKG)
                //Scrap %
                ScrapPorcentPPVC.push(KPISdatosVolumenesPvc[x].scrapPorcent)
                //Scrap Objetivo
                ScrapObjetivoPPVC.push(KPISdatosVolumenesPvc[x].scrapObjetivo)

                //guardamos los sobrepeso y scrap objetivos
                SobrepesoObjActual = KPISdatosVolumenesPvc[x].sobrepesoObjetivo;
                ScrapObjActual = KPISdatosVolumenesPvc[x].scrapObjetivo;
            }

            //asignamos los datos objetivos a sus campos
            $('#SobrepesoObj').val(SobrepesoObjActual);
            $('#ScrapObj').val(ScrapObjActual);
            //una vez obtenidos los datos de ppvc, obtenemos los de iny
            ObtenerDatosGraficasINY(planta, turno);
            
        } else {
            console.log("Error: " + jsonData.response);
            let error = jsonData.response;
            iziToast.warning({
                position: "topRight",
                title: `¡Aviso!`,
                message: `<p>${error}</p>`,
                color: "blue",
            });
        }
    }).catch((error) => {
        console.log(error)
    })
}

function ObtenerDatosGraficasINY(planta, turno) {
    let data = {
        "planta": planta,
        "turno": turno,
        "proceso": "INY"
    }
    fetch("/Inicio/GetDataGraph", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        if (jsonData.status == 200) {
            let INYVolumenJson = JSON.parse(jsonData.data)
            let KPISdatosVolumenesINY = INYVolumenJson.kpiSdatosVolumenes

            //asiganmos los valores a las variables
            for (x = 0; x < KPISdatosVolumenesINY.length; x++) {
                //lineas
                INYLINEAS.push(KPISdatosVolumenesINY[x].linea)
                // Asegurarse de que volumen es un número puro y no un array
                let volumeniny = parseFloat(KPISdatosVolumenesINY[x].volumen);
                INYVOLUMEN.push(volumeniny);
                //Codigos
                NombresSkuINY.push(KPISdatosVolumenesINY[x].codigos)

                //Sobrepeso Objetivo
                SobrepesoObjetivoINY.push(KPISdatosVolumenesINY[x].sobrepesoObjetivo)
                //Sobrepeso
                SobrePesoGrafINY.push(KPISdatosVolumenesINY[x].sobrepeso)
                //Eficiencia
                EficienciaGrafINY.push(KPISdatosVolumenesINY[x].eficiencia)
                //Scrap Kg
                ScrapKGINY.push(KPISdatosVolumenesINY[x].scrapKG)
                //Scrap %
                ScrapPorcentINY.push(KPISdatosVolumenesINY[x].scrapPorcent)
                //Scrap Objetivo
                ScrapObjetivoINY.push(KPISdatosVolumenesINY[x].scrapObjetivo)

                //guardamos los sobrepeso y scrap objetivos
                SobrepesoObjActual = KPISdatosVolumenesINY[x].sobrepesoObjetivo;
                ScrapObjActual = KPISdatosVolumenesINY[x].scrapObjetivo;
            }

            //asignamos los datos objetivos a sus campos
            $('#SobrepesoObjINY').val(SobrepesoObjActual);
            $('#ScrapObjINY').val(ScrapObjActual);
            //creamos los graficas una vez que ya tenemos todas las variables con sus datos
            CrearGraficos();

        } else {
            console.log("Error: " + jsonData.response);
            let error = jsonData.response;
            iziToast.warning({
                position: "topRight",
                title: `¡Aviso!`,
                message: `<p>${error}</p>`,
                color: "blue",
            });
        }
    }).catch((error) => {
        console.log(error)
    })
}

function ActualizarObjetivosData(planta, Process, sobrepesoObj, ScrapObj) {
    let data = {
        "planta": planta,
        "proceso": Process,
        "Sobrepeso": sobrepesoObj,
        "Scrap": ScrapObj
    }
    fetch("/Inicio/ActualizaObj", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        if (jsonData.status == 200) {

            iziToast.success({
                position: "topRight",
                title: `Sobrepeso y Scrap objetivos`,
                message: `<p>Objetivos actualizados</p>`
            });

            //recargamos la pagina para que las graficas se actualicen con los datos objetivo nuevos
            setTimeout(function () {
                location.reload();
            }, 2000); // 2000 milisegundos = 2 segundos

        } else {
            console.log("Error: " + jsonData.response);
            let error = jsonData.response;
            iziToast.warning({
                position: "topRight",
                title: `¡Aviso!`,
                message: `<p>No se Actualizaron los datos correctamente</p>`,
                color: "blue",
            });
        }
    }).catch((error) => {
        console.log(error)
    })
}

//SWIPERS
//iniciamos el Swiper PPVC
const swiperPPVC = new Swiper('#swiperPPVC', {
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

//iniciamos el Swiper INY
const swiperINY = new Swiper('#swiperINY', {
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
    swiperINY.autoplay.stop();
});
swiperContainer.addEventListener('mouseout', function () {
    swiperPPVC.autoplay.start();
    swiperINY.autoplay.start();
});

//ACCIONES
//Btn actualizar objetivos (PPVC)
$(document).on("click", "#BtnUpdateObjPPVC", function () {

    var Process = "PPVC"

    // Validar si alguno de los campos está vacío
    var sobrepesoObj = $('#SobrepesoObj').val();
    var ScrapObj = $('#ScrapObj').val();

    if (sobrepesoObj === "" || ScrapObj === "") {
        iziToast.warning({
            position: "topRight",
            title: `Datos incompletos`,
            message: `<p>Asegurese de que el Sobrepeso o Scrap objetivos no esten vacios</p>`,
            color: "blue",
        });
        return; // Detener la ejecución si no se llenan los campos
    }
    ActualizarObjetivosData(planta, Process, sobrepesoObj, ScrapObj);
});

//Btn actualizar objetivos (INY)
$(document).on("click", "#BtnUpdateObjINY", function () {

    var Process = "INY"

    // Validar si alguno de los campos está vacío
    var sobrepesoObj = $('#SobrepesoObjINY').val();
    var ScrapObj = $('#ScrapObjINY').val();

    if (sobrepesoObj === "" || ScrapObj === "") {
        iziToast.warning({
            position: "topRight",
            title: `Datos incompletos`,
            message: `<p>Asegurese de que el Sobrepeso o Scrap objetivos no esten vacios</p>`,
            color: "blue",
        });
        return; // Detener la ejecución si no se llenan los campos
    }
    ActualizarObjetivosData(planta, Process, sobrepesoObj, ScrapObj);
});
//limitamos los input a solo numeros y maximo 3 decimales
$(document).ready(function () {
    $('#SobrepesoObj, #ScrapObj, #SobrepesoObjINY, #ScrapObjINY').on('input', function () {
        var value = $(this).val();
        // Permitir solo números con máximo 3 decimales
        if (!/^\d*\.?\d{0,3}$/.test(value)) {
            $(this).val(value.slice(0, -1)); // Elimina el último carácter si no cumple con la expresión regular
        }
    });
});
