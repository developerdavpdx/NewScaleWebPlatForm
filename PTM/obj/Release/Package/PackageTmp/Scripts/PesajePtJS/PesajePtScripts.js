var botonConvertir = document.getElementById("boton-convertir");
let numerolineas;
let itemCode;
let pesoBascula;
let sobrePeso;
let pesoTubo
const loader = document.getElementById('loaderDiv')
let str
let codigo
let linea
let turno = obtenerTurno();
let item
let elementoAConvertir = document.getElementById("ticketPDF")
let txttickettemplate2

$(document).ready(() => {
    let obj = JSON.parse($("#ivb").val());
    txttickettemplate2 = obj.response;
    //txttickettemplate = obj.response;
    fetch("/PesajePt/GetNumberOfLinies").then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        console.log(jsonData)
        if (jsonData.status == 200) {
            let numLineas = JSON.parse(jsonData.data)
            console.log(numLineas)
            for (x = 0; x < numLineas.response.length; x++) {
                let claseBtn;
                let item
                numLineas.response[x].asignado ? claseBtn = "btnAsignada" : claseBtn = "btn-info"
                numLineas.response[x].itemCodeLinea ? item = `${numLineas.response[x].itemCodeLinea}` : item = ''
                $("#buttonSection").append(`
                        <button class="btn ${claseBtn}" id="btn-item" data-linea-id="${x + 1}" disabled>Línea ${x + 1} <br /> ${item}</button>
                    `)
            }
        }
    })
})

document.addEventListener("keypress", function (e) {
    ObtenerInfoCodigo(e)
})

function ObtenerInfoCodigo(e) {
    loader.style.display = "flex"
    const char = String.fromCharCode(e.charCode);
    if (e.charCode != 13) {
        str += String.fromCharCode(e.charCode);
    }

    if (str == undefined) {
        iziToast.error({
            position: "topRight",
            title: `Ha surgido un error`,
            message: `<p>Error al escanear el código. No se puede obtener información escaneada</p>`,
        })
        loader.style.display = "none"
    }

    if (str.includes('undefined')) {
        str = str.replace('undefined', '')
    }

    codigo = str;
    if (e.charCode == 13) {
        linea = codigo.slice(0, 2)
        if (linea[0] == 0) {
            console.log()
            linea = linea[1]
        }
        item = codigo.slice(2, codigo.length)
        //if (codigo.includes("||")) {
        //    codigo = codigo.split('||')
        //    linea = codigo[0][1]
        //    item = codigo[1]
            console.log(linea)
            console.log(item)
        //    console.log(str)
        str = "";
        //} else {
        //    codigo = codigo.split('``')
        //    linea = codigo[0][1]
        //    item = codigo[1]
        //    console.log(linea)
        //    console.log(item)
        //    console.log(str)
        //    str = "";
        //}
        if ((item == undefined || item == "") || (linea == undefined || linea == "")) {
            iziToast.error({
                position: "topRight",
                title: `Ha surgido un error`,
                message: `<p>La información del código ha llegado vacía Código: ${codigo}, Línea: ${linea}</p>`,
            })
            loader.style.display = 'none'
        }

        
        ValidarSkuLinea(linea, item)
    }

}

//Primer paso validacion del sku asignado
let skuScan;
let ticket;
function ValidarSkuLinea(linea, codigo) {
    var data = {
        "linea": linea,
        "itemcode": codigo
    }
    fetch("/PesajePt/ValidateSKU", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((responseJSON) => {
        if (responseJSON.status == 200) {
            AgregarNuevoTicket(codigo, linea, turno)
        } else {
            iziToast.error({
                position: "topRight",
                title: `Ha surgido un error`,
                message: `<p>El código del item no coincide con el código relacionado con la línea ${numerolineas}.</p>`,
            })
            loader.style.display = 'none'
        }
    }).catch((error) => {
        iziToast.error({
            position: "topRight",
            title: `Ha surgido un error`,
            message: `<p>Error dentro del servidor del sistema.</p>`,
        })
        loader.style.display = 'none'
    })
}

let ticketId;

//Segundo paso del proceso
function AgregarNuevoTicket(skuScan, numerolineas, turno) {
    let data = {
        "linea": numerolineas,
        "sku": skuScan,
        "turno": turno
    }

    fetch("/PesajePt/AddNewTicket", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        console.log(jsonData)
        if (jsonData.status == 200) {
            let data = JSON.parse(jsonData.data)
            ticketId = data.response
            validacionPeso(skuScan);
        } else {
            iziToast.error({
                position: "topRight",
                title: `Ha surgido un error`,
                message: `<p>Error al generar el ticket del producto terminado.</p>`,
            })
        }
    })
}

//Tercer paso del proceso
let intentosPeso = 0
function validacionPeso(itemCode) {
    loader.style.display = 'flex'
    let data = {
        "ItemCode": itemCode
    }
    fetch("/PesajePt/ValidateWeight", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        console.log(jsonData)
        if (jsonData.status == 200) {
            let data = JSON.parse(jsonData.data)
            pesoBascula = data.pesoNeto
            sobrePeso = data.sobrePeso
            pesoTubo = data.pesoTubos
            peticionPrenderSemaforo(data.result.toString())
        } else {
            if (intentosPeso <= 3) {
                intentosPeso++
                setTimeout(validacionPeso(itemCode), 3000)
            } else {
                iziToast.error({
                    position: "topRight",
                    title: `Ha surgido un error`,
                    message: `<p>Error al obtener el peso de la bascula. Favor de verificar que los servicios estén activos</p>`,
                })
                intentosPeso = 0
                loader.style.display = 'none'
            }
        }
    }).catch((error) => {
        console.log(error)
        iziToast.error({
            position: "topRight",
            title: `Ha surgido un error`,
            message: `<p>Error: ${error}.</p>`,
        })
        loader.style.display = 'none'
    })
}

//Cuarto Paso del proceso
function peticionPrenderSemaforo(estado) {
    switch (estado) {
        //Estado 1 esta todo okey y semaforo esta en verde
        case "1":
            //Peticion para el actualizar el ticket e ir alimentando las demas tablas
            peticionActualizarTicket(ticket, "0")
            break
        //Estado 2 hay un bajo peso y se muestra modal de bajo peso
        case "2":
            $("#cerrarScan").click();
            document.getElementById("itemCodeModal").innerText = item
            document.getElementById("lineModal").innerText = linea
            peticionActualizarTicket(ticket, "1")
            $("#errorLimites").click()
            break
        //Estado 3 hay un sobre peso y se muestra modal de sobre peso
        case "3":
            $("#cerrarScan").click();
            document.getElementById("itemCodeModalSP").innerText = item
            document.getElementById("lineModalSP").innerText = linea
            peticionActualizarTicket(ticket, "1")
            $("#errorSobrePeso").click()
            break
    }
}

function peticionActualizarTicket(idTicket, calidad) {
    console.log("Entra Quinto paso")
    let data = {
        "idTicket": ticketId,
        "peso": pesoBascula.toFixed(3),
        "porcentaje": sobrePeso.toFixed(3),
        "calidad": calidad,
        "pesoTubo": pesoTubo.toFixed(3)
    }
    fetch("/PesajePt/UpdateTicketById", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        console.log(jsonData)
        if (jsonData.status == 200) {
            DetallesSkuLinea(ticketId)
            $("#cerrarScan").click();
        } else {
            iziToast.error({
                position: "topRight",
                title: `Ha surgido un error`,
                message: `<p>Error: Al actualizar el ticket.</p>`,
            })
            loader.style.display = 'none'   
        }
    }).catch((error) => {
        iziToast.error({
            position: "topRight",
            title: `Ha surgido un error`,
            message: `<p>Error: ${error}.</p>`,
        })
        loader.style.display = 'none'
    })
}

function DetallesSkuLinea(btnElement) {
    /*numerolineas = $(btnElement).data('linea-id').toString()*/
    var data = {
        "id": ticketId
    }
    fetch("/PesajePt/GetTicketByLinie", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        console.log(jsonData)
        let data = jsonData.data.ticketsInfos
        //let obj = JSON.parse($("#ivb").val());
        //txttickettemplate = obj.response;

        let fechaPesaje = ConvertDate(data[0].fechaPesaje)
        console.log(`${fechaPesaje.fecha} ${fechaPesaje.hora}`)

        var now = new Date();
        let datetime = now.getDate() + '/' + (now.getMonth() + 1) + '/' + now.getFullYear() + '  ' + now.getHours() + ':' + now.getMinutes();
        txttickettemplate2 = txttickettemplate2.replace("--idlinea", numerolineas);
        txttickettemplate2 = txttickettemplate2.replace("--fechayhora", datetime);
        txttickettemplate2 = txttickettemplate2.replace("--folio", data[0].folio);
        txttickettemplate2 = txttickettemplate2.replace("--turno", data[0].turno);
        txttickettemplate2 = txttickettemplate2.replace("--linea", data[0].id_Linea);
        txttickettemplate2 = txttickettemplate2.replace("--operacion", data[0].operacion);
        txttickettemplate2 = txttickettemplate2.replace("--codigo", data[0].itemCode);
        txttickettemplate2 = txttickettemplate2.replace("--numtubos", data[0].numTubos);
        txttickettemplate2 = txttickettemplate2.replace("--pesoneto", pesoBascula.toFixed(3));
        txttickettemplate2 = txttickettemplate2.replace("--pesonetotub", pesoTubo.toFixed(2));
        txttickettemplate2 = txttickettemplate2.replace("--porcentaje", sobrePeso.toFixed(2) + '%');
        txttickettemplate2 = txttickettemplate2.replace("--ordenfabricacion", data[0].ordenFabricacion);
        txttickettemplate2 = txttickettemplate2.replace("--descripcion", data[0].itemName);
        txttickettemplate2 = txttickettemplate2.replace("--categoria", data[0].categoria);
        txttickettemplate2 = txttickettemplate2.replace("--datetimepesaje", `${datetime}`);

        document.getElementById("ticketPDF").innerHTML = txttickettemplate2;
        convertToPdfAndBase64();
    }).catch((error) => {
        loader.style.display = 'none'
        console.log(error)
    })
}

const convertToPdfAndBase64 = async () => {
    // Obtener el contenedor HTML que deseas convertir
    var scale = 4;

    // Establecer opciones para html2canvas
    var options = {
        scale: scale
    };

    document.getElementById("ticketPDF").removeAttribute("hidden")
    const container = document.getElementById('ticketPDF');

    // Convertir el contenedor en una imagen utilizando html2canvas
    const canvas = await html2canvas(container, options);

    // Crear una instancia de jsPDF
    window.jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({
        format: 'letter',
        orientation: 'portrait',
        compress: true,
        objcompress: true
    });

    /*doc.setPageSize([612, 1008]);*/
    const widthInPoints = doc.internal.pageSize.getWidth();
    const heightInPoints = doc.internal.pageSize.getHeight();
    // Establecer el ancho y altura en formato "letter"
    var width = 8.5 * 30; // Ancho en pulgadas convertido a píxeles (1 pulgada = 96 píxeles)
    var height = 11 * 96; // Altura en pulgadas convertido a píxeles (1 pulgada = 96 píxeles)
    /*console.log(widthInPoints)*/

    // Agregar la imagen al documento PDF
    doc.addImage(canvas.toDataURL('image/jpeg'), 'JPEG', 0, 0, widthInPoints, heightInPoints);

    // Generar la representación Base64 del documento PDF
    const base64String = doc.output('dataurlstring');
    console.log(base64String)
    // Mostrar la representación Base64 en la consola
    let baseSplit = base64String.split('base64,')
    let r = baseSplit[1]
    console.log(r)
    var datos = new FormData();

    datos.append("base64", r)

    // Crear un nuevo objeto XMLHttpRequest
    var xhr = new XMLHttpRequest();
    var url = '/PesajePt/AddBase64';
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
                    title: `Proceso exitoso`,
                    message: `<p>Se ha completado el proceso correctamente</p>`,
                })
            } else {
                console.log("Error")
            }

        } else {
            // Manejar el error
            console.log('Error: ' + xhr.status);
        }
    };

    ////Enviar la solicitud
    xhr.send(datos);
    document.getElementById("ticketPDF").hidden = true
    loader.style.display = 'none'
};

function Imprimir() {

    // Open a popup window to print the content of the modal
    var printWindow = window.open('', '_blank');
    printWindow.document.write(txttickettemplate);
    printWindow.document.close();

    // Wait for the popup window to load its content and then call the print function
    printWindow.onload = function () {
        printWindow.print();
    };
}

setInterval(() => {
    if (localStorage.getItem('refresh') != null) {
        localStorage.removeItem('refresh')
        window.location.reload()
    }
}, 1000)




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

//Segundo Paso valida el peso del item ingresado




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

//function ObtenerPesoPython() {

//    let url = 'https://127.0.0.1:5000/api/getdatabascula';
//    const callbackName = 'myCallback';
//    const script = document.createElement("script");
//    script.src = `${url}?callback=${callbackName}`;
//    window[callbackName] = function(data)
//    {
//        console.log(data);
//    }

//    document.body.appendChild(script); 
//}