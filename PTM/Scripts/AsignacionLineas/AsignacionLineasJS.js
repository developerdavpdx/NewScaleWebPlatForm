const loader = document.getElementById('loaderDiv')
//const selectInput = document.getElementById('selectSku')
let numeroLinea;
let tablaBitacora;
let numLineas;
let EstaAsignado = false;
let planta;
//variables para obtener los codigos a asignar
const entradaBusqueda = document.getElementById('entrada-busqueda');
const listaSugerencias = document.getElementById('sugerencias-autocompletar');
const sugerencias = [];

$(document).ready(async () => {
    localStorage.planta == '335' ? planta = '2' : planta = '1'
    loader.style.display = 'flex'
    tablaBitacora =$('#tableHistorial').DataTable({
        ordering: false,
        responsive: true
    })
    await getLineas()
    PeticionObtenerSku()
})

function AgregaLineaBtn() {
    numLineas = numLineas.response.length + 1
    document.getElementById("inputNumLinea").value = numLineas
}

function AsignarLinea(element) {
    numeroLinea = $(element).data('linea-id')
    tipoAsignado = $(element).data("asignado").toString();
    //Mostramos el boton de 'asignar' o 'desasignar' segun sea el caso
    if (tipoAsignado == "Asignado") {
        document.getElementById('desasignarBtn').style.display = 'inline'
        document.getElementById('AsignarLinea').style.display = 'none'
    //    EstaAsignado = true
    } else {
        document.getElementById('AsignarLinea').style.display = 'inline'
        document.getElementById('desasignarBtn').style.display = 'none'
    }
    //agregammos el numero de linea en el titulo del modal
    document.getElementById('lineaNumber').textContent = numeroLinea
    //document.getElementById('desasignarBtn').setAttribute('data-id', numeroLinea.toString())
    getBitacoraInfo()
}

function PeticionObtenerSku() {
    let data = {
        "planta": "0"
    }

    fetch('/DatosMaestros/GetAllPt', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        if (jsonData.status == 200) {
            let data = jsonData.data
            let dataSku = JSON.parse(data)
            let codigosData = dataSku.data
            //let optionsSelect = `<option value="0" selected>Seleccione...</option>`;
            for (x = 0; x < codigosData.length; x++) {
                //optionsSelect += `<option value="${codigosData[x].codigoitem}" data-ItemCode="${codigosData[x].codigoitem}">${codigosData[x].codigoitem}</option>`
                sugerencias.push({
                    valor: codigosData[x].codigoitem,
                    etiqueta: codigosData[x].codigoitem
                });
            }
            //$('#selectSku').html(optionsSelect);
            entradaBusqueda.value = "";
            loader.style.display = 'none'
        } else {
            iziToast.error({
                position: "topRight",
                title: `Ha surgido un error`,
                message: `<p>Error al obtener la información de los SKUs</p>`,
            })

        }
    }).catch((error) => {
        console.log(error);
        iziToast.error({
            position: "topRight",
            title: `Ha surgido un error`,
            message: `<p>Favor de verificar la conexión con el servidor </p>`,
        })

        loader.style.display = 'none'
    })
}


function PeticionAsignarLinea() {
    loader.style.display = 'flex'
    let turno = obtenerTurno()
    let selectOF = document.getElementById("selectOF")

    if (document.getElementById("kgxhora").value == "" || document.getElementById("kgxhora").value == 0) {
        iziToast.error({
            position: "topRight",
            title: `Ha surgido un error`,
            message: `<p>Favor de ingresar los Kg por hora.</p>`,
        })
        loader.style.display = "none"
        return
    }

    if (entradaBusqueda.value != 0 && document.getElementById("kgxhora").value != '' && selectOF.options[selectOF.selectedIndex].value != 0) {
        var data = {
            "idSku": entradaBusqueda.value,
            "linea": numeroLinea.toString(),
            "turno": turno.toString(),
            "kgxhora": document.getElementById("kgxhora").value,
            "ordenfabricacion": selectOF.options[selectOF.selectedIndex].textContent,
            "folio": selectOF.options[selectOF.selectedIndex].value,
            "planta": planta
        }

        fetch('/AsignacionLinia/AsignSkuToLine', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data)
        }).then((response) => {
            return response.ok ? response.json() : Promise.reject(response)
        }).then((jsonData) => {
            if (jsonData.status == 200) {
                var jsonResponse = JSON.parse(jsonData.data)
                document.getElementById('buttonSection').innerHTML = ''
                getLineas()
                $('.cerrarModal').click()
                iziToast.success({
                    position: "topRight",
                    title: `Asignación Completa`,
                    message: `<p>${jsonResponse.response}</p>`,
                })

                loader.style.display = 'none'
            } else {
                iziToast.error({
                    position: "topRight",
                    title: `Ha surgido un error`,
                    message: `<p>Error al asignar una nueva línea.</p>`,
                })

                loader.style.display = 'none'
            }
        }).catch((error) => {
            iziToast.error({
                position: "topRight",
                title: `Ha surgido un error`,
                message: `<p>No se ha podído realizar la asignación. Favor de reintentar.</p>`,
            })

            loader.style.display = 'none'
        })
    } else {
        iziToast.error({
            position: "topRight",
            title: `Ha surgido un error`,
            message: `<p>Favor de seleccionar un ItemCode Válido</p>`,
        })

        loader.style.display = 'none'
    }
}

function getBitacoraInfo() {
    tablaBitacora.clear().draw()
    var data = {
        "linie": numeroLinea.toString(),
        "planta": planta
    }

    fetch("/AsignacionLinia/GetBitacoraLinie", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        if (jsonData.status == 200) {
            if (jsonData != null) {
                var data = JSON.parse(jsonData.data)
                let Rows = []
                for (x = 0; x < data.length; x++) {
                    Rows.push([data[x].name, data[x].dateasign, data[x].codigo])
                }
                tablaBitacora.rows.add(Rows).draw();
            }
        }
    }).catch((error) => {
        iziToast.warning({
            position: "topRight",
            title: `Aviso`,
            message: `<p>No hay historial de cambios recientes para esta línea</p>`,
            color: 'blue'
        })
       
        loader.style.display = 'none'
    })
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
        if (jsonData.status == 200) {
            numLineas = JSON.parse(jsonData.data);
            //console.log(numLineas);
            for (x = 0; x < numLineas.response.length; x++) {
                let orden = numLineas.response[x].ordenFabricacion;
                let kg = numLineas.response[x].kgXHr;
                let code = numLineas.response[x].itemCodeLinea;

                $("#buttonSection").append(`
                        <button class="btn ${numLineas.response[x].asignado ? "btnAsignada" : "btn-info"}" id="btn-item" data-linea-id="${x + 1}" data-asignado="${numLineas.response[x].asignado ? "Asignado" : "Desasignado"}" data-toggle="modal" data-target="#myModal" onclick="AsignarLinea(this)">
                        <b>
                            Línea ${x + 1} <br /> 
                            ${numLineas.response[x].proceso} <br /> 
                        </b>
                            <p style="font-size: 1.5rem">
                             Orden ${orden == null ? "---" : orden} | KgXHr ${kg == 0 ? "---" : kg} <br> Code ${code == null ? "---" : code}
                            </p>
                        </button>
                    `)
            }
            loader.style.display = 'none'
        }
    }).catch((error) => {
        iziToast.error({
            position: "topRight",
            title: `Ha surgido un error`,
            message: `<p>${error.toString()}</p>`,
        })

        loader.style.display = 'none'
    })
}

function AgregarNuevaLinea() {
    loader.style.display = 'flex'
    let selectInputProcess = document.getElementById("selectInputProcess")

    if (selectInputProcess.options[selectInputProcess.selectedIndex].value == 0) {
        iziToast.error({
            position: "topRight",
            title: `Ha surgido un error`,
            message: `<p>Favor de verificar que todos lo campos estén completos.</p>`,
        })
        loader.style.display = "none"
        return;
    }

    let data = {
        "linea": numLineas.toString(),
        "proceso": selectInputProcess.options[selectInputProcess.selectedIndex].textContent,
        "planta": planta
    }

    fetch("/AsignacionLinia/CreateNewLinea", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        if (jsonData.status == 200) {
            localStorage.setItem("nLinea", "true")
            window.location.reload();
            loader.style.display = "none"
        } else {
            loader.style.display = "none"
            iziToast.error({
                position: "topRight",
                title: `Ha surgido un error`,
                message: `<p>No se ha agregar la nueva línea. Favor de reintentar.</p>`,
            })
        }
    }).catch((error) => {
        iziToast.error({
            position: "topRight",
            title: `Error de Servidor`,
            message: `<p>Error: ${error}.</p>`,
        })
        loader.style.display = "none"
    })
}

//Funcion para quitar eliminar una linea
function EliminarLinea(LineaDelete) {
    loader.style.display = 'flex'

    let data = {
        "linea": LineaDelete,
        "planta": planta
    }

     fetch("/AsignacionLinia/DeleteLineaCreada", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        if (jsonData.status == 200) {
            window.location.reload();
            loader.style.display = "none"
        } else {
            loader.style.display = "none"
            iziToast.error({
                position: "topRight",
                title: `Ha surgido un error`,
                message: `<p>No se ha podido eliminar la linea.</p>`,
            })
        }
    }).catch((error) => {
        iziToast.error({
            position: "topRight",
            title: `Error de Servidor`,
            message: `<p>Error: ${error}.</p>`,
        })
        loader.style.display = "none"
    })
}

function DesasignarTicket() {
    var data = {
        "linea": numeroLinea.toString(),
        "planta": planta
    }

    fetch("/AsignacionLinia/UnasignedLinie", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        if (jsonData.status == 200) {
            document.getElementById('buttonSection').innerHTML = ''
            getLineas()
            $('.cerrarModal').click()
            iziToast.success({
                position: "topRight",
                title: `Desasignación Completa`,
                message: `<p>La línea ${numeroLinea} a sido desasignada </p>`,
            })
        } else {
            iziToast.error({
                position: "topRight",
                title: `Ha surgido un error`,
                message: `<p>No se ha podído realizar la desasignación. Favor de reintentar.</p>`,
            })

            loader.style.display = 'none'
        }
    }).catch((error) => {
        iziToast.error({
            position: "topRight",
            title: `Ha surgido un error`,
            message: `<p>No se ha podído realizar la asignación. Favor de reintentar.</p>`,
        })

        loader.style.display = 'none'
    })
}

function ConvertDate(dateTime) {
    const fecha = new Date(parseInt(dateTime.substring(6)));
    const day = fecha.getDate().toString().padStart(2, '0');
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const year = fecha.getFullYear();
    var date = `${day}/${month}/${year}`
    var hours = `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')} ${fecha.getHours() >= 12 ? 'PM' : 'AM'}`
    let listInfoDate = { "fecha": date, "hora": hours }
    return listInfoDate
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

function obtenerDocEntrys(Code) {

    document.getElementById('loaderDiv').style.display = 'flex';

    var selectOF = document.getElementById("selectOF")
    if (Code == 0) {
        for (let x = selectOF.length; x > 0; x--) 
        {
            selectOF.remove(x);
            loader.style.display = 'none'
            
        }

        return
    }
    let data = {
        //"itemcode": selectDiv.options[selectDiv.selectedIndex].textContent,
        "itemcode": Code,
        "series": localStorage.planta
    }
    fetch("/AsignacionLinia/ObtenerDocEntry", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {

        document.getElementById('loaderDiv').style.display = 'none';

        if (jsonData.status == 200) {

            var data = JSON.parse(jsonData.data);
            var baseEntry = JSON.parse(data.jsonResponse)
            if (selectOF.length > 1) {
                for (let x = selectOF.length; x > 0; x--) {
                    selectOF.remove(x)
                }

                for (let x = 0; x < baseEntry.length; x++) {
                    selectOF.innerHTML += `<option value="${baseEntry[x].BASEENTRY}">${baseEntry[x].DOCNUM}</option>`
                }
            } else {
                for (let x = 0; x < baseEntry.length; x++) {
                    selectOF.innerHTML += `<option value="${baseEntry[x].BASEENTRY}">${baseEntry[x].DOCNUM}</option>`
                }
            }

        } else {
            selectOF.innerHTML = ''
            selectOF.innerHTML = `<option value="0" selected>Seleccione...</optin>`
        }
    }).catch((error) => {
        iziToast.error({
            position: "topRight",
            title: "Error",
            message: `${error.toString()}`
        })
    })
}

//codes autocomplete
entradaBusqueda.addEventListener('input', () => {
    const terminoBusqueda = entradaBusqueda.value.toLowerCase();

    // Obtener sugerencias basadas en terminoBusqueda
    obtenerSugerencias(terminoBusqueda, (sugerencias) => {
        mostrarSugerencias(sugerencias);
    });
});

function obtenerSugerencias(terminoBusqueda, callback) {

    // Filtrar sugerencias basándose en terminoBusqueda
    const sugerenciasFiltradas = sugerencias.filter(sugerencia => sugerencia.etiqueta.toLowerCase().includes(terminoBusqueda));

    callback(sugerenciasFiltradas);
}

function mostrarSugerencias(sugerencias) {
    listaSugerencias.innerHTML = '';

    if (sugerencias.length === 0) {
        const sinResultados = document.createElement('li');
        sinResultados.textContent = 'No se encontraron sugerencias';
        listaSugerencias.appendChild(sinResultados);
        return;
    }

    sugerencias.forEach(sugerencia => {
        const elementoSugerencia = document.createElement('li');
        elementoSugerencia.textContent = sugerencia.etiqueta;

        elementoSugerencia.addEventListener('click', () => {
            entradaBusqueda.value = sugerencia.etiqueta; // Establecer la etiqueta como valor de entrada
            // cuando seleccionamos la sugerencia
            devolverValorSugerencia(sugerencia.valor);
            listaSugerencias.innerHTML = ''; // Ocultar la lista de sugerencias
        });

        listaSugerencias.appendChild(elementoSugerencia);
    });
}

function devolverValorSugerencia(valor) {
    //obtenemos los kghora de acuerdo al codigo seleccionad
    ObtenerInfoPorLinea(valor, planta);
    // obtenemos el numero de orden de acuerdo al codigo seleccionado
    obtenerDocEntrys(valor);
}

function ObtenerInfoPorLinea(sku, planta) {

    let data = {
        "sku": sku,
        "planta": planta
    }

    fetch("/DetallesSKU/ObtenerInfoLinea", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject();
    }).then((jsonData) => {
        if (jsonData.status == 200) {
            //extraemos los datos
            let DetailsJson = JSON.parse(jsonData.data)
            let SkuDetailLinea = DetailsJson.skuDetailLinea

            for (x = 0; x < SkuDetailLinea.length; x++) {
                //buscamos en los registros la linea que coincide con el codigo
                if (SkuDetailLinea[x].linea == numeroLinea) {
                    //le asignamos los kghora
                    $('#kgxhora').val(SkuDetailLinea[x].kgHora);
                }

            }

        } else {
            iziToast.error({
                position: "topRight",
                title: `Faltan datos`,
                message: `<p>No se encontraron kgHora para el codigo seleccionado,
                ingresar manualmente.</p>`,
            })
            //loader.style.display = 'none'
        }
    }).catch((error) => {
        console.log(error)
        iziToast.error({
            position: "topRight",
            title: `Error`,
            message: `<p>No se pudo obtener los datos de linea.</p>`,
        })
        //loader.style.display = 'none'
    })
}

function infoExcel() {
    let data = {
        "planta": planta
    }
    loader.style.display = "flex"
    fetch("/PesajePt/GetNumberOfLinies", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        if (jsonData.status == 200) {
            let lineas = JSON.parse(jsonData.data)
            lineas = lineas.response;
            //console.log(lineas);
            lineas = lineas.map(({ numLinea, proceso, kgXHr, itemCodeLinea, ordenFabricacion }) => ([
                numLinea,
                proceso,
                itemCodeLinea,
                kgXHr,
                ordenFabricacion
            ]));

            generarexcel(lineas);
        }
        loader.style.display = "none"

    }).catch((error) => {
        iziToast.error({
            position: "topRight",
            title: `Ha surgido un error`,
            message: `<p>${error.toString()}</p>`,
        })
        loader.style.display = "none"

    })
}

function generarexcel(data) {
    loader.style.display = "flex"
    var datos = new FormData();

    datos.append("matrizdatos", JSON.stringify(data));
    // Crear un nuevo objeto XMLHttpRequest
    var xhr = new XMLHttpRequest();
    var url = '/AsignacionLinia/generarexcel';
    // Configurar la solicitud
    xhr.open('POST', url, true);

    // Manejar la respuesta
    xhr.onload = function () {
        if (xhr.status === 200) {
            // Mostrar el texto de la respuesta en la consola
            var respuesta = JSON.parse(xhr.responseText);
            loader.style.display = "none"
            if (respuesta.R == 1) {
                descargarArchivo('Datos Maestros Articulo.xlsx', respuesta.data);
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




//nos aseguramos de lmpiar todo el modal cada vez que se cierre
$('.cerrarModal').click(function () {
    let optionsSelect = `<option value="0" selected>Seleccione...</option>`;
    listaSugerencias.innerHTML = '';
    entradaBusqueda.value = "";
    $('#selectOF').html(optionsSelect);
    $('#kgxhora').val('');
    $('#inputNumLineaQuitar').val('');
})

//funciones para cuando la pagina ha cargado
$(document).ready(function () {
    //nos aseguramos de que el input de eliminar linea solo acepte numeros enteros
    $('#inputNumLineaQuitar').on('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');

        let numlineasVal = numLineas.response.length;
        // nos aseguramos de que el numero ingresado sea menor o igual a "numLineas"
        if (parseInt(this.value) > numlineasVal) {
            this.value = ""; // Si el valor supera numLineas, lo ajustamos a ""
        }
    });

    //Btn elimiar linea
    $('#EliminarLineaBtn').click(function () {
        //obtenemos la linea a eliminar desde el input
        let LineaDelete = $('#inputNumLineaQuitar').val();

        EliminarLinea(LineaDelete);
    })
});