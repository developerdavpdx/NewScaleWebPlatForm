let tablePvcProdTerm;
let tableCorreo;
let tablePvcScrap;
const loader = document.getElementById("loaderDiv")
let planta
let filtroDefault = 0;
let LineaTablaDetalle = 0;

//titulos de los cortes
//let tituloCorte1 = "PRIMERO | 1er ENTREGA | 04:30:01 - 11:00:00";
//let tituloCorte2 = ""
//let tituloCorte3 =
//let tituloCorte4 =
//let tituloCorte5 =
//let tituloCorte6 =
//let tituloCorte7 =

$(document).ready(() => {

    localStorage.planta == '335' ? planta = '2' : planta = '1'
    loader.style.display = 'flex'

    tablePvcProdTerm = $('#finishProdTable').DataTable({
        ordering: false,
        responsive: true
    });

    tableDetailsLinea = $('#tableDetalladaLinea').DataTable({
        ordering: false,
        responsive: true
    });

    tablePvcScrap = $('#finishScrapTable').DataTable({
        ordering: false,
        responsive: true
    });

    tableCorreo = $("#tablaCorreo").DataTable({
        ordering: false,
        responsive: true
    })

    let a = 1
    ObtenerEmail()
    GetAllPtPvc();
    PintarCortesTurnos();
})

//pintamos los turnos (se reorganizaron los values por fines visuales)
function PintarCortesTurnos() {
    let inputSelectTurno = document.getElementById("turnoPT")
    for (let x = 0; x < 8; x++) {
        if (x == 0) {
            inputSelectTurno.innerHTML += `<option value="0" selected>Seleccione...</option>`
        }
        if (x == 1) {
            inputSelectTurno.innerHTML += `<option value="${1}">PRIMERO | 1er ENTREGA | 04:30:01 - 11:00:00</option>`
        } else if (x == 2) {
            inputSelectTurno.innerHTML += `<option value="${2}">PRIMERO | 2da ENTREGA | 11:00:01 - 16:30:00</option>`
        } else if (x == 3) {
            inputSelectTurno.innerHTML += `<option value="${4}">SEGUNDO | 1er ENTREGA | 16:30:01 - 23:00:00</option>`
        } else if (x == 4) {
            inputSelectTurno.innerHTML += `<option value="${5}">SEGUNDO | 2da ENTREGA | 23:00:01 - 04:30:00</option>`
        } else if (x == 5) {
            inputSelectTurno.innerHTML += `<option value="${3}">REPORTE DE PRODUCCIÓN PRIMER TURNO</option>`
        } else if (x == 6) {
            inputSelectTurno.innerHTML += `<option value="${6}">REPORTE DE PRODUCCIÓN SEGUNDO TURNO</option>`
        } else if (x == 7) {
            inputSelectTurno.innerHTML += `<option value="${7}">REPORTE DE PRODUCCIÓN POR DIA</option>`
        }
    }
}

function ChangerTurn(element) {
    if (element.options[element.selectedIndex].value == "3") {

    }
}

//Busqueda default sin filtros [obtenerProductosTerminados]
function GetAllPtPvc() {
    //establecemos que NO se ha usadon filtrado para los datos (nos servira al momento de ver los detalles por linea)
    filtroDefault = 0;

    let kgPproducto = 0; 
    let sumTotal = 0;
    let sumEstandar = 0;
    let sumSobrePeso = 0;
    let sumEficiencia = 0;
    let sumScrapPtKg = 0
    let sumScrapPt = 0
    let PesoEstandarNFormula = 0;

    let rows = []    
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

            //variables de la formula2
            //let sumSobrePeso2 = 0;
            //let numtubosT = 0;
            //let pesounitT = 0;

            //generar tabla de PT
            for (x = 0; x < productotermPvc.length; x++) { 
                let scrapPtFormatted = parseFloat(productotermPvc[x].scrapPt).toFixed(2);

                // Creamos el ícono/botón con el valor id_Linea
                let BtnDetails = `<i class="bi bi-file-earmark-text fa-2x" value = "${productotermPvc[x].id_Linea}" value2 = "${productotermPvc[x].codigo}" id="btnDetails"></i>`;

                rows.push([
                    BtnDetails,
                    productotermPvc[x].id_Linea,
                    productotermPvc[x].codigo,
                    productotermPvc[x].atadosTarimas,
                    productotermPvc[x].numTubos,
                    productotermPvc[x].pesoTotal,
                    productotermPvc[x].pUnitEstandar,
                    productotermPvc[x].pUnitReal,
                    productotermPvc[x].sobrePeso,
                    productotermPvc[x].eficiencia,
                    productotermPvc[x].scrapTotal, //(scrap en kg)
                    scrapPtFormatted, // (scrap en porcentaje con 2 decimales, para que coincida con el reporte de email) 
                    productotermPvc[x].item])

                sumTotal += productotermPvc[x].pesoTotal
                sumEstandar += productotermPvc[x].pUnitEstandar
                sumScrapPtKg += productotermPvc[x].scrapTotal;               
                PesoEstandarNFormula = PesoEstandarNFormula + (productotermPvc[x].pUnitEstandar * productotermPvc[x].numTubos)   //<<--- calculo del peso total estandar
                kgPproducto += (productotermPvc[x].kgPproducto * productotermPvc[x].horasTrabajo);

                //numtubosT += productotermPvc[x].numTubos;
                //pesounitT += productotermPvc[x].pUnitEstandar;
            }

            //calculamos el sobrepeso
            sumSobrePeso = ((sumTotal / PesoEstandarNFormula) - 1);
            //sumSobrePeso2 = SobrePesoForm(sumTotal, numtubosT, pesounitT);

            //calculamos la eficiencia
            sumEficiencia = (sumTotal / kgPproducto);

            $("#sumTotal").text(sumTotal.toFixed(3));
            $("#sumEstandar").text(sumEstandar.toFixed(3));
            $("#sumSobrePeso").text((sumSobrePeso * 100).toFixed(3));
            $("#sumEficiencia").text((sumEficiencia * 100).toFixed(3));
            $("#sumScrapPtKg").text(sumScrapPtKg.toFixed(3));
            sumScrapPt = (sumScrapPtKg / (sumScrapPtKg + sumTotal));
            $("#sumScrapPt").text((sumScrapPt * 100).toFixed(2)); //scrap en % [multiplicamos para forzar conversion a numero]

            tablePvcProdTerm.rows.add(rows).draw()           

            let nodesLinea = tablePvcProdTerm.columns(0).nodes()
            let nodesEfic = tablePvcProdTerm.columns(9).nodes()
            let nodesScrap = tablePvcProdTerm.columns(11).nodes()

            for (x = 0; x < nodesScrap['0'].length; x++) {
                nodesScrap['0'][x].classList.add('scrap-info')
            }

            for (x = 0; x < nodesEfic['0'].length; x++) {
                nodesEfic['0'][x].classList.add('eficiencia-info')
            }

            loader.style.display = 'none'
        }
    }).catch((error) => {
        console.log(error.toString())
        loader.style.display = 'none'
    })
}

let rgb1 = [165, 165, 165];
let rgb2 = [165, 165, 165];
let rgb3 = [165, 165, 165];

//Genera el pdf de PT
async function generarpdf() {
    loader.style.display = 'flex';

    window.jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({
        format: 'letter',
        orientation: 'landscape',
        compress: true,
        objcompress: true
    });

    doc.setFont("times");
    // Agregar imagen
    var img = new Image();
    img.src = '../../Images/LogoPTMHDBN.png';
    img.onload = async function () {
        var imgWidth = this.width;
        var imgHeight = this.height;

        // Obtener el tamaño de la página y establecer los márgenes
        var pageSize = doc.internal.pageSize;
        var pageWidth = pageSize.width;
        var marginLeft = 10;
        var marginRight = 10;
        var usableWidth = pageWidth - marginLeft - marginRight;

        // Calcular el ancho y la altura de la imagen
        var imageWidth = usableWidth * 0.25;
        var aspectRatio = imgHeight / imgWidth;
        var imageHeight = imageWidth * aspectRatio;

        // Calcular la posición para la imagen
        var imageX = marginLeft;
        var imageY = 10;

        // Dibujar la imagen
        doc.addImage(img, 'PNG', (usableWidth / 2) - imageWidth - 5, imageY, imageWidth, imageHeight);
        doc.setFont(undefined, 'bold');
        doc.setFontSize(16);
        var text = "REPORTE PRODUCTO TERMINADO PVC";
        doc.text(text, (usableWidth / 2) + 55, 18, { align: 'center', });
        doc.setFont(undefined, 'normal');
        doc.setFontSize(14);
        var text = "Generado por: " + document.getElementById("labelName").innerHTML;
        doc.text(text, (usableWidth / 2) + 55, 23, { align: 'center', });

        // Crea un objeto Date para la fecha y hora actual
        var fechaHoraActual = new Date();

        // Obtiene el año actual
        var año = fechaHoraActual.getFullYear();

        // Obtiene el mes actual (los meses van de 0 a 11)
        var mes = fechaHoraActual.getMonth() + 1;

        // Obtiene el día actual
        var dia = fechaHoraActual.getDate();

        // Obtiene las horas actuales
        var horas = fechaHoraActual.getHours();

        // Obtiene los minutos actuales
        var minutos = fechaHoraActual.getMinutes();

        // Obtiene los segundos actuales
        var segundos = fechaHoraActual.getSeconds();

        // Crea una cadena con la fecha y hora actual
        var fechaHoraActualStr = dia + "/" + mes + "/" + año + " " + horas + ":" + minutos.toString().padStart(2, '0');

        doc.setFontSize(12);
        var text = "Fecha: " + fechaHoraActualStr;
        doc.text(text, (usableWidth / 2) + 55, 29, { align: 'center', });


        var rectWidth = doc.internal.pageSize.getWidth() - 20; // Ancho del rectángulo
        var rectHeight = 7; // Altura del rectángulo
        // Dibuja el rectángulo negro

        // Establece el color de fondo
        doc.setFillColor(rgb2[0], rgb2[1], rgb2[2]);

        // Dibuja un rectángulo negro en el centro de la página
        var rectWidth = doc.internal.pageSize.getWidth() - 20; // Ancho del rectángulo
        var rectHeight = 10; // Altura del rectángulo
        var rectX = (10); // Coordenada X del rectángulo
        var rectY = (40); // Coordenada Y del rectángulo
        doc.rect(rectX, rectY, rectWidth, rectHeight, 'F');

        // Establece el color de texto en blanco
        doc.setTextColor(255, 255, 255);

        // Agrega texto blanco en el centro del rectángulo
        var text = 'PRODUCTO TERMINADO PVC';
        var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize(); // Ancho del texto
        var textY = 46; // Coordenada Y del texto
        doc.text(text, doc.internal.pageSize.getWidth() / 2, textY, { align: 'center' });


        // Define la posición de la tabla
        var startX = 10;
        var startY = 53;

        // Obtenemos las filas de la tabla
        let rows = tablePvcProdTerm.rows().data().toArray();
        // Filtramos la primera columna (Detalles) para que no se agregue al excel
        let filteredRows = rows.map(row => row.slice(1)); // Esto elimina la primera columna (índice 0)

        doc.autoTable({
            head: [['Línea', 'Código', '# Atados/Tarima', '# Tubos', 'P. Neto Total', 'P. Unit. Estándar', 'P. Unit. Real', '% Sobrepeso', '% Eficiencia', 'KG ScrapPT', '% Scrap PT']],
            body: filteredRows,
            // Establecer el color de fondo del encabezado
            headStyles: {
                fillColor: [rgb1[0], rgb1[1], rgb1[2]]
            },
            startY: startY,
            startX: startX,
            styles: {
                lineWidth: 0.5,
                lineColor: [255, 255, 255],
                halign: 'center'
            },
            columns: [
                { align: 'center' }, // Centrar la primera columna
                { align: 'center' }, // Alinear a la izquierda la segunda columna
                { align: 'center' }, // Centrar la tercera columna
                { align: 'center' },
                { align: 'center' },
                { align: 'center' },
                { align: 'center' },
                { align: 'center' },
                { align: 'center' },
                { align: 'center' },
                { align: 'center' }
            ]
        });

        startY = doc.autoTable.previous.finalY + 10;

        doc.autoTable({
            head: [[
                {
                    content: 'TOTAL PRODUCTO TERMINADO PVC',
                    colSpan: 8,
                    styles: { halign: 'center' }
                }],
                ['P. Neto Total', 'P. Unit. Estandár', '% Sobrepeso', '% Eficiencia', 'Kg Scrap PT', '% Scrap PT']],
            body: [[$("#sumTotal").text(),
                $("#sumEstandar").text(),
                $("#sumSobrePeso").text(),
                $("#sumEficiencia").text(),
                $("#sumScrapPtKg").text(),
                $("#sumScrapPt").text()]],

            // Establecer el color de fondo del encabezado
            headStyles: {
                fillColor: [rgb1[0], rgb1[1], rgb1[2]]
            },
            startY: startY,
            startX: startX,
            styles: {
                lineWidth: 0.5,
                lineColor: [255, 255, 255],
                halign: 'center'
            },
            columns: [
                { align: 'center' }, // Centrar la primera columna
                { align: 'center' }, // Alinear a la izquierda la segunda columna
                { align: 'center' }, // Centrar la tercera columna
                { align: 'center' },
                { align: 'center' },
                { align: 'center' },
            ]
        });

        doc.save("ReporteProductoTerminadoPvc.pdf");
        loader.style.display = 'none';

    };
}

//Genera el pdf de Scrap
async function generarpdfScrap() {
    loader.style.display = 'flex';

    //Crea un nuevo pdf
    window.jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({
        format: 'letter',
        orientation: 'landscape',
        compress: true,
        objcompress: true
    });

    doc.setFont("times");
    // Agregar imagen
    var img = new Image();
    img.src = '../../Images/LogoPTMHDBN.png';
    img.onload = async function () {
        var imgWidth = this.width;
        var imgHeight = this.height;

        // Obtener el tamaño de la página y establecer los márgenes
        var pageSize = doc.internal.pageSize;
        var pageWidth = pageSize.width;
        var marginLeft = 10;
        var marginRight = 10;
        var usableWidth = pageWidth - marginLeft - marginRight;

        // Calcular el ancho y la altura de la imagen
        var imageWidth = usableWidth * 0.25;
        var aspectRatio = imgHeight / imgWidth;
        var imageHeight = imageWidth * aspectRatio;

        // Calcular la posición para la imagen
        var imageX = marginLeft;
        var imageY = 10;

        // Dibujar la imagen
        doc.addImage(img, 'PNG', (usableWidth / 2) - imageWidth - 5, imageY, imageWidth, imageHeight);
        doc.setFont(undefined, 'bold');
        doc.setFontSize(16);
        var text = "REPORTE SCRAP PVC";
        doc.text(text, (usableWidth / 2) + 55, 18, { align: 'center', });
        doc.setFont(undefined, 'normal');
        doc.setFontSize(14);
        var text = "Generado por: " + document.getElementById("labelName").innerHTML;
        doc.text(text, (usableWidth / 2) + 55, 23, { align: 'center', });

        // Crea un objeto Date para la fecha y hora actual
        var fechaHoraActual = new Date();

        // Obtiene el año actual
        var año = fechaHoraActual.getFullYear();

        // Obtiene el mes actual (los meses van de 0 a 11)
        var mes = fechaHoraActual.getMonth() + 1;

        // Obtiene el día actual
        var dia = fechaHoraActual.getDate();

        // Obtiene las horas actuales
        var horas = fechaHoraActual.getHours();

        // Obtiene los minutos actuales
        var minutos = fechaHoraActual.getMinutes();

        // Obtiene los segundos actuales
        var segundos = fechaHoraActual.getSeconds();

        // Crea una cadena con la fecha y hora actual
        var fechaHoraActualStr = dia + "/" + mes + "/" + año + " " + horas + ":" + minutos.toString().padStart(2, '0');

        doc.setFontSize(12);
        var text = "Fecha: " + fechaHoraActualStr;
        doc.text(text, (usableWidth / 2) + 55, 29, { align: 'center', });


        var rectWidth = doc.internal.pageSize.getWidth() - 20; // Ancho del rectángulo
        var rectHeight = 7; // Altura del rectángulo
        // Dibuja el rectángulo negro

        // Establece el color de fondo
        doc.setFillColor(rgb2[0], rgb2[1], rgb2[2]);

        // Dibuja un rectángulo negro en el centro de la página
        var rectWidth = doc.internal.pageSize.getWidth() - 20; // Ancho del rectángulo
        var rectHeight = 10; // Altura del rectángulo
        var rectX = (10); // Coordenada X del rectángulo
        var rectY = (40); // Coordenada Y del rectángulo
        doc.rect(rectX, rectY, rectWidth, rectHeight, 'F');

        // Establece el color de texto en blanco
        doc.setTextColor(255, 255, 255);

        // Agrega texto blanco en el centro del rectángulo
        var text = 'SCRAP PVC';
        var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize(); // Ancho del texto
        var textY = 46; // Coordenada Y del texto
        doc.text(text, doc.internal.pageSize.getWidth() / 2, textY, { align: 'center' });


        // Define la posición de la tabla
        var startX = 10;
        var startY = 53;



        doc.autoTable({
            head: [['Línea', 'Familia', 'Peso', 'Comentarios', 'Fecha y hora']],
            body: tablePvcScrap.rows().data().toArray(),
            // Establecer el color de fondo del encabezado
            headStyles: {
                fillColor: [rgb1[0], rgb1[1], rgb1[2]]
            },
            startY: startY,
            startX: startX,
            styles: {
                lineWidth: 0.5,
                lineColor: [255, 255, 255],
                halign: 'center'
            },
            columns: [
                { align: 'center' }, // Centrar la primera columna
                { align: 'center' }, // Alinear a la izquierda la segunda columna
                { align: 'center' }, // Centrar la tercera columna
                { align: 'center' }
            ]
        });

        startY = doc.autoTable.previous.finalY + 10;        

        doc.save("Reporte_Scrap.pdf");
        loader.style.display = 'none';

    };
}

function generarexcel() {
    loader.style.display = "flex"
    var datos = new FormData();

    // Obtenemos las filas de la tabla
    let rows = tablePvcProdTerm.rows().data().toArray();
    // Filtramos la primera columna (Detalles) para que no se agregue al excel
    let filteredRows = rows.map(row => row.slice(1)); // Esto elimina la primera columna (índice 0)

    let totales = []
    totales.push([$("#sumTotal").text(),
        $("#sumEstandar").text(),
        $("#sumSobrePeso").text(),
        $("#sumEficiencia").text(),
        $("#sumScrapPtKg").text(),
        $("#sumScrapPt").text()])

    datos.append("matrizdatos", JSON.stringify(filteredRows));
    datos.append("totales", JSON.stringify(totales));
    // Crear un nuevo objeto XMLHttpRequest
    var xhr = new XMLHttpRequest();
    var url = '/ProductoTerminado/generarexcel';
    // Configurar la solicitud
    xhr.open('POST', url, true);

    // Manejar la respuesta
    xhr.onload = function () {
        if (xhr.status === 200) {
            // Mostrar el texto de la respuesta en la consola
            var respuesta = JSON.parse(xhr.responseText);
            loader.style.display = "none"
            if (respuesta.R == 1) {
                descargarArchivo('Producto Terminado PVC.xlsx', respuesta.data);
            } else {

                iziToast.error({
                    position: "topRight",
                    title: `Exportación de excel producto terminado`,
                    message: `<p>El documento de excel no pudo ser generado</p>`,
                })
                loader.style.display = "none"
            }

        } else {
            // Manejar el error
            console.log('Error: ' + xhr.status);
            loader.style.display = "none"
        }
    };

    loader.style.display = "none"
    // Enviar la solicitud
    xhr.send(datos);

}

//Funcion generar Excel de la tabla Scrap
function generarexcelScrap() {
    loader.style.display = "flex"
    var datos = new FormData();

    datos.append("matrizdatos", JSON.stringify(tablePvcScrap.rows().data().toArray()));
    // Crear un nuevo objeto XMLHttpRequest
    var xhr = new XMLHttpRequest();
    var url = '/ProductoTerminado/generarexcelScrap';
    // Configurar la solicitud
    xhr.open('POST', url, true);

    // Manejar la respuesta
    xhr.onload = function () {
        if (xhr.status === 200) {
            // Mostrar el texto de la respuesta en la consola
            var respuesta = JSON.parse(xhr.responseText);
            loader.style.display = "none"
            if (respuesta.R == 1) {
                descargarArchivo('Scrap PVC.xlsx', respuesta.data);
            } else {

                iziToast.error({
                    position: "topRight",
                    title: `Exportación de excel Scrap`,
                    message: `<p>El documento de excel no pudo ser generado</p>`,
                })
                loader.style.display = "none"
            }

        } else {
            // Manejar el error
            console.log('Error: ' + xhr.status);
            loader.style.display = "none"
        }
    };

    loader.style.display = "none"
    // Enviar la solicitud
    xhr.send(datos);

}

function generarexcelDetallesLinea() {
    loader.style.display = "flex"
    var datos = new FormData();

    // Obtenemos las filas de la tabla
    let rows = tableDetailsLinea.rows().data().toArray();
    // Filtramos la primera columna (Detalles) para que no se agregue al excel
    //let filteredRows = rows.map(row => row.slice(1)); // Esto elimina la primera columna (índice 0)

    let totales = []
    totales.push([$("#sumTotalLinea").text(),
    $("#sumEstandarLinea").text(),
    $("#sumSobrePesoLinea").text(),
    $("#sumEficienciaLinea").text()])
    //$("#sumScrapPtKgLinea").text(),
    //$("#sumScrapPtLinea").text()])
    datos.append("matrizdatos", JSON.stringify(rows));
    datos.append("totales", JSON.stringify(totales));
    // Crear un nuevo objeto XMLHttpRequest
    var xhr = new XMLHttpRequest();
    var url = '/ProductoTerminado/generarexcelDetalle';
    // Configurar la solicitud
    xhr.open('POST', url, true);

    // Manejar la respuesta
    xhr.onload = function () {
        if (xhr.status === 200) {
            // Mostrar el texto de la respuesta en la consola
            var respuesta = JSON.parse(xhr.responseText);
            loader.style.display = "none"
            if (respuesta.R == 1) {
                descargarArchivo(`Detalle_Linea_${LineaTablaDetalle}.xlsx`, respuesta.data);
            } else {

                iziToast.error({
                    position: "topRight",
                    title: `Exportación de excel producto terminado`,
                    message: `<p>El documento de excel no pudo ser generado</p>`,
                })
                console.log(respuesta);
                loader.style.display = "none"
            }

        } else {
            // Manejar el error
            console.log('Error: ' + xhr.status);
            loader.style.display = "none"
        }
    };

    loader.style.display = "none"
    // Enviar la solicitud
    xhr.send(datos);

}

function descargarArchivo(nombreArchivo, base64String) {
    // Crear un enlace temporal en la página
    var enlaceTemporal = document.createElement('a');
    enlaceTemporal.setAttribute('href', 'data:application/vnd.ms-excel;base64,' + base64String);
    enlaceTemporal.setAttribute('download', nombreArchivo);

    // Agregar el enlace temporal a la página
    document.body.appendChild(enlaceTemporal);

    // Hacer clic en el enlace temporal para descargar el archivo
    enlaceTemporal.click();

    // Remover el enlace temporal de la página
    document.body.removeChild(enlaceTemporal);
}

function emailreporte() {
    loader.style.display = 'flex';

    window.jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({
        format: 'letter',
        orientation: 'landscape',
        compress: true,
        objcompress: true
    });

    doc.setFont("times");
    // Agregar imagen
    var img = new Image();
    img.src = '../../Images/LogoPTMHD.png';
    img.onload = async function () {
        var imgWidth = this.width;
        var imgHeight = this.height;

        // Obtener el tamaño de la página y establecer los márgenes
        var pageSize = doc.internal.pageSize;
        var pageWidth = pageSize.width;
        var marginLeft = 10;
        var marginRight = 10;
        var usableWidth = pageWidth - marginLeft - marginRight;

        // Calcular el ancho y la altura de la imagen
        var imageWidth = usableWidth * 0.25;
        var aspectRatio = imgHeight / imgWidth;
        var imageHeight = imageWidth * aspectRatio;

        // Calcular la posición para la imagen
        var imageX = marginLeft;
        var imageY = 10;

        // Dibujar la imagen
        doc.addImage(img, 'PNG', (usableWidth / 2) - imageWidth - 5, imageY, imageWidth, imageHeight);
        doc.setFont(undefined, 'bold');
        doc.setFontSize(16);
        var text = "REPORTE PRODUCTO TERMINADO PVC";
        doc.text(text, (usableWidth / 2) + 55, 18, { align: 'center', });
        doc.setFont(undefined, 'normal');
        doc.setFontSize(14);
        var text = "Generado por: " + document.getElementById("labelName").innerHTML;
        doc.text(text, (usableWidth / 2) + 55, 23, { align: 'center', });

        // Crea un objeto Date para la fecha y hora actual
        var fechaHoraActual = new Date();

        // Obtiene el año actual
        var año = fechaHoraActual.getFullYear();

        // Obtiene el mes actual (los meses van de 0 a 11)
        var mes = fechaHoraActual.getMonth() + 1;

        // Obtiene el día actual
        var dia = fechaHoraActual.getDate();

        // Obtiene las horas actuales
        var horas = fechaHoraActual.getHours();

        // Obtiene los minutos actuales
        var minutos = fechaHoraActual.getMinutes();

        // Obtiene los segundos actuales
        var segundos = fechaHoraActual.getSeconds();

        // Crea una cadena con la fecha y hora actual
        var fechaHoraActualStr = dia + "/" + mes + "/" + año + " " + horas + ":" + minutos;

        doc.setFontSize(12);
        var text = "Fecha: " + fechaHoraActualStr;
        doc.text(text, (usableWidth / 2) + 55, 29, { align: 'center', });


        var rectWidth = doc.internal.pageSize.getWidth() - 20; // Ancho del rectángulo
        var rectHeight = 7; // Altura del rectángulo
        // Dibuja el rectángulo negro

        // Establece el color de fondo
        doc.setFillColor(rgb2[0], rgb2[1], rgb2[2]);

        // Dibuja un rectángulo negro en el centro de la página
        var rectWidth = doc.internal.pageSize.getWidth() - 20; // Ancho del rectángulo
        var rectHeight = 10; // Altura del rectángulo
        var rectX = (10); // Coordenada X del rectángulo
        var rectY = (40); // Coordenada Y del rectángulo
        doc.rect(rectX, rectY, rectWidth, rectHeight, 'F');

        // Establece el color de texto en blanco
        doc.setTextColor(255, 255, 255);

        // Agrega texto blanco en el centro del rectángulo
        var text = 'PRODUCTO TERMINADO PVC';
        var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize(); // Ancho del texto
        var textY = 46; // Coordenada Y del texto
        doc.text(text, doc.internal.pageSize.getWidth() / 2, textY, { align: 'center' });


        // Define la posición de la tabla
        var startX = 10;
        var startY = 53;

        //var nodesRowsTable = tablePvcProdTerm.rows().data()
        //var nodesColumnsTable = tablePvcProdTerm.columns().nodes()

        //let arrayNuevo = []
        //for (x = 0; x < nodesRowsTable.length; x++) {
        //    let linea = nodesColumnsTable[0][x].innerText
        //    arrayNuevo.push([linea, nodesRowsTable[0][1], nodesRowsTable[0][2], nodesRowsTable[0][3], nodesRowsTable[0][4], nodesRowsTable[0][5], nodesRowsTable[0][6], nodesRowsTable[0][7], nodesRowsTable[0][8]])
        //}

        doc.autoTable({
            head: [['Línea', 'Código', '# Atados/Tarima', '# Tubos', 'P. Neto Total', 'P. Unit. Estándar', 'P. Unit. Real', '% Sobrepeso', '% Eficiencia', 'KG ScrapPT', '% Scrap PT']],
            body: tablePvcProdTerm.rows().data().toArray(),
            // Establecer el color de fondo del encabezado
            headStyles: {
                fillColor: [rgb1[0], rgb1[1], rgb1[2]]
            },
            startY: startY,
            startX: startX,
            styles: {
                lineWidth: 0.5,
                lineColor: [255, 255, 255],
                halign: 'center'
            },
            columns: [
                { align: 'center' }, // Centrar la primera columna
                { align: 'center' }, // Alinear a la izquierda la segunda columna
                { align: 'center' }, // Centrar la tercera columna
                { align: 'center' },
                { align: 'center' },
                { align: 'center' },
                { align: 'center' },
                { align: 'center' },
                { align: 'center' },
                { align: 'center' },
                { align: 'center' }
            ]
        });

        startY = doc.autoTable.previous.finalY + 10;

        doc.autoTable({
            head: [[
                {
                    content: 'TOTAL PRODUCTO TERMINADO PVC',
                    colSpan: 8,
                    styles: { halign: 'center' }
                }],
            ['P. Neto Total', 'P. Unit. Estandár', '% Sobrepeso', '% Eficiencia', 'Kg Scrap PT', '% Scrap PT']],
            body: [[$("#sumTotal").text(),
                $("#sumEstandar").text(),
                $("#sumSobrePeso").text(),
                $("#sumEficiencia").text(),
                $("#sumScrapPtKg").text(),
                $("#sumScrapPt").text()]],

            // Establecer el color de fondo del encabezado
            headStyles: {
                fillColor: [rgb1[0], rgb1[1], rgb1[2]]
            },
            startY: startY,
            startX: startX,
            styles: {
                lineWidth: 0.5,
                lineColor: [255, 255, 255],
                halign: 'center'
            },
            columns: [
                { align: 'center' }, // Centrar la primera columna
                { align: 'center' }, // Alinear a la izquierda la segunda columna
                { align: 'center' }, // Centrar la tercera columna
                { align: 'center' },
                { align: 'center' },
                { align: 'center' }
            ]
        });

        // doc.save("Reporte producto terminado pvc.pdf");

        let arrayCorreos = []
        var pdfData = doc.output();

        var base64Data = btoa(pdfData);

        let correosNodes = tableCorreo.columns(2).nodes()

        for (x = 0; x < correosNodes[0].length; x++) {
            arrayCorreos.push(correosNodes[0][x].innerText)
        }

        var datos = new FormData();
        datos.append("tiporeporte", "Reporte Producto Terminado PVC");
        datos.append("base64PDF", base64Data)
        datos.append("email", JSON.stringify(arrayCorreos))
        // Crear un nuevo objeto XMLHttpRequest
        var xhr = new XMLHttpRequest();
        var url = '/ProductoTerminado/emailreporte';
        // Configurar la solicitud
        xhr.open('POST', url, true);

        // Manejar la respuesta
        xhr.onload = function () {
            if (xhr.status === 200) {
                // Mostrar el texto de la respuesta en la consola
                var respuesta = JSON.parse(xhr.responseText);
                if (respuesta.R == 1) {

                    iziToast.success({
                        position: "topRight",
                        title: `Correo Enviado`,
                        message: `<p>El correo se ha enviado correctamente.</p>`
                    })
                    loader.style.display = 'none';

                } else {
                    iziToast.error({
                        position: "topRight",
                        title: `Ha surgido un error`,
                        message: `<p>No se ha enviado correctamente el correo.</p>`
                    })
                    loader.style.display = 'none';
                }

            } else {
                // Manejar el error
                console.log('Error: ' + xhr.status);

                iziToast.error({
                    position: "topRight",
                    title: `Ha surgido un error`,
                    message: `<p>Error dentro del proceso de enviar correo. Favor de verificar.</p>`
                })

                loader.style.display = 'none';
            }
        };

        // Enviar la solicitud
        xhr.send(datos);
    };
}

function verLinea(linea, codigo) {

    let rows = []
    let proceso = "PPVC"

    //limpiamos la tabla de posibles datos pasados
    tableDetailsLinea.clear().draw()

    document.getElementById("lineaModal").innerText = linea;
    document.getElementById("lineaTitleModal").innerText = linea;

    //obtenemos el corte [del 0 al 7]
    let cortevalue = document.getElementById("turnoPT");
    let corte = cortevalue.options[cortevalue.selectedIndex].value;
    let fechaInicioFiltro = document.getElementById("desdeFecha").value || "0";
    let fechaFinFiltro = document.getElementById("aFecha").value || "0";

    let data = {
        "linea": linea,
        "planta": planta,
        "corte": corte,
        "codigo": codigo,
        "proceso": proceso,
        //obtenemos si se ha usado el filtrado o no
        "filtroDefault": filtroDefault,
        //obtenemos las fechas (estas solo aplicaran para cuando se usa el filtro)
        "fechaInicioFiltro": fechaInicioFiltro,
        "fechaFinFiltro": fechaFinFiltro
    }
    fetch("/ProductoTerminado/GetDataByLinie", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        if (jsonData.status == 200) {
            let data = JSON.parse(jsonData.data)
            let dataInfo = data.reportesDetalle
            
            //limpiamos la tabla de valores anteriores
            document.getElementById("tableBodyDetalle").innerHTML = ''
            //limpiamos el titlo en caso de que se seleccione una linea que solo tiene scrap
            $("#sumTotalLinea").text("--");
            $("#sumEstandarLinea").text("--");
            $("#sumSobrePesoLinea").text("--");
            $("#sumEficienciaLinea").text("--");
            $("#sumScrapPtKgLinea").text("--");
            $("#sumScrapPtLinea").text("--");

            //creamos las variables para los totales
            let PesoNUltimoLinea = 0;
            let PesoUEstandarLinea = 0;
            let SobrepesoLinea = 0;
            let EficienciaLinea = 0;
            let PesoTotalNLinea = 0;
            //let ScrapPorcentLinea = 0;

            let PesoEstandarNFormulaLinea = 0;
            let kgPproductoLinea = 0;

            //generamos la la tabla de details
            for (x = 0; x < dataInfo.length; x++) {

                var fechaFormato = dataInfo[x].fechapesaje.replace('T', '    ').slice(0, 19) + 'Hrs';

                rows.push([
                    fechaFormato,
                    dataInfo[x].codigo,
                    dataInfo[x].atadosTarimas,
                    dataInfo[x].numTubos,
                    dataInfo[x].pesoTotal,
                    dataInfo[x].pUnitEstandar,
                    dataInfo[x].pUnitReal,
                    dataInfo[x].sobrePeso,
                    dataInfo[x].eficiencia
                ])

                //asignamos valores a las varibles totales
                PesoNUltimoLinea = dataInfo[x].pesoTotal;
                PesoTotalNLinea += dataInfo[x].pesoTotal;
                PesoUEstandarLinea += dataInfo[x].pUnitEstandar;
                //KGScraptLinea = dataInfo[x].scrapTotal 


                PesoEstandarNFormulaLinea = PesoEstandarNFormulaLinea + (dataInfo[x].pUnitEstandar * dataInfo[x].numTubos);
                kgPproductoLinea = (dataInfo[x].kgPproducto * dataInfo[x].horasTrabajo);
            }

            //calculamos el sobrepeso
            SobrepesoLinea = ((PesoNUltimoLinea / PesoEstandarNFormulaLinea) - 1);
            //calculamos la eficiencia
            EficienciaLinea = (PesoNUltimoLinea / kgPproductoLinea);
            //calculamos el scrap en %
            //ScrapPorcentLinea = (KGScraptLinea / (KGScraptLinea + PesoNTotalLinea));

            $("#sumTotalLinea").text(PesoTotalNLinea.toFixed(3));
            $("#sumEstandarLinea").text(PesoUEstandarLinea.toFixed(3));
            $("#sumSobrePesoLinea").text((SobrepesoLinea * 100).toFixed(3));
            $("#sumEficienciaLinea").text((EficienciaLinea * 100).toFixed(3));
            //$("#sumScrapPtKgLinea").text(KGScraptLinea.toFixed(3));
            //$("#sumScrapPtLinea").text((ScrapPorcentLinea * 100).toFixed(2)); //scrap en % [multiplicamos para forzar conversion a numero]

            //dibujamos los valores en la tabla
            tableDetailsLinea.rows.add(rows).draw()
        }
        else {
            iziToast.error({
                position: "topRight",
                title: `Información`,
                //imprimimos el mensaje que viene desde el controller
                message: `<p>${jsonData.data}</p>`
            })
        }
    }).catch((error) => {
        console.log(error);
    })
}

//Buscar por filtro [Sppdx_FiltradoProductosTerminados]
function filtradoHistorialPesadas() {
    //establecemos que YA se ha usadon filtrado para los datos (nos servira al momento de ver los detalles por linea)
    filtroDefault = 1;

    loader.style.display = "flex"
    let cortevalue = document.getElementById("turnoPT")
    let corte =  cortevalue.options[cortevalue.selectedIndex].value
    let turnoValue

    //varificar si pertenece al turno 1 o 2
    if (corte >= "1" && corte <= "3") {
        //verificar que los campos de fecha no esten vacios
        if (document.getElementById("desdeFecha").value == '') {
            iziToast.warning({
                position: "topRight",
                title: `Aviso`,
                message: `<p>Favor de ingresar la fecha que deseas de el reporte del día.</p>`,
                color: "blue",
            })
            loader.style.display = "none"
        }
        turnoValue = "1"
    }
        if (corte >= "4" && corte <= "6") {
        //verificar que los campos de fecha no esten vacios
            if (document.getElementById("desdeFecha").value == '') {
                iziToast.warning({
                    position: "topRight",
                    title: `Aviso`,
                    message: `<p>Favor de ingresar la fecha que deseas de el reporte del día.</p>`,
                    color: "blue",
                })
                loader.style.display = "none"
            }
        turnoValue = "2"
    }
    //si olvidan seleccionar las fechas y solo seleccionan 'reporte de todo el dia'
    if (corte == "7") {
        if (document.getElementById("desdeFecha").value == '') {
            iziToast.warning({
                position: "topRight",
                title: `Aviso`,
                message: `<p>Favor de ingresar la fecha que deseas de el reporte del día.</p>`,
                color: "blue",
            })
            loader.style.display = "none"
            return
        }
    }

    if (document.getElementById("desdeFecha").value == '' && document.getElementById("aFecha").value == '' &&
        turnoValue == "0" && document.getElementById("codigo").value == '' && document.getElementById("linea").value == "") {
        tablePvcProdTerm.clear().draw()
        GetAllPtPvc()
        return
    }

    let dt =
    {
        "fechaInicio": document.getElementById("desdeFecha").value,
        "fechaFin": document.getElementById("aFecha").value,
        "turno": turnoValue,
        "itemcode": document.getElementById("codigo").value,    //PUEDE SER VACIO
        "proceso": "PPVC",
        "linea": document.getElementById("linea").value,        //PUEDE SER VACIO
        "planta": planta,
        "corte": corte
    };


    fetch("/ProductoTerminado/FiltrarProductoTerminado", {       //Sppdx_FiltradoProductosTerminados
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dt)
    })
        .then(response => response.json())
        .then(data => {
            tablePvcProdTerm.clear().draw()
            // Hacer algo con los datos obtenidos en la respuesta
            let obj = JSON.parse(data.data); 
            let productotermPvc = obj.reportesProdTerm;
            
            let rows = [];            
            let sumTotal = 0;
            let sumEstandar = 0;
            let sumSobrePeso = 0;
            let sumEficiencia = 0;
            let sumScrapPtKg = 0
            let sumScrapPt = 0
            let PesoEstandarNFormula = 0;  //<<---- Suma de Peso Total Estandar para formula
            let kgPproducto = 0;    //<<--kg por producto

            //variables de la formula2
            //let sumSobrePeso2 = 0;

            if (productotermPvc.length == 0) {
                iziToast.error({
                    position: "topRight",
                    title: `Información`,
                    message: `<p>No existen registros con los filtros ingresados.</p>`
                })
                loader.style.display = "none"
                return;                
            }
            for (x = 0; x < productotermPvc.length; x++) {
                let scrapPtFormatted = parseFloat(productotermPvc[x].scrapPt).toFixed(2);

                // Creamos el ícono/botón con el valor id_Linea
                let BtnDetails = `<i class="bi bi-file-earmark-text fa-2x" value = "${productotermPvc[x].id_Linea}" value2 = "${productotermPvc[x].codigo}" id="btnDetails"></i>`;

                rows.push([
                    BtnDetails,
                    productotermPvc[x].id_Linea,
                    productotermPvc[x].codigo,
                    productotermPvc[x].atadosTarimas,
                    productotermPvc[x].numTubos,
                    productotermPvc[x].pesoTotal,
                    productotermPvc[x].pUnitEstandar,
                    productotermPvc[x].pUnitReal,
                    productotermPvc[x].sobrePeso,
                    productotermPvc[x].eficiencia,
                    productotermPvc[x].scrapTotal,//(scrap en kg)
                    scrapPtFormatted // (scrap en porcentaje con 2 decimales, para que coincida con el reporte de email)
                ])             

                sumTotal += productotermPvc[x].pesoTotal
                sumEstandar += productotermPvc[x].pUnitEstandar
                sumScrapPtKg += productotermPvc[x].scrapTotal
                PesoEstandarNFormula += (productotermPvc[x].pUnitEstandar * productotermPvc[x].numTubos)   //<<--- suma de Peso Total Estandar
                kgPproducto += (productotermPvc[x].kgPproducto * productotermPvc[x].horasTrabajo);

                //numtubosT += productotermPvc[x].numTubos;
                //pesounitT += productotermPvc[x].pUnitEstandar;
            }

            sumSobrePeso = ((sumTotal / PesoEstandarNFormula) - 1);  //<<--- Calculo de % Sobrepeso total
            //sumSobrePeso2 = SobrePesoFormTotal(sumTotal, PesoEstandarNFormula);

            sumEficiencia = (sumTotal / kgPproducto);       //<--- Calculo de la Eficiencia Total

            $("#sumTotal").text(sumTotal.toFixed(3));
            $("#sumEstandar").text(sumEstandar.toFixed(3));
            $("#sumSobrePeso").text((sumSobrePeso*100).toFixed(3));
            $("#sumEficiencia").text((sumEficiencia * 100).toFixed(3));
            $("#sumScrapPtKg").text(sumScrapPtKg.toFixed(3));
            sumScrapPt = (sumScrapPtKg / (sumScrapPtKg + sumTotal));
            $("#sumScrapPt").text(((sumScrapPt * 100)).toFixed(2));//scrap en % [multiplicamos]

            //dibura la tabla
            tablePvcProdTerm.rows.add(rows).draw(); 

            //let nodesLinea = tablePvcProdTerm.columns(0).nodes()
            let nodesScrap = tablePvcProdTerm.columns(11).nodes()
            let nodesEfic = tablePvcProdTerm.columns(9).nodes()
            console.log(tablePvcProdTerm.rows().data().toArray())

            for (x = 0; x < nodesScrap['0'].length; x++) {
                nodesScrap['0'][x].classList.add('scrap-info')
            }

            for (x = 0; x < nodesEfic['0'].length; x++) {
                nodesEfic['0'][x].classList.add('eficiencia-info')
            }
            loader.style.display = "none"
        })
        .catch(error => {
            // Manejar el error en caso de que ocurra
            console.error("Error:", error);
            loader.style.display = "none"
        });
}
        //Accion del btn de buscar en tabla Scrap
$(document).on("click", "#btn21", function () {
    filtradoCorteScrap();
});

//datos de tabla de Scrapt
function filtradoCorteScrap() {
    loader.style.display = "flex"
    let corte = document.getElementById("corte")
    let corteValue = corte.options[corte.selectedIndex].value //obtener el valor de corte

    let dt =
    {
        "fechaInicio": document.getElementById("desdeFechaScrap").value,
        "fechaFin": document.getElementById("aFechaScrap").value,
        "proceso": "PPVC",
        "corte": corteValue,
        "planta": planta,
        "codigo": document.getElementById("codigoScrap").value,
        "linea": document.getElementById("lineaScrap").value,
    };

        //acceder a "ProductoterminadoController"
    fetch("/ProductoTerminado/FiltrarScrap", {       //<<-- FiltroScrapCorte en appi
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dt)
    })
        .then(response => response.json())
        .then(data => {
            tablePvcScrap.clear().draw()
            
            var obj = JSON.parse(data.data);

            var productoScrap = obj.reportesScraps;

            let rows = [];     
            let KGTotalesScrap = 0;

            if (productoScrap.length == 0) {
                iziToast.error({
                    position: "topRight",
                    title: `Información`,
                    message: `<p>No existen registros con los filtros ingresados.</p>`
                })
                loader.style.display = "none"
                return;
            }

            //generar tabla de scrap
            for (x = 0; x < productoScrap.length; x++) {

                var fechaFormato = productoScrap[x].fecha.replace('T', '    ').slice(0, 19) + 'Hrs';

                    rows.push([productoScrap[x].linea, productoScrap[x].familia, productoScrap[x].peso,
                        productoScrap[x].comentarios, fechaFormato])
                KGTotalesScrap += productoScrap[x].peso
            }
            
            tablePvcScrap.rows.add(rows).draw();
            $("#SumScrapKG").text(KGTotalesScrap.toFixed(3));

            loader.style.display = "none"
        })
        .catch(error => {
            // Manejar el error en caso de que ocurra
            console.error("Error:", error);
            loader.style.display = "none"
        });
}

function ObtenerEmail() {
    fetch("/HistorialPedidas/GetEmails").then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsondata) => {
        var data = JSON.parse(jsondata.data)
        var sapemail = data.sapemail
        let rows = []
        if (sapemail.length > 0) {
            for (x = 0; x < sapemail.length; x++) {
                rows.push([sapemail[x].nombrecompleto, sapemail[x].name, sapemail[x].email])
            }

            tableCorreo.rows.add(rows).draw()
        }
    })
}


        //verificar el turno para desactivar "aFecha"
$("#turnoPT").change(function () {
    VerifyTurn(this); // Llama a la función VerifyTurn con el elemento seleccionado
});
function VerifyTurn(element) {
    const valoresValidos = ['1', '2', '3', '4', '5', '6', '7']

    if (valoresValidos.includes(element.options[element.selectedIndex].value)) {
        document.getElementById('aFecha').disabled = true
        document.getElementById('aFecha').value = ""
    } else {
        document.getElementById('aFecha').disabled = false
    }
}

        //Verificar si el select es corte 1 o 2 con JQuery, para desactivar "aFechaScrap"
$("#corte").on("change", function () {
    VerifyCorte($(this));
});
function VerifyCorte(element) {
    if (element.val() == '1' || element.val() == '2') {
        $("#aFechaScrap").prop("disabled", true).val("");
    } else {
        $("#aFechaScrap").prop("disabled", false);
    }
}

//Accion del btn al seleccionar una linea para su desglose
$(document).on("click", "#btnDetails", function () {
    // Obtener el valor del icono que fue clickeado
    let idLinea = $(this).attr("value");
    let codigo = $(this).attr("value2");

    //Solicitamos los datos de la linea
    verLinea(idLinea, codigo);
    //asignamos el numero de linea por si se descarga el excel
    LineaTablaDetalle = idLinea;

    // Mostrar el modal
    $('#detalleLineModal').addClass('show');
    $('#detalleLineModal').css('display', 'block');
});

//cerramos el modal details de linea
$(document).on("click", "#cerrarModalDetails", function () {
    $('#detalleLineModal').removeClass('show');
    $('#detalleLineModal').css('display', 'none');
});

//cerrar el modal 'details de linea' cuando se haga click fuera de él
$(document).on("click", function (e) {
    // Verifica si el clic fue fuera del modal y no sobre el modal o su contenido
    if ($(e.target).hasClass('modal') && $(e.target).attr('id') == 'detalleLineModal') {
        $('#detalleLineModal').removeClass('show');
        $('#detalleLineModal').css('display', 'none');
    }
});