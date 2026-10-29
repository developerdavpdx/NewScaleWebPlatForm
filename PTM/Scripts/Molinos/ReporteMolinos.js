
const loader = document.getElementById('loaderDiv')
let planta;
let turno;
let rowsTablaConcentrado = [];
let tableReporteMolinoConcentrado;
let rowsTablaHistori = [];
let tableReporteMolinoistori;

//variables para el filtro (las dejamos inicializadas para el caso donde no aplica filtro)[No agregamos las horas, dejamos el estandar de asignar horas en el api]
let FechaActual = new Date();
let year = FechaActual.getFullYear();
let month = String(FechaActual.getMonth() + 1).padStart(2, '0');
let day = String(FechaActual.getDate()).padStart(2, '0');
let FechaInicioFiltro = `${year}-${month}-${day}`;
let FechaFinFiltro = `${year}-${month}-${day}`;
let Histori; //usaremos el mismo procedure para filtrar los historiales y el concentrado, con esta variable indicamos si sera el historial o el concenctrado

$(function () {

    //Configuramos las tabla donde dibujaremos los resultados
    ConfigureTables();

    //obtenemos la planta:
    localStorage.planta == '335' ? planta = '2' : planta = '1';
    //obtenemeos el turno
    turno = obtenerTurno();

    //Obtenemos los datos para la tabla de Reportes CONCENTRADO (Molinos) [default sin filtro]
    Histori = 0;//indicamos que estamos consultando la tabla de concentrado
    ObtenerDatosReporteMolinos(planta, FechaInicioFiltro, FechaFinFiltro, turno, Histori);
    //Obtenemos los datos para la tabla de Reportes HISTORIAL (Molinos) [default sin filtro]
    Histori = 1;//indicamos que estamos consultando la tabla de Historial
    ObtenerDatosReporteMolinos(planta, FechaInicioFiltro, FechaFinFiltro, turno, Histori);

    //inicializamos los input de "Turno" con el turno actual, para cuando el usuario haga ediciones, las tablas se recarguen con el turno correspondiente
    $("#InputturnoMolinosConcentrado").val(turno);
    $("#InputturnoMolinosHistori").val(turno);

    //variables donde almacenamos los input de los filtros de busqueda, serviran para recargar la tabla sin recargar la pagina (dejamos inicializadas las variables por si el usuario no da click en el boton de buscar, de lo contrario las variables no tienen ningun value y da error)
    //concentrado
    let FechaInicioSearchConcentrado = FechaInicioFiltro;
    let FechaFinSearchConcentrado = FechaInicioFiltro;
    let turnoConcentrado = $('#InputturnoMolinosConcentrado').val();
    //histori
    let FechaInicioSearchHistori = FechaInicioFiltro;
    let FechaFinSearchHistori = FechaInicioFiltro;
    let turnSearchHistori = $('#InputturnoMolinosHistori').val();

    function ObtenerDatosReporteMolinos(planta, FechaInicioFiltro, FechaFinFiltro, turno, Histori) {
        loader.style.display = "flex";

        //si no se selecciona ningun turno, asignamos el valor de 4 para pasarlo al api y tratarlo como "sin turno"
        if (turno != 1 && turno != 2 && turno != 3) {
            turno = 4
        }

        //armamos los datos que enviaremos al controler
        let data = {
            "Planta": planta,
            "FechaInicio": FechaInicioFiltro,
            "FechaFin": FechaFinFiltro,
            "Turno": turno,
            "Histori": Histori
        }

        fetch("/Molinos/ObtenerDatosReporteMolinos", {
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
                // revisamos que los datos devueltos sean válidos
                //console.log(jsonData);
                let DataJson = JSON.parse(jsonData.data)
                datosReporteMolinos = DataJson.datosMolinosReporte

                //Dibujamos la tabla de Concentrado
                if (Histori == 0) {
                    
                    for (x = 0; x < datosReporteMolinos.length; x++) {

                        //Calculamos las horas programadas menos las horas de paro
                        var HorasReales = datosReporteMolinos[x].horasProgramadas - datosReporteMolinos[x].horasParo;

                        rowsTablaConcentrado.push([
                            datosReporteMolinos[x].molino,
                            datosReporteMolinos[x].nombreMolino,
                            datosReporteMolinos[x].objetivoDeProduccion,
                            datosReporteMolinos[x].codigo,
                            datosReporteMolinos[x].descripcion,
                            datosReporteMolinos[x].pesoTotal,
                            datosReporteMolinos[x].horasProgramadas,
                            datosReporteMolinos[x].horasParo,
                            HorasReales,
                        ])
                    }
                    tableReporteMolinoConcentrado.rows.add(rowsTablaConcentrado).draw();
                    //asignamos un color diferente a la columna de objetivo de produccion (agregamos la clase, en ccs cambiamos el color)
                    let ColumnObjetivoConcentrado = tableReporteMolinoConcentrado.columns(2).nodes();
                    for (x = 0; x < ColumnObjetivoConcentrado['0'].length; x++) {
                        ColumnObjetivoConcentrado['0'][x].classList.add('ColumnDifTableConcentrado')
                    }
                    //limpiamos los rows para que esten listos para la siguiente consulta
                    rowsTablaConcentrado = [];

                    //Si no existen registros mostramos el mensaje
                    if (datosReporteMolinos.length == 0) {
                        iziToast.info({
                            position: "topRight",
                            title: `NO SE ENCONTRARON DATOS DE TABLA PRINCIPAL`,
                            message: `<p>No existen registros con los filtros seleccionados</p>`,
                        });
                    }
                }

                //Dibujamos la tabla de Historial
                if (Histori == 1) {
                    for (x = 0; x < datosReporteMolinos.length; x++) {
                        //console.log(datosReporteMolinos[x].motivosParo)

                        //Creamos los iconos, pero dependiendo de si la fila esta desactivada, los creamos sin la clases "IconComent" y "Icontrash" para no poder activarlos cuando la fila este desactivada
                        let IconComentarios;
                        let IconDelete;
                        if (datosReporteMolinos[x].registroActivo == 0) {
                            //si la fila esta desactivada creamos el boton de comentarios con la clase IconComentDesactivado, para abrir un modal diferente (el de comentarios del porque se desactivo el registro)
                            // Creamos el ícono/botón de comentarios con el comentario del porque se desactivo
                            IconComentarios = `<i class="bi bi-chat-text-fill IconComentDesactivado"
                            folioValueDelete = "${datosReporteMolinos[x].folio}"
                            comentarioEdicionFilaDesactivada = "${datosReporteMolinos[x].comentariosEdiciones}"></i>`;

                            //creamos el icono/boton "trash" simple para incertarlo
                            IconDelete = `<i class="bi bi-trash"></i>`;
                        } else {
                            //si la fila no esta desactivada
                            // Creamos el ícono/botón  con los comentarios y valores de cada registro (lo usaremos abrir el modal de coment)
                            IconComentarios = `<i class="bi bi-chat-text-fill IconComent" folioValue = "${datosReporteMolinos[x].folio}"
                            motivosParoProduccion = "${datosReporteMolinos[x].motivosParo}"
                            comentarioEdicion = "${datosReporteMolinos[x].comentariosEdiciones}"
                            comentariosProduccion = "${datosReporteMolinos[x].comentariosParo}"
                            PesoProduccion = "${datosReporteMolinos[x].pesoTotal}"
                            horasPAroRegistro = "${datosReporteMolinos[x].horasParo}"></i>`;

                            //creamos el icono/boton "trash" para borrar los registros
                            IconDelete = `<i class="bi bi-trash Icontrash" folioTrash = "${datosReporteMolinos[x].folio}"></i>`;

                        }

                        //cambiamos la fecha al formato correcto
                        var fechaFormato = datosReporteMolinos[x].fechaPesaje.replace('T', '    ').slice(0, 19) + 'Hrs';

                        rowsTablaHistori.push([
                            datosReporteMolinos[x].molino,
                            datosReporteMolinos[x].nombreMolino,
                            fechaFormato,
                            datosReporteMolinos[x].operador,
                            datosReporteMolinos[x].objetivoDeProduccion,
                            datosReporteMolinos[x].codigo,
                            datosReporteMolinos[x].descripcion,
                            datosReporteMolinos[x].pesoTotal,
                            datosReporteMolinos[x].horasProgramadas,
                            datosReporteMolinos[x].horasParo,
                            IconComentarios,
                            datosReporteMolinos[x].folio,
                            IconDelete,
                            //datosReporteMolinos[x].material,
                        ])

                    }

                    tableReporteMolinoistori.rows.add(rowsTablaHistori).draw();

                    //asignamos un color diferente a la columna de objetivo de produccion (agregamos la clase, en ccs cambiamos el color)
                    let ColumnObjetivoHistori = tableReporteMolinoistori.columns(4).nodes();
                    // Iterar sobre las celdas para saber si la fila tine la clase filaDesactivada
                    for (let x = 0; x < ColumnObjetivoHistori[0].length; x++) {
                        // Obtener la fila padre de la celda actual
                        let fila = ColumnObjetivoHistori[0][x].parentNode;

                        // Verificar si la fila no tiene la clase 'filaDesactivada'
                        if (!fila.classList.contains('filaDesactivada')) {
                            // Agregar la clase a la celda si la fila no está desactivada
                            ColumnObjetivoHistori[0][x].classList.add('ColumnDifTableConcentrado');
                        }
                    }

                    //limpiamos los rows para que esten listos para la siguiente consulta
                    rowsTablaHistori = [];

                    //Si no existen registros mostramos el mensaje
                    if (datosReporteMolinos.length == 0) {
                        iziToast.info({
                            position: "topRight",
                            title: `NO SE ENCONTRARON DATOS DE HISTORIAL`,
                            message: `<p>No existen registros con los filtros seleccionados</p>`,
                        });
                    }
                }

                loader.style.display = "none";
            })
            .catch((error) => {
                console.error("Error en la solicitud ObtenerDatosReporteMolinos:", error);
                iziToast.error({
                    position: "topRight",
                    title: `NO SE ENCONTRARON DATOS`,
                    message: `<p>Motivo: ${error}</p>`,
                });
                loader.style.display = "none";
            });
    };

    function ActualizarRegistroHorasParo(FolioSend, HorasParo, comentariosMotivoEdicion, PesoSend, Desactivar) {
        loader.style.display = "flex";

        //si los comentarios lleban acento o caracter especial, los codificamos para que puedan viajar por http
        const comentariosMotivoEdicionCodificado = comentariosMotivoEdicion ? encodeURIComponent(comentariosMotivoEdicion.trim()) : "";
        //armamos los datos que enviaremos al controler
        let data = {
            "Folio": FolioSend,
            "HorasParo": HorasParo,
            "Comentarios": comentariosMotivoEdicionCodificado,
            "Planta": planta,
            "Peso": PesoSend,
            "Desactivar": Desactivar //nos indica si en el procedure desactivaremos el registro, 0 solo actualizamos, 1 desactivamos
        }
        fetch("/Molinos/ActualizaHorasParoRegistro", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify(data)
        }).then((response) => {
            //Verificamos si entro al catch del controler interno, de lo contrario devolvemos la respuesta del api
            return response.ok ? response.json() : Promise.reject(response)
        }).then((jsonData) => {
            loader.style.display = "none";
            //Si la respuesta desde el api es ok
            //console.log(jsonData.status)
            if (jsonData.status == 200) {
                iziToast.success({
                    position: "topRight",
                    title: `ACTUALIZADO CORRECTAMENTE`,
                    message: `<p>El registro fue actualizado</p>`,
                });

                //ocultamos el modal de update
                $("#ModalUpdateHorasParo").modal('hide'); //11mandar al proced

                recargarPagina();
                LimpiarForm();
            } else {
                console.log("Error desde el api, no se establecio la comunicacion o devolvio un error, FUNCION: ActualizarRegistroHorasParo, motivo: ", jsonData.data)
                iziToast.error({
                    position: "topRight",
                    title: `NO SE ACTUALIZO EL REGISTRO`,
                    message: `<p>Motivo: ${jsonData.data}</p>`,
                });
                loader.style.display = "none";
            }
        }).catch((error) => {//capturamos el error que retorno el controler
            console.error("Error en la funcion ActualizarRegistroHorasParo:", error);
            iziToast.error({
                position: "topRight",
                title: `NO SE ACTUALIZO EL registro`,
                message: `<p>Motivo: ${error}</p>`,
            });
            loader.style.display = "none";
        });
    };


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
        var inputValue = e.target.value;

        // Permitir números (0-9) y el punto (.), pero solo un punto
        if ((charCode < 48 || charCode > 57) && charCode !== 46) {
            e.preventDefault();
        } else if (charCode === 46 && inputValue.includes('.')) {
            e.preventDefault(); // Bloquear si ya existe un punto
        }
    }

    function LimpiarForm() {
        $("#InputHorasParoModalUpdateHorasParoHistori").val("");
        $("#InputComentarioBorrarRegistroHistori").val("");
    };
    function recargarPagina() {
        //Limpiamos las tablas para asegurarnos de que no tenga registros pasados
        tableReporteMolinoConcentrado.clear().draw
        tableReporteMolinoistori.clear().draw
        //limpiamos los rows para asegurar que no haya datos pasados

        $('.modal').modal('hide'); //cerramos cualquier modal abierto
        //recargamos la pagina de histori para traer los datos actualizados
        Histori = 1;
        ObtenerDatosReporteMolinos(planta, FechaInicioSearchHistori, FechaFinSearchHistori, turnSearchHistori, Histori);
        //recargamos la tabla de concentrados
        Histori = 0;
        ObtenerDatosReporteMolinos(planta, FechaInicioSearchConcentrado, FechaFinSearchConcentrado, turnoConcentrado, Histori)
    }
    function ConfigureTables() {
        //(Concentrado)
        tableReporteMolinoConcentrado = $("#TablaReportesMolinoConcentrado").DataTable({
            ordering: false,
            responsive: true,
            paging: true,
            searching: true,
            info: false,
            lengthChange: true,
        });
        //movemos el search de la tabla Concentrado a la posicion correcta
        const searchBoxConcentrado = $('#TablaReportesMolinoConcentrado_filter');
        $('#InputTurnoSearchMolinoConcentrado').append(searchBoxConcentrado);
        //Configuramos para que unicamente busque dentro de la primer columna (numero de molino)
        $('#TablaReportesMolinoConcentrado_filter input').on('keyup', function () {
            tableReporteMolinoConcentrado
                .column(0) // Aplica el filtro solo a la columna 0 (la primera columna)
                .search(this.value)
                .draw();
        });
        //accedemos al label del search de la tablapara cambiar su nombre
        $("#TablaReportesMolinoConcentrado_filter label").contents().filter(function () {
            return this.nodeType === 3; // Filtrar solo el texto dentro del label
        }).first().replaceWith("Número de molino:");

        //(Historial)
        tableReporteMolinoistori = $("#TablaReportesMolinoHisotri").DataTable({
            ordering: false,
            responsive: true,
            paging: true,
            searching: true,
            info: false,
            lengthChange: true, //permite seleccionar el numero de entradas
            //verifica el campo registroActivo para saber si la fila ha sido desactivada, de ser el caso, le agregamos la clase filaDesactivada (para modificar la fila en css y donde se requiera)
            createdRow: function (row, data, dataIndex) {
                // dataIndex es el índice en datosReporteMolinos
                if (datosReporteMolinos[dataIndex].registroActivo === 0) {
                    $(row).addClass("filaDesactivada");
                }
            },
        });
        //movemos el search de la tabla Historial a la posicion correcta
        const searchBoxHistori = $('#TablaReportesMolinoHisotri_filter');
        $('#InputTurnoSearchMolinoHistori').append(searchBoxHistori);
        //Configuramos para que unicamente busque dentro de la primer columna (numero de molino)
        $('#TablaReportesMolinoHisotri_filter input').on('keyup', function () {
            tableReporteMolinoistori
                .column(0) // Aplica el filtro solo a la columna 0 (la primera columna)
                .search(this.value)
                .draw();
        });
        //accedemos al label del search de la tablapara cambiar su nombre
        $("#TablaReportesMolinoHisotri_filter label").contents().filter(function () {
            return this.nodeType === 3; // Filtrar solo el texto dentro del label
        }).first().replaceWith("Número de molino:");
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
    //Btn Search (Concentrado)
    $(document).on("click", "#SearcReporteMolinosConcentrado", function () {
        //obtenemos los datos a enviar
        FechaInicioSearchConcentrado = $('#FechaInicioReprMolinoConcentrado').val()
        FechaFinSearchConcentrado = $('#FechafinReprMolinoConcentrado').val()
        turnoConcentrado = $('#InputturnoMolinosConcentrado').val();
        Histori = 0 //indicamos que buscamos el Concentrado de informacion en el procedure

        //validamos que los campos no esten vacios
        if (FechaFinFiltro == "") {
            iziToast.error({
                position: "topRight",
                title: `CAMPOS VACIOS`,
                message: `<p>Seleccione la fecha de inicio</p>`,
            });
        } else {
            //Limpiamos la tabla y los datos de las lineas
            tableReporteMolinoConcentrado.clear().draw()
            rowsTablaConcentrado = [];

            //si el turno es 1, 2 0 3, asignamos la fechafin correspondiente, si no hay turno, nos aseguramos de que se seleccionen ambas fechas
            if (turnoConcentrado == "1" || turnoConcentrado == "2" || turnoConcentrado == "3") {
                FechaFinSearchConcentrado = FechaInicioSearchConcentrado
            } else {
                if (FechaFinSearchConcentrado == "") {
                    iziToast.error({
                        position: "topRight",
                        title: `CAMPOS VACIOS`,
                        message: `<p>Seleccione la fecha de inicio y fecha fin</p>`,
                    });
                    return
                }
            }
            //Es la misma funcion para buscar y en default
            ObtenerDatosReporteMolinos(planta, FechaInicioSearchConcentrado, FechaFinSearchConcentrado, turnoConcentrado, Histori)
        }
    });
    //Btn Search (Historial)
    $(document).on("click", "#SearcReporteMolinosHistori", function () {
        //obtenemos los datos a enviar
        FechaInicioSearchHistori = $('#FechaInicioReprMolinoHistori').val()
        FechaFinSearchHistori = $('#FechafinReprMolinoHistori').val()
        turnSearchHistori = $('#InputturnoMolinosHistori').val();
        Histori = 1 //indicamos que buscamos el historial en el procedure

        //validamos que los campos no esten vacios
        if (FechaFinFiltro == "") {
            iziToast.error({
                position: "topRight",
                title: `CAMPOS VACIOS`,
                message: `<p>Seleccione la fecha de inicio</p>`,
            });
        } else {
            //Limpiamos la tabla y los datos de las lineas
            tableReporteMolinoistori.clear().draw()
            rowsTablaHistori = [];

            //si el turno es 1, 2 o 3, asignamos la fechafin correspondiente, si no hay turno, nos aseguramos de que se seleccionen ambas fechas
            if (turnSearchHistori == "1" || turnSearchHistori == "2" || turnSearchHistori == "3") {
                FechaFinSearchHistori = FechaInicioSearchHistori
            } else {
                if (FechaFinSearchHistori == "") {
                    iziToast.error({
                        position: "topRight",
                        title: `CAMPOS VACIOS`,
                        message: `<p>Seleccione la fecha de inicio y fecha fin</p>`,
                    });
                    return
                }
            }
            //Es la misma funcion para buscar y en default
            ObtenerDatosReporteMolinos(planta, FechaInicioSearchHistori, FechaFinSearchHistori, turnSearchHistori, Histori)
        }
    });

    //Btn Comentarios Histori (mostramos los comentarios y Edicion del registro seleccionado)
    $(document).on("click", ".IconComent", function () {
        // Obtener los valores del icono que fue clickeado
        let FolioRegistroModal = "\u00A0" + $(this).attr("folioValue"); //"\u00A0" representa un espacio o caracter de espacio
        let MotivosPAroProduccion = $(this).attr("motivosParoProduccion");
        let ComentarioEdicion = $(this).attr("comentarioEdicion");
        let HorasParo = $(this).attr("horasPAroRegistro");
        let ComentariosProduccion = $(this).attr("comentariosProduccion");
        let PesoProduccion = $(this).attr("PesoProduccion");

        //si el campo viene como null, lo ponemos como "" para fines visuales
        if (MotivosPAroProduccion == "null") {
            MotivosPAroProduccion = "";
        }
        if (ComentarioEdicion == "null") {
            ComentarioEdicion = "";
        }

        //Agregamos los comentarios al modal antes de mostrarlo
        $("#FolioEditModalComentsHistori").text(FolioRegistroModal);
        $("#InputComentregisterModalComentsHistori").val(MotivosPAroProduccion);
        $("#InputComentEditModalComentsHistori").val(ComentarioEdicion);
        $("#InputHorasParoModalComentsHistori").val(HorasParo);
        $("#InputComentProduccionEditModalComentsHistori").val(ComentariosProduccion);
        $("#InputPesoModalComentHistori").val(PesoProduccion);
        //pasamos los comentarios de edicion al modal motivo tambien
        $("#InputHorasParoModalUpdateHorasParoHistori").val(ComentarioEdicion);

        // Mostrar el modal
        $("#ModalComentarios").modal('show');
    });

    //Btn Actualizar (dentro del modal de comentarios, aqui capturamos el motivo de la edicion)
    $(document).on("click", "#ActualizarHorasParoModalComentHistori", function () {
        //nos aseguramos de que los campos no esten vacios
        let PesoSend = $("#InputPesoModalComentHistori").val();
        let HorasParo = $("#InputHorasParoModalComentsHistori").val();
        if (PesoSend.trim() == "" || HorasParo.trim() == "") {
            iziToast.error({
                position: "topRight",
                title: `Campos Vacios`,
                message: `<p>Llene los campos de Peso y Horas paro</p>`,
            });
            return
        }

        //ocultamos el modal de comentarios
        $("#ModalComentarios").modal('hide');
        // Mostramos el modal de actualizacion
        $("#ModalUpdateHorasParo").modal('show');
    });

    //Btn Actualizar (dentro del modal de actualizacion, aqui mandamos los datos para actualoizar el registro)
    $(document).on("click", "#ActualizarHorasParoModalUpdateHorasParoHistori", function () {
        // Obtenemos los valores que se enviaran al procedure para actualizar el registro
        let FolioSendUpdate = $("#FolioEditModalComentsHistori").text().trim(); //(usamos trim para asegurarnos de que solo estamos obteniendo el folio)
        let HorasParoUpdate = $("#InputHorasParoModalComentsHistori").val();
        let comentariosMotivoEdicionUpdate = $("#InputHorasParoModalUpdateHorasParoHistori").val();
        let PesoSendUpdate = $("#InputPesoModalComentHistori").val();
        let DesactivarUpdate = 0;

        //nos aseguramos de que el comentario no este vacio
        if (comentariosMotivoEdicionUpdate.trim() == "") {
            iziToast.error({
                position: "topRight",
                title: `MOTIVO VACÍO`,
                message: `<p>Ingrese el motivo de paro</p>`,
            });
            return
        } else {
            //Mandamos los datos al procedure
            ActualizarRegistroHorasParo(FolioSendUpdate, HorasParoUpdate, comentariosMotivoEdicionUpdate, PesoSendUpdate, DesactivarUpdate);
        }
    });

    //Btn Descargar excel (Tabla concentrado)
    $(document).on("click", "#DescargarExcelConcentrado", function () {
        // Definimos los encabezados
        const headers = [];
        $("#TablaReportesMolinoConcentrado thead th").each(function () {
            headers.push($(this).text().trim());
        });

        // Obtén los datos de la tabla
        const tableData = tableReporteMolinoConcentrado.rows().data().toArray();

        fetch('/Molinos/GenerarExcel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                headers: headers, // Enviar encabezados
                data: tableData   // Enviar datos de la tabla
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
                a.download = 'Reporte Molinos Resumen.xlsx';
                document.body.appendChild(a);
                a.click();
                a.remove();
            })
            .catch(error => console.error('Error:', error));
    });

    //Btn Descargar excel (Tabla Historial)
    $(document).on("click", "#DescargarExcelHistorial", function () {
        // Obtener los encabezados y determinar las columnas a omitir
        const headers = [];
        let omitIndexes = [];
        $("#TablaReportesMolinoHisotri thead th").each(function (i) {
            const text = $(this).text().trim();
            if (text === "Coment. y Edit." || text === "Borrar") {
                omitIndexes.push(i); // Guardar los índices de las columnas que omitiremos
            } else {
                headers.push(text);
            }
        });

        // Obtener los datos de la tabla excluyendo filas desactivadas
        const originalData = [];
        tableReporteMolinoistori.rows().every(function () {
            const rowNode = this.node(); // Obtener el nodo de la fila
            if (!rowNode.classList.contains("filaDesactivada")) {
                originalData.push(this.data()); // Agregar datos de filas activas
            }
        });

        // Filtrar las columnas omitidas en los datos
        const filteredData = originalData.map(row => {
            return row.filter((_, idx) => !omitIndexes.includes(idx));
        });

        // Enviar datos al backend
        fetch('/Molinos/GenerarExcel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                headers: headers,    // Encabezados filtrados
                data: filteredData   // Datos filtrados sin las columnas omitidas
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
                a.download = 'Reporte Molinos Historial.xlsx';
                document.body.appendChild(a);
                a.click();
                a.remove();
            })
            .catch(error => console.error('Error:', error));
    });

    //Btn Descargar pdf (Tabla concentrado)
    $(document).on("click", "#DescargarPDFConcentrado", function () {
        //Datos a enviar
        let TituloDocumentPrincipal = "REPORTE DE MOLINOS RESUMEN"
        let TituloDocument = 'REPORTE DE MOLINOS'
        let rowsPDF = tableReporteMolinoConcentrado.rows().data().toArray();
        const headers = []; //los obtenemos desde la tabla del html
        let NombreDescarga = "Reporte Molino Resumen.pdf"
        //obtenemos los headers
        $("#TablaReportesMolinoConcentrado thead th").each(function () {
            headers.push($(this).text().trim());
        });

        generarpdf(TituloDocumentPrincipal, TituloDocument, rowsPDF, headers, NombreDescarga)

    });

    //Btn Descargar pdf (Tabla Historial)
    $(document).on("click", "#DescargarPDFHistorial", function () {
        // Datos a enviar
        let TituloDocumentPrincipal = "REPORTE DE MOLINOS HISTORIAL";
        let TituloDocument = "REPORTE DE MOLINOS";
        let NombreDescarga = "Reporte Molino Historial.pdf";

        const headers = []; // Los obtenemos desde la tabla del HTML (filtrando borrar y Coment. y edit.)
        let omitIndexes = [];

        // Obtenemos los índices de las columnas "Coment. y Edit." y "Borrar"
        $("#TablaReportesMolinoHisotri thead th").each(function (i) {
            const text = $(this).text().trim();
            if (text === "Coment. y Edit." || text === "Borrar") {
                omitIndexes.push(i); // Guardamos los índices de las columnas que omitiremos
            } else {
                headers.push(text);
            }
        });

        // Filtrar las filas activas y omitir las columnas correspondientes
        const filteredData = [];
        tableReporteMolinoistori.rows().every(function () {
            const rowNode = this.node(); // Obtener el nodo de la fila
            if (!rowNode.classList.contains("filaDesactivada")) {
                // Si la fila no está desactivada, procesar los datos
                const rowData = this.data(); // Obtener los datos de la fila
                const filteredRow = rowData.filter((_, idx) => !omitIndexes.includes(idx));
                filteredData.push(filteredRow);
            }
        });

        // Generar el PDF
        generarpdf(TituloDocumentPrincipal, TituloDocument, filteredData, headers, NombreDescarga);


    });

    //Btn Comentarios en fila desactivada
    $(document).on("click", ".IconComentDesactivado", function () {
        // Obtener los valores del icono que fue clickeado
        let FolioRegistroDeleteModal = "\u00A0" + $(this).attr("folioValueDelete"); //"\u00A0" representa un espacio o caracter de espacio
        let ComentariosProduccion = $(this).attr("comentarioEdicionFilaDesactivada");

        //añanimos los datos al modal
        $("#FolioEditModalComentsDesactivado").text(FolioRegistroDeleteModal);
        $("#InputComentRegistroDesactivado").text(ComentariosProduccion);

        // Mostrar el modal
        $("#ModalComentsRegistroDesactivado").modal('show');
    });

    //Btn "trash", borrar registro (abrir modal)
    $(document).on("click", ".Icontrash", function () {
        // Obtener los valores del icono que fue clickeado
        let FolioRegistroDeleteModal = "\u00A0" + $(this).attr("folioTrash"); //"\u00A0" representa un espacio o caracter de espacio

        //añanimos los datos al modal
        $("#FolioModalComentsHistoriBorrar").text(FolioRegistroDeleteModal);

        // Mostrar el modal
        $("#ModalDesactivarRegistro").modal('show');
    });

    //Btn "trash", borrar registro (dentro modal) (desactiva el registro en BD)
    $(document).on("click", "#DesactivarRegistroHistori", function () {
        // Obtener los datos a enviar
        let FolioRegistroDeleteModalSend = $("#FolioModalComentsHistoriBorrar").text().trim(); //"\u00A0" representa un espacio o caracter de espacio
        let ComentariosBorrarSend = $("#InputComentarioBorrarRegistroHistori").val();
        let DesactivarSend = 1; //indicamos que el regisgtro se va a desactivar

        let HorasParo = 0; //lo rellenamos con datos aleatorios, el procedure no lo usa cuando se desactiva un registro, pero ocupa recibir el dato
        let PesoSend = 0; //lo rellenamos con datos aleatorios, el procedure no lo usa cuando se desactiva un registro, pero ocupa recibir el dato

        //verificamos que haya algun comentario para poder desactivar el registro
        if (ComentariosBorrarSend == "") {
            iziToast.error({
                position: "topRight",
                title: `MOTIVO VACÍO`,
                message: `<p>Ingrese un motivo</p>`,
            });
        } else {
            // Enviamos los datos para desactivar el registro
            ActualizarRegistroHorasParo(FolioRegistroDeleteModalSend, HorasParo, ComentariosBorrarSend, PesoSend, DesactivarSend)
        }
    });



    //RESTRICIONES
    // Asignamos el valor de la fecha actual a los input de fecha para que se inicialice con este valor
    var today = new Date();
    //Configuramos la fecha de acuerdo a nuestra zona horaria ya que toISOString() convierte la fecha a la hora UTC y no a la hora local
    var fechaISO = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0];
    $('#FechaInicioReprMolinoHistori').val(fechaISO);
    $('#FechafinReprMolinoHistori').val(fechaISO);
    $('#FechaInicioReprMolinoConcentrado').val(fechaISO);
    $('#FechafinReprMolinoConcentrado').val(fechaISO);

    //revisamos si el turno es 1, 2 o 3 para desactivar "FechaFin" y asignarle el valor default (el dia de hoy)
    function handleTurnoChange(inputSelector, fechaFinSelector) {
        const value = $(inputSelector).val();
        const isTurnoValido = ['1', '2', '3'].includes(value);
        $(fechaFinSelector).prop("disabled", isTurnoValido).val(FechaFinFiltro);
    }

    $("#InputturnoMolinosHistori").change(() =>
        handleTurnoChange("#InputturnoMolinosHistori", "#FechafinReprMolinoHistori"));

    $("#InputturnoMolinosConcentrado").change(() =>
        handleTurnoChange("#InputturnoMolinosConcentrado", "#FechafinReprMolinoConcentrado"));

    //restringimos los input que solo llevan numero
    $('#InputHorasParoModalComentsHistori, #InputPesoModalComentHistori').on('keypress', function (e) {
            // Permitir solo números
            EvitarLetras(e)
    });

    //si hacemos click fuera de los modals, nos aseguramos de cerrarlos y limpiarlos
    $(document).on("click", function (event) {
        // Buscamos cualquier modal que esté visible
        $(".modal:visible").each(function () {
            if (!$(event.target).closest(".modal-content").length) {
                $(this).modal("hide"); // Cierramos el modal visible
                LimpiarForm();
            }
        });
    });
});