const loader = document.getElementById('loaderDiv')
let htmlTicket;
let newHtmlTicket;
const dateG = new Date()
let nextIdEM;
let sttcPeso = document.getElementById('staticPeso')

sttcPeso.addEventListener("keydown", (event) => {
    if (event.key === "e" || event.key === "E") {
        event.preventDefault();
    }
});

$(document).ready(async () => {
    loader.style.display = "flex"
    await getLineas()
    await ObtenerSiguienteId()
    await peticionTicketMolinos()
})

function limpiarFormulario() {
    document.getElementById('formularioEnvioScrap').reset();
    document.getElementById("ticketMolinos").innerHTML = "";
    ObtenerSiguienteId()
    peticionTicketMolinos()
}

function ObtenerSiguienteId() {
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
    let inputStaticProc = document.getElementById("staticProceso").value

    let inputStaticFam = document.getElementById("selectFamilia")
    let Familia = inputStaticFam.options[inputStaticFam.selectedIndex].textContent

    let inputStaticTipo = document.getElementById("selecteTipo")
    let Tipo = inputStaticTipo.options[inputStaticTipo.selectedIndex].textContent

    let inputStaticSFam = document.getElementById("selecteSFamilia")
    let SubFamilia = inputStaticSFam.options[inputStaticSFam.selectedIndex].textContent

    let inputStaticLinea = document.getElementById("selectLinea")
    let Linea = inputStaticLinea.options[inputStaticLinea.selectedIndex].textContent

    let comentarios = document.getElementById('comentariosArea').value

    if (inputStaticOpd == '' || inputStaticCda == '' || inputStaticPeso == '' || inputStaticUom == '' ||
        inputStaticProc == '' || Familia == '' || Tipo == '' || SubFamilia == '') {
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
        "familiaEM": Familia,
        "tipoEM": Tipo,
        "subFamiliaEM": SubFamilia,
        "turnoEM": turno.toString(),
        "comentariosEM": comentarios,
        "procesoEM": inputStaticProc,
        "unidadEM": inputStaticUom,
        "fechaEnvioEM": dateG.toLocaleDateString(),
        "linea": Linea
    }

    peticionMandarMolinos(data)
}

function getLineas() {
    fetch("/PesajePt/GetNumberOfLinies").then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        console.log(jsonData)
        if (jsonData.status == 200) {
            numLineas = JSON.parse(jsonData.data)
            for (x = 0; x < numLineas.response.length; x++) {
                $("#selectLinea").append(`
                        <option value="${numLineas.response[x].Id_linea}">${x + 1}</option>
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
            console.log("Entra error if")
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
            document.getElementById('itemSap').textContent = itemCode
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
        default:
            break;
    }
}