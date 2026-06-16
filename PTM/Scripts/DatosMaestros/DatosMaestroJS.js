const loader = document.getElementById('loaderDiv')
let tableDatosMestros;
let planta;

$(document).ready(function () {
    localStorage.planta == '335' ? planta = '2' : planta = '1'
    loader.style.display = 'flex'
    tableDatosMestros = $('#DatosMaestros').DataTable({
        ordering: false,
        responsive: true
    })
    PeticionApiSKU()
})

let skuInfo
//sollicitqamos los sku al api
function PeticionApiSKU() {
    let data = {
        "planta": planta
        }
    fetch("/DatosMaestros/GetAllPt", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonString) => {
        if (jsonString.status == 200) {
            let Rows = []
            const fecha = new Date
            var responseJson = JSON.parse(jsonString.data)
            //console.log(responseJson)
            var data = responseJson.data
            skuInfo = responseJson.skuInfo
            //console.log(data)
            let fechaActualizacionñ
            let iconUpdate = false;
            let usuario = ""

            for (x = 0; x < data.length; x++) {
                fechaActualizacion = "No Existe Actualización"
                usuario = "No Existe Actualización"
                iconUpdate = '<i style="font-size:14px; color: #C12123;" class="fa fa-times" aria-hidden="true"></i>'
                let tara = 0;
                if (skuInfo.length != 0) {
                    let codigoItem = data[x].codigoitem
                    let skuFilter = skuInfo.filter(x => x.itemCode == codigoItem);
                    if (skuFilter.length != 0) {
                        console.log(skuFilter)
                        let isUpdate = ExisteActualizacion(skuFilter[0].lastUpdate)
                        fechaActualizacion = ConvertDate(skuFilter[0].lastUpdate)
                        skuFilter[0].usuario == null || skuFilter[0].usuario == "" ? usuario = "No Existe Actualización" : usuario = skuFilter[0].usuario
                        console.log(isUpdate)
                        isUpdate ? iconUpdate = '<i style="font-size:14px; color: #2B9B2B;" class="fa fa-check" aria-hidden="true"></i>' : iconUpdate = '<i style="font-size:14px; color: #C12123;" class="fa fa-times" aria-hidden="true"></i>'
                        tara = skuFilter[0].variable;
                    }
                 
                }
                //console.log(tara)
                Rows.push([data[x].codigoitem, data[x].nombre, iconUpdate, fechaActualizacion, usuario,tara, `<button class="btn btn-info btn-details" onclick="verDetallesSKU('${data[x].codigoitem}')">Ver detalles</button>`])
            }

            tableDatosMestros.rows.add(Rows).draw()

            loader.style.display = 'none'
        } else {
            iziToast.error({
                position: "topRight",
                title: "Ha surgido un error",
                message: "<p>No se encuentran código activos</p>"
            })
            loader.style.display = 'none'

        }
    }).catch((error) => {
        console.error(error);
        iziToast.error({
            position: "topRight",
            title: `Ha surgido un error`,
            message: `<p>Favor de verificar la conexión con el servidor</p>`,
        })

        loader.style.display = 'none'
    })
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

function verDetallesSKU(id) {
    if (localStorage.getItem('id') === null) {
        sessionStorage.setItem('id', id);
        window.location.href = '/DetallesSku/Index'
    } else {
        sessionStorage.setItem('id', id);
        window.location.href = '/DetallesSku/Index'
    }
}

function ExisteActualizacion(fechaActualizacion) {

    var fechaActualizacion = new Date(fechaActualizacion)
    console.log(fechaActualizacion)
    let horaActual = new Date();

    let fechaInicio1Rango = new Date();
    fechaInicio1Rango.setHours(4, 30, 0, 0);

    let fechaFin1Rango = new Date();
    fechaFin1Rango.setHours(16, 30, 0, 0);

    let fechaInicio2Rango = new Date();
    fechaInicio2Rango.setHours(16, 30, 0, 0);

    let fechaFin2Rango = new Date();
    fechaFin2Rango.setDate(fechaFin2Rango.getDate() + 1)
    fechaFin2Rango.setHours(4, 30, 0, 0);
    let actualizado = false

    if (horaActual > fechaInicio1Rango && horaActual < fechaFin1Rango) {
        if (fechaActualizacion > fechaInicio1Rango && fechaActualizacion < fechaFin1Rango) {
            actualizado = true
        }
        
    } else {
        if ((horaActual.getHours() >= 0 && horaActual.getHours() <= 4) ||
            (horaActual.getHours() === 4 && horaActual.getMinutes() <= 30)) {
            fechaInicio2Rango.setDate(fechaInicio2Rango.getDate() - 1)
            fechaFin2Rango.setDate(fechaFin2Rango.getDate() - 1)
        }
        if (fechaActualizacion > fechaInicio2Rango && fechaActualizacion < fechaFin2Rango) {
            actualizado = true
        }
    }

    //const fechaFinRango = new Date(fechaInicioRango.getTime() + 24 * 60 * 60 * 1000);
    //fechaFinRango.setHours(4);
    //fechaFinRango.setMinutes(30);
    //fechaFinRango.setSeconds(0);
    //fechaFinRango.setMilliseconds(0);

    

    return actualizado
}

function ActualizarItemCode() {
    loader.style.display = "flex"
    let itemCode = document.getElementById("updateCodeInp").value

    if (itemCode == '') {
        iziToast.error({
            position: "topRight",
            title: `Error Generado`,
            message: `<p>Favor de verificar que el campo no este vacío</p>`,
        })

        loader.style.display = 'none'
        return;
    }

    let data = {
        "itemcode": itemCode
    }

    fetch("/DatosMaestros/UpdateItemCode", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        var json = JSON.parse(jsonData.data)
        console.log(json)
        if (jsonData.status == 200) {
            var result = json.data
            if (result[0].status == '200') {
                iziToast.success({
                    position: "topRight",
                    title: `Actualización Exitosa`,
                    message: `<p>El código ${itemCode} ha sido actualizado correctamente</p>`,
                })
                document.getElementById("CerrarModal").click()
                tableDatosMestros.clear().draw()
                PeticionApiSKU();
            } else {
                iziToast.error({
                    position: "topRight",
                    title: `Error Generado`,
                    message: `${result[0].message}`,
                })

                loader.style.display = 'none'
            }
        } else {
            iziToast.error({
                position: "topRight",
                title: `Error Generado`,
                message: `${json[0].MESSAGE}`,
            })

            loader.style.display = 'none'
        }
    }).catch((error) => {
        iziToast.error({
            position: "topRight",
            title: `Error Generado`,
            message: `<p>Favor de verificar que el campo no este vacío</p>`,
        })

        loader.style.display = 'none'
    })
}

function generarexcelDm() {
    loader.style.display = "flex"
    var datos = new FormData();

    const data = tableDatosMestros.rows().data().toArray();
    // Crear un nuevo array excluyendo la última y la tercera columna de cada fila
    const filteredData = data.map(row => {
        // Filtrar las columnas, excluyendo la tercera (índice 2) y la última (índice -1)
        return row.filter((_, index) => index !== 2 && index !== row.length - 1);
    });
    datos.append("matrizdatos", JSON.stringify(filteredData));
    // Crear un nuevo objeto XMLHttpRequest
    var xhr = new XMLHttpRequest();
    let url = '/DatosMaestros/getexcel'
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

