const loader = document.getElementById('loaderDiv')
var sku = sessionStorage.getItem('id')
let labelSku = document.getElementById('skuCode')
let inputItemName = document.getElementById('ItemName')
let inputCategoriaSku = document.getElementById('CategorySKU')
let inputLinea = document.getElementById('Linie')
let inputPesoMin = document.getElementById('minWeight')
let inputPesoMax = document.getElementById('maxWeight')
let inputMultiplo = document.getElementById('inputMultiplo')
let selectMulti = document.getElementById('selectMulti')
let inputVariable = document.getElementById('inputVariable')
let selectFijo = document.getElementById('selectFijo')
let inptVariable = document.getElementById('inputVariable')
let inptMultiplo = document.getElementById('inputMultiplo')
let inptFijo = document.getElementById("FijoValue")

let PvcMatEmb = ["Fleje", "Anillo", "Madera"]
let InyMatEmb = ["Costales", "Anillo", "Arpilla", "Tarima"]

let planta

inptVariable.addEventListener("keydown", (event) => {
    if (event.key === "e" || event.key === "E") {
        event.preventDefault();
    }
});

inptMultiplo.addEventListener("keydown", (event) => {
    if (event.key === "e" || event.key === "E") {
        event.preventDefault();
    }
});

$(document).ready(() => {
    localStorage.planta == '335' ? planta = '2' : planta = '1'
    GetSkuDetails(sku);
    ObtenerInfoPorLinea(sku, planta);
})

//obteneomos los primeros detalles del codigo
function GetSkuDetails(SKU) { 
    loader.style.display = 'flex'
    var data = {
        "sku": SKU,
        "planta": planta
    }
    fetch('/DetallesSku/GetPTbySku', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.status == 200 ? response.json() : Promise.reject(response)
    }).then((jsonData) => {
        //console.log(jsonData)
        if (jsonData.status == 200) {

            var jsonResult = JSON.parse(jsonData.data)
            var data = jsonResult.data
            //console.log(data)
            if (data[0].nombre.toLowerCase().includes("pvc")) {
                for (x = 0; x < PvcMatEmb.length; x++) {
                    document.getElementById("divMatEmb").innerHTML += `
                        <div class="col-lg-4">
                            ${PvcMatEmb[x]}
                            <div>
                                <input class="form-control FormControlTexts" type="number" id="input${PvcMatEmb[x]}" style="width:100% !important" />
                            </div>
                        </div>
                    `
                }
            } else {
                for (x = 0; x < InyMatEmb.length; x++) {
                    document.getElementById("divMatEmb").innerHTML += `
                        <div class="col-lg-3">
                            ${InyMatEmb[x]}
                            <div>
                                <input class="form-control FormControlTexts" type="number" id="input${InyMatEmb[x]}" style="width:100% !important" />
                            </div>
                        </div>
                    `
                }
            }

            var skuInfo = jsonResult.skuInfos

            //console.log(skuInfo)
            //let infoPtSku = jsonData.data.productoTerminados
            labelSku.value = data[0].codigoitem
            inputItemName.value = data[0].nombre
            inputCategoriaSku.value = data[0].categoria.replace('""', '')
            //infoPtSku[0].Status == true ? inputLinea.value = `L${infoPtSku[0].numLine}` : inputLinea.value = 'No Asignado'
            inputPesoMax.value = data[0].pesomaximo
            inputPesoMin.value = data[0].pesominimo

            //loader.style.display = 'none'//cambiar de lugar a la nueva funcion

            if (skuInfo.length != 0) {
                let numero = skuInfo[0].variable
                let numeroCant = skuInfo[0].multiploCant
                //const numeroFormateadoC = numeroCant.toString().slice(0, -3) + '.' + numeroCant.toString().slice(-3);
                let numeroFijo = skuInfo[0].fijoCantidad
                //const numeroFormateadoF = numeroFijo.toString().slice(0, -3) + '.' + numeroFijo.toString().slice(-3);
                inptMultiplo.value = numeroCant
                if (selectMulti.value != null) {
                    selectMulti.value = skuInfo[0].multiploCategoria
                }
                inputVariable.value = numero

                document.getElementById("inputFleje") == null ? '' : document.getElementById("inputFleje").value = skuInfo[0].flejeCant
                document.getElementById("inputAnillo") == null ? '' : document.getElementById("inputAnillo").value = skuInfo[0].anilloCant
                document.getElementById("inputMadera") == null ? '' : document.getElementById("inputMadera").value = skuInfo[0].maderaCant
                document.getElementById("inputCostales") == null ? '' : document.getElementById("inputCostales").value = skuInfo[0].costalesCant
                document.getElementById("inputArpilla") == null ? '' : document.getElementById("inputArpilla").value = skuInfo[0].arpillaCant
                document.getElementById("inputTarima") == null ? '' : document.getElementById("inputTarima").value = skuInfo[0].tarimaCant
            }
        } else {
            loader.style.display = 'none'
            var jsonResult = JSON.parse(jsonData.data)
            var data = jsonResult.data
            iziToast.error({
                position: "topRight",
                title: `Error`,
                message: `<p>${data.data}.</p>`,
            })
        }
    }).catch((error) => {
        loader.style.display = 'none'
    })
}

//inicio del evento, actualizar
function ActualizarSKU() {
    //actualizamos los datos de linea, y luego los demas valores (para los datos de linea se usa prodecure)
    ActualizarDetailsLinea();
    /*let FijoValue = document.getElementById("FijoValue").value*/
    if (selectMulti[selectMulti.selectedIndex].value == 0/* || selectFijo[selectFijo.selectedIndex].value == 0*/) {
        iziToast.error({
            position: "topRight",
            title: `Error`,
            message: `<p>Favor de ingresar los valores de los campos Multiplo y Fijo.</p>`,
        })
        return
    }

    let faltante = []
    if (inputMultiplo.value == '') {
        faltante.push('Multiplo')
    }

    if (inputVariable.value == '') {
        faltante.push('Variable')
    }

    //if (FijoValue == '') {
    //    faltante.push('fijoValue')
    //}

    if (faltante.length != 0) {
        iziToast.error({
            position: "topRight",
            title: `Error`,
            message: `<p>Verifique que los campos de Múltiplo estén correctos.</p>`,
        })
        return
    }

    let data = {
        "id": sku,
        "MultiploCant": inputMultiplo.value,
        "MultiploCat": $(selectMulti[selectMulti.selectedIndex]).data('multiplo'),
        "Variable" : inputVariable.value,
        //"FijoCat": $(selectFijo[selectFijo.selectedIndex]).data('fijo'),
        //"FijoValue": FijoValue,
        "itemName": document.getElementById("ItemName").value,
        "minWeight": (document.getElementById("minWeight").value).toString(),
        "flejeCant": document.getElementById("inputFleje") == null ? '0' : document.getElementById("inputFleje").value,
        "anilloCant": document.getElementById("inputAnillo") == null ? '0' : document.getElementById("inputAnillo").value,
        "maderaCant": document.getElementById("inputMadera") == null ? '0' : document.getElementById("inputMadera").value,
        "costalesCant": document.getElementById("inputCostales") == null ? '0' : document.getElementById("inputCostales").value,
        "arpillaCant": document.getElementById("inputArpilla") == null ? '0' : document.getElementById("inputArpilla").value,
        "tarimaCant": document.getElementById("inputTarima") == null ? '0' : document.getElementById("inputTarima").value,
        "planta": planta,
        "usuario": localStorage.usuario
    }
    //loader.style.display = 'none'
    // mandamos los datos para procesarlos
    PeticionActualizarSku(data)
}

function PeticionActualizarSku(infoMaterialEmb) {
    loader.style.display = 'flex'
    fetch("/DetallesSKU/UpdateMaterialEmbalaje", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(infoMaterialEmb)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject();
    }).then((jsonData) => {
        if (jsonData.status == 200) {
            iziToast.success({
                position: "topRight",
                title: `Actualizado`,
                message: `<p>El Sku ${labelSku.value} ha sido actualizado correctamente.</p>`,
            })
            loader.style.display = 'none'
        } else {
            iziToast.error({
                position: "topRight",
                title: `Error`,
                message: `<p>Error al actualizar los datos del SKU ${labelSku.value}.</p>`,
            })
            loader.style.display = 'none'
        }
    }).catch((error) => {
        console.log(error)
        iziToast.error({
            position: "topRight",
            title: `Error`,
            message: `<p>No se ha podido actualizar los datos. Favor de reintentar más tarde.</p>`,
        })
        loader.style.display = 'none'
    })
}
//------------------------*************---------------------
//obtenemos la informacion de la linea
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

            let DetailsJson = JSON.parse(jsonData.data)
            let SkuDetailLinea = DetailsJson.skuDetailLinea

            let divDetailsLine = document.getElementById("divDetailsLine");
            //limpiamos cualquier contenido anterior
            divDetailsLine.innerHTML = "";
            //creamos las variables de los input
            let InputkgHora;
            let InputLinea;
            let InputEficiencia;
            let IntputPlanta;

            let EficienciaL;

            for (x = 0; x < SkuDetailLinea.length; x++) {

                //calculamos la eficiencia
                //si los kgHora viene en null o 0 (porque no hay valores registrados en SKUkgHrporLinea)
                if (SkuDetailLinea[x].kgHora == 0 || SkuDetailLinea[x].kgHora == null) {                    
                    EficienciaL = "No existe ultimo registro"
                } else {
                    EficienciaL = SkuDetailLinea[x].pesoTotal / (SkuDetailLinea[x].kgHora * 24) * 100 //multiplicamos por 24, ya que es el turno completo
                    EficienciaL = EficienciaL.toFixed(2)
                    //si EficienciaL se vuelve 0 (porque pesoTotal viene en 0, ya que no se encontro un registro en ProductoTerminados)
                    if (EficienciaL == 0.00) {
                        EficienciaL = "No existe ultimo registro"
                    }
                }
                

                InputkgHora = `<div class="col-3">
                                   <input class="form-control FormControlTexts KgHoraClass" value="${SkuDetailLinea[x].kgHora}"/>
                                   <br />
                               </div>`;
                InputEficiencia = `<div class="col-3">
                                       <input class="form-control FormControlTexts EficienciaClass" value="${EficienciaL}" disabled/>
                                       <br />
                                   </div>`;
                InputLinea = `<div class="col-3">
                                  <input class="form-control FormControlTexts LineaClass" value="${SkuDetailLinea[x].linea}"/>
                                  <br />
                              </div>`;
                IntputPlanta = `<div class="col-3">
                                  <input class="form-control FormControlTexts PlantaClass" value="${SkuDetailLinea[x].planta}" valueId="${SkuDetailLinea[x].id}" disabled/>
                                  <br />
                              </div>`;
                //insertamos los input en el div correspondiente
                divDetailsLine.innerHTML += InputkgHora + InputEficiencia + InputLinea + IntputPlanta;
            }
            
            loader.style.display = 'none'
        } else {
            iziToast.error({
                position: "topRight",
                title: `Faltan datos`,
                message: `<p>No se encontraron Datos.</p>`,
            })
            loader.style.display = 'none'
        }
    }).catch((error) => {
        console.log(error)
        iziToast.error({
            position: "topRight",
            title: `Error`,
            message: `<p>No se pudo obtener los datos de linea.</p>`,
        })
        loader.style.display = 'none'
    })
}

//actualizamos la info de lineas para el sku
function ActualizarDetailsLinea() {

    let data = [];
    let skuUpdate = sku;
    let plantaUpdate = planta;
    

    // Obtener los valores de los inputs por clase
    let kgHoraElements = document.getElementsByClassName('KgHoraClass');
    let lineaElements = document.getElementsByClassName('LineaClass');
    //obtenemos los ids desde el campo de planta, se le asignaron en valuesId
    let idsElements = document.getElementsByClassName('PlantaClass');

    // Iterar sobre los inputs obtenidos por clase
    for (let i = 0; i < kgHoraElements.length; i++) {
        // Crear un objeto para cada línea
        let lineaData = {
            "kgHora": kgHoraElements[i].value || null,
            "linea": lineaElements[i] ? lineaElements[i].value : null,
            "id": idsElements[i] ? idsElements[i].getAttribute('valueId') : null,
            "sku": skuUpdate,
            "planta": plantaUpdate
        };
        // Agregar los objetos a data
        data.push(lineaData);
    }
    //console.log(data);

    //verificamos si data viene vacio (algunos codigos no tienen estos datos aun), para saltaron este proceso
    if (data.length === 0) {
        console.log("No hay datos de linea para actualizar.");
        return; // Salir de la función si no hay datos
    }
    
    fetch("/DetallesSKU/UpdateDataLinea", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject();
    }).then((jsonData) => {
        if (jsonData.status == 200) {

            console.log("datos de linea actualizados correctamente")

        } else {
            console.log("comunicacion correcta con el api, pero no devolvio status 200 al guardar los datos de linea")

            loader.style.display = 'none'
        }
    }).catch((error) => {
        console.log(error)
        iziToast.error({
            position: "topRight",
            title: `Error`,
            message: `<p>No se Actualizaron los datos de linea.</p>`,
        })
        loader.style.display = 'none'
    })
}

function LimpiarYCerrarModal() {
    //limpiamos los intput
    $('#KgHoraNew').val('');
    $('#LineaNew').val('');
    $('#codigoNew').val('');
    //cerramos el modal
    $('#ModalAgregarDatosDeLinea').removeClass('show');
    $('#ModalAgregarDatosDeLinea').css('display', 'none');
    
}

//Ingresar datos nuevos (kgHora y linea) para un codigo ya existente
function AgregarDatosDeLinea(kgHoraNew, LineaNew, planta, codigoNew) {
    loader.style.display = 'flex'

    let data = {
        "kgHora": kgHoraNew,
        "linea": LineaNew,
        "planta": planta,
        "codigo": codigoNew
    }

    fetch("/DetallesSKU/AddNewDataLine", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.ok ? response.json() : Promise.reject();
    }).then((jsonData) => {
        if (jsonData.status == 200) {

            iziToast.success({
                position: "topRight",
                title: `Actualizado`,
                message: `<p>El Sku ${codigoNew} ha sido añadido correctamente.</p>`,
            })
            LimpiarYCerrarModal()
            loader.style.display = 'none'
        } else {
            iziToast.error({
                position: "topRight",
                title: `Faltan datos`,
                message: `<p>No se añadieron los datos correctamente.</p>`,
            })
            LimpiarYCerrarModal()
            loader.style.display = 'none'
        }
    }).catch((error) => {
        console.log(error)
        iziToast.error({
            position: "topRight",
            title: `Error`,
            message: `<p>No se pudo conectar con el servidor, intentar mas tarde.</p>`,
        })
        loader.style.display = 'none'
    })
}

//TODO: ATIONS
//al hacer click en actualizar
$(document).on("click", ".ActualizarSKU", function () {
    ActualizarSKU();
});

//al hacer click en agregar datos de linea (abrimos el modal)
$(document).on("click", "#MostrarModalAgregarDatosDeLinea", function () {
    let codigoNew = $('#codigoNew').val(sku);
    $('#ModalAgregarDatosDeLinea').addClass('show');
    $('#ModalAgregarDatosDeLinea').css('display', 'block');
});

//cerrar el modal 'agregar datos de linea'
$(document).on("click", "#cerrarModalAddLinea", function () {
    LimpiarYCerrarModal()
});

//cerrar el modal 'agregar datos de linea' cuando se haga click fuera de él
$(document).on("click", function (e) {
    // Verifica si el clic fue fuera del modal y no sobre el modal o su contenido
    if ($(e.target).hasClass('modal') && $(e.target).attr('id') == 'ModalAgregarDatosDeLinea') {
        LimpiarYCerrarModal()
    }
});

//al hacer click en Agregar, dentro del modal'agregar datos de linea'
$(document).on("click", "#AddDatosLineaNew", function () {
    //obtenemos los value de los input
    let kgHoraNew = $('#KgHoraNew').val();
    let LineaNew = $('#LineaNew').val();
    let codigoNew = $('#codigoNew').val();

    //verificamos que los input no vengan vacios
    if (kgHoraNew == "" || LineaNew == "" || codigoNew == "") {
        iziToast.warning({
            position: "topRight",
            title: `Campos vacíos`,
            message: `<p>Favor de llenar todos los campos</p>`,
        })
    } else {
        AgregarDatosDeLinea(kgHoraNew, LineaNew, planta, codigoNew);
    }
});