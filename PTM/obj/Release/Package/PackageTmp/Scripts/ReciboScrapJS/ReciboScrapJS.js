let tablaReciboScrap;
let data_rows = [];
let dataInfo;
let inptTurno = document.getElementById('turno')

const loader = document.getElementById('loaderDiv')
let IPS = 0
let CLAY = 0
let DWV = 0
let C900 = 0
let ESMERALD = 0
let CONDUIT = 0
let PURGA = 0

loader.style.display = 'flex'
let tableCorreo;
let planta

inptTurno.addEventListener("keydown", (event) => {
    if (event.key === "e" || event.key === "E") {
        event.preventDefault();
    }
});

$(document).ready(() => {
    localStorage.planta == '335' ? planta = '2' : planta = '1'
    tablaReciboScrap = $("#tablaReciboScrap").DataTable({
        ordering: false,
        responsive: true,
        searching: true
    })

    tableCorreo = $("#tablaCorreo").DataTable({
        ordering: false,
        responsive: true
    })
    ObtenerEmail()
    peticionObtenerScrap()
})

function ObtenerEmail() {
    fetch("/ReciboScrap/GetEmailsMolinos").then((response) => {
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

function peticionObtenerScrap() {
    let data = {
        "planta": planta
    }
    fetch("/ReciboScrap/GetAllReceiveScrap", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        if (jsonData.status == 200) {
            let dataresponse = JSON.parse(jsonData.data)
            dataInfo = dataresponse.response
            let Rows

            Rows = MuestreoInfoTabla(dataInfo)

            tablaReciboScrap.rows.add(Rows).draw()

            document.getElementById("tdIPS").textContent = IPS.toFixed(2)
            document.getElementById("tdCLAY").textContent = CLAY.toFixed(2)
            document.getElementById("tdDWV").textContent = DWV.toFixed(2)
            document.getElementById("tdC900").textContent = C900.toFixed(2)
            document.getElementById("tdESMERALD").textContent = ESMERALD.toFixed(2)
            document.getElementById("tdCONDUIT").textContent = CONDUIT.toFixed(2)
            document.getElementById("tdPURGA").textContent = PURGA.toFixed(2)

            loader.style.display = 'none'
        } else {
            console.log("error if")
            loader.style.display = 'none'
        }
    }).catch((error) => {
        /*console.log(error)*/
        alert(error.toString())
        loader.style.display = 'none'
    })
}

function filtradoReciboScrap() {
    loader.style.display = 'flex'
    let fehcaInicioFiltrado = document.getElementById('desdeFecha').value
    let fechaFinFiltrado = document.getElementById('aFecha').value
    let turno = document.getElementById("turno")
    let corte = turno.options[turno.selectedIndex].value

    var data = {
        "fechaInicio": fehcaInicioFiltrado,
        "fechaFin": fechaFinFiltrado,
        "turno": corte,
        "planta": planta
    }

    if(corte == "1"){
        if (fehcaInicioFiltrado == '' || fechaFinFiltrado == '') {
            iziToast.error({
                position: "topRight",
                title: `Ha surgido un error`,
                message: `<p>Favor de ingresar las fechas de filtrados para continuar.</p>`
            })
            loader.style.display = 'none'
            return
        }
    }

    if (corte == "0" && fehcaInicioFiltrado == '' && fechaFinFiltrado == '') { 
        peticionObtenerScrap()
        return
    }

    console.log(data)
    fetch("/ReciboScrap/FilterInfoScrap", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        if (jsonData.status == 200) {
            var data = JSON.parse(jsonData.data)
            var dataInfo = data.scrapFiltrado
            tablaReciboScrap.clear().draw()
            if (dataInfo.length == 0) {
                document.getElementById("tdIPS").textContent = '-'
                document.getElementById("tdCLAY").textContent = '-'
                document.getElementById("tdDWV").textContent = '-'
                document.getElementById("tdC900").textContent = '-'
                document.getElementById("tdESMERALD").textContent = '-'
                document.getElementById("tdCONDUIT").textContent = '-'
                document.getElementById("tdPURGA").textContent = '-'
                loader.style.display = 'none'
                return;
            }
            let Rows
            if (dataInfo.length != 0) {
                IPS = 0
                CLAY = 0
                DWV = 0
                C900 = 0
                ESMERALD
                CONDUIT = 0
                PURGA = 0
                Rows = MuestreoInfoTabla(dataInfo)
                tablaReciboScrap.rows.add(Rows).draw()

                document.getElementById("tdIPS").textContent = IPS.toFixed(2)
                document.getElementById("tdCLAY").textContent = CLAY.toFixed(2)
                document.getElementById("tdDWV").textContent = DWV.toFixed(2)
                document.getElementById("tdC900").textContent = C900.toFixed(2)
                document.getElementById("tdESMERALD").textContent = ESMERALD.toFixed(2)
                document.getElementById("tdCONDUIT").textContent = CONDUIT.toFixed(2)
                document.getElementById("tdPURGA").textContent = PURGA.toFixed(2)

                loader.style.display = 'none'
            }
        } else {
            iziToast.error({
                position: "topRight",
                title: `Ha surgido un error`,
                message: `<p>Error al filtrar los resultados del scrap.</p>`
            })
            loader.style.display = 'none'
            return
        }
    }).catch((error) => {
        iziToast.error({
            position: "topRight",
            title: `Ha surgido un error`,
            message: `<p>Error de Servidor: ${error.toString()}.</p>`
        })
        loader.style.display = 'none'
        return
    })
}

function ConvertDate(dateTime) {
    const fecha = new Date(dateTime);
    const day = fecha.getDate().toString().padStart(2, '0');
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const year = fecha.getFullYear();
    var date = `${day}/${month}/${year}`
    var hours = `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')} ${fecha.getHours() >= 12 ? 'PM' : 'AM'}`
    let listInfoDate = { "fecha": date, "hora": hours }
    return listInfoDate
}

function MuestreoInfoTabla(dataInfo) {
    let Rows = []
    for (x = 0; x < dataInfo.length; x++) {
        let fecha = ConvertDate(dataInfo[x].fechaScrap)
        let turno
        if (dataInfo[x].familia == "IPS") {
            dataInfo[x].turno == 1 ? turno = `${dataInfo[x].turno} ER` : turno = `${dataInfo[x].turno} DO`
            Rows.push([`${FormateoFecha(dataInfo[x].fechaEnvio)}`, turno, dataInfo[x].peso.toFixed(2), "-", "-", "-", "-", "-", "-", dataInfo[x].proceso])
            IPS += dataInfo[x].peso
        }
        if (dataInfo[x].familia == "CLAY") {
            dataInfo[x].turno == 1 ? turno = `${dataInfo[x].turno} ER` : turno = `${dataInfo[x].turno} DO`
            Rows.push([`${FormateoFecha(dataInfo[x].fechaEnvio)}`, turno, "-", dataInfo[x].peso.toFixed(2), "-", "-", "-", "-", "-", dataInfo[x].proceso])
            CLAY += dataInfo[x].peso
        }
        if (dataInfo[x].familia == "DWV") {
            dataInfo[x].turno == 1 ? turno = `${dataInfo[x].turno} ER` : turno = `${dataInfo[x].turno} DO`
            Rows.push([`${FormateoFecha(dataInfo[x].fechaEnvio)}`, turno, "-", "-", dataInfo[x].peso.toFixed(2), "-", "-", "-", "-", dataInfo[x].proceso])
            DWV += dataInfo[x].peso
        }
        if (dataInfo[x].familia == "C900") {
            dataInfo[x].turno == 1 ? turno = `${dataInfo[x].turno} ER` : turno = `${dataInfo[x].turno} DO`
            Rows.push([`${FormateoFecha(dataInfo[x].fechaEnvio)}`, turno, "-", "-", "-", dataInfo[x].peso.toFixed(2), "-", "-", "-", dataInfo[x].proceso])
            C900 += dataInfo[x].peso
        }
        if (dataInfo[x].familia == "ESMERALD") {
            dataInfo[x].turno == 1 ? turno = `${dataInfo[x].turno} ER` : turno = `${dataInfo[x].turno} DO`
            Rows.push([`${FormateoFecha(dataInfo[x].fechaEnvio)}`, turno, "-", "-", "-", "-", dataInfo[x].peso.toFixed(2), "-", "-", dataInfo[x].proceso])
            ESMERALD += dataInfo[x].peso
        }
        if (dataInfo[x].familia == "CONDUIT") {
            dataInfo[x].turno == 1 ? turno = `${dataInfo[x].turno} ER` : turno = `${dataInfo[x].turno} DO`
            Rows.push([`${FormateoFecha(dataInfo[x].fechaEnvio)}`, turno, "-", "-", "-", "-", "-", dataInfo[x].peso.toFixed(2), "-", dataInfo[x].proceso])
            CONDUIT += dataInfo[x].peso
        }
        if (dataInfo[x].familia == "PURGA") {
            dataInfo[x].turno == 1 ? turno = `${dataInfo[x].turno} ER` : turno = `${dataInfo[x].turno} DO`
            Rows.push([`${FormateoFecha(dataInfo[x].fechaEnvio)}`, turno, "-", "-", "-", "-", "-", "-", dataInfo[x].peso.toFixed(2), dataInfo[x].proceso])
            PURGA += dataInfo[x].peso
        }
    }

    return Rows
}

let rgb1 = [165, 165, 165];
let rgb2 = [165, 165, 165];
let rgb3 = [165, 165, 165];

async function generarpdf() {
    loader.style.display = 'flex';

    window.jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({
        format: 'letter',
        orientation: 'landscape'
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
        var imageWidth = usableWidth * 0.35;
        var aspectRatio = imgHeight / imgWidth;
        var imageHeight = imageWidth * aspectRatio;

        // Calcular la posición para la imagen
        var imageX = marginLeft;
        var imageY = 10;

        // Dibujar la imagen
        doc.addImage(img, 'PNG', (usableWidth / 2) - imageWidth, imageY, imageWidth, imageHeight);
        doc.setFont(undefined, 'bold');
        doc.setFontSize(16);
        var text = "REPORTE RECIBO SCRAP";
        doc.text(text, (usableWidth / 2) + 45, 18, { align: 'center', });
        doc.setFont(undefined, 'normal');
        doc.setFontSize(14);
        var text = "Generado por: " + document.getElementById("labelName").innerHTML;
        doc.text(text, (usableWidth / 2) + 45, 23, { align: 'center', });

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
        doc.text(text, (usableWidth / 2) + 45, 29, { align: 'center', });


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
        var text = 'RECIBO SCRAP';
        var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize(); // Ancho del texto
        var textY = 46; // Coordenada Y del texto
        doc.text(text, doc.internal.pageSize.getWidth() / 2, textY, { align: 'center' });


        // Define la posición de la tabla
        var startX = 10;
        var startY = 53;



        doc.autoTable({
            head: [['Fecha', 'Turno', 'IPS', 'CLAY', 'DWV', 'C900', 'ESMERALDA', 'CONDUIT', 'PURGA', 'PROCESO']],
            body: tablaReciboScrap.rows().data().toArray(),
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
                { align: 'center' }
            ]
        });

        startY = doc.autoTable.previous.finalY + 10;

        doc.autoTable({
            head: [[{ content: 'TOTAL SCRAP FAMILIAS', colSpan: 8, styles: { halign: 'center' } }], ['IPS', 'CLAY', 'DWV', 'C900', 'ESMERALDA', 'CONDUIT', 'PURGA']],
            body: [[IPS.toFixed(2), CLAY.toFixed(2), DWV.toFixed(2), C900.toFixed(2), ESMERALD.toFixed(2), CONDUIT.toFixed(2), PURGA.toFixed(2)]],
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
                { align: 'center' }
            ]
        });



        doc.save("Recibo Scrap .pdf");
        loader.style.display = 'none';
    };
}


function generarexcel() {
    var datos = new FormData();

    datos.append("matrizdatos", JSON.stringify(tablaReciboScrap.rows().data().toArray()));
    datos.append("arraydatos", JSON.stringify([IPS, CLAY, DWV, C900, ESMERALD, CONDUIT, PURGA]));
    // Crear un nuevo objeto XMLHttpRequest
    var xhr = new XMLHttpRequest();
    var url = '/ReciboScrap/generarexcel';
    // Configurar la solicitud
    xhr.open('POST', url, true);

    // Manejar la respuesta
    xhr.onload = function () {
        if (xhr.status === 200) {
            // Mostrar el texto de la respuesta en la consola
            var respuesta = JSON.parse(xhr.responseText);
            if (respuesta.R == 1) {
                descargarArchivo('Recibo Scrap.xlsx', respuesta.data);
            } else { alert("Error al generar el archivo de excel"); }

        } else {
            // Manejar el error
            console.log(xhr.responseText)
            console.log('Error: ' + xhr.status);
        }
    };

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

function emailReporte() {
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
        var imageWidth = usableWidth * 0.35;
        var aspectRatio = imgHeight / imgWidth;
        var imageHeight = imageWidth * aspectRatio;

        // Calcular la posición para la imagen
        var imageX = marginLeft;
        var imageY = 10;

        // Dibujar la imagen
        doc.addImage(img, 'PNG', (usableWidth / 2) - imageWidth, imageY, imageWidth, imageHeight);
        doc.setFont(undefined, 'bold');
        doc.setFontSize(16);
        var text = "REPORTE RECIBO SCRAP";
        doc.text(text, (usableWidth / 2) + 45, 18, { align: 'center', });
        doc.setFont(undefined, 'normal');
        doc.setFontSize(14);
        var text = "Generado por: " + document.getElementById("labelName").innerHTML;
        doc.text(text, (usableWidth / 2) + 45, 23, { align: 'center', });

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
        doc.text(text, (usableWidth / 2) + 45, 29, { align: 'center', });


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
        var text = 'RECIBO SCRAP';
        var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize(); // Ancho del texto
        var textY = 46; // Coordenada Y del texto
        doc.text(text, doc.internal.pageSize.getWidth() / 2, textY, { align: 'center' });


        // Define la posición de la tabla
        var startX = 10;
        var startY = 53;



        doc.autoTable({
            head: [['Fecha', 'Turno', 'IPS', 'CLAY', 'DWV', 'C900', 'ESMERALDA', 'CONDUIT', 'PURGA', 'PROCESO']],
            body: tablaReciboScrap.rows().data().toArray(),
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
                { align: 'center' }
            ]
        });

        startY = doc.autoTable.previous.finalY + 10;

        doc.autoTable({
            head: [[{ content: 'TOTAL SCRAP FAMILIAS', colSpan: 8, styles: { halign: 'center' } }], ['IPS', 'CLAY', 'DWV', 'C900', 'ESMERALDA', 'CONDUIT', 'PURGA']],
            body: [[IPS.toFixed(2), CLAY.toFixed(2), DWV.toFixed(2), C900.toFixed(2), ESMERALD.toFixed(2), CONDUIT.toFixed(2), PURGA.toFixed(2)]],
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
                { align: 'center' }
            ]
        });
        let arrayCorreos = []
        var pdfData = doc.output();

        var base64Data = btoa(pdfData);

        let correosNodes = tableCorreo.columns(2).nodes()

        for (x = 0; x < correosNodes[0].length; x++) {
            arrayCorreos.push(correosNodes[0][x].innerText)
        }

        var datos = new FormData();
        datos.append("tiporeporte", "Reporte Recibo Scrap");
        datos.append("base64PDF", base64Data);
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
    }
}

function FormateoFecha(fecha) {
    var fechaOriginal = fecha;
    var fechaObjeto = new Date(fechaOriginal);

    var opciones = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    };

    var fechaFormateada = fechaObjeto.toLocaleString("es-ES", opciones);
    return fechaFormateada;
}

function verifyTurn(element){
    if (element.value == "2" || element.value == "3") {
        document.getElementById("aFecha").disabled = true
        document.getElementById("aFecha").value = ""
    } else {
        document.getElementById("aFecha").disabled = false
    }
}