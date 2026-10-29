
const loader = document.getElementById('loaderDiv')

//El layout carga jQuery slim al final del body y reemplaza a window.jQuery,
//por eso guardamos aqui la version completa (con $.ajax) antes de que eso pase.
var $jq = window.jQuery;

let planta;
let turno;
let rowsTabla = [];
let tableScrapIngresosoMolino; //Tabla del historial de Ingresos

//interfaz de DataTables en espanol (misma que el resto del sistema)
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

//variables para el filtro (las dejamos inicializadas para el caso donde no aplica filtro)[No agregamos las horas, dejamos el estandar de asignar horas en el api]
let FechaActual = new Date();
let year = FechaActual.getFullYear();
let month = String(FechaActual.getMonth() + 1).padStart(2, '0');
let day = String(FechaActual.getDate()).padStart(2, '0');
let FechaInicioFiltro = `${year}-${month}-${day}`;
let FechaFinFiltro = `${year}-${month}-${day}`;

$(function () {

    //Configuramos la tabla donde dibujaremos los resultados
    tableScrapIngresosoMolino = $("#TablaIngresosScrap").DataTable({
        ordering: false,
        responsive: true,
        paging: false,
        searching: false,
        info: false,
        lengthChange: false,
        language: idiomaTabla,
        columnDefs: [
            { targets: 3, className: 'ing-cell-num' },
            { targets: 7, className: 'ing-cell-action', orderable: false }
        ],
        drawCallback: function () {
            actualizarContadorHistorial();
        }
    });

    //dejamos los contadores en cero hasta que lleguen los datos
    actualizarContadorHistorial();
    actualizarContadorPreview();

    //obtenemos la planta:
    localStorage.planta == '335' ? planta = '2' : planta = '1';
    //obtenemeos el turno
    turno = obtenerTurno();

    //Obtenemos los datos para la tabla de historial de ingresos [default sin filtro]
    ObtenerDatosScrapIngresos(planta, FechaInicioFiltro, FechaFinFiltro, turno);

    //Refresca el pill "N registros" del historial
    function actualizarContadorHistorial() {
        if (tableScrapIngresosoMolino) {
            $('#ingCount').text(tableScrapIngresosoMolino.rows().count());
        }
    }

    //Refresca el pill "N registros" de la previsualizacion del excel
    function actualizarContadorPreview() {
        $('#ingPreviewCount').text($('#tablaDatosIngresos tbody tr').length);
    }

    //Muestra el nombre del archivo elegido junto al boton
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

    //Abre un modal con Bootstrap 5 (el unico que expone bootstrap.Modal en el layout)
    function abrirModal(id) {
        var el = document.getElementById(id);
        if (!el) return;
        bootstrap.Modal.getOrCreateInstance(el, { backdrop: true, keyboard: true }).show();
    }

    //Cierra un modal por id
    function cerrarModal(id) {
        var el = document.getElementById(id);
        if (!el) return;
        var inst = bootstrap.Modal.getInstance(el);
        if (inst) inst.hide();
    }

    //Cierra cualquier modal abierto
    function cerrarModales() {
        document.querySelectorAll('.modal.show').forEach(function (el) {
            var inst = bootstrap.Modal.getInstance(el);
            if (inst) inst.hide();
        });
    }

    //Funcion para obtener los registros del historial de ingresos
    function ObtenerDatosScrapIngresos(planta, FechaInicioFiltro, FechaFinFiltro, turno) {        loader.style.display = "flex";

        //si no se selecciona ningun turno, asignamos el valor de 3 para pasarlo al api y tratarlo como "sin turno"
        if (turno != 1 && turno != 2) {
            turno = 3
        }

        //harmamos los datos que enviaremos al controler
        let data = {
            "Planta": planta,
            "FechaInicio": FechaInicioFiltro,
            "FechaFin": FechaFinFiltro,
            "Turno": turno
        }

        fetch("/Molinos/ObtenerDatosScrapIngresos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify(data)
        }).then((response) => {
            //Verificamos si entro al catch del controler interno, de lo contrario devolvemos la respuesta del api
            return response.ok ? response.json() : Promise.reject(response)
        })
            .then((jsonData) => {
                //// revisamos que los datos devueltos sean válidos
                //console.log(jsonData);
                let DataJson = JSON.parse(jsonData.data)
                let datosIngresosMolinos = DataJson.datosMolinosIngresos

                for (x = 0; x < datosIngresosMolinos.length; x++) {

                    // Creamos el ícono/botón para editar/eliminar el registro
                    let IconEdit = `<button type="button" class="ing-row-btn IconEdit" title="Editar registro"
                    data-id-ingreso="${datosIngresosMolinos[x].id}"
                    data-codigo-ingreso="${datosIngresosMolinos[x].codigo}"
                    data-tipo-ingreso="${datosIngresosMolinos[x].tipo}"
                    data-familia-ingreso="${datosIngresosMolinos[x].familia}"
                    data-peso-ingreso="${datosIngresosMolinos[x].peso}"
                    data-origen-ingreso="${datosIngresosMolinos[x].origen}"><i class="fa fa-pencil" aria-hidden="true"></i></button>`;

                    //cambiamos ala fecha al formato correcto
                    var fechaFormato = datosIngresosMolinos[x].fechaRegistro.replace('T', '    ').slice(0, 19) + 'Hrs';

                    rowsTabla.push([
                        datosIngresosMolinos[x].codigo,
                        datosIngresosMolinos[x].tipo,
                        datosIngresosMolinos[x].familia,
                        datosIngresosMolinos[x].peso,
                        fechaFormato,
                        datosIngresosMolinos[x].origen,
                        //la API no siempre devuelve "planta"; usamos la de la sesion como respaldo
                        datosIngresosMolinos[x].planta != null ? datosIngresosMolinos[x].planta : planta,
                        IconEdit
                    ])

                }
                //Llenamos la tabla con los datos obtenidos y la mostramos
                tableScrapIngresosoMolino.rows.add(rowsTabla).draw()

                //limpiamos los rows para dejarlos listos para las siguientes consultas
                rowsTabla = [];

                //refrescamos el pill de registros
                actualizarContadorHistorial();

                //Si no existen registros mostramos el mensaje
                if (datosIngresosMolinos.length == 0) {
                    iziToast.info({
                        position: "topRight",
                        title: `NO SE ENCONTRARON DATOS`,
                        message: `<p>No existen registros con los filtros seleccionados</p>`,
                    });
                }

                loader.style.display = "none";
            })
            .catch((error) => {
                console.error("Error en la solicitud:", error);
                iziToast.error({
                    position: "topRight",
                    title: `NO SE ENCONTRARON DATOS`,
                    message: `<p>Motivo: ${error}</p>`,
                });
                loader.style.display = "none";
            });
    };

    //Funcion para agregar/borrar/actualizar los registros del historial de ingresos
    function AccionesRegistroIngresos(accion, id, planta, codigo, tipo, familia, fecha, peso, origen) {

        loader.style.display = "flex";

        //Algunos parametros pueden llevar caracteres especiales, asi que los codificamos (para que pueda viajar por http al servidor)
        let codigoCodificado = codigo ? encodeURIComponent(codigo.trim()) : "";
        let tipoCodificado = tipo ? encodeURIComponent(tipo.trim()) : "";
        let familiaCodificado = familia ? encodeURIComponent(familia.trim()) : "";
        let origenCodificado = origen ? encodeURIComponent(origen.trim()) : "";

        //como usamos la misma funcion para agregar, borrar y actualizar, no siempre lleva los mismos parametros, llenamos los que pueden venir vacios con cualquier dato valiod en el procedure
        id = id || 0;
        codigoCodificado = codigoCodificado || "any";
        tipoCodificado = tipoCodificado || "any";
        familiaCodificado = familiaCodificado || "any";
        fecha = fecha || "2025-01-14 09:50:00.000";
        peso = peso || 0;
        origenCodificado = origenCodificado || "any";

        //armamos los datos que enviaremos al controler
        let data = {
            "Accion": accion, //indicamos al procedure la accion a realizar: 1 Agregar, 2 Borrar, 3 Modificar/Actualizar
            "Id": id,
            "Planta": planta,
            "Codigo": codigoCodificado,
            "Tipo": tipoCodificado,
            "Familia": familiaCodificado,
            "Fecha": fecha,
            "Peso": peso,
            "Origen": origenCodificado
        }

        fetch("/Molinos/CRUDRegistroIngresos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify(data)
        })
            .then((response) => {
                //Verificamos si entro al catch del controler interno, de lo contrario devolvemos la respuesta del api
                return response.ok ? response.json() : Promise.reject(response)
            })
            .then((jsonData) => {
                //Si la respuesta desde el api es ok
                //console.log(jsonData.status)
                if (jsonData.status == 200) {

                    loader.style.display = "none";

                    iziToast.success({
                        position: "topRight",
                        title: `COMPLETADO CORRECTAMENTE`,
                        message: `<p>Movimiento realizado correctamente</p>`,
                    });

                    LimpiarForm(); // Limpiar los formularios
                    RecargarTabla(); //recargamos la tabla para actualizarla visualmente con los nuevos datos
                } else {
                    console.log("Error desde el api, no se establecio la comunicacion o devolvio un error, FUNCION: AccionesRegistroIngresos motivo: ", jsonData.data)
                    iziToast.error({
                        position: "topRight",
                        title: `NO SE ACTUALIZO EL MOLINO`,
                        message: `<p>Motivo: ${jsonData.data}</p>`,
                    });
                    loader.style.display = "none";
                }

            })
            //capturamos el error que retorno el controler
            .catch((error) => {
                console.error("Error en el controler interno: CRUDRegistroIngresos", error);
                iziToast.error({
                    position: "topRight",
                    title: `NO SE ACTUALIZO EL MOLINO`,
                    message: `<p>Motivo: ${error}</p>`,
                });
                loader.style.display = "none";
            });
    }

    //cargar el excel de ingresos de scrap a la tabla "tablaDatosIngresos"
    function cargarexcelIngresos() {
        const file = $('#archivoexcel')[0].files[0];

        // Corroboramos que se haya cargado el excel
        if (!file) {
            iziToast.info({
                position: "topRight",
                title: `ARCHIVO EXCEL NO SELECCIONADO`,
                message: `<p>Por favor, selecciona un archivo Excel.</p>`,
            });
            loader.style.display = 'none'
            return;
        }

        // Obtenemos el excel para enviarlo a procesar
        const formData = new FormData();
        formData.append("archivoExcel", file);

        $jq.ajax({
            url: '/Molinos/ProcesarExcel',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function (data) {
                // Verificar si el servidor devolvió un mensaje de error
                if (data && data.message) {
                    // Si hay un mensaje de error (por ejemplo, fecha inválida)
                    iziToast.error({
                        position: "topRight",
                        title: "ERROR AL PROCESAR EXCEL",
                        message: data.message, // Mensaje que retorna el servidor
                    });
                    loader.style.display = 'none';
                    return;
                }

                // Definimos los Encabezados (El formato que debe tener el archivo)
                const encabezadosEsperados = [
                    "Código",
                    "Tipo",
                    "Familia",
                    "Peso",
                    "Fecha de registro",
                    "Origen",
                    "Planta"
                ];

                // Validar encabezados del archivo
                const headers = Object.keys(data[0]);
                const encabezadosValidos = JSON.stringify(headers) === JSON.stringify(encabezadosEsperados);

                if (!encabezadosValidos) {
                    iziToast.error({
                        position: "topRight",
                        title: "ARCHIVO EXCEL INVALIDO",
                        message: `
                     <p>El formato del Excel es incorrecto.<br>
                        El formato esperado es: <b>${encabezadosEsperados.map(h => `"${h}"`).join(", ")}</b><br>
                        El formato recibido es: <b>${headers.map(h => `"${h || 'VACÍO'}"`).join(", ")}</b></p>
                    `,
                    });
                    loader.style.display = 'none';
                    return;
                }

                // Si los encabezados son válidos, seguimos el proceso
                // Limpiamos la tabla de cualquier registro pasado
                $('#tablaDatosIngresos thead').empty();
                $('#tablaDatosIngresos tbody').empty();

                // Generar encabezados en la tabla
                let headerRow = '<tr>';
                encabezadosEsperados.forEach(header => {
                    headerRow += `<th>${header}</th>`;
                });
                headerRow += '</tr>';
                $('#tablaDatosIngresos thead').append(headerRow);

                // Generar las filas dinámicamente
                data.forEach(row => {
                    let rowHtml = '<tr>';
                    encabezadosEsperados.forEach(header => {
                        rowHtml += `<td>${row[header]}</td>`;
                    });
                    rowHtml += '</tr>';
                    $('#tablaDatosIngresos tbody').append(rowHtml);
                });
                loader.style.display = 'none';
                // Limpiamos el input del archivo
                $("#archivoexcel").val("");
                pintarNombreArchivo('archivoexcel', 'archivoexcelName');
                actualizarContadorPreview();
            },
            error: function (xhr) {
                console.error("Error:", xhr.responseText);
                iziToast.error({
                    position: "topRight",
                    title: "ERROR",
                    message: "<p>Ocurrió un error al procesar el archivo Excel.</p>",
                });
                loader.style.display = 'none';
            }
        });
    }

    //Funcion para extraer los datos de la tabla "tablaDatosIngresos" (la llenada con los datos de excel) y gardarlos en la BD
    function guardarDatosEnSql() {
        const filas = $('#tablaDatosIngresos tbody tr');
        const datos = [];

        filas.each(function () {
            const fila = $(this);
            const datosFila = {
                Codigo: fila.find('td').eq(0).text(),
                Tipo: fila.find('td').eq(1).text(),
                Familia: fila.find('td').eq(2).text(),
                Peso: fila.find('td').eq(3).text(),
                FechaRegistro: fila.find('td').eq(4).text(),
                Origen: fila.find('td').eq(5).text(),
                Planta: fila.find('td').eq(6).text()
            };
            datos.push(datosFila);
        });

        // Crear FormData para enviar los datos
        const formData = new FormData();
        formData.append("datos", JSON.stringify(datos)); // Convertimos los datos a JSON

        $jq.ajax({
            url: '/Molinos/GuardarDatosExcelIngresosEnBD', // Controlador intermedio
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                //si el proceso se cumplecorrectamente, mostramos el mensaje
                if (response.status === 200) {
                    iziToast.success({
                        position: "topRight",
                        title: "ÉXITO",
                        message: "Datos guardados correctamente en la base de datos.",
                    });
                    //limpiamos la tabla para dejarla preparada en caso de cargar otro archivo
                    $('#tablaDatosIngresos tbody').empty();
                    actualizarContadorPreview();
                    //Recargamos la tabla para mostrar los datos cargado
                    RecargarTabla();
                } else {
                    iziToast.error({
                        position: "topRight",
                        title: "ERROR",
                        message: `Ocurrió un error al guardar los datos: ${response.message}`,
                    });
                }
            },
            error: function (xhr, status, error) {
                console.error("Error:", error);
                iziToast.error({
                    position: "topRight",
                    title: "ERROR",
                    message: "Ocurrió un error al guardar los datos.",
                });
            }
        });
    }


    //FUNCIONES AUXILIARES
    function obtenerTurno() {
        var horaInicio = new Date();
        horaInicio.setHours(5, 45, 1);
        var horaFin = new Date();
        horaFin.setHours(17, 45, 0);

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
    function EvitarLetras(e) {
        var charCode = e.which ? e.which : e.keyCode;
        if (charCode < 48 || charCode > 57) {
            e.preventDefault();
        }
    }
    function LimpiarForm() {
        //modal agregar registro historial ingresos
        $("#inputCodigoIngresoScrapRegister").val("");
        $("#inputTipoIngresoScrapRegister").val("");
        $("#inputFamiliaIngresoScrapRegister").val("");
        $("#inputFechaIngresoScrapRegister").val("");
        $("#inputPesoIngresoScrapRegister").val("");
        $("#inputOrigenIngresoScrapRegister").val("");

        //Modal Edit
        $("#inputCodigoIngresoScrapRegisterEdit").val("");
        $("#inputTipoIngresoScrapRegisterEdit").val("");
        $("#inputFamiliaIngresoScrapRegisterEdit").val("");
        $("#inputOrigenIngresoScrapRegisterEdit").val("");
        $("#inputPesoIngresoScrapRegisterEdit").val("");
    };
    function RecargarTabla() {

        //Limpiamos la tabla para asegurarnos de que no tenga registros pasados
        tableScrapIngresosoMolino.clear().draw()
        actualizarContadorHistorial();
        cerrarModales(); //cerramos cualquier modal abierto
        //Obtenemos las fechas seleccionadas por el usuario (o las default si no ha seleccionado)
        let fechaRecargaInicio = $('#FechaInicioScrapIngreso').val();
        let fechaRecargaFin = $('#FechafinScrapIngreso').val();
        let turnoRecarga = $('#InputturnoScrapIngreosMolinos').val();

        ObtenerDatosScrapIngresos(planta, fechaRecargaInicio, fechaRecargaFin, turnoRecarga);
    }

    function generarpdf(TituloDocumentPrincipal, TituloDocument, rowsPDF, headers, NombreDescarga) {
        loader.style.display = 'flex';

        //establecemos los colores a usar
        let rgb1 = [165, 165, 165];
        let rgb2 = [165, 165, 165];
        let rgb3 = [165, 165, 165];

        window.jsPDF = window.jspdf.jsPDF;
        var doc = new jsPDF({
            format: 'letter',
            orientation: 'landscape',
            compress: true,
            objcompress: true
        });

        doc.setFont("times");
        // Agregar imagen
        var img = new Image();
        img.src = '../../Images/LogoPTMHDBN.png';
        img.onload = async function () {
            var imgWidth = this.width;
            var imgHeight = this.height;

            // Obtener el tamaño de la página y establecer los márgenes
            var pageSize = doc.internal.pageSize;
            var pageWidth = pageSize.width;
            var marginLeft = 10;
            var marginRight = 10;
            var usableWidth = pageWidth - marginLeft - marginRight;

            // Calcular el ancho y la altura de la imagen
            var imageWidth = usableWidth * 0.25;
            var aspectRatio = imgHeight / imgWidth;
            var imageHeight = imageWidth * aspectRatio;

            // Calcular la posición para la imagen
            var imageX = marginLeft;
            var imageY = 10;

            // Dibujar la imagen
            doc.addImage(img, 'PNG', (usableWidth / 2) - imageWidth - 5, imageY, imageWidth, imageHeight);
            doc.setFont(undefined, 'bold');
            doc.setFontSize(16);
            var text = TituloDocumentPrincipal;
            doc.text(text, (usableWidth / 2) + 55, 18, { align: 'center', });
            doc.setFont(undefined, 'normal');
            doc.setFontSize(14);
            var text = "Generado por: " + document.getElementById("labelName").innerHTML;;
            doc.text(text, (usableWidth / 2) + 55, 23, { align: 'center', });

            // Crea un objeto Date para la fecha y hora actual
            var fechaHoraActual = new Date();

            // Obtiene el año actual
            var año = fechaHoraActual.getFullYear();

            // Obtiene el mes actual (los meses van de 0 a 11)
            var mes = fechaHoraActual.getMonth() + 1;

            // Obtiene el día actual
            var dia = fechaHoraActual.getDate();

            // Obtiene las horas actuales
            var horas = fechaHoraActual.getHours();

            // Obtiene los minutos actuales
            var minutos = fechaHoraActual.getMinutes();

            // Obtiene los segundos actuales
            var segundos = fechaHoraActual.getSeconds();

            // Crea una cadena con la fecha y hora actual
            var fechaHoraActualStr = dia + "/" + mes + "/" + año + " " + horas + ":" + minutos.toString().padStart(2, '0');

            doc.setFontSize(12);
            var text = "Fecha: " + fechaHoraActualStr;
            doc.text(text, (usableWidth / 2) + 55, 29, { align: 'center', });


            var rectWidth = doc.internal.pageSize.getWidth() - 20; // Ancho del rectángulo
            var rectHeight = 7; // Altura del rectángulo
            // Dibuja el rectángulo negro

            // Establece el color de fondo
            doc.setFillColor(rgb2[0], rgb2[1], rgb2[2]);

            // Dibuja un rectángulo negro en el centro de la página
            var rectWidth = doc.internal.pageSize.getWidth() - 20; // Ancho del rectángulo
            var rectHeight = 10; // Altura del rectángulo
            var rectX = (10); // Coordenada X del rectángulo
            var rectY = (40); // Coordenada Y del rectángulo
            doc.rect(rectX, rectY, rectWidth, rectHeight, 'F');

            // Establece el color de texto en blanco
            doc.setTextColor(255, 255, 255);

            // Agrega texto blanco en el centro del rectángulo
            var text = TituloDocument;
            var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize(); // Ancho del texto
            var textY = 46; // Coordenada Y del texto
            doc.text(text, doc.internal.pageSize.getWidth() / 2, textY, { align: 'center' });


            // Define la posición de la tabla
            var startX = 10;
            var startY = 53;

            doc.autoTable({
                head: [headers],
                body: rowsPDF,
                // Establecer el color de fondo del encabezado
                headStyles: {
                    fillColor: [rgb1[0], rgb1[1], rgb1[2]]
                },
                startY: startY,
                startX: startX,
                styles: {
                    lineWidth: 0.5,
                    lineColor: [255, 255, 255],
                    halign: 'center'
                },
                columns: headers.map(() => ({ align: 'center' }))
            });

            startY = doc.autoTable.previous.finalY + 10;

            doc.save(NombreDescarga);
            loader.style.display = 'none';

        };
    }

    //ACTIONS
    //Btn Cargar datos (Carga los datos del excel a la tabla de ingresos)
    $(document).on("click", "#cargaDatosExcelIngresos", function () {
        cargarexcelIngresos()
    });

    //Btn Search (en la tabla de historial de ingresos)
    $(document).on("click", "#SearchScrapIngreso", function () {
        //obtenemos los datos a enviar
        let FechaInicioSearch = $('#FechaInicioScrapIngreso').val()
        let FechaFinSearch = $('#FechafinScrapIngreso').val()
        turno = $('#InputturnoScrapIngreosMolinos').val();

        //validamos que los campos no esten vacios
        if (!FechaInicioSearch) {
            iziToast.error({
                position: "topRight",
                title: `CAMPOS VACIOS`,
                message: `<p>Seleccione la fecha de inicio</p>`,
            });
            return;
        }

        //Limpiamos la tabla y los datos de las lineas
        tableScrapIngresosoMolino.clear().draw()
        rowsTabla = [];

        //si el turno es 1 o 2, asignamos la fechafin correspondiente, si no hay turno, nos aseguramos de que se seleccionen ambas fechas
        if (turno == "1" || turno == "2") {
            FechaFinSearch = FechaInicioSearch
        } else {
            if (!FechaFinSearch) {
                iziToast.error({
                    position: "topRight",
                    title: `CAMPOS VACIOS`,
                    message: `<p>Seleccione la fecha de inicio y fecha fin</p>`,
                });
                return
            }
        }
        //Es la misma funcion para buscar y en default
        ObtenerDatosScrapIngresos(planta, FechaInicioSearch, FechaFinSearch, turno)
    });

    //Btn Agregar (Ingreso de Scrap, Mostrar Modal)
    $(document).on("click", "#AddScrapRegister", function () {
        //asignamos la fecha actual en el inputFecha del modal (para el caso donde el usuario no asigne una fecha diferente)
        $("#inputFechaIngresoScrapRegister").val(FechaInicioFiltro);
        abrirModal('AddIgresoScrapModal');
    });

    //Btn Agregar (Dentro del Modal "AddIgresoScrapModal", agrega el registro en la BD)
    $(document).on("click", "#btnAddRegisterIngresoScrapFinish", function () {
        //Obtener Datos a enviar
        let accion = 1; //indicamos al procedure que vamos a agregar un registro
        let IdSend = "";
        let PlantaSend = planta;
        let CodigoSend = $("#inputCodigoIngresoScrapRegister").val();
        let TipoSend = $("#inputTipoIngresoScrapRegister").val();
        let FamiliaSend = $("#inputFamiliaIngresoScrapRegister").val();
        let FechaSend = $("#inputFechaIngresoScrapRegister").val();
        let PesoSend = $("#inputPesoIngresoScrapRegister").val();
        let OrigenSend = $("#inputOrigenIngresoScrapRegister").val();

        // Obtenemos la hora actual para añadirla a la fecha
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        // Construimos la cadena de tiempo
        const time = `${hours}:${minutes}:${seconds}.000`;

        // Concatenamos la fecha con la hora
        FechaSend = `${FechaSend} ${time}`;

        //Revisamos que no haya campos vacios
        if (CodigoSend == "" || TipoSend == "" || FamiliaSend == "" || FechaSend == "" || PesoSend == "" || OrigenSend == "") {
            iziToast.error({
                position: "topRight",
                title: "CAMPOS VACIOS",
                message: "<p>Favor de llenar todos los campos.</p>",
            });
        } else {
            //Enviamos los datos
            AccionesRegistroIngresos(accion, IdSend, PlantaSend, CodigoSend, TipoSend, FamiliaSend, FechaSend, PesoSend, OrigenSend);
        }
    });
    //Btn Editar (abrimos el modal de edicion)
    $(document).on("click", ".IconEdit", function () {
        // Obtener los valores de los atributos
        let IdEditAtr = $(this).data("id-ingreso");
        let CodigoEditAtr = $(this).data("codigo-ingreso");
        let TipoEditAtr = $(this).data("tipo-ingreso");
        let FamiliaoEditAtr = $(this).data("familia-ingreso");
        let PesoEditAtr = $(this).data("peso-ingreso");
        let OrigenEditAtr = $(this).data("origen-ingreso");

        // Agregar los valores a los input del modal antes de mostrarlo            
        $("#inputCodigoIngresoScrapRegisterEdit").val(CodigoEditAtr);
        $("#inputTipoIngresoScrapRegisterEdit").val(TipoEditAtr);
        $("#inputFamiliaIngresoScrapRegisterEdit").val(FamiliaoEditAtr);
        $("#inputPesoIngresoScrapRegisterEdit").val(PesoEditAtr);
        $("#inputOrigenIngresoScrapRegisterEdit").val(OrigenEditAtr);

        $("#EditIgresoScrapModal").attr("idsqleditIngresos", IdEditAtr); //asignamos el id como atributo al modal (para ubicar el id al momento de actualizar/borrar)

        // Mostrar el modal "Editar Ingreso de Scrap"
        abrirModal('EditIgresoScrapModal');
    });
    //Btn Eliminar "registro"
    $(document).on("click", "#btnRemoveScrapRegister", function () {
        // Obtener los valores de los atributos a enviar
        let AccionSend = 2;
        let IdSend = $("#EditIgresoScrapModal").attr("idsqleditIngresos");
        let PlantaSend = planta;
        let codigoSend = "";
        let tipoSend = "";
        let familiaSend = "";
        let fechaSend = "";
        let pesoSend = "";
        let origenSend = "";

        // ocultamos el modal "Editar Ingreso de Scrap"
        cerrarModal('EditIgresoScrapModal');

        //borramos el registro
        AccionesRegistroIngresos(AccionSend, IdSend, PlantaSend, codigoSend, tipoSend, familiaSend, fechaSend, pesoSend, origenSend)
    });
    //Btn Actualizar (dentro del modal de edicion)
    $(document).on("click", "#btnupdateRegisterIngresoScrap", function () {
        // Obtener los valores de los atributos a enviar
        let AccionSend = 3;
        let IdSend = $("#EditIgresoScrapModal").attr("idsqleditIngresos");
        let PlantaSend = planta;
        let codigoSend = $("#inputCodigoIngresoScrapRegisterEdit").val();
        let tipoSend = $("#inputTipoIngresoScrapRegisterEdit").val();
        let familiaSend = $("#inputFamiliaIngresoScrapRegisterEdit").val();
        let fechaSend = "";
        let pesoSend = $("#inputPesoIngresoScrapRegisterEdit").val();
        let origenSend = $("#inputOrigenIngresoScrapRegisterEdit").val();

        // ocultamos el modal "Editar Ingreso de Scrap"
        cerrarModal('EditIgresoScrapModal');

        //actualizamos el registro
        AccionesRegistroIngresos(AccionSend, IdSend, PlantaSend, codigoSend, tipoSend, familiaSend, fechaSend, pesoSend, origenSend)
    });
    //Btn Confirmar Ingresos (ingresa los datos de la tabla originarios del excel a la bd)
    $(document).on("click", "#BtnIngresarDatosExcel", function () {
        // Verificar si la tabla tiene datos
        if ($('#tablaDatosIngresos tbody tr').length === 0) {
            iziToast.info({
                position: "topRight",
                title: "EXCEL NO CARGADO",
                message: "Cargue los datos de un excel antes de continuar.",
            });
        } else {
            // Guardamos los datos extraídos del excel en la BD
            guardarDatosEnSql();
        }
    });
    //Btn Descargar PDF (Historial de ingresos)
    $(document).on("click", "#DescargarPDFHistorialIngresos", function () {
        //Datos a enviar
        let TituloDocumentPrincipal = "REPORTE DE INGRESOS "
        let TituloDocument = 'REPORTE DE INGRESOS'
        let rowsPDF = tableScrapIngresosoMolino.rows().data().toArray().map(row => {
            return row.slice(0, -1); // Excluimos la última columna "Editar"
        });
        const headers = []; //los obtenemos desde la tabla del html
        let NombreDescarga = "Reporte ingresos.pdf"
        //obtenemos los headers (menos el ultimo, "Editar")
        $("#TablaIngresosScrap thead th").each(function (index) {
            if (index < $("#TablaIngresosScrap thead th").length - 1) {
                headers.push($(this).text().trim());
            }
        });

        generarpdf(TituloDocumentPrincipal, TituloDocument, rowsPDF, headers, NombreDescarga)
    });
    //Btn Descargar EXCEL (Historial de ingresos)
    $(document).on("click", "#DescargarExcelHistorialIngresos", function () {
        // Obtener los encabezados y determinar la última columna a omitir (Editar)
        const headers = [];
        $("#TablaIngresosScrap thead th").each(function (i) {
            if (i < $("#TablaIngresosScrap thead th").length - 1) {
                headers.push($(this).text().trim());
            }
        });

        // Obtener los datos de la tabla
        const originalData = tableScrapIngresosoMolino.rows().data().toArray();

        // Filtrar la última columna en los datos
        const filteredData = originalData.map(row => {
            return row.slice(0, -1); // Excluir la última columna (Editar)
        });

        // Enviar datos al backend
        fetch('/Molinos/GenerarExcel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                headers: headers,    // Encabezados filtrados
                data: filteredData   // Datos filtrados sin la última columna
            })
        })
            .then(response => {
                if (!response.ok) throw new Error("Error al generar el archivo Excel");
                return response.blob();
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'ReporteIngresosScrap.xlsx';
                document.body.appendChild(a);
                a.click();
                a.remove();
            })
            .catch(error => console.error('Error:', error));

    });

    //RESTRICIONES
    // Asignamos el valor de la fecha actual al input de fecha inicio para que se inicialice con este valor
    var today = new Date().toISOString().split('T')[0];
    $('#FechaInicioScrapIngreso').val(today);
    $('#FechafinScrapIngreso').val(today);

    //mostramos el nombre del archivo elegido junto al boton
    $(document).on('change', '#archivoexcel', function () {
        pintarNombreArchivo('archivoexcel', 'archivoexcelName');
    });

    //revisamos si el turno es 1 o 2 para desactivar "FechaFin" y asignarle el valor default (el dia de hoy)
    $("#InputturnoScrapIngreosMolinos").change(function () {
        if ($("#InputturnoScrapIngreosMolinos").val() == '1' || $("#InputturnoScrapIngreosMolinos").val() == '2') {
            $("#FechafinScrapIngreso").prop("disabled", true).val("");
        } else {
            $("#FechafinScrapIngreso").prop("disabled", false).val(FechaFinFiltro);
        }
    });

    //restringimos los input que solo llevan numero
    $('#inputPesoIngresoScrapRegister, #inputPesoIngresoScrapRegisterEdit').on('keypress', function (e) {
            // Permitir solo números
            EvitarLetras(e)
    });

    //Botones de cerrar/cancelar de estos modales (data-dismiss depende del Bootstrap 4,
    //que no controla los modales abiertos con Bootstrap 5)
    $(document).on("click", '#AddIgresoScrapModal [data-dismiss="modal"], #EditIgresoScrapModal [data-dismiss="modal"]', function (event) {
        event.preventDefault();
        var $modal = $(this).closest(".modal");
        if ($modal.length) cerrarModal($modal.attr("id"));
    });

    //si hacemos click fuera de los modals (en el fondo), los cerramos
    $(document).on("click", function (event) {
        if (event.target && event.target.classList && event.target.classList.contains("modal")) {
            cerrarModal(event.target.id);
        }
    });

    //al cerrar cualquier modal liberamos el scroll y limpiamos los formularios
    $(document).on("hidden.bs.modal", ".modal", function () {
        LimpiarForm();
        if (!$(".modal.show").length) {
            $(".modal-backdrop").remove();
            $("body").removeClass("modal-open").css({ overflow: "", paddingRight: "" });
        }
    });
});