let tablasPesadas;
let tableCorreo;
let tableBitacora
const loader = document.getElementById('loaderDiv')
let idHistorialPesada;
let idSku
let planta;

const pesoNetoInput = document.getElementById("pesoNeto");
const cantidad = document.getElementById("cantidad");
const atado = document.getElementById("atado");
const tara = document.getElementById("tara");
const anillo = document.getElementById("anillo");
const fleje = document.getElementById("fleje");


pesoNetoInput.addEventListener("keydown", (event) => {
    if (event.key === "e" || event.key === "E") {
        event.preventDefault();
    }
});

cantidad.addEventListener("keydown", (event) => {
    if (event.key === "e" || event.key === "E") {
        event.preventDefault();
    }
});

atado.addEventListener("keydown", (event) => {
    if (event.key === "e" || event.key === "E") {
        event.preventDefault();
    }
});

tara.addEventListener("keydown", (event) => {
    if (event.key === "e" || event.key === "E") {
        event.preventDefault();
    }
});

anillo.addEventListener("keydown", (event) => {
    if (event.key === "e" || event.key === "E") {
        event.preventDefault();
    }
});

fleje.addEventListener("keydown", (event) => {
    if (event.key === "e" || event.key === "E") {
        event.preventDefault();
    }
});

$(document).ready(() => {
    fechasDefault()
    localStorage.planta == '335' ? planta = '2' : planta = '1'
    loader.style.display = 'flex'
    tablasPesadas = $('#PesadasTable').DataTable({
        scrollX: true,
        autoWidth: true,
        ordering: false,
        responsive: true,
        columnDefs: [{
            "className": "ComentarioTd",
            "targets": [12]
        }]
    });

    tableCorreo = $('#tablaCorreo').DataTable({
        ordering: false,
        responsive: true
    })

    tableBitacora = $("#BitacoraHistorial").DataTable({
        ordering: false,
        responsive: true,
    })
    ObtenerEmail()
    PintarCortesTurnosPlantas(planta)
    GetHistorialWeight()

})

function PintarCortesTurnosPlantas(planta) {
    let inputSelectTurno = document.getElementById("turno")
    
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

//Obtiene las lineas de historial pesadas default, sin filtros
function GetHistorialWeight() {
    let data = {
        "planta": localStorage.planta
    }
    fetch('/HistorialPedidas/GetAllHistoryWeight', {
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
            tablasPesadas.clear().draw()
            let Rows = []
            let data = JSON.parse(jsonData.data)
            let historialPesadas = data.historailPesadas
            console.log(historialPesadas)
            let lineas = data.lineas           
            console.log(lineas)
            let skuInfo = data.jsonOwor
            if (document.getElementById('selectLinea').childNodes.length == 3) {
                for (x = 0; x < lineas.length; x++) {
                    document.getElementById('selectLinea').innerHTML += `
                            <option value=${lineas[x].numLinea}>${lineas[x].numLinea}</option>
                        `
                }
            }
            if (document.getElementById('selectSku').childNodes.length == 3) {
                for (x = 0; x < skuInfo.length; x++) {
                    document.getElementById('selectSku').innerHTML += `
                            <option value=${skuInfo[x].codigoitem}>${skuInfo[x].codigoitem}</option>
                        `
                }
            }
            for (x = 0; x < historialPesadas.length; x++) {
                let circleColor = ObtenerCirculo(historialPesadas[x].idEstatusHP)
                let checkBoxHabilitado;
                historialPesadas[x].idEstatusHP == 4 || historialPesadas[x].idEstatusSAP == 1 ? checkBoxHabilitado = '<input type="checkbox" disabled />' : checkBoxHabilitado = `<input id="${historialPesadas[x].id}" type="checkbox"/>`
                let isDisabled = ''
                if (historialPesadas[x].idEstatusHP == 4) {
                    isDisabled = 'disabled'
                }
                console.log(isDisabled)
                if (historialPesadas[x].tipo == 'Scrap') {


                    let btns_actions = `
                        <div>
                            <button class="btn btn-info" data-toggle="modal" data-target="#EdicionRegModal" data-toggle="tooltip" data-placement="left" title="Editar Registro" onclick="EditarLinea(${historialPesadas[x].id})" ${isDisabled}><i class="fa-regular fa-pen-to-square"></i></button>
                            <button class="btn btn-danger deshabilitar_historialpesadas" data-toggle="modal" data-target="#AgregaComenModal" data-placement="left" title="Deshabilitar Registro" iddestino="${historialPesadas[x].id}" ${isDisabled}><i class="fa fa-ban" aria-hidden="true" ></i></button>
                            <button class="btn btn-warning" data-toggle="modal" data-target="#BitacoraModal" data-toggle="tooltip" data-placement="left" title="Bitacora" onclick="VerBitacora(${historialPesadas[x].id})"><i class="fa fa-history" aria-hidden="true"></i></button>
                        </div>`
                    let fecha = ConvertDate(historialPesadas[x].scrapMolinos.fechaScrap)
                    Rows.push([checkBoxHabilitado, fecha, historialPesadas[x].scrapMolinos.envioScrap.linea, historialPesadas[x].scrapMolinos.codigoItem,
                        'SCRPT', historialPesadas[x].scrapMolinos.envioScrap.turno, historialPesadas[x].scrapMolinos.cantidad, historialPesadas[x].id, historialPesadas[x].scrapMolinos.atadoScrpt, (historialPesadas[x].scrapMolinos.peso).toFixed(2), historialPesadas[x].scrapMolinos.taraScrpt, historialPesadas[x].scrapMolinos.anilloScrpt, historialPesadas[x].scrapMolinos.flejeScrpt, 0, circleColor, historialPesadas[x].estadosSAP.estatus, '',
                        historialPesadas[x].comentarioSAP == null ? '' : historialPesadas[x].comentarioSAP,
                        historialPesadas[x].comentario == null ? `` : `<b>${historialPesadas[x].comentario}</b>`, btns_actions])
                }
                let minWeight = 0
                if (historialPesadas[x].tipo == "PT") {
                    if (skuInfo.length != 0) {
                        let codigoItem = historialPesadas[x].productoTerminado.codigo
                        let skuFilter = skuInfo.filter(x => x.codigoitem == codigoItem);
                        if (skuFilter.length != 0) {
                            minWeight = skuFilter[0].pesominimo
                        }
                    }
                    console.log(minWeight)
                    let pesoEstandar = minWeight * historialPesadas[x].productoTerminado.numTubos
                    let pesoNeto = historialPesadas[x].productoTerminado.pesoTotal
                    let sobrePeso = ((pesoNeto / pesoEstandar) - 1) * 100             
                    //let sobrePeso = SobrePesoPTM(pesoNeto, pesoEstandar)
                    console.log(sobrePeso)
                    //<i class="fa fa-history" aria-hidden="true"></i>
                    //<i class="fa fa-ban" aria-hidden="true"></i>EdicionRegModal
                    let btns_actions = `
                        <div>
                            <button class="btn btn-info" data-toggle="modal" data-target="#EdicionRegModal" data-toggle="tooltip" data-placement="left" title="Editar Registro" onclick="EditarLinea(${historialPesadas[x].id})" ${isDisabled}><i class="fa-regular fa-pen-to-square"></i></button>
                            <button class="btn btn-danger deshabilitar_historialpesadas" data-toggle="modal" data-target="#AgregaComenModal" data-placement="left" title="Deshabilitar Registro" iddestino="${historialPesadas[x].id}" ${isDisabled}><i class="fa fa-ban" aria-hidden="true"></i></button>
                            <button class="btn btn-warning" data-toggle="modal" data-target="#BitacoraModal" data-toggle="tooltip" data-placement="left" title="Bitacora" onclick="VerBitacora(${historialPesadas[x].id})"><i class="fa fa-history" aria-hidden="true"></i></button>
                        </div>`
                    let fecha = ConvertDate(historialPesadas[x].productoTerminado.fechaPesaje)
                    Rows.push([checkBoxHabilitado, fecha, historialPesadas[x].productoTerminado.id_Linea, historialPesadas[x].productoTerminado.codigo,
                        'PT', historialPesadas[x].productoTerminado.turnoPT, historialPesadas[x].productoTerminado.numTubos, historialPesadas[x].productoTerminado.ordenFabricacion, (historialPesadas[x].productoTerminado.atadoPT).toFixed(2), (pesoNeto).toFixed(2),
                        (historialPesadas[x].productoTerminado.taraPT).toFixed(2), (historialPesadas[x].productoTerminado.anilloPT).toFixed(2), (historialPesadas[x].productoTerminado.flejePT).toFixed(2), `${sobrePeso.toFixed(2)} %`,
                        circleColor, historialPesadas[x].estadosSAP.estatus, historialPesadas[x].docNum, historialPesadas[x].comentarioSAP == null ? '' : historialPesadas[x].comentarioSAP,
                        historialPesadas[x].comentario == null ? `` : historialPesadas[x].comentario, btns_actions])
                }
            }
            tablasPesadas.rows.add(Rows).draw()
            loader.style.display = 'none'
            //nos aseguramos de que el 'backdrop' deje de existir al terminar el loader
           // $('.modal-backdrop').remove();
        } else {
            loader.style.display = 'none'
            //nos aseguramos de que el 'backdrop' deje de existir al terminar el loader
            //$('.modal-backdrop').remove();
        }
    }).catch((error) => {
        console.log(error)
        loader.style.display = 'none'
        //nos aseguramos de que el 'backdrop' deje de existir al terminar el loader
        //$('.modal-backdrop').remove();
    })
}


function generarexcel() {
    loader.style.display = "flex"
    var datos = new FormData();

    const data = tablasPesadas.rows().data().toArray();
    // Crear un nuevo array excluyendo la última y la tercera columna de cada fila
    const filteredData = data.map(row => {
        // Filtrar las columnas, excluyendo las columnas con índices 0, 14 y 19
        return row.filter((_, index) => index !== 0 && index !== 14 && index !== 19);
    });
    datos.append("matrizdatos", JSON.stringify(filteredData));
    // Crear un nuevo objeto XMLHttpRequest
    var xhr = new XMLHttpRequest();
    let url = '/HistorialPedidas/getexcel'
    // Configurar la solicitud
    xhr.open('POST', url, true);

    // Manejar la respuesta
    xhr.onload = function () {
        if (xhr.status === 200) {
            // Mostrar el texto de la respuesta en la consola
            var respuesta = JSON.parse(xhr.responseText);
            loader.style.display = "none"
            if (respuesta.R == 1) {
                descargarArchivo('Historial_Pesadas.xlsx', respuesta.data);
            } else {
                console.error(xhr.response);
                console.error(xhr.responseText);

                iziToast.error({
                    position: "topRight",
                    title: `Exportación de excel producto terminado`,
                    message: `<p>El documento de excel no pudo ser generado</p>`,
                })
                loader.style.display = "none"
            }

        } else {
            // Manejar el error
            //console.log(xhr);
            console.error(xhr.response);
            //console.log(xhr.responseText);
            console.error('Error: ' + xhr.status);
            loader.style.display = "none"
        }
    };

    loader.style.display = "none"
    // Enviar la solicitud
    //Es posible que no llegue al controller sí estas mandando 
    //Contenido tipo HTML, verifica esto en caso de que no este llgando al controller
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


//Funcion para deshabilitar linea de historial pesadas
$(document).on("click", ".deshabilitar_historialpesadas", function () {
    let id = $(this).attr("iddestino");
    $("#deshabilita_historialpesadasevent").attr("iddestino", id);
});

$("#deshabilita_historialpesadasevent").on("click", function () {
    let id = $(this).attr("iddestino");
    DeshabilitarRegistro(id);
});

function DeshabilitarRegistro(iddestino) {
    loader.style.display = 'flex'
    let comentario = document.getElementById("textAreaComentario").value
    if (comentario == '') {
        iziToast.error({
            position: "topRight",
            title: `Error`,
            message: `<p>Favor de agregar un comentario al registro.</p>`,
        })
        loader.style.display = 'none'
        return
    }

    let data = {
        "idHPesada": iddestino,
        "comentario": comentario
    }

    fetch("/HistorialPedidas/DisabledRecord", {
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
            tablasPesadas.clear().draw()
            iziToast.success({
                position: "topRight",
                title: `Registro Deshabilitado`,
                message: `<p>Se ha deshabilitado el registro correctamente.</p>`,
            })
            //ocultamos el modal
            $("#cerrarModal").click()
            GetHistorialWeight()
        } else {
            iziToast.error({
                position: "topRight",
                title: `Error Generado`,
                message: `<p>Se ha generado un error al deshabilitar el registro.</p>`,
            })
            loader.style.display = 'none'
        }
    }).catch((error) => {
        iziToast.error({
            position: "topRight",
            title: `Error`,
            message: `<p>Error generado: ${error}.</p>`,
        })
        loader.style.display = 'none'
    })
}

function EditarLinea(idHPesada) {
    idHistorialPesada = idHPesada
    let data = {
        "idHPesada": idHPesada
    }
    fetch("/HistorialPedidas/GetHistoricalById", {
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
            let productoTerm = data.productoTerminado
            console.log(productoTerm)
            if (productoTerm[0].productoTerminado != null) {
                document.getElementById("btn-save").removeAttribute("onclick")
                document.getElementById("btn-save").setAttribute("onclick", "GuardarEdicion()")
                /*let pesoNeto = productoTerm[0].productoTerminado.pesoTotal - productoTerm[0].productoTerminado.skuInfo.variable*/
                document.getElementById("cantidad").value = (productoTerm[0].productoTerminado.numTubos)
                document.getElementById('pesoNeto').value = (productoTerm[0].productoTerminado.pesoTotal).toFixed(2)
                document.getElementById('atado').value = (productoTerm[0].productoTerminado.atadoPT).toFixed(2)
                document.getElementById('anillo').value = (productoTerm[0].productoTerminado.anilloPT).toFixed(2)
                document.getElementById('fleje').value = (productoTerm[0].productoTerminado.flejePT).toFixed(2)
                productoTerm[0].comentario == null ? document.getElementById('comentario').textContent = '' : document.getElementById('comentario').textContent = productoTerm[0].comentario
                /*document.getElementById('comentario').textContent = productoTerm[0].comentario*/
                let lineaPtH = document.getElementById('selectLinea')
                lineaPtH.value = (productoTerm[0].productoTerminado.id_Linea).toString()
                $("#selectSku").val(productoTerm[0].productoTerminado.codigo);
                $("#comentario").val(productoTerm[0].comentario)
                /*idSKU.value = (productoTerm[0].productoTerminado.id_SKU).toString()*/
                document.getElementById('tara').value = (productoTerm[0].productoTerminado.taraPT).toFixed(2)
            } else {
                document.getElementById("btn-save").removeAttribute("onclick")
                document.getElementById("btn-save").setAttribute("onclick", "GuardarScrap()")
                document.getElementById("cantidad").value = (productoTerm[0].scrapMolinos.cantidad)
                document.getElementById('pesoNeto').value = (productoTerm[0].scrapMolinos.peso).toFixed(2)
                document.getElementById('atado').value = (productoTerm[0].scrapMolinos.atadoScrpt).toFixed(2)
                document.getElementById('anillo').value = (productoTerm[0].scrapMolinos.anilloScrpt).toFixed(2)
                document.getElementById('fleje').value = (productoTerm[0].scrapMolinos.flejeScrpt).toFixed(2)
                productoTerm[0].comentario == null ? document.getElementById('comentario').textContent = '' : document.getElementById('comentario').textContent = productoTerm[0].comentario
                /*document.getElementById('comentario').textContent = productoTerm[0].comentario*/
                let lineaPtH = document.getElementById('selectLinea')
                lineaPtH.value = (productoTerm[0].scrapMolinos.envioScrap.linea).toString()
                //let idSKU = document.getElementById('selectSku')
                //idSKU.value = (productoTerm[0].productoTerminado.id_SKU).toString()
                document.getElementById('tara').value = (productoTerm[0].scrapMolinos.taraScrpt).toFixed(2)
            }
            /*document.getElementById('linea').value = productoTerm[0].productoTerminado.id_Linea*/
            /*idSku =*/
        } else {
            iziToast.error({
                position: "topRight",
                title: `Error Generado`,
                message: `<p>No se encuentra el registro seleccionado.</p>`,
            })
        }
    }).catch((error) => {
        console.log(error)
        iziToast.error({
            position: "topRight",
            title: `Error`,
            message: `<p>Error generado: ${error}.</p>`,
        })
    })
}

//filtro por corte o dias
function filtradoHistorialPesadas() {
    loader.style.display = 'flex'
    let turno = document.getElementById("turno")
    let turnoValue
    let corte = turno.options[turno.selectedIndex].value
    let linea = document.getElementById("lineaHP").value
    let selectEstatus = document.getElementById("selectEstatus")
    selectEstatus = selectEstatus.options[selectEstatus.selectedIndex].value

    if (corte > "0" && corte < "7") {
        if (document.getElementById("desdeFecha").value == '') {
            iziToast.error({
                position: "topRight",
                title: `Ha surgido un error`,
                message: `<p>Favor de ingresar las fechas para poder continuar</p>`
            })
            loader.style.display = "none"
            //return
        }
    }

    if (corte >= "1" && corte <= "3") {
        turnoValue = "1"
    }

    if (corte >= "4" && corte <= "6") {
        turnoValue = "2"
    }


    if (corte == "7") {
        if (document.getElementById("desdeFecha").value == '') {
            iziToast.warning({
                position: "topRight",
                title: `Aviso`,
                message: `<p>Favor de ingresar la fecha que deseas de el reporte del día.</p>`,
                color: "blue",
            })
            loader.style.display = "none"
            //return
        }
    }

    let data = {
        "itemcode": document.getElementById("codigo").value,
        "estatusSap": selectEstatus == '0' ? '' : selectEstatus,
        "fechaInicio": document.getElementById("desdeFecha").value,
        "fechaFin": document.getElementById("aFecha").value,
        "turno": turnoValue,
        "planta": localStorage.planta,
        "corte": corte,
        "linea": linea
    }

    if (corte == '0' && document.getElementById("codigo").value == '' && selectEstatus == '0'
        && document.getElementById("desdeFecha").value == '' && document.getElementById("aFecha").value == '') {
        GetHistorialWeight()
        //return;
    }
    console.log(data)

    fetch("/HistorialPedidas/FilterHistoricalW", {
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
            console.log(data)
            let Rows = []
            var filtradoHP = data.filtradoHP
            let skuInfo = data.jsonOwor
            tablasPesadas.clear().draw()
            for (x = 0; x < filtradoHP.length; x++) {
                let isDisabled = ''
                if (filtradoHP[x].idEstatusHP == 4) {
                    isDisabled = 'disabled'
                }
                let circleColor = ObtenerCirculo(filtradoHP[x].idEstatusHP)
                let checkBoxHabilitado;
                filtradoHP[x].idEstatusHP == 4 || filtradoHP[x].idEstatusSAP == 1 ? checkBoxHabilitado = '<input type="checkbox" disabled />' : checkBoxHabilitado = `<input id="${filtradoHP[x].id}" type="checkbox"/>`
                if (filtradoHP[x].tipo == 'Scrap') {
                    let btns_actions = `
                        <div>
                            <button class="btn btn-info" data-toggle="modal" data-target="#EdicionRegModal" data-toggle="tooltip" data-placement="left" title="Editar Registro" onclick="EditarLinea(${filtradoHP[x].id})" ${isDisabled}><i class="fa-regular fa-pen-to-square"></i></button>
                            <button class="btn btn-danger deshabilitar_historialpesadas" data-toggle="modal" data-target="#AgregaComenModal" data-placement="left" title="Deshabilitar Registro" iddestino="${filtradoHP[x].id}" ${isDisabled}><i class="fa fa-ban" aria-hidden="true"></i></button>
                            <button class="btn btn-warning" data-toggle="modal" data-target="#BitacoraModal" data-toggle="tooltip" data-placement="left" title="Bitacora" onclick="VerBitacora(${filtradoHP[x].id})"><i class="fa fa-history" aria-hidden="true"></i></button>
                        </div>`
                    let fecha = ConvertDate(filtradoHP[x].scrapMolinos.fechaScrap)
                    Rows.push([checkBoxHabilitado, fecha, '', filtradoHP[x].scrapMolinos.codigoItem,
                        'SCRPT', filtradoHP[x].scrapMolinos.envioScrap.turno, filtradoHP[x].scrapMolinos.cantidad != null ? filtradoHP[x].scrapMolinos.cantidad : '', filtradoHP[x].id, filtradoHP[x].scrapMolinos.atadoScrpt,
                        (filtradoHP[x].scrapMolinos.peso).toFixed(2), filtradoHP[x].scrapMolinos.taraScrpt ? filtradoHP[x].scrapMolinos.taraScrpt : '',
                        filtradoHP[x].scrapMolinos.anilloScrpt ? filtradoHP[x].scrapMolinos.anilloScrpt : '', filtradoHP[x].scrapMolinos.flejeScrpt ? filtradoHP[x].scrapMolinos.flejeScrpt : '',
                        '', circleColor, filtradoHP[x].estadosSAP.estatus, '',
                        filtradoHP[x].comentarioSAP == null ? '' : filtradoHP[x].comentarioSAP,
                        filtradoHP[x].comentario == null ? `` : `<b>${filtradoHP[x].comentario}</b>`, btns_actions])
                }

                if (filtradoHP[x].tipo == "PT") {
                    let minWeight
                    if (skuInfo.length != 0) {
                        let codigoItem = filtradoHP[x].productoTerminado.codigo
                        let skuFilter = skuInfo.filter(x => x.codigoitem == codigoItem);
                        if (skuFilter.length != 0) {
                            minWeight = skuFilter[0].pesominimo
                        }
                    }
                    let pesoEstandar = minWeight * filtradoHP[x].productoTerminado.numTubos
                    console.log("numtubos: " + filtradoHP[x].productoTerminado.numTubos)
                    console.log("peso neto: " + minWeight)
                    let pesoNeto = filtradoHP[x].productoTerminado.pesoTotal
                    console.log("peso neto: " + pesoNeto)
                    let sobrePeso = ((pesoNeto / pesoEstandar) - 1) * 100             //<---
                    //let sobrePeso = SobrePesoPTM(pesoNeto, pesoEstandar)
                    //<i class="fa fa-history" aria-hidden="true"></i>
                    //<i class="fa fa-ban" aria-hidden="true"></i>EdicionRegModal
                    let btns_actions = `
                        <div>
                            <button class="btn btn-info" data-toggle="modal" data-target="#EdicionRegModal" data-toggle="tooltip" data-placement="left" title="Editar Registro" onclick="EditarLinea(${filtradoHP[x].id})" ${isDisabled}><i class="fa-regular fa-pen-to-square"></i></button>
                            <button class="btn btn-danger deshabilitar_historialpesadas" data-toggle="modal" data-target="#AgregaComenModal" data-placement="left" title="Deshabilitar Registro" iddestino="${filtradoHP[x].id}" ${isDisabled}><i class="fa fa-ban" aria-hidden="true"></i></button>
                            <button class="btn btn-warning" data-toggle="modal" data-target="#BitacoraModal" data-toggle="tooltip" data-placement="left" title="Bitacora" onclick="VerBitacora(${filtradoHP[x].id})"><i class="fa fa-history" aria-hidden="true"></i></button>
                        </div>`
                    let fecha = ConvertDate(filtradoHP[x].productoTerminado.fechaPesaje)
                    Rows.push([checkBoxHabilitado, fecha, filtradoHP[x].productoTerminado.id_Linea, filtradoHP[x].productoTerminado.codigo,
                        'PT', filtradoHP[x].productoTerminado.turnoPT, filtradoHP[x].productoTerminado.numTubos, filtradoHP[x].productoTerminado.ordenFabricacion, (filtradoHP[x].productoTerminado.atadoPT).toFixed(3), (pesoNeto).toFixed(3),
                        (filtradoHP[x].productoTerminado.taraPT).toFixed(3), (filtradoHP[x].productoTerminado.anilloPT).toFixed(3), (filtradoHP[x].productoTerminado.flejePT).toFixed(3), `${sobrePeso.toFixed(3)} %`,
                        circleColor, filtradoHP[x].estadosSAP.estatus, filtradoHP[x].docNum, filtradoHP[x].comentarioSAP == null ? '' : filtradoHP[x].comentarioSAP,
                        filtradoHP[x].comentario == null ? `` : `<b>${filtradoHP[x].comentario}</b>`, btns_actions])
                }
            }
            tablasPesadas.rows.add(Rows).draw()
            loader.style.display = 'none'
            //nos aseguramos de que el 'backdrop' deje de existir al terminar el loader
           // $('.modal-backdrop').remove();
        } else {
            loader.style.display = 'none'
            //nos aseguramos de que el 'backdrop' deje de existir al terminar el loader
            //$('.modal-backdrop').remove();
        }
    }).catch((error) => {
        console.log(error)
        loader.style.display = 'none'
        //nos aseguramos de que el 'backdrop' deje de existir al terminar el loader
       // $('.modal-backdrop').remove();
    })
}

function GuardarScrap() {
    loader.style.display = 'flex'
    if (document.getElementById('comentario').value == '') {
        iziToast.error({
            position: "topRight",
            title: `Error`,
            message: `<p>Favor de agregar el comentario de la edición del registro.</p>`,
        })
        loader.style.display = 'none'
        //nos aseguramos de que el 'backdrop' deje de existir al terminar el loader
        //$('.modal-backdrop').remove();
        return
    }
    let lineaPtH = document.getElementById('selectLinea')
    lineaPtH = lineaPtH.options[lineaPtH.selectedIndex].value
    if (lineaPtH == '0') {
        iziToast.error({
            position: "topRight",
            title: `Error`,
            message: `<p>Favor de seleccionar una línea valida.</p>`,
        })
        loader.style.display = 'none'
        //nos aseguramos de que el 'backdrop' deje de existir al terminar el loader
       // $('.modal-backdrop').remove();
        return
    }
    let idSKU = document.getElementById('selectSku')
    idSKU = idSKU.options[idSKU.selectedIndex].value
    if (idSKU == '0') {
        iziToast.error({
            position: "topRight",
            title: `Error`,
            message: `<p>Favor de seleccionar un código valido.</p>`,
        })
        loader.style.display = 'none'
        //nos aseguramos de que el 'backdrop' deje de existir al terminar el loader
        //$('.modal-backdrop').remove();
        return
    }
    let NumTubosPtH = document.getElementById("cantidad").value
    let PesoTotalPtH = document.getElementById('pesoNeto').value
    let AtadoPTH = document.getElementById('atado').value
    let AnilloPTH = document.getElementById('anillo').value
    let FlejePTH = document.getElementById('fleje').value
    let comentario = document.getElementById('comentario').value
    let TaraPTH = document.getElementById('tara').value
    let nombreTrabjador = document.getElementById('labelName').textContent

    let data = {
        "idHistPesada": idHistorialPesada,
        "idSKU": parseInt(idSKU),
        "lineaPtH": parseInt(lineaPtH),
        "pesoTotalPtH": parseFloat(PesoTotalPtH),
        "numTubosPtH": parseInt(NumTubosPtH),
        "atadoPTH": parseFloat(AtadoPTH),
        "taraPTH": parseFloat(TaraPTH),
        "anilloPTH": parseFloat(AnilloPTH),
        "flejePTH": parseFloat(FlejePTH),
        "comentario": comentario,
        "nombreTrabjador": nombreTrabjador
    }

    console.log(data)
    peticionEditarRegistroPesadasScrpt(data)
}

function peticionEditarRegistroPesadasScrpt(data) {
    fetch("/HistorialPedidas/EditScrap", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        if (jsonData.status == 200) {
            tablasPesadas.clear().draw()
            iziToast.success({
                position: "topRight",
                title: `Registro Deshabilitado`,
                message: `<p>Se ha editado el registro correctamente.</p>`,
            })
            $("#cierraModal").click()
            GetHistorialWeight()
        } else {
            loader.style.display = 'none'
            //nos aseguramos de que el 'backdrop' deje de existir al terminar el loader
           // $('.modal-backdrop').remove();
        }
    }).catch((error) => {
        console.log(error)
        loader.style.display = 'none'
        //nos aseguramos de que el 'backdrop' deje de existir al terminar el loader
       // $('.modal-backdrop').remove();
        iziToast.error({
            position: "topRight",
            title: `Error`,
            message: `<p>Error generado: ${error}.</p>`,
        })
    })
}



function GuardarEdicion() {
    loader.style.display = 'flex'
    if (document.getElementById('comentario').value == '') {
        iziToast.error({
            position: "topRight",
            title: `Error`,
            message: `<p>Favor de agregar el comentario de la edición del registro.</p>`,
        })
        loader.style.display = 'none'
        //nos aseguramos de que el 'backdrop' deje de existir al terminar el loader
        //$('.modal-backdrop').remove();
        //return
    }
    let lineaPtH = document.getElementById('selectLinea')
    lineaPtH = lineaPtH.options[lineaPtH.selectedIndex].value
    if (lineaPtH == '0') {
        iziToast.error({
            position: "topRight",
            title: `Error`,
            message: `<p>Favor de seleccionar una línea valida.</p>`,
        })
        loader.style.display = 'none'
        //nos aseguramos de que el 'backdrop' deje de existir al terminar el loader
       // $('.modal-backdrop').remove();
       // return
    }
    let idSKU = document.getElementById('selectSku')
    idSKU = idSKU.options[idSKU.selectedIndex].value
    if (idSKU == '0') {
        iziToast.error({
            position: "topRight",
            title: `Error`,
            message: `<p>Favor de seleccionar un código valido.</p>`,
        })
        loader.style.display = 'none'
        //nos aseguramos de que el 'backdrop' deje de existir al terminar el loader
       // $('.modal-backdrop').remove();
        //return
    }
    let NumTubosPtH = document.getElementById("cantidad").value
    let PesoTotalPtH = document.getElementById('pesoNeto').value
    let AtadoPTH = document.getElementById('atado').value
    let AnilloPTH = document.getElementById('anillo').value
    let FlejePTH = document.getElementById('fleje').value
    let comentario = document.getElementById('comentario').value
    let TaraPTH = document.getElementById('tara').value
    let nombreTrabjador = document.getElementById('labelName').textContent

    let data = {
        "idHistPesada": idHistorialPesada,
        "idSKU": 0, //parseInt(idSKU), [se elimina el parseint, el 'idSKU' en realidad no se usa mas delante, solo se deja con valor '0' porque esta declarado en el api para que exista, mas no se usa al momento de acualizar el registo. El error aqui surgia en inyeccion porque toma el primer caracter del codigo, y en inyeccion los codigos no inician con numeros]
        "lineaPtH": parseInt(lineaPtH),
        "pesoTotalPtH": parseFloat(PesoTotalPtH),
        "numTubosPtH": parseInt(NumTubosPtH),
        "atadoPTH": parseFloat(AtadoPTH),
        "taraPTH": parseFloat(TaraPTH),
        "anilloPTH": parseFloat(AnilloPTH),
        "flejePTH": parseFloat(FlejePTH),
        "comentario": comentario,
        "nombreTrabjador": nombreTrabjador
    }

    console.log(data)
    peticionEditarRegistroPesadas(data)
}

function peticionEditarRegistroPesadas(data) {
    fetch("/HistorialPedidas/EditarRegistroPesada", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        if (jsonData.status == 200) {
            tablasPesadas.clear().draw()
            iziToast.success({
                position: "topRight",
                title: `Registro Actualizado`,
                message: `<p>Se ha actualizado correctamente el registro.</p>`,
            })
            $("#cierraModal").click()
            GetHistorialWeight()
        } else {
            iziToast.error({
                position: "topRight",
                title: `Error`,
                message: `<p>Error generado: no se puede obtener el historial del registro.</p>`,
            })
        }
    }).catch((error) => {
        console.log(error)
        loader.style.display = 'none'
        //nos aseguramos de que el 'backdrop' deje de existir al terminar el loader
       // $('.modal-backdrop').remove();
        iziToast.error({
            position: "topRight",
            title: `Error`,
            message: `<p>Error generado: ${error}.</p>`,
        })
    })
}

function checkBoxSeleccionar() {
    if (document.getElementById('checkboxSelect').checked == true) {
        document.querySelectorAll('.tableHP input[type=checkbox]').forEach(item => {
            if (!item.disabled) {
                item.checked = true
            }
        })
    } else {
        document.querySelectorAll('.tableHP input[type=checkbox]').forEach(item => {
            item.checked = false
        })
    }
}

function ConvertDate(dateTime) {
    const fecha = new Date(dateTime);
    const day = fecha.getDate().toString().padStart(2, '0');
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const year = fecha.getFullYear();
    var date = `${day}/${month}/${year}`
    var hours = `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')} ${fecha.getHours() >= 12 ? 'PM' : 'AM'}`
    let listInfoDate = `${date} ${hours}`
    return listInfoDate
}

function ObtenerCirculo(idColor) {
    let circle;
    switch (idColor) {
        case 1:
            circle = '<span class="circleYellow"></span>'
            break
        case 2:
            circle = '<span class="circleGreen"></span>'
            break
        case 3:
            circle = '<span class="circleWhite"></span>'
            break
        case 4:
            circle = '<span class="circleRed"></span>'
            break
    }

    return circle
}

function AgregarComentario(idHPesada) {
    idHistorialPesada = idHPesada
}

function InhabilitarLinea(idHPesada) {
    idHistorialPesada = idHPesada
}

function VerBitacora(idHPesada) {
    idHistorialPesada = idHPesada
    data = {
        "idHPesadas": idHistorialPesada
    }
    fetch("/HistorialPedidas/GetBitacoraPesadasById", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        tableBitacora.clear().draw()
        if (jsonData.status == 200) {
            let data = JSON.parse(jsonData.data)
            let bitacoraHPesadas = data.bitacoraHPesadas
            let Rows = []
            console.log(bitacoraHPesadas)
            if (bitacoraHPesadas.length > 0) {
                let pesoTotalPtH
                let anilloPTH
                let atadoPTH
                let skuInfoa
                let taraPTH
                let lineaPtH
                let numTubosPtH
                let fleje
                let fecha
                let nombre
                for (x = 0; x < bitacoraHPesadas.length; x++) {
                    fecha = ConvertDate(bitacoraHPesadas[x].fechaModificacion)
                    nombre = bitacoraHPesadas[x].nombre
                    bitacoraHPesadas[x].pesoTotalPtH == null ? pesoTotalPtH = '' : pesoTotalPtH = bitacoraHPesadas[x].pesoTotalPtH
                    bitacoraHPesadas[x].anilloPTH == null ? anilloPTH = '' : anilloPTH = bitacoraHPesadas[x].anilloPTH
                    bitacoraHPesadas[x].skuInfo == null ? skuInfoa = '' : skuInfoa = bitacoraHPesadas[x].skuInfo.itemCode
                    bitacoraHPesadas[x].taraPTH == null ? taraPTH = '' : taraPTH = bitacoraHPesadas[x].taraPTH
                    bitacoraHPesadas[x].atadoPTH == null ? atadoPTH = '' : atadoPTH = bitacoraHPesadas[x].atadoPTH
                    bitacoraHPesadas[x].lineaPtH == null ? lineaPtH = '' : lineaPtH = bitacoraHPesadas[x].lineaPtH
                    bitacoraHPesadas[x].numTubosPtH == null ? numTubosPtH = '' : numTubosPtH = bitacoraHPesadas[x].numTubosPtH
                    bitacoraHPesadas[x].flejePTH == null ? fleje = '' : fleje = bitacoraHPesadas[x].flejePTH
                    bitacoraHPesadas[x].lineaPtH == null ? lineaPtH = '' : lineaPtH = bitacoraHPesadas[x].lineaPtH
                    Rows.push([fecha, nombre, pesoTotalPtH, skuInfoa, numTubosPtH, atadoPTH, taraPTH, anilloPTH, fleje, lineaPtH])
                }

                tableBitacora.rows.add(Rows).draw()
            }
        } else {
            console.log(jsonData);
        }
    }).catch((error) => {
        iziToast.error({
            position: "topRight",
            title: `Error`,
            message: `<p>Error: ${error}.</p>`,
        })
    })
}

//iniciamos el proceso para enviar a SAP
function EnviarASap() {
    loader.style.display = 'flex'
    let checked = false;
    let idHistorialSAP = [];
    var tableHistorialP = document.getElementById("PesadasTable")
    var tableCheckBox = tableHistorialP.querySelectorAll("input[type=checkbox]")
    for (x = 0; x < tableCheckBox.length; x++) {
        if (tableCheckBox[x].checked == true) {
            checked = true
            idHistorialSAP.push(parseInt(tableCheckBox[x].id))
        }
    }

    if (!checked) {
        iziToast.error({
            position: "topRight",
            title: `Error`,
            message: `<p>Error generado: Favor de seleccionar un registro para proceder a enviar a SAP.</p>`,
        })
        loader.style.display = 'none'
        //nos aseguramos de que el 'backdrop' deje de existir al terminar el loader
        //$('.modal-backdrop').remove();
        return
    }
    let data = {
        "preliminar": '0',
        "idHistorialP": idHistorialSAP
    }
    //si se selecciono algun registro, procedemos a enviarlo
    peticionEnvioSap(data)
}

//agregamos un preeliminar de las lineas que se enviara a SAP a la tabla SQL "EnvioSAP""
function peticionEnvioSap(data) {
    // Función para agregar timeout a fetch
    function fetchWithTimeout(url, options, timeout = 120000) {
        return new Promise((resolve, reject) => {
            // Configuramos el timeout
            const timer = setTimeout(() => {
                reject(new Error("Timeout: La solicitud tardó demasiado."));
            }, timeout);

            // Ejecutamos la solicitud fetch
            fetch(url, options)
                .then(response => {
                    clearTimeout(timer); // Limpiamos el timeout si fetch es exitoso
                    resolve(response);
                })
                // si se exede el timeout, capturamos el error [new error], y lo mandamos al catch de 'fetchWithTimeout' para mostrarlo
                .catch(err => {
                    clearTimeout(timer); // Limpiamos el timeout si fetch falla
                    reject(err);
                });
        });
    }

    // REGISTRAR TODOS LOS RECIBOS DE PRODUCCION PENDIENTES POR ENVIAR A SAP
    fetchWithTimeout("/HistorialPedidas/EnvioSap", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify(data)
    })
        .then((response) => {
            return response.ok ? response.json() : Promise.reject(response);
        })
        .then((jsonData) => {
            if (jsonData.status == 200) {
                let data = JSON.parse(jsonData.data);
                console.log(data.identificador);
                let identifier = data["identificador"];
                if (identifier != 0) {
                    console.log(identifier);
                    //GENERAR XML PARA CARGAR RECIBO DE PRODUCCION EN SAP CON DI API CON TODOS LOS PENDIENTES
                    //aqui se completara el envio a SAP
                    peticionGenerarXML(identifier);
                } else {
                    iziToast.error({
                        position: "topRight",
                        title: `Error`,
                        message: `<p>Error generado: Error generado al tratar de enviar los códigos.</p>`
                    });
                    loader.style.display = 'none';
                    //nos aseguramos de que el 'backdrop' deje de existir al terminar el loader
                   // $('.modal-backdrop').remove();
                }
            }
        })
        .catch((error) => {
            iziToast.error({
                position: "topRight",
                title: `Error`,
                message: `<p>Error: ${error} .</p>`,
            });
            loader.style.display = 'none';
            //nos aseguramos de que el 'backdrop' deje de existir al terminar el loader
           // $('.modal-backdrop').remove();
        });
}

//Completamos la carga en SAP, antes de este paso, la info solo esta en SQL
function peticionGenerarXML(identifier) {
    let data = {
        "identificador": identifier.toString(),
        "Planta": planta
    }

    // Función para agregar timeout a fetch
    function fetchWithTimeout(url, options, timeout = 120000) {
        return new Promise((resolve, reject) => {
            // Configuramos el timeout
            const timer = setTimeout(() => {
                reject(new Error("TIEMPO EXCEDIDO. <br> El servidor esta ocupado <br> intentar de nuevo mas tarde"));
            }, timeout);

            // Ejecutamos la solicitud fetch
            fetch(url, options)
                .then(response => {
                    clearTimeout(timer); // Limpiamos el timeout si fetch es exitoso
                    resolve(response);
                })
                // si se exede el timeout, capturamos el error [new error], y lo mandamos al catch de 'fetchWithTimeout' para mostrarlo
                .catch(err => {
                    clearTimeout(timer); // Limpiamos el timeout si fetch falla
                    reject(err);
                });
        });
    }

    // Uso de fetch con timeout
    fetchWithTimeout("/HistorialPedidas/GenereteXML", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify(data)
    })
        .then((response) => {
            return response.ok ? response.json() : Promise.reject(response);
        })
        .then((jsonData) => {
            if (jsonData.status == 200) {
                tablasPesadas.clear().draw();
                console.log(jsonData);
                GetHistorialWeight();
                loader.style.display = 'none';
                //nos aseguramos de que el 'backdrop' deje de existir al terminar el loader
               // $('.modal-backdrop').remove();
                iziToast.success({
                    position: "topRight",
                    title: `Datos Cargados`,
                    message: `<p>Los datos se han cargado de manera correcta a SAP.</p>`,
                });
            } else {
                //Mostramos el error que viene desde el controller
                let error = jsonData.data;
                iziToast.error({
                    position: "topRight",
                    title: `Error (controller)`,
                    message: `<p>` + error + '</p>',
                });
                loader.style.display = 'none';
                //nos aseguramos de que el 'backdrop' deje de existir al terminar el loader
                //$('.modal-backdrop').remove();
            }
        })
        .catch((error) => {
            tablasPesadas.clear().draw();
            GetHistorialWeight();
            iziToast.error({
                position: "topRight",
                title: `Error (script)`,
                message: `<p> ${error}.</p>`,
            });
            loader.style.display = 'none';
            //nos aseguramos de que el 'backdrop' deje de existir al terminar el loader
            //$('.modal-backdrop').remove();
        });
}


$(".copiar_registro").on("click", function () {

    let NumTubos = document.getElementById("cantidad").value
    let PesoTotal = document.getElementById('pesoNeto').value
    let AtadoPT = document.getElementById('atado').value
    let AnilloPT = document.getElementById('anillo').value
    let FlejePT = document.getElementById('fleje').value
    let comentario = document.getElementById('comentario').value
    let TaraPT = document.getElementById('tara').value
    let Codigo = document.getElementById('selectSku').value
    let Id_Linea = document.getElementById('selectLinea').value

    CopiarRegistro(comentario, Codigo, Id_Linea, PesoTotal, NumTubos, AtadoPT, TaraPT, AnilloPT, FlejePT);
});


function CopiarRegistro(comentario, Codigo, Id_Linea, PesoTotal, NumTubos, AtadoPT, TaraPT, AnilloPT, FlejePT) {
    loader.style.display = 'flex'
    if (document.getElementById('comentario').value == '') {
        iziToast.error({
            position: "topRight",
            title: `Error Generado`,
            message: `<p>Favor de agregar el comentario para continuar.</p>`,
        })
        loader.style.display = 'none'
        //nos aseguramos de que el 'backdrop' deje de existir al terminar el loader
       // $('.modal-backdrop').remove();
        return
    }

    let data = {
        "idHPesadas": idHistorialPesada, // este no viene de un atributo
        "comentario": comentario,
        "Codigo": Codigo,
        "Id_Linea": parseInt(Id_Linea),
        "PesoTotal": parseFloat(PesoTotal),
        "NumTubos": parseInt(NumTubos),
        "AtadoPT": parseFloat(AtadoPT),
        "TaraPT": parseFloat(TaraPT),
        "AnilloPT": parseFloat(AnilloPT),
        "FlejePT": parseFloat(FlejePT),
    }
    fetch("/HistorialPedidas/CopyRegister", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        if (jsonData.status == 200) {
            tablasPesadas.clear().draw()
            iziToast.success({
                position: "topRight",
                title: `Registro Copiado`,
                message: `<p>El registro se ha copiado de manera correcta.</p>`,
            })
            $("#cierraModal").click()
            GetHistorialWeight()
        } else {
            iziToast.error({
                position: "topRight",
                title: `Error`,
                message: `<p>Error generado: se ha producido un error al tratar de copiar el registro.</p>`,
            })
            loader.style.display = 'none'
            //nos aseguramos de que el 'backdrop' deje de existir al terminar el loader
           // $('.modal-backdrop').remove();
        }
    }).catch((error) => {
        iziToast.error({
            position: "topRight",
            title: `Error`,
            message: `<p>Error: ${error}.</p>`,
        })
        loader.style.display = 'none'
        //nos aseguramos de que el 'backdrop' deje de existir al terminar el loader
       // $('.modal-backdrop').remove();
    })
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
                rows.push([sapemail[x].nombrecompleto, sapemail[x].name, sapemail[x].nombrecompleto])
            }

            tableCorreo.rows.add(rows).draw()
        }
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

function fechasDefault() {
    var date = new Date();
    var month = date.getMonth() + 1; // Sumar 1 para obtener el mes actual
    var fecha = date.getFullYear() + "-" + (month < 10 ? '0' + month : month) + "-" + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
    $("#desdeFecha").val(fecha);
    $("#aFecha").val(fecha)
}

//verificar el turno para desactivar "aFechaHP"
$("#turno").change(function () {
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