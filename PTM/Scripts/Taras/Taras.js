const loader = document.getElementById('loaderDiv')

var jsondata = null;
var tablataras;
var tablaKgHora;
var datosfinales = null;   // ultimo archivo cargado (compatibilidad)
var datosTaras = null;     // datos del excel de taras
var datosKgHora = null;    // datos del excel de kg/hora

const idiomaTabla = {
    lengthMenu: 'Mostrar _MENU_ registros',
    search: 'Buscar:',
    info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
    infoEmpty: 'Sin registros',
    infoFiltered: '(filtrado de _MAX_ registros)',
    zeroRecords: 'No se encontraron resultados',
    emptyTable: 'Sin registros para mostrar',
    paginate: {
        first: 'Primero',
        previous: 'Anterior',
        next: 'Siguiente',
        last: 'Último'
    }
}

function mostrarLoader(visible) {
    if (loader) {
        loader.style.display = visible ? 'flex' : 'none';
    }
}

function aviso(tipo, titulo, mensaje) {
    if (typeof iziToast === 'undefined') {
        console.warn(titulo + ': ' + mensaje);
        return;
    }
    iziToast[tipo]({
        position: 'topRight',
        title: titulo,
        message: `<p>${mensaje}</p>`
    });
}

$(document).ready(() => {
    //obtenemos las tablas desde el html
    tablataras = $('#tablaDatos').DataTable({
        language: idiomaTabla,
        columnDefs: [
            { targets: 1, className: 'taras-cell-num' },
            { targets: 2, className: 'taras-cell-text' }
        ]
    });

    tablaKgHora = $('#tablaDatosKgHora').DataTable({
        language: idiomaTabla,
        columnDefs: [
            { targets: [1, 2, 3], className: 'taras-cell-num' }
        ]
    });

    actualizarContadores();
});

//refresca los pills "N registros" de cada seccion
function actualizarContadores() {
    if (tablataras) {
        $('#tarasCount').text(tablataras.rows().count());
    }
    if (tablaKgHora) {
        $('#kgHoraCount').text(tablaKgHora.rows().count());
    }
}

//muestra el nombre del archivo elegido junto al boton
function pintarNombreArchivo(inputId, spanId) {
    var input = document.getElementById(inputId);
    var span = document.getElementById(spanId);
    if (!input || !span) return;

    if (input.files && input.files.length > 0) {
        span.textContent = input.files[0].name;
        span.classList.add('is-selected');
    } else {
        span.textContent = 'Ningún archivo seleccionado';
        span.classList.remove('is-selected');
    }
}

$(document).on('change', '#archivoexcel', function () {
    pintarNombreArchivo('archivoexcel', 'archivoexcelName');
});

$(document).on('change', '#archivoexcelKgHora', function () {
    pintarNombreArchivo('archivoexcelKgHora', 'archivoexcelKgHoraName');
});

//cargar el excel de taras
function cargarexcel() {
    mostrarLoader(true)
    tablataras.clear().draw()
    actualizarContadores()

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
                mostrarLoader(false)
                aviso('error', 'Ha surgido un error', 'Error al leer el archivo Excel.');
            }
        };

        xhr.onerror = function () {
            mostrarLoader(false)
            aviso('error', 'Ha surgido un error', 'No se pudo conectar con el servidor.');
        };

        xhr.send(formData);

    } else {
        aviso('error', 'Faltan datos', 'Favor de agregar el archivo para ser cargado.');
        mostrarLoader(false)
    }
}

//cargar el excel de kgHora
function cargarexcelKgHora() {
    mostrarLoader(true)

    //limpiamos la tabla
    tablaKgHora.clear().draw()
    actualizarContadores()

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
                mostrarLoader(false)
                aviso('error', 'Ha surgido un error', 'Error al leer el archivo Excel.');
            }
        };

        xhr.onerror = function () {
            mostrarLoader(false)
            aviso('error', 'Ha surgido un error', 'No se pudo conectar con el servidor.');
        };

        xhr.send(formDatakg);

    } else {
        aviso('error', 'Faltan datos', 'Favor de agregar el archivo para ser cargado.');
        mostrarLoader(false)
    }
}

function limpiarmatriz(matriz) {

    geneartabla(matriz);
}

//generamos la tabla de taras para previsualizar
function geneartabla(datos) {
    datos.shift();
    for (var i = 0; i < datos.length; i++) {
        var tara = parseFloat(datos[i][1]);
        datos[i][1] = isNaN(tara) ? datos[i][1] : tara.toFixed(3);
    }

    datosTaras = datos;
    datosfinales = datos;
    tablataras.rows.add(datos).draw();
    actualizarContadores()
    mostrarLoader(false)
}

//generamos la tabla de kgHora para previsualizar
function geneartablaKgHora(datos) {
    datos.shift();
    for (var i = 0; i < datos.length; i++) {
        var kgHora = parseFloat(datos[i][1]);
        datos[i][1] = isNaN(kgHora) ? datos[i][1] : kgHora.toFixed(3);
    }

    //guardamos los datos para enviarlos al api posteriormente
    datosKgHora = datos;
    datosfinales = datos;
    tablaKgHora.rows.add(datos).draw();
    actualizarContadores()
    mostrarLoader(false)
}


function actualizartaras() {
    mostrarLoader(true)

    if (!datosTaras || datosTaras.length === 0) {
        mostrarLoader(false)
        aviso('warning', 'No se encontraron datos', 'Favor de cargar el excel de taras primero.');
        return;
    }

    //convertimos a json los datos ya cargados
    var jsondatosfinales = JSON.stringify(datosTaras);

    var formData = new FormData();
    formData.append('datos', jsondatosfinales);

    var xhr = new XMLHttpRequest();
    //accedemos al controler (mandamos los datos en json)
    xhr.open('POST', '/Taras/actiualizartarasAsync', true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            iziToast.success({
                position: "topRight",
                title: `Actualización Correcta`,
                message: `<p>Los códigos se han actualizado de manera correcta</p>`,
            })
            mostrarLoader(false)
            LimpiarDAtosExcel();
        } else {
            aviso('error', 'Ha surgido un error', 'Error al actualizar la información de los SKUs.');
            mostrarLoader(false)
        }
    };

    xhr.onerror = function () {
        mostrarLoader(false)
        aviso('error', 'Ha surgido un error', 'No se pudo conectar con el servidor.');
    };

    xhr.send(formData);


}

function actualizarKgHora() {
    mostrarLoader(true)

    if (!datosKgHora || datosKgHora.length === 0) {
        mostrarLoader(false)
        aviso('warning', 'No se encontraron datos', 'Favor de cargar el excel de kg/hora primero.');
        return;
    }

    //convertimos a json los datos ya cargados
    var jsondatosfinales = JSON.stringify(datosKgHora);

    var formData = new FormData();
    formData.append('datos', jsondatosfinales);

    var xhr = new XMLHttpRequest();
    //accedemos al controler (mandamos los datos en json)
    xhr.open('POST', '/Taras/actiualizarKgHora', true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            iziToast.success({
                position: "topRight",
                title: `Actualización Correcta`,
                message: `<p>Los códigos se han actualizado de manera correcta</p>`,
            });
            mostrarLoader(false)
            LimpiarDAtosExcel();
        } else {
            aviso('error', 'Ha surgido un error', 'Error al actualizar la información de los SKUs.');
            mostrarLoader(false)
        }
    };

    xhr.onerror = function () {
        mostrarLoader(false)
        aviso('error', 'Ha surgido un error', 'No se pudo conectar con el servidor.');
    };

    xhr.send(formData);


}

//Limpiamos todos los datos del excel (tablas y datos)
function LimpiarDAtosExcel() {
    //limpiamos la tabla de kgHora
    tablaKgHora.clear().draw();
    //limpiamos la tabla de Taras
    tablataras.clear().draw();
    //limpiamos los datos
    datosfinales = null;
    datosTaras = null;
    datosKgHora = null;
    //Limpiamos los input de archivo
    $("#archivoexcel").val("");
    $("#archivoexcelKgHora").val("");
    //restauramos el nombre de archivo y los contadores
    pintarNombreArchivo('archivoexcel', 'archivoexcelName');
    pintarNombreArchivo('archivoexcelKgHora', 'archivoexcelKgHoraName');
    actualizarContadores();
}

//ACTIONS
//Al hacer click en cargar datos (de kgHora)
$(document).on("click", "#cargaDatosKgHora", function () {
    cargarexcelKgHora();
});

//Al hacer click en actualizar (de kgHora)
$(document).on("click", "#ActualizaKgHora", function () {
    //verificamos que se hayan cargado los datos del excel
    if (!datosKgHora || datosKgHora.length === 0) {
        aviso('warning', 'No se encontraron datos', 'Favor de cargar el excel de kg/hora primero.');
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
    if (!datosTaras || datosTaras.length === 0) {
        aviso('warning', 'No se encontraron datos', 'Favor de cargar el excel de taras primero.');
    } else {
        actualizartaras();
    }
});
