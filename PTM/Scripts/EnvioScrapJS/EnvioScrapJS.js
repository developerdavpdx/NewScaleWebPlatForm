const loader = document.getElementById('loaderDiv')
let htmlTicket;
let newHtmlTicket;
const dateG = new Date()
let nextIdEM;
let sttcPeso = document.getElementById('staticPeso')
let planta

sttcPeso.addEventListener("keydown", (event) => {
    if (event.key === "e" || event.key === "E") {
        event.preventDefault();
    }
});

//$(document).load(async () => {
//    await ObtenerSiguienteId()
//})

ObtenerSiguienteId()

$(document).ready(async () => {
    localStorage.planta == '335' ? planta = '2' : planta = '1'
    loader.style.display = "flex"
    await getLineas()
    await peticionTicketMolinos()
})

function limpiarFormulario() {
    document.getElementById('formularioEnvioScrap').reset();
    document.getElementById("ticketMolinos").innerHTML = "";
    ObtenerSiguienteId()
    peticionTicketMolinos()
}

function ObtenerSiguienteId(){
    fetch("/EnvioScrap/GetNextIdSendMills").then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        if (jsonData.status == 200) {
            console.log(jsonData)
            let data = JSON.parse(jsonData.data)
            nextIdEM = data.response + 1
        }
    }).catch((error) => {
        console.log(error)
    })
}

function EnviarMolinos() {
    loader.style.display = "flex"

    let inputStaticOpd = document.getElementById("staticOperador").value
    let inputStaticCda = document.getElementById("staticCodigo").value
    let inputStaticPeso = document.getElementById("staticPeso").value
    let inputStaticUom = document.getElementById("staticUnidad").value
    let inputStaticProc = document.getElementById("staticProceso")
    let proceso = inputStaticProc.options[inputStaticProc.selectedIndex].textContent
    let inputFamilia = document.getElementById("staticFamilia").value

    let inputStaticLinea = document.getElementById("selectLinea")
    let Linea = inputStaticLinea.options[inputStaticLinea.selectedIndex].textContent

    let comentarios = document.getElementById('comentariosArea').value

    if (inputStaticOpd == '' || inputStaticCda == '' || inputStaticPeso == '' || inputStaticUom == '' ||
        proceso == '' || inputFamilia == '') {
        iziToast.error({
            position: "topRight",
            title: `Ha surgido un error`,
            message: `<p>Favor de verificar que todos lo campos estén completos.</p>`,
        })
        loader.style.display = "none"
        return 
    }

    var turno = obtenerTurno()

    var data = {
        "operadorEM": inputStaticOpd,
        "codigoItemEM": inputStaticCda,
        "pesoEM": inputStaticPeso.toString(),
        "turnoEM": turno.toString(),
        "comentariosEM": comentarios,
        "procesoEM": proceso,
        "unidadEM": inputStaticUom,
        "fechaEnvioEM": dateG.toLocaleDateString(),
        "linea": Linea,
        "familiaEM": inputFamilia
    }

    peticionMandarMolinos(data)
}

function getLineas() {
    let data = {
        "planta": planta
    }
    fetch("/PesajePt/GetNumberOfLinies", {
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
            numLineas = JSON.parse(jsonData.data)
            console.log(numLineas)
            for (x = 0; x < numLineas.response.length; x++) {
                $("#selectLinea").append(`
                        <option value="${numLineas.response[x].id_linea}">${x + 1}</option>
                    `)
            }
        }
    })
}

function peticionMandarMolinos(data) {
    fetch("/EnvioScrap/SendToMills", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        if (jsonData.status == 200) {
            let htmlTicketImprimir = document.getElementById("ticketMolinos").innerHTML
            console.log(htmlTicketImprimir)
            var printWindow = window.open('', '_blank');
            printWindow.document.write(htmlTicketImprimir);
            printWindow.document.close();

            // Wait for the popup window to load its content and then call the print function
            printWindow.onload = function () {
                printWindow.print();
            };
            iziToast.success({
                position: "topRight",
                title: `Envío Correcto`,
                message: `<p>Se ha mandado el ${data.codigoItemEM} a molinos correctamente.</p>`,
            })
            limpiarFormulario()
            loader.style.display = "none"
        } else {
            
            loader.style.display = "none"
        }
    }).catch((error) => {
        console.log(error)
        loader.style.display = "none"
    })
}

function peticionTicketMolinos() {
    let inputStaticOpd = document.getElementById("staticOperador").value
    let turno = obtenerTurno()
    fetch("/EnvioScrap/ObtenerTicketMolino").then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        if (jsonData.status == 200) {
            var data = JSON.parse(jsonData.data)
            htmlTicket = data.response
            var now = new Date();
            let datetime = now.getDate() + '/' + (now.getMonth() + 1) + '/' + now.getFullYear() + '  ' + now.getHours() + ':' + now.getMinutes();
            let newHtmlTicket;
            newHtmlTicket = htmlTicket.replace("--fechayhora", datetime)
            newHtmlTicket = newHtmlTicket.replace("--operador", inputStaticOpd)
            newHtmlTicket = newHtmlTicket.replace("--idticket", nextIdEM)
            newHtmlTicket = newHtmlTicket.replace("--turno", turno)
            newHtmlTicket = newHtmlTicket.replace("--fechayhoramolino", datetime)
            document.getElementById("ticketMolinos").innerHTML += newHtmlTicket
            loader.style.display = "none"
        } else {
            loader.style.display = "none"
        }
    }).catch((error) => {
        loader.style.display = "none"
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

function escrituraTicket(element) {
    var idElement = element.id
    console.log(idElement)
    switch (idElement) {
        case "staticCodigo":
            let itemCode = document.getElementById("staticCodigo").value
            
            break;
        case "selectFamilia":
            let inputStaticFam = document.getElementById("selectFamilia")
            let Familia = inputStaticFam.options[inputStaticFam.selectedIndex].textContent
            document.getElementById("familiaSap").textContent = Familia
            break;
        case "selecteSFamilia":
            let inputStaticSFam = document.getElementById("selecteSFamilia")
            let SubFamilia = inputStaticSFam.options[inputStaticSFam.selectedIndex].textContent
            document.getElementById("subFamilia").textContent = SubFamilia
            break;
        case "staticPeso":
            let peso = document.getElementById("staticPeso").value
            document.getElementById("pesoTicket").textContent = peso
            break;
        case "staticFamilia":
            let familia = document.getElementById("staticFamilia").value
            document.getElementById("familiaSap").textContent = familia
        default:
            break;
    }
}

const miInput = document.getElementById('staticCodigo');
const selectLinea = document.getElementById("selectLinea")
const staticProceso = document.getElementById("staticProceso")
const staticFamilia = document.getElementById("staticFamilia")

let typingTimer;
const doneTypingInterval = 1000;
let itemCode;

miInput.addEventListener('input', () => {
    loader.style.display = 'flex'
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        if (miInput != '') {
            let codigo = miInput.value
            miInput.value = ''
            let linea = codigo.slice(1, 2)
            console.log(linea)
            let codigoSAP = codigo.slice(2, codigo.length)
            miInput.value = codigoSAP
            document.getElementById('itemSap').textContent = codigoSAP
            for (let index = 0; index < selectLinea.length; index++) {
                console.log(selectLinea[index].value == linea)
                if (selectLinea[index].value == linea) {
                    selectLinea.value = linea
                }
            }
            ObtenerPeso(codigoSAP)
        }
    }, doneTypingInterval)
});

function ObtenerPeso(codigoSAP) {
    let data = {
        "bascula": "1"
    }
    fetch("/EnvioScrap/GetScaleWeight", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        if (jsonData.status == 200) {
            console.log(jsonData)
            let data = JSON.parse(jsonData.data)
            let pesoInput = document.getElementById("staticPeso")
            if (pesoInput.value != '') {
                pesoInput.value = data.response
                document.getElementById("pesoTicket").textContent = data.response
            } else {
                pesoInput.value = ''
                pesoInput.value = data.response
                document.getElementById("pesoTicket").textContent = data.response
            }
            $("#staticCodigo").blur()

            peticionObtenerInfoName(codigoSAP)
        } else {
            /*loader.style.display = 'none'*/
            iziToast.error({
                position: "topRight",
                title: `Ha surgido un error`,
                message: `<p>Favor de verificar que todos lo campos estén completos.</p>`,
            })
            peticionObtenerInfoName(codigoSAP)
        }
    }).catch((error) => {
        iziToast.error({
            position: "topRight",
            title: `Ha surgido un error`,
            message: `<p>${error}.</p>`,
        })
    })
}

function peticionObtenerInfoName(codigoSAP) {
    let data = {
        "itemCode": codigoSAP,
        "bascula": "1"
    }
    fetch("/EnvioScrap/GetItemNameInfo", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        if (jsonData.status == 200) {
            let json = JSON.parse(jsonData.data)
            let nombreItem = json.data[0].nombreitem
            console.log(nombreItem)
            let splitName = nombreItem.split(" ");
            if (splitName.includes("PVC")) {
                staticProceso.value = "PPVC"
            } else {
                staticProceso.value = "INY"
            }

            if (splitName.includes('IPS') && splitName.indexOf('IPS') < splitName.length - 1) {
                staticFamilia.value = splitName[4]
            } else {
                staticFamilia.value = splitName[3]
                document.getElementById("familiaSap").textContent = splitName[3]
            }

            if (staticFamilia.value == '') {
                staticFamilia.value = splitName[3]
            }
            
            loader.style.display = 'none'
        } else {
            loader.style.display = 'none'
        }
    }).catch((error) => {
        iziToast.error({
            position: "topRight",
            title: `Ha surgido un error`,
            message: `<p>${error}.</p>`,
        })
    })
}