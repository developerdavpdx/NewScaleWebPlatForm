let numerolineas;
let itemCode;
let pesoBascula;
let sobrePeso;
const loader = document.getElementById('loaderDiv')

$(document).ready(() => {
    //let obj = JSON.parse($("#ivb").val());
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
                let muestraModal;
                numLineas.response[x].asignado ? claseBtn = "btnAsignada" : claseBtn = "btn-info"
                numLineas.response[x].asignado ? muestraModal = 'data-toggle="modal" data-target="#EscaneoSKU" onclick="EscaneoSKU(this)"' : muestraModal = ''
                $("#buttonSection").append(`
                        <button class="btn ${claseBtn}" id="btn-item" data-linea-id="${x + 1}" ${muestraModal}>Línea ${x + 1}</button>
                    `)
            }
        }
    })
})

function EscaneoSKU(btnElement) {
    $("#skuScan").focus()
    numerolineas = $(btnElement).data('linea-id').toString()
    var data = {
        "linea": $(btnElement).data('linea-id').toString()
    }
}

function DetallesSkuLinea(btnElement) {
    /*numerolineas = $(btnElement).data('linea-id').toString()*/
    var data = {
        "idTicket": btnElement
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
        let data = JSON.parse(jsonData.data)
        data = data.ticketsInfos
        console.log(data)
        let obj = JSON.parse($("#ivb").val());
        txttickettemplate = obj.response;

        let fechaPesaje = ConvertDate(data[0].fechaPesaje)
        console.log(`${fechaPesaje.fecha} ${fechaPesaje.hora}`)

        var now = new Date();
        let datetime = now.getDate() + '/' + (now.getMonth() + 1) + '/' + now.getFullYear() + '  ' + now.getHours() + ':' + now.getMinutes();
        txttickettemplate = txttickettemplate.replace("--idlinea", numerolineas);
        txttickettemplate = txttickettemplate.replace("--fechayhora", datetime);
        txttickettemplate = txttickettemplate.replace("--folio", data[0].folio);
        txttickettemplate = txttickettemplate.replace("--turno", data[0].turno);
        txttickettemplate = txttickettemplate.replace("--linea", data[0].id_Linea);
        txttickettemplate = txttickettemplate.replace("--operacion", data[0].operacion);
        txttickettemplate = txttickettemplate.replace("--codigo", data[0].itemCode);
        txttickettemplate = txttickettemplate.replace("--numtubos", data[0].numTubos);
        txttickettemplate = txttickettemplate.replace("--pesoneto", pesoBascula);
        txttickettemplate = txttickettemplate.replace("--porcentaje", sobrePeso + '%');
        txttickettemplate = txttickettemplate.replace("--ordenfabricacion", data[0].ordenFabricacion);
        txttickettemplate = txttickettemplate.replace("--descripcion", data[0].itemName);
        txttickettemplate = txttickettemplate.replace("--categoria", data[0].categoria);
        txttickettemplate = txttickettemplate.replace("--datetimepesaje", `${fechaPesaje.fecha} ${fechaPesaje.hora}`);

        document.getElementById("modal-ticket-body").innerHTML = txttickettemplate;
    }).catch((error) => {
        console.log(error)
    })
}

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

//Primer paso validacion del sku asignado
let skuScan;
let ticket;
function ValidarSkuLinea() {
    skuScan = document.getElementById('skuScan').value
    if (skuScan == '') {
        iziToast.error({
            position: "topRight",
            title: `Ha surgido un error`,
            message: `<p>Favor de ingresar el código del item a comparar.</p>`,
        })
        return
    }
    var data = {
        "linea": numerolineas,
        "itemcode": skuScan
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
            let turno = obtenerTurno();
            AgregarNuevoTicket(skuScan, numerolineas, turno)
        } else {
            iziToast.error({
                position: "topRight",
                title: `Ha surgido un error`,
                message: `<p>El código del item no coincide con el código relacionado con la línea ${numerolineas}.</p>`,
            })
        }
    }).catch((error) => {
        iziToast.error({
            position: "topRight",
            title: `Ha surgido un error`,
            message: `<p>Error dentro del servidor del sistema.</p>`,
        })
    })
}
let ticketId;
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

//Curto paso se actualiza la informacion en la base de datos
function peticionActualizarTicket(idTicket, calidad) {
    let data = {
        "idTicket": ticketId,
        "peso": pesoBascula,
        "porcentaje": sobrePeso,
        "calidad": calidad
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
            $("#abrirModalFine").click()
        }
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

//Segundo Paso valida el peso del item ingresado
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
        if (jsonData.status == 200) {
            let data = JSON.parse(jsonData.data)
            console.log(data)
            if (data.estado) {
                pesoBascula = data.pesoNeto
                sobrePeso = data.sobrePeso
                peticionPrenderSemaforo((data.estado).toString())
            }
        } else {
            console.log("Error al obtener la informacion")
            loader.style.display = 'none'
        }
    }).catch((error) => {
        console.log(error)
        loader.style.display = 'none'
    })
}

//Tercer Paso, se prende el semaforo dependiendo el estado generado en el segundo paso
function peticionPrenderSemaforo(estado) {
    let data = {
        "estado": estado
    }

    fetch("/PesajePt/TurnOnLights", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        switch (estado) {
            //Estado 1 esta todo okey y semaforo esta en verde
            case "1":
                //Peticion para el actualizar el ticket e ir alimentando las demas tablas
                peticionActualizarTicket(ticket, "0")
                break
            //Estado 2 hay un bajo peso y se muestra modal de bajo peso
            case "2":
                $("#cerrarScan").click();
                document.getElementById("itemCodeModal").innerText = skuScan
                document.getElementById("lineModal").innerText = numerolineas
                peticionActualizarTicket(ticket, "1")
                $("#errorLimites").click()
                break
            //Estado 3 hay un sobre peso y se muestra modal de sobre peso
            case "3":
                $("#cerrarScan").click();
                document.getElementById("itemCodeModalSP").innerText = skuScan
                document.getElementById("lineModalSP").innerText = numerolineas
                peticionActualizarTicket(ticket, "1")
                $("#errorSobrePeso").click()
                break
        }
        loader.style.display = 'none'
    }).catch((error) => {
        console.log(error)
        loader.style.display = 'none'
    })
}

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