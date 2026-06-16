const loader = document.getElementById('loaderDiv')

var jsondata = null;
var tablataras;
var tablaKgHora;
var datosfinales = null; //guardaremos los datos de taras o kghora, dependiendo cual archivo carguemos

$(document).ready(() => {
    //obtenemos las tablas desde el html
    tablataras = $('#tablaDatos').DataTable();
    tablaKgHora = $('#tablaDatosKgHora').DataTable();

});

//cargar el excel de taras
function cargarexcel() {
    loader.style.display = 'flex'
    tablataras.clear().draw()
    var inputArchivo = document.getElementById('archivoexcel');
    // Verificar que se haya seleccionado un archivo
    if (inputArchivo.files.length > 0) {
        var archivo = inputArchivo.files[0];
        // Crear instancia de FormData

        var formData = new FormData();
        formData.append('archivoexcel', archivo);

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/Taras/exceltojson', true);

        xhr.onload = function () {
            if (xhr.status === 200) {
                var obj = JSON.parse(xhr.responseText);
                jsondata = JSON.parse(obj.data);
                limpiarmatriz(jsondata);
            } else {
                console.log('Error al enviar el archivo de Excel.');
                loader.style.display = 'none'
                iziToast.error({
                    position: "topRight",
                    title: `Ha surgido un error`,
                    message: `<p>Error al al leer el archivo excel.</p>`,
                })
            }
        };

        xhr.send(formData);

    } else {
        iziToast.error({
            position: "topRight",
            title: `Faltan datos`,
            message: `<p>Favor de agregar el archivo para ser cargado.</p>`,
        })
        loader.style.display = 'none'
    }
}

//cargar el excel de kgHora
function cargarexcelKgHora() {
    loader.style.display = 'flex'

    //limpiamos la tabla
    tablaKgHora.clear().draw()

    //asignamos el archivo a nuestra variable
    var inputArchivokg = document.getElementById('archivoexcelKgHora');

    // Verificar que se haya seleccionado un archivo
    if (inputArchivokg.files.length > 0) {
        var archivokg = inputArchivokg.files[0];

        // Crear instancia de FormData
        var formDatakg = new FormData();
        formDatakg.append('archivoexcel', archivokg);

        var xhr = new XMLHttpRequest();
        //accedemos al controler para convertir el excel en json
        xhr.open('POST', '/Taras/exceltojson', true);

        xhr.onload = function () {
            if (xhr.status === 200) {
                var obj = JSON.parse(xhr.responseText);
                jsondata = JSON.parse(obj.data);
                //mandamos el json a su respectiva tabla
                geneartablaKgHora(jsondata);
            } else {
                console.log('Error al convertir el archivo Excel en json.');
                loader.style.display = 'none'
                iziToast.error({
                    position: "topRight",
                    title: `Ha surgido un error`,
                    message: `<p>Error al al leer el archivo excel.</p>`,
                })
            }
        };

        xhr.send(formDatakg);

    } else {
        iziToast.error({
            position: "topRight",
            title: `Faltan datos`,
            message: `<p>Favor de agregar el archivo para ser cargado.</p>`,
        })
        loader.style.display = 'none'
    }
}

function limpiarmatriz(matriz) {

    geneartabla(matriz);
}

//generamos la tabla de taras para previsualizar
function geneartabla(datos) {
    datos.shift();
    for (var i = 0; i < datos.length; i++) {
        datos[i][1] = parseFloat(datos[i][1]).toFixed(3);
    }

    datosfinales = datos;
    //console.log(datosfinales)
    tablataras.rows.add(datos).draw();
    loader.style.display = 'none'
}

//generamos la tabla de kgHora para previsualizar
function geneartablaKgHora(datos) {
    datos.shift();
    for (var i = 0; i < datos.length; i++) {
        datos[i][1] = parseFloat(datos[i][1]).toFixed(3);
    }

    //guardamos los datos para enviarlos al api posteriormente
    datosfinales = datos;
    //console.log(datosfinales)
    tablaKgHora.rows.add(datos).draw();
    loader.style.display = 'none'
}


function actualizartaras() {
    loader.style.display = "flex"
    //convertimos a jsno los datos ya cargados
    var jsondatosfinales = JSON.stringify(datosfinales);

    if (jsondatosfinales == undefined || jsondatosfinales == null) {
        loader.style.display = 'none'
        return
    }

    var formData = new FormData();
    formData.append('datos', jsondatosfinales);

    var xhr = new XMLHttpRequest();
    //accedemos al controler (mandamos los datos en json)
    xhr.open('POST', '/Taras/actiualizartarasAsync', true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            var obj = JSON.parse(xhr.responseText);
            iziToast.success({
                position: "topRight",
                title: `Actualización Correcta`,
                message: `<p>Los códigos se han actualizado de manera correcta</p>`,
            })
            //console.log(obj);
            loader.style.display = "none"
            LimpiarDAtosExcel();
        } else {
            iziToast.error({
                position: "topRight",
                title: `Ha surgido un error`,
                message: `<p>Error al obtener la información de los SKUs</p>`,
            })
            loader.style.display = "none"
        }
    };

    xhr.send(formData);


}

function actualizarKgHora() {
    loader.style.display = "flex"
    //convertimos a jsno los datos ya cargados
    var jsondatosfinales = JSON.stringify(datosfinales);

    if (jsondatosfinales == undefined || jsondatosfinales == null) {
        loader.style.display = 'none'
        return
    }

    var formData = new FormData();
    formData.append('datos', jsondatosfinales);

    var xhr = new XMLHttpRequest();
    //accedemos al controler (mandamos los datos en json)
    xhr.open('POST', '/Taras/actiualizarKgHora', true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            var obj = JSON.parse(xhr.responseText);
            iziToast.success({
                position: "topRight",
                title: `Actualizaci\u00F3n Correcta`, //usamos unicode porque no reconoce los acentos
                message: `<p>Los c\u00F3digos se han actualizado de manera correcta</p>`,
            });
            //console.log(obj);
            loader.style.display = "none"
            LimpiarDAtosExcel();
        } else {
            iziToast.error({
                position: "topRight",
                title: `Ha surgido un error`,
                message: `<p>Error al obtener la información de los SKUs</p>`,
            })
            loader.style.display = "none"
        }
    };

    xhr.send(formData);


}

//Limpiamos todos los datos del excel (tablas y datos)
function LimpiarDAtosExcel() {
    //limoiamos la tabla de kgHora
    tablaKgHora.clear().draw();
    //limoiamos la tabla de Taras
    tablataras.clear().draw();
    //limpiamos los datos
    datosfinales = null;
    //Limpiamos los input de LimpiarDAtosExcel
    $("#archivoexcel").val("");
    $("#archivoexcelKgHora").val("");
}

//ACTIONS
//Al hacer click en cargar datos (de kgHora)
$(document).on("click", "#cargaDatosKgHora", function () {
    cargarexcelKgHora();
});

//Al hacer click en actualizar (de kgHora)
$(document).on("click", "#ActualizaKgHora", function () {
    //verificamos que se hayan cargado los datos del excel
    if (datosfinales == null) {
        iziToast.warning({
            position: "topRight",
            title: `No se Econtraron Datos`,
            message: `<p>Favor de cargar el excel primero</p>`,
        })
    } else {
        actualizarKgHora();
    }
});

//Al hacer click en cargar datos (de taras)
$(document).on("click", "#cargaTaras", function () {
    cargarexcel();
});

//Al hacer click en actualizar (de taras)
$(document).on("click", "#ActualizaTara", function () {
    //verificamos que se hayan cargado los datos del excel
    if (datosfinales == null) {
        iziToast.warning({
            position: "topRight",
            title: `No se Econtraron Datos`,
            message: `<p>Favor de cargar el excel primero</p>`,
        })
    } else {
        actualizartaras();
    }
});