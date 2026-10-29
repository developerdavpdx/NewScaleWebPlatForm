//Variables de Graficas CORRUGADOS
//variables para la grafica de volumenes
let CORRLINEAS = [];
let CORRVOLUMEN = [];
let NombresSkuCORR = []; //aqui guardamos los nombres de los codigos
//variables para la grafica de sobrepeso
let SobrepesoObjetivoCORR = [];
let SobrePesoGrafCORR = [];
//variables para la grafica de scrap
let ScrapKGCORR = [];
let ScrapPorcentCORR = [];
let ScrapObjetivoCORR = [];
//variables para la grafica de eficiencia
let EficienciaGrafCORR = [];

//let planta; (no la declaramos aqui, desde el layout.js se declara la variable, aqui solo la consumimos)
//let turno; (no la declaramos aqui, desde el layout.js se declara la variable, aqui solo la consumimos)
let SobrepesoObjActual;
let ScrapObjActual;
const loader = document.getElementById('loaderDiv');

//Variables de Titulos CORR
let VolumenCORR = 0;
let SobrePesoCORR = 0;
let EficienciaCORR = 0;
let ScrapPtCORR = 0
let PesoEstandarCORR = 0;
let kgPproductoCORR = 0;
let sumScrapKgCORR = 0;
let planta = localStorage.planta == '335' ? '2' : '1';

//funcion principal
$(function () {
    loader.style.display = "flex";

    //SWIPERS
    //iniciamos el Swiper Corrugados
    const swiperCORR = new Swiper('#swiperCorrugados', {
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
        swiperCORR.autoplay.stop();
    });
    swiperContainer.addEventListener('mouseout', function () {
        swiperCORR.autoplay.start();
    });

    //mostramos el turno correspondiente
    turno = obtenerTurno();
    document.getElementById("labelTurno").innerText = turno;

    // obtenemos los datos de los titulos (volumen, sobrepeso, eficiencia y scrap)
    ObtenerDatosCorrugados(planta);

    //obtenemos los datos de los graficos de corrugados
    ObtenerDatosGraficasCorrugado(planta, turno);

    //---------FUNCIONES-------
    //Obtiene los datos de los titulos para corrugados
    function ObtenerDatosCorrugados(planta) {

        let data = {
            "planta": planta,
            "proceso": "Corrugado"
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
                let CORRJson = JSON.parse(jsonData.data)
                let productotermCorrug = CORRJson.reportesProdTerm

                for (x = 0; x < productotermCorrug.length; x++) {

                    VolumenCORR += productotermCorrug[x].pesoTotal;
                    sumScrapKgCORR += productotermCorrug[x].scrapTotal;
                    PesoEstandarCORR = PesoEstandarCORR + (productotermCorrug[x].pUnitEstandar * productotermCorrug[x].numTubos)   //<<--- calculo del peso total estandar
                    kgPproductoCORR += (productotermCorrug[x].kgPproducto * productotermCorrug[x].horasTrabajo);
                }

                //calculamos el sobrepeso
                SobrePesoCORR = (VolumenCORR === 0 && PesoEstandarCORR === 0) ? 0 : ((VolumenCORR / PesoEstandarCORR) - 1) * 100;
                //calculamos la eficiencia
                EficienciaCORR = (VolumenCORR === 0 && kgPproductoCORR === 0) ? 0 : (VolumenCORR / kgPproductoCORR) * 100;
                //Calculamos el scrap porcentual
                ScrapPtCORR = (sumScrapKgCORR === 0 && VolumenCORR === 0) ? 0 : (sumScrapKgCORR / (sumScrapKgCORR + VolumenCORR)) * 100;

                //llenamos los titulos
                $("#volumenCorrugadosTitle").text(`${VolumenCORR.toFixed(2)}`);
                $("#SobrepesoCorrugadosTitle").text(`${SobrePesoCORR.toFixed(2)} %`);
                $("#EficienciaCorrugadosTitle").text(`${EficienciaCORR.toFixed(2)} %`);
                //$("#scrapInfoCorrugados").text(`${ScrapPtCORR.toFixed(2)} %`);

            }
        }).catch((error) => {
            console.log(error.toString())
            loader.style.display = "none";
        })
    }

    //funcion para obtener los datos de graficos de ppvc (si el resultado es ok, llamamos a "CrearGraficos()")
    function ObtenerDatosGraficasCorrugado(planta, turno) {

        let data = {
            "planta": planta,
            "turno": turno,
            "proceso": "Corrugado"
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
                let CorrVolumenJson = JSON.parse(jsonData.data)
                let KPISdatosVolumenesCorr = CorrVolumenJson.kpiSdatosVolumenes

                //asiganmos los valores a las variables
                for (x = 0; x < KPISdatosVolumenesCorr.length; x++) {
                    //lineas
                    CORRLINEAS.push(KPISdatosVolumenesCorr[x].linea)
                    // Asegurarse de que volumen es un número puro y no un array
                    let volumen = parseFloat(KPISdatosVolumenesCorr[x].volumen);
                    CORRVOLUMEN.push(volumen);
                    //Codigos
                    NombresSkuCORR.push(KPISdatosVolumenesCorr[x].codigos);
                    //Sobrepeso Objetivo
                    SobrepesoObjetivoCORR.push(KPISdatosVolumenesCorr[x].sobrepesoObjetivo);
                    //Sobrepeso
                    SobrePesoGrafCORR.push(KPISdatosVolumenesCorr[x].sobrepeso);
                    //Eficiencia
                    EficienciaGrafCORR.push(KPISdatosVolumenesCorr[x].eficiencia);
                    //Scrap Kg
                    ScrapKGCORR.push(KPISdatosVolumenesCorr[x].scrapKG);
                    //Scrap %
                    ScrapPorcentCORR.push(KPISdatosVolumenesCorr[x].scrapPorcent);
                    //Scrap Objetivo
                    ScrapObjetivoCORR.push(KPISdatosVolumenesCorr[x].scrapObjetivo);

                    //guardamos los sobrepeso y scrap objetivos
                    SobrepesoObjActual = KPISdatosVolumenesCorr[x].sobrepesoObjetivo;
                    ScrapObjActual = KPISdatosVolumenesCorr[x].scrapObjetivo;
                }

                //asignamos los datos objetivos a sus campos
                $('#SobrepesoObjCORRUGADOS').val(SobrepesoObjActual);
                $('#ScrapObjCORRUGADOS').val(ScrapObjActual);

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
                loader.style.display = "none";
            }
        }).catch((error) => {
            console.log(error)
            loader.style.display = "none";
        })
    }

    //Tema claro para sobrescribir el tema oscuro global de Highcharts
    const temaClaro = {
        chart: {
            backgroundColor: '#ffffff',
            plotBackgroundColor: null,
            style: { fontFamily: 'inherit' }
        },
        title: { style: { color: '#333333' } },
        subtitle: { style: { color: '#666666' } },
        xAxis: {
            gridLineColor: '#e6e6e6',
            lineColor: '#ccd6eb',
            tickColor: '#ccd6eb',
            labels: { style: { color: '#333333' } },
            title: { style: { color: '#333333', fontSize: '15px' } }
        },
        yAxis: {
            gridLineColor: '#e6e6e6',
            lineColor: '#ccd6eb',
            tickColor: '#ccd6eb',
            labels: { style: { color: '#333333' } },
            title: { style: { color: '#333333' } }
        },
        legend: {
            itemStyle: { color: '#333333' },
            itemHoverStyle: { color: '#000000' }
        },
        tooltip: {
            backgroundColor: '#ffffff',
            style: { color: '#333333' }
        },
        credits: { style: { color: '#999999' } }
    };

    //funcion para crear los graficos, una vez que todas las variables tienen su valor
    function CrearGraficos() {
        //GRAFICAS CORR
        //--Grafica De Volumenes PPVC
        Highcharts.setOptions(temaClaro);
        Highcharts.setOptions({
            colors: ['#6c757d', '#adb5bd'],
        });

        Highcharts.chart('VolumenesCorrugados', {
            chart: {
                type: 'column'
            },
            title: {
                text: 'VOLUMEN POR LINEA (KG)'
            },
            xAxis: {
                categories: CORRLINEAS,
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
                    return '<b>' + NombresSkuCORR[index] + '</b>: ' + this.y + ' kg';
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
                data: CORRVOLUMEN,
                pointPadding: 0,
                pointPlacement: 0
            }]
        });

        //--Grafica De Sobrepeso CORRUGADOS
        Highcharts.setOptions(temaClaro);
        Highcharts.setOptions({
            colors: ['#d66249', '#4981d6'],
        });

        Highcharts.chart('SobrepesoCorrugados', {
            chart: {
                type: 'line'
            },
            title: {
                text: 'SOBREPESO POR LINEA (%)'
            },
            xAxis: {
                categories: CORRLINEAS,
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
                data: SobrepesoObjetivoCORR
            }, {
                name: 'Sobrepeso Real',
                data: SobrePesoGrafCORR
            }]
        });

        //--Grafica De Eficiencia CORRUGADO
        Highcharts.chart('EficienciaCorrugados', {
            chart: {
                type: 'bar'
            },
            title: {
                text: 'EFICIENCIA POR LINEA (%)'
            },
            xAxis: {
                categories: CORRLINEAS,
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
                    return '<b>' + NombresSkuCORR[index] + '</b>: ' + this.y + ' %';
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
                data: EficienciaGrafCORR
            }]
        });
        //--Grafica De Scrap CORRUGADOS
        //Highcharts.setOptions({
        //    colors: ['#6c757d', '#d66249', '#4981d6'],
        //});
        //Highcharts.chart('ScrapCorrugados', {
        //    chart: {
        //        zooming: {
        //            type: 'xy'
        //        }
        //    },
        //    title: {
        //        text: 'SCRAP POR LINEA',
        //        align: 'left'
        //    },
        //    xAxis: [{
        //        categories: CORRLINEAS,
        //        crosshair: true,
        //        title: {
        //            text: 'Lineas',
        //            style: {
        //                fontSize: '15px'
        //            }
        //        }
        //    }],
        //    yAxis: [{ // Primary yAxis
        //        labels: {
        //            format: '{value}%',
        //            style: {
        //                color: Highcharts.getOptions().colors[2]
        //            }
        //        },
        //        title: {
        //            text: 'Scrap (%)',
        //            style: {
        //                color: Highcharts.getOptions().colors[2]
        //            }
        //        },
        //        opposite: true

        //    }, { // Secondary yAxis
        //        gridLineWidth: 0,
        //        title: {
        //            text: 'Scrap (Kg)',
        //            style: {
        //                color: Highcharts.getOptions().colors[0]
        //            }
        //        },
        //        labels: {
        //            format: '{value} Kg',
        //            style: {
        //                color: Highcharts.getOptions().colors[0]
        //            }
        //        }

        //    }, { // Tertiary yAxis
        //        gridLineWidth: 0,
        //        title: {
        //            text: 'Scrap Objetivo',
        //            style: {
        //                color: Highcharts.getOptions().colors[1]
        //            }
        //        },
        //        labels: {
        //            format: '{value} %',
        //            style: {
        //                color: Highcharts.getOptions().colors[1]
        //            }
        //        },
        //        opposite: true
        //    }],
        //    tooltip: {
        //        shared: true
        //    },
        //    legend: {
        //        layout: 'vertical',
        //        align: 'left',
        //        x: 80,
        //        verticalAlign: 'top',
        //        y: 55,
        //        floating: true,
        //        backgroundColor:
        //            Highcharts.defaultOptions.legend.backgroundColor || // theme
        //            'rgba(255,255,255,0.25)'
        //    },
        //    series: [{
        //        name: 'Scrap (Kg)',
        //        type: 'column',
        //        yAxis: 1,
        //        data: ScrapKGCORR,
        //        tooltip: {
        //            valueSuffix: ' Kg'
        //        }

        //    }, {
        //        name: 'Scrap Objetivo',
        //        type: 'spline',
        //        yAxis: 2,
        //        data: ScrapObjetivoCORR,
        //        marker: {
        //            enabled: false
        //        },
        //        dashStyle: 'shortdot',
        //        tooltip: {
        //            valueSuffix: ' %'
        //        }

        //    }, {
        //        name: 'Scrap (%)',
        //        type: 'spline',
        //        data: ScrapPorcentCORR,
        //        tooltip: {
        //            valueSuffix: ' %'
        //        }
        //    }],
        //    responsive: {
        //        rules: [{
        //            condition: {
        //                maxWidth: 500
        //            },
        //            chartOptions: {
        //                legend: {
        //                    floating: false,
        //                    layout: 'horizontal',
        //                    align: 'center',
        //                    verticalAlign: 'bottom',
        //                    x: 0,
        //                    y: 0
        //                },
        //                yAxis: [{
        //                    labels: {
        //                        align: 'right',
        //                        x: 0,
        //                        y: -6
        //                    },
        //                    showLastLabel: false
        //                }, {
        //                    labels: {
        //                        align: 'left',
        //                        x: 0,
        //                        y: -6
        //                    },
        //                    showLastLabel: false
        //                }, {
        //                    visible: false
        //                }]
        //            }
        //        }]
        //    }
        //});

        //desactivamos el loader al terminar de cargar toda la info
        loader.style.display = "none";

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

    //---BTNS---

});