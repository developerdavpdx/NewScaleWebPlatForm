const loader = document.getElementById('loaderDiv')
let nextIdScrap;
let staticCodigo;
let inputIdAnterior = document.getElementById("inputIdAnterior")
let stPeso = document.getElementById("staticPeso")
let staticUnidad = document.getElementById("staticUnidad")

inputIdAnterior.addEventListener("keydown", (event) => {
    if (event.key === "e" || event.key === "E") {
        event.preventDefault();
    }
});

stPeso.addEventListener("keydown", (event) => {
    if (event.key === "e" || event.key === "E") {
        event.preventDefault();
    }
});


staticUnidad.addEventListener("keydown", function (event) {
    if (event.keyCode >= 48 && event.keyCode <= 57) { // si la tecla presionada es un número
        event.preventDefault(); // cancelar la entrada
    }
});

$(document).ready(() => {
    loader.style.display = "flex"
    ObtenerSiguienteIdScrap()
    peticionTicketMolinos()
})

function buscarIdAnterior() {
    loader.style.display = "flex"
    let idProduccion = document.getElementById("inputIdAnterior")
    let data = {
        "idProduccion": idProduccion.value
    }
    fetch("/PesajeMolinos/GetEnvioMolinosInfo", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        if (jsonData.status == 200) {
            let jsonParse = JSON.parse(jsonData.data)
            let data = jsonParse.result
            console.log(data)
            let fecha = ConvertDate(data[0].fechaEnvio)
            document.getElementById("inputFechaPT").value = `${fecha.fecha} ${fecha.hora}`
            document.getElementById("inputTurnoPT").value = `${data[0].turno} ${data[0].turno == 1 ? "ER" : "DO"}`
            document.getElementById("inputPesoPT").value = `${data[0].peso} ${data[0].unidad}`
            document.getElementById("inputOperadorPT").value = `${data[0].operador}`

            loader.style.display = "none"
        } else {
            console.log("entra a if")
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
            console.log(htmlTicket)
            var now = new Date();
            let datetime = now.getDate().toString().padStart(2, '0') + '/' + (now.getMonth() + 1).toString().padStart(2, '0') + '/' + now.getFullYear() + '  ' + now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
            let newHtmlTicket;
            newHtmlTicket = htmlTicket.replace("--fechayhora", datetime)
            newHtmlTicket = newHtmlTicket.replace("--operador", inputStaticOpd)
            newHtmlTicket = newHtmlTicket.replace("--idticket", nextIdScrap)
            newHtmlTicket = newHtmlTicket.replace("--turno", turno)
            newHtmlTicket = newHtmlTicket.replace("--fechayhoramolino", datetime)
            document.getElementById("ticketMolinos").innerHTML = newHtmlTicket
            loader.style.display = "none"
        } else {
            loader.style.display = "none"
        }
    }).catch((error) => {
        loader.style.display = "none"
    })
}

function agregarScrap() {
    let inputIdAnterior = document.getElementById("inputIdAnterior").value
    let staticOperador = document.getElementById("staticOperador").value
    let staticCodigo = document.getElementById("staticCodigo").value
    let staticPeso = document.getElementById("staticPeso").value
    let staticUnidad = document.getElementById("staticUnidad").value
    let staticProceso = document.getElementById("staticProceso").value
    let selectFamilia = document.getElementById("selectFamilia")
    selectFamilia = selectFamilia.options[selectFamilia.selectedIndex].textContent
    let selectTipo = document.getElementById("selectTipo")
    selectTipo = selectTipo.options[selectTipo.selectedIndex].textContent
    let selecteSFamilia = document.getElementById("selecteSFamilia")
    selecteSFamilia = selecteSFamilia.options[selecteSFamilia.selectedIndex].textContent

    if (staticProceso == '' || inputIdAnterior == '' || staticOperador == '' || staticCodigo == '' || staticPeso == '' || staticUnidad == '' ||
        staticUnidad == '' || selectFamilia == '' || selectFamilia == '' || selecteSFamilia == '' || selectTipo == '') {
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
        "idEnvioScrap": inputIdAnterior,
        "operadorScrap": staticOperador,
        "codigoItemScrap": staticCodigo,
        "pesoScrap": parseInt(staticPeso),
        "familiaScrap": selectFamilia,
        "tipoScrap": selectTipo,
        "subFamiliaScrap": selecteSFamilia,
        "estadoScrap": selectTipo,
        "turnoScrap": turno,
        "procesoScrap": staticProceso,
        "unidadScrap": staticUnidad,
    }

    peticionRegistroScrap(data)
}

function peticionRegistroScrap(data) {
    loader.style.display = "flex"
    fetch("/PesajeMolinos/RegisterScrap", {
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
                message: `<p>Scrap ${data.codigoItemEM} se ha registrado correctamente.</p>`,
            })
            document.getElementById("confirmarBtn").removeAttribute("onclick")
            document.getElementById("confirmarBtn").setAttribute("onclick", "agregarRemolido()")
            document.getElementById("totalDesglose").style.display = "none"
            document.getElementById("divIdAntMolido").style.display = "inline"
            limpiarFormulario()
            loader.style.display = "none"
        } else {
            iziToast.error({
                position: "topRight",
                title: `Envío Correcto`,
                message: `<p>Error: Se han generado errores al registrar el Scrap.</p>`,
            })
            loader.style.display = "none"
        }
    }).catch((error) => {
        iziToast.error({
            position: "topRight",
            title: `Envío Correcto`,
            message: `<p>Error: ${error}.</p>`,
        })
        loader.style.display = "none"
    })
}

function agregarRemolido() {
    let inputIdAntMolido = document.getElementById("inputIdAntMolido").value
    let staticOperador = document.getElementById("staticOperador").value
    staticCodigo = document.getElementById("staticCodigo").value
    let staticPeso = document.getElementById("staticPeso").value
    let staticUnidad = document.getElementById("staticUnidad").value
    let staticProceso = document.getElementById("staticProceso").value
    let selectFamilia = document.getElementById("selectFamilia")
    selectFamilia = selectFamilia.options[selectFamilia.selectedIndex].textContent
    let selectTipo = document.getElementById("selectTipo")
    selectTipo = selectTipo.options[selectTipo.selectedIndex].textContent
    let selecteSFamilia = document.getElementById("selecteSFamilia")
    selecteSFamilia = selecteSFamilia.options[selecteSFamilia.selectedIndex].textContent

    if (staticProceso == '' || inputIdAntMolido == '' || staticOperador == '' || staticCodigo == '' || staticPeso == '' || staticUnidad == '' ||
        staticUnidad == '' || selectFamilia == '' || selectFamilia == '' || selecteSFamilia == '' || selectTipo == '') {
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
        "operadorScrap": staticOperador,
        "codigoItemScrap": staticCodigo,
        "pesoScrap": parseInt(staticPeso),
        "familiaScrap": staticProceso,
        "tipoScrap": selectTipo,
        "subFamiliaScrap": selecteSFamilia,
        "estadoScrap": selectTipo,
        "turnoScrap": turno,
        "procesoScrap": staticProceso,
        "unidadScrap": staticUnidad,
        "idRemolidoScrap": inputIdAntMolido
    }

    peticionRegistoRemolido(data)
}

//PETICIONES AL CONTROLADORES
function peticionRegistoRemolido(data) {
    fetch("/PesajeMolinos/RegisterRemolido", {
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
                message: `<p>Scrap ${staticCodigo} se ha registrado correctamente.</p>`,
            })

            limpiarFormulario()
            loader.style.display = "none"
        } else {
            console.log("error en el if")
            loader.style.display = "none"
        }
    }).catch((error) => {
        console.log(error)
        loader.style.display = "none"
    })
}
//FUNCIONES EXTRA PARA TURNO, FECHA Y ESCRITURA TICKET

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

function limpiarFormulario() {
    document.getElementById('formularioEnvioScrap').reset();
    document.getElementById("ticketMolinos").innerHTML = "";
    ObtenerSiguienteIdScrap()
    peticionTicketMolinos()
}

function ObtenerSiguienteIdScrap() {
    fetch("/PesajeMolinos/GetNextIdScrap").then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        if (jsonData.status == 200) {
            let data = JSON.parse(jsonData.data)
            nextIdScrap = data.response + 1
        }
    })
}

